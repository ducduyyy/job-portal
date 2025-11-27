
# job-portal (monorepo)

## Cấu trúc
- frontend/: React app
- backend/: Spring Boot app

## Chạy local
Frontend:
cd frontend
npm install
npm start

Backend:
cd backend
# nếu Maven:
./mvnw spring-boot:run
# hoặc
mvn spring-boot:run

EOF

git add README.md
git commit -m "Add README"
git push
