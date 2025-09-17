package lk.ijse.gdse72.yummygobackend.controller;

import jakarta.validation.Valid;
import lk.ijse.gdse72.yummygobackend.dto.PaymentDTO;
import lk.ijse.gdse72.yummygobackend.service.PaymentService;
import lk.ijse.gdse72.yummygobackend.util.APIResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * @author Dusan
 * @date 9/10/2025
 */

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@CrossOrigin
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/savePayment")
    public ResponseEntity<APIResponse<String>> savePayment(@RequestBody @Valid PaymentDTO paymentDTO) {
        paymentService.savePayment(paymentDTO);
        return ResponseEntity.ok(new APIResponse<>(200, "Payment saved successfully", null));
    }
}
