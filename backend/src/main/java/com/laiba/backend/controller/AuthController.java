package com.laiba.backend.controller;

import com.laiba.backend.dto.ChangePasswordRequest;
import com.laiba.backend.dto.LoginRequest;
import com.laiba.backend.dto.RegisterRequest;
import com.laiba.backend.dto.UserResponse;
import com.laiba.backend.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request) {
        log.info("Register request received for identifier: {}", request.getIdentifier());
        return authService.register(request);
    }

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request) {
        log.info("Login request received for identifier: {}", request.getIdentifier());
        return authService.login(request);
    }

    @PostMapping("/changepassword")
    public String changePassword(@RequestBody ChangePasswordRequest request) {
        log.info("Change password request received");
        return authService.changePassword(request);
    }

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile() {
        log.info("Profile fetch request received");
        UserResponse profile = authService.getProfile();
        // Return 404 if no profile found for the current user
        if (profile == null) {
            log.warn("No profile found for current user");
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        log.info("Logout request received");
        return ResponseEntity.ok(authService.logout());
    }
}