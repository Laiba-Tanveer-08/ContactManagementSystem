package com.laiba.backend.controller;

import com.laiba.backend.dto.ContactRequest;
import com.laiba.backend.dto.ContactResponse;
import com.laiba.backend.service.ContactService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private static final Logger log = LoggerFactory.getLogger(ContactController.class);

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping("/addcontact")
    public ResponseEntity<String> createContact(@RequestBody ContactRequest contactRequest) {
        log.info("Add contact request received");
        return ResponseEntity.ok(contactService.createContact(contactRequest));
    }

    // Page and size params let the client control how many contacts come back
    @GetMapping("/getcontacts")
    public ResponseEntity<Page<ContactResponse>> getContacts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("Get contacts request received - page: {}, size: {}", page, size);
        return ResponseEntity.ok(contactService.getContacts(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContactResponse> getContactById(@PathVariable Long id) {
        log.info("Get contact by id request received - id: {}", id);
        return ResponseEntity.ok(contactService.getContactById(id));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<String> updateContact(@PathVariable Long id, @RequestBody ContactRequest contactRequest) {
        log.info("Update contact request received - id: {}", id);
        return ResponseEntity.ok(contactService.updateContact(id, contactRequest));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteContact(@PathVariable Long id) {
        log.info("Delete contact request received - id: {}", id);
        return ResponseEntity.ok(contactService.deleteContact(id));
    }

    // Search is name-based and also paginated
    @GetMapping("/search")
    public ResponseEntity<Page<ContactResponse>> getContactsByName(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("Search contacts request received - name: '{}', page: {}, size: {}", name, page, size);
        return ResponseEntity.ok(contactService.getContactsByName(name, page, size));
    }
}