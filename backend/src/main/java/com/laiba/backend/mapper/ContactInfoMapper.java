package com.laiba.backend.mapper;

import com.laiba.backend.dto.ContactInfoRequest;
import com.laiba.backend.entity.ContactInfo;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ContactInfoMapper {

    // Contact is set manually in the service, so we skip it here
    @Mapping(target = "contact", ignore = true)
    ContactInfo toEntity(ContactInfoRequest contactInfoRequest);

    ContactInfoRequest toDto(ContactInfo contactInfo);
}