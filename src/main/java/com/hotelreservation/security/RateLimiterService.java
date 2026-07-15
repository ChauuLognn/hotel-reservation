package com.hotelreservation.security;

/**
 * Interface defining the rate limiting contract.
 */
public interface RateLimiterService {
    /**
     * Checks if the given key (IP/Account) has exceeded the rate limit.
     * Tuts up the counter if not blocked.
     *
     * @param key IP or account identifier
     * @return true if blocked, false if allowed
     */
    boolean isBlocked(String key);

    /**
     * Resets the attempt count for the given key.
     *
     * @param key IP or account identifier
     */
    void reset(String key);
}
