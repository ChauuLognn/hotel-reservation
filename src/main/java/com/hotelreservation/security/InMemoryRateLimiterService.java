package com.hotelreservation.security;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * In-memory implementation of RateLimiterService using ConcurrentHashMap.
 */
@Service
@ConditionalOnProperty(name = "app.rate-limiting.type", havingValue = "memory", matchIfMissing = true)
public class InMemoryRateLimiterService implements RateLimiterService {
    private static final int MAX_ATTEMPTS = 5;
    private static final long TIME_WINDOW_MS = 60000; // 1 minute

    private final ConcurrentHashMap<String, Attempt> cache = new ConcurrentHashMap<>();

    private static class Attempt {
        final AtomicInteger count = new AtomicInteger(0);
        volatile long resetTime;

        Attempt(long resetTime) {
            this.resetTime = resetTime;
        }
    }

    @Override
    public boolean isBlocked(String key) {
        long now = System.currentTimeMillis();
        Attempt attempt = cache.compute(key, (k, existing) -> {
            if (existing == null || now > existing.resetTime) {
                Attempt newAttempt = new Attempt(now + TIME_WINDOW_MS);
                newAttempt.count.set(1);
                return newAttempt;
            } else {
                existing.count.incrementAndGet();
                return existing;
            }
        });

        return attempt.count.get() > MAX_ATTEMPTS;
    }

    @Override
    public void reset(String key) {
        cache.remove(key);
    }
}
