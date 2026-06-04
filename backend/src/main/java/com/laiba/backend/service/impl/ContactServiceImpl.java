package com.laiba.backend.service.impl;

import com.laiba.backend.dto.ContactRequest;
import com.laiba.backend.dto.ContactResponse;
import com.laiba.backend.entity.ContactInfo;
import com.laiba.backend.entity.Contacts;
import com.laiba.backend.entity.Users;
import com.laiba.backend.mapper.ContactInfoMapper;
import com.laiba.backend.mapper.ContactMapper;
import com.laiba.backend.repository.ContactRepository;
import com.laiba.backend.repository.UserRepository;
import com.laiba.backend.service.ContactService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContactServiceImpl implements ContactService {
    private final ContactRepository contactRepository;
    private final ContactMapper contactMapper;
    private final UserRepository userRepository;
    private final ContactInfoMapper contactInfoMapper;
    public ContactServiceImpl(ContactRepository contactRepository, ContactMapper contactMapper, UserRepository userRepository,  ContactInfoMapper contactInfoMapper) {
        this.contactRepository = contactRepository;
        this.contactMapper = contactMapper;
        this.userRepository = userRepository;
        this.contactInfoMapper = contactInfoMapper;
    }
    private Users getCurrentUser() {
        String identifier = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
        if (identifier == null) {
            throw new RuntimeException("User not authenticated");
        }
        if (identifier.contains("@")) {
            return userRepository.findByEmail(identifier)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        } else {
            return userRepository.findByPhoneNo(identifier)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        }
    }
    @Override
    public String createContact(ContactRequest contactRequest) {
        Users user = getCurrentUser();
        Contacts contact = contactMapper.toEntity(contactRequest);
        contact.setUser(user);
        if (contactRequest.getContactInfos() != null) {
            List<ContactInfo> infos = contactRequest.getContactInfos()
                    .stream()
                    .map(dto -> {
                        ContactInfo info = contactInfoMapper.toEntity(dto);
                        info.setContact(contact); // link back to parent
                        return info;
                    })
                    .toList();
            contact.setContactInfos(infos);
        }

        contactRepository.save(contact); // cascades to contactInfos
        return "Contact created successfully";
    }

    @Override
    public Page<ContactResponse> getContacts(int page, int size) {
        Users user = getCurrentUser();
        Pageable pageable = PageRequest.of(page, size);
        Page<Contacts> contacts = contactRepository.findByUser(user, pageable);
        Page<ContactResponse> contactResponsePage = contacts.map(contactMapper::toResponse);
        return contactResponsePage;
    }

    @Override
    public ContactResponse getContactById(Long id) {
        Users user = getCurrentUser();
        Contacts contact = contactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact not found"));
        if (!contact.getUser().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("Unauthorized");
        }
        return contactMapper.toResponse(contact);
    }

    @Override
    public String updateContact(Long id, ContactRequest contactRequest) {
        System.out.println("UPDATE METHOD HIT");
        Users user = getCurrentUser();
        Contacts contact = contactRepository.findById(id).orElseThrow(() -> new RuntimeException("Contact not found"));
        if (!contact.getUser().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("Unauthorized");
        }
        contact.setFirstName(contactRequest.getFirstName());
        contact.setLastName(contactRequest.getLastName());
        contact.setTitle(contactRequest.getTitle());
        contact.getContactInfos().clear();
        if (contactRequest.getContactInfos() != null) {
            List<ContactInfo> infos = contactRequest.getContactInfos()
                    .stream()
                    .map(dto -> {
                        ContactInfo info = contactInfoMapper.toEntity(dto);
                        info.setContact(contact); // link back to parent
                        return info;
                    })
                    .collect(Collectors.toList());
            contact.getContactInfos().addAll(infos);
        }
        contactRepository.save(contact);
        return "Contact updated successfully";
    }

    @Override
    public String deleteContact(Long id) {
        Users user = getCurrentUser();
        Contacts contact = contactRepository.findById(id).orElseThrow(() -> new RuntimeException("Contact not found"));
        if (!contact.getUser().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("Unauthorized");
        }
        contactRepository.delete(contact);
        return "contact deleted successfully";
    }

    @Override
    public Page<ContactResponse> getContactsByName(String name, int page, int size) {
        Users user = getCurrentUser();
        Pageable pageable = PageRequest.of(page, size);
      Page<Contacts> contacts=  contactRepository.findByUserAndFirstNameContainingIgnoreCaseOrUserAndLastNameContainingIgnoreCase(user, name, user, name, pageable);
        Page<ContactResponse> contactResponsePage = contacts.map(contactMapper::toResponse);
        return contactResponsePage;
    }
}
