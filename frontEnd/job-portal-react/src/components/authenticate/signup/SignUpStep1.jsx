import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../ui/button';
import { Separator } from '../../ui/separator';
import { User, Building } from 'lucide-react';
import { Navigation } from '../../Navigation';
import Footer from "../../Footer";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import AuthService from '../../../services/AuthService';
import { useAuth } from '../../../context/AuthProvider';

export default function SignupStep1() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSelectType = (type) => {
    // Step 2 sẽ thực hiện register User
    navigate('/signup/step2', { state: { accountType: type } });
  };

  // const handleGoogleSignup = async (credentialResponse) => {
  //   try {
  //     setLoading(true);
  //     const res = await AuthService.loginWithGoogle(credentialResponse.credential);

  //     if (res.accessToken) {
  //       // ✅ Đăng nhập (và nếu user mới, backend sẽ tự tạo)
  //       login(res.accessToken, res.role, res.userId, res.refreshToken);
  //       await showModalAfterDelay("Login with Google Successfully!", "Success", 1000);

  //       // 🧩 Nếu user mới, chưa có role/profile → chuyển tới bước 3
  //       if (res.needProfileSetup) {
  //         navigate('/signup/step3', {
  //           state: {
  //             fromGoogle: true,
  //             userId: res.userId,
  //             accountType: res.role || '',
  //             userInfo: res.userInfo,
  //           },
  //         });
  //       } else if (res.role === "PERSONAL") {
  //         navigate("/home");
  //       } else if (res.role === "BUSINESS") {
  //         navigate("/employer/dashboard");
  //       } else {
  //         navigate("/");
  //       }
  //     } else {
  //       await showModalAfterDelay("Google login failed", "Error", 1500);
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     await showModalAfterDelay("Google login failed", "Error", 1500);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleGoogleSignup = async (credentialResponse) => {
    try {
      setLoading(true);
      const res = await AuthService.loginWithGoogle(credentialResponse.credential);
      console.log("Response from Google login:", res);

      if (res.alreadyRegistered) {
        console.log("alreadyRegistered", res.alreadyRegistered);
        console.log("You already have an account with:", res.email);
        alert(`You already have an account with: ${res.email}. Please log in instead.`);
        navigate("/login");
        return;
      }

      if (res.accessToken) {
        // ✅ Lưu thông tin vào context
        login(res.accessToken, res.role, res.userId, res.refreshToken);

        // 🧩 Nếu chưa có role → chuyển sang chọn role
        if (res.needRoleSelection || !res.role) {
          navigate(`/choose-role?userId=${res.userId}`);
          return;
        }

        // 🧩 Nếu đã có role nhưng chưa có profile → sang bước 3
        if (res.needProfileSetup) {
          navigate('/signup/step3', {
            state: {
              fromGoogle: true,
              userId: res.userId,
              accountType: res.role || '',
              userInfo: res.userInfo,
            },
          });
          return;
        }

        // ✅ Nếu đã đầy đủ role + profile
        if (res.role === "PERSONAL") {
          navigate("/home");
        } else if (res.role === "BUSINESS") {
          navigate("/employer/dashboard");
        } else {
          navigate("/");
        }
      } else {
        await showModalAfterDelay("Google signup failed", "Error", 1500);
      }
    } catch (err) {
      console.error(err);
      await showModalAfterDelay("Google signup failed", "Error", 1500);
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
                <p className="text-blue-500 mb-4">Step 1 of 3</p>
                <p className="text-gray-600">Choose your account type:</p>
              </div>

              {/* Account Type Options */}
              <div className="space-y-4 mb-8">
                <button
                  onClick={() => handleSelectType('PERSONAL')}
                  className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200">
                      <User className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg text-gray-900 mb-1">Personal</h3>
                      <p className="text-gray-600">For Candidates</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleSelectType('BUSINESS')}
                  className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200">
                      <Building className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg text-gray-900 mb-1">Business</h3>
                      <p className="text-gray-600">For Employers</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <Separator />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-white px-2 text-gray-500 text-sm">or</span>
                </div>
              </div>

              {/* Google Signup */}
              <div className="flex justify-center mb-6">
                {loading ? (
                  <Button disabled variant="outline" className="w-full border-gray-300 text-gray-700">
                    Signing in...
                  </Button>
                ) : (
                  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                    <GoogleLogin
                      onSuccess={handleGoogleSignup}
                      onError={() =>
                        showModalAfterDelay(
                          "Google login failed",
                          "Error",
                          1500
                        )
                      }
                      useOneTap
                      type="standard"
                      theme="outline"
                      shape="rectangular"
                      text="signup_with"
                    />
                  </GoogleOAuthProvider>
                )}
              </div>


              <div className="text-center">
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
