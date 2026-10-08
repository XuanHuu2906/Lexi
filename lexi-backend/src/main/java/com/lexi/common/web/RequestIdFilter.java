package com.lexi.common.web;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;
import java.util.regex.Pattern;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestIdFilter extends OncePerRequestFilter {

  public static final String REQUEST_ID_HEADER = "X-Request-ID";
  public static final String REQUEST_ID_MDC_KEY = "requestId";

  private static final Pattern SAFE_REQUEST_ID = Pattern.compile("[A-Za-z0-9._-]{1,100}");

  private static final Logger log = LoggerFactory.getLogger(RequestIdFilter.class);

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain) throws ServletException, IOException {

    String requestId = resolveRequestId(
        request.getHeader(REQUEST_ID_HEADER));

    response.setHeader(
        REQUEST_ID_HEADER,
        requestId);

    MDC.put(
        REQUEST_ID_MDC_KEY,
        requestId);

    long start = System.nanoTime();

    try {
      filterChain.doFilter(request, response);
    } finally {

      long durationMs = (System.nanoTime() - start) / 1_000_000;

      log.info(
          "HTTP {} {} -> {} ({} ms)",
          request.getMethod(),
          request.getRequestURI(),
          response.getStatus(),
          durationMs);

      MDC.remove(REQUEST_ID_MDC_KEY);
    }
  }

  private String resolveRequestId(String incomingRequestId) {

    if (incomingRequestId != null
        && SAFE_REQUEST_ID
            .matcher(incomingRequestId)
            .matches()) {

      return incomingRequestId;
    }

    return UUID.randomUUID().toString();
  }
}