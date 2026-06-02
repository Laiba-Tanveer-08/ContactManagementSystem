package com.laiba.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "contact_info")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContactInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "info_id")
    private Long infoId;

    @Column(name = "info_value", nullable = false)
    private String value;

    @Column(name = "info_type", nullable = false)
    private String type;
    // PHONE or EMAIL

    @Column(name = "info_label", nullable = false)
    private String label;
    // WORK, HOME, PERSONAL

    @ManyToOne
    @JoinColumn(name = "contact_id", nullable = false)
    private Contacts contact;
}