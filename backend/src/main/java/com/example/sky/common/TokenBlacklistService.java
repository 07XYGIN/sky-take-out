package com.example.sky.common;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.concurrent.TimeUnit;

/**
 * 使用 Redis 保存已退出的 Token，过期时间与 JWT 剩余有效期保持一致。
 */
@Component
@RequiredArgsConstructor
public class TokenBlacklistService {
    private static final String KEY_PREFIX = "employee:token:blacklist:";

    private final RedisUtil redisUtil;
    private final JwtUtil jwtUtil;

    public void invalidate(String token) {
        redisUtil.set(
                buildKey(token),
                Boolean.TRUE,
                jwtUtil.getRemainingTimeMillis(token),
                TimeUnit.MILLISECONDS
        );
    }

    public boolean isInvalid(String token) {
        return redisUtil.hasKey(buildKey(token));
    }

    private String buildKey(String token) {
        return KEY_PREFIX + sha256(token);
    }

    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("无法初始化Token摘要算法", e);
        }
    }
}
