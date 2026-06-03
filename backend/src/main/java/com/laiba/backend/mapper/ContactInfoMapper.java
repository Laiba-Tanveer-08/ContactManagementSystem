package com.laiba.backend.mapper;

import com.laiba.backend.dto.ContactInfoRequest;
import com.laiba.backend.entity.ContactInfo;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ContactInfoMapper {
    @Mapping(target = "contact", ignore = true)
    ContactInfo toEntity(ContactInfoRequest contactInfoRequest);
    ContactInfoRequest toDto(ContactInfo contactInfo);
}
