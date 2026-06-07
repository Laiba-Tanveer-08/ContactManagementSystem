package com.laiba.backend.config;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SecurityConfigTest {

    @Mock
    private JWTAuthFilter jwtAuthFilter;

    @InjectMocks
    private SecurityConfig securityConfig;

    // Verifies the passwordEncoder bean is a BCryptPasswordEncoder instance
    @Test
    void passwordEncoder_returnsBCryptPasswordEncoder() {
        PasswordEncoder encoder = securityConfig.passwordEncoder();

        assertNotNull(encoder);
        assertInstanceOf(BCryptPasswordEncoder.class, encoder);
    }

    // Verifies BCryptPasswordEncoder correctly encodes and matches passwords
    @Test
    void passwordEncoder_encodesAndMatchesPassword() {
        PasswordEncoder encoder = securityConfig.passwordEncoder();
        String raw = "testPassword";
        String encoded = encoder.encode(raw);

        assertNotNull(encoded);
        org.junit.jupiter.api.Assertions.assertTrue(encoder.matches(raw, encoded));
    }

    // Exercises the catch branch in filterChain by passing a broken HttpSecurity mock
    @Test
    void filterChain_configurationFailure_throwsIllegalStateException() {
        HttpSecurity brokenHttp = mock(HttpSecurity.class);
        when(brokenHttp.csrf(any())).thenThrow(new RuntimeException("Simulated config failure"));

        assertThatThrownBy(() -> securityConfig.filterChain(brokenHttp))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Security filter chain configuration failed");
    }
}