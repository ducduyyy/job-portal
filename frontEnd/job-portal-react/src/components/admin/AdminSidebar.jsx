import { useState } from "react";
import {
  Home,
  Users,
  Briefcase,
  AlertTriangle,
  ChevronsLeft,
  ChevronsRight,
  MessageSquare,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { NavLink } from "react-router-dom";

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { title: "Dashboard", icon: Home, path: "/admin/dashboard" },
    { title: "User Management", icon: Users, path: "/admin/users" },
    { title: "Job Management", icon: Briefcase, path: "/admin/jobs" },
    { title: "Conversations", icon: MessageSquare, path: "/admin/conversations" },
    { title: "Reports", icon: AlertTriangle, path: "/admin/reports" },
  ];

  return (
    <Sidebar
      className={` transition-all duration-300 ${
        collapsed ? "w-15" : "w-64"
      }`}
    >
      <SidebarContent className="flex flex-col h-full pt-15">
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>JobBoard Admin</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <NavLink to={item.path}>
                    {({ isActive }) => (
                      <SidebarMenuButton
                        isActive={isActive}
                        className={`flex items-center gap-2 transition-all ${
                          collapsed ? "justify-center" : "justify-start"
                        }`}
                      >
                        <item.icon className="size-5" />
                        {!collapsed && <span>{item.title}</span>}
                      </SidebarMenuButton>
                    )}
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Toggle button ở dưới cùng */}
        <div className="mt-auto p-2 flex justify-end border-t">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-end p-2 rounded-lg hover:bg-accent/50 transition-colors"
          >
            {collapsed ? (
              <ChevronsRight className="size-5" />
            ) : (
              <ChevronsLeft className="size-5" />
            )}
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
