import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { CandidateHome } from "./components/candidate/CandidateHome";
import { JobSearch } from "./components/candidate/JobSearch";
import { JobDetail } from "./components/candidate/JobDetail";
import { CandidateProfile } from "./components/candidate/CandidateProfile";
import { ChatBot } from "./components/candidate/ChatBot";
import Footer from "./components/Footer";
import NotFound from "./components/default/NotFoundPage";
import { Settings } from "./components/candidate/Setting";

function CandidateApp() {
  const location = useLocation();

  const validPaths = ["/home", "/search", "/job-detail/:id", "/profile","/", "/upload/*", "/settings"];

  const showQuickNav = validPaths.includes(location.pathname);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <Navigation />

        {/* Quick nav chỉ hiện khi route hợp lệ */}
        {showQuickNav ? (
          <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-16 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex space-x-1 py-3">
                <Link
                  to="/home"
                  className="px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 hover:bg-gray-100"
                >
                  Home
                </Link>
                <Link to="/search" className="px-4 py-2 rounded-2xl text-sm">
                  Search Jobs
                </Link>
                <Link to="/profile" className="px-4 py-2 rounded-2xl text-sm">
                  My Profile
                </Link>
              </div>
            </div>
          </div>
        ) : null}

        <Routes>
          <Route path="/home" element={<CandidateHome />} />
          <Route path="/" element={<CandidateHome />} />
          <Route path="/search" element={<JobSearch />} />
          <Route path="/profile" element={<CandidateProfile />} />
          <Route path="/job-detail/:id" element={<JobDetail />} />
          <Route path="/upload/*" element={<CandidateProfile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
      {/* ChatBot chỉ hiển thị trong các trang candidate */}
      <ChatBot />
    </>
  );
}

export default CandidateApp;
