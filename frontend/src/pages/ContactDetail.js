import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ContactFormModal from '../components/modals/ContactFormModal';
import DeleteModal from '../components/modals/DeleteModal';
import { getContactById, updateContact, deleteContact } from '../services/api';
import PersonAvatar from '../components/PersonAvatar';
import './ContactDetail.css';

export default function ContactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    getContactById(id)
        .then(r => setContact(r.data))
        .catch(() => navigate('/contacts'))
        .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleEdit = async (payload) => {
    await updateContact(id, payload);

    // ✅ Update local state directly — no refetch, no flash
    setContact(prev => ({
      ...prev,
      firstName: payload.firstName,
      lastName: payload.lastName,
      title: payload.title,
      // Update both shapes so nothing breaks
      contactInfos: payload.contactInfos,
      emailAddresses: payload.emailAddresses,
      phoneNumbers: payload.phoneNumbers,
    }));

    setShowEdit(false); // close modal smoothly
  };

  const handleDelete = async () => {
    await deleteContact(id);
    navigate('/contacts');
  };

  if (loading) return <Layout><div className="loading-state">Loading...</div></Layout>;
  if (!contact) return null;

  // Support both API shapes
  const emails = contact.contactInfos
      ? contact.contactInfos.filter(ci => ci.type === 'EMAIL' || ci.type === 'email')
      : (contact.emailAddresses || []).map(e => ({ value: e.email, label: e.label }));

  const phones = contact.contactInfos
      ? contact.contactInfos.filter(ci => ci.type === 'PHONE' || ci.type === 'phone')
      : (contact.phoneNumbers || []).map(p => ({ value: p.number, label: p.label }));

  return (
      <Layout>
        <div className="detail-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back to Contacts
          </button>
          <div className="detail-header-actions">
            <button className="btn btn-outline-icon" onClick={() => setShowEdit(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit
            </button>
            <button className="btn btn-danger" onClick={() => setShowDelete(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/>
                <path d="M9 6V4h6v2"/>
              </svg>
              Delete
            </button>
          </div>
        </div>

        <div className="detail-card">
          <div className="detail-top">
            <PersonAvatar size={80} />
            <div className="detail-top-info">
              <h2>{contact.firstName} {contact.lastName}</h2>
              <span className="detail-title-tag">{contact.title || 'No Title'}</span>
            </div>
          </div>

          <div className="detail-section">
            <h3>Contact Information</h3>

            {emails.length > 0 && (
                <div className="detail-group">
                  <div className="detail-group-title">Email Addresses</div>
                  {emails.map((em, i) => (
                      <div className="detail-row" key={i}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                          <polyline points="22,6 12,13 2,6"/>
                        </svg>
                        <span className="detail-value">{em.value}</span>
                        <span className={`label-tag label-${em.label?.toLowerCase()}`}>{em.label}</span>
                      </div>
                  ))}
                </div>
            )}

            {phones.length > 0 && (
                <div className="detail-group">
                  <div className="detail-group-title">Phone Numbers</div>
                  {phones.map((ph, i) => (
                      <div className="detail-row" key={i}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                        <span className="detail-value">{ph.value}</span>
                        <span className={`label-tag label-${ph.label?.toLowerCase()}`}>{ph.label}</span>
                      </div>
                  ))}
                </div>
            )}

            {contact.title && (
                <div className="detail-group">
                  <div className="detail-group-title">Title</div>
                  <p className="detail-plain">{contact.title}</p>
                </div>
            )}
          </div>
        </div>

        {showEdit && (
            <ContactFormModal
                contact={{
                  ...contact,
                  emailAddresses: emails.map(e => ({ email: e.value, label: e.label })),
                  phoneNumbers: phones.map(p => ({ number: p.value, label: p.label })),
                }}
                onClose={() => setShowEdit(false)}
                onSave={handleEdit}
            />
        )}
        {showDelete && <DeleteModal onClose={() => setShowDelete(false)} onConfirm={handleDelete} />}
      </Layout>
  );
}