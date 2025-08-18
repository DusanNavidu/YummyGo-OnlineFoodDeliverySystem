package lk.ijse.gdse72.yummygobackend.exception;

import io.jsonwebtoken.ExpiredJwtException;
import lk.ijse.gdse72.yummygobackend.dto.ApiResponse;
import lk.ijse.gdse72.yummygobackend.util.APIResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // handle all exceptions
    @ExceptionHandler(Exception.class)
    public ResponseEntity<APIResponse<String>> HandleException(Exception e) {
        return new ResponseEntity<>(new APIResponse<>(500, e.getMessage(), null), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // handle resource not found exception
    @ExceptionHandler(ResourceNotFound.class)
    public ResponseEntity<APIResponse<String>> HandleResourceNotFoundException(ResourceNotFound e) {
        return new ResponseEntity<>(new APIResponse<>(404, e.getMessage(), null), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<APIResponse<Object>> handleValidationExceptions(MethodArgumentNotValidException e) {
        Map<String, String> errors = new HashMap<>();
        e.getBindingResult().getFieldErrors().forEach(error -> {
            errors.put(error.getField(), error.getDefaultMessage());
        });
        return new ResponseEntity<>(new APIResponse<>(400, "Validation Failed", errors), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiResponse handleUsernameNotFoundException
            (UsernameNotFoundException ex) {
        return new ApiResponse(
                404,
                "User Not Fount",
                ex.getMessage());
    }
    @ExceptionHandler(BadCredentialsException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ApiResponse handleBadCredentialsException
            (BadCredentialsException ex) {
        return new ApiResponse(401,
                "Unauthorized",
                "Invalid username or password");
    }
    @ExceptionHandler(ExpiredJwtException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ApiResponse handleExpiredJwtException
            (ExpiredJwtException ex) {
        return new ApiResponse(401,
                "Unauthorized",
                "Expired JWT Token");
    }

    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse handleRuntimeException
            (RuntimeException ex) {
        return new ApiResponse(500,
                "Internal Server Error",
                ex.getMessage());
    }
}