import React, { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import { MessageCircle, X, Send, Bot, User, MapPin, DollarSign } from "lucide-react";
import ChatService from "../../services/ChatService";
import { useAuth } from "../../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { ImageWithFallback } from "../figma/ImageWithFallback";

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [allJobs, setAllJobs] = useState([]);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      const savedConvId = localStorage.getItem("conversationId");
      if (savedConvId) {
        const convId = Number(savedConvId);
        setConversationId(convId);

        // 🧩 Lấy lại lịch sử tin nhắn thật từ backend
        ChatService.getMessages(convId)
          .then((data) => {
            console.log("📨 Tin nhắn từ BE:", data);
            setMessages(
              data.map((m) => ({
                id: m.id,
                role: m.sender === "user" ? "user" : "assistant",
                content: m.content,
                suggestedJobs: m.jobs || [],
              }))
            );
          })
          .catch((err) => console.error("❌ Lỗi khi tải tin nhắn:", err));
      }


      // Lấy từ localStorage trước
      const savedChat = localStorage.getItem("chatHistory");
      if (savedChat) {
        setMessages(JSON.parse(savedChat));
      } else {
        if (user?.id) {
          initConversation();
        } else {
          console.warn("⚠️ Chưa đăng nhập, không thể khởi tạo conversation");
        }
      }
    }
  }, [isOpen]);

  const initConversation = async () => {
    try {
      const userId = user?.id || null;
      const conv = await ChatService.createConversation(userId);
      console.log("🧩 Created conversation:", conv);

      const convId = conv.id ?? conv.conversationId;
      if (!convId) {
        console.error("❌ Không nhận được conversationId từ BE:", conv);
        return;
      }

      setConversationId(convId);
      localStorage.setItem("conversationId", convId);

      // 🔹 Gửi câu chào đầu tiên vào backend để lưu như message thật
      const greeting = "Xin chào 👋! Tôi là trợ lý việc làm JobPortal. Bạn đang muốn tìm công việc ở lĩnh vực hoặc vị trí nào?";
      await ChatService.sendMessage(greeting, convId, [], userId);

      // 🔹 Cập nhật hiển thị FE
      const botGreeting = {
        id: Date.now(),
        role: "assistant",
        content: greeting,
      };
      setMessages([botGreeting]);
      localStorage.setItem("chatHistory", JSON.stringify([botGreeting]));
    } catch (err) {
      console.error("Init conversation error:", err);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMsg = {
      id: Date.now(),
      role: "user",
      content: inputMessage.trim(),
    };
    setMessages((prev) => {
      const updated = [...prev, userMsg];
      localStorage.setItem("chatHistory", JSON.stringify(updated));
      return updated;
    });

    setInputMessage("");
    setIsLoading(true);

    try {
      let aiText = "";
      let suggestedJobs = [];

      // ✅ 1. KIỂM TRA PUTER AI
      if (window.puter?.ai?.chat) {
        console.log("[ChatBot] Bắt đầu quy trình RAG Nâng cao...");

        // 🧠 BƯỚC 1: GỌI AI ĐỂ TRÍCH XUẤT THÔNG TIN (Thêm trường skills)
        const extractPrompt = [
          {
            role: "system",
            content: `Bạn là bộ lọc dữ liệu. Nhiệm vụ:
            Phân tích câu nói và trích xuất JSON gồm:
            - query: từ khóa chung.
            - industry: Ngành nghề (nếu có).
            - location: địa điểm MUỐN tìm (Ví dụ: "tại Hà Nội").
            - excludeLocation: địa điểm MUỐN TRÁNH/LOẠI TRỪ. 
              (Quy tắc: Nếu người dùng nói "ngoài Hà Nội", "không phải HCM", "khác Đà Nẵng" -> điền vào excludeLocation, để null location).
            - minSalary: lương (số).
            - jobType: FULL_TIME/PART_TIME.
            - skills: Mảng kỹ năng.
            
            Chỉ trả về JSON.`
          },
          { role: "user", content: inputMessage.trim() }
        ];

        const extractResponse = await window.puter.ai.chat(extractPrompt, { model: "gpt-4o-mini" });

        let searchCriteria = {};
        try {
          const rawJson = extractResponse?.message?.content || extractResponse?.toString();
          const jsonString = rawJson.replace(/```json|```/g, '').trim();
          searchCriteria = JSON.parse(jsonString);
          console.log("🔍 AI Extracted:", searchCriteria);
        } catch (e) {
          searchCriteria = { query: inputMessage.trim() };
        }

        // 🧠 BƯỚC 2: GỌI BACKEND API (SEARCH ADVANCED)
        let matchedJobs = [];
        let isFallback = false; // Cờ đánh dấu xem có phải đang dùng fallback không

        try {
          const res = await fetch('http://localhost:8080/api/jobs/search-advanced', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(searchCriteria)
          });

          if (res.ok) {
            matchedJobs = await res.json();
          }
        } catch (err) {
          console.error("API Error:", err);
        }

        // 🔥 BƯỚC QUAN TRỌNG: XỬ LÝ KHI KHÔNG TÌM THẤY JOB NÀO
        if (!matchedJobs || matchedJobs.length === 0) {
          console.log("⚠️ Không tìm thấy job phù hợp -> Chuyển sang chế độ Gợi ý chung");
          isFallback = true;
          // Lấy 5 job mới nhất/tốt nhất từ danh sách allJobs có sẵn ở client để gợi ý
          matchedJobs = allJobs.slice(0, 5);
        }

        // Cập nhật UI (thẻ Job)
        suggestedJobs = matchedJobs || [];

        // 🧠 BƯỚC 3: TẠO PROMPT TRẢ LỜI NGƯỜI DÙNG
        const jobContextString = suggestedJobs.map(j => `- ${j.title} tại ${j.location} (Lương: ${j.salaryMin || '?'} - ${j.salaryMax || '?'})`).join("\n");

        let systemInstruction = "";

        // Logic tạo câu trả lời tùy biến
        if (isFallback) {
          systemInstruction = `
                Bạn là trợ lý tuyển dụng. Hiện KHÔNG TÌM THẤY job nào khớp chính xác.
                Hãy xin lỗi và gợi ý các job nổi bật khác dưới đây:\n${jobContextString}
            `;
        } else {
          // ✅ XỬ LÝ TRƯỜNG HỢP "NGOÀI/KHÁC" (EXCLUDE)
          if (searchCriteria.excludeLocation) {
            systemInstruction = `
                    Bạn là trợ lý tuyển dụng.
                    Người dùng đang tìm việc NGÀNH "${searchCriteria.industry || searchCriteria.query || 'này'}" ở CÁC KHU VỰC KHÁC (ngoài ${searchCriteria.excludeLocation}).
                    
                    Hệ thống đã tìm thấy các công việc phù hợp dưới đây:
                    \n${jobContextString}\n

                    Hãy trả lời theo mẫu sau:
                    "Có chứ, dưới đây là các công việc [Tên ngành] ở các khu vực khác ngoài [${searchCriteria.excludeLocation}] mà mình tìm được:"
                    Sau đó liệt kê ngắn gọn 2-3 job.
                `;
          } else {
            // ✅ TRƯỜNG HỢP BÌNH THƯỜNG
            systemInstruction = `
                    Bạn là trợ lý tuyển dụng.
                    Dựa vào danh sách job tìm được:\n${jobContextString}\n
                    Hãy xác nhận đã tìm thấy job theo yêu cầu (ngành, địa điểm, lương...).
                    Giới thiệu ngắn gọn 2-3 job tốt nhất.
                `;
          }
        }
        const finalPrompt = [
          { role: "system", content: systemInstruction },
          { role: "user", content: inputMessage.trim() }
        ];

        const finalResponse = await window.puter.ai.chat(finalPrompt, { model: "gpt-4o-mini" });
        aiText = finalResponse?.message?.content || finalResponse?.toString();

      } else {
        throw new Error("Puter SDK không khả dụng");
      }

      // 🔁 Nếu GPT-5 lỗi hoặc không tìm thấy job
      if (!aiText || !suggestedJobs.length) {
        const resp = await ChatService.sendMessage(
          inputMessage,
          conversationId, // ✅ truyền conversationId hiện tại
          allJobs,
          user?.id
        );

        // ✅ Cập nhật lại conversationId nếu BE trả mới (trường hợp lần đầu)
        if (resp.conversationId && resp.conversationId !== conversationId) {
          console.log("💾 Cập nhật conversationId từ BE:", resp.conversationId);
          setConversationId(resp.conversationId);
        }

        aiText = resp.message;
        suggestedJobs = resp.suggestedJobs?.length ? resp.suggestedJobs : [];

      }

      // 🧠 Kiểm tra xem có phải tin nhắn cảm ơn hoặc tạm biệt không
      const lowerMsg = inputMessage.trim().toLowerCase();
      const isPoliteEnd =
        lowerMsg.includes("cảm ơn") ||
        lowerMsg.includes("thank") ||
        lowerMsg.includes("thanks") ||
        lowerMsg.includes("tạm biệt") ||
        lowerMsg.includes("bye") ||
        lowerMsg.includes("hẹn gặp lại") ||
        lowerMsg.includes("see you");


      // ✅ Gửi phản hồi AI ra giao diện
      const botMsg = {
        id: Date.now(),
        role: "assistant",
        content:
          isPoliteEnd
            ? "Rất vui khi có thể giúp bạn 😊. Chúc bạn sớm tìm được công việc ưng ý! Hẹn gặp lại 👋"
            : aiText || "Dưới đây là danh sách các job phù hợp cho yêu cầu của bạn 👇",
        suggestedJobs: isPoliteEnd ? [] : suggestedJobs || [],
      };

      setMessages((prev) => {
        const updated = [...prev, botMsg];
        localStorage.setItem("chatHistory", JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: "Xin lỗi, đã xảy ra lỗi trong khi xử lý yêu cầu.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleJobClick = (jobId) => {
    navigate(`/job-detail/${jobId}`);
    setIsOpen(false);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:scale-110 transition-all duration-200 flex items-center justify-center z-50"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-20 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden z-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Job Assistant</h3>
                <p className="text-xs text-white/80">GPT-5 Mini (via Puter)</p>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${window.puter?.ai ? "bg-green-400" : "bg-red-400"
                      }`}
                  ></div>
                  <p className="text-xs">
                    {window.puter?.ai ? "GPT-5 Online" : "GPT-5 Offline"}
                  </p>
                </div>

              </div>

            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id}>
                <div
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-blue-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 text-sm ${msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900"
                      }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                {/* 🔹 Job gợi ý nếu có */}
                {msg.suggestedJobs &&
                  msg.suggestedJobs.length > 0 &&
                  !/cảm ơn|thank|bye|tạm biệt|hẹn gặp lại/i.test(msg.content) && (
                    <div className="mt-2 space-y-2">
                      {msg.suggestedJobs.map((job) => (
                        <Card
                          key={job.id}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleJobClick(job.id)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                                <ImageWithFallback
                                  src={job.jobIMG || "https://via.placeholder.com/100"}
                                  alt={job.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm">{job.title}</h4>
                                <p className="text-xs text-gray-600">{job.companyName}</p>
                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                  <MapPin className="w-3 h-3" />
                                  <span>{job.location}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                  <DollarSign className="w-3 h-3" />
                                  <span>
                                    {job.salaryMin || ""} → {job.salaryMax || ""}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 items-center">
                <Bot className="w-4 h-4 text-blue-600" />
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4 flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn..."
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
