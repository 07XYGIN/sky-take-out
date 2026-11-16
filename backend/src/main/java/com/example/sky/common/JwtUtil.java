package com.example.sky.common;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Locator;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret-key}")
    private String secretKey;

    @Value("${jwt.expire-time}")
    private long expireTime;

    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String sub) {
        return Jwts.builder()
                .subject(sub)
                .claim("platform", "web")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expireTime))
                .signWith(getKey())
                .compact();
    }

    public String generateToken(String sub,String value) {
        /* 重载 将小程序和后台分开 */
        return Jwts.builder()
                .subject(sub)
                .claim("platform", value)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expireTime))
                .signWith(getKey())
                .compact();
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getKey()) // 用密钥校验签名
                .build()
                .parseSignedClaims(token) // 解析并验证 token
                .getPayload();
    }
/**
 * 拿到用户名
 * */
    public String getUsernameFromToken(String token) {
        return parseClaims(token).getSubject();
    }


    /**
     * 从 Token 中取出平台标识（"web" / "miniapp"）
     */
    public String getPlatformFromToken(String token) {
        return parseClaims(token).get("platform", String.class);
    }


    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(getKey()).build().parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public long getRemainingTimeMillis(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return Math.max(1000L, claims.getExpiration().getTime() - System.currentTimeMillis());
    }
}
