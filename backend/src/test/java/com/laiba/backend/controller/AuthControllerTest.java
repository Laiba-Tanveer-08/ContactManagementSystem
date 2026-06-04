package com.laiba.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.laiba.backend.dto.ChangePasswordRequest;
import com.laiba.backend.dto.LoginRequest;
import com.laiba.backend.dto.RegisterRequest;
import com.laiba.backend.dto.UserResponse;
import com.laiba.backend.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
class AuthControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private AuthService authService;
    @Autowired private ObjectMapper objectMapper;

    @Test
    void register_returnsSuccess() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setIdentifier("laiba@example.com");
        request.setPassword("pass123");
        request.setFirstName("Laiba");
        request.setLastName("Khan");

        when(authService.register(any(RegisterRequest.class))).thenReturn("User registered successfully");

        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("User registered successfully"));
    }
