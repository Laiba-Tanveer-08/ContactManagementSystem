package com.laiba.backend.repository;

import com.laiba.backend.entity.Contacts;
import com.laiba.backend.entity.Users;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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
class ContactRepositoryTest {

    @Autowired
    private ContactRepository contactRepository;

    @Autowired
    private UserRepository userRepository;

    private Users mockUser;
    private Contacts savedContact;

    @BeforeEach
    void setUp() {
        Users user = new Users();
        user.setFirstName("Test");
        user.setLastName("User");
        user.setEmail("test@example.com");
        user.setPassword("encoded");
        mockUser = userRepository.save(user);

        Contacts contact = new Contacts();
        contact.setFirstName("John");
        contact.setLastName("Doe");
        contact.setTitle("Mr");
        contact.setUser(mockUser);
        savedContact = contactRepository.save(contact);
    }

    @Test
    void findByUser_returnsContactsForUser() {
        Page<Contacts> result = contactRepository.findByUser(mockUser, PageRequest.of(0, 10));

        assertEquals(1, result.getTotalElements());
        assertEquals("John", result.getContent().get(0).getFirstName());
    }

    @Test
    void findByUser_differentUser_returnsEmpty() {
        Users otherUser = new Users();
        otherUser.setFirstName("Other");
        otherUser.setLastName("User");
        otherUser.setEmail("other@example.com");
        otherUser.setPassword("encoded");
        Users savedOther = userRepository.save(otherUser);

        Page<Contacts> result = contactRepository.findByUser(savedOther, PageRequest.of(0, 10));

        assertEquals(0, result.getTotalElements());
    }

    @Test
    void findByUserAndFirstNameContainingIgnoreCase_matchingName_returnsContact() {
        Page<Contacts> result = contactRepository
                .findByUserAndFirstNameContainingIgnoreCaseOrUserAndLastNameContainingIgnoreCase(
                        mockUser, "john", mockUser, "john", PageRequest.of(0, 10));

        assertEquals(1, result.getTotalElements());
        assertEquals("John", result.getContent().get(0).getFirstName());
    }

    @Test
    void findByUserAndLastNameContainingIgnoreCase_matchingLastName_returnsContact() {
        Page<Contacts> result = contactRepository
                .findByUserAndFirstNameContainingIgnoreCaseOrUserAndLastNameContainingIgnoreCase(
                        mockUser, "doe", mockUser, "doe", PageRequest.of(0, 10));

        assertEquals(1, result.getTotalElements());
        assertEquals("Doe", result.getContent().get(0).getLastName());
    }

    @Test
    void searchByName_caseInsensitive_returnsContact() {
        Page<Contacts> result = contactRepository
                .findByUserAndFirstNameContainingIgnoreCaseOrUserAndLastNameContainingIgnoreCase(
                        mockUser, "JOHN", mockUser, "JOHN", PageRequest.of(0, 10));

        assertEquals(1, result.getTotalElements());
    }

    @Test
    void searchByName_noMatch_returnsEmpty() {
        Page<Contacts> result = contactRepository
                .findByUserAndFirstNameContainingIgnoreCaseOrUserAndLastNameContainingIgnoreCase(
                        mockUser, "xyz", mockUser, "xyz", PageRequest.of(0, 10));

        assertEquals(0, result.getTotalElements());
    }

    @Test
    void findById_existingContact_returnsContact() {
        Optional<Contacts> result = contactRepository.findById(savedContact.getContactId());

        assertTrue(result.isPresent());
        assertEquals("John", result.get().getFirstName());
    }

    @Test
    void delete_removesContact() {
        contactRepository.delete(savedContact);

        Optional<Contacts> result = contactRepository.findById(savedContact.getContactId());

        assertFalse(result.isPresent());
    }
}