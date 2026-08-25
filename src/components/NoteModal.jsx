import React, { useState, useEffect } from 'react';
import { X, StickyNote, Image, Save, Trash2, Check } from 'lucide-react';
import { getInitials, getAvatarGradient } from '../utils/avatar';

// Pre-loaded teacher photos uploaded by user
const PRESET_PHOTOS = [
  { id: 'p1', url: '/teacher_photos/photo1_zena_bryle.png', label: 'Žena (sluneční brýle)' },
  { id: 'p5', url: '/teacher_photos/photo5_shone_sona.png', label: 'Soňa Shone' },
  { id: 'p2', url: '/teacher_photos/photo2_zena_vlnite.png', label: 'Zdeňka Minářová' },
  { id: 'p3', url: '/teacher_photos/photo3_muz_tmavy.png', label: 'Petr Válek' },
  { id: 'p4', url: '/teacher_photos/photo4_muz_svetly.png', label: 'David Shone' }
];

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

          {/* Custom Photo & Preset Selection */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
              <Image size={16} style={{ color: 'var(--accent-primary)' }} />
              Fotka:
            </label>

            {/* Quick 1-click Preset Selector for Uploaded Photos */}
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Vyberte jednu z nahraných fotek:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.4rem' }}>
                {PRESET_PHOTOS.map((preset) => {
                  const isSelected = photoUrl === preset.url;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setPhotoUrl(preset.url)}
                      style={{
                        position: 'relative',
                        border: isSelected ? '2px solid var(--accent-success)' : '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.2rem',
                        cursor: 'pointer',
                        background: isSelected ? 'var(--accent-success-bg)' : 'var(--bg-main)',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        style={{ width: '100%', height: '52px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                      />
                      <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {preset.label}
                      </div>
                      {isSelected && (
                        <div style={{ position: 'absolute', top: '2px', right: '2px', background: 'var(--accent-success)', color: 'white', borderRadius: '50%', padding: '1px' }}>
                          <Check size={10} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom URL Input */}
            <input
              type="url"
              className="form-input"
              placeholder="Nebo vložte vlastní URL adresu fotky..."
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
            <button type="submit" className="primary-btn" title="Uložit" style={{ padding: '0.6rem 1.25rem' }}>
              <Save size={20} /> Uložit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
