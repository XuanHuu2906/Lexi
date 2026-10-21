
package com.lexi.security.auth;

public class InvalidRefreshTokenException
        extends RuntimeException {

    public InvalidRefreshTokenException() {
        super("Session expired");
    }
}
