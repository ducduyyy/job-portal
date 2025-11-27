# Build stage (JDK 23)
FROM eclipse-temurin:23-jdk AS build
WORKDIR /app

# Copy wrapper + gradle config + source (relative to build context)
COPY gradlew .
COPY gradle ./gradle
COPY build.gradle .
COPY settings.gradle .
COPY src ./src

# make gradlew executable
RUN chmod +x gradlew

# Build jar
RUN ./gradlew build -x test

# Run stage (JRE)
FROM eclipse-temurin:23-jre
WORKDIR /app

# Copy jar from build stage
COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080

CMD ["sh", "-c", "java -jar app.jar --server.port=${PORT:-8080}"]
