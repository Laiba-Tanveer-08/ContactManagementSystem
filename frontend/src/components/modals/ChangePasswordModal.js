import React, { useState } from 'react';
import Modal from './Modal';
import { changePassword } from '../../services/api';
import './Modal.css';

function EyeIcon({ visible }) {
  return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {visible
            ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
            : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
        }
      </svg>
  );
}

export default function ChangePasswordModal({ onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!currentPassword) { setError('Current password is required.'); return; }
    if (!newPassword) { setError('New password is required.'); return; }
    if (newPassword.length < 6) { setError('New password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setError("New passwords don't match."); return; }
    setLoading(true);
    try {
      const res = await changePassword({
        oldPassword: currentPassword,
        newPassword,
      });
      const msg = typeof res.data === 'string' ? res.data.toLowerCase() : '';
      if (msg.includes('invalid') || msg.includes('wrong') || msg.includes('incorrect')) {
        setError('Current password is incorrect.');
      } else {
        setSuccess(true);
        setTimeout(() => onClose(), 1500);
      }
    } catch (e) {
      const msg = e?.response?.data;
      setError(typeof msg === 'string' && msg ? msg : 'Failed to change password.');
    }
    setLoading(false);
  };

  return (
      <Modal title="Change Password" onClose={onClose}>
        <div className="modal-body">
          {success && (
              <div style={{background:'#D1FAE5',border:'1px solid #6EE7B7',color:'#065F46',borderRadius:7,padding:'10px 14px',marginBottom:16,fontSize:14}}>
                Password changed successfully!
              </div>
          )}
          {error && <div className="form-error">{error}</div>}

          <div className="form-group">
            <label>Current Password</label>
            <div className="pw-input-wrap">
              <input
                  type={showCur ? 'text' : 'password'}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
              />
              <button type="button" className="pw-eye" onClick={() => setShowCur(s => !s)}>
                <EyeIcon visible={showCur} />
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>New Password</label>
            <div className="pw-input-wrap">
              <input
                  type={showNew ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  autoComplete="new-password"
              />
              <button type="button" className="pw-eye" onClick={() => setShowNew(s => !s)}>
                <EyeIcon visible={showNew} />
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <div className="pw-input-wrap">
              <input
                  type={showConf ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
              />
              <button type="button" className="pw-eye" onClick={() => setShowConf(s => !s)}>
                <EyeIcon visible={showConf} />
              </button>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading || success}>
            {loading ? 'Saving...' : 'Reset Password'}
          </button>
        </div>
      </Modal>
  );
}