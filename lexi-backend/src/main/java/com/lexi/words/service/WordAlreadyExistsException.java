
package com.lexi.words.service;

public class WordAlreadyExistsException
        extends RuntimeException {

    public WordAlreadyExistsException() {
        super("This word is already in your notebook");
    }
}
