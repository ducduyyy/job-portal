import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { useAuth } from "../../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Clock, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { toast } from "sonner"; // 🧩 Thêm toast

export function ChatHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const API_BASE = "http://localhost:8080/api/chat";

  // 🟢 Load danh sách hội thoại
  useEffect(() => {
    if (!user) return;
    const fetchConversations = async () => {
      try {
        const res = await axios.get(`${API_BASE}/conversations`, {
          params: { userId: user.id },
        });
        const convs = await Promise.all(
          res.data.map(async (conv) => {
            // Lấy 1 message đầu tiên để preview
            try {
              const msgRes = await axios.get(
                `${API_BASE}/conversations/${conv.id}/messages`
              );
              const preview =
                msgRes.data && msgRes.data.length > 0
                  ? msgRes.data[0].content
                  : "Chưa có tin nhắn.";
              return { ...conv, preview };
            } catch {
              return { ...conv, preview: "Không thể tải tin nhắn." };
            }
          })
        );
        setConversations(convs);
      } catch (err) {
        console.error("Lỗi khi tải hội thoại:", err);
        toast.error("Không thể tải danh sách hội thoại");
      }
    };
    fetchConversations();
  }, [user]);

  // 🟢 Khi chọn 1 hội thoại → load messages
  const handleSelectConversation = async (conv) => {
    setSelectedConv(conv);
    try {
      const res = await axios.get(`${API_BASE}/conversations/${conv.id}/messages`);
      setMessages(res.data);
    } catch (err) {
      console.error("Lỗi khi tải tin nhắn:", err);
      toast.error("Không thể tải tin nhắn hội thoại này");
    }
  };

  // 🗑️ Hàm xóa hội thoại
  const handleConfirmDelete = async () => {
    if (!selectedConv) return;
    setIsDeleting(true);

    try {
      await axios.delete(`${API_BASE}/conversation/${selectedConv.id}`);
      setConversations(conversations.filter((c) => c.id !== selectedConv.id));
      setSelectedConv(null);
      setMessages([]);
      setIsDialogOpen(false);
      toast.success(`Đã xóa hội thoại #${selectedConv.id}`);
    } catch (err) {
      console.error("Lỗi khi xóa hội thoại:", err);
      toast.error("Không thể xóa hội thoại này!");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">⚙️ Cài đặt tài khoản</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 🔹 Danh sách hội thoại */}
        <Card className="col-span-1 h-[500px] overflow-y-auto border-gray-200">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" /> Lịch sử hội thoại
            </h2>

            {conversations.length === 0 && (
              <p className="text-gray-500 text-sm">Chưa có cuộc hội thoại nào.</p>
            )}

            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                className={`p-3 rounded-lg cursor-pointer mb-2 border transition-all ${
                  selectedConv?.id === conv.id
                    ? "bg-blue-100 border-blue-300"
                    : "hover:bg-blue-50 border-transparent"
                }`}
              >
                {/* 🧠 Đoạn chat preview */}
                <p className="text-sm font-medium text-gray-800 truncate">
                  {conv.preview || "Chưa có tin nhắn."}
                </p>

                {/* ⏰ Thời gian nhỏ bên dưới */}
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {conv.createdAt
                    ? new Date(conv.createdAt).toLocaleString("vi-VN")
                    : "Không xác định"}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 🔹 Nội dung tin nhắn */}
        <Card className="col-span-2 h-[500px] flex flex-col">
          <CardContent className="flex-1 overflow-y-auto p-4 mb-5">
            {selectedConv ? (
              <>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="font-semibold text-lg">
                    Cuộc hội thoại #{selectedConv.id}
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDialogOpen(true)}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" /> Xóa hội thoại
                  </Button>
                </div>

                {messages.length > 0 ? (
                  messages.map((m, index) => (
                    <div key={index} className="mb-4">
                      <div
                        className={`m-4 pb-2 inline-block px-3 py-2 rounded-lg text-sm ${
                          m.sender === "user"
                            ? "bg-blue-600 text-white float-right"
                            : "bg-gray-100 text-gray-800 float-left"
                        }`}
                      >
                        {m.content}
                      </div>

                      {/* Hiển thị danh sách job gợi ý */}
                      {m.jobs && m.jobs.length > 0 && (
                        <div className="m-3 clear-both grid gap-3">
                          {m.jobs.map((job, idx) => (
                            <div
                              key={idx}
                              onClick={() =>
                                navigate(`/job-detail/${job.jobId || job.id}`)
                              }
                              className="flex items-start gap-3 p-3 border rounded-xl hover:shadow-md hover:border-blue-400 cursor-pointer transition-all duration-200"
                            >
                              <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={
                                    job.jobIMG || "https://via.placeholder.com/100"
                                  }
                                  alt={job.jobName || job.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm text-gray-800 mb-1">
                                  {job.jobName || job.title}
                                </h4>
                                <p className="text-xs text-gray-600 mb-1">
                                  {job.companyName ||
                                    job.postedByName ||
                                    "Công ty ẩn danh"}
                                </p>
                                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <i className="ri-map-pin-line text-gray-400"></i>
                                    {job.location || "Không rõ"}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <i className="ri-money-dollar-circle-line text-gray-400"></i>
                                    {job.salaryMin || 0} → {job.salaryMax || 0}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Không có tin nhắn nào.</p>
                )}
              </>
            ) : (
              <p className="text-gray-500 text-sm mt-4">
                Chọn một hội thoại để xem nội dung.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 🧩 Dialog xác nhận xóa */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className={`w-300 mx-auto rounded-2xl shadow-2xl text-center p-6 
            max-w-[400px] sm:max-w-[420px] transition-all duration-200`}
        >
          <DialogHeader>
            <DialogTitle>Xác nhận xóa hội thoại</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa hội thoại{" "}
              <span className="font-semibold">#{selectedConv?.id}</span> không?
              Hành động này sẽ xóa toàn bộ tin nhắn liên quan và không thể khôi phục.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isDeleting}
            >
              Hủy
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Đang xóa..." : "Xác nhận xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
