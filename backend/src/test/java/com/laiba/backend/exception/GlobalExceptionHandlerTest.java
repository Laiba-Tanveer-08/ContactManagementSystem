package com.laiba.backend.exception;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
    }

    @Test
    void handleUserNotFound_returns404WithMessage() {
        UserNotFoundException ex = new UserNotFoundException("User not found");

        ResponseEntity<String> response = handler.handleUserNotFound(ex);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("User not found", response.getBody());
    }

    @Test
    void handleContactNotFound_returns404WithMessage() {
        ContactNotFoundException ex = new ContactNotFoundException("Contact not found");

        ResponseEntity<String> response = handler.handleContactNotFound(ex);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Contact not found", response.getBody());
    }

    @Test
    void handleAuthenticationException_returns401WithMessage() {
        AuthenticationException ex = new AuthenticationException("User not authenticated");

        ResponseEntity<String> response = handler.handleAuthenticationException(ex);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("User not authenticated", response.getBody());
    }

    @Test
    void handleUnauthorizedException_returns403WithMessage() {
        UnauthorizedException ex = new UnauthorizedException("Unauthorized access");

        ResponseEntity<String> response = handler.handleUnauthorizedException(ex);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertEquals("Unauthorized access", response.getBody());
    }

    @Test
    void handleGeneralException_returns500WithGenericMessage() {
        Exception ex = new Exception("Something unexpected");

        ResponseEntity<String> response = handler.handleGeneralException(ex);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("Something went wrong", response.getBody());
    }

    @Test
    void handleUserNotFound_customMessage_returnsCorrectBody() {
        UserNotFoundException ex = new UserNotFoundException("Custom user message");

        ResponseEntity<String> response = handler.handleUserNotFound(ex);

        assertEquals("Custom user message", response.getBody());
    }

    @Test
    void handleContactNotFound_customMessage_returnsCorrectBody() {
        ContactNotFoundException ex = new ContactNotFoundException("Custom contact message");

        ResponseEntity<String> response = handler.handleContactNotFound(ex);

        assertEquals("Custom contact message", response.getBody());
    }

    @Test
    void handleGeneralException_nullMessage_stillReturns500() {
        Exception ex = new RuntimeException((String) null);

        ResponseEntity<String> response = handler.handleGeneralException(ex);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("Something went wrong", response.getBody());
    }
}