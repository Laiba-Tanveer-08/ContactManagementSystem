package com.laiba.backend.config;

import com.laiba.backend.service.JWTService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JWTAuthFilterTest {

    @Mock private JWTService jwtService;
    @Mock private UserDetailsService userDetailsService;
    @Mock private HttpServletRequest request;
    @Mock private HttpServletResponse response;
    @Mock private FilterChain filterChain;

    @InjectMocks
    private JWTAuthFilter jwtAuthFilter;

    private UserDetails mockUserDetails;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        mockUserDetails = new User("test@example.com", "encodedPassword", Collections.emptyList());
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // No Authorization header or non-Bearer header should pass through without setting auth
    @ParameterizedTest
    @ValueSource(strings = {"Basic dXNlcjpwYXNz", ""})
    void doFilterInternal_missingOrNonBearerHeader_passesThrough(String headerValue) throws Exception {
        String header = headerValue.isEmpty() ? null : headerValue;
        when(request.getHeader("Authorization")).thenReturn(header);

        jwtAuthFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void doFilterInternal_noAuthHeader_passesThrough() throws Exception {
        when(request.getHeader("Authorization")).thenReturn(null);

        jwtAuthFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    // Malformed Bearer tokens should not set authentication
    @ParameterizedTest
    @ValueSource(strings = {
            "Bearer ",
            "Bearer bad token",
            "Bearer header.payload",
            "Bearer a.b.c.d.e"
    })
    void doFilterInternal_malformedToken_passesThrough(String authHeader) throws Exception {
        when(request.getHeader("Authorization")).thenReturn(authHeader);
        lenient().when(request.getRequestURI()).thenReturn("/api/test");

        jwtAuthFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    // If extractUsername throws, the filter should not set authentication
    @Test
    void doFilterInternal_extractUsernameThrows_passesThrough() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer a.b.c");
        when(jwtService.extractUsername("a.b.c")).thenThrow(new RuntimeException("bad token"));

        jwtAuthFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    // A valid token should result in authentication being set in the security context
    @Test
    void doFilterInternal_validToken_setsAuthentication() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer a.b.c");
        when(jwtService.extractUsername("a.b.c")).thenReturn("test@example.com");
        when(userDetailsService.loadUserByUsername("test@example.com")).thenReturn(mockUserDetails);
        when(jwtService.isTokenValid("a.b.c", "test@example.com")).thenReturn(true);

        jwtAuthFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getName())
                .isEqualTo("test@example.com");
    }

    // A token with invalid signature should not set authentication
    @Test
    void doFilterInternal_invalidToken_doesNotSetAuthentication() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer a.b.c");
        when(jwtService.extractUsername("a.b.c")).thenReturn("test@example.com");
        when(userDetailsService.loadUserByUsername("test@example.com")).thenReturn(mockUserDetails);
        when(jwtService.isTokenValid("a.b.c", "test@example.com")).thenReturn(false);

        jwtAuthFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    // A null identifier from the token should skip auth entirely
    @Test
    void doFilterInternal_nullIdentifier_skipsAuthAndPassesThrough() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer a.b.c");
        when(jwtService.extractUsername("a.b.c")).thenReturn(null);

        jwtAuthFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(userDetailsService, never()).loadUserByUsername(any());
    }

    // If auth is already set in context, the filter should not replace it
    @Test
    void doFilterInternal_alreadyAuthenticated_doesNotReplaceAuthentication() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer a.b.c");
        when(jwtService.extractUsername("a.b.c")).thenReturn("test@example.com");

        Authentication existingAuth = new UsernamePasswordAuthenticationToken(
                mockUserDetails, null, Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(existingAuth);

        jwtAuthFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verify(userDetailsService, never()).loadUserByUsername(any());
    }
}