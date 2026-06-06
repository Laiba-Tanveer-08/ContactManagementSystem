import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ContactFormModal from '../components/modals/ContactFormModal';
import DeleteModal from '../components/modals/DeleteModal';
import PersonAvatar from '../components/PersonAvatar';
import { getContacts, searchContacts, createContact, updateContact, deleteContact } from '../services/api';
import './Dashboard.css';

function getPrimaryEmail(contact) {
    if (contact.contactInfos?.length) {
        const found = contact.contactInfos.find(ci => ci.type === 'EMAIL' || ci.type === 'email');
        return found?.value || '—';
    }
    return contact.emailAddresses?.[0]?.email || '—';
}

function getPrimaryPhone(contact) {
    if (contact.contactInfos?.length) {
        const found = contact.contactInfos.find(ci => ci.type === 'PHONE' || ci.type === 'phone');
        return found?.value || '—';
    }
    return contact.phoneNumbers?.[0]?.number || '—';
}

export default function Dashboard() {
    const [contacts, setContacts] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [editContact, setEditContact] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [importStatus, setImportStatus] = useState('');
    const navigate = useNavigate();
    const size = 6;

    const load = useCallback(async (q, p) => {
        setLoading(true);
        try {
            const trimmed = q?.trim();
            const res = trimmed
                ? await searchContacts(trimmed, p, size)
                : await getContacts(p, size);
            const data = res.data;
            setContacts(data.content || []);
            setTotalPages(data.totalPages || 1);
            setTotalElements(data.totalElements || 0);
        } catch {}
        setLoading(false);
    }, []);

    useEffect(() => { load(search, page); }, [load, search, page]);

    // Called by Sidebar after CSV import finishes so we can refresh the list
    const handleImportDone = (success, failed) => {
        setImportStatus(`✓ Imported ${success} contacts${failed > 0 ? `, ${failed} failed` : ''}`);
        setTimeout(() => setImportStatus(''), 4000);
        setPage(0);
        load(search, 0);
    };

    const handleSearch = (val) => { setSearch(val); setPage(0); };
    const handlePageChange = (p) => setPage(p);

    const handleCreate = async (payload) => {
        await createContact(payload);
        setShowCreate(false);
        load(search, page);
    };

    const handleEdit = async (payload) => {
        await updateContact(editContact.id, payload);
        setEditContact(null);
        load(search, page);
    };

    const handleDelete = async () => {
        await deleteContact(deleteId);
        setDeleteId(null);
        load(search, page);
    };

    // Build page number array, capped at 4 visible buttons
    const pageNums = () => {
        const pages = [];
        const maxVisible = 4;
        if (totalPages <= maxVisible) {
            for (let i = 0; i < totalPages; i++) pages.push(i);
        } else {
            const start = Math.max(0, Math.min(page - 1, totalPages - maxVisible));
            for (let i = start; i < start + maxVisible && i < totalPages - 1; i++) pages.push(i);
        }
        return pages;
    };

    const showingFrom = totalElements === 0 ? 0 : page * size + 1;
    const showingTo = Math.min((page + 1) * size, totalElements);

    return (
        <Layout onSearch={handleSearch} searchValue={search} onImportDone={handleImportDone}>
            <div className="dashboard-wrapper">
                <div className="dashboard-content">
                    <div className="page-header">
                        <h1>Contacts</h1>
                        <div className="header-actions">
                            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                                <PlusIcon /> Add Contact
                            </button>
                        </div>
                    </div>

                    {importStatus && (
                        <div className="import-status">{importStatus}</div>
                    )}

                    {loading ? (
                        <div className="loading-state">Loading contacts…</div>
                    ) : contacts.length === 0 ? (
                        <div className="empty-state">
                            <ContactsEmptyIcon />
                            <p>{search ? `No contacts found for "${search}"` : 'No contacts found'}</p>
                            {!search && (
                                <button className="btn btn-outline-primary" onClick={() => setShowCreate(true)}>
                                    Add your first contact
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="contacts-grid">
                            {contacts.map((c) => (
                                <ContactCard
                                    key={c.id}
                                    contact={c}
                                    onView={() => navigate(`/contacts/${c.id}`)}
                                    onEdit={() => setEditContact(c)}
                                    onDelete={() => setDeleteId(c.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="pagination">
                        <button className="page-btn" onClick={() => handlePageChange(Math.max(0, page - 1))} disabled={page === 0}>
                            <ChevronLeftIcon />
                        </button>
                        {pageNums().map(p => (
                            <button key={p} className={`page-btn${page === p ? ' active' : ''}`} onClick={() => handlePageChange(p)}>
                                {p + 1}
                            </button>
                        ))}
                        {totalPages > 4 && <span className="page-dots">…</span>}
                        {totalPages > 4 && (
                            <button className={`page-btn${page === totalPages - 1 ? ' active' : ''}`} onClick={() => handlePageChange(totalPages - 1)}>
                                {totalPages}
                            </button>
                        )}
                        <button className="page-btn" onClick={() => handlePageChange(Math.min(totalPages - 1, page + 1))} disabled={page === totalPages - 1}>
                            <ChevronRightIcon />
                        </button>
                        <span className="page-info">Showing {showingFrom}–{showingTo} of {totalElements}</span>
                    </div>
                )}
            </div>

            {showCreate && <ContactFormModal onClose={() => setShowCreate(false)} onSave={handleCreate} />}
            {editContact && <ContactFormModal contact={editContact} onClose={() => setEditContact(null)} onSave={handleEdit} />}
            {deleteId && <DeleteModal onClose={() => setDeleteId(null)} onConfirm={handleDelete} />}
        </Layout>
    );
}

function ContactCard({ contact, onView, onEdit, onDelete }) {
    const primaryEmail = getPrimaryEmail(contact);
    const primaryPhone = getPrimaryPhone(contact);
    return (
        <div className="contact-card">
            <div className="card-top">
                <div className="card-avatar"><PersonAvatar size={56} /></div>
                <div className="card-info">
                    <h4>{contact.firstName} {contact.lastName}</h4>
                    <span>{contact.title || 'No Title'}</span>
                </div>
            </div>
            <div className="card-details">
                <div className="card-detail"><EmailSmallIcon /><span>{primaryEmail}</span></div>
                <div className="card-detail"><PhoneSmallIcon /><span>{primaryPhone}</span></div>
            </div>
            <div className="card-actions">
                <button className="card-btn view-btn" onClick={onView}><EyeSmallIcon /> View</button>
                <button className="card-btn edit-btn" onClick={onEdit}><EditSmallIcon /> Edit</button>
                <button className="card-btn del-btn" onClick={onDelete} aria-label="Delete"><TrashSmallIcon /></button>
            </div>
        </div>
    );
}

function PlusIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function ChevronLeftIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>; }
function ChevronRightIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>; }
function ContactsEmptyIcon() { return <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function EmailSmallIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>; }
function PhoneSmallIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>; }
function EyeSmallIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>; }
function EditSmallIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>; }
function TrashSmallIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>; }