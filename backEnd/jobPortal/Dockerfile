# ---------- Build stage ----------
FROM eclipse-temurin:23-jdk AS build

WORKDIR /app

# copy chỉ phần backend (nếu Docker context là thư mục backend)
# nếu bạn đặt Dockerfile trong backEnd/jobPortal thì lệnh COPY . . là ok
COPY . .

# đảm bảo gradlew executable (nếu cần)
RUN chmod +x ./gradlew

# build jar (bỏ test để nhanh hơn; bỏ -x test nếu muốn chạy test)
RUN ./gradlew bootJar -x test

# ---------- Run stage ----------
FROM eclipse-temurin:23-jre

WORKDIR /app

# copy jar từ stage build (nếu nhiều jar, wildcard *)
COPY --from=build /app/build/libs/*.jar app.jar

# Railway cung cấp PORT biến môi trường; Spring Boot sẽ đọc --server.port
ENV PORT=8080

# Start app, Spring Boot sẽ dùng server.port từ env
CMD ["sh", "-c", "java -jar app.jar --server.port=${PORT}"]
