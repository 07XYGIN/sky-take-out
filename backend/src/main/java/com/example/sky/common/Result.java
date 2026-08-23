package com.example.corelearning.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;


@JsonInclude(JsonInclude.Include.NON_NULL)
@Data
public class Result<T> {
    private Integer code;
    private String msg;
    private T data;

    public static <T> Result<T> success(T data) {
        Result<T> result = new Result<>();
        result.setCode(200);
        result.setMsg("操作成功");
        result.setData(data);
        return result;
    }

    public static <T> Result<T> fail(Integer code, String msg) {
        Result<T> result = new Result<>();
        result.setCode(code);
        result.setMsg(msg);
        return result;
    }
    public static <T> Result<T> ok() {
        Result<T> result = new Result<>();
        result.setCode(200);
        result.setMsg("操作成功");
        return result;
    }
}