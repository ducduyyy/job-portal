FROM eclipse-temurin:23-jdk AS build
WORKDIR /app

# copy relative to build context (which is backEnd/jobPortal)
COPY . .

RUN chmod +x ./gradlew
RUN ./gradlew clean bootJar -x test --no-daemon
RUN ls -la build/libs || true

FROM eclipse-temurin:23-jre
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["sh","-c","java -jar app.jar --server.port=${PORT:-8080}"]
