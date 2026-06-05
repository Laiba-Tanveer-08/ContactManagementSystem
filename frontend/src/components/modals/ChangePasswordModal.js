import React, { useState } from 'react';
import Modal from './Modal';
import { changePassword } from '../../services/api';
import './Modal.css';

export default function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ cur: false, newP: false, conf: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggle = (k) => setShow(s => ({ ...s, [k]: !s[k] }));

  const EyeIcon = ({ visible }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {visible
        ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
        : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      }
    </svg>
  );

  const handleSubmit = async () => {
    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords don't match.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      await changePassword({
        identifier: '', // backend gets from token
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      onClose();
    } catch (e) {
      setError(e?.response?.data || 'Failed to change password.');
    }
    setLoading(false);
  };

  const PwField = ({ label, field, showKey }) => (
    <div className="form-group">
      <label>{label}</label>
      <div className="pw-input-wrap">
        <input
          type={show[showKey] ? 'text' : 'password'}
          placeholder={`Enter ${label.toLowerCase()}`}
          value={form[field]}
          onChange={e => setField(field, e.target.value)}
        />
        <button type="button" className="pw-eye" onClick={() => toggle(showKey)}>
          <EyeIcon visible={show[showKey]} />
        </button>
      </div>
    </div>
  );

  return (
    <Modal title="Change Password" onClose={onClose}>
      <div className="modal-body">
        {error && <div className="form-error">{error}</div>}
        <PwField label="Current Password" field="currentPassword" showKey="cur" />
        <PwField label="New Password" field="newPassword" showKey="newP" />
        <PwField label="Confirm New Password" field="confirmPassword" showKey="conf" />
      </div>
      <div className="modal-footer">
        <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Saving...' : 'Reset Password'}
        </button>
      </div>
    </Modal>
  );
}
