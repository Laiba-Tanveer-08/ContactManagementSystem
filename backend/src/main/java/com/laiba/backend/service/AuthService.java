package com.laiba.backend.service;

import com.laiba.backend.dto.ChangePasswordRequest;
import com.laiba.backend.dto.LoginRequest;
import com.laiba.backend.dto.RegisterRequest;
import com.laiba.backend.dto.UserResponse;

public interface AuthService {
     String register(RegisterRequest registerRequest);
     String login(LoginRequest loginRequest);
     String changePassword(ChangePasswordRequest changePasswordRequest);
     UserResponse getProfile();
     String logout();
}