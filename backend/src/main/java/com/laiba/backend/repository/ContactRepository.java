package com.laiba.backend.repository;

import com.laiba.backend.entity.Contacts;
import com.laiba.backend.entity.Users;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Pageable;

@Repository
public interface ContactRepository extends JpaRepository<Contacts, Long> {

    Page<Contacts> findByUser(Users user, Pageable pageable);

    // Searches first name, last name, and full name so partial matches work too
    @Query("SELECT c FROM Contacts c WHERE c.user = :user AND " +
            "(LOWER(c.firstName) LIKE LOWER(CONCAT('%', :name, '%')) OR " +
            "LOWER(c.lastName) LIKE LOWER(CONCAT('%', :name, '%')) OR " +
            "LOWER(CONCAT(c.firstName, ' ', c.lastName)) LIKE LOWER(CONCAT('%', :name, '%')))")
    Page<Contacts> searchByName(@Param("user") Users user, @Param("name") String name, Pageable pageable);
}