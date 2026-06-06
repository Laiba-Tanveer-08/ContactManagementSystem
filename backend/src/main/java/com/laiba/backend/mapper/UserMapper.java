package com.laiba.backend.mapper;

import com.laiba.backend.dto.RegisterRequest;
import com.laiba.backend.entity.Users;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    // Password and contact fields are set separately after encoding
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "phoneNo", ignore = true)
    Users toEntity(RegisterRequest registerRequest);
}