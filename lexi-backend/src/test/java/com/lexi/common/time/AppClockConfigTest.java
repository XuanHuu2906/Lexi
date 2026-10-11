package com.lexi.common.time;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.Clock;

import static org.assertj.core.api.Assertions.assertThat;
import com.lexi.config.PostgresTestConfig;
import org.springframework.context.annotation.Import;

@SpringBootTest
@Import(PostgresTestConfig.class)
class AppClockConfigTest {

    @Autowired
    private Clock clock;

    @Test
    void shouldProvideClockBean() {
        assertThat(clock).isNotNull();
    }
}