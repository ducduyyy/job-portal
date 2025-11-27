# Stage 1: build backend
FROM eclipse-temurin:23-jdk AS build
WORKDIR /app

# Copy backend source
COPY backEnd/jobPortal/ .

# Make gradlew executable
RUN chmod +x gradlew

# Build Spring Boot JAR
RUN ./gradlew clean bootJar -x test --no-daemon

# Debug: show JAR
RUN ls -la build/libs

# Stage 2: run JAR
FROM eclipse-temurin:23-jre
WORKDIR /app

COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["sh","-c","java -jar app.jar --server.port=${PORT:-8080}"]
