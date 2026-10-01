package com.lexi.common.validation;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lexi.common.error.ResourceNotFoundException;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(RequestValidationTest.ValidationProbeController.class)
class RequestValidationTest {

  @Autowired
  private MockMvc mockMvc;

  record ValidationProbeRequest(

      @NotBlank @Size(max = 20) String name,

      @NotNull @Min(1) @Max(5) Integer count

  ) {
  }

  @RequestMapping("/__test")
  @RestController
  static class ValidationProbeController {

    @PostMapping("/validation")
    ResponseEntity<Map<String, Object>> validate(
        @Valid @RequestBody ValidationProbeRequest request) {

      return ResponseEntity.ok(
          Map.of(
              "name", request.name(),
              "count", request.count()));
    }

    @GetMapping("/not-found")
    void notFound() {

      throw new ResourceNotFoundException(
          "Test resource not found");
    }

    @GetMapping("/error")
    void error() {

      throw new RuntimeException(
          "SECRET DATABASE INFORMATION");
    }
  }

  @Test
  void shouldAcceptValidRequest() throws Exception {

    mockMvc.perform(
        post("/__test/validation")
            .contentType("application/json")
            .content("""
                {
                  "name": "Lexi",
                  "count": 3
                }
                """))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("Lexi"))
        .andExpect(jsonPath("$.count").value(3));
  }

  @Test
  void shouldRejectBlankName() throws Exception {

    mockMvc.perform(
        post("/__test/validation")
            .contentType("application/json")
            .content("""
                {
                  "name": "   ",
                  "count": 3
                }
                """))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.success").value(false))
        .andExpect(jsonPath("$.statusCode").value(400))
        .andExpect(jsonPath("$.message").isArray())
        .andExpect(jsonPath("$.error").value("Bad Request"))
        .andExpect(jsonPath("$.path")
            .value("/__test/validation"))
        .andExpect(jsonPath("$.timestamp").exists());
  }

  @Test
  void shouldRejectMissingCount() throws Exception {

    mockMvc.perform(
        post("/__test/validation")
            .contentType("application/json")
            .content("""
                {
                  "name": "Lexi"
                }
                """))
        .andExpect(status().isBadRequest());
  }

  @Test
  void shouldRejectCountBelowMinimum() throws Exception {

    mockMvc.perform(
        post("/__test/validation")
            .contentType("application/json")
            .content("""
                {
                  "name": "Lexi",
                  "count": 0
                }
                """))
        .andExpect(status().isBadRequest());
  }

  @Test
  void shouldRejectCountAboveMaximum() throws Exception {

    mockMvc.perform(
        post("/__test/validation")
            .contentType("application/json")
            .content("""
                {
                  "name": "Lexi",
                  "count": 6
                }
                """))
        .andExpect(status().isBadRequest());
  }

  @Test
  void shouldRejectInvalidFieldType() throws Exception {

    mockMvc.perform(
        post("/__test/validation")
            .contentType("application/json")
            .content("""
                {
                  "name": "Lexi",
                  "count": "abc"
                }
                """))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.success").value(false))
        .andExpect(jsonPath("$.statusCode").value(400))
        .andExpect(jsonPath("$.message")
            .value("Malformed JSON request"))
        .andExpect(jsonPath("$.error")
            .value("Bad Request"));
  }

  @Test
  void shouldRejectUnknownField() throws Exception {

    mockMvc.perform(
        post("/__test/validation")
            .contentType("application/json")
            .content("""
                {
                  "name": "Lexi",
                  "count": 3,
                  "admin": true
                }
                """))
        .andExpect(status().isBadRequest());
  }

  @Test
  void shouldReturnNotFoundEnvelope() throws Exception {

    mockMvc.perform(
        get("/__test/not-found"))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.success").value(false))
        .andExpect(jsonPath("$.statusCode").value(404))
        .andExpect(jsonPath("$.message")
            .value("Test resource not found"))
        .andExpect(jsonPath("$.error")
            .value("Not Found"))
        .andExpect(jsonPath("$.path")
            .value("/__test/not-found"));
  }

  @Test
  void shouldNotLeakInternalErrorMessage() throws Exception {

    mockMvc.perform(
        get("/__test/error"))
        .andExpect(status().isInternalServerError())
        .andExpect(jsonPath("$.success").value(false))
        .andExpect(jsonPath("$.statusCode").value(500))
        .andExpect(jsonPath("$.message")
            .value("Internal server error"))
        .andExpect(jsonPath("$.message")
            .value(
                org.hamcrest.Matchers.not(
                    "SECRET DATABASE INFORMATION")));
  }
}