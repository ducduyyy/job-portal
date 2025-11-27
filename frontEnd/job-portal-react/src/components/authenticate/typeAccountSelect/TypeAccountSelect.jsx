import React, { useState } from 'react';
import Register from '../signup/Register';
import Login from '../login/users/login';


function TypeAccountSelect() {
  const [view, setView] = useState('register'); // hoặc 'login'

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white p-6 rounded shadow">
        {view === 'register' ? (
          <>
            <Register />
            <p className="mt-4 text-center">
              Đã có tài khoản?{' '}
              <button
                className="text-blue-500"
                onClick={() => setView('login')}
              >
                Đăng nhập
              </button>
            </p>
          </>
        ) : (
          <>
            <Login />
            <p className="mt-4 text-center">
              Chưa có tài khoản?{' '}
              <button
                className="text-blue-500"
                onClick={() => setView('register')}
              >
                Đăng ký
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default TypeAccountSelect;