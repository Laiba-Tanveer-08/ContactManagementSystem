package com.laiba.backend.service.impl;

import com.laiba.backend.dto.ContactRequest;
import com.laiba.backend.dto.ContactResponse;
import com.laiba.backend.entity.ContactInfo;
import com.laiba.backend.entity.Contacts;
import com.laiba.backend.entity.Users;
import com.laiba.backend.exception.AuthenticationException;
import com.laiba.backend.exception.ContactNotFoundException;
import com.laiba.backend.exception.UnauthorizedException;
import com.laiba.backend.exception.UserNotFoundException;
import com.laiba.backend.mapper.ContactInfoMapper;
import com.laiba.backend.mapper.ContactMapper;
import com.laiba.backend.repository.ContactRepository;
import com.laiba.backend.repository.UserRepository;
import com.laiba.backend.service.ContactService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContactServiceImpl implements ContactService {

    private static final Logger log = LoggerFactory.getLogger(ContactServiceImpl.class);

    private static final String CONTACT_NOT_FOUND_MSG = "Contact not found";
    private static final String CONTACT_NOT_FOUND_LOG = "Contact not found with id: {}";
    private static final String UNAUTHORIZED_LOG = "Unauthorized access attempt on contact id: {} by user: {}";

    private final ContactRepository contactRepository;
    private final ContactMapper contactMapper;
    private final UserRepository userRepository;
    private final ContactInfoMapper contactInfoMapper;

    public ContactServiceImpl(ContactRepository contactRepository, ContactMapper contactMapper,
                              UserRepository userRepository, ContactInfoMapper contactInfoMapper) {
        this.contactRepository = contactRepository;
        this.contactMapper = contactMapper;
        this.userRepository = userRepository;
        this.contactInfoMapper = contactInfoMapper;
    }

    private Users getCurrentUser() {
        // Null check on authentication before accessing the identifier
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            log.error("Authentication failed - no authentication object found in security context");
            throw new AuthenticationException("User not authenticated");
        }

        String identifier = authentication.getName();
        if (identifier == null) {
            log.error("Authentication failed - no identifier found in security context");
            throw new AuthenticationException("User not authenticated");
        }

        log.debug("Resolving current user for identifier: {}", identifier);
        if (identifier.contains("@")) {
            return userRepository.findByEmail(identifier).orElseThrow(() -> {
                log.error("User not found for email identifier");
                return new UserNotFoundException("User not found");
            });
        } else {
            return userRepository.findByPhoneNo(identifier).orElseThrow(() -> {
                log.error("User not found for phone identifier");
                return new UserNotFoundException("User not found");
            });
        }
    }

    // Maps a list of ContactInfo DTOs to entities and links them to the given contact
    private List<ContactInfo> buildContactInfoList(ContactRequest contactRequest, Contacts contact) {
        return contactRequest.getContactInfos().stream()
                .map(dto -> {
                    ContactInfo info = contactInfoMapper.toEntity(dto);
                    info.setContact(contact);
                    return info;
                })
                .toList();
    }

    private void checkOwnership(Contacts contact, Users user, Long id, String action) {
        if (!contact.getUser().getUserId().equals(user.getUserId())) {
            log.warn(UNAUTHORIZED_LOG + " - action: {}", id, user.getUsername(), action);
            throw new UnauthorizedException("Unauthorized access");
        }
    }

    @Override
    public String createContact(ContactRequest contactRequest) {
        log.info("Creating new contact for user");
        Users user = getCurrentUser();

        Contacts contact = contactMapper.toEntity(contactRequest);
        contact.setUser(user);

        if (contactRequest.getContactInfos() != null) {
            contact.setContactInfos(buildContactInfoList(contactRequest, contact));
        }

        contactRepository.save(contact);
        log.info("Contact created successfully for user: {}", user.getUsername());
        return "Contact created successfully";
    }

    @Override
    public Page<ContactResponse> getContacts(int page, int size) {
        log.info("Fetching contacts - page: {}, size: {}", page, size);
        Users user = getCurrentUser();
        Pageable pageable = PageRequest.of(page, size);
        Page<Contacts> contacts = contactRepository.findByUser(user, pageable);
        log.debug("Found {} contacts for user: {}", contacts.getTotalElements(), user.getUsername());
        return contacts.map(contactMapper::toResponse);
    }

    @Override
    public ContactResponse getContactById(Long id) {
        log.info("Fetching contact by id: {}", id);
        Users user = getCurrentUser();

        Contacts contact = contactRepository.findById(id).orElseThrow(() -> {
            log.error(CONTACT_NOT_FOUND_LOG, id);
            return new ContactNotFoundException(CONTACT_NOT_FOUND_MSG);
        });

        checkOwnership(contact, user, id, "read");
        return contactMapper.toResponse(contact);
    }

    @Override
    public String updateContact(Long id, ContactRequest contactRequest) {
        log.info("Updating contact with id: {}", id);
        Users user = getCurrentUser();

        Contacts contact = contactRepository.findById(id).orElseThrow(() -> {
            log.error(CONTACT_NOT_FOUND_LOG, id);
            return new ContactNotFoundException(CONTACT_NOT_FOUND_MSG);
        });

        checkOwnership(contact, user, id, "update");

        contact.setFirstName(contactRequest.getFirstName());
        contact.setLastName(contactRequest.getLastName());
        contact.setTitle(contactRequest.getTitle());

        contact.getContactInfos().clear();
        if (contactRequest.getContactInfos() != null) {
            contact.getContactInfos().addAll(buildContactInfoList(contactRequest, contact));
        }

        contactRepository.save(contact);
        log.info("Contact updated successfully with id: {}", id);
        return "Contact updated successfully";
    }

    @Override
    public String deleteContact(Long id) {
        log.info("Deleting contact with id: {}", id);
        Users user = getCurrentUser();

        Contacts contact = contactRepository.findById(id).orElseThrow(() -> {
            log.error(CONTACT_NOT_FOUND_LOG, id);
            return new ContactNotFoundException(CONTACT_NOT_FOUND_MSG);
        });

        checkOwnership(contact, user, id, "delete");
        contactRepository.delete(contact);
        log.info("Contact deleted successfully with id: {}", id);
        return "Contact deleted successfully";
    }

    @Override
    public Page<ContactResponse> getContactsByName(String name, int page, int size) {
        log.info("Searching contacts by name: '{}', page: {}, size: {}", name, page, size);
        Users user = getCurrentUser();
        Pageable pageable = PageRequest.of(page, size);
        Page<Contacts> contacts = contactRepository.searchByName(user, name, pageable);
        log.debug("Found {} contacts matching name '{}' for user: {}", contacts.getTotalElements(),
                name, user.getUsername());
        return contacts.map(contactMapper::toResponse);
    }
}