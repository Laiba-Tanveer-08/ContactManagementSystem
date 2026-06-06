import React from 'react';
import {useAuth} from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar({onSearch, searchValue}) {
    const {user} = useAuth();
    const displayName = user?.fullName || user?.name || '';

    return (
        <header className="navbar">
            <div className="navbar-search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                    type="text"
                    placeholder="Search contacts by name…"
                    value={searchValue || ''}
                    onChange={e => onSearch && onSearch(e.target.value)}
                />
            </div>
            {displayName && (
                <div className="navbar-user">
                    <div className="navbar-avatar">{displayName.charAt(0).toUpperCase()}</div>
                    <span className="navbar-username">{displayName}</span>
                </div>
            )}
        </header>
    );
}