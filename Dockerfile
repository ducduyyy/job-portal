# Stage 1: build with JDK 23
FROM eclipse-temurin:23-jdk AS build
WORKDIR /app

# Copy backend source from repo root
COPY backEnd/jobPortal/ .

# make wrapper executable
RUN chmod +x ./gradlew

# Build the application
RUN ./gradlew clean bootJar -x test --no-daemon

# Debug: list jar (optional)
RUN ls -la build/libs || true

# Stage 2: runtime
FROM eclipse-temurin:23-jre
WORKDIR /app

# copy jar
COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["sh","-c","java -jar app.jar --server.port=${PORT:-8080}"]
