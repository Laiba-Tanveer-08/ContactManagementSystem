import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ChangePasswordModal from '../components/modals/ChangePasswordModal';
import { getProfile, logout } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MaleAvatar } from '../components/ui/Avatars';
import './Profile.css';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [showChangePw, setShowChangePw] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getProfile().then(r => setProfile(r.data)).catch(() => {});
  }, []);

  const handleLogout = async () => {
    try { await logout(); } catch {}
    signOut();
    navigate('/login');
  };

  if (!profile) return <Layout><div className="loading-state">Loading...</div></Layout>;

  const joined = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'N/A';

  return (
    <Layout>
      <div className="page-header">
        <h1>My Profile</h1>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-section">
          <MaleAvatar size={90} />
        </div>
        <div className="profile-info">
          <div className="profile-row">
            <div className="profile-field">
              <label>Full Name</label>
              <span>{profile.fullName || profile.name || '—'}</span>
            </div>
          </div>
          <div className="profile-row">
            <div className="profile-field">
              <label>Email</label>
              <span>{profile.email || '—'}</span>
            </div>
          </div>
          <div className="profile-row">
            <div className="profile-field">
              <label>Phone Number</label>
              <span>{profile.phoneNumber || '—'}</span>
            </div>
          </div>
          <div className="profile-row">
            <div className="profile-field">
              <label>Member Since</label>
              <span>{joined}</span>
            </div>
          </div>
        </div>
        <div className="profile-actions">
          <button className="btn btn-outline-primary" onClick={() => setShowChangePw(true)}>
            Change Password
          </button>
          <button className="btn btn-outline-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {showChangePw && <ChangePasswordModal onClose={() => setShowChangePw(false)} />}
    </Layout>
  );
}
