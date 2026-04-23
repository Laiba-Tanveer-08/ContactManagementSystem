package com.laiba.backend.entity;
import jakarta.persistence.*;
import lombok.*;
@Entity
@Table(name="contact_info")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContactInfo {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private long infoId;
    @Column(name="phone_number", nullable=true)
    private String phoneNo;
    @Column(name="p_label", nullable = false)
    private String pLabel;
    @Column(name="email_address", nullable=true)
    private String email;
    @Column(name="e_label", nullable=false)
    private String eLabel;
}