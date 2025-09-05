//package lk.ijse.gdse72.yummygobackend.entity;
//
//import jakarta.persistence.Entity;
//import jakarta.persistence.GeneratedValue;
//import jakarta.persistence.Id;
//import jakarta.persistence.Table;
//import lombok.AllArgsConstructor;
//import lombok.Builder;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//
///**
// * @author Dusan
// * @date 9/4/2025
// */
//
//@Entity
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//@Builder
//@Table(name = "payment")
//public class Payment {
//    @Id
//    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
//    private Long paymentId;
//
//    private String paymentStatus; // e.g., "Paid", "Unpaid"
//    private String paymentMethod; // e.g., "Cash", "Online Payment"
//    private String rideCost;
//    private String totalAmount;
//}
