# Use JDK 23
FROM eclipse-temurin:23-jdk

# Set working directory
WORKDIR /app

# Copy Gradle build files
COPY backEnd/jobPortal/gradlew .
COPY backEnd/jobPortal/gradle ./gradle
COPY backEnd/jobPortal/build.gradle .
COPY backEnd/jobPortal/settings.gradle .
COPY backEnd/jobPortal/src ./src

# Grant permission for Gradlew
RUN chmod +x gradlew

# Build the application
RUN ./gradlew build -x test

# Expose port (Railway uses env PORT)
EXPOSE 8080

# Run jar file
CMD ["sh", "-c", "java -jar build/libs/*.jar"]
