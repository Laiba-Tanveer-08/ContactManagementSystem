import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import './Modal.css';

const emptyEmail = () => ({ label: 'Work', value: '' });
const emptyPhone = () => ({ label: 'Mobile', value: '' });

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toTitleCase = (str) =>
    str.replace(/\b\w/g, (ch) => ch.toUpperCase());

const isOnlyNumbers = (str) => /^\d+$/.test(str.trim());

const isValidName = (str) => {
  const s = str.trim();
  if (!s) return { ok: false, msg: 'This field is required.' };
  if (isOnlyNumbers(s)) return { ok: false, msg: 'Name cannot be only numbers.' };
  if (s.length < 2) return { ok: false, msg: 'Must be at least 2 characters.' };
  if (s.length > 50) return { ok: false, msg: 'Must be 50 characters or fewer.' };
  if (!/^[a-zA-Z\s'\-\.]+$/.test(s))
    return { ok: false, msg: 'Only letters, spaces, hyphens, apostrophes, and dots allowed.' };
  return { ok: true };
};

const isValidEmail = (str) => {
  const s = str.trim();
  if (!s) return { ok: true };
  if (s.length > 254) return { ok: false, msg: 'Email too long (max 254 chars).' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s))
    return { ok: false, msg: `"${s}" is not a valid email address.` };
  const [local, domain] = s.split('@');
  if (local.length > 64) return { ok: false, msg: 'Email local part too long (max 64 chars).' };
  if (/\.\./.test(s)) return { ok: false, msg: 'Email cannot contain consecutive dots.' };
  if (/^\./.test(local) || /\.$/.test(local))
    return { ok: false, msg: 'Email local part cannot start or end with a dot.' };
  if (!domain.includes('.'))
    return { ok: false, msg: `"${s}" is missing a valid domain.` };
  return { ok: true };
};

const isValidPhone = (str) => {
  const s = str.trim();
  if (!s) return { ok: true };
  const digits = s.replace(/[\s\-().+]/g, '');
  if (!/^\d+$/.test(digits))
    return { ok: false, msg: `"${s}" contains invalid characters.` };
  if (digits.length < 7)
    return { ok: false, msg: `"${s}" is too short (min 7 digits).` };
  if (digits.length > 15)
    return { ok: false, msg: `"${s}" is too long (max 15 digits per E.164).` };
  if (!/^[+]?[\d\s\-().]{7,20}$/.test(s))
    return { ok: false, msg: `"${s}" is not a valid phone number.` };
  return { ok: true };
};

const isValidTitle = (str) => {
  const s = str.trim();
  if (!s) return { ok: true };
  if (isOnlyNumbers(s)) return { ok: false, msg: 'Title cannot be only numbers.' };
  if (s.length > 100) return { ok: false, msg: 'Title must be 100 characters or fewer.' };
  if (!/^[a-zA-Z0-9\s'\-\.,&/()]+$/.test(s))
    return { ok: false, msg: 'Title contains unsupported characters.' };
  return { ok: true };
};

const noErrors = () => ({
  firstName: '',
  lastName: '',
  title: '',
  emails: [],
  phones: [],
  general: '',
});

// ─── Component ────────────────────────────────────────────────────────────────

export default function ContactFormModal({ contact, onClose, onSave }) {
  const isEdit = !!contact;

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    title: '',
    emails: [emptyEmail()],
    phones: [emptyPhone()],
  });

  const [errors, setErrors] = useState(noErrors());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (contact) {
      // Resolve emails from whichever shape the API returned
      const resolvedEmails =
          contact.emailAddresses?.length
              ? contact.emailAddresses.map(e => ({ label: e.label, value: e.email }))
              : contact.contactInfos?.filter(ci => ci.type === 'EMAIL' || ci.type === 'email')
              .map(ci => ({ label: ci.label, value: ci.value })) || [];

      // Resolve phones from whichever shape the API returned
      const resolvedPhones =
          contact.phoneNumbers?.length
              ? contact.phoneNumbers.map(p => ({ label: p.label, value: p.number }))
              : contact.contactInfos?.filter(ci => ci.type === 'PHONE' || ci.type === 'phone')
              .map(ci => ({ label: ci.label, value: ci.value })) || [];

      setForm({
        firstName: toTitleCase(contact.firstName || ''),   // ← TitleCase on load
        lastName:  toTitleCase(contact.lastName  || ''),   // ← TitleCase on load
        title:     toTitleCase(contact.title     || ''),   // ← TitleCase on load
        emails: resolvedEmails.length ? resolvedEmails : [emptyEmail()],
        phones: resolvedPhones.length ? resolvedPhones : [emptyPhone()],
      });
      setErrors(noErrors());
    }
  }, [contact]);

  // ─── Field setters ──────────────────────────────────────────────────────────

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const clearFieldError = (key) => setErrors(e => ({ ...e, [key]: '' }));

  const updateEmail = (i, key, val) => {
    const arr = [...form.emails];
    arr[i] = { ...arr[i], [key]: val };
    setField('emails', arr);
    if (key === 'value') {
      const errs = [...(errors.emails || [])];
      errs[i] = '';
      setErrors(e => ({ ...e, emails: errs, general: '' }));
    }
  };

  const updatePhone = (i, key, val) => {
    const arr = [...form.phones];
    arr[i] = { ...arr[i], [key]: val };
    setField('phones', arr);
    if (key === 'value') {
      const errs = [...(errors.phones || [])];
      errs[i] = '';
      setErrors(e => ({ ...e, phones: errs, general: '' }));
    }
  };

  const removeEmail = (i) => {
    setField('emails', form.emails.filter((_, idx) => idx !== i));
    const errs = [...(errors.emails || [])];
    errs.splice(i, 1);
    setErrors(e => ({ ...e, emails: errs }));
  };

  const removePhone = (i) => {
    setField('phones', form.phones.filter((_, idx) => idx !== i));
    const errs = [...(errors.phones || [])];
    errs.splice(i, 1);
    setErrors(e => ({ ...e, phones: errs }));
  };

  // ─── Validation ─────────────────────────────────────────────────────────────

  const validate = () => {
    const newErrors = noErrors();
    let valid = true;

    const fnCheck = isValidName(form.firstName);
    if (!fnCheck.ok) { newErrors.firstName = fnCheck.msg; valid = false; }

    if (form.lastName.trim()) {
      const lnCheck = isValidName(form.lastName);
      if (!lnCheck.ok) { newErrors.lastName = lnCheck.msg; valid = false; }
    }

    const titleCheck = isValidTitle(form.title);
    if (!titleCheck.ok) { newErrors.title = titleCheck.msg; valid = false; }

    const emailErrs = form.emails.map(e => {
      const r = isValidEmail(e.value);
      if (!r.ok) { valid = false; return r.msg; }
      return '';
    });
    newErrors.emails = emailErrs;

    const phoneErrs = form.phones.map(p => {
      const r = isValidPhone(p.value);
      if (!r.ok) { valid = false; return r.msg; }
      return '';
    });
    newErrors.phones = phoneErrs;

    const hasEmail = form.emails.some(e => e.value.trim());
    const hasPhone = form.phones.some(p => p.value.trim());
    if (!hasEmail && !hasPhone) {
      newErrors.general = 'Please add at least one email or phone number.';
      valid = false;
    }

    // Duplicate email check
    const emailSet = new Set();
    form.emails.forEach((e, i) => {
      const val = e.value.trim().toLowerCase();
      if (!val) return;
      if (emailSet.has(val)) { newErrors.emails[i] = 'Duplicate email address.'; valid = false; }
      emailSet.add(val);
    });

    // Duplicate phone check
    const phoneSet = new Set();
    form.phones.forEach((p, i) => {
      const val = p.value.trim().replace(/[\s\-().+]/g, '');
      if (!val) return;
      if (phoneSet.has(val)) { newErrors.phones[i] = 'Duplicate phone number.'; valid = false; }
      phoneSet.add(val);
    });

    setErrors(newErrors);
    return valid;
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

    const contactInfos = [
      ...form.emails.filter(e => e.value.trim()).map(e => ({
        type: 'EMAIL', value: e.value.trim(), label: e.label,
      })),
      ...form.phones.filter(p => p.value.trim()).map(p => ({
        type: 'PHONE', value: p.value.trim(), label: p.label,
      })),
    ];

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      title: form.title.trim(),
      contactInfos,
      emailAddresses: form.emails.filter(e => e.value.trim()).map(e => ({ label: e.label, email: e.value.trim() })),
      phoneNumbers: form.phones.filter(p => p.value.trim()).map(p => ({ label: p.label, number: p.value.trim() })),
    };

    try {
      await onSave(payload);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data || e?.message || 'Failed to save contact.';
      setErrors(prev => ({ ...prev, general: typeof msg === 'string' ? msg : 'Failed to save contact.' }));
      setLoading(false);
    }
  };

  // ─── UI Helpers ─────────────────────────────────────────────────────────────

  const TrashIcon = () => (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14H6L5 6"/>
        <path d="M10 11v6"/><path d="M14 11v6"/>
        <path d="M9 6V4h6v2"/>
      </svg>
  );

  const FieldError = ({ msg }) =>
      msg ? <div style={{ color: '#EF4444', fontSize: '12px', marginTop: '3px' }}>{msg}</div> : null;

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
      <Modal title={isEdit ? 'Update Contact' : 'Create Contact'} onClose={onClose}>
        <div className="modal-body">

          {errors.general && <div className="form-error">{errors.general}</div>}

          {/* Name Row */}
          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>First Name <span style={{ color: '#EF4444' }}>*</span></label>
              <input
                  placeholder="Enter first name"
                  value={form.firstName}
                  onChange={e => {
                    setField('firstName', toTitleCase(e.target.value));
                    clearFieldError('firstName');
                  }}
                  style={errors.firstName ? { borderColor: '#EF4444' } : {}}
              />
              <FieldError msg={errors.firstName} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Last Name</label>
              <input
                  placeholder="Enter last name"
                  value={form.lastName}
                  onChange={e => {
                    setField('lastName', toTitleCase(e.target.value));
                    clearFieldError('lastName');
                  }}
                  style={errors.lastName ? { borderColor: '#EF4444' } : {}}
              />
              <FieldError msg={errors.lastName} />
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label>Title</label>
            <input
                placeholder="Enter title / job title"
                value={form.title}
                onChange={e => {
                  setField('title', toTitleCase(e.target.value));
                  clearFieldError('title');
                }}
                style={errors.title ? { borderColor: '#EF4444' } : {}}
            />
            <FieldError msg={errors.title} />
          </div>

          {/* Emails */}
          <div className="section-title">Email Addresses</div>
          {form.emails.map((em, i) => (
              <div key={i}>
                <div className="field-row">
                  <select value={em.label} onChange={e => updateEmail(i, 'label', e.target.value)}>
                    <option>Work</option>
                    <option>Personal</option>
                  </select>
                  <input
                      placeholder="Enter email address"
                      value={em.value}
                      onChange={e => updateEmail(i, 'value', e.target.value)}
                      style={errors.emails?.[i] ? { borderColor: '#EF4444' } : {}}
                  />
                  {form.emails.length > 1 && (
                      <button className="remove-btn" onClick={() => removeEmail(i)}><TrashIcon /></button>
                  )}
                </div>
                <FieldError msg={errors.emails?.[i]} />
              </div>
          ))}
          <button className="add-field-btn" onClick={() => setField('emails', [...form.emails, emptyEmail()])}>
            + Add Email
          </button>

          {/* Phones */}
          <div className="section-title">Phone Numbers</div>
          {form.phones.map((ph, i) => (
              <div key={i}>
                <div className="field-row">
                  <select value={ph.label} onChange={e => updatePhone(i, 'label', e.target.value)}>
                    <option>Mobile</option>
                    <option>Home</option>
                    <option>Work</option>
                  </select>
                  <input
                      placeholder="Enter phone number"
                      value={ph.value}
                      onChange={e => updatePhone(i, 'value', e.target.value)}
                      style={errors.phones?.[i] ? { borderColor: '#EF4444' } : {}}
                  />
                  {form.phones.length > 1 && (
                      <button className="remove-btn" onClick={() => removePhone(i)}><TrashIcon /></button>
                  )}
                </div>
                <FieldError msg={errors.phones?.[i]} />
              </div>
          ))}
          <button className="add-field-btn" onClick={() => setField('phones', [...form.phones, emptyPhone()])}>
            + Add Phone
          </button>

        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Save Contact'}
          </button>
        </div>
      </Modal>
  );
}