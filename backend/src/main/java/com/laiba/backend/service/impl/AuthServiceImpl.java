package com.laiba.backend.service.impl;

import com.laiba.backend.dto.ChangePasswordRequest;
import com.laiba.backend.dto.LoginRequest;
import com.laiba.backend.dto.RegisterRequest;
import com.laiba.backend.dto.UserResponse;
import com.laiba.backend.entity.Users;
import com.laiba.backend.mapper.UserMapper;
import com.laiba.backend.repository.UserRepository;
import com.laiba.backend.service.AuthService;
import com.laiba.backend.service.JWTService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final JWTService jwtService;

    public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, UserMapper userMapper, JWTService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
        this.jwtService = jwtService;
    }

    @Override
    public String register(RegisterRequest registerRequest) {
        String identifier = registerRequest.getIdentifier();
        log.info("Registration attempt for identifier: {}", identifier);

        if (identifier.contains("@")) {
            if (userRepository.findByEmail(identifier).isPresent()) {
                log.warn("Registration failed - user already exists with email: {}", identifier);
                return "user already exist";
            }
        } else {
            if (userRepository.findByPhoneNo(identifier).isPresent()) {
                log.warn("Registration failed - user already exists with phone: {}", identifier);
                return "user already exist";
            }
        }

        Users user = userMapper.toEntity(registerRequest);
        if (identifier.contains("@")) {
            user.setEmail(identifier);
        } else {
            user.setPhoneNo(identifier);
        }
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        userRepository.save(user);

        log.info("User registered successfully for identifier: {}", identifier);
        return "User registered successfully";
    }

    @Override
    public String login(LoginRequest loginRequest) {
        String identifier = loginRequest.getIdentifier();
        log.info("Login attempt for identifier: {}", identifier);

        if (identifier.contains("@")) {
            if (userRepository.findByEmail(identifier).isPresent()) {
                Users user = userRepository.findByEmail(identifier).get();
                if (passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                    String token = jwtService.generateToken(identifier);
                    log.info("Login successful for email: {}", identifier);
                    return token;
                } else {
                    log.warn("Login failed - invalid password for email: {}", identifier);
                    return "invalid password";
                }
            } else {
                log.warn("Login failed - user not found for email: {}", identifier);
                return "user does not exist";
            }
        } else {
            if (userRepository.findByPhoneNo(identifier).isPresent()) {
                Users user = userRepository.findByPhoneNo(identifier).get();
                if (passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                    String token = jwtService.generateToken(identifier);
                    log.info("Login successful for phone: {}", identifier);
                    return token;
                } else {
                    log.warn("Login failed - invalid password for phone: {}", identifier);
                    return "invalid password";
                }
            } else {
                log.warn("Login failed - user not found for phone: {}", identifier);
                return "user does not exist";
            }
        }
    }

    @Override
    public String changePassword(ChangePasswordRequest changePasswordRequest) {
        String identifier = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Change password attempt for identifier: {}", identifier);

        if (identifier.contains("@")) {
            if (userRepository.findByEmail(identifier).isPresent()) {
                Users user = userRepository.findByEmail(identifier).get();
                if (passwordEncoder.matches(changePasswordRequest.getOldPassword(), user.getPassword())) {
                    user.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
                    userRepository.save(user);
                    log.info("Password changed successfully for email: {}", identifier);
                    return "password changed successfully";
                } else {
                    log.warn("Change password failed - invalid old password for email: {}", identifier);
                    return "invalid old password";
                }
            } else {
                log.warn("Change password failed - user not found for email: {}", identifier);
                return "user does not exist";
            }
        } else {
            if (userRepository.findByPhoneNo(identifier).isPresent()) {
                Users user = userRepository.findByPhoneNo(identifier).get();
                if (passwordEncoder.matches(changePasswordRequest.getOldPassword(), user.getPassword())) {
                    user.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
                    userRepository.save(user);
                    log.info("Password changed successfully for phone: {}", identifier);
                    return "password changed successfully";
                } else {
                    log.warn("Change password failed - invalid old password for phone: {}", identifier);
                    return "invalid old password";
                }
            } else {
                log.warn("Change password failed - user not found for phone: {}", identifier);
                return "user does not exist";
            }
        }
    }

    @Override
    public UserResponse getProfile() {
        String identifier = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Fetching profile for identifier: {}", identifier);

        Users user;
        if (identifier.contains("@")) {
            user = userRepository.findByEmail(identifier).orElse(null);
        } else {
            user = userRepository.findByPhoneNo(identifier).orElse(null);
        }

        if (user == null) {
            log.warn("Profile fetch failed - user not found for identifier: {}", identifier);
            return null;
        }

        log.info("Profile fetched successfully for identifier: {}", identifier);
        return new UserResponse(user.getUserId(), user.getFirstName(), user.getLastName(), user.getEmail(), user.getPhoneNo());
    }

    @Override
    public String logout() {
        String identifier = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Logout for identifier: {}", identifier);
        SecurityContextHolder.clearContext();
        log.info("Security context cleared for identifier: {}", identifier);
        return "Logged out successfully";
    }
}