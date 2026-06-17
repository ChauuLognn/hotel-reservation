package security;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

/**
 * JWT Utility Class
 * 
 * Chức năng:
 * 1. Generate JWT token từ username
 * 2. Validate JWT token
 * 3. Extract thông tin từ token (username, expiration)
 * 
 * Token format: eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTYzOTk5OTk5OX0.signature
 *                ↑ HEADER          ↑ PAYLOAD (username, exp)           ↑ SIGNATURE
 */
@Component
public class JwtUtil {

    // Secret key để ký token (256-bit cho HS256)
    // QUAN TRỌNG: Trong production, lưu trong environment variable, KHÔNG commit vào git
    @Value("${jwt.secret:hotel_reservation_secret_key_2024_very_long_and_secure_at_least_256_bits}")
    private String SECRET_KEY;

    // Token hết hạn sau 24 giờ (milliseconds)
    @Value("${jwt.expiration:86400000}")
    private Long EXPIRATION_TIME;

    /**
     * Lấy signing key từ SECRET_KEY
     */
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    /**
     * GENERATE TOKEN
     * 
     * Tạo JWT token từ username
     * 
     * @param username - Account của user
     * @return JWT token string
     */
    public String generateToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, username);
    }

    /**
     * CREATE TOKEN với claims
     */
    private String createToken(Map<String, Object> claims, String subject) {
        Date now = new Date();
        Date expirationDate = new Date(now.getTime() + EXPIRATION_TIME);

        return Jwts.builder()
                .claims(claims)                          // Payload: custom data
                .subject(subject)                        // Payload: username
                .issuedAt(now)                          // Payload: thời gian tạo
                .expiration(expirationDate)             // Payload: thời gian hết hạn
                .signWith(getSigningKey())              // Signature: ký với secret key
                .compact();                              // Build thành string
    }

    /**
     * VALIDATE TOKEN
     * 
     * Kiểm tra token có hợp lệ không:
     * 1. Signature đúng (không bị giả mạo)
     * 2. Chưa hết hạn
     * 3. Username khớp với user hiện tại
     * 
     * @param token - JWT token
     * @param username - Username để so sánh
     * @return true nếu token hợp lệ
     */
    public Boolean validateToken(String token, String username) {
        try {
            final String tokenUsername = extractUsername(token);
            return (tokenUsername.equals(username) && !isTokenExpired(token));
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * EXTRACT USERNAME từ token
     */
    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    /**
     * EXTRACT EXPIRATION DATE từ token
     */
    public Date extractExpiration(String token) {
        return extractAllClaims(token).getExpiration();
    }

    /**
     * EXTRACT ALL CLAIMS (payload data)
     */
    private Claims extractAllClaims(String token) {
        SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
        return Jwts.parser()
                .verifyWith(key)                        // Verify signature
                .build()
                .parseSignedClaims(token)               // Parse token
                .getPayload();                          // Get payload (claims)
    }

    /**
     * CHECK nếu token đã hết hạn
     */
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * GET EXPIRATION TIME (cho frontend biết)
     */
    public Long getExpirationTime() {
        return EXPIRATION_TIME;
    }
}