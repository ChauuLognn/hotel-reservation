package com.hotelreservation.config;

import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI hotelReservationOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Hotel Reservation Premium API")
                        .version("v1")
                        .description("REST API documentation for Hotel Reservation Premium."));
    }

    @Bean
    public GroupedOpenApi hotelReservationApiGroup() {
        return GroupedOpenApi.builder()
                .group("hotel-reservation-premium")
                .packagesToScan("com.hotelreservation.modules")
                .pathsToMatch("/api/**")
                .build();
    }
}
