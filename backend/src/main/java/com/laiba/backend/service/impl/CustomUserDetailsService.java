package com.laiba.backend.service.impl;

import com.laiba.backend.entity.Users;
import com.laiba.backend.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Spring Security calls this during authentication to load the user
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Username here is either an email or a phone number
        if (username.contains("@")) {
            Users user = userRepository.findByEmail(username).orElseThrow(() -> new UsernameNotFoundException("User not found"));
            return user;
        } else {
            Users user = userRepository.findByPhoneNo(username).orElseThrow(() -> new UsernameNotFoundException("User not found"));
            return user;
        }
    }
}