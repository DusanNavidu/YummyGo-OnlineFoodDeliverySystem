package lk.ijse.gdse72.yummygobackend.servicce.impl;

import lk.ijse.gdse72.yummygobackend.dto.PaymentDTO;
import lk.ijse.gdse72.yummygobackend.entity.Orders;
import lk.ijse.gdse72.yummygobackend.entity.Payment;
import lk.ijse.gdse72.yummygobackend.repository.OrdersRepository;
import lk.ijse.gdse72.yummygobackend.repository.PaymentRepository;
import lk.ijse.gdse72.yummygobackend.servicce.PaymentService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

/**
 * @author Dusan
 * @date 9/10/2025
 */

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final ModelMapper modelMapper;
    private final OrdersRepository ordersRepository;

    @Override
    public void savePayment(PaymentDTO paymentDTO) {
        if (paymentDTO.getPaymentStatus() == null) {
            paymentDTO.setPaymentStatus("Pending");
        }
        Payment payment = modelMapper.map(paymentDTO, Payment.class);
        payment.setCreatedAt(new java.sql.Timestamp(System.currentTimeMillis()));

        if (paymentDTO.getOrderId() != null) {
            Orders orders = ordersRepository.findById(paymentDTO.getOrderId())
                    .orElseThrow(() -> new RuntimeException("Order not found with ID: " + paymentDTO.getOrderId()));
            payment.setOrders(orders);
        } else {
            throw new RuntimeException("Order ID is required to create a payment");
        }
        paymentRepository.save(payment);
    }
}