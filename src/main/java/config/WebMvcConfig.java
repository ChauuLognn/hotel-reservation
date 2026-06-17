package config;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/**
 * Web MVC Configuration
 * Cấu hình để serve static files (HTML, CSS, JS) từ thư mục frontend
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // Get absolute path to frontend directory
        String frontendPath = Paths.get("frontend").toAbsolutePath().toUri().toString();
        
        // Serve frontend files from /frontend/** URL pattern
        registry.addResourceHandler("/frontend/**")
                .addResourceLocations(frontendPath)
                .setCachePeriod(0); // Disable cache for development
        
        // Also serve from classpath static folder (if you move files there later)
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(3600); // Cache for 1 hour
    }

    @Override
    public void addViewControllers(@NonNull ViewControllerRegistry registry) {
        // Optional: Add default redirects
        // registry.addRedirectViewController("/", "/frontend/index.html");
    }

    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        registry.addMapping("/**")  // Áp dụng cho tất cả endpoints
                .allowedOriginPatterns("*")  // Cho phép mọi origin pattern (hỗ trợ credentials)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD")
                .allowedHeaders("*")
                .allowCredentials(true)  // Cho phép credentials (cookies, authorization)
                .exposedHeaders("Authorization", "Content-Type")
                .maxAge(3600);  // Cache preflight request trong 1 giờ
    }

}
