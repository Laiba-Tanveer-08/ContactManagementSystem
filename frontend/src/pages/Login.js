import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, getProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Auth.css';
import loginImg from '../assets/login.jpg';

export default function Login() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { signIn } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        if (!identifier.trim()) { setError('Please enter your email or phone number.'); return; }
        if (!password) { setError('Please enter your password.'); return; }
        setLoading(true);
        try {
            const res = await login({ identifier: identifier.trim(), password });
            const raw = typeof res.data === 'string' ? res.data : res.data?.token;
            const token = raw?.trim();
            if (!token || !/^[\w-]+\.[\w-]+\.[\w-]+$/.test(token)) {
                setError('Login failed. Please check your credentials.');
                setLoading(false);
                return;
            }
            localStorage.setItem('token', token);
            const profileRes = await getProfile();
            signIn(token, profileRes.data);
            navigate('/contacts');
        } catch (err) {
            const msg = err?.response?.data;
            setError(typeof msg === 'string' && msg ? msg : 'Invalid credentials. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-image-half" style={{ backgroundImage: `url(${loginImg})` }}>
                <div className="auth-image-overlay">

                </div>
            </div>
            <div className="auth-form-half">
                <div className="auth-form-card">
                    <h2>Welcome Back!</h2>
                    <p>Sign in to manage your contacts effortlessly.</p>

                    {error && <div className="form-error">{error}</div>}
                    <form onSubmit={handleLogin} noValidate>
                        <div className="form-group">
                            <label htmlFor="identifier">Email or Phone</label>
                            <div className="input-icon-wrap">
                                <EmailIcon />
                                <input
                                    id="identifier"
                                    type="text"
                                    placeholder="Enter email or phone number"
                                    value={identifier}
                                    onChange={e => setIdentifier(e.target.value)}
                                    autoComplete="username"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="input-icon-wrap">
                                <LockIcon />
                                <input
                                    id="password"
                                    type={showPw ? 'text' : 'password'}
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                />
                                <button type="button" className="pw-eye" onClick={() => setShowPw(s => !s)}>
                                    <EyeIcon visible={showPw} />
                                </button>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 10 }} disabled={loading}>
                            {loading ? 'Signing in…' : 'Sign In'}
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

function EmailIcon() {
    return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
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