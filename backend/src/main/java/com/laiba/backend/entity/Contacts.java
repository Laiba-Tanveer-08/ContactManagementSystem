package com.laiba.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "contacts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Contacts {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long contactId;
    @Column(name = "f_name", nullable = false)
    private String firstName;
    @Column(name = "l_name", nullable = false)
    private String lastName;
    @Column(name = "title", nullable = false)
    private String title;
}