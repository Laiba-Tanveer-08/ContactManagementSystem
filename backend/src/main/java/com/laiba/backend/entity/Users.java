package com.laiba.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private long userId;
    @Column(name = "f_name", nullable = false)
    private String firstName;
    @Column(name = "l_name", nullable = false)
    private String lastName;
    @Column(name = "email_address", nullable = true, unique = true)
    private String email;
    @Column(name = "phone_number", nullable = true, unique = true)
    private String phoneNo;
    @Column(name = "password", nullable = false)
    private String password;
}
 
         
         
