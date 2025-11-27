import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Card, CardHeader, CardContent, CardTitle } from "../../components/ui/card";
import { Plus, ArrowLeft, X } from "lucide-react";
import { Header } from "@radix-ui/react-accordion";
import { useAuth } from "../../context/AuthProvider";

export function EmployerJobEdit() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [newRequirement, setNewRequirement] = useState("");
  const [newSkill, setNewSkill] = useState("");

  const { token } = useAuth();

  const URL_BASE = "http://localhost:8080/api/jobs";

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await axios.get(`${URL_BASE}/${jobId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Đảm bảo mảng không bị null
        setJob({
          ...data,
          requirements: Array.isArray(data.requirements)
            ? data.requirements
            : data.requirements
              ? data.requirements.split(",").map((r) => r.trim()).filter(Boolean)
              : [],
          skills: Array.isArray(data.skills)
            ? data.skills
            : data.skills
              ? data.skills.split(",").map((s) => s.trim()).filter(Boolean)
              : [],
        });

      } catch (err) {
        console.error("Error fetching job:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJob({ ...job, [name]: value });
  };

  // 🟢 Thêm requirement
  const addRequirement = () => {
    if (!newRequirement.trim()) return;
    setJob({
      ...job,
      requirements: [...(job.requirements || []), newRequirement.trim()],
    });
    setNewRequirement("");
  };

  // 🟢 Xóa requirement
  const removeRequirement = (index) => {
    const updated = [...job.requirements];
    updated.splice(index, 1);
    setJob({ ...job, requirements: updated });
  };

  // 🟢 Thêm skill
  const addSkill = () => {
    if (!newSkill.trim()) return;
    setJob({
      ...job,
      skills: [...(job.skills || []), newSkill.trim()],
    });
    setNewSkill("");
  };

  // 🟢 Xóa skill
  const removeSkill = (index) => {
    const updated = [...job.skills];
    updated.splice(index, 1);
    setJob({ ...job, skills: updated });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Chuẩn hoá dữ liệu trước khi gửi
      const payload = {
        ...job,
        requirements: Array.isArray(job.requirements)
          ? job.requirements
          : job.requirements
            ? [job.requirements]
            : [],
        skills: Array.isArray(job.skills)
          ? job.skills
          : job.skills
            ? [job.skills]
            : [],
      };

      await axios.put(`${URL_BASE}/${jobId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("✅ Job updated successfully!");
      navigate("/employer/jobs");
    } catch (err) {
      console.error("Error updating job:", err);
      alert("❌ Failed to update job.");
    } finally {
      setSaving(false);
    }
  };


  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!job) return <div className="p-8 text-center text-red-600">Job not found.</div>;

  return (
    <div className="max-w-4xl mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={() => navigate("/employer/jobs")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Manage Jobs
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Job: {job.title}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* --- Basic Info --- */}
          <div>
            <label className="block text-sm font-medium">Job Title</label>
            <Input name="title" value={job.title} onChange={handleChange} />
          </div>

          <div>
            <label className="block text-sm font-medium">Location</label>
            <Input name="location" value={job.location} onChange={handleChange} />
          </div>

          <div>
            <label className="block text-sm font-medium">Description</label>
            <Textarea
              name="description"
              rows={5}
              value={job.description}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Min Salary</label>
              <Input name="salaryMin" value={job.salaryMin || ""} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium">Max Salary</label>
              <Input name="salaryMax" value={job.salaryMax || ""} onChange={handleChange} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Status</label>
            <select
              name="status"
              value={job.status || "OPEN"}
              onChange={handleChange}
              className="border rounded p-2 w-full"
            >
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {/* --- Requirements Section --- */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Requirements</h3>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="e.g. 3+ years with React"
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
              />
              <Button onClick={addRequirement}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
            <ul className="space-y-2">
              {job.requirements?.map((req, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between bg-gray-50 border p-2 rounded"
                >
                  <span>{req}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRequirement(index)}
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          {/* --- Skills Section --- */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Skills</h3>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="e.g. Next.js, GraphQL"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
              />
              <Button onClick={addSkill}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
            <ul className="flex flex-wrap gap-2">
              {job.skills?.map((skill, index) => (
                <li
                  key={index}
                  className="flex items-center bg-blue-50 border border-blue-200 px-3 py-1 rounded-full"
                >
                  <span>{skill}</span>
                  <button
                    className="ml-2 text-sm text-red-500"
                    onClick={() => removeSkill(index)}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
