# ===== BUILD =====
FROM eclipse-temurin:23-jdk AS build
WORKDIR /app

# Copy backend source
COPY backEnd/jobPortal/ .

# cấp quyền cho gradlew
RUN chmod +x gradlew

# build JAR
RUN ./gradlew clean bootJar --no-daemon

# ===== RUN =====
FROM eclipse-temurin:23-jre
WORKDIR /app

# copy file jar sang image
COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
