package lk.ijse.gdse72.yummygobackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.sql.Timestamp;
import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(name = "business")
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
    private String openTime;
    private String closeTime;
    private String openOrClose; // "Open" or "Close"
    private String businessDescription;
    private String businessStatus;

    @ManyToOne
    @JoinColumn(name = "id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "business", cascade = CascadeType.ALL)
    private List<Item> items;

    private Timestamp createdAt;
    private Timestamp updatedAt;
}
