package com.laiba.backend.service.impl;

import com.laiba.backend.dto.ChangePasswordRequest;
import com.laiba.backend.dto.LoginRequest;
import com.laiba.backend.dto.RegisterRequest;
import com.laiba.backend.dto.UserResponse;
import com.laiba.backend.entity.Users;
import com.laiba.backend.mapper.UserMapper;
import com.laiba.backend.repository.UserRepository;
import com.laiba.backend.service.JWTService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private UserMapper userMapper;
    @Mock private JWTService jwtService;

    @InjectMocks
    private AuthServiceImpl authService;

    private Users mockUser;

    @BeforeEach
    void setUp() {
        mockUser = new Users();
        mockUser.setUserId(1L);
        mockUser.setFirstName("Test");
        mockUser.setLastName("User");
        mockUser.setEmail("test@example.com");
        mockUser.setPassword("encodedPassword");
    }

    private void mockSecurityContext(String identifier) {
        Authentication auth = mock(Authentication.class);
        SecurityContext ctx = mock(SecurityContext.class);
        when(ctx.getAuthentication()).thenReturn(auth);
        when(auth.getName()).thenReturn(identifier);
        SecurityContextHolder.setContext(ctx);
    }

    @Test
    void register_newEmailUser_returnsSuccess() {
        RegisterRequest request = new RegisterRequest();
        request.setIdentifier("test@example.com");
        request.setPassword("pass123");
        request.setFirstName("Test");
        request.setLastName("User");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
        when(userMapper.toEntity(request)).thenReturn(mockUser);
        when(passwordEncoder.encode("pass123")).thenReturn("encodedPassword");

        String result = authService.register(request);

        assertEquals("User registered successfully", result);
        verify(userRepository).save(any(Users.class));
    }

    @Test
    void register_existingEmailUser_returnsAlreadyExists() {
        RegisterRequest request = new RegisterRequest();
        request.setIdentifier("test@example.com");
        request.setPassword("pass123");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));

        String result = authService.register(request);

        assertEquals("user already exist", result);
        verify(userRepository, never()).save(any());
    }

    @Test
    void register_newPhoneUser_returnsSuccess() {
        RegisterRequest request = new RegisterRequest();
        request.setIdentifier("03001234567");
        request.setPassword("pass123");

        Users phoneUser = new Users();
        when(userRepository.findByPhoneNo("03001234567")).thenReturn(Optional.empty());
        when(userMapper.toEntity(request)).thenReturn(phoneUser);
        when(passwordEncoder.encode("pass123")).thenReturn("encodedPassword");

        String result = authService.register(request);

        assertEquals("User registered successfully", result);
        verify(userRepository).save(any(Users.class));
    }

    @Test
    void register_existingPhoneUser_returnsAlreadyExists() {
        RegisterRequest request = new RegisterRequest();
        request.setIdentifier("03001234567");
        request.setPassword("pass123");

        when(userRepository.findByPhoneNo("03001234567")).thenReturn(Optional.of(mockUser));

        String result = authService.register(request);

        assertEquals("user already exist", result);
        verify(userRepository, never()).save(any());
    }

    @Test
    void login_validEmail_returnsToken() {
        LoginRequest request = new LoginRequest();
        request.setIdentifier("test@example.com");
        request.setPassword("pass123");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("pass123", "encodedPassword")).thenReturn(true);
        when(jwtService.generateToken("test@example.com")).thenReturn("jwt-token");

        String result = authService.login(request);

        assertEquals("jwt-token", result);
    }

    @Test
    void login_wrongEmailPassword_returnsInvalidPassword() {
        LoginRequest request = new LoginRequest();
        request.setIdentifier("test@example.com");
        request.setPassword("wrong");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("wrong", "encodedPassword")).thenReturn(false);

        String result = authService.login(request);

        assertEquals("invalid password", result);
    }

    @Test
    void login_nonExistentEmail_returnsUserDoesNotExist() {
        LoginRequest request = new LoginRequest();
        request.setIdentifier("nobody@example.com");
        request.setPassword("pass123");

        when(userRepository.findByEmail("nobody@example.com")).thenReturn(Optional.empty());

        String result = authService.login(request);

        assertEquals("user does not exist", result);
    }

    @Test
    void login_validPhone_returnsToken() {
        LoginRequest request = new LoginRequest();
        request.setIdentifier("03001234567");
        request.setPassword("pass123");

        Users phoneUser = new Users();
        phoneUser.setPassword("encodedPassword");
        phoneUser.setPhoneNo("03001234567");

        when(userRepository.findByPhoneNo("03001234567")).thenReturn(Optional.of(phoneUser));
        when(passwordEncoder.matches("pass123", "encodedPassword")).thenReturn(true);
        when(jwtService.generateToken("03001234567")).thenReturn("jwt-token");

        String result = authService.login(request);

        assertEquals("jwt-token", result);
    }

    @Test
    void login_wrongPhonePassword_returnsInvalidPassword() {
        LoginRequest request = new LoginRequest();
        request.setIdentifier("03001234567");
        request.setPassword("wrong");

        Users phoneUser = new Users();
        phoneUser.setPassword("encodedPassword");

        when(userRepository.findByPhoneNo("03001234567")).thenReturn(Optional.of(phoneUser));
        when(passwordEncoder.matches("wrong", "encodedPassword")).thenReturn(false);

        String result = authService.login(request);

        assertEquals("invalid password", result);
    }

    @Test
    void login_nonExistentPhone_returnsUserDoesNotExist() {
        LoginRequest request = new LoginRequest();
        request.setIdentifier("03009999999");
        request.setPassword("pass123");

        when(userRepository.findByPhoneNo("03009999999")).thenReturn(Optional.empty());

        String result = authService.login(request);

        assertEquals("user does not exist", result);
    }

    @Test
    void changePassword_validOldPassword_returnsSuccess() {
        mockSecurityContext("test@example.com");

        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setOldPassword("oldPass");
        request.setNewPassword("newPass");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("oldPass", "encodedPassword")).thenReturn(true);
        when(passwordEncoder.encode("newPass")).thenReturn("newEncoded");

        String result = authService.changePassword(request);

        assertEquals("password changed successfully", result);
        verify(userRepository).save(mockUser);
    }

    @Test
    void changePassword_wrongOldPassword_returnsError() {
        mockSecurityContext("test@example.com");

        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setOldPassword("wrongOld");
        request.setNewPassword("newPass");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("wrongOld", "encodedPassword")).thenReturn(false);

        String result = authService.changePassword(request);

        assertEquals("invalid old password", result);
        verify(userRepository, never()).save(any());
    }

    @Test
    void changePassword_userNotFound_returnsUserDoesNotExist() {
        mockSecurityContext("nobody@example.com");

        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setOldPassword("old");
        request.setNewPassword("new");

        when(userRepository.findByEmail("nobody@example.com")).thenReturn(Optional.empty());

        String result = authService.changePassword(request);

        assertEquals("user does not exist", result);
    }

    @Test
    void getProfile_emailUser_returnsUserResponse() {
        mockSecurityContext("test@example.com");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));

        UserResponse result = authService.getProfile();

        assertNotNull(result);
        assertEquals("test@example.com", result.getEmail());
        assertEquals("Test", result.getFirstName());
        assertEquals("User", result.getLastName());
    }

    @Test
    void getProfile_userNotFound_returnsNull() {
        mockSecurityContext("nobody@example.com");
        when(userRepository.findByEmail("nobody@example.com")).thenReturn(Optional.empty());

        UserResponse result = authService.getProfile();

        assertNull(result);
    }

    @Test
    void logout_clearsSecurityContextAndReturnsSuccess() {
        mockSecurityContext("test@example.com");

        String result = authService.logout();

        assertEquals("Logged out successfully", result);
    }
}