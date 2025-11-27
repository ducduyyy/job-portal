import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { CandidateHome } from "./components/candidate/CandidateHome";
import { JobSearch } from "./components/candidate/JobSearch";
import { JobDetail } from "./components/candidate/JobDetail";
import { CandidateProfile } from "./components/candidate/CandidateProfile";
import { EmployerDashboard } from "./components/employer/EmployerDashboard";
import { PostJob } from "./components/employer/PostJob";
import { EmployerProfile } from "./components/employer/EmployerProfle";
import { SidebarProvider, SidebarInset } from "./components/ui/sidebar";
import { AdminSidebar } from "./components/admin/AdminSidebar";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { UserManagement } from "./components/admin/UserManagement";
import { JobManagement } from "./components/admin/JobManagement";
import { ConversationManagement } from "./components/admin/ConversationManagement";
import { Reports } from "./components/admin/Reports";



function AdminApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <SidebarInset className="flex-1">
            <Navigation />
            <main className="p-8 bg-gradient-to-br from-slate-50 via-white to-blue-50 min-h-screen">
              <AdminSidebar />
              <div className="max-w-7xl mx-auto">
                <Routes>
                  <Route path="/dashboard" element={<AdminDashboard />} />
                  <Route path="/users" element={<UserManagement />} />
                  <Route path="/jobs" element={<JobManagement />} />
                  <Route path="/conversations" element={<ConversationManagement />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/admin/dashboard" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}

export default AdminApp;
