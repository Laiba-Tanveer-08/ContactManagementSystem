package com.laiba.backend.controller;

import com.laiba.backend.dto.ContactRequest;
import com.laiba.backend.dto.ContactResponse;
import com.laiba.backend.service.ContactService;
import com.laiba.backend.service.JWTService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SuppressWarnings("SpringJavaInjectionPointsAutowiringInspection")
@WebMvcTest(ContactController.class)
@WithMockUser
class ContactControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ContactService contactService;

    @MockitoBean
    private JWTService jwtService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createContact_returnsSuccess() throws Exception {
        ContactRequest request = new ContactRequest();
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setTitle("Mr");

        when(contactService.createContact(any(ContactRequest.class))).thenReturn("Contact created successfully");

        mockMvc.perform(post("/api/contact/addcontact")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("Contact created successfully"));
    }

    @Test
    void getContacts_returnsPage() throws Exception {
        ContactResponse response = new ContactResponse(1L, "John", "Doe", "Mr", null);
        when(contactService.getContacts(0, 10)).thenReturn(new PageImpl<>(List.of(response)));

        mockMvc.perform(get("/api/contact/getcontacts")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].firstName").value("John"))
                .andExpect(jsonPath("$.content[0].lastName").value("Doe"));
    }

    @Test
    void getContactById_returnsContact() throws Exception {
        ContactResponse response = new ContactResponse(1L, "John", "Doe", "Mr", null);
        when(contactService.getContactById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/contact/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void updateContact_returnsSuccess() throws Exception {
        ContactRequest request = new ContactRequest();
        request.setFirstName("Jane");
        request.setLastName("Doe");

        when(contactService.updateContact(eq(1L), any(ContactRequest.class))).thenReturn("Contact updated successfully");

        mockMvc.perform(put("/api/contact/update/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("Contact updated successfully"));
    }

    @Test
    void deleteContact_returnsSuccess() throws Exception {
        when(contactService.deleteContact(1L)).thenReturn("Contact deleted successfully");

        mockMvc.perform(delete("/api/contact/delete/1").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().string("Contact deleted successfully"));
    }

    @Test
    void searchContacts_returnsMatchingPage() throws Exception {
        ContactResponse response = new ContactResponse(1L, "John", "Doe", "Mr", null);
        when(contactService.getContactsByName("John", 0, 10))
                .thenReturn(new PageImpl<>(List.of(response)));

        mockMvc.perform(get("/api/contact/search")
                        .param("name", "John")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].firstName").value("John"));
    }
}