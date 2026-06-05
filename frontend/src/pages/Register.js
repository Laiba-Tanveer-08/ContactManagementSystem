import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import './Auth.css';
import registerImg from '../assets/register.jpg';

export default function Register() {
  const [form, setForm] = useState({
    fullName: '', email: '', phoneNumber: '', password: '', confirmPassword: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    const name = form.fullName.trim();
    if (!name) {
      e.fullName = 'Full name is required.';
    } else if (/^\d+$/.test(name)) {
      e.fullName = 'Full name cannot be a number.';
    } else if (name.length < 2) {
      e.fullName = 'Full name must be at least 2 characters.';
    } else if (!/^[a-zA-Z\s'-]+$/.test(name)) {
      e.fullName = 'Full name can only contain letters, spaces, hyphens, and apostrophes.';
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      e.email = 'Enter a valid email address.';
    }
    if (form.phoneNumber && !/^\+?[\d\s\-()]{7,15}$/.test(form.phoneNumber.trim())) {
      e.phoneNumber = 'Enter a valid phone number.';
    }
    if (!form.email.trim() && !form.phoneNumber.trim()) {
      e.email = 'Provide at least an email or phone number.';
    }
    if (!form.password) {
      e.password = 'Password is required.';
    } else if (form.password.length < 6) {
      e.password = 'Password must be at least 6 characters.';
    }
    if (!form.confirmPassword) {
      e.confirmPassword = 'Please confirm your password.';
    } else if (form.password !== form.confirmPassword) {
      e.confirmPassword = "Passwords don't match.";
    }
    return e;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const nameParts = form.fullName.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' '); // fallback if single name

      await register({
        identifier: form.email.trim() || form.phoneNumber.trim(),
        firstName: firstName,
        lastName: lastName,
        password: form.password,
      });
      navigate('/login');
    } catch (err) {
      setServerError(err?.response?.data || 'Registration failed. Please try again.');
    }
    setLoading(false);
  };

  return (
      <div className="auth-page">
        <div className="auth-image-half" style={{ backgroundImage: `url(${registerImg})` }}>
          <div className="auth-image-overlay">

          </div>
        </div>
        <div className="auth-form-half">
          <div className="auth-form-card">
            <h2>Create Account</h2>
            <p className="subtitle">Register to get started</p>
            {serverError && <div className="form-error">{serverError}</div>}
            <form onSubmit={handleRegister} noValidate>
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <div className="input-icon-wrap">
                  <UserIcon />
                  <input id="fullName" type="text" placeholder="Enter full name" value={form.fullName} onChange={e => set('fullName', e.target.value)} />
                </div>
                {errors.fullName && <span className="field-error">{errors.fullName}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-icon-wrap">
                  <EmailIcon />
                  <input id="email" type="email" placeholder="Enter email" value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <div className="input-icon-wrap">
                  <PhoneIcon />
                  <input id="phoneNumber" type="tel" placeholder="Enter phone number" value={form.phoneNumber} onChange={e => set('phoneNumber', e.target.value)} />
                </div>
                {errors.phoneNumber && <span className="field-error">{errors.phoneNumber}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-icon-wrap">
                  <LockIcon />
                  <input id="password" type={showPw ? 'text' : 'password'} placeholder="Enter password" value={form.password} onChange={e => set('password', e.target.value)} autoComplete="new-password" />
                  <button type="button" className="pw-eye" onClick={() => setShowPw(s => !s)}><EyeIcon visible={showPw} /></button>
                </div>
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-icon-wrap">
                  <LockIcon />
                  <input id="confirmPassword" type={showCPw ? 'text' : 'password'} placeholder="Confirm password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} autoComplete="new-password" />
                  <button type="button" className="pw-eye" onClick={() => setShowCPw(s => !s)}><EyeIcon visible={showCPw} /></button>
                </div>
                {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
              </div>
              <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 8 }} disabled={loading}>
                {loading ? 'Registering…' : 'Register'}
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

function UserIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function EmailIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
}
function PhoneIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
}
function LockIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
}
function EyeIcon({ visible }) {
  return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {visible
            ? (<><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>)
            : (<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>)
        }
      </svg>
  );
}