package com.laiba.backend.service.impl;

import com.laiba.backend.entity.Users;
import com.laiba.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CustomUserDetailsService customUserDetailsService;

    private Users mockUser;

    @BeforeEach
    void setUp() {
        mockUser = new Users();
        mockUser.setUserId(1L);
        mockUser.setEmail("test@example.com");
        mockUser.setPhoneNo("03001234567");
        mockUser.setPassword("encodedPassword");
    }

    @Test
    void loadUserByUsername_validEmail_returnsUserDetails() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));

        UserDetails result = customUserDetailsService.loadUserByUsername("test@example.com");

        assertNotNull(result);
        assertEquals("test@example.com", result.getUsername());
    }

    @Test
    void loadUserByUsername_validPhone_returnsUserDetails() {
        when(userRepository.findByPhoneNo("03001234567")).thenReturn(Optional.of(mockUser));

        UserDetails result = customUserDetailsService.loadUserByUsername("03001234567");

        assertNotNull(result);
    }

    @Test
    void loadUserByUsername_emailNotFound_throwsUsernameNotFoundException() {
        when(userRepository.findByEmail("nobody@example.com")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class,
                () -> customUserDetailsService.loadUserByUsername("nobody@example.com"));
    }

    @Test
    void loadUserByUsername_phoneNotFound_throwsUsernameNotFoundException() {
        when(userRepository.findByPhoneNo("03009999999")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class,
                () -> customUserDetailsService.loadUserByUsername("03009999999"));
    }

    @Test
    void loadUserByUsername_emailIdentifier_usesEmailRepository() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));

        customUserDetailsService.loadUserByUsername("test@example.com");

        verify(userRepository).findByEmail("test@example.com");
        verify(userRepository, never()).findByPhoneNo(any());
    }

    @Test
    void loadUserByUsername_phoneIdentifier_usesPhoneRepository() {
        when(userRepository.findByPhoneNo("03001234567")).thenReturn(Optional.of(mockUser));

        customUserDetailsService.loadUserByUsername("03001234567");

        verify(userRepository).findByPhoneNo("03001234567");
        verify(userRepository, never()).findByEmail(any());
    }
}