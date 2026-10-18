package com.lexi.security.csrf;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

public class HeaderOnlyCsrfTokenRequestHandler
        extends CsrfTokenRequestAttributeHandler {

    @Override
    public String resolveCsrfTokenValue(
            HttpServletRequest request,
            CsrfToken csrfToken) {

        // Lexi chỉ chấp nhận CSRF từ HTTP header.
        // Không fallback sang request parameter.
        return request.getHeader(csrfToken.getHeaderName());
    }
}