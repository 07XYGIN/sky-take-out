package com.example.corelearning.common;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;

import java.util.concurrent.TimeUnit;

@Component
public class RedisUtil {

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private JsonMapper jsonMapper;
    public void set(String key, Object value, long timeout, TimeUnit unit) {
        String json = jsonMapper.writeValueAsString(value);
        redisTemplate.opsForValue().set(key, json, timeout, unit);
    }

    public <T> T get(String key, Class<T> clazz) {
        String json = redisTemplate.opsForValue().get(key);
        if (json == null) {
            return null;
        }
        return jsonMapper.readValue(json, clazz);
    }

    public void delete(String key) {
        redisTemplate.delete(key);
    }

    public boolean hasKey(String key) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }
}