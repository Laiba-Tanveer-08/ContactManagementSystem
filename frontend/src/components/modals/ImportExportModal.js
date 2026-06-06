import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createContact, getContacts } from '../../services/api';

// ── icons ──────────────────────────────────────────────────────────────────
const UploadIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
);
const DownloadIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
);
const FileIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
    </svg>
);
const CheckIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="9 12 11 14 15 10"/>
    </svg>
);
const CloseIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
);

// ── helpers
function getPrimaryEmail(contact) {
    if (contact.contactInfos?.length) {
        const found = contact.contactInfos.find(ci => ci.type === 'EMAIL' || ci.type === 'email');
        return found?.value || '';
    }
    return contact.emailAddresses?.[0]?.email || '';
}
function getPrimaryPhone(contact) {
    if (contact.contactInfos?.length) {
        const found = contact.contactInfos.find(ci => ci.type === 'PHONE' || ci.type === 'phone');
        return found?.value || '';
    }
    return contact.phoneNumbers?.[0]?.number || '';
}
// IMPORT MODAL
export function ImportModal({ onClose, onImportDone }) {
    const fileInputRef = useRef();
    const navigate = useNavigate();

    // 'idle' | 'loading' | 'done'
    const [stage, setStage]         = useState('idle');
    const [fileName, setFileName]   = useState('');
    const [dragOver, setDragOver]   = useState(false);
    const [progress, setProgress]   = useState(0);
    const [results, setResults]     = useState({ success: 0, failed: 0 });

    const processFile = async (file) => {
        if (!file || !file.name.endsWith('.csv')) {
            alert('Please choose a .csv file.');
            return;
        }
        setFileName(file.name);
        setStage('loading');
        setProgress(0);

        const text = await file.text();
        const lines = text.trim().split('\n');
        const dataLines = lines.slice(1).filter(l => l.trim());
        const total = dataLines.length;

        let success = 0;
        let failed = 0;

        for (let i = 0; i < dataLines.length; i++) {
            try {
                const cols = dataLines[i].match(/(".*?"|[^,]+|(?<=,)(?=,)|^(?=,)|(?<=,)$)/g) || [];
                const clean = cols.map(v => v.replaceAll(/^"|"$/g, '').replaceAll('""', '"').trim());
                const [firstName, lastName, title, email, phone] = clean;

                if (!firstName && !lastName) { failed++; continue; }

                await createContact({
                    firstName: firstName || '',
                    lastName:  lastName  || '',
                    title:     title     || '',
                    contactInfos: [
                        ...(email ? [{ type: 'EMAIL', value: email, label: 'personal' }] : []),
                        ...(phone ? [{ type: 'PHONE', value: phone, label: 'personal' }] : []),
                    ],
                });
                success++;
            } catch { failed++; }

            setProgress(Math.round(((i + 1) / total) * 100));
        }

        setResults({ success, failed });
        setStage('done');
        if (onImportDone) onImportDone(success, failed);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        e.target.value = '';
        if (file) processFile(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    };

    const handleGoToContacts = () => {
        onClose();
        navigate('/contacts');
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && stage !== 'loading' && onClose()}>
            <div className="modal-box" style={{ maxWidth: 480 }}>
                {/* Header */}
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ color: 'var(--primary)' }}><UploadIcon /></span>
                        <h3 style={{ margin: 0 }}>Import Contacts</h3>
                    </div>
                    {stage !== 'loading' && (
                        <button className="modal-close" onClick={onClose}><CloseIcon /></button>
                    )}
                </div>

                <div className="modal-body">

                    {/* ── IDLE: drop zone ── */}
                    {stage === 'idle' && (
                        <>
                            <div
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current.click()}
                                style={{
                                    border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--border)'}`,
                                    borderRadius: 12,
                                    padding: '40px 24px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    background: dragOver ? 'var(--primary-light)' : 'var(--bg)',
                                    transition: 'all 0.15s',
                                }}
                            >
                                <div style={{ color: dragOver ? 'var(--primary)' : 'var(--text-muted)', marginBottom: 12 }}>
                                    <FileIcon />
                                </div>
                                <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 4, fontSize: 16 }}>
                                    Drop your CSV file here
                                </p>
                                <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>
                                    or <span style={{ color: 'var(--primary)', fontWeight: 600 }}>click to browse</span>
                                </p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                            </div>

                            <div style={{
                                marginTop: 20, padding: '14px 16px',
                                background: 'var(--bg)', borderRadius: 10,
                                border: '1px solid var(--border)',
                            }}>
                                <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 6 }}>
                                    Expected CSV format:
                                </p>
                                <code style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.8 }}>
                                    FirstName, LastName, Title, Email, Phone
                                </code>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '8px 0 0' }}>
                                    First row is treated as a header and skipped.
                                </p>
                            </div>
                        </>
                    )}

                    {/* ── LOADING ── */}
                    {stage === 'loading' && (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <div style={{
                                width: 64, height: 64, borderRadius: '50%',
                                border: '4px solid var(--border)',
                                borderTop: '4px solid var(--primary)',
                                animation: 'spin 0.8s linear infinite',
                                margin: '0 auto 24px',
                            }} />
                            <p style={{ fontWeight: 700, fontSize: 17, color: 'var(--text)', marginBottom: 6 }}>
                                Importing contacts…
                            </p>
                            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
                                {fileName}
                            </p>
                            <div style={{
                                background: 'var(--border)', borderRadius: 99,
                                height: 8, overflow: 'hidden', maxWidth: 320, margin: '0 auto',
                            }}>
                                <div style={{
                                    background: 'var(--primary)', height: '100%',
                                    width: `${progress}%`, borderRadius: 99,
                                    transition: 'width 0.2s ease',
                                }} />
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 10 }}>
                                {progress}% complete
                            </p>
                        </div>
                    )}

                    {/* ── DONE ── */}
                    {stage === 'done' && (
                        <div style={{ textAlign: 'center', padding: '10px 0' }}>
                            <div style={{ marginBottom: 16 }}><CheckIcon /></div>
                            <p style={{ fontWeight: 700, fontSize: 18, color: 'var(--text)', marginBottom: 8 }}>
                                Import Complete!
                            </p>
                            <div style={{
                                display: 'flex', gap: 16, justifyContent: 'center', margin: '20px 0',
                            }}>
                                <div style={{
                                    flex: 1, padding: '16px', background: '#f0fdf4',
                                    border: '1px solid #bbf7d0', borderRadius: 10, textAlign: 'center',
                                }}>
                                    <p style={{ fontSize: 28, fontWeight: 800, color: '#16a34a', margin: 0 }}>
                                        {results.success}
                                    </p>
                                    <p style={{ fontSize: 13, color: '#15803d', margin: '4px 0 0', fontWeight: 600 }}>
                                        Imported
                                    </p>
                                </div>
                                {results.failed > 0 && (
                                    <div style={{
                                        flex: 1, padding: '16px', background: '#fef9ee',
                                        border: '1px solid #fde68a', borderRadius: 10, textAlign: 'center',
                                    }}>
                                        <p style={{ fontSize: 28, fontWeight: 800, color: '#d97706', margin: 0 }}>
                                            {results.failed}
                                        </p>
                                        <p style={{ fontSize: 13, color: '#b45309', margin: '4px 0 0', fontWeight: 600 }}>
                                            Skipped
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 8 }}>
                                <button className="btn btn-outline" onClick={onClose}>Close</button>
                                <button className="btn btn-primary" onClick={handleGoToContacts}>
                                    View Contacts
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

// EXPORT MODAL
export function ExportModal({ onClose }) {
    const [stage, setStage] = useState('idle');   // 'idle' | 'loading' | 'done'
    const [count, setCount] = useState(0);

    const handleExport = async () => {
        setStage('loading');
        try {
            const res = await getContacts(0, 10000);
            const allContacts = res.data.content || [];

            const headers = ['FirstName', 'LastName', 'Title', 'Email', 'Phone'];
            const rows = allContacts.map(c => [
                c.firstName || '',
                c.lastName  || '',
                c.title     || '',
                getPrimaryEmail(c),
                getPrimaryPhone(c),
            ]);

            const csvContent = [headers, ...rows]
                .map(row => row.map(val => `"${String(val).replaceAll('"', '""')}"`).join(','))
                .join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href     = url;
            a.download = `contacts_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);

            setCount(allContacts.length);
            setStage('done');
        } catch {
            alert('Export failed. Please try again.');
            setStage('idle');
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && stage !== 'loading' && onClose()}>
            <div className="modal-box" style={{ maxWidth: 420 }}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ color: 'var(--primary)' }}><DownloadIcon /></span>
                        <h3 style={{ margin: 0 }}>Export Contacts</h3>
                    </div>
                    {stage !== 'loading' && (
                        <button className="modal-close" onClick={onClose}><CloseIcon /></button>
                    )}
                </div>

                <div className="modal-body">

                    {/* ── IDLE ── */}
                    {stage === 'idle' && (
                        <>
                            <div style={{
                                textAlign: 'center', padding: '24px 0 16px',
                            }}>
                                <div style={{ color: 'var(--primary)', marginBottom: 16 }}>
                                    <DownloadIcon />
                                </div>
                                <p style={{ color: 'var(--text)', fontSize: 15, marginBottom: 6 }}>
                                    All your contacts will be exported as a <strong>.csv</strong> file.
                                </p>
                                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                                    Includes: First Name, Last Name, Title, Email, Phone
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                                <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                                <button className="btn btn-primary" onClick={handleExport}>
                                    <DownloadIcon /> Export CSV
                                </button>
                            </div>
                        </>
                    )}

                    {/* ── LOADING ── */}
                    {stage === 'loading' && (
                        <div style={{ textAlign: 'center', padding: '30px 0' }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: '50%',
                                border: '4px solid var(--border)',
                                borderTop: '4px solid var(--primary)',
                                animation: 'spin 0.8s linear infinite',
                                margin: '0 auto 20px',
                            }} />
                            <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: 16 }}>
                                Preparing your file…
                            </p>
                            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                                Fetching all contacts
                            </p>
                        </div>
                    )}

                    {/* ── DONE ── */}
                    {stage === 'done' && (
                        <div style={{ textAlign: 'center', padding: '10px 0' }}>
                            <div style={{ marginBottom: 12 }}><CheckIcon /></div>
                            <p style={{ fontWeight: 700, fontSize: 18, color: 'var(--text)', marginBottom: 6 }}>
                                Export Complete!
                            </p>
                            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
                                {count} contact{count !== 1 ? 's' : ''} exported to your downloads folder.
                            </p>
                            <button className="btn btn-primary" onClick={onClose}>Done</button>
                        </div>
                    )}
                </div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}