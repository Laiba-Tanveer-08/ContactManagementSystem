import React from 'react';
import PropTypes from 'prop-types';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { logout } from '../../services/api';
import { ImportModal, ExportModal } from '../modals/ImportExportModal';
import './Sidebar.css';

const ContactsIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
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
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
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

export default function Sidebar({ onImportDone }) {
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const [showImport, setShowImport] = React.useState(false);
    const [showExport, setShowExport] = React.useState(false);

    const handleLogout = async () => {
        try { await logout(); } catch { /* ignore logout errors */ }
        signOut();
        navigate('/login');
    };

    return (
        <>
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

                    <button className="nav-item" onClick={() => setShowImport(true)}>
                        <UploadIcon /> <span>Import CSV</span>
                    </button>

                    <button className="nav-item" onClick={() => setShowExport(true)}>
                        <DownloadIcon /> <span>Export CSV</span>
                    </button>
                </nav>

                <button className="nav-item logout-btn" onClick={handleLogout}>
                    <LogoutIcon /> <span>Logout</span>
                </button>
            </aside>

            {showImport && (
                <ImportModal
                    onClose={() => setShowImport(false)}
                    onImportDone={onImportDone}
                />
            )}
            {showExport && (
                <ExportModal onClose={() => setShowExport(false)} />
            )}
        </>
    );
}

Sidebar.propTypes = {
    onImportDone: PropTypes.func,
};

Sidebar.defaultProps = {
    onImportDone: undefined,
};