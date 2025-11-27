import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import {
  Search,
  User,
  Briefcase,
  FileText,
  Book,
  Home,
  LogOut,
  Loader2,
  Filter,
} from "lucide-react";
import axios from "axios";

export default function SwaggerPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("All");
  const [apiStats, setApiStats] = useState({});
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState(null);
  const [spec, setSpec] = useState(null);
  const [filteredSpec, setFilteredSpec] = useState(null);

  const sections = [
    { label: "All", icon: Home, tag: null },
    { label: "Auth", tag: "auth-controller", icon: User },
    { label: "Candidate", tag: "candidate-controller", icon: Book },
    { label: "Employer", tag: "employer-controller", icon: Briefcase },
    { label: "Job", tag: "job-controller", icon: FileText },
    { label: "Application", tag: "application-controller", icon: FileText },
    { label: "Admin", tag: "admin-controller", icon: User },
    { label: "Chatbot", tag: "chatbot-controller", icon: User },
  ];

  const filteredSections = sections.filter((s) =>
    s.label.toLowerCase().includes(search.toLowerCase())
  );

  // 🟢 Lấy swagger spec
  useEffect(() => {
    const fetchSwagger = async () => {
      try {
        const res = await axios.get("http://localhost:8080/v3/api-docs");
        const paths = res.data.paths || {};
        const stats = {};

        Object.entries(paths).forEach(([_, methods]) => {
          Object.entries(methods).forEach(([method, meta]) => {
            if (!meta.tags || meta.tags.length === 0) return;
            const tag = meta.tags[0];
            stats[tag] =
              stats[tag] || {
                total: 0,
                GET: 0,
                POST: 0,
                PUT: 0,
                DELETE: 0,
                PATCH: 0,
              };
            const upper = method.toUpperCase();
            stats[tag][upper] = (stats[tag][upper] || 0) + 1;
            stats[tag].total += 1;
          });
        });

        setApiStats(stats);
        setSpec(res.data);
        setFilteredSpec(res.data);
      } catch (err) {
        console.error("❌ Lỗi tải Swagger API docs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSwagger();
  }, []);

  // 🟡 Lọc theo tag & method
  useEffect(() => {
    if (!spec) return;

    // Bắt đầu lọc paths
    const filteredPaths = {};
    for (const [path, methods] of Object.entries(spec.paths)) {
      const filteredMethods = Object.entries(methods)
        .filter(([method, meta]) => {
          const matchTag =
            !selectedTag || meta.tags?.includes(selectedTag);
          const matchMethod =
            methodFilter === "ALL" || method.toUpperCase() === methodFilter;
          return matchTag && matchMethod;
        })
        .reduce((acc, [m, meta]) => ({ ...acc, [m]: meta }), {});

      if (Object.keys(filteredMethods).length > 0) {
        filteredPaths[path] = filteredMethods;
      }
    }

    setFilteredSpec({
      ...spec,
      paths: filteredPaths,
    });
  }, [selectedTag, methodFilter, spec]);

  const handleClick = (section) => {
    setSelected(section.label);
    setSelectedTag(section.tag || null);
  };

  const handleFilterChange = (method) => setMethodFilter(method);

  const getCount = (label) => {
    if (label === "All") {
      return Object.values(apiStats).reduce(
        (sum, t) => sum + (t.total || 0),
        0
      );
    }
    const tag = sections.find((s) => s.label === label)?.tag;
    if (!tag || !apiStats[tag]) return 0;
    return methodFilter === "ALL"
      ? apiStats[tag].total
      : apiStats[tag][methodFilter] || 0;
  };

  const methods = ["ALL", "GET", "POST", "PUT", "DELETE", "PATCH"];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar cố định */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-blue-700 text-white flex flex-col shadow-xl z-20">
        {/* Header */}
        <div className="p-5 border-b border-blue-600 flex items-center space-x-2">
          <img
            src="/logo192.png"
            alt="Logo"
            className="w-8 h-8 rounded-lg bg-white p-1"
          />
          <h1 className="text-xl font-bold">API Explorer</h1>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-blue-600">
          <div className="flex items-center bg-blue-600 rounded-lg px-3 py-2 space-x-2">
            <Search className="w-4 h-4 text-gray-200" />
            <input
              type="text"
              placeholder="Tìm API..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent w-full text-sm focus:outline-none text-white placeholder-gray-300"
            />
          </div>
        </div>

        {/* HTTP Method Filter */}
        <div className="p-3 border-b border-blue-600">
          <div className="flex items-center justify-between text-xs uppercase mb-2">
            <span className="font-semibold text-gray-200 flex items-center">
              <Filter className="w-3.5 h-3.5 mr-1" /> Bộ lọc HTTP
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {methods.map((m) => (
              <button
                key={m}
                onClick={() => handleFilterChange(m)}
                className={`text-xs py-1.5 rounded-md font-semibold border transition ${
                  methodFilter === m
                    ? "bg-blue-500 border-blue-400 text-white"
                    : "border-blue-400/40 bg-blue-600 hover:bg-blue-500 text-gray-200"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Danh sách API */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-gray-200">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              <span>Đang tải danh sách API...</span>
            </div>
          ) : (
            filteredSections.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleClick(s)}
                className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-left transition ${
                  selected === s.label
                    ? "bg-blue-500 text-white"
                    : "hover:bg-blue-600 text-gray-100"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <s.icon className="w-5 h-5" />
                  <span className="font-medium">{s.label}</span>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    selected === s.label
                      ? "bg-blue-400/80"
                      : "bg-blue-500/40 text-gray-100"
                  }`}
                >
                  {getCount(s.label)}
                </span>
              </button>
            ))
          )}
          {!loading && filteredSections.length === 0 && (
            <p className="text-sm text-gray-300 text-center mt-4">
              Không tìm thấy API nào 😢
            </p>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-blue-600">
          <button
            onClick={() => navigate("/")}
            className="flex items-center space-x-2 px-3 py-2 w-full text-left hover:bg-blue-600 rounded-lg"
          >
            <LogOut className="w-5 h-5" />
            <span>Quay lại Dashboard</span>
          </button>
        </div>
      </aside>

      {/* Main Swagger UI */}
      <main className="flex-1 flex flex-col ml-72">
        <header className="bg-white shadow-sm p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center">
            📘 Tài liệu API
            <span className="ml-2 text-sm text-gray-500">
              (Filter: {methodFilter})
            </span>
          </h2>
          <a
            href="http://localhost:8080/swagger-ui/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm"
          >
            Mở trong tab mới →
          </a>
        </header>

        <div className="flex-1 bg-white overflow-y-auto">
          {filteredSpec ? (
            <SwaggerUI spec={filteredSpec} docExpansion="list" />
          ) : (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">
                Đang tải tài liệu API...
              </span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
