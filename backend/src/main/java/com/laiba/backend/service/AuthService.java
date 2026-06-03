package com.laiba.backend.service;

import com.laiba.backend.dto.LoginRequest;
import com.laiba.backend.dto.RegisterRequest;

public interface AuthService {
     String register(RegisterRequest registerRequest);
     String login(LoginRequest loginRequest);
     String changePassword(String oldPassword, String newPassword);
}
