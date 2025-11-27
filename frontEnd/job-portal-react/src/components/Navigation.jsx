import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthProvider.jsx";
import { NotificationPanel } from "./NotificationPanel.jsx";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button.jsx";
import { Badge } from "./ui/badge.jsx";
import axios from "axios";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar.jsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu.jsx";
import {
  Bell,
  User,
  Settings,
  LogOut,
  Briefcase,
  Shield,
  Globe,
} from "lucide-react";
import { setLanguage, getCurrentLanguage } from "../utils/autoTranslate";

export function Navigation() {
  const { user, role, logout } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const userId = user?.id;


  const navigate = useNavigate();
  const URL_BASE = "http://localhost:8080/api/candidates";


  const handleLogin = () => navigate("/login");

  const getRoleIcon = (role) => {
    switch (role) {
      case "PERSONAL":
        return <User className="size-4" />;
      case "BUSINESS":
        return <Briefcase className="size-4" />;
      case "ADMIN":
        return <Shield className="size-4" />;
      default:
        return <User className="size-4" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "PERSONAL":
        return "default";
      case "BUSINESS":
        return "secondary";
      case "ADMIN":
        return "destructive";
      default:
        return "default";
    }
  };

  useEffect(() => {
    if (!userId) return;
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${URL_BASE}/${userId}/profile`);
        setProfileData(res.data);
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };
    fetchProfile();
  }, [userId]);

  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());
  const langLabel = currentLang === 'ja' ? '日本語' : currentLang === 'vi' ? 'Tiếng Việt' : 'English';


  return (
    <nav className="sticky text-black top-0 z-50 border-b bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="bg-primary text-primary-foreground p-2.5 rounded-2xl shadow-md">
                <Briefcase className="size-5" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  JobPortal
                </span>
                <div className="text-xs text-muted-foreground -mt-1">
                  Find your dream job
                </div>
              </div>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {/* Role Switcher — chỉ hiện khi role là ADMIN */}
            {role === "ADMIN" && (
              <div className="flex items-center space-x-1 bg-secondary/50 p-1.5 rounded-2xl shadow-sm border">
                {["candidate", "employer", "admin"].map((view) => (
                  <Button
                    key={view}
                    variant={location.pathname.includes(view) ? "default" : "ghost"}
                    size="sm"
                    onClick={() => {
                      // Chỉ chuyển trang, không đổi role
                      if (view === "candidate") navigate("/home");
                      if (view === "employer") navigate("/employer/dashboard");
                      if (view === "admin") navigate("/admin/dashboard");
                    }}
                    className={`flex items-center space-x-2 rounded-xl transition-all duration-200 ${location.pathname.includes(view)
                        ? "shadow-sm bg-white hover:bg-white text-black"
                        : "hover:bg-accent/50"
                      }`}
                  >
                    {getRoleIcon(view.toUpperCase())}
                    <span className="capitalize hidden sm:inline">{view}</span>
                  </Button>
                ))}
              </div>
            )}


            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 rounded-xl hover:bg-accent/50 px-3 py-2 h-auto"
                >
                  <Globe className="size-4" />
                  <span className="hidden md:inline text-sm">{langLabel}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 rounded-2xl">
                <DropdownMenuItem onClick={() => setLanguage('en')}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('ja')}>
                  日本語
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('vi')}>
                  Tiếng Việt
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {user ? (
              <>
                {/* Current Role Badge */}
                <Badge
                  variant={getRoleColor(role)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl shadow-sm"
                >
                  {getRoleIcon(role)}
                  <span className="capitalize font-medium">{role}</span>
                </Badge>

                {/* Notifications */}
                <NotificationPanel />

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-2 rounded-xl hover:bg-accent/50 px-3 py-2 h-auto"
                    >
                      <Avatar className="size-8 ring-2 ring-primary/10">
                        <AvatarImage
                          src={
                            profileData?.candidateIMG
                              ? profileData.candidateIMG
                              : "/default-avatar.png"
                          }
                        />
                        <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary font-semibold">
                          {user?.username
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden md:flex flex-col items-start">
                        <span className="text-sm font-medium">{user?.username}</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {role}
                        </span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 rounded-2xl shadow-lg"
                  >
                    <DropdownMenuLabel className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <Avatar className="size-8">
                          <AvatarImage
                            src={
                              profileData?.candidateIMG
                                ? profileData.candidateIMG
                                : "/default-avatar.png"
                            }
                          />
                          <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary">
                            {user?.username
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user?.username}</p>
                          <p className="text-xs text-muted-foreground">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {(role === "PERSONAL" || role === "BUSINESS") && (
                      <DropdownMenuItem
                        className="rounded-lg mx-2 mb-1 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          if (role === "PERSONAL") navigate("/profile");
                          else if (role === "BUSINESS") navigate("/employer/company-profile");
                        }}
                      >
                        <User className="mr-3 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                      className={`rounded-lg mx-2 mb-1 cursor-pointer ${role !== "PERSONAL" ? "opacity-50 pointer-events-none" : ""
                        }`}
                      onClick={() => role === "PERSONAL" && navigate(`/settings`)}
                    >
                      <Settings className="mr-3 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="rounded-lg mx-2 mb-2 text-destructive focus:text-destructive"
                      onClick={logout}
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              // Nếu chưa login thì chỉ hiện nút Đăng nhập
              <>
                <Button
                  variant="default"
                  size="sm"
                  className="rounded-xl shadow-sm px-4 py-2"
                  onClick={handleLogin}
                >
                  Login
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
