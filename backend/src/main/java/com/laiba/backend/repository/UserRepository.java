package com.laiba.backend.repository;

import com.laiba.backend.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<Users, Long> {

    // Used during login to support both email and phone number as identifier
    Optional<Users> findByEmail(String email);

    Optional<Users> findByPhoneNo(String phoneNo);
}