// src/services/ChatService.jsx
import axios from "axios";

const API_BASE = "http://localhost:8080/api/chat";

const token = localStorage.getItem("token"); // hoặc từ context useAuth()
const headers = token ? { Authorization: `Bearer ${token}` } : {};

const ChatService = {

  /**
   * 🧩 Gửi tin nhắn tới chatbot (BE endpoint: POST /api/chat/send)
   * @param {string} message - Nội dung người dùng nhập
   * @param {number|string|null} conversationId - ID cuộc hội thoại
   * @param {Array|null} jobs - Danh sách job (nếu có)
   */

  sendMessage: async (message, conversationId = null, jobs = null, userId = null) => {
  try {
    console.log("📨 Sending to backend:", { message, conversationId, userId });
    const response = await axios.post(`${API_BASE}/send`, {
      conversationId,
      message,
      userID: userId, // ⚠️ BE dùng `userID` chứ không phải `userId`
      jobs,
    }, { headers });

    const data = response.data || {};

    const formattedJobs = Array.isArray(data.jobs || data.suggestedJobs)
      ? (data.jobs || data.suggestedJobs).map((job) => ({
          id: job.id || job.jobId,
          title: job.title || job.jobName,
          companyName: job.postedByName || job.companyName,
          location: job.location,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          jobIMG: job.jobIMG || "https://via.placeholder.com/100",
        }))
      : [];

    return {
      message: data.reply || "",
      suggestedJobs: formattedJobs,
      conversationId: data.conversationId || conversationId,
      userId: data.userId || userId,
    };

  } catch (error) {
    console.error("❌ Error sending message:", error);
    throw error;
  }
},


  /**
   * 🧩 Tạo conversation mới (BE endpoint: POST /api/chat/conversation?userId=)
   */
  createConversation: async (userId = null) => {
    try {
      const response = await axios.post(`${API_BASE}/conversation`, null, {
        params: { userId },
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404 || error.code === "ECONNREFUSED") {
        console.warn("⚠️ Conversation API not available, using mock conversation");
        return {
          id: `mock-conv-${Date.now()}`,
          userId,
          createdAt: new Date().toISOString(),
        };
      }
      console.error("❌ Error creating conversation:", error);
      throw error;
    }
  },

  /**
   * 🔍 Lấy danh sách conversation theo user
   */
  getConversations: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE}/conversation`, {
        params: { userId },
      });
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching conversations:", error);
      throw error;
    }
  },

  /**
   * 🔍 Lấy danh sách tin nhắn của 1 conversation
   */
  getMessages: async (conversationId) => {
    try {
      const response = await axios.get(`${API_BASE}/conversation/${conversationId}/messages`);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching messages:", error);
      throw error;
    }
  },

  /**
   * 🔍 Tìm kiếm job theo từ khoá
   */
  searchJobs: async (query, filters = {}) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/jobs`, {
        params: {
          search: query,
          ...filters,
        },
      });
      return response.data;
    } catch (error) {
      console.error("❌ Error searching jobs:", error);
      throw error;
    }
  },
};

export default ChatService;
