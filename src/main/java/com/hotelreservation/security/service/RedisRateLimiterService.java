package com.hotelreservation.security.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import java.util.concurrent.TimeUnit;

/**
 * Redis-based implementation of RateLimiterService.
 * Enabled only when app.rate-limiting.type=redis is set in properties.
 */
@Service
@ConditionalOnProperty(name = "app.rate-limiting.type", havingValue = "redis")
public class RedisRateLimiterService implements RateLimiterService {
    private static final int MAX_ATTEMPTS = 5;
    private static final long TIME_WINDOW_MINUTES = 1;

    @Autowired(required = false)
    private StringRedisTemplate redisTemplate;

    @Override
    public boolean isBlocked(String key) {
        if (redisTemplate == null) {
            System.err.println("[RedisRateLimiter] RedisTemplate is not configured. Falling back to ALLOW.");
            return false;
        }

        String redisKey = "rate_limit:" + key;
        try {
            Long count = redisTemplate.opsForValue().increment(redisKey);
            if (count != null && count == 1) {
                redisTemplate.expire(redisKey, TIME_WINDOW_MINUTES, TimeUnit.MINUTES);
            }
            return count != null && count > MAX_ATTEMPTS;
        } catch (Exception e) {
            System.err.println("[RedisRateLimiter] Error communicating with Redis: " + e.getMessage());
            return false; // Fail-open: do not block users if Redis is down
        }
    }

    @Override
    public void reset(String key) {
        if (redisTemplate == null) {
            return;
        }
        String redisKey = "rate_limit:" + key;
        try {
            redisTemplate.delete(redisKey);
        } catch (Exception e) {
            System.err.println("[RedisRateLimiter] Error deleting key from Redis: " + e.getMessage());
        }
    }
}
