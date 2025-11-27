# Chatbot API Documentation

Tài liệu này mô tả các API endpoints cần thiết cho tính năng Chatbot.

## Base URL
```
http://localhost:8080/api
```

## Endpoints

### 1. Tạo Conversation mới
**POST** `/chat/conversations`

**Request Body:**
```json
{
  "userId": 123  // nullable, null nếu là guest
}
```

**Response:**
```json
{
  "id": "conv-123",
  "userId": 123,
  "createdAt": "2024-01-01T00:00:00Z",
  "status": "PENDING"
}
```

---

### 2. Gửi Message
**POST** `/chat/send`

**Request Body:**
```json
{
  "message": "Tôi cần tìm việc làm lập trình viên",
  "conversationId": "conv-123",
  "userId": 123
}
```

**Response:**
```json
{
  "message": "Tôi đã tìm thấy 5 công việc phù hợp cho bạn...",
  "conversationId": "conv-123",
  "suggestedJobs": [
    {
      "id": 1,
      "title": "Senior React Developer",
      "companyName": "Tech Corp",
      "location": "Ho Chi Minh City",
      "salaryMin": 15000,
      "salaryMax": 25000,
      "jobIMG": "/uploads/jobs/job1.jpg"
    }
  ]
}
```

---

### 3. Lấy tất cả Conversations
**GET** `/chat/conversations?userId=123`

**Query Parameters:**
- `userId` (optional): Filter by user ID

**Response:**
```json
[
  {
    "id": "conv-123",
    "userId": 123,
    "messageCount": 10,
    "createdAt": "2024-01-01T00:00:00Z",
    "status": "PENDING"
  }
]
```

---

### 4. Lấy Messages của một Conversation
**GET** `/chat/conversations/{conversationId}/messages`

**Response:**
```json
{
  "id": "conv-123",
  "messages": [
    {
      "role": "user",
      "content": "Tôi cần tìm việc làm",
      "timestamp": "2024-01-01T00:00:00Z"
    },
    {
      "role": "assistant",
      "content": "Tôi có thể giúp bạn...",
      "timestamp": "2024-01-01T00:00:01Z"
    }
  ]
}
```

---

## Admin Endpoints

### 5. Lấy tất cả Conversations (Admin)
**GET** `/api/admin/chat/conversations`

**Query Parameters:**
- `search` (optional): Search term
- `status` (optional): Filter by status (PENDING, USEFUL, SPAM)

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "content": [
    {
      "id": "conv-123",
      "userId": 123,
      "messageCount": 10,
      "createdAt": "2024-01-01T00:00:00Z",
      "status": "PENDING"
    }
  ],
  "totalElements": 100,
  "totalPages": 10
}
```

---

### 6. Xem chi tiết Conversation (Admin)
**GET** `/api/admin/chat/conversations/{conversationId}`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "conv-123",
  "userId": 123,
  "createdAt": "2024-01-01T00:00:00Z",
  "status": "PENDING",
  "messages": [
    {
      "role": "user",
      "content": "Tôi cần tìm việc làm",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### 7. Đánh dấu Conversation là Hữu ích
**PUT** `/api/admin/chat/conversations/{conversationId}/mark-useful`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Conversation marked as useful"
}
```

---

### 8. Đánh dấu Conversation là Spam
**PUT** `/api/admin/chat/conversations/{conversationId}/mark-spam`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Conversation marked as spam"
}
```

---

## Tích hợp OpenAI (Backend)

Nếu bạn muốn tích hợp OpenAI API trong backend, có thể tham khảo:

1. **Prompt Template:**
```
Bạn là một chatbot tư vấn việc làm thông minh. Nhiệm vụ của bạn là:
- Lắng nghe yêu cầu của người dùng về công việc
- Phân tích và hiểu rõ yêu cầu (vị trí, kỹ năng, mức lương, địa điểm...)
- Đưa ra gợi ý các công việc phù hợp từ cơ sở dữ liệu
- Trả lời các câu hỏi về công việc một cách thân thiện và hữu ích

Context: Danh sách jobs từ database (sẽ được inject vào prompt)
```

2. **API Call Format:**
```javascript
// Backend example (Node.js)
const openaiResponse = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: [
    { role: "system", content: systemPrompt },
    ...conversationHistory,
    { role: "user", content: userMessage }
  ],
  temperature: 0.7,
});
```

3. **Job Search Integration:**
- Trước khi gọi OpenAI, backend nên tìm kiếm jobs dựa trên user message
- Inject danh sách jobs vào system prompt để OpenAI có thể tham khảo
- OpenAI sẽ đưa ra phản hồi kèm theo suggestedJobs trong response

---

## Status Codes

- `PENDING`: Chưa được đánh giá (mặc định)
- `USEFUL`: Được đánh giá là hữu ích
- `SPAM`: Được đánh giá là spam

---

## Notes

- Frontend đã được implement với fallback mock responses khi backend chưa sẵn sàng
- Cần implement các endpoints này ở backend để chatbot hoạt động đầy đủ
- Admin endpoints yêu cầu authentication token

