package com.ecommerce.sportscenter.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "AppUser",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_app_user_username", columnNames = "Username"),
                @UniqueConstraint(name = "uk_app_user_email", columnNames = "Email")
        }
)
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Long id;

    @Column(name = "Username", nullable = false, length = 50)
    private String username;

    @Column(name = "Email", nullable = false, length = 255)
    private String email;

    @Column(name = "PasswordHash", nullable = false, length = 255)
    private String password;

    @Column(name = "RoleName", nullable = false, length = 50)
    private String role;
}
