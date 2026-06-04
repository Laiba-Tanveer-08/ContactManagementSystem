package com.laiba.backend.repository;

import com.laiba.backend.entity.Contacts;
import com.laiba.backend.entity.Users;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Repository
public interface ContactRepository extends JpaRepository<Contacts, Long> {
    List<Contacts> findByFirstNameContainingIgnoreCase(String firstName);

    List<Contacts> findByLastNameContainingIgnoreCase(String lastName);

    Page<Contacts> findByUserAndFirstNameContainingIgnoreCaseOrUserAndLastNameContainingIgnoreCase(Users user, String firstName, Users user2, String lastName, Pageable pageable);

    List<Contacts> findByUserUserId(Long userId);

    Page<Contacts> findByUser(Users user, Pageable pageable);
}
