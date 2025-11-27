import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { EmployerDashboard } from "./components/employer/EmployerDashboard";
import { PostJob } from "./components/employer/PostJob";
import { EmployerProfile } from "./components/employer/EmployerProfle";
import { EmployerJobs } from "./components/employer/EmployerJobs";
import { ViewApplicants } from "./components/employer/ViewApplicants";
import { ApplicantDetail } from "./components/employer/ApplicantDetail";
import NotFound from "./components/default/NotFoundPage";
import { EmployerJobEdit } from "./components/employer/EmployerJobEdit";
import { Em } from "@radix-ui/themes/dist/cjs/index.js";

function EmployerApp() {
  const location = useLocation();

  const validPaths = [
    "/employer/dashboard",
    "/employer/jobs",
    "/employer/applicants",
    "/employer/applicants/:applicationId",
    "/employer/post-job",
    "/employer/company-profile",
    "/employer/jobs/:jobId/edit",
    "/employer/jobs/:jobId",
    "/employer/applications/:applicationId",
    "/employer/applications",
    ""
  ];

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
                <Link to="/employer/dashboard" className="px-4 py-2 rounded-2xl text-sm">
                  Dashboard
                </Link>
                <Link to="/employer/jobs" className="px-4 py-2 rounded-2xl text-sm">
                  Manage Jobs
                </Link>
                <Link to="/employer/applicants" className="px-4 py-2 rounded-2xl text-sm">
                  Applicants
                </Link>
                <Link to="/employer/post-job" className="px-4 py-2 rounded-2xl text-sm">
                  Post Job
                </Link>
                <Link to="/employer/company-profile" className="px-4 py-2 rounded-2xl text-sm">
                  Company Profile
                </Link>
              </div>
            </div>
          </div>
        ) : null}

        <Routes>
          <Route path="dashboard" element={<EmployerDashboard />} />
          <Route path="jobs" element={<EmployerJobs />} />
          <Route path="jobs/:jobId/edit" element={<EmployerJobEdit />} />
          <Route path="applicants" element={<ViewApplicants />} />
          <Route path="applications/:applicationId" element={<ApplicantDetail />} />
          <Route path="post-job" element={<PostJob />} />
          <Route path="company-profile" element={<EmployerProfile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  );
}

export default EmployerApp;