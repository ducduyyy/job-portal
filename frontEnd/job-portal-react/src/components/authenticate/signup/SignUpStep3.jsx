import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Navigation } from '../../Navigation';
import { useAuth } from '../../../context/AuthProvider';
import Footer from "../../Footer";

export default function SignupStep3() {
  const navigate = useNavigate();
  const location = useLocation();
  const { accountType, userId, userInfo } = location.state || {};
  const { token } = useAuth(); // lấy token nếu có (trường hợp đăng ký Google)

  const [profileData, setProfileData] = useState(
    accountType === 'PERSONAL'
      ? { fullName: '', birthdate: '', phone: '', education:'', experienceYears:'' }
      : { companyName: '', companyAddress: '', yearFounded: '', webSite: '' }
  );

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const url =
      accountType === 'PERSONAL'
        ? `http://localhost:8080/api/candidates/${userId}/profile`
        : `http://localhost:8080/api/employers/${userId}/profile`;

    const headers = {
      'Content-Type': 'application/json',
    };

    // ✅ Nếu người dùng có token (login Google hoặc login thường)
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(profileData),
    });

    if (response.ok) {
      setSuccess(true);

      setTimeout(() => {
        // ✅ Có token → chuyển đúng dashboard
        if (token) {
          if (accountType === 'PERSONAL') navigate('/home');
          else if (accountType === 'BUSINESS') navigate('/employer/dashboard');
        } else {
          // ✅ Không có token → quay lại login
          navigate('/login');
        }
      }, 1500);
    } else {
      const errorText = await response.text();
      setErrors({ api: errorText || 'Profile creation failed' });
    }
  } catch (err) {
    console.error(err);
    setErrors({ api: 'Something went wrong, please try again.' });
  } finally {
    setLoading(false);
  }
};


  return (
    <>
        <Navigation />
      <div className="min-h-screen bg-gradient-to-b from-blue-500 to-white flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-lg shadow-lg p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-2xl text-gray-900 mb-2">
                  {accountType === 'PERSONAL'
                    ? 'Complete Your Candidate Profile'
                    : 'Complete Your Employer Profile'}
                </h1>
                <p className="text-blue-500 mb-4">Step 3 of 3</p>
              </div>

              {/* Profile Form */}
              {!success ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {accountType === 'PERSONAL' ? (
                    <>
                      <div>
                        <Label htmlFor="fullName" className="text-gray-700">
                          Full Name
                        </Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          type="text"
                          value={profileData.fullName}
                          onChange={handleInputChange}
                          className={`mt-1 ${
                            errors.fullName ? 'border-red-500' : ''
                          }`}
                        />
                        {errors.fullName && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.fullName}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="birthdate" className="text-gray-700">
                          Birthdate
                        </Label>
                        <Input
                          id="birthdate"
                          name="birthdate"
                          type="date"
                          value={profileData.birthdate}
                          onChange={handleInputChange}
                          className={`mt-1 ${
                            errors.birthdate ? 'border-red-500' : ''
                          }`}
                        />
                        {errors.birthdate && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.birthdate}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="phoneNumber" className="text-gray-700">
                          Phone Number
                        </Label>
                        <Input
                          id="phoneNumber"
                          name="phoneNumber"
                          type="tel"
                          value={profileData.phoneNumber}
                          onChange={handleInputChange}
                          className={`mt-1 ${
                            errors.phoneNumber ? 'border-red-500' : ''
                          }`}
                        />
                        {errors.phoneNumber && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.phoneNumber}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="education" className="text-gray-700">
                          Education
                        </Label>
                        <Input
                          id="education"
                          name="education"
                          type="text"
                          value={profileData.education}
                          onChange={handleInputChange}
                          className={`mt-1 ${
                            errors.education ? 'border-red-500' : ''
                          }`}
                        />
                        {errors.education && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.education}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="experienceYear" className="text-gray-700">
                          Experience Years
                        </Label>
                        <Input
                          id="experienceYear"
                          name="experienceYear"
                          type="number"
                          value={profileData.experienceYear}
                          onChange={handleInputChange}
                          className={`mt-1 ${
                            errors.experienceYear ? 'border-red-500' : ''
                          }`}
                        />
                        {errors.experienceYear && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.experienceYear}
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor="companyName" className="text-gray-700">
                          Company Name
                        </Label>
                        <Input
                          id="companyName"
                          name="companyName"
                          type="text"
                          value={profileData.companyName}
                          onChange={handleInputChange}
                          className={`mt-1 ${
                            errors.companyName ? 'border-red-500' : ''
                          }`}
                        />
                        {errors.companyName && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.companyName}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="companyAddress" className="text-gray-700">
                          Company Address
                        </Label>
                        <Input
                          id="companyAddress"
                          name="companyAddress"
                          type="text"
                          value={profileData.companyAddress}
                          onChange={handleInputChange}
                          className={`mt-1 ${
                            errors.companyAddress ? 'border-red-500' : ''
                          }`}
                        />
                        {errors.companyAddress && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.companyAddress}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="yearFounded" className="text-gray-700">
                          Year Founded
                        </Label>
                        <Input
                          id="yearFounded"
                          name="yearFounded"
                          type="number"
                          value={profileData.yearFounded}
                          onChange={handleInputChange}
                          className={`mt-1 ${
                            errors.yearFounded ? 'border-red-500' : ''
                          }`}
                        />
                        {errors.yearFounded && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.yearFounded}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="webSite" className="text-gray-700">
                          Company Website
                        </Label>
                        <Input
                          id="webSite"
                          name="webSite"
                          type="text"
                          value={profileData.webSite}
                          onChange={handleInputChange}
                          className={`mt-1 ${
                            errors.webSite ? 'border-red-500' : ''
                          }`}
                        />
                        {errors.webSite && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.webSite}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {errors.api && (
                    <p className="text-red-500 text-sm mt-2">{errors.api}</p>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white mt-6"
                  >
                    {loading ? 'Saving...' : 'Save Profile'}
                  </Button>
                </form>
              ) : (
                <div className="text-center">
                  <p className="text-green-600 font-medium">
                    Profile created successfully!
                  </p>
                  <p className="text-gray-600 mt-2">Redirecting to login...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
