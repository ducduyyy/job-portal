// src/components/admin/ConversationManagement.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  MessageSquare,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  Calendar,
  User,
  Bot
} from "lucide-react";
import { useAuth } from "../../context/AuthProvider";
import { ScrollArea } from "../ui/scroll-area";

export function ConversationManagement() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { token } = useAuth();

  const API_BASE_URL = "http://localhost:8080/api/admin/chat";

  // Fetch conversations
  const fetchConversations = async () => {
    setLoading(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${API_BASE_URL}/conversations`, {
        headers,
        params: {
          search: searchTerm || undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
        },
      });
      setConversations(response.data.content || response.data || []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      // Fallback: set empty array if API doesn't exist yet
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [searchTerm, statusFilter, token]);

  // Mark conversation as useful
  const markAsUseful = async (conversationId) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.put(
        `${API_BASE_URL}/conversations/${conversationId}/mark-useful`,
        null,
        { headers }
      );
      fetchConversations();
    } catch (error) {
      console.error("Error marking conversation as useful:", error);
      alert("Không thể đánh dấu cuộc trò chuyện là hữu ích");
    }
  };

  // Mark conversation as spam
  const markAsSpam = async (conversationId) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.put(
        `${API_BASE_URL}/conversations/${conversationId}/mark-spam`,
        null,
        { headers }
      );
      fetchConversations();
    } catch (error) {
      console.error("Error marking conversation as spam:", error);
      alert("Không thể đánh dấu cuộc trò chuyện là spam");
    }
  };

  // View conversation details
  const viewConversation = async (conversationId) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(
        `${API_BASE_URL}/conversations/${conversationId}`,
        { headers }
      );
      setSelectedConversation(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching conversation details:", error);
      alert("Không thể tải chi tiết cuộc trò chuyện");
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case "USEFUL":
        return <Badge className="bg-green-500">Hữu ích</Badge>;
      case "SPAM":
        return <Badge variant="destructive">Spam</Badge>;
      default:
        return <Badge variant="secondary">Chưa đánh giá</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý Cuộc trò chuyện</h1>
        <p className="text-muted-foreground">
          Quản lý và đánh giá các cuộc trò chuyện với chatbot
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Lọc và Tìm kiếm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo user, nội dung..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="useful">Hữu ích</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="pending">Chưa đánh giá</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Conversations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách Cuộc trò chuyện</CardTitle>
          <CardDescription>
            {conversations.length} cuộc trò chuyện
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Không có cuộc trò chuyện nào
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Số tin nhắn</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conversations.map((conversation) => (
                    <TableRow key={conversation.id}>
                      <TableCell className="font-medium">
                        #{conversation.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="size-4 text-gray-400" />
                          <span>
                            {conversation.userId
                              ? `User #${conversation.userId}`
                              : "Khách"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{conversation.messageCount || 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="size-4 text-gray-400" />
                          <span>
                            {conversation.createdAt
                              ? new Date(
                                conversation.createdAt
                              ).toLocaleString("vi-VN")
                              : "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(conversation.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewConversation(conversation.id)}
                          >
                            <Eye className="size-4 mr-1" />
                            Xem
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAsUseful(conversation.id)}
                            className="text-green-600 hover:text-green-700"
                            disabled={conversation.status === "USEFUL"}
                          >
                            <CheckCircle2 className="size-4 mr-1" />
                            Hữu ích
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAsSpam(conversation.id)}
                            className="text-red-600 hover:text-red-700"
                            disabled={conversation.status === "SPAM"}
                          >
                            <XCircle className="size-4 mr-1" />
                            Spam
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conversation Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="size-5" />
              Chi tiết Cuộc trò chuyện #{selectedConversation?.id}
            </DialogTitle>
            <DialogDescription>
              {selectedConversation?.createdAt
                ? new Date(
                  selectedConversation.createdAt
                ).toLocaleString("vi-VN")
                : ""}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 pr-4">
              {selectedConversation?.messages?.map((message, index) => (
                <div
                  key={message.id || index}
                  className={`flex items-start gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                >
                  {/* 🔹 Hiển thị icon người nói */}
                  {message.sender === "assistant" && (
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-blue-600" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl p-3 ${message.sender === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-900"
                      }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.createdAt
                        ? new Date(message.createdAt).toLocaleString("vi-VN")
                        : ""}
                    </p>

                    {/* 🔹 Hiển thị danh sách job nếu có */}
                    {message.jobs && message.jobs.length > 0 && (
                      <div className="mt-2 space-y-2 ml-2">
                        {message.jobs.map((job) => (
                          <div
                            key={job.id}
                            className="p-3 border rounded-lg bg-white shadow-sm hover:shadow-md transition"
                          >
                            <div className="font-semibold text-sm">{job.title}</div>
                            <div className="text-xs text-gray-600">
                              {job.postedByName || "Ẩn danh"} — {job.location}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <span role="img" aria-label="money">💰</span>
                              {job.salaryMin || ""} → {job.salaryMax || ""}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {message.sender === "user" && (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {/* 🔹 Khi không có tin nhắn */}
              {(!selectedConversation?.messages ||
                selectedConversation.messages.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    Không có tin nhắn nào
                  </div>
                )}
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => markAsUseful(selectedConversation?.id)}
              className="text-green-600"
              disabled={selectedConversation?.status === "USEFUL"}
            >
              <CheckCircle2 className="size-4 mr-2" />
              Đánh dấu Hữu ích
            </Button>
            <Button
              variant="outline"
              onClick={() => markAsSpam(selectedConversation?.id)}
              className="text-red-600"
              disabled={selectedConversation?.status === "SPAM"}
            >
              <XCircle className="size-4 mr-2" />
              Đánh dấu Spam
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

