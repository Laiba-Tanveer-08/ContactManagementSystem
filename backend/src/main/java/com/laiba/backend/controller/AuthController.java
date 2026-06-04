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
        log.info("POST /api/auth/register - identifier: {}", request.getIdentifier());
        String result = authService.register(request);
        log.info("Register result: {}", result);
        return result;
    }

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request) {
        log.info("POST /api/auth/login - identifier: {}", request.getIdentifier());
        String result = authService.login(request);
        log.info("Login result for {}: {}", request.getIdentifier(), result.length() > 20 ? "token issued" : result);
        return result;
    }

    @PostMapping("/changepassword")
    public String changePassword(@RequestBody ChangePasswordRequest request) {
        log.info("POST /api/auth/changepassword");
        String result = authService.changePassword(request);
        log.info("Change password result: {}", result);
        return result;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile() {
        log.info("GET /api/auth/profile");
        UserResponse profile = authService.getProfile();
        if (profile == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        log.info("POST /api/auth/logout");
        String result = authService.logout();
        return ResponseEntity.ok(result);
    }
}