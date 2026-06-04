package com.laiba.backend.mapper;

import com.laiba.backend.dto.ContactRequest;
import com.laiba.backend.dto.ContactResponse;
import com.laiba.backend.dto.RegisterRequest;
import com.laiba.backend.entity.Contacts;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;

@Mapper(componentModel = "spring", uses = {ContactInfoMapper.class})
public interface ContactMapper {
    @Mapping(target="contactInfos", ignore=true)
    @Mapping(target="user", ignore=true)
    Contacts toEntity(ContactRequest contactRequest);
    ContactRequest toDto(Contacts contacts);

    @Mapping(target = "id", source = "contactId")
    @Mapping(target = "contactInfos", source = "contactInfos")
    ContactResponse toResponse(Contacts contact);
}
