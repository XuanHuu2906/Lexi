
package com.lexi.security.auth;

public class ConcurrentRefreshException
        extends RuntimeException {

    public ConcurrentRefreshException() {
        super(
            "Refresh credential already consumed; " +
            "sign in again if the new credential is unavailable"
        );
    }
}
