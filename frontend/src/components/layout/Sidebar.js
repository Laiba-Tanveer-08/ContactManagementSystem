import React, { useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { logout, getContacts, createContact } from '../../services/api';
import './Sidebar.css';

// SVG icons kept as small components so they're easy to reuse
const ContactsIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
);

const ProfileIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
    </svg>
);

const LogoutIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
);

const UploadIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
);

const DownloadIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
);

// Grabs the first email from contactInfos or falls back to emailAddresses
function getPrimaryEmail(contact) {
    if (contact.contactInfos?.length) {
        const found = contact.contactInfos.find(ci => ci.type === 'EMAIL' || ci.type === 'email');
        return found?.value || '';
    }
    return contact.emailAddresses?.[0]?.email || '';
}

// Grabs the first phone from contactInfos or falls back to phoneNumbers
function getPrimaryPhone(contact) {
    if (contact.contactInfos?.length) {
        const found = contact.contactInfos.find(ci => ci.type === 'PHONE' || ci.type === 'phone');
        return found?.value || '';
    }
    return contact.phoneNumbers?.[0]?.number || '';
}

export default function Sidebar({ onImportDone }) {
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef();

    const handleLogout = async () => {
        try { await logout(); } catch {}
        signOut();
        navigate('/login');
    };

    const handleExport = async () => {
        try {
            const res = await getContacts(0, 10000);
            const allContacts = res.data.content || [];

            const headers = ['FirstName', 'LastName', 'Title', 'Email', 'Phone'];
            const rows = allContacts.map(c => [
                c.firstName || '',
                c.lastName || '',
                c.title || '',
                getPrimaryEmail(c),
                getPrimaryPhone(c),
            ]);

            // Build CSV string and wrap each value in quotes to handle commas inside values
            const csvContent = [headers, ...rows]
                .map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
                .join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'contacts.csv';
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            alert('Export failed. Please try again.');
        }
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        e.target.value = '';

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target.result;
            const lines = text.trim().split('\n');
            const dataLines = lines.slice(1); // Skip the header row

            let success = 0;
            let failed = 0;

            for (const line of dataLines) {
                if (!line.trim()) continue;
                try {
                    // Parse CSV columns, handling quoted values with commas inside
                    const cols = line.match(/(".*?"|[^,]+|(?<=,)(?=,)|^(?=,)|(?<=,)$)/g) || [];
                    const clean = cols.map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"').trim());
                    const [firstName, lastName, title, email, phone] = clean;

                    if (!firstName && !lastName) { failed++; continue; }

                    const payload = {
                        firstName: firstName || '',
                        lastName: lastName || '',
                        title: title || '',
                        contactInfos: [
                            ...(email ? [{ type: 'EMAIL', value: email, label: 'personal' }] : []),
                            ...(phone ? [{ type: 'PHONE', value: phone, label: 'personal' }] : []),
                        ]
                    };

                    await createContact(payload);
                    success++;
                } catch {
                    failed++;
                }
            }

            // Notify the dashboard so it can refresh and show the import result
            if (onImportDone) onImportDone(success, failed);
        };

        reader.readAsText(file);
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="logo-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                        <path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z"/>
                    </svg>
                </div>
                <span>Contact Manager</span>
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/contacts" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <ContactsIcon /> <span>Contacts</span>
                </NavLink>
                <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <ProfileIcon /> <span>My Profile</span>
                </NavLink>

                <div className="sidebar-divider" />

                <label className="nav-item import-item">
                    <UploadIcon /> <span>Import CSV</span>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleImport}
                        style={{ display: 'none' }}
                    />
                </label>

                <button className="nav-item" onClick={handleExport}>
                    <DownloadIcon /> <span>Export CSV</span>
                </button>
            </nav>

            <button className="nav-item logout-btn" onClick={handleLogout}>
                <LogoutIcon /> <span>Logout</span>
            </button>
        </aside>
    );
}