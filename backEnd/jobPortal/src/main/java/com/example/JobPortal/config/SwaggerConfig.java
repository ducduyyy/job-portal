package com.example.JobPortal.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI jobPortalOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Job Portal API Documentation")
                        .description("📘 API cho hệ thống tuyển dụng — gồm Auth, Candidate, Employer, Application...")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Duy")
                                .email("duyn9946@gmail.com")
                                .url("https://localhost:5173"))
                        .license(new License().name("Apache 2.0").url("https://springdoc.org")));
    }
}
