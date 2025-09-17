package lk.ijse.gdse72.yummygobackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;
    private String phoneNumber;
    private String email;
    private String username;
    private String password;
    private String userStatus; // "Active" or "Inactive"

    @Enumerated(EnumType.STRING)
    private Role role;    //   ADMIN, CLIENT, PARTNER, BUSINESS

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Business> businesses;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Orders> orders;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Vehicle vehicle;

    private Timestamp createdAt;
    private Timestamp updatedAt;
}