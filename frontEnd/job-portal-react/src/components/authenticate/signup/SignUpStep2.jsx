import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Navigation } from '../../Navigation';
import { AuthProvider } from '../../../context/AuthProvider';
import Footer from "../../Footer";

export default function SignupStep2() {
  const location = useLocation();
  const navigate = useNavigate();
  const accountType = location.state?.accountType || 'PERSONAL';

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const role = accountType === 'PERSONAL' ? 'PERSONAL' : 'BUSINESS';

      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          role
        })
      });

      if (response.ok) {
        let data;
        try {
          data = await response.json();
        } catch {
          const text = await response.text();
          data = { message: text };
        }

        const userId = data.id || data.userId;

        if (!userId) {
          setErrors({ api: data.message || 'Missing userId in response' });
          return;
        }

        navigate('/signup/step3', {
          state: { accountType, userInfo: formData, userId }
        });

      } else {
        const errorData = await response.text();
        setErrors({ api: errorData || 'Registration failed' });
      }
    } catch (err) {
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
                <h1 className="text-2xl text-gray-900 mb-2">Create your account</h1>
                <p className="text-blue-500 mb-4">Step 2 of 3</p>
                <p className="text-gray-600 mb-4">Join our community of professionals and employers.</p>
                <div className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                  {accountType === 'PERSONAL' ? 'PERSONAL' : 'BUSINESS'}
                </div>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="username" className="text-gray-700">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`mt-1 ${errors.username ? 'border-red-500' : ''}`}
                  />
                  {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                </div>

                <div>
                  <Label htmlFor="email" className="text-gray-700">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`mt-1 ${errors.email ? 'border-red-500' : ''}`}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="password" className="text-gray-700">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`mt-1 ${errors.password ? 'border-red-500' : ''}`}
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                {errors.api && <p className="text-red-500 text-sm mt-2">{errors.api}</p>}

                <Button type="submit" disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600 text-white mt-6">
                  {loading ? 'Registering...' : 'Register'}
                </Button>
              </form>

              <div className="text-center mt-6">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-blue-500 hover:text-blue-600">
                    Login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
