import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ChangePasswordModal from '../components/modals/ChangePasswordModal';
import { getProfile, logout } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PersonAvatar from '../components/PersonAvatar';
import './Profile.css';



export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getProfile()
        .then(r => setProfile(r.data))
        .catch(() => setLoadError(true));
  }, []);

  const handleLogout = async () => {
    try { await logout(); } catch {}
    signOut();
    navigate('/login');
  };

  if (loadError) {
    return (
        <Layout>
          <div className="profile-center-wrapper">
            <div className="profile-card">
              <div className="profile-error-state">
                <PersonAvatar size={90} />
                <p style={{ color: 'var(--text-muted)', marginTop: 16, fontSize: 16 }}>
                  Could not load profile. Please make sure you're logged in.
                </p>
                <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={handleLogout}>
                  Go to Login
                </button>
              </div>
            </div>
          </div>
        </Layout>
    );
  }

  if (!profile) {
    return (
        <Layout>
          <div className="profile-center-wrapper">
            <div className="profile-skeleton">
              <div className="skeleton-avatar" />
              <div className="skeleton-line" style={{ width: 160, marginTop: 16 }} />
              <div className="skeleton-line" style={{ width: 120, marginTop: 8 }} />
              <div className="skeleton-block" style={{ marginTop: 28 }} />
            </div>
          </div>
        </Layout>
    );
  }

  const firstName = profile.firstName || profile.fName || '';
  const lastName = profile.lastName || profile.lName || '';
  const displayName = profile.fullName || profile.name ||
      (firstName || lastName ? `${firstName} ${lastName}`.trim() : '');

  return (
      <Layout>
        <div className="page-header">
          <h1>My Profile</h1>
        </div>

        <div className="profile-center-wrapper">
          <div className="profile-card">
            <div className="profile-avatar-section">
              <PersonAvatar size={110} />
              {displayName && <p className="profile-display-name">{displayName}</p>}
              {(profile.email || profile.emailAddress) &&
                  <p className="profile-display-email">{profile.email || profile.emailAddress}</p>}
              {(profile.phoneNo || profile.phoneNumber) &&
                  <p className="profile-display-email">{profile.phoneNo || profile.phoneNumber}</p>}
            </div>

            <div className="profile-info">
              <ProfileField label="Full Name" value={displayName || '—'} />
              <ProfileField label="Email" value={profile.email || profile.emailAddress || '—'} />
              <ProfileField label="Phone Number" value={profile.phoneNumber || profile.phoneNo || '—'} />
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
        </div>

        {showChangePw && <ChangePasswordModal onClose={() => setShowChangePw(false)} />}
      </Layout>
  );
}

function ProfileField({ label, value }) {
  return (
      <div className="profile-row">
        <div className="profile-field">
          <label>{label}</label>
          <span>{value}</span>
        </div>
      </div>
  );
}