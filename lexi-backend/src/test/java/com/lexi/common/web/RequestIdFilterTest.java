package com.lexi.common.web;

import org.junit.jupiter.api.Test;
import org.slf4j.MDC;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RequestIdFilterTest {

  @Autowired
  private MockMvc mockMvc;

  @Test
  void shouldGenerateRequestIdWhenHeaderIsMissing()
      throws Exception {

    MvcResult result = mockMvc.perform(
        get("/health"))
        .andExpect(status().isOk())
        .andExpect(
            header().exists(
                RequestIdFilter.REQUEST_ID_HEADER))
        .andReturn();

    String requestId = result
        .getResponse()
        .getHeader(
            RequestIdFilter.REQUEST_ID_HEADER);

    assertThat(requestId).isNotBlank();

    assertThatCode(
        () -> UUID.fromString(requestId)).doesNotThrowAnyException();
  }

  @Test
  void shouldReuseValidIncomingRequestId()
      throws Exception {

    String requestId = "lexi-test-123";

    mockMvc.perform(
        get("/health")
            .header(
                RequestIdFilter.REQUEST_ID_HEADER,
                requestId))
        .andExpect(status().isOk())
        .andExpect(
            header().string(
                RequestIdFilter.REQUEST_ID_HEADER,
                requestId));
  }

  @Test
  void shouldGenerateNewRequestIdWhenIncomingIdIsInvalid()
      throws Exception {

    String invalidRequestId = "this request id contains spaces";

    MvcResult result = mockMvc.perform(
        get("/health")
            .header(
                RequestIdFilter.REQUEST_ID_HEADER,
                invalidRequestId))
        .andExpect(status().isOk())
        .andReturn();

    String responseRequestId = result
        .getResponse()
        .getHeader(
            RequestIdFilter.REQUEST_ID_HEADER);

    assertThat(responseRequestId)
        .isNotEqualTo(invalidRequestId);

    assertThatCode(
        () -> UUID.fromString(responseRequestId)).doesNotThrowAnyException();
  }

  @Test
  void shouldClearMdcAfterRequest()
      throws Exception {

    mockMvc.perform(
        get("/health")
            .header(
                RequestIdFilter.REQUEST_ID_HEADER,
                "lexi-mdc-test"))
        .andExpect(status().isOk());

    assertThat(
        MDC.get(
            RequestIdFilter.REQUEST_ID_MDC_KEY))
        .isNull();
  }
}