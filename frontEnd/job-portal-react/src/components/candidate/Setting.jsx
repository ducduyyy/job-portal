import React, { useState } from "react";
import { MessageSquare, Lock } from "lucide-react";
import { Card, CardContent } from "../ui/card.jsx";
import { Button } from "../ui/button.jsx";
import { ChatHistory } from "./ChatHistory.jsx";
import { ChangePassword } from "../ChangePassword.jsx";

export function Settings() {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-10">
      {/* Tiêu đề */}
      <h1 className="text-3xl font-bold mb-10 text-gray-800 text-center">
        Settings
      </h1>

      {/* Layout chia 2 cột */}
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white shadow-md rounded-2xl overflow-hidden border border-gray-100">
        {/* Sidebar trái */}
        <div className="w-10 md:w-1/4 border-b md:border-b-0 md:border-r border-gray-200 bg-gray-50">
          <div className="flex flex-col">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium text-left transition-all ${
                activeTab === "chat"
                  ? "bg-blue-50 border-r-4 border-blue-600 text-blue-700 font-semibold"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              <MessageSquare className="w-4 h-4" /> Chat History
            </button>

            <button
              onClick={() => setActiveTab("password")}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium text-left transition-all ${
                activeTab === "password"
                  ? "bg-blue-50 border-r-4 border-blue-600 text-blue-700 font-semibold"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              <Lock className="w-4 h-4" /> Change Password
            </button>
          </div>
        </div>

        {/* Nội dung bên phải */}
        <div className="flex-1 p-6 md:p-8">
          {activeTab === "chat" && (
            <Card className="shadow-none border-none">
              <CardContent className="p-0">
                <ChatHistory />
              </CardContent>
            </Card>
          )}

          {activeTab === "password" && (
            <Card className="shadow-none border-none">
              <CardContent className="p-0">
                <ChangePassword />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
