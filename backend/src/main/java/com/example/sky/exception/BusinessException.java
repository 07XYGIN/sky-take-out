package com.example.corelearning.exception;


import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {
    private Integer code;

    public BusinessException(Integer code, String message) {
        super(message);
        this.code = code;
    }

}