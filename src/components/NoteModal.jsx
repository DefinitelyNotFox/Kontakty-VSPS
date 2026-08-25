import React, { useState, useEffect } from 'react';
import { X, StickyNote, Image, Save, Trash2 } from 'lucide-react';
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

  const handleClearNote = () => {
    setNoteText('');
  };

  const handleClearPhoto = () => {
    setPhotoUrl('');
  };

  const currentPhoto = photoUrl || (contact.hasPhoto ? contact.photoUrl : null);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{contact.role || contact.category}</p>
            </div>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Note Input */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
              <StickyNote size={16} style={{ color: 'var(--accent-warning)' }} />
              Poznámka:
            </label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Napište poznámku..."
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

          {/* Custom Photo URL */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
              <Image size={16} style={{ color: 'var(--accent-primary)' }} />
              Fotka:
            </label>
            <input
              type="url"
              className="form-input"
              placeholder="https://... (URL obrázku)"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
            />
            {photoUrl && (
              <button
                type="button"
                onClick={handleClearPhoto}
                style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.35rem', cursor: 'pointer' }}
              >
                <Trash2 size={14} /> Odstranit fotku
              </button>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="submit" className="primary-btn" title="Uložit" style={{ padding: '0.6rem 1rem' }}>
              <Save size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
