package com.laiba.backend.mapper;

import com.laiba.backend.dto.ContactRequest;
import com.laiba.backend.dto.ContactResponse;
import com.laiba.backend.entity.Contacts;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {ContactInfoMapper.class})
public interface ContactMapper {

    // User and contactInfos are handled separately in the service
    @Mapping(target = "contactInfos", ignore = true)
    @Mapping(target = "user", ignore = true)
    Contacts toEntity(ContactRequest contactRequest);

    ContactRequest toDto(Contacts contacts);

    @Mapping(target = "id", source = "contactId")
    @Mapping(target = "contactInfos", source = "contactInfos")
    ContactResponse toResponse(Contacts contact);
}