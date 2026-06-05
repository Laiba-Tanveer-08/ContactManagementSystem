import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, getProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

function LoginIllustration() {
  return (
    <svg viewBox="0 0 320 260" xmlns="http://www.w3.org/2000/svg" className="auth-illustration">
      {/* Background circle */}
      <circle cx="160" cy="130" r="110" fill="#DBEAFE" />
      
      {/* Big phonebook / contact book */}
      <rect x="90" y="55" width="110" height="140" rx="8" fill="#F59E0B" />
      <rect x="96" y="61" width="98" height="128" rx="6" fill="#FBBF24" />
      {/* Tabs on right */}
      <rect x="192" y="70" width="12" height="16" rx="3" fill="#F59E0B" />
      <rect x="192" y="94" width="12" height="16" rx="3" fill="#F59E0B" />
      <rect x="192" y="118" width="12" height="16" rx="3" fill="#F59E0B" />
      {/* Lines on book */}
      <rect x="106" y="85" width="60" height="4" rx="2" fill="#FDE68A" />
      <rect x="106" y="97" width="45" height="4" rx="2" fill="#FDE68A" />
      <rect x="106" y="115" width="55" height="4" rx="2" fill="#FDE68A" />
      <rect x="106" y="127" width="40" height="4" rx="2" fill="#FDE68A" />
      {/* Avatar circle on book */}
      <circle cx="120" cy="75" r="12" fill="#2563EB" />
      <circle cx="120" cy="71" r="5" fill="#BFDBFE" />
      <path d="M110 80 Q120 85 130 80" fill="#BFDBFE" />

      {/* Left person (female) */}
      <g>
        {/* Body */}
        <path d="M58 175 C58 155 68 148 80 145 C92 148 102 155 102 175Z" fill="#3B5998" />
        {/* Shirt */}
        <path d="M74 145 L80 150 L86 145 L84 175 L76 175Z" fill="#D1D5DB" />
        {/* Neck */}
        <rect x="76" y="137" width="8" height="10" rx="3" fill="#F5C5A3" />
        {/* Head */}
        <ellipse cx="80" cy="128" rx="13" ry="14" fill="#F5C5A3" />
        {/* Hair */}
        <path d="M67 124 C67 112 93 112 93 124 C93 118 90 113 80 112 C70 113 67 118 67 124Z" fill="#5C3D2E" />
        {/* Hand pointing */}
        <path d="M102 155 L118 148 L120 152 L104 160Z" fill="#F5C5A3" />
        <circle cx="120" cy="150" r="4" fill="#F5C5A3" />
      </g>

      {/* Right person (male) */}
      <g>
        {/* Body */}
        <path d="M218 175 C218 155 228 148 240 145 C252 148 262 155 262 175Z" fill="#1E3A5F" />
        {/* Shirt */}
        <path d="M234 145 L240 150 L246 145 L244 175 L236 175Z" fill="#E5E7EB" />
        {/* Neck */}
        <rect x="236" y="137" width="8" height="10" rx="3" fill="#F5C5A3" />
        {/* Head */}
        <ellipse cx="240" cy="128" rx="13" ry="14" fill="#F5C5A3" />
        {/* Hair */}
        <path d="M227 122 C227 110 253 110 253 122 C253 116 250 111 240 110 C230 111 227 116 227 122Z" fill="#5C3D2E" />
        {/* Briefcase */}
        <rect x="250" y="155" width="20" height="14" rx="3" fill="#2563EB" />
        <rect x="254" y="152" width="12" height="4" rx="2" fill="#1D4ED8" />
        <line x1="260" y1="155" x2="260" y2="169" stroke="#1D4ED8" strokeWidth="1.5" />
      </g>

      {/* Floating notification */}
      <rect x="185" y="58" width="90" height="38" rx="8" fill="white" filter="url(#shadow)" />
      <circle cx="200" cy="77" r="8" fill="#10B981" />
      <path d="M196 77 L199 80 L205 74" stroke="white" strokeWidth="1.5" fill="none" />
      <rect x="212" y="70" width="50" height="5" rx="2" fill="#E5E7EB" />
      <rect x="212" y="79" width="35" height="4" rx="2" fill="#E5E7EB" />

      <defs>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.1" />
        </filter>
      </defs>
    </svg>
  );
}

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
        const res = await login({ identifier, password });
        const token = res.data;  // plain string JWT
        localStorage.setItem('token', token);
      const profileRes = await getProfile();
      signIn(token, profileRes.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data || 'Login failed. Please check your credentials.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <LoginIllustration />
        <div className="auth-tagline">
          <h2>Welcome Back!</h2>
          <p>Sign in to continue to your contact management dashboard.</p>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-form-card">
          <h2>Login</h2>
          <p className="subtitle">Enter your credentials to access your account</p>
          {error && <div className="form-error">{error}</div>}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email or Phone Number</label>
              <div className="input-icon-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  type="text"
                  placeholder="Enter email or phone number"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="input-icon-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button type="button" className="pw-eye" onClick={() => setShowPw(s => !s)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {showPw
                      ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                    }
                  </svg>
                </button>
              </div>
            </div>
            <div className="forgot"><a href="#!">Forgot Password?</a></div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <div className="auth-footer">
            Don't have an account? <Link to="/register">Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
