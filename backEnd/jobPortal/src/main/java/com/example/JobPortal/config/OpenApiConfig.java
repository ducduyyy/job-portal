package com.example.JobPortal.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@OpenAPIDefinition(
        info = @Info(
                title = "Job Portal API Documentation",
                version = "1.0",
                description = "📘 REST API Documentation for Job Portal System",
                contact = @Contact(
                        name = "JobPortal Dev Team",
                        email = "support@jobportal.com"
                )
        ),
        servers = {
                @Server(url = "http://localhost:8080", description = "Local BE Server"),
                @Server(url = "http://mysite.local:5173", description = "Frontend (React) Swagger Access")
        }
)
@Configuration
public class OpenApiConfig {
}
