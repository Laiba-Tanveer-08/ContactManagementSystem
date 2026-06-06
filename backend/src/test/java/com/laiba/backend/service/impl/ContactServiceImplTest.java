package com.laiba.backend.service.impl;

import com.laiba.backend.dto.ContactInfoRequest;
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
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContactServiceImplTest {

    @Mock private ContactRepository contactRepository;
    @Mock private ContactMapper contactMapper;
    @Mock private UserRepository userRepository;
    @Mock private ContactInfoMapper contactInfoMapper;

    @InjectMocks
    private ContactServiceImpl contactService;

    private Users mockUser;
    private Contacts mockContact;
    private ContactRequest mockRequest;
    private ContactResponse mockResponse;

    @BeforeEach
    void setUp() {
        mockUser = new Users();
        mockUser.setUserId(1L);
        mockUser.setEmail("test@example.com");

        mockContact = new Contacts();
        mockContact.setContactId(1L);
        mockContact.setFirstName("John");
        mockContact.setLastName("Doe");
        mockContact.setTitle("Mr");
        mockContact.setUser(mockUser);
        mockContact.setContactInfos(new ArrayList<>());

        mockRequest = new ContactRequest();
        mockRequest.setFirstName("John");
        mockRequest.setLastName("Doe");
        mockRequest.setTitle("Mr");

        mockResponse = new ContactResponse();
        mockResponse.setId(1L);
        mockResponse.setFirstName("John");
        mockResponse.setLastName("Doe");

        // Use lenient so tests that override the context don't trigger UnnecessaryStubbingException
        mockSecurityContextLenient("test@example.com");
        lenient().when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // Lenient variant used in setUp so tests that replace the context don't cause UnnecessaryStubbingException
    private void mockSecurityContextLenient(String identifier) {
        Authentication auth = mock(Authentication.class);
        SecurityContext ctx = mock(SecurityContext.class);
        lenient().when(ctx.getAuthentication()).thenReturn(auth);
        lenient().when(auth.getName()).thenReturn(identifier);
        SecurityContextHolder.setContext(ctx);
    }

    // Strict variant used inside individual tests where every stub must be consumed
    private void mockSecurityContextStrict(String identifier) {
        Authentication auth = mock(Authentication.class);
        SecurityContext ctx = mock(SecurityContext.class);
        when(ctx.getAuthentication()).thenReturn(auth);
        when(auth.getName()).thenReturn(identifier);
        SecurityContextHolder.setContext(ctx);
    }

    //    getCurrentUser — null authentication object branch 

    @Test
    void getCurrentUser_nullAuthenticationObject_throwsAuthenticationException() {
        // The entire authentication object is null, not just the name
        SecurityContext ctx = mock(SecurityContext.class);
        when(ctx.getAuthentication()).thenReturn(null);
        SecurityContextHolder.setContext(ctx);

        assertThrows(AuthenticationException.class,
                () -> contactService.createContact(mockRequest));
    }

    //    getCurrentUser — null identifier branch 

    @Test
    void getCurrentUser_nullIdentifier_throwsAuthenticationException() {
        Authentication auth = mock(Authentication.class);
        SecurityContext ctx = mock(SecurityContext.class);
        when(ctx.getAuthentication()).thenReturn(auth);
        when(auth.getName()).thenReturn(null);
        SecurityContextHolder.setContext(ctx);

        assertThrows(AuthenticationException.class,
                () -> contactService.createContact(mockRequest));
    }

    //    getCurrentUser — phone branch 

    @Test
    void createContact_phoneUser_resolvesCorrectly() {
        Users phoneUser = new Users();
        phoneUser.setUserId(3L);
        phoneUser.setPhoneNo("03001234567");

        mockSecurityContextStrict("03001234567");
        when(userRepository.findByPhoneNo("03001234567")).thenReturn(Optional.of(phoneUser));

        Contacts phoneContact = new Contacts();
        phoneContact.setContactInfos(new ArrayList<>());
        when(contactMapper.toEntity(mockRequest)).thenReturn(phoneContact);

        String result = contactService.createContact(mockRequest);

        assertEquals("Contact created successfully", result);
        verify(contactRepository).save(phoneContact);
    }

    @Test
    void getCurrentUser_phoneUserNotFound_throwsUserNotFoundException() {
        mockSecurityContextStrict("03009999999");
        when(userRepository.findByPhoneNo("03009999999")).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class,
                () -> contactService.createContact(mockRequest));
    }

    @Test
    void getCurrentUser_emailUserNotFound_throwsUserNotFoundException() {
        mockSecurityContextStrict("nobody@example.com");
        when(userRepository.findByEmail("nobody@example.com")).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class,
                () -> contactService.createContact(mockRequest));
    }

    //    createContact 

    @Test
    void createContact_success_returnsSuccessMessage() {
        when(contactMapper.toEntity(mockRequest)).thenReturn(mockContact);

        assertEquals("Contact created successfully", contactService.createContact(mockRequest));
        verify(contactRepository).save(mockContact);
    }

    @Test
    void createContact_withContactInfos_savesInfosCorrectly() {
        ContactInfoRequest infoRequest = new ContactInfoRequest();
        infoRequest.setValue("john@work.com");
        infoRequest.setType("EMAIL");
        infoRequest.setLabel("WORK");
        mockRequest.setContactInfos(List.of(infoRequest));

        ContactInfo mockInfo = new ContactInfo();
        when(contactMapper.toEntity(mockRequest)).thenReturn(mockContact);
        when(contactInfoMapper.toEntity(infoRequest)).thenReturn(mockInfo);

        assertEquals("Contact created successfully", contactService.createContact(mockRequest));
        verify(contactRepository).save(mockContact);
        assertEquals(mockContact, mockInfo.getContact());
    }

    @Test
    void createContact_nullContactInfos_savesWithoutInfos() {
        mockRequest.setContactInfos(null);
        when(contactMapper.toEntity(mockRequest)).thenReturn(mockContact);

        assertEquals("Contact created successfully", contactService.createContact(mockRequest));
        verify(contactRepository).save(mockContact);
        assertTrue(mockContact.getContactInfos().isEmpty());
    }

    //    getContacts  

    @Test
    void getContacts_success_returnsPagedResults() {
        Page<Contacts> page = new PageImpl<>(List.of(mockContact));
        when(contactRepository.findByUser(eq(mockUser), any(Pageable.class))).thenReturn(page);
        when(contactMapper.toResponse(mockContact)).thenReturn(mockResponse);

        Page<ContactResponse> result = contactService.getContacts(0, 10);

        assertEquals(1, result.getTotalElements());
        assertEquals("John", result.getContent().get(0).getFirstName());
    }

    @Test
    void getContacts_emptyList_returnsEmptyPage() {
        when(contactRepository.findByUser(eq(mockUser), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        assertEquals(0, contactService.getContacts(0, 10).getTotalElements());
    }

    //    getContactById 

    @Test
    void getContactById_success_returnsContact() {
        when(contactRepository.findById(1L)).thenReturn(Optional.of(mockContact));
        when(contactMapper.toResponse(mockContact)).thenReturn(mockResponse);

        ContactResponse result = contactService.getContactById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    @Test
    void getContactById_notFound_throwsContactNotFoundException() {
        when(contactRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ContactNotFoundException.class, () -> contactService.getContactById(99L));
    }

    @Test
    void getContactById_differentUser_throwsUnauthorizedException() {
        Users otherUser = new Users();
        otherUser.setUserId(2L);
        mockContact.setUser(otherUser);

        when(contactRepository.findById(1L)).thenReturn(Optional.of(mockContact));

        assertThrows(UnauthorizedException.class, () -> contactService.getContactById(1L));
    }

    //    updateContact 

    @Test
    void updateContact_success_updatesFieldsAndSaves() {
        when(contactRepository.findById(1L)).thenReturn(Optional.of(mockContact));

        ContactRequest updateRequest = new ContactRequest();
        updateRequest.setFirstName("Jane");
        updateRequest.setLastName("Smith");
        updateRequest.setTitle("Ms");

        assertEquals("Contact updated successfully", contactService.updateContact(1L, updateRequest));
        assertEquals("Jane", mockContact.getFirstName());
        assertEquals("Smith", mockContact.getLastName());
        assertEquals("Ms", mockContact.getTitle());
        verify(contactRepository).save(mockContact);
    }

    @Test
    void updateContact_withNewContactInfos_replacesOldInfos() {
        when(contactRepository.findById(1L)).thenReturn(Optional.of(mockContact));

        ContactInfoRequest infoReq = new ContactInfoRequest();
        infoReq.setValue("new@email.com");
        ContactRequest updateRequest = new ContactRequest();
        updateRequest.setFirstName("Jane");
        updateRequest.setContactInfos(List.of(infoReq));

        ContactInfo newInfo = new ContactInfo();
        when(contactInfoMapper.toEntity(infoReq)).thenReturn(newInfo);

        contactService.updateContact(1L, updateRequest);

        assertTrue(mockContact.getContactInfos().contains(newInfo));
    }

    @Test
    void updateContact_nullContactInfos_clearsInfos() {
        when(contactRepository.findById(1L)).thenReturn(Optional.of(mockContact));

        ContactRequest updateRequest = new ContactRequest();
        updateRequest.setFirstName("Jane");
        updateRequest.setContactInfos(null);

        contactService.updateContact(1L, updateRequest);

        assertTrue(mockContact.getContactInfos().isEmpty());
    }

    @Test
    void updateContact_notFound_throwsContactNotFoundException() {
        when(contactRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ContactNotFoundException.class,
                () -> contactService.updateContact(99L, mockRequest));
    }

    @Test
    void updateContact_differentUser_throwsUnauthorizedException() {
        Users otherUser = new Users();
        otherUser.setUserId(2L);
        mockContact.setUser(otherUser);

        when(contactRepository.findById(1L)).thenReturn(Optional.of(mockContact));

        assertThrows(UnauthorizedException.class,
                () -> contactService.updateContact(1L, mockRequest));
    }

    //    deleteContact 

    @Test
    void deleteContact_success_deletesContact() {
        when(contactRepository.findById(1L)).thenReturn(Optional.of(mockContact));

        assertEquals("Contact deleted successfully", contactService.deleteContact(1L));
        verify(contactRepository).delete(mockContact);
    }

    @Test
    void deleteContact_notFound_throwsContactNotFoundException() {
        when(contactRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ContactNotFoundException.class, () -> contactService.deleteContact(99L));
    }

    @Test
    void deleteContact_differentUser_throwsUnauthorizedException() {
        Users otherUser = new Users();
        otherUser.setUserId(2L);
        mockContact.setUser(otherUser);

        when(contactRepository.findById(1L)).thenReturn(Optional.of(mockContact));

        assertThrows(UnauthorizedException.class, () -> contactService.deleteContact(1L));
    }

    //    getContactsByName 

    @Test
    void getContactsByName_matchingFirstName_returnsResults() {
        Page<Contacts> page = new PageImpl<>(List.of(mockContact));
        when(contactRepository.searchByName(eq(mockUser), eq("John"), any(Pageable.class)))
                .thenReturn(page);
        when(contactMapper.toResponse(mockContact)).thenReturn(mockResponse);

        Page<ContactResponse> result = contactService.getContactsByName("John", 0, 10);

        assertEquals(1, result.getTotalElements());
    }

    @Test
    void getContactsByName_noMatch_returnsEmptyPage() {
        when(contactRepository.searchByName(eq(mockUser), eq("xyz"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        assertEquals(0, contactService.getContactsByName("xyz", 0, 10).getTotalElements());
    }
}