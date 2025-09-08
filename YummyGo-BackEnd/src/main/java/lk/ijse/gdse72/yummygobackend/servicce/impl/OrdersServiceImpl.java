package lk.ijse.gdse72.yummygobackend.servicce.impl;

import lk.ijse.gdse72.yummygobackend.dto.OrderItemDTO;
import lk.ijse.gdse72.yummygobackend.dto.OrdersDTO;
import lk.ijse.gdse72.yummygobackend.entity.Item;
import lk.ijse.gdse72.yummygobackend.entity.OrderDetails;
import lk.ijse.gdse72.yummygobackend.entity.OrderDetailsID;
import lk.ijse.gdse72.yummygobackend.entity.Orders;
import lk.ijse.gdse72.yummygobackend.repository.ItemRepository;
import lk.ijse.gdse72.yummygobackend.repository.OrdersRepository;
import lk.ijse.gdse72.yummygobackend.servicce.OrdersService;
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

    @Override
    @Transactional
    public void placeOrder(OrdersDTO ordersDTO) {
        if (ordersDTO == null || ordersDTO.getItems() == null || ordersDTO.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order details or items cannot be null/empty");
        }

        Orders order = Orders.builder()
                .userId(ordersDTO.getUserId())
                .subTotal(ordersDTO.getSubTotal())
                .deliveryFee(ordersDTO.getDeliveryFee())
                .total(ordersDTO.getTotal())
                .createdAt(new Timestamp(System.currentTimeMillis()))
                .updatedAt(new Timestamp(System.currentTimeMillis()))
                .build();

        List<OrderDetails> orderDetailsList = new ArrayList<>();

        for (OrderItemDTO itemDTO : ordersDTO.getItems()) {
            Item item = itemRepository.findById(itemDTO.getItemId())
                    .orElseThrow(() -> new RuntimeException("Item not found with id: " + itemDTO.getItemId()));

            OrderDetails orderDetails = OrderDetails.builder()
                    .orderDetailsID(new OrderDetailsID(null, item.getItemId()))
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
}
