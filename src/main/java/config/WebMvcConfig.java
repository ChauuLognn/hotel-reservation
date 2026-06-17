package config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/**
 * Web MVC Configuration
 * Cấu hình để serve static files (HTML, CSS, JS) từ thư mục frontend-react
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        String frontendPath = Paths.get("frontend-react").toAbsolutePath().toUri().toString();

        registry.addResourceHandler("/frontend/**")
                .addResourceLocations(frontendPath + "/")
                .setCachePeriod(0);

        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(3600);
    }

    @Override
    public void addViewControllers(@NonNull ViewControllerRegistry registry) {
        // Optional: Add default redirects
        // registry.addRedirectViewController("/", "/frontend/index.html");
    }

    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD")
                .allowedHeaders(
                    "Authorization",
                    "Content-Type",
                    "X-User-Id",
                    "X-User_id",
                    "Accept",
                    "Origin",
                    "X-Requested-With"
                )
                .allowCredentials(true)
                .exposedHeaders("Authorization", "Content-Type", "X-User-Id", "X-User_id")
                .maxAge(3600);
    }

}
