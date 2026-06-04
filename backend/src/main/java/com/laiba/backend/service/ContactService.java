package com.laiba.backend.service;

import com.laiba.backend.dto.ContactRequest;
import com.laiba.backend.dto.ContactResponse;
import org.springframework.data.domain.Page;

public interface ContactService {
    String createContact(ContactRequest contactRequest);
    Page<ContactResponse> getContacts(int page, int size);
    ContactResponse getContactById(Long id);
    String updateContact(Long id, ContactRequest contactRequest);
    String deleteContact(Long id);
    Page<ContactResponse> getContactsByName(String name, int page, int size);
}
