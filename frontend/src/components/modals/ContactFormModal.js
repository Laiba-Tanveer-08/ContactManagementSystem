import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';
import './Modal.css';

const emptyEmail = () => ({id: crypto.randomUUID(), label: 'Work', value: ''});
const emptyPhone = () => ({id: crypto.randomUUID(), label: 'Mobile', value: ''});

const toTitleCase = (str) => str.replace(/\b\w/g, (ch) => ch.toUpperCase());
const isOnlyNumbers = (str) => /^\d+$/.test(str.trim());

const isValidName = (str) => {
    const s = str.trim();
    if (!s) return {ok: false, msg: 'This field is required.'};
    if (isOnlyNumbers(s)) return {ok: false, msg: 'Name cannot be only numbers.'};
    if (s.length < 2) return {ok: false, msg: 'Must be at least 2 characters.'};
    if (s.length > 50) return {ok: false, msg: 'Must be 50 characters or fewer.'};
    if (!/^[a-zA-Z\s'\-.]+$/.test(s)) return {ok: false, msg: 'Only letters, spaces, hyphens, apostrophes, and dots allowed.'};
    return {ok: true};
};

const isValidEmail = (str) => {
    const s = str.trim();
    if (!s) return {ok: true};
    if (s.length > 254) return {ok: false, msg: 'Email too long (max 254 chars).'};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return {ok: false, msg: `"${s}" is not a valid email address.`};
    const [local, domain] = s.split('@');
    if (local.length > 64) return {ok: false, msg: 'Email local part too long (max 64 chars).'};
    if (s.includes('..')) return {ok: false, msg: 'Email cannot contain consecutive dots.'};
    if (local.startsWith('.') || local.endsWith('.')) return {ok: false, msg: 'Email local part cannot start or end with a dot.'};
    if (!domain.includes('.')) return {ok: false, msg: `"${s}" is missing a valid domain.`};
    return {ok: true};
};

const isValidPhone = (str) => {
    const s = str.trim();
    if (!s) return {ok: true};
    const digits = s.replace(/[\s\-().+]/g, '');
    if (!/^\d+$/.test(digits)) return {ok: false, msg: `"${s}" contains invalid characters.`};
    if (digits.length < 7) return {ok: false, msg: `"${s}" is too short (min 7 digits).`};
    if (digits.length > 15) return {ok: false, msg: `"${s}" is too long (max 15 digits per E.164).`};
    if (!/^[+]?[\d\s\-().]{7,20}$/.test(s)) return {ok: false, msg: `"${s}" is not a valid phone number.`};
    return {ok: true};
};

const isValidTitle = (str) => {
    const s = str.trim();
    if (!s) return {ok: true};
    if (isOnlyNumbers(s)) return {ok: false, msg: 'Title cannot be only numbers.'};
    if (s.length > 100) return {ok: false, msg: 'Title must be 100 characters or fewer.'};
    if (!/^[a-zA-Z0-9\s'\-.,&/()]+$/.test(s)) return {ok: false, msg: 'Title contains unsupported characters.'};
    return {ok: true};
};

const noErrors = () => ({firstName: '', lastName: '', title: '', emails: {}, phones: {}, general: ''});

const TrashIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14H6L5 6"/>
        <path d="M10 11v6"/>
        <path d="M14 11v6"/>
        <path d="M9 6V4h6v2"/>
    </svg>
);

const FieldError = ({msg}) =>
    msg ? <div style={{color: '#EF4444', fontSize: '12px', marginTop: '3px'}}>{msg}</div> : null;

FieldError.propTypes = {msg: PropTypes.string};
FieldError.defaultProps = {msg: ''};

export default function ContactFormModal({contact, onClose, onSave}) {
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
            const resolvedEmails =
                contact.emailAddresses?.length
                    ? contact.emailAddresses.map(e => ({id: crypto.randomUUID(), label: e.label, value: e.email}))
                    : contact.contactInfos?.filter(ci => ci.type === 'EMAIL' || ci.type === 'email')
                    .map(ci => ({id: crypto.randomUUID(), label: ci.label, value: ci.value})) || [];

            const resolvedPhones =
                contact.phoneNumbers?.length
                    ? contact.phoneNumbers.map(p => ({id: crypto.randomUUID(), label: p.label, value: p.number}))
                    : contact.contactInfos?.filter(ci => ci.type === 'PHONE' || ci.type === 'phone')
                    .map(ci => ({id: crypto.randomUUID(), label: ci.label, value: ci.value})) || [];

            setForm({
                firstName: toTitleCase(contact.firstName || ''),
                lastName: toTitleCase(contact.lastName || ''),
                title: toTitleCase(contact.title || ''),
                emails: resolvedEmails.length ? resolvedEmails : [emptyEmail()],
                phones: resolvedPhones.length ? resolvedPhones : [emptyPhone()],
            });
            setErrors(noErrors());
        }
    }, [contact]);

    const setField = (key, val) => setForm(f => ({...f, [key]: val}));
    const clearFieldError = (key) => setErrors(e => ({...e, [key]: ''}));

    const updateEmail = (id, key, val) => {
        setField('emails', form.emails.map(e => e.id === id ? {...e, [key]: val} : e));
        if (key === 'value') {
            setErrors(prev => ({...prev, emails: {...prev.emails, [id]: ''}, general: ''}));
        }
    };

    const updatePhone = (id, key, val) => {
        setField('phones', form.phones.map(p => p.id === id ? {...p, [key]: val} : p));
        if (key === 'value') {
            setErrors(prev => ({...prev, phones: {...prev.phones, [id]: ''}, general: ''}));
        }
    };

    const removeEmail = (id) => {
        const next = form.emails.filter(e => e.id !== id);
        setField('emails', next.length ? next : [emptyEmail()]);
        setErrors(prev => {
            const updated = {...prev.emails};
            delete updated[id];
            return {...prev, emails: updated, general: ''};
        });
    };

    const removePhone = (id) => {
        const next = form.phones.filter(p => p.id !== id);
        setField('phones', next.length ? next : [emptyPhone()]);
        setErrors(prev => {
            const updated = {...prev.phones};
            delete updated[id];
            return {...prev, phones: updated, general: ''};
        });
    };

    const showEmailDelete = (email) => form.emails.length > 1 || email.value.trim() !== '';
    const showPhoneDelete = (phone) => form.phones.length > 1 || phone.value.trim() !== '';

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

        const emailErrs = {};
        form.emails.forEach(e => {
            const r = isValidEmail(e.value);
            if (!r.ok) { valid = false; emailErrs[e.id] = r.msg; }
        });
        newErrors.emails = emailErrs;

        const phoneErrs = {};
        form.phones.forEach(p => {
            const r = isValidPhone(p.value);
            if (!r.ok) { valid = false; phoneErrs[p.id] = r.msg; }
        });
        newErrors.phones = phoneErrs;

        const hasEmail = form.emails.some(e => e.value.trim());
        const hasPhone = form.phones.some(p => p.value.trim());
        if (!hasEmail && !hasPhone) {
            newErrors.general = 'Please add at least one email or phone number.';
            valid = false;
        }

        const emailSet = new Set();
        form.emails.forEach(e => {
            const val = e.value.trim().toLowerCase();
            if (!val) return;
            if (emailSet.has(val)) { newErrors.emails[e.id] = 'Duplicate email address.'; valid = false; }
            emailSet.add(val);
        });

        const phoneSet = new Set();
        form.phones.forEach(p => {
            const val = p.value.trim().replace(/[\s\-().+]/g, '');
            if (!val) return;
            if (phoneSet.has(val)) { newErrors.phones[p.id] = 'Duplicate phone number.'; valid = false; }
            phoneSet.add(val);
        });

        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);

        const contactInfos = [
            ...form.emails.filter(e => e.value.trim()).map(e => ({type: 'EMAIL', value: e.value.trim(), label: e.label})),
            ...form.phones.filter(p => p.value.trim()).map(p => ({type: 'PHONE', value: p.value.trim(), label: p.label})),
        ];

        const payload = {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            title: form.title.trim(),
            contactInfos,
            emailAddresses: form.emails.filter(e => e.value.trim()).map(e => ({label: e.label, email: e.value.trim()})),
            phoneNumbers: form.phones.filter(p => p.value.trim()).map(p => ({label: p.label, number: p.value.trim()})),
        };

        try {
            await onSave(payload);
        } catch (e) {
            const msg = e?.response?.data?.message || e?.response?.data || e?.message || 'Failed to save contact.';
            setErrors(prev => ({...prev, general: typeof msg === 'string' ? msg : 'Failed to save contact.'}));
            setLoading(false);
        }
    };

    return (
        <Modal title={isEdit ? 'Update Contact' : 'Create Contact'} onClose={onClose}>
            <div className="modal-body">

                {errors.general && <div className="form-error">{errors.general}</div>}

                <div className="form-row">
                    <div className="form-group" style={{marginBottom: 0}}>
                        <label>First Name <span style={{color: '#EF4444'}}>*</span></label>
                        <input
                            placeholder="Enter first name"
                            value={form.firstName}
                            onChange={e => { setField('firstName', toTitleCase(e.target.value)); clearFieldError('firstName'); }}
                            style={errors.firstName ? {borderColor: '#EF4444'} : {}}
                        />
                        <FieldError msg={errors.firstName}/>
                    </div>
                    <div className="form-group" style={{marginBottom: 0}}>
                        <label>Last Name</label>
                        <input
                            placeholder="Enter last name"
                            value={form.lastName}
                            onChange={e => { setField('lastName', toTitleCase(e.target.value)); clearFieldError('lastName'); }}
                            style={errors.lastName ? {borderColor: '#EF4444'} : {}}
                        />
                        <FieldError msg={errors.lastName}/>
                    </div>
                </div>

                <div className="form-group">
                    <label>Title</label>
                    <input
                        placeholder="Enter title / job title"
                        value={form.title}
                        onChange={e => { setField('title', toTitleCase(e.target.value)); clearFieldError('title'); }}
                        style={errors.title ? {borderColor: '#EF4444'} : {}}
                    />
                    <FieldError msg={errors.title}/>
                </div>

                <div className="section-title">Email Addresses</div>
                {form.emails.map((em) => (
                    <div key={em.id}>
                        <div className="field-row">
                            <select value={em.label} onChange={e => updateEmail(em.id, 'label', e.target.value)}>
                                <option>Work</option>
                                <option>Personal</option>
                            </select>
                            <input
                                placeholder="Enter email address"
                                value={em.value}
                                onChange={e => updateEmail(em.id, 'value', e.target.value)}
                                style={errors.emails?.[em.id] ? {borderColor: '#EF4444'} : {}}
                            />
                            {showEmailDelete(em) && (
                                <button className="remove-btn" onClick={() => removeEmail(em.id)}><TrashIcon/></button>
                            )}
                        </div>
                        <FieldError msg={errors.emails?.[em.id]}/>
                    </div>
                ))}
                <button className="add-field-btn" onClick={() => setField('emails', [...form.emails, emptyEmail()])}>
                    + Add Email
                </button>

                <div className="section-title">Phone Numbers</div>
                {form.phones.map((ph) => (
                    <div key={ph.id}>
                        <div className="field-row">
                            <select value={ph.label} onChange={e => updatePhone(ph.id, 'label', e.target.value)}>
                                <option>Mobile</option>
                                <option>Home</option>
                                <option>Work</option>
                            </select>
                            <input
                                placeholder="Enter phone number"
                                value={ph.value}
                                onChange={e => updatePhone(ph.id, 'value', e.target.value)}
                                style={errors.phones?.[ph.id] ? {borderColor: '#EF4444'} : {}}
                            />
                            {showPhoneDelete(ph) && (
                                <button className="remove-btn" onClick={() => removePhone(ph.id)}><TrashIcon/></button>
                            )}
                        </div>
                        <FieldError msg={errors.phones?.[ph.id]}/>
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

ContactFormModal.propTypes = {
    contact: PropTypes.shape({
        firstName: PropTypes.string,
        lastName: PropTypes.string,
        title: PropTypes.string,
        emailAddresses: PropTypes.arrayOf(PropTypes.shape({label: PropTypes.string, email: PropTypes.string})),
        phoneNumbers: PropTypes.arrayOf(PropTypes.shape({label: PropTypes.string, number: PropTypes.string})),
        contactInfos: PropTypes.arrayOf(PropTypes.shape({
            type: PropTypes.string,
            label: PropTypes.string,
            value: PropTypes.string,
        })),
    }),
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
};

ContactFormModal.defaultProps = {
    contact: null,
};