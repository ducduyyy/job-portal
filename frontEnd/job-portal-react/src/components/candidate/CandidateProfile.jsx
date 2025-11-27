// src/components/candidate/CandidateProfile.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthProvider';
import { Button } from '../ui/button.jsx';
import { Input } from '../ui/input.jsx';
import { Textarea } from '../ui/textarea.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.jsx';
import { Badge } from '../ui/badge.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs.jsx';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar.jsx';
import { SavedJobs } from './SavedJobs.jsx';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select.jsx";
import { Label } from "../ui/label.jsx";
import {
  Mail, Phone, MapPin, Globe, Upload, Edit3, Plus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog.jsx";

export function CandidateProfile() {
  const { user, token, role } = useAuth();
  const userId = user?.id;
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [appliedJobs, setAppliedJobs] = useState([]);

  const navigate = useNavigate();

  const URL_BASE = "http://localhost:8080/api/candidates";


  // ✅ B1: lấy profile
  useEffect(() => {
    if (!userId) return;
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${URL_BASE}/${userId}/profile`);
        setProfileData(res.data);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  // ✅ B2: lấy skills user
  useEffect(() => {
    if (!userId) return;
    const fetchSkills = async () => {
      try {
        const res = await axios.get(`${URL_BASE}/${userId}/skills`);
        setSkills(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching user skills:", err);
        setSkills([]);
      }
    };
    fetchSkills();
  }, [userId]);

  // ✅ B3: lấy toàn bộ skills
  useEffect(() => {
    const fetchAllSkills = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/industries`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAllSkills(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching all skills:", err);
      }
    };
    fetchAllSkills();
  }, []);

  const handleAddSkill = async () => {
    if (!selectedSkill) return;
    try {
      const [skillId, industryName] = selectedSkill.split("|");

      const res = await axios.post(`${URL_BASE}/${userId}/skills?skillId=${skillId}`);

      // FE hiển thị thêm industryName vào object skill
      setSkills((prev) => [
        ...prev,
        { ...res.data, industryName }
      ]);

      setSelectedSkill('');
    } catch (err) {
      console.error("Error adding skill:", err);
    }
  };


  const handleDeleteSkill = async (skillId) => {
    try {
      await axios.delete(`${URL_BASE}/${userId}/skills/${skillId}`);
      setSkills((prev) => prev.filter((s) => s.skillId !== skillId));
    } catch (err) {
      console.error("Error deleting skill:", err);
    }
  };
  console.log("current role:", role);

  useEffect(() => {
    if (!user?.id) return;

    const fetchApplications = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/applications/candidate/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("applications data:", res.data);
        setAppliedJobs(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching applications:", err);
      }
    };

    fetchApplications();
  }, [user]);


  const handleSaveProfile = async () => {
    try {
      const formData = new FormData();

      // ✅ Tạo object JSON chỉ chứa các field hợp lệ
      const profileCopy = { ...profileData };

      // Loại bỏ các field là File hoặc URL
      if (profileCopy.candidateIMG instanceof File || typeof profileCopy.candidateIMG === "string") {
        delete profileCopy.candidateIMG;
      }
      if (profileCopy.cvUrl instanceof File || typeof profileCopy.cvUrl === "string") {
        delete profileCopy.cvUrl;
      }

      formData.append(
        "profile",
        new Blob([JSON.stringify(profileCopy)], { type: "application/json" })
      );

      if (profileData.candidateIMG instanceof File) {
        formData.append("avatar", profileData.candidateIMG);
      }
      if (profileData.cvFiles && profileData.cvFiles.length > 0) {
        profileData.cvFiles.forEach(file => {
          if (file instanceof File) {
            formData.append("cvFiles", file); // gửi file mới
          } else if (typeof file === "string") {
            formData.append("existingCvUrls", file); // giữ lại file cũ
          }
        });
      }

      const res = await axios.post(`${URL_BASE}/edit/${userId}/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfileData((prev) => ({
        ...prev,
        ...res.data,
        candidateIMG: res.data.candidateIMG || prev.candidateIMG,
        cvUrl: res.data.cvUrl || prev.cvUrl,
      }));

      setEditMode(false);
    } catch (err) {
      console.error("Error saving profile:", err);
    }
  };

    if (!user || !token) {
    return (
      <div className="max-h-screen flex items-center justify-center bg-white-50 mt-60">
        <Card className="p-8 max-w-md w-full text-center shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Please Login</CardTitle>
            <CardDescription>
              You need to log in to view and edit your candidate profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => navigate("/login")}
            >
              Head to Login Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }


  if (loading) return <p>Loading...</p>;
  if (!profileData) return <p className="text-red-500">Profile not found</p>;


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader className="text-center">
                {/* Avatar Section */}
                <div className="relative mx-auto mb-4">
                  <Avatar className="size-24 mx-auto">
                    {/* Nếu profileData.candidateIMG là File, tạo URL tạm để preview */}
                    <AvatarImage
                      src={
                        profileData.candidateIMG instanceof File
                          ? URL.createObjectURL(profileData.candidateIMG) // live preview khi chọn file
                          : profileData.candidateIMG // URL từ backend
                      }
                    />
                    <AvatarFallback className="text-xl">
                      {profileData.fullName?.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {editMode && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 rounded-full p-2"
                    >
                      <Upload className="size-3" />
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            candidateIMG: e.target.files[0]
                          })
                        }
                      />
                    </Button>
                  )}
                </div>
                <CardTitle className="text-xl">{profileData.fullName}</CardTitle>
                <CardDescription className="text-base">{profileData.title}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-gray-600 text-sm">
                  <Mail className="size-4 mr-3" />
                  {profileData?.email || "No info"}
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <Phone className="size-4 mr-3" />
                  {profileData.phone || "No info"}
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <MapPin className="size-4 mr-3" />
                  {profileData.address || "No info"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">My Profile</h1>
              <Button
                variant="outline"
                onClick={() => {
                  if (!editMode) {
                    // Khi bật edit, gộp CV cũ vào cvFiles để không mất
                    setProfileData((prev) => ({
                      ...prev,
                      cvFiles: [...(prev.cvs || [])],
                    }));
                    setEditMode(true);
                  } else {
                    handleSaveProfile();
                  }
                }}
              >
                <Edit3 className="size-4 mr-2" />
                {editMode ? 'Save Changes' : 'Edit Profile'}
              </Button>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 gap-2 bg-transparent">
                <TabsTrigger
                  value="overview"
                  className="
                    rounded-lg border border-transparent 
                    hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600
                    data-[state=active]:border-blue-500 
                    data-[state=active]:bg-blue-50 
                    data-[state=active]:text-blue-600 
                    transition-all
                  "
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="skills"
                  className="
                    rounded-lg border border-transparent 
                    hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600
                    data-[state=active]:border-blue-500 
                    data-[state=active]:bg-blue-50 
                    data-[state=active]:text-blue-600 
                    transition-all
                  "
                >
                  Skills
                </TabsTrigger>
                <TabsTrigger
                  value="applications"
                  className="
                    rounded-lg border border-transparent 
                    hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600
                    data-[state=active]:border-blue-500 
                    data-[state=active]:bg-blue-50 
                    data-[state=active]:text-blue-600 
                    transition-all
                  "
                >
                  Applications
                </TabsTrigger>
                <TabsTrigger
                  value="savedjobs"
                  className="
                    rounded-lg border border-transparent 
                    hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600
                    data-[state=active]:border-blue-500 
                    data-[state=active]:bg-blue-50 
                    data-[state=active]:text-blue-600 
                    transition-all
                  "
                >
                  Saved Jobs
                </TabsTrigger>
              </TabsList>

              {/* Overview */}
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About Me</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">

                    {/* Full Name */}
                    {editMode ? (
                      <div>
                        <Label>Full Name</Label>
                        <Input
                          value={profileData.fullName || "No info"}
                          onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                        />
                      </div>
                    ) : (
                      <p><strong>Full Name:</strong> {profileData.fullName || "No info"}</p>
                    )}

                    {/* Email */}
                    {editMode ? (
                      <div>
                        <Label>Email</Label>
                        <Input
                          value={profileData?.email || "No info"}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        />
                      </div>
                    ) : (
                      <p><strong>Email:</strong> {profileData?.email || "No info"}</p>
                    )}

                    {/* Phone */}
                    {editMode ? (
                      <div>
                        <Label>Phone</Label>
                        <Input
                          value={profileData.phone || "No info"}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        />
                      </div>
                    ) : (
                      <p><strong>Phone:</strong> {profileData.phone || "No info"}</p>
                    )}

                    {/* Address */}
                    {editMode ? (
                      <div>
                        <Label>Address</Label>
                        <Input
                          value={profileData.address || "No info"}
                          onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                        />
                      </div>
                    ) : (
                      <p><strong>Address:</strong> {profileData.address || "No info"}</p>
                    )}

                    {/* Experience Years */}
                    {editMode ? (
                      <div>
                        <Label>Experience Years</Label>
                        <Input
                          type="number"
                          value={profileData.experienceYears || "No info"}
                          onChange={(e) => setProfileData({ ...profileData, experienceYears: e.target.value })}
                        />
                      </div>
                    ) : (
                      <p><strong>Experience Years:</strong> {profileData.experienceYears || "No info"}</p>
                    )}

                    {/* Education */}
                    {editMode ? (
                      <div>
                        <Label>Education</Label>
                        <Input
                          value={profileData.education || "No info"}
                          onChange={(e) => setProfileData({ ...profileData, education: e.target.value })}
                        />
                      </div>
                    ) : (
                      <p><strong>Education:</strong> {profileData.education || "No info"}</p>
                    )}

                    {/* Candidate Image */}
                    {editMode ? (
                      <div>
                        <Label>Profile Image</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setProfileData({ ...profileData, candidateIMG: e.target.files[0] })}
                        />
                      </div>
                    ) : (
                      <p><strong>Profile Image:</strong>
                        {profileData.candidateIMG ? <a href={profileData.candidateIMG} target="_blank" className="text-blue-600">View</a> : "Not uploaded"}
                      </p>
                    )}
                    {/* CV Section */}
                    {editMode ? (
                      <div>
                        <Label>CV Files</Label>
                        <div className="space-y-2">
                          {Array.isArray(profileData.cvFiles) && profileData.cvFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 border rounded cursor-pointer"
                              onClick={() => {
                                const url = file instanceof File ? URL.createObjectURL(file) : file;
                                window.open(url, "_blank");
                              }}
                            >
                              <span className="truncate">{file instanceof File ? file.name : file.split('/').pop()}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setProfileData({
                                    ...profileData,
                                    cvFiles: profileData.cvFiles.filter((_, i) => i !== idx),
                                  });
                                }}
                              >
                                ✕
                              </Button>
                            </div>
                          ))}
                          <Input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            multiple
                            onChange={(e) => {
                              const newFiles = Array.from(e.target.files);
                              setProfileData({
                                ...profileData,
                                cvFiles: [...(profileData.cvFiles || []), ...newFiles],
                              });
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Label>Uploaded CVs</Label>
                        {Array.isArray(profileData.cvs) && profileData.cvs.length > 0 ? (
                          profileData.cvs.map((cv, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 border rounded mb-1 cursor-pointer"
                              onClick={() => window.open(cv, "_blank")}
                            >
                              <span className="truncate">{cv.split('/').pop()}</span>
                            </div>
                          ))
                        ) : (
                          <p>No CV uploaded</p>
                        )}
                      </div>
                    )}
                    {/* Bio */}
                    {editMode ? (
                      <div>
                        <Label>Bio</Label>
                        <Textarea
                          value={profileData.bio || 'No info'}
                          onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        />
                      </div>
                    ) : (
                      <p><strong>Bio:</strong> {profileData.bio || "No info"}</p>
                    )}

                    {/* Status */}
                    <div className="flex items-center space-x-2">
                      <strong>Status:</strong>
                      <span className={`w-3 h-3 rounded-full ${profileData.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span>{profileData.isActive ? 'Active' : 'Inactive'}</span>
                    </div>

                  </CardContent>
                </Card>
              </TabsContent>
              {/* Skills */}
              <TabsContent value="skills" className="space-y-6">
                {/* Skills đã chọn */}
                {skills.length > 0 ? (
                  skills.map((skill) => (
                    <Card key={skill.skillId} className="p-3">
                      <CardContent className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-semibold text-gray-700">{skill.industryName}</p>
                          <p className="text-lg">{skill.skillName}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteSkill(skill.skillId)}>
                          ✕
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-gray-500">No skills added yet.</p>
                )}

                {/* Dropdown chọn skill */}
                <div className="flex space-x-2 items-center">
                  <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                    <SelectTrigger className="w-[300px]">
                      <SelectValue placeholder="Select Industry / Skill" />
                    </SelectTrigger>
                    <SelectContent>
                      {allSkills.map((industry) => (
                        <div key={industry.id}>
                          <div className="px-3 py-2 font-semibold text-gray-700">{industry.name}</div>
                          {industry.skills.map((skill) => (
                            <SelectItem key={skill.id} value={`${skill.id}|${industry.name}`}>
                              └ {skill.name}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddSkill}>
                    <Plus className="size-4 mr-2" /> Add Skill
                  </Button>
                </div>
              </TabsContent>


              {/* Applications */}
              <TabsContent value="applications" className="space-y-6">
                {appliedJobs.length === 0 ? (
                  <p className="text-gray-500 text-center">
                    You haven't applied for any jobs yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {appliedJobs.map((app) => (
                      <Card
                        key={app.id}
                        className="p-4 shadow-sm hover:bg-gray-50 transition relative"
                      >
                        <CardContent>
                          {/* Job title & info */}
                          <div>
                            <div className="flex justify-between items-center">
                              <h3 className="font-semibold text-lg">
                                {app.jobTitle || "Unknown Job"}
                              </h3>
                              <span
                                className={`capitalize font-medium ${app.status === "PENDING"
                                    ? "text-yellow-600"
                                    : app.status === "APPROVED"
                                      ? "text-green-600"
                                      : app.status === "REJECTED"
                                        ? "text-red-600"
                                        : "text-gray-600"
                                  }`}
                              >
                                {app.status?.toLowerCase() || "None"}
                              </span>
                            </div>
                            <p className="text-gray-600">
                              <strong>Location:</strong> {app.jobLocation || "N/A"}
                            </p>
                            <p className="text-gray-600 capitalize">
                              <strong>Type:</strong> {app.jobType?.toLowerCase() || "N/A"}
                            </p>
                            <p className="text-gray-600 capitalize">
                              <strong>Level required:</strong>{" "}
                              {app.jobLevel?.toLowerCase() || "N/A"}
                            </p>
                            <p className="text-gray-600">
                              <strong>Company:</strong> {app.companyName || "N/A"}
                            </p>
                          </div>

                          {/* Industry + time + cancel */}
                          <div className="mt-3 flex justify-between items-center text-sm text-gray-600">
                            <div className="flex items-center">💼 {app.industryName || "N/A"}</div>

                            <div className="flex items-center space-x-3">
                              <span className="flex items-center text-gray-500">
                                🕓 {new Date(app.appliedAt).toLocaleString()}
                              </span>

                              {/* Cancel button with modal confirm */}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 border-red-300 hover:bg-red-50"
                                  >
                                    Cancel
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Cancel Application</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to cancel your application for{" "}
                                      <strong>{app.jobTitle}</strong>? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Back</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-red-600 hover:bg-red-700 text-white"
                                      onClick={async () => {
                                        try {
                                          await axios.delete(
                                            `http://localhost:8080/api/applications/cancel`,
                                            {
                                              params: {
                                                candidateId: app.candidateId,
                                                jobId: app.jobId,
                                              },
                                            }
                                          );
                                          setAppliedJobs((prev) =>
                                            prev.filter((a) => a.id !== app.id)
                                          );
                                        } catch (err) {
                                          console.error("Error canceling application:", err);
                                          alert("Failed to cancel application.");
                                        }
                                      }}
                                    >
                                      Confirm Cancel
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>

                          {/* CV + Job links */}
                          <div className="mt-2 flex justify-end items-center space-x-4">
                            {/* View Job button */}
                            <a
                              href={`/job-detail/${app.jobId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm"
                            >
                              View Job
                            </a>

                            {/* View CV button */}
                            {app.cvUrl && (
                              <a
                                href={app.cvUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm"
                              >
                                View CV
                              </a>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/*Saved job*/}
              <TabsContent value="savedjobs" className="space-y-6">
                <SavedJobs />
              </TabsContent>

            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}


