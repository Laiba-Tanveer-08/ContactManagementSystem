package com.laiba.backend.repository;

import com.laiba.backend.entity.Contacts;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactRepository extends JpaRepository<Contacts, Long> {
    List<Contacts> findByFirstNameContainingIgnoreCase(String firstName);

    List<Contacts> findByLastNameContainingIgnoreCase(String lastName);

    List<Contacts> findByUserUserId(Long userId);
}
