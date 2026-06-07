package com.laiba.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JWTServiceTest {

    private JWTService jwtService;

    private static final String SECRET =
            "dGVzdHNlY3JldGtleXRlc3RzZWNyZXRrZXl0ZXN0c2VjcmV0a2V5dGVzdA==";
    private static final long EXPIRATION = 3600000L;

    @BeforeEach
    void setUp() {
        jwtService = new JWTService();
        ReflectionTestUtils.setField(jwtService, "secretKey", SECRET);
        ReflectionTestUtils.setField(jwtService, "expiration", EXPIRATION);
    }

    @Test
    void generateToken_returnsNonNullToken() {
        String token = jwtService.generateToken("test@example.com");

        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    void generateToken_tokenHasThreeParts() {
        String token = jwtService.generateToken("test@example.com");

        assertEquals(3, token.split("\\.").length);
    }

    @Test
    void extractUsername_returnsCorrectUsername() {
        String token = jwtService.generateToken("test@example.com");

        assertEquals("test@example.com", jwtService.extractUsername(token));
    }

    @Test
    void extractUsername_phoneNumber_returnsCorrectUsername() {
        String token = jwtService.generateToken("03001234567");

        assertEquals("03001234567", jwtService.extractUsername(token));
    }

    @Test
    void isTokenValid_validTokenAndMatchingUsername_returnsTrue() {
        String token = jwtService.generateToken("test@example.com");

        assertTrue(jwtService.isTokenValid(token, "test@example.com"));
    }

    @Test
    void isTokenValid_wrongUsername_returnsFalse() {
        String token = jwtService.generateToken("test@example.com");

        assertFalse(jwtService.isTokenValid(token, "other@example.com"));
    }

    @Test
    void isTokenValid_expiredToken_returnsFalse() {
        // Negative expiration means the token is already expired at generation time
        ReflectionTestUtils.setField(jwtService, "expiration", -1000L);
        String token = jwtService.generateToken("test@example.com");

        assertFalse(jwtService.isTokenValid(token, "test@example.com"));
    }

    @Test
    void extractUsername_expiredToken_stillReturnsUsername() {
        ReflectionTestUtils.setField(jwtService, "expiration", -1000L);
        String token = jwtService.generateToken("test@example.com");

        assertEquals("test@example.com", jwtService.extractUsername(token));
    }

    @Test
    void generateToken_differentUsersProduceDifferentTokens() {
        String token1 = jwtService.generateToken("user1@example.com");
        String token2 = jwtService.generateToken("user2@example.com");

        assertNotEquals(token1, token2);
    }

    @Test
    void isTokenValid_malformedToken_returnsFalse() {
        assertFalse(jwtService.isTokenValid("this.is.not.a.valid.jwt", "test@example.com"));
    }

    @Test
    void isTokenValid_emptyToken_returnsFalse() {
        assertFalse(jwtService.isTokenValid("", "test@example.com"));
    }
}