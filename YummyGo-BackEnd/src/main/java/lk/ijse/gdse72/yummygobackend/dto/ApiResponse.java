package lk.ijse.practiseproject.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * @author Dusan
 * @date 7/21/2025
 */

@Data
@AllArgsConstructor
public class ApiResponse {
    private int code;
    private String status;
    private Object data;
}