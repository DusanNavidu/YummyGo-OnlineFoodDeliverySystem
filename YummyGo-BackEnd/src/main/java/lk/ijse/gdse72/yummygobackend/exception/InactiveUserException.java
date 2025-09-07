package lk.ijse.gdse72.yummygobackend.exception;

/**
 * @author Dusan
 * @date 9/7/2025
 */

public class InactiveUserException extends RuntimeException {
    public InactiveUserException(String message) {
        super(message);
    }
}
