package com.example.sky.common;

import com.example.sky.exception.BusinessException;

public final class AuthTokenUtil {
    private AuthTokenUtil() {
    }

    public static String resolveBearerToken(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new BusinessException(401, "未登录或令牌已失效，请重新登录");
        }
        return authorization.substring(7);
    }
}
