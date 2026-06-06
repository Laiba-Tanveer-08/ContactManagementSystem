package com.laiba.backend.service.impl;

import com.laiba.backend.dto.ChangePasswordRequest;
import com.laiba.backend.dto.LoginRequest;
import com.laiba.backend.dto.RegisterRequest;
import com.laiba.backend.dto.UserResponse;
import com.laiba.backend.entity.Users;
import com.laiba.backend.exception.AuthenticationException;
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

    // Simulates a completely missing authentication object in the security context
    private void mockNullAuthentication() {
        SecurityContext ctx = mock(SecurityContext.class);
        when(ctx.getAuthentication()).thenReturn(null);
        SecurityContextHolder.setContext(ctx);
    }

    // ─ getAuthenticatedIdentifier — null authentication branch

    @Test
    void changePassword_nullAuthentication_throwsAuthenticationException() {
        mockNullAuthentication();

        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setOldPassword("old");
        request.setNewPassword("new");

        assertThrows(AuthenticationException.class, () -> authService.changePassword(request));
    }

    @Test
    void getProfile_nullAuthentication_throwsAuthenticationException() {
        mockNullAuthentication();

        assertThrows(AuthenticationException.class, () -> authService.getProfile());
    }

    @Test
    void logout_nullAuthentication_throwsAuthenticationException() {
        mockNullAuthentication();

        assertThrows(AuthenticationException.class, () -> authService.logout());
    }

    //  register

    @Test
    void register_newEmailUser_returnsSuccess() {
        RegisterRequest request = new RegisterRequest();
        request.setIdentifier("test@example.com");
        request.setPassword("pass123");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
        when(userMapper.toEntity(request)).thenReturn(mockUser);
        when(passwordEncoder.encode("pass123")).thenReturn("encodedPassword");

        assertEquals("User registered successfully", authService.register(request));
        verify(userRepository).save(any(Users.class));
    }

    @Test
    void register_existingEmailUser_returnsAlreadyExists() {
        RegisterRequest request = new RegisterRequest();
        request.setIdentifier("test@example.com");
        request.setPassword("pass123");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));

        assertEquals("user already exist", authService.register(request));
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

        assertEquals("User registered successfully", authService.register(request));
        verify(userRepository).save(any(Users.class));
    }

    @Test
    void register_existingPhoneUser_returnsAlreadyExists() {
        RegisterRequest request = new RegisterRequest();
        request.setIdentifier("03001234567");
        request.setPassword("pass123");

        when(userRepository.findByPhoneNo("03001234567")).thenReturn(Optional.of(mockUser));

        assertEquals("user already exist", authService.register(request));
        verify(userRepository, never()).save(any());
    }

    // login

    @Test
    void login_validEmail_returnsToken() {
        LoginRequest request = new LoginRequest();
        request.setIdentifier("test@example.com");
        request.setPassword("pass123");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("pass123", "encodedPassword")).thenReturn(true);
        when(jwtService.generateToken("test@example.com")).thenReturn("jwt-token");

        assertEquals("jwt-token", authService.login(request));
    }

    @Test
    void login_wrongEmailPassword_returnsInvalidPassword() {
        LoginRequest request = new LoginRequest();
        request.setIdentifier("test@example.com");
        request.setPassword("wrong");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("wrong", "encodedPassword")).thenReturn(false);

        assertEquals("invalid password", authService.login(request));
    }

    @Test
    void login_nonExistentEmail_returnsUserDoesNotExist() {
        LoginRequest request = new LoginRequest();
        request.setIdentifier("nobody@example.com");
        request.setPassword("pass123");

        when(userRepository.findByEmail("nobody@example.com")).thenReturn(Optional.empty());

        assertEquals("user does not exist", authService.login(request));
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

        assertEquals("jwt-token", authService.login(request));
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

        assertEquals("invalid password", authService.login(request));
    }

    @Test
    void login_nonExistentPhone_returnsUserDoesNotExist() {
        LoginRequest request = new LoginRequest();
        request.setIdentifier("03009999999");
        request.setPassword("pass123");

        when(userRepository.findByPhoneNo("03009999999")).thenReturn(Optional.empty());

        assertEquals("user does not exist", authService.login(request));
    }

    //  changePassword

    @Test
    void changePassword_validOldEmailPassword_returnsSuccess() {
        mockSecurityContext("test@example.com");

        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setOldPassword("oldPass");
        request.setNewPassword("newPass");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("oldPass", "encodedPassword")).thenReturn(true);
        when(passwordEncoder.encode("newPass")).thenReturn("newEncoded");

        assertEquals("password changed successfully", authService.changePassword(request));
        verify(userRepository).save(mockUser);
    }

    @Test
    void changePassword_wrongOldEmailPassword_returnsError() {
        mockSecurityContext("test@example.com");

        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setOldPassword("wrongOld");
        request.setNewPassword("newPass");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("wrongOld", "encodedPassword")).thenReturn(false);

        assertEquals("invalid old password", authService.changePassword(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    void changePassword_emailUserNotFound_returnsUserDoesNotExist() {
        mockSecurityContext("nobody@example.com");

        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setOldPassword("old");
        request.setNewPassword("new");

        when(userRepository.findByEmail("nobody@example.com")).thenReturn(Optional.empty());

        assertEquals("user does not exist", authService.changePassword(request));
    }

    @Test
    void changePassword_validOldPhonePassword_returnsSuccess() {
        mockSecurityContext("03001234567");

        Users phoneUser = new Users();
        phoneUser.setUserId(2L);
        phoneUser.setPassword("encodedPassword");
        phoneUser.setPhoneNo("03001234567");

        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setOldPassword("oldPass");
        request.setNewPassword("newPass");

        when(userRepository.findByPhoneNo("03001234567")).thenReturn(Optional.of(phoneUser));
        when(passwordEncoder.matches("oldPass", "encodedPassword")).thenReturn(true);
        when(passwordEncoder.encode("newPass")).thenReturn("newEncoded");

        assertEquals("password changed successfully", authService.changePassword(request));
        verify(userRepository).save(phoneUser);
    }

    @Test
    void changePassword_wrongOldPhonePassword_returnsError() {
        mockSecurityContext("03001234567");

        Users phoneUser = new Users();
        phoneUser.setPassword("encodedPassword");

        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setOldPassword("wrongOld");
        request.setNewPassword("newPass");

        when(userRepository.findByPhoneNo("03001234567")).thenReturn(Optional.of(phoneUser));
        when(passwordEncoder.matches("wrongOld", "encodedPassword")).thenReturn(false);

        assertEquals("invalid old password", authService.changePassword(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    void changePassword_phoneUserNotFound_returnsUserDoesNotExist() {
        mockSecurityContext("03009999999");

        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setOldPassword("old");
        request.setNewPassword("new");

        when(userRepository.findByPhoneNo("03009999999")).thenReturn(Optional.empty());

        assertEquals("user does not exist", authService.changePassword(request));
    }

    //  getProfile

    @Test
    void getProfile_emailUser_returnsUserResponse() {
        mockSecurityContext("test@example.com");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));

        UserResponse result = authService.getProfile();

        assertNotNull(result);
        assertEquals("test@example.com", result.getEmail());
        assertEquals("Test", result.getFirstName());
    }

    @Test
    void getProfile_emailUserNotFound_returnsNull() {
        mockSecurityContext("nobody@example.com");
        when(userRepository.findByEmail("nobody@example.com")).thenReturn(Optional.empty());

        assertNull(authService.getProfile());
    }

    @Test
    void getProfile_phoneUser_returnsUserResponse() {
        mockSecurityContext("03001234567");

        Users phoneUser = new Users();
        phoneUser.setUserId(2L);
        phoneUser.setFirstName("Phone");
        phoneUser.setLastName("User");
        phoneUser.setPhoneNo("03001234567");

        when(userRepository.findByPhoneNo("03001234567")).thenReturn(Optional.of(phoneUser));

        UserResponse result = authService.getProfile();

        assertNotNull(result);
        assertEquals("Phone", result.getFirstName());
    }

    @Test
    void getProfile_phoneUserNotFound_returnsNull() {
        mockSecurityContext("03009999999");
        when(userRepository.findByPhoneNo("03009999999")).thenReturn(Optional.empty());

        assertNull(authService.getProfile());
    }

    //  logout

    @Test
    void logout_clearsSecurityContextAndReturnsSuccess() {
        mockSecurityContext("test@example.com");

        assertEquals("Logged out successfully", authService.logout());
    }
}