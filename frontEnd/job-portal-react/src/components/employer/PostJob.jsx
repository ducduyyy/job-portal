import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthProvider';
import {
  MapPin,
  DollarSign,
  Plus,
  X,
  Save,
  Send,
  CheckCircle, XCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";

export function PostJob() {

  const { user, token } = useAuth();

  const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: { Authorization: `Bearer ${token}` }
  });

  const [jobData, setJobData] = useState({
    title: '',
    companyName: 'TechFlow Inc.',
    location: '',
    type: '',
    salaryMin: '',
    salaryMax: '',
    currency: 'USD',
    experienceLevel: '',
    industry: '',
    description: '',
    rerequiredExperience: '',
    jobIMG: '',
    requirements: [''],
    skills: [],
    benefit: [''],
    featured: false
  });

  const [jobTypes, setJobTypes] = useState([]);
  const [experienceLevels, setExperienceLevels] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [currentSkillDescription, setCurrentSkillDescription] = useState('');

  const [showDialog, setShowDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogType, setDialogType] = useState("info"); // "success" | "error"


  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [typesRes, levelsRes, industriesRes] = await Promise.all([
          api.get('/jobs/types'),
          api.get('/jobs/experience-levels'),
          api.get('/industries'),
        ]);

        setJobTypes(typesRes.data);
        setExperienceLevels(levelsRes.data);
        setIndustries(industriesRes.data);
      } catch (error) {
        console.error('❌ Lỗi khi tải dữ liệu dropdown:', error);
      }
    };

    fetchDropdownData();
  }, []);

  useEffect(() => {
    const fetchSkillsByIndustry = async () => {
      if (!jobData.industry?.id) {
        setAvailableSkills([]);
        return;
      }

      try {
        const res = await api.get(`/industries/${jobData.industry.id}/skills`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = Array.isArray(res.data) ? res.data : [];
        console.log("📚 Skills fetched:", data);
        setAvailableSkills(data);
      } catch (err) {
        console.error("❌ Error fetching skills for industry:", err);
        setAvailableSkills([]);
      }

    };

    fetchSkillsByIndustry();
  }, [jobData.industry?.id]);

  const addSkill = () => {
    const skillName = currentSkill.trim();
    const skillDesc = currentSkillDescription.trim();
    if (!skillName) return;

    // Kiểm tra trùng skill
    if (jobData.skills.some(s => s.name === skillName)) {
      setCurrentSkill('');
      setCurrentSkillDescription('');
      return;
    }

    // Tạo skill tạm (chưa lưu DB)
    const tempSkill = {
      id: Date.now(), // ID tạm thời
      name: skillName,
      description: skillDesc || '',
      isTemporary: true, // Đánh dấu là chưa được lưu DB
    };

    // Thêm skill tạm vào danh sách
    setJobData(prev => ({
      ...prev,
      skills: [...prev.skills, tempSkill],
    }));

    // Xoá input
    setCurrentSkill('');
    setCurrentSkillDescription('');
  };



  const removeSkill = (skill) => {
    setJobData({
      ...jobData,
      skills: jobData.skills.filter(s => s !== skill)
    });
  };

  const addListItem = (field) => {
    setJobData({
      ...jobData,
      [field]: [...jobData[field], '']
    });
  };

  const updateListItem = (field, index, value) => {
    const updated = [...jobData[field]];
    updated[index] = value;
    setJobData({
      ...jobData,
      [field]: updated
    });
  };

  const removeListItem = (field, index) => {
    const updated = jobData[field].filter((_, i) => i !== index);
    setJobData({
      ...jobData,
      [field]: updated
    });
  };

  // Trong PostJob.jsx

  const handleSubmit = async (isDraft = false) => {
    try {
      setLoading(true);

      // 1. CHUẨN HÓA DANH SÁCH TÊN SKILL VÀ XỬ LÝ SKILL MỚI/TẠM THỜI

      // Tạo mảng chỉ chứa tên (String) từ custom skills và selected skills
      const customSkillNames = jobData.skills.map(s => s.name);
      const existingSkillNames = selectedSkills.map(s => s.name);

      // Tạo danh sách tên skill cuối cùng, loại bỏ trùng lặp
      const finalSkillNames = [...new Set([...customSkillNames, ...existingSkillNames])];


      // 2. XỬ LÝ LƯU SKILL MỚI (nếu không phải Draft)
      // Duyệt qua các skill tạm thời và post chúng lên /api/skills
      // Logic này đảm bảo các skill mới được tạo trong DB trước khi Job được liên kết.
      if (!isDraft) {
        const newTemporarySkills = jobData.skills.filter(s => s.isTemporary);

        for (const skill of newTemporarySkills) {
          try {
            // Endpoint POST /api/skills (được gọi từ FE)
            await api.post('/skills', {
              name: skill.name,
              description: skill.description || '',
              industryId: jobData.industry?.id || null,
            });
          } catch (err) {
            // Log lỗi nhưng không dừng submit Job nếu Skill đã tồn tại hoặc lỗi nhỏ
            console.warn(`Lỗi khi lưu Skill mới "${skill.name}":`, err);
          }
        }
      }


      // 3. XÂY DỰNG PAYLOAD CUỐI CÙNG
      const payload = {
        title: jobData.title,
        description: jobData.description,
        location: jobData.location,

        // ✅ FIX: Gửi Number hoặc null (Backend mong đợi BigDecimal)
        salaryMin: jobData.salaryMin ? parseFloat(jobData.salaryMin) : null,
        salaryMax: jobData.salaryMax ? parseFloat(jobData.salaryMax) : null,

        // Chuyển đổi Enum Type
        jobType: jobData.type ? jobData.type.toUpperCase().replace(/[-\s]/g, '_') : null,
        level: jobData.experienceLevel
          ? jobData.experienceLevel.toUpperCase().replace(/[-\s]/g, '_')
          : null,

        status: isDraft ? 'DRAFT' : 'OPEN',
        featured: jobData.featured,
        viewsCount: 0,

        // Industry info
        industryId: jobData.industry?.id || null,

        // PostedBy info
        postedById: user?.id || null,
        postedByName: jobData?.companyName || jobData.company,

        // ✅ FIX LỖI 1 (REQUIRED EXPERIENCE): Chuyển thành Integer hoặc null
        requiredExperience: jobData.rerequiredExperience ? parseInt(jobData.rerequiredExperience) : null,

        // ✅ FIX LỖI 2 (SKILLS JSON PARSE): Gửi List<String>
        // Backend JobDto có field `List<String> skills;`
        skills: finalSkillNames,

        // Gửi List<String> cho Requirements và Benefits
        requirements: jobData.requirements.filter(req => req.trim() !== ''),
        jobIMG: jobData.jobIMG || null,
        benefit: jobData.benefit.filter(ben => ben.trim() !== ''),
      };

      // ❗ Dòng console.log này là rất quan trọng để kiểm tra kiểu dữ liệu cuối cùng
      console.log("🚀 Submitting job payload (Final payload):", payload);

      const response = await api.post('/jobs', payload);
      console.log('✅ Job created:', response.data);
      alert(isDraft ? 'Bản nháp đã được lưu!' : 'Đăng job thành công!');

      // --- RESET STATE ---
      setJobData({
        title: '',
        company: 'TechFlow Inc.',
        location: '',
        type: '',
        salaryMin: '',
        salaryMax: '',
        currency: 'USD',
        experienceLevel: '',
        industry: '',
        description: '',
        rerequiredExperience: '', // Đã sửa tên biến
        jobIMG: '',
        requirements: [''],
        skills: [], // Chứa objects
        benefit: [''],
        featured: false,
      });
      setAvailableSkills([]);
      setSelectedSkills([]);
    } catch (error) {
      console.error('❌ Lỗi khi gửi dữ liệu:', error);
      // Cố gắng hiển thị thông báo lỗi chi tiết hơn từ API nếu có
      const errorMessage = error.response?.data || 'Có lỗi xảy ra khi gửi dữ liệu!';
      alert(`Gửi thất bại: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Post a New Job</h1>
          <p className="text-gray-600">Fill in the details below to create your job posting</p>
        </div>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Job Details</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          {/* BASIC INFO TAB */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Essential details about the job position</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="company"
                      value={jobData.title}
                      placeholder="e.g. Senior Frontend Developer"
                      onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={jobData.company}
                      placeholder="e.g. TechFlow Inc."
                      onChange={(e) => setJobData({ ...jobData, company: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                      <Input
                        id="location"
                        placeholder="e.g. San Francisco, CA"
                        className="pl-10"
                        value={jobData.location}
                        onChange={(e) => setJobData({ ...jobData, location: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="type">Job Type *</Label>
                    <Select value={jobData.type} onValueChange={(value) => setJobData({ ...jobData, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label>Salary Range</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    <div>
                      <Label htmlFor="salaryMin" className="text-sm">Minimum</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                        <Input
                          id="salaryMin"
                          placeholder="50000"
                          className="pl-10"
                          value={jobData.salaryMin}
                          onChange={(e) => setJobData({ ...jobData, salaryMin: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="salaryMax" className="text-sm">Maximum</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                        <Input
                          id="salaryMax"
                          placeholder="80000"
                          className="pl-10"
                          value={jobData.salaryMax}
                          onChange={(e) => setJobData({ ...jobData, salaryMax: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="currency" className="text-sm">Currency</Label>
                      <Select value={jobData.currency} onValueChange={(value) => setJobData({ ...jobData, currency: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="CAD">CAD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="experience">Experience Level</Label>
                    <Select value={jobData.experienceLevel} onValueChange={(value) => setJobData({ ...jobData, experienceLevel: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        {experienceLevels.map((level) => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Select
                      value={jobData.industry?.id ? String(jobData.industry.id) : ''}
                      onValueChange={async (id) => {
                        const selectedIndustry = industries.find((ind) => String(ind.id) === id);
                        console.log("🏭 Selected industry:", selectedIndustry);
                        setJobData({ ...jobData, industry: selectedIndustry });

                        try {
                          const res = await api.get(`/industries/${id}/skills`, {
                            headers: { Authorization: `Bearer ${token}` }
                          });

                          const data = res.data.skills || res.data || [];
                          console.log("📚 Skills fetched:", data);

                          setAvailableSkills(Array.isArray(data) ? data : []);
                        } catch (err) {
                          console.error("❌ Error fetching skills for industry:", err);
                          setAvailableSkills([]);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry.id} value={String(industry.id)}>
                            {industry.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>



                  </div>

                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remote"
                      checked={jobData.remote}
                      onCheckedChange={(checked) => setJobData({ ...jobData, remote: checked })}
                    />
                    <Label htmlFor="remote">Remote work available</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="featured"
                      checked={jobData.featured}
                      onCheckedChange={(checked) => setJobData({ ...jobData, featured: checked })}
                      disabled={true}
                    />
                    <Label htmlFor="featured">Featured posting (+$50)</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ... giữ nguyên toàn bộ phần details, requirements ... */}
          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
                <CardDescription>Provide a detailed description of the role</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Describe the role, company culture, and what makes this opportunity unique..."
                  className="min-h-32"
                  value={jobData.description}
                  onChange={(e) => setJobData({ ...jobData, description: e.target.value })}
                />
              </CardContent>
            </Card>

            {/* <Card>
              <CardHeader>
                <CardTitle>Key Responsibilities</CardTitle>
                <CardDescription>List the main responsibilities for this role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {jobData.responsibilities.map((responsibility, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="e.g. Develop and maintain React applications"
                        value={responsibility}
                        onChange={(e) => updateListItem('responsibilities', index, e.target.value)}
                      />
                      {jobData.responsibilities.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeListItem('responsibilities', index)}
                        >
                          <X className="size-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addListItem('responsibilities')}
                  >
                    <Plus className="size-4 mr-2" />
                    Add Responsibility
                  </Button>
                </div>
              </CardContent>
            </Card> */}

            <Card>
              <CardHeader>
                <CardTitle>Benefits & Perks</CardTitle>
                <CardDescription>What benefits do you offer?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {jobData.benefit.map((benefit, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="e.g. Health insurance, 401k matching"
                        value={benefit}
                        onChange={(e) => updateListItem('benefit', index, e.target.value)}
                      />
                      {jobData.benefit.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeListItem('benefit', index)}
                        >
                          <X className="size-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addListItem('benefit')}
                  >
                    <Plus className="size-4 mr-2" />
                    Add Benefit
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* UPLOAD JOB IMAGE */}
            <Card>
              <CardHeader>
                <CardTitle>Job Image</CardTitle>
                <CardDescription>Upload an image to represent this job or your company</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    {/* Hiển thị ảnh xem trước nếu có */}
                    {jobData.jobIMG ? (
                      <img
                        src={jobData.jobIMG}
                        alt="Job Preview"
                        className="w-32 h-32 object-cover rounded-md border"
                      />
                    ) : (
                      <div className="w-32 h-32 flex items-center justify-center border rounded-md text-gray-400 text-sm">
                        No Image
                      </div>
                    )}

                    {/* Input upload */}
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          const formData = new FormData();
                          formData.append("file", file);

                          try {
                            setLoading(true);
                            // ⚙️ Gửi file lên backend
                            const res = await api.post(`/jobs/upload-image/${user?.id}`, formData, {
                              headers: {
                                "Content-Type": "multipart/form-data",
                                Authorization: `Bearer ${token}`,
                              },
                            });

                            // Lấy URL trả về từ backend
                            const jobIMG = res.data.url || res.data.jobIMG || res.data;

                            // Lưu URL vào state
                            setJobData((prev) => ({ ...prev, jobIMG }));

                            setDialogTitle("Success");
                            setDialogMessage("Your image has been uploaded successfully!");
                            setDialogType("success");
                            setShowDialog(true);

                          } catch (err) {
                            console.error("❌ Error uploading image:", err);
                            setDialogTitle("Error");
                            setDialogMessage("Upload failed. Please try again.");
                            setDialogType("error");
                            setShowDialog(true);

                          } finally {
                            setLoading(false);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </TabsContent>

          <TabsContent value="requirements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
                <CardDescription>List the qualifications and requirements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {jobData.requirements.map((requirement, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="e.g. 3+ years experience with React"
                        value={requirement}
                        onChange={(e) => updateListItem('requirements', index, e.target.value)}
                      />
                      {jobData.requirements.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeListItem('requirements', index)}
                        >
                          <X className="size-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addListItem('requirements')}
                  >
                    <Plus className="size-4 mr-2" />
                    Add Requirement
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
                <CardDescription>Add relevant skills for this position</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* CHỌN SKILL CÓ SẴN */}
                  <div>
                    <h4 className="font-semibold mb-2">Select Existing Skills</h4>
                    {availableSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-3">
                        {availableSkills.map((skill) => (
                          <div
                            key={skill.id}
                            className="flex items-center space-x-2 border rounded-md px-3 py-1"
                          >
                            <Checkbox
                              id={`skill-${skill.id}`}
                              checked={selectedSkills.some((s) => s.id === skill.id)}
                              onCheckedChange={(checked) => {
                                setSelectedSkills((prev) =>
                                  checked
                                    ? [...prev, skill]
                                    : prev.filter((s) => s.id !== skill.id)
                                );
                              }}
                            />
                            <Label htmlFor={`skill-${skill.id}`}>{skill.name}</Label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">
                        No skills available for this industry
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* THÊM CUSTOM SKILL */}
                  <div>
                    <h4 className="font-semibold mb-2">Add Custom Skills</h4>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g. Next.js, GraphQL"
                        value={currentSkill}
                        onChange={(e) => setCurrentSkill(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                      />
                      <Input
                        placeholder="Skill description (optional)"
                        value={currentSkillDescription}
                        onChange={(e) => setCurrentSkillDescription(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                      />
                      <Button onClick={addSkill}>
                        <Plus className="size-4" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {jobData.skills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <div className="flex flex-col text-left">
                            <span className="font-medium">{skill.skillName || skill.name}</span>
                            {skill.description && (
                              <span className="text-xs text-gray-600">{skill.description}</span>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 ml-1"
                            onClick={() => removeSkill(skill)}
                          >
                            <X className="size-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Posting Preview</CardTitle>
                <CardDescription>This is how your job will appear to candidates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    {jobData.jobIMG ? (
                      <img
                        src={jobData.jobIMG}
                        alt="Job"
                        className="w-20 h-20 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
                        No Image
                      </div>
                    )}

                    <div>
                      <h2 className="text-2xl font-bold">{jobData.title || 'Job Title'}</h2>
                      <p className="text-lg text-gray-600">{jobData.company}</p>
                      <div className="flex items-center gap-4 text-gray-600 mt-2">
                        <div className="flex items-center">
                          <MapPin className="size-4 mr-1" />
                          {jobData.location || 'Location'}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="size-4 mr-1" />
                          {jobData.salaryMin && jobData.salaryMax
                            ? `$${jobData.salaryMin} - $${jobData.salaryMax}`
                            : 'Salary not specified'}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {jobData.featured && (
                        <Badge className="bg-yellow-500 text-yellow-900">Featured</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {jobData.type && <Badge variant="outline">{jobData.type}</Badge>}
                    {jobData.experienceLevel && <Badge variant="outline">{jobData.experienceLevel}</Badge>}
                    {jobData.remote && <Badge variant="outline">Remote</Badge>}
                  </div>

                  {jobData.description && (
                    <div>
                      <h3 className="font-semibold mb-2">Job Description</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{jobData.description}</p>
                    </div>
                  )}

                  {jobData.skills.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Required Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {jobData.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">{skill.name || skill.skillName}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    disabled={loading}
                    onClick={() => handleSubmit(true)}
                  >
                    <Save className="mr-2 size-4" />
                    {loading ? 'Saving...' : 'Save as Draft'}
                  </Button>
                  <Button
                    className="flex-1"
                    disabled={loading}
                    onClick={() => handleSubmit(false)}
                  >
                    <Send className="mr-2 size-4" />
                    {loading ? 'Publishing...' : 'Publish Job'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-sm rounded-2xl shadow-lg text-center">
          <DialogHeader>
            {dialogType === "success" ? (
              <CheckCircle className="w-10 h-10 text-green-600 mx-auto" />
            ) : (
              <XCircle className="w-10 h-10 text-red-600 mx-auto" />
            )}
            <DialogTitle
              className={`mt-3 text-lg font-semibold ${dialogType === "success" ? "text-green-700" : "text-red-700"
                }`}
            >
              {dialogTitle}
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              {dialogMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className={`w-full ${dialogType === "success"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
                }`}
              onClick={() => setShowDialog(false)}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
