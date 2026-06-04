package com.laiba.backend.controller;

import com.laiba.backend.dto.ContactRequest;
import com.laiba.backend.dto.ContactResponse;
import com.laiba.backend.service.ContactService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping("/addcontact")
    public ResponseEntity<String> createContact(@RequestBody ContactRequest contactRequest) {
        return ResponseEntity.ok(contactService.createContact(contactRequest));
    }

    @GetMapping("/getcontacts")
    public ResponseEntity<Page<ContactResponse>> getContacts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(contactService.getContacts(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContactResponse> getContactById(@PathVariable Long id) {
        return ResponseEntity.ok(contactService.getContactById(id));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<String> updateContact(
            @PathVariable Long id,
            @RequestBody ContactRequest contactRequest) {
        return ResponseEntity.ok(contactService.updateContact(id, contactRequest));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteContact(@PathVariable Long id) {
        return ResponseEntity.ok(contactService.deleteContact(id));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ContactResponse>> getContactsByName(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(contactService.getContactsByName(name, page, size));
    }
}