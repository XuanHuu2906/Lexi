package com.lexi.security.auth;

public class LoginForbiddenException
        extends RuntimeException {

    public LoginForbiddenException(String message) {
        super(message);
    }
}