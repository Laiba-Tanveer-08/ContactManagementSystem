package com.laiba.backend.repository;

import com.laiba.backend.entity.Users;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    private Users savedUser;

    @BeforeEach
    void setUp() {
        Users user = new Users();
        user.setFirstName("Test");
        user.setLastName("User");
        user.setEmail("test@example.com");
        user.setPhoneNo("03001234567");
        user.setPassword("encodedPassword");
        savedUser = userRepository.save(user);
    }

    @Test
    void findByEmail_existingEmail_returnsUser() {
        Optional<Users> result = userRepository.findByEmail("test@example.com");

        assertTrue(result.isPresent());
        assertEquals("test@example.com", result.get().getEmail());
        assertEquals("Test", result.get().getFirstName());
    }

    @Test
    void findByEmail_nonExistingEmail_returnsEmpty() {
        Optional<Users> result = userRepository.findByEmail("nobody@example.com");

        assertFalse(result.isPresent());
    }

    @Test
    void findByPhoneNo_existingPhone_returnsUser() {
        Optional<Users> result = userRepository.findByPhoneNo("03001234567");

        assertTrue(result.isPresent());
        assertEquals("03001234567", result.get().getPhoneNo());
    }

    @Test
    void findByPhoneNo_nonExistingPhone_returnsEmpty() {
        Optional<Users> result = userRepository.findByPhoneNo("03009999999");

        assertFalse(result.isPresent());
    }

    @Test
    void save_persistsUserCorrectly() {
        Users newUser = new Users();
        newUser.setFirstName("Jane");
        newUser.setLastName("Doe");
        newUser.setEmail("jane@example.com");
        newUser.setPassword("encoded");

        Users saved = userRepository.save(newUser);

        assertNotNull(saved.getUserId());
        assertEquals("Jane", saved.getFirstName());
        assertEquals("jane@example.com", saved.getEmail());
    }

    @Test
    void delete_removesUser() {
        userRepository.delete(savedUser);

        Optional<Users> result = userRepository.findByEmail("test@example.com");

        assertFalse(result.isPresent());
    }
}