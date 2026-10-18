package com.lexi.security.auth;

public class EmailAlreadyRegisteredException
        extends RuntimeException {

    public EmailAlreadyRegisteredException() {
        super("Email already registered");
    }
}