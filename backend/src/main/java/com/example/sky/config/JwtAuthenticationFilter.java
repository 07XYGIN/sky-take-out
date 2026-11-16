package com.example.sky.config;

import com.example.sky.common.JwtUtil;
import com.example.sky.common.TokenBlacklistService;
import com.example.sky.mapper.EmployeeMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final TokenBlacklistService tokenBlacklistService;
    private final EmployeeMapper employeeMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response); //无 Token 时直接放行
            return;
        }

        String token = authHeader.substring(7);

        if (jwtUtil.validateToken(token) && !tokenBlacklistService.isInvalid(token)) // 如果token在有效期内且没有在黑名单
        {
            String platform = jwtUtil.getPlatformFromToken(token);

            // 按请求路径区分小程序端与管理端
            String uri = request.getRequestURI();
            if (uri.startsWith("/api/miniapp/")) {
                // 小程序端： platform == "miniapp"
                if ("miniapp".equals(platform)) {
                    // 拿到用户名
                    String username = jwtUtil.getUsernameFromToken(token);
                    // 创建认证对象
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(username, null, Collections.emptyList());
                    // 设置认证信息
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } else {
                // 管理端：platform == "web" 且 员工启用
                if ("web".equals(platform) && isEmployeeEnabled(token)) {
                    String username = jwtUtil.getUsernameFromToken(token);
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(username, null, Collections.emptyList());
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }

        }

        filterChain.doFilter(request, response);
    }

    private boolean isEmployeeEnabled(String token) {
        String username = jwtUtil.getUsernameFromToken(token);
        return Integer.valueOf(1).equals(employeeMapper.findStatusByUsername(username));
    }
}
