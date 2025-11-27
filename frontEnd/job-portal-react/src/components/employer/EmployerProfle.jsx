import { useEffect, useState } from 'react';
import { Button } from '../ui/button.jsx';
import { Input } from '../ui/input.jsx';
import { Textarea } from '../ui/textarea.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.jsx';
import { Badge } from '../ui/badge.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs.jsx';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar.jsx';
import { Progress } from '../ui/progress.jsx';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Upload,
  Edit3,
  Plus,
  Users,
  Calendar,
  Eye,
  ExternalLink,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthProvider.jsx';
import { Label } from "../ui/label.jsx";

export function EmployerProfile() {
  const { user, token } = useAuth();
  const userId = user?.id;
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const URL_BASE = "http://localhost:8080/api/employers";


  // Fetch profile
useEffect(() => {
  if (!userId) return;
  const fetchProfile = async () => {
    console.log("Token in EmployerProfile: ", token);
    try {
      const res = await axios.get(`${URL_BASE}/${userId}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = res.data;

      // ✅ Xử lý companyIMG để luôn là mảng
      setProfileData({
        ...data,
        companyIMG:
          typeof data.companyIMG === "string"
            ? data.companyIMG.split(",").map(img => img.trim())
            : Array.isArray(data.companyIMG)
            ? data.companyIMG
            : [],
      });

    } catch (err) {
      console.error("Error fetching profile: ", err);
    } finally {
      setLoading(false);
    }
  };
  fetchProfile();
}, [userId]);


  // Save profile
  const handleSaveProfile = async () => {
    try {
      const formData = new FormData();

      const profileCopy = { ...profileData };

      // Xóa các field file ra khỏi object JSON
      if (Array.isArray(profileCopy.companyIMG)) delete profileCopy.companyIMG;
      if (profileCopy.companyLogo instanceof File) delete profileCopy.companyLogo;

      formData.append(
        "profile",
        new Blob([JSON.stringify(profileCopy)], { type: "application/json" })
      );

      if (Array.isArray(profileData.companyIMG)) {
        profileData.companyIMG.forEach((file) => {
          if (file instanceof File) {
            formData.append("companyPic", file);
          }
        });
      }

      if (profileData.companyLogo instanceof File) {
        formData.append("logo", profileData.companyLogo);
      }

      const res = await axios.post(`${URL_BASE}/edit/${userId}/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("formData: ", formData.companyNumber)

setProfileData({
  ...res.data,
  companyIMG: typeof res.data.companyIMG === "string"
    ? res.data.companyIMG.split(",").map(img => img.trim())
    : Array.isArray(res.data.companyIMG)
    ? res.data.companyIMG
    : [],
});



      setEditMode(false);
    } catch (err) {
      console.error("Error saving profile:", err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!profileData) return <p className="text-red-500">Profile not found</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Company Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader className="text-center">
                <div className="relative mx-auto mb-4">
                  <Avatar className="size-24 mx-auto">
                    <AvatarImage
                      src={
                        profileData.companyLogo instanceof File
                          ? URL.createObjectURL(profileData.companyLogo) // live preview khi chọn file mới
                          : profileData.companyLogo // URL từ backend
                      }
                    />
                    <AvatarFallback className="text-xl bg-blue-100 text-blue-600">
                      {profileData.companyName?.split(' ').map(n => n[0]).join('').toUpperCase()}
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
                        onChange={(e) => setProfileData({
                          ...profileData,
                          companyLogo: e.target.files[0]
                        })}
                      />
                    </Button>
                  )}

                  <Button size="sm" variant="outline" className="absolute -bottom-2 -right-2 rounded-full p-2">
                    <Upload className="size-3" />
                  </Button>
                </div>
                <CardTitle className="text-xl">{profileData.companyName}</CardTitle>
                <CardDescription className="text-base">{profileData.companyAddress}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-gray-600 text-sm">
                  <Mail className="size-4 mr-3" />
                  {profileData.contactEmail}
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <Phone className="size-4 mr-3" />
                  {profileData.companyNumber}
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <MapPin className="size-4 mr-3" />
                  {profileData.companyAddress}
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <Globe className="size-4 mr-3" />
                  <a href={profileData.website} className="text-blue-600 hover:underline">
                    Company Website
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Company Profile</h1>
              <Button
                variant="outline"
                onClick={() => editMode ? handleSaveProfile() : setEditMode(true)}
              >
                <Edit3 className="size-4 mr-2" />
                {editMode ? 'Save Changes' : 'Edit Profile'}
              </Button>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="info">Information</TabsTrigger>
              </TabsList>

              {/* Overview */}
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Company Overview</CardTitle>
                    <CardDescription>General information about your company</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Logo + Name */}
                    <div className="flex items-center gap-6">
                      <Avatar className="size-24">
                        <AvatarImage src={profileData.companyLogo} alt="Company Logo" />
                        <AvatarFallback className="text-lg bg-blue-100 text-blue-600">
                          {profileData.companyName?.slice(0, 2).toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="text-2xl font-bold">{profileData.companyName}</h2>
                        <p className="text-gray-600">{profileData.companyAddress}</p>
                        <div className="flex items-center gap-4 text-gray-600 mt-2">
                          <div className="flex items-center">
                            <Mail className="size-4 mr-1" />
                            {profileData.contactEmail}
                          </div>
                          <div className="flex items-center">
                            <Phone className="size-4 mr-1" />
                            {profileData.companyNumber}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Company Images */}
                    {profileData.companyIMG?.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Company Images</h3>
                        <div className="flex flex-wrap gap-3">
                          {profileData.companyIMG.map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt={`Company ${i}`}
                              className="w-32 h-32 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Company Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                      <div className="p-4 bg-gray-100 rounded-lg">
                        <h4 className="text-sm text-gray-600">Founded</h4>
                        <p className="font-semibold">{profileData.foundedYear || "—"}</p>
                      </div>
                      <div className="p-4 bg-gray-100 rounded-lg">
                        <h4 className="text-sm text-gray-600">Employees</h4>
                        <p className="font-semibold">{profileData.companySize || "—"}</p>
                      </div>
                      <div className="p-4 bg-gray-100 rounded-lg">
                        <h4 className="text-sm text-gray-600">Website</h4>
                        {profileData.website ? (
                          <a
                            href={profileData.website}
                            target="_blank"
                            className="text-blue-600 hover:underline"
                          >
                            Visit
                          </a>
                        ) : (
                          <p>—</p>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h3 className="font-semibold mb-2">About Company</h3>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {profileData.companyDescription || "No description provided."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>


              {/* Company Info */}
              <TabsContent value="info" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About Company</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Company Name */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Company Name</Label>
                      {editMode ? (
                        <Input
                          value={profileData.companyName || ""}
                          onChange={(e) => setProfileData({ ...profileData, companyName: e.target.value })}
                        />
                      ) : (
                        <p className="text-gray-700">{profileData.companyName}</p>
                      )}
                    </div>

                    {/* Address */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Address</Label>
                      {editMode ? (
                        <Input
                          value={profileData.companyAddress || ""}
                          onChange={(e) => setProfileData({ ...profileData, companyAddress: e.target.value })}
                        />
                      ) : (
                        <p className="text-gray-700">{profileData.companyAddress}</p>
                      )}
                    </div>

                    {/* Contact Email */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Contact Email</Label>
                      {editMode ? (
                        <Input
                          value={profileData.contactEmail || ""}
                          onChange={(e) => setProfileData({ ...profileData, contactEmail: e.target.value })}
                        />
                      ) : (
                        <p className="text-gray-700">{profileData.contactEmail}</p>
                      )}
                    </div>

                    {/* Company Number */}
                    <div>
                      <Label>Company Number</Label>
                      {editMode ? (
                        <Input
                          value={profileData.companyNumber || ""}
                          onChange={(e) => setProfileData({ ...profileData, companyNumber: e.target.value })}
                        />
                      ) : (
                        <p className="text-gray-700">{profileData.companyNumber}</p>
                      )}
                    </div>

                    {/* Company Name */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Company Website</Label>
                      {editMode ? (
                        <Input
                          value={profileData.website || ""}
                          onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                        />
                      ) : (
                        <p className="text-gray-700">{profileData.website}</p>
                      )}
                    </div>

                    {/* Company Number */}
                    <div>
                      <Label>Founded Date</Label>
                      {editMode ? (
                        <Input
                          value={profileData.foundedYear || ""}
                          onChange={(e) => setProfileData({ ...profileData, foundedYear: e.target.value })}
                        />
                      ) : (
                        <p className="text-gray-700">{profileData.foundedYear}</p>
                      )}
                    </div>

                    {/* Company Number */}
                    <div>
                      <Label>Company total employer: </Label>
                      {editMode ? (
                        <Input
                          value={profileData.companySize || ""}
                          onChange={(e) => setProfileData({ ...profileData, companySize: e.target.value })}
                        />
                      ) : (
                        <p className="text-gray-700">{profileData.companySize}</p>
                      )}
                    </div>

                    {/* company logo */}
                    {editMode ? (
                      <div>
                        <Label>Company Logo</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setProfileData({ ...profileData, companyLogo: e.target.files[0] })}
                        />
                      </div>
                    ) : (
                      <p><strong>Company Logo:</strong>
                        {profileData.companyLogo ? <a href={profileData.companyLogo} target="_blank" className="text-blue-600">View</a> : "Not uploaded"}
                      </p>
                    )}

                    {/* company image (multiple) */}
                    <div>
                      <Label>Company Images</Label>
                      {editMode ? (
                        <>
                          {/* Hiển thị preview các ảnh đã có */}
                          <div className="flex flex-wrap gap-3 mb-2">
                            {profileData.companyIMG?.map((img, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={img instanceof File ? URL.createObjectURL(img) : img}
                                  alt={`Company ${index}`}
                                  className="w-32 h-32 object-cover rounded-lg"
                                />
                                <Button
                                  size="icon"
                                  variant="destructive"
                                  className="absolute -top-2 -right-2 rounded-full"
                                  onClick={() =>
                                    setProfileData({
                                      ...profileData,
                                      companyIMG: profileData.companyIMG.filter((_, i) => i !== index),
                                    })
                                  }
                                >
                                  ✕
                                </Button>
                              </div>
                            ))}
                          </div>

                          {/* Input upload nhiều ảnh */}
                          <Input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                companyIMG: [
                                  ...(profileData.companyIMG || []),
                                  ...Array.from(e.target.files),
                                ],
                              })
                            }
                          />
                        </>
                      ) : (
                        profileData.companyIMG?.length > 0 ? (
                          <div className="flex flex-wrap gap-3">
                            {profileData.companyIMG.map((img, index) => (
                              <img
                                key={index}
                                src={img}
                                alt={`Company ${index}`}
                                className="w-32 h-32 object-cover rounded-lg"
                              />
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">Not uploaded</p>
                        )
                      )}
                    </div>



                    {/* Company Description */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Description</label>
                      {editMode ? (
                        <Textarea
                          value={profileData.companyDescription || ""}
                          onChange={(e) => setProfileData({ ...profileData, companyDescription: e.target.value })}
                          className="min-h-32"
                        />
                      ) : (
                        <p className="text-gray-700 leading-relaxed">{profileData.companyDescription}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
