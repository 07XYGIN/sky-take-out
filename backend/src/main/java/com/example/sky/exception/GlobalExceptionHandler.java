package com.example.corelearning.exception;

import com.example.corelearning.common.Result;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Log4j2
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(Exception.class)
    public Result<Void> handleException(Exception e) {
        log.error("服务器内部错误：{}", e.getMessage(), e);
        return Result.fail(500, "服务器内部错误：" + e.getMessage());
    }

    @ExceptionHandler(BusinessException.class)
    public Result<Void> BusinessError(BusinessException e){
        log.warn("业务异常：{}", e.getMessage());
        return Result.fail(e.getCode(),e.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<Void> handleValidException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldError().getDefaultMessage();
        log.warn("参数校验失败：{}", message);
        return Result.fail(422, message);
    }
}
