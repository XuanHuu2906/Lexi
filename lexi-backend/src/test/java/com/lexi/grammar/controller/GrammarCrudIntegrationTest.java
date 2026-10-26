
package com.lexi.grammar.controller;

import com.lexi.config.PostgresTestConfig;
import jakarta.servlet.http.Cookie;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.jdbc.SqlConfig;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(PostgresTestConfig.class)
@Sql(
    scripts = {
        "/sql/user-repository-schema.sql",
        "/sql/auth-refresh-tokens.sql",
        "/sql/grammar-rule-schema.sql"
    },
    executionPhase = Sql.ExecutionPhase.BEFORE_TEST_CLASS,
    config = @SqlConfig(
        transactionMode = SqlConfig.TransactionMode.ISOLATED
    )
)
class GrammarCrudIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void cleanUp() {
        jdbcTemplate.update(
            "DELETE FROM users WHERE email LIKE 'grammar-%@lexi.test'"
        );
    }

    @Test
    void shouldCreateSearchPaginateAndPatchGrammar()
        throws Exception {

        Session a = register("grammar-a@lexi.test");
        Session b = register("grammar-b@lexi.test");

        createGrammar(a, """
            {
              "title": "Present Perfect",
              "formula": "S + have/has + V3",
              "explanation": "Old explanation",
              "examples": ["I have finished."]
            }
            """).andExpect(status().isCreated());

        createGrammar(a, """
            {
              "title": "Future Simple",
              "formula": "S + will + V",
              "explanation": "Future actions"
            }
            """).andExpect(status().isCreated());

        createGrammar(b, """
            {
              "title": "Present Perfect",
              "formula": "B's private rule",
              "explanation": "Other user"
            }
            """).andExpect(status().isCreated());

        // Search trên title, không phân biệt hoa/thường.
        // Không trả Grammar của User B.
        mockMvc.perform(
            get("/grammar")
                .cookie(authCookies(a))
                .param("search", "PERFECT")
                .param("page", "1")
                .param("limit", "1")
        )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.total").value(1))
            .andExpect(jsonPath("$.data.page").value(1))
            .andExpect(jsonPath("$.data.limit").value(1))
            .andExpect(jsonPath("$.data.items.length()").value(1))
            .andExpect(
                jsonPath("$.data.items[0].title")
                    .value("Present Perfect")
            );

        // Search phải tìm được trong formula nữa.
        mockMvc.perform(
            get("/grammar")
                .cookie(authCookies(a))
                .param("search", "WILL")
        )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.total").value(1));

        String id = findRuleId(
            "grammar-a@lexi.test",
            "S + have/has + V3"
        );

        // Xóa title bằng null và cập nhật một phần.
        mockMvc.perform(
            patch("/grammar/{id}", id)
                .cookie(authCookies(a))
                .header("X-CSRF-Token", a.csrfToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "title": null,
                      "explanation": "Updated explanation",
                      "examples": []
                    }
                    """)
        )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.title")
                .value(org.hamcrest.Matchers.nullValue()))
            .andExpect(
                jsonPath("$.data.formula")
                    .value("S + have/has + V3")
            )
            .andExpect(
                jsonPath("$.data.explanation")
                    .value("Updated explanation")
            )
            .andExpect(
                jsonPath("$.data.examples.length()")
                    .value(0)
            );

        // Không thay đổi formula; kiểm tra lại DB.
        String savedFormula = jdbcTemplate.queryForObject(
            "SELECT formula FROM grammar_rules WHERE id = ?",
            String.class,
            id
        );

        assertThat(savedFormula)
            .isEqualTo("S + have/has + V3");
    }

    @Test
    void shouldEnforceOwnershipForGetPatchDelete()
        throws Exception {

        Session owner = register("grammar-owner@lexi.test");
        Session other = register("grammar-other@lexi.test");

        createGrammar(owner, """
            {
              "title": "Private",
              "formula": "S + V",
              "explanation": "Private rule"
            }
            """).andExpect(status().isCreated());

        String id = findRuleId(
            "grammar-owner@lexi.test",
            "S + V"
        );

        mockMvc.perform(
            get("/grammar/{id}", id)
                .cookie(authCookies(other))
        )
            .andExpect(status().isNotFound());

        // Có CSRF hợp lệ, nhưng vẫn không có ownership.
        mockMvc.perform(
            patch("/grammar/{id}", id)
                .cookie(authCookies(other))
                .header("X-CSRF-Token", other.csrfToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"explanation":"Unauthorized edit"}
                    """)
        )
            .andExpect(status().isNotFound());

        mockMvc.perform(
            delete("/grammar/{id}", id)
                .cookie(authCookies(other))
                .header("X-CSRF-Token", other.csrfToken())
        )
            .andExpect(status().isNotFound());

        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM grammar_rules WHERE id = ?",
            Integer.class, id
        );
        assertThat(count).isEqualTo(1);

        // Chủ sở hữu thật có quyền xóa.
        mockMvc.perform(
            delete("/grammar/{id}", id)
                .cookie(authCookies(owner))
                .header("X-CSRF-Token", owner.csrfToken())
        )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.deleted").value(true));

        Integer afterDelete = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM grammar_rules WHERE id = ?",
            Integer.class, id
        );
        assertThat(afterDelete).isZero();
    }

    @Test
    void shouldRejectInvalidGrammarInput()
        throws Exception {

        Session session = register(
            "grammar-validation@lexi.test"
        );

        createGrammar(session, """
            {
              "formula": "",
              "explanation": "Meaning"
            }
            """)
            .andExpect(status().isBadRequest());

        mockMvc.perform(
            get("/grammar")
                .cookie(authCookies(session))
                .param("page", "0")
        )
            .andExpect(status().isBadRequest());

        mockMvc.perform(
            get("/grammar")
                .cookie(authCookies(session))
                .param("limit", "101")
        )
            .andExpect(status().isBadRequest());
    }

    private String findRuleId(
        String email,
        String formula
    ) {
        return jdbcTemplate.queryForObject(
            """
            SELECT g.id
            FROM grammar_rules g
            JOIN users u ON u.id = g."userId"
            WHERE u.email = ? AND g.formula = ?
            """,
            String.class,
            email, formula
        );
    }

    private ResultActions createGrammar(
        Session session, String json
    ) throws Exception {
        return mockMvc.perform(
            post("/grammar")
                .cookie(authCookies(session))
                .header(
                    "X-CSRF-Token", session.csrfToken()
                )
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
        );
    }

    private Cookie[] authCookies(Session session) {
        return new Cookie[] {
            new Cookie(
                "access_token", session.accessToken()
            ),
            new Cookie(
                "csrf_token", session.csrfToken()
            )
        };
    }

    private Session register(String email) throws Exception {
        var result = mockMvc.perform(
            post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "email":"%s",
                      "password":"password123"
                    }
                    """.formatted(email))
        )
            .andExpect(status().isCreated())
            .andReturn();

        List<String> headers = result.getResponse()
            .getHeaders(HttpHeaders.SET_COOKIE);

        return new Session(
            cookieValue(headers, "access_token"),
            cookieValue(headers, "csrf_token")
        );
    }

    private String cookieValue(
        List<String> headers, String name
    ) {
        String prefix = name + "=";

        return headers.stream()
            .filter(h -> h.startsWith(prefix))
            .findFirst()
            .map(h ->
                h.substring(prefix.length())
                    .split(";", 2)[0]
            )
            .orElseThrow(() ->
                new AssertionError(
                    "Missing cookie: " + name
                )
            );
    }

    private record Session(
        String accessToken,
        String csrfToken
    ) {}
}
