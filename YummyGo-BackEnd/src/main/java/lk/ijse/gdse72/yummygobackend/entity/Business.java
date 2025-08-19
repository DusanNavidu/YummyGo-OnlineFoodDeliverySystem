package lk.ijse.gdse72.yummygobackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.sql.Timestamp;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Business {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long businessId;

    private String businessName;
    private String contactNumber1;
    private String contactNumber2;
    private String businessEmail;
    private String businessAddress;
    private String businessAreaPostalCode;
    private String businessCategory;
    private String businessLogo;
    private String businessDescription;
    private String businessStatus;

    @ManyToOne
    @JoinColumn(name = "id", nullable = false)
    private User user;

    private Timestamp createdAt;
    private Timestamp updatedAt;
}
