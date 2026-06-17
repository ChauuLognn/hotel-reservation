package security;
import modules.account.service.CustomUserDetailsService;


import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * JWT Authentication Filter
 * 
 * Filter này chạy TRƯỚC MỌI REQUEST để:
 * 1. Lấy JWT token từ Authorization header
 * 2. Validate token
 * 3. Set authentication vào SecurityContext
 * 
 * Flow:
 * Request → JwtAuthenticationFilter → Controller
 *   ↓
 *   Kiểm tra token → Nếu hợp lệ → Set authentication
 *   
 * Authorization header format: "Bearer eyJhbGciOiJIUzI1NiJ9..."
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    /**
     * Filter method - Chạy cho mỗi request
     */
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        // Lấy Authorization header
        final String authHeader = request.getHeader("Authorization");
        String username = null;
        String jwt = null;

        // Kiểm tra header có format "Bearer <token>" không
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            // Lấy token (bỏ "Bearer " prefix)
            jwt = authHeader.substring(7);
            
            try {
                // Extract username từ token
                username = jwtUtil.extractUsername(jwt);
            } catch (Exception e) {
                logger.error("Cannot extract username from JWT: " + e.getMessage());
            }
        }

        // Nếu có username và chưa authenticated
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // Load user từ database
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // Validate token
            if (jwtUtil.validateToken(jwt, userDetails.getUsername())) {
                // Token hợp lệ → Tạo authentication object
                UsernamePasswordAuthenticationToken authToken = 
                    new UsernamePasswordAuthenticationToken(
                        userDetails,                    // principal (user)
                        null,                           // credentials (không cần password)
                        userDetails.getAuthorities()    // authorities (roles)
                    );

                // Set details từ request
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Set authentication vào SecurityContext
                // Từ giờ, controller có thể lấy user info từ SecurityContextHolder
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // Chuyển request sang filter/controller tiếp theo
        filterChain.doFilter(request, response);
    }
}