package com.laiba.backend.service.impl;

import com.laiba.backend.dto.ChangePasswordRequest;
import com.laiba.backend.dto.LoginRequest;
import com.laiba.backend.dto.RegisterRequest;
import com.laiba.backend.dto.UserResponse;
import com.laiba.backend.entity.Users;
import com.laiba.backend.exception.AuthenticationException;
import com.laiba.backend.mapper.UserMapper;
import com.laiba.backend.repository.UserRepository;
import com.laiba.backend.service.AuthService;
import com.laiba.backend.service.JWTService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private static final String USER_DOES_NOT_EXIST = "user does not exist";
    private static final String USER_ALREADY_EXISTS = "user already exist";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final JWTService jwtService;

    public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder,
                           UserMapper userMapper, JWTService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
        this.jwtService = jwtService;
    }

    // Resolves the authenticated identifier from the security context, throws if missing
    private String getAuthenticatedIdentifier() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            log.error("No authentication found in security context");
            throw new AuthenticationException("User not authenticated");
        }
        return authentication.getName();
    }

    // Finds user by email or phone depending on the identifier format
    private Optional<Users> findUser(String identifier) {
        if (identifier.contains("@")) {
            return userRepository.findByEmail(identifier);
        }
        return userRepository.findByPhoneNo(identifier);
    }

    @Override
    public String register(RegisterRequest registerRequest) {
        String identifier = registerRequest.getIdentifier();
        log.info("Registration attempt for identifier: {}", identifier);

        if (findUser(identifier).isPresent()) {
            log.warn("Registration failed - user already exists with identifier: {}", identifier);
            return USER_ALREADY_EXISTS;
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

        Optional<Users> userOpt = findUser(identifier);
        if (userOpt.isEmpty()) {
            log.warn("Login failed - user not found for identifier: {}", identifier);
            return USER_DOES_NOT_EXIST;
        }

        Users user = userOpt.get();
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            log.warn("Login failed - invalid password for identifier: {}", identifier);
            return "invalid password";
        }

        String token = jwtService.generateToken(identifier);
        log.info("Login successful for identifier: {}", identifier);
        return token;
    }

    @Override
    public String changePassword(ChangePasswordRequest changePasswordRequest) {
        String identifier = getAuthenticatedIdentifier();
        log.info("Change password attempt for identifier: {}", identifier);

        Optional<Users> userOpt = findUser(identifier);
        if (userOpt.isEmpty()) {
            log.warn("Change password failed - user not found for identifier: {}", identifier);
            return USER_DOES_NOT_EXIST;
        }

        Users user = userOpt.get();
        if (!passwordEncoder.matches(changePasswordRequest.getOldPassword(), user.getPassword())) {
            log.warn("Change password failed - invalid old password for identifier: {}", identifier);
            return "invalid old password";
        }

        user.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed successfully for identifier: {}", identifier);
        return "password changed successfully";
    }

    @Override
    public UserResponse getProfile() {
        String identifier = getAuthenticatedIdentifier();
        log.info("Fetching profile for identifier: {}", identifier);

        Users user = findUser(identifier).orElse(null);

        if (user == null) {
            log.warn("Profile fetch failed - user not found for identifier: {}", identifier);
            return null;
        }

        log.info("Profile fetched successfully for identifier: {}", identifier);
        return new UserResponse(user.getUserId(), user.getFirstName(), user.getLastName(),
                user.getEmail(), user.getPhoneNo());
    }

    @Override
    public String logout() {
        String identifier = getAuthenticatedIdentifier();
        log.info("Logout for identifier: {}", identifier);
        SecurityContextHolder.clearContext();
        log.info("Security context cleared for identifier: {}", identifier);
        return "Logged out successfully";
    }
}