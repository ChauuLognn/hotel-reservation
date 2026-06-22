package com.hotelreservation.common.responses;

import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

@RestControllerAdvice(basePackages = "com.hotelreservation.modules")
public class ApiResponseAdvice implements ResponseBodyAdvice<Object> {

    @Override
    public boolean supports(
            MethodParameter returnType,
            Class<? extends HttpMessageConverter<?>> converterType) {
        return true;
    }

    @Override
    public Object beforeBodyWrite(
            Object body,
            MethodParameter returnType,
            MediaType selectedContentType,
            Class<? extends HttpMessageConverter<?>> selectedConverterType,
            ServerHttpRequest request,
            ServerHttpResponse response) {

        if (!MediaType.APPLICATION_JSON.includes(selectedContentType)) {
            return body;
        }
        if (body == null || body instanceof ApiResponse<?>) {
            return body;
        }
        if (body instanceof String) {
            try {
                response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
                return new com.fasterxml.jackson.databind.ObjectMapper()
                        .writeValueAsString(ApiResponse.success("Success", body));
            } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
                return body;
            }
        }
        return ApiResponse.success("Success", body);
    }
}
