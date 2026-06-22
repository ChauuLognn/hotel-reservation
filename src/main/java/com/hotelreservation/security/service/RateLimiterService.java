package com.hotelreservation.security.service;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Dịch vụ giới hạn tần suất yêu cầu (Rate Limiting) để chống brute-force
 * Giới hạn tối đa 5 yêu cầu trong vòng 1 phút cho mỗi định danh (IP/Account).
 */
@Service
public class RateLimiterService {
    private static final int MAX_ATTEMPTS = 5;
    private static final long TIME_WINDOW_MS = 60000; // 1 phút

    private final ConcurrentHashMap<String, Attempt> cache = new ConcurrentHashMap<>();

    private static class Attempt {
        final AtomicInteger count = new AtomicInteger(0);
        volatile long resetTime;

        Attempt(long resetTime) {
            this.resetTime = resetTime;
        }
    }

    /**
     * Kiểm tra xem định danh (IP/Account) có vượt quá giới hạn tần suất hay không.
     * Tự động tăng số lần đếm nếu chưa bị chặn.
     *
     * @param key IP hoặc tên tài khoản cần kiểm tra
     * @return true nếu bị chặn (vượt quá giới hạn), false nếu hợp lệ
     */
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

    /**
     * Reset số lần đếm sau khi đăng nhập thành công.
     */
    public void reset(String key) {
        cache.remove(key);
    }
}
