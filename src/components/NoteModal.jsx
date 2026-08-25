import React, { useState, useEffect } from 'react';
import { X, StickyNote, Image, Save, Trash2, Upload } from 'lucide-react';
import { getInitials, getAvatarGradient } from '../utils/avatar';

export default function NoteModal({ contact, note, customPhoto, onClose, onSave }) {
  const [noteText, setNoteText] = useState(note || '');
  const [photoUrl, setPhotoUrl] = useState(customPhoto || '');

  useEffect(() => {
    setNoteText(note || '');
    setPhotoUrl(customPhoto || '');
  }, [contact, note, customPhoto]);

  if (!contact) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSave(contact.id, noteText, photoUrl);
    onClose();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoUrl(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleClearNote = () => {
    setNoteText('');
  };

  const handleClearPhoto = () => {
    setPhotoUrl('');
  };

  const currentPhoto = photoUrl || (contact.hasPhoto ? contact.photoUrl : null);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="avatar-wrapper" style={{ width: '48px', height: '48px' }}>
              {currentPhoto ? (
                <img src={currentPhoto} alt={contact.name} className="avatar-img" />
              ) : (
                <div className="avatar-badge" style={{ background: getAvatarGradient(contact.id), fontSize: '1.1rem' }}>
                  {getInitials(contact.name)}
                </div>
              )}
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{contact.name}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>{contact.role || contact.category}</p>
            </div>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Note Input */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
              <StickyNote size={16} style={{ color: 'var(--accent-warning)' }} />
              Poznámka:
            </label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Napište osobní poznámku..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            {noteText && (
              <button
                type="button"
                onClick={handleClearNote}
                style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.35rem', cursor: 'pointer' }}
              >
                <Trash2 size={14} /> Smazat poznámku
              </button>
            )}
          </div>

          {/* Photo File Upload & URL Input */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
              <Image size={16} style={{ color: 'var(--accent-primary)' }} />
              Fotka:
            </label>

            {/* Upload from file button */}
            <div style={{ marginBottom: '0.75rem' }}>
              <label
                className="secondary-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 1rem',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  width: '100%',
                  background: 'var(--bg-card)',
                  borderColor: 'var(--accent-primary)',
                  color: 'var(--accent-primary)'
                }}
              >
                <Upload size={16} /> Nahrát fotku z zařízení (telefon / PC)
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {/* Custom URL Input */}
            <input
              type="url"
              className="form-input"
              placeholder="Nebo vložte adresu URL..."
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
            />
            
            {photoUrl && (
              <button
                type="button"
                onClick={handleClearPhoto}
                style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.4rem', cursor: 'pointer' }}
              >
                <Trash2 size={14} /> Odstranit vloženou fotku
              </button>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
            <button type="submit" className="primary-btn" title="Uložit" style={{ padding: '0.65rem 1.5rem', fontSize: '0.95rem' }}>
              <Save size={18} /> Uložit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
