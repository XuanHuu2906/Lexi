package com.lexi;

import com.lexi.config.PostgresTestConfig;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
@Import(PostgresTestConfig.class)
class LexiBackendApplicationTests {

    @Test
    void contextLoads() {
    }
}