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
        log.info("POST /api/contact/addcontact");
        ResponseEntity<String> response = ResponseEntity.ok(contactService.createContact(contactRequest));
        log.info("Create contact response: {}", response.getBody());
        return response;
    }

    @GetMapping("/getcontacts")
    public ResponseEntity<Page<ContactResponse>> getContacts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("GET /api/contact/getcontacts - page: {}, size: {}", page, size);
        return ResponseEntity.ok(contactService.getContacts(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContactResponse> getContactById(@PathVariable Long id) {
        log.info("GET /api/contact/{}", id);
        return ResponseEntity.ok(contactService.getContactById(id));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<String> updateContact(@PathVariable Long id, @RequestBody ContactRequest contactRequest) {
        log.info("PUT /api/contact/update/{}", id);
        ResponseEntity<String> response = ResponseEntity.ok(contactService.updateContact(id, contactRequest));
        log.info("Update contact response: {}", response.getBody());
        return response;
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteContact(@PathVariable Long id) {
        log.info("DELETE /api/contact/delete/{}", id);
        ResponseEntity<String> response = ResponseEntity.ok(contactService.deleteContact(id));
        log.info("Delete contact response: {}", response.getBody());
        return response;
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ContactResponse>> getContactsByName(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("GET /api/contact/search - name: '{}', page: {}, size: {}", name, page, size);
        return ResponseEntity.ok(contactService.getContactsByName(name, page, size));
    }
}