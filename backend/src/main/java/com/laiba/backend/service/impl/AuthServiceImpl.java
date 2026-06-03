package com.laiba.backend.service.impl;

import com.laiba.backend.dto.LoginRequest;
import com.laiba.backend.dto.RegisterRequest;
import com.laiba.backend.entity.Users;
import com.laiba.backend.mapper.UserMapper;
import com.laiba.backend.repository.UserRepository;
import com.laiba.backend.service.AuthService;
import com.laiba.backend.service.JWTService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final JWTService jwtService;

    public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, UserMapper userMapper,  JWTService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
        this.jwtService = jwtService;
    }

    @Override
    public String register(RegisterRequest registerRequest) {
        String identifier = registerRequest.getIdentifier();
        if (identifier.contains("@")) {
            if (userRepository.findByEmail(identifier).isPresent()) {
                return "user already exists";
            }
        } else {
            if (userRepository.findByPhoneNo(identifier).isPresent()) {
                return "user already exists";
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
        return "User registered successfully";
    }

    @Override
    public String login(LoginRequest loginRequest) {
        String identifier = loginRequest.getIdentifier();
        String password = loginRequest.getPassword();
        if (identifier.contains("@")) {
            if (userRepository.findByEmail(identifier).isPresent()) {
               Users user = userRepository.findByEmail(identifier).get();
               if(passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())){
                   String token = jwtService.generateToken(identifier);
                   return token;
               }
               else
                   return "invalid password";
            }
            else
                return "user does not exists";
        } else {
            if (userRepository.findByPhoneNo(identifier).isPresent()) {
                Users user = userRepository.findByPhoneNo(identifier).get();
                if(passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())){
                    String token = jwtService.generateToken(identifier);
                    return token;
                }
                else
                    return "invalid password";
            }
            else
                return "user does not exists";
        }

    }

    @Override
    public String changePassword(String oldPassword, String newPassword) {
        return "";
    }
}
