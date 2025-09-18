package lk.ijse.gdse72.yummygobackend.service.impl;

import lk.ijse.gdse72.yummygobackend.dto.OrderItemDTO;
import lk.ijse.gdse72.yummygobackend.dto.OrdersDTO;
import lk.ijse.gdse72.yummygobackend.entity.*;
import lk.ijse.gdse72.yummygobackend.repository.BusinessRepository;
import lk.ijse.gdse72.yummygobackend.repository.ItemRepository;
import lk.ijse.gdse72.yummygobackend.repository.OrdersRepository;
import lk.ijse.gdse72.yummygobackend.repository.UserRepository;
import lk.ijse.gdse72.yummygobackend.service.OrdersService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrdersServiceImpl implements OrdersService {

    private final OrdersRepository ordersRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;

    @Override
    @Transactional
    public void placeOrder(OrdersDTO ordersDTO) {
        if (ordersDTO == null || ordersDTO.getItems() == null || ordersDTO.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order details or items cannot be null/empty");
        }

        User user = userRepository.findById(ordersDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + ordersDTO.getUserId()));

        Business business = businessRepository.findById(ordersDTO.getBusinessId())
                .orElseThrow(() -> new RuntimeException("Business not found with id: " + ordersDTO.getBusinessId()));

        Orders order = Orders.builder()
                .orderId(ordersDTO.getOrderId())
                .user(user)
                .business(business)
                .subTotal(String.valueOf(ordersDTO.getSubTotal()))
                .status(String.valueOf(ordersDTO.getStatus()))
                .contactPartner(String.valueOf(ordersDTO.getContactPartner()))
                .deliveryFee(String.valueOf(ordersDTO.getDeliveryFee()))
                .total(String.valueOf(ordersDTO.getTotal()))
                .createdAt(new Timestamp(System.currentTimeMillis()))
                .updatedAt(new Timestamp(System.currentTimeMillis()))
                .build();

        List<OrderDetails> orderDetailsList = new ArrayList<>();
        for (OrderItemDTO itemDTO : ordersDTO.getItems()) {
            Item item = itemRepository.findById(itemDTO.getItemId())
                    .orElseThrow(() -> new RuntimeException("Item not found with id: " + itemDTO.getItemId()));

            OrderDetails orderDetails = OrderDetails.builder()
                    .orderDetailsID(new OrderDetailsID(order.getOrderId(), item.getItemId()))
                    .orders(order)
                    .item(item)
                    .quantity(itemDTO.getQuantity())
                    .price(itemDTO.getPrice())
                    .build();

            orderDetailsList.add(orderDetails);
        }

        order.setOrderDetailsList(orderDetailsList);

        ordersRepository.save(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrdersDTO> getAllThisBusinessOrders(Long businessId) {
        List<Orders> ordersList = ordersRepository.findBusinessOrdersDesc(businessId);
        List<OrdersDTO> dtos = new ArrayList<>();

        for (Orders order : ordersList) {
            if (order.getPayment() == null) continue;

            List<OrderItemDTO> items = new ArrayList<>();
            for (OrderDetails detail : order.getOrderDetailsList()) {
                items.add(OrderItemDTO.builder()
                        .itemId(detail.getItem().getItemId())
                        .itemName(detail.getItem().getItemName())
                        .quantity(detail.getQuantity())
                        .price(detail.getPrice())
                        .build());
            }

            OrdersDTO dto = OrdersDTO.builder()
                    .orderId(order.getOrderId())
                    .userId(order.getUser().getId())
                    .businessId(order.getBusiness().getBusinessId())
                    .subTotal(Double.valueOf(order.getSubTotal()))
                    .deliveryFee(Double.valueOf(order.getDeliveryFee()))
                    .total(Double.valueOf(order.getTotal()))
                    .contactPartner(order.getContactPartner())
                    .status(order.getStatus())
                    .orderDate(order.getCreatedAt())
                    .items(items)
                    .build();

            dtos.add(dto);
        }

        return dtos;
    }

    @Transactional
    @Override
    public void updateOrderStatus(String orderId, String status) {
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        order.setStatus(status);
        order.setUpdatedAt(new Timestamp(System.currentTimeMillis()));

        ordersRepository.save(order);
    }

    @Transactional
    @Override
    public void updateContactPartner(String orderId, String contactPartner) {
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        order.setContactPartner(contactPartner);
        order.setUpdatedAt(new Timestamp(System.currentTimeMillis()));

        ordersRepository.save(order);
    }

    @Transactional(readOnly = true)
    @Override
    public List<OrdersDTO> getAllUserOrders(Long userId) {
        List<Orders> ordersList = ordersRepository.findUserOrdersDesc(userId);
        List<OrdersDTO> dtos = new ArrayList<>();

        for (Orders order : ordersList) {
            List<OrderItemDTO> items = new ArrayList<>();
            for (OrderDetails detail : order.getOrderDetailsList()) {
                items.add(OrderItemDTO.builder()
                        .itemId(detail.getItem().getItemId())
                        .itemName(detail.getItem().getItemName())
                        .quantity(detail.getQuantity())
                        .price(detail.getPrice())
                        .build());
            }

            OrdersDTO dto = OrdersDTO.builder()
                    .orderId(order.getOrderId())
                    .userId(order.getUser().getId())
                    .businessId(order.getBusiness().getBusinessId())
                    .subTotal(Double.valueOf(order.getSubTotal()))
                    .deliveryFee(Double.valueOf(order.getDeliveryFee()))
                    .total(Double.valueOf(order.getTotal()))
                    .status(order.getStatus())
                    .orderDate(order.getCreatedAt())
                    .items(items)
                    .build();

            dtos.add(dto);
        }

        return dtos;
    }
}