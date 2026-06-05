import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import './Auth.css';

function RegisterIllustration() {
  return (
    <svg viewBox="0 0 320 260" xmlns="http://www.w3.org/2000/svg" className="auth-illustration">
      <circle cx="160" cy="130" r="110" fill="#DBEAFE" />
      
      {/* Desk */}
      <rect x="60" y="175" width="200" height="10" rx="4" fill="#93C5FD" />
      <rect x="80" y="185" width="8" height="30" rx="3" fill="#93C5FD" />
      <rect x="232" y="185" width="8" height="30" rx="3" fill="#93C5FD" />

      {/* Laptop */}
      <rect x="110" y="140" width="100" height="35" rx="4" fill="#1E3A5F" />
      <rect x="114" y="143" width="92" height="29" rx="2" fill="#2563EB" />
      {/* Screen content */}
      <rect x="118" y="147" width="50" height="4" rx="2" fill="#BFDBFE" />
      <rect x="118" y="155" width="38" height="3" rx="1.5" fill="#93C5FD" />
      <rect x="118" y="162" width="45" height="3" rx="1.5" fill="#93C5FD" />
      <circle cx="185" cy="158" r="8" fill="#10B981" />
      <path d="M181 158 L184 161 L190 155" stroke="white" strokeWidth="1.5" fill="none" />
      {/* Laptop base */}
      <rect x="100" y="174" width="120" height="5" rx="2" fill="#374151" />

      {/* Person - female at desk */}
      <g>
        {/* Chair back */}
        <rect x="150" y="135" width="6" height="50" rx="3" fill="#6B7280" />
        {/* Body */}
        <path d="M130 215 C130 195 140 188 155 185 C170 188 180 195 180 215Z" fill="#3B5998" />
        <path d="M148 185 L155 190 L162 185 L160 215 L150 215Z" fill="#E5E7EB" />
        {/* Neck */}
        <rect x="151" y="177" width="8" height="10" rx="3" fill="#F5C5A3" />
        {/* Head */}
        <ellipse cx="155" cy="168" rx="14" ry="15" fill="#F5C5A3" />
        {/* Hair */}
        <path d="M141 163 C141 150 169 150 169 163 C169 156 166 150 155 149 C144 150 141 156 141 163Z" fill="#7A5C4E" />
        <path d="M141 163 C139 167 139 176 142 182 C143 183 145 183 145 183 C142 178 141 172 141 163Z" fill="#7A5C4E" />
        <path d="M169 163 C171 167 171 176 168 182 C167 183 165 183 165 183 C168 178 169 172 169 163Z" fill="#7A5C4E" />
        {/* Arms at laptop */}
        <path d="M130 205 L140 195 L150 195" stroke="#F5C5A3" strokeWidth="8" strokeLinecap="round" fill="none" />
        <path d="M180 205 L170 195 L162 195" stroke="#F5C5A3" strokeWidth="8" strokeLinecap="round" fill="none" />
      </g>

      {/* Security shield floating */}
      <g transform="translate(205, 80)">
        <circle cx="0" cy="0" r="28" fill="white" opacity="0.9" />
        <path d="M0 -18 L15 -10 L15 5 C15 12 8 17 0 20 C-8 17 -15 12 -15 5 L-15 -10 Z" fill="#2563EB" />
        <path d="M-6 2 L-2 6 L8 -4" stroke="white" strokeWidth="2.5" fill="none" />
      </g>

      {/* Check badge */}
      <g transform="translate(100, 85)">
        <circle cx="0" cy="0" r="20" fill="white" opacity="0.9" />
        <circle cx="0" cy="0" r="14" fill="#10B981" />
        <path d="M-5 0 L-1 4 L6 -4" stroke="white" strokeWidth="2" fill="none" />
      </g>

      {/* Plant decoration */}
      <circle cx="80" cy="170" r="12" fill="#6B7280" />
      <ellipse cx="72" cy="155" rx="8" ry="10" fill="#10B981" transform="rotate(-20 72 155)" />
      <ellipse cx="84" cy="152" rx="7" ry="10" fill="#059669" transform="rotate(15 84 152)" />
      <ellipse cx="80" cy="150" rx="6" ry="9" fill="#10B981" />
    </svg>
  );
}

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', phoneNumber: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register({
        identifier: form.email || form.phoneNumber,
        fullName: form.fullName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        password: form.password,
      });
      navigate('/login');
    } catch (err) {
      setError(err?.response?.data || 'Registration failed. Please try again.');
    }
    setLoading(false);
  };

  const EyeBtn = ({ show, toggle }) => (
    <button type="button" className="pw-eye" onClick={toggle}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {show
          ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
          : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
        }
      </svg>
    </button>
  );

  return (
    <div className="auth-page">
      <div className="auth-left">
        <RegisterIllustration />
        <div className="auth-tagline">
          <h2>Create Your Account</h2>
          <p>Join thousands of users managing their contacts efficiently.</p>
        </div>
      </div>
      <div className="auth-right" style={{ width: 520 }}>
        <div className="auth-form-card" style={{ maxWidth: 420 }}>
          <h2>Create Account</h2>
          <p className="subtitle">Register to get started</p>
          {error && <div className="form-error">{error}</div>}
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-icon-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <input placeholder="Enter full name" value={form.fullName} onChange={e => set('fullName', e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <div className="input-icon-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input type="email" placeholder="Enter email" value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <div className="input-icon-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <input placeholder="Enter phone number" value={form.phoneNumber} onChange={e => set('phoneNumber', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="input-icon-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input type={showPw ? 'text' : 'password'} placeholder="Enter password" value={form.password} onChange={e => set('password', e.target.value)} required />
                <EyeBtn show={showPw} toggle={() => setShowPw(s => !s)} />
              </div>
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <div className="input-icon-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input type={showCPw ? 'text' : 'password'} placeholder="Confirm password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} required />
                <EyeBtn show={showCPw} toggle={() => setShowCPw(s => !s)} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
          <div className="auth-footer">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
