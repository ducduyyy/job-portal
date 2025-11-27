import React from "react";
import { setLanguage, getCurrentLanguage } from "../utils/autoTranslate";

export default function TranslateFloat() {
  const current = getCurrentLanguage();
  return (
    <div
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 1000,
        background: "white",
        border: "1px solid rgba(0,0,0,0.1)",
        borderRadius: 12,
        padding: "8px 10px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
      }}
    >
      <select
        defaultValue={current}
        onChange={(e) => setLanguage(e.target.value)}
        style={{
          outline: "none",
          border: "none",
          background: "transparent",
          fontSize: 14,
          cursor: "pointer",
        }}
        aria-label="Select language"
      >
        <option value="en">English</option>
        <option value="ja">日本語</option>
        <option value="vi">Tiếng Việt</option>
      </select>
    </div>
  );
}


