import React from 'react';
import { X, MapPin } from 'lucide-react';
import { getInitials, getAvatarGradient } from '../utils/avatar';

export default function ImageLightboxModal({ contact, customPhoto, onClose }) {
  if (!contact) return null;

  const displayPhoto = customPhoto || (contact.hasPhoto ? contact.photoUrl : null);

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 200, background: 'rgba(0, 0, 0, 0.85)' }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '480px',
          padding: '1.5rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ fontSize: '1rem', margin: 0, color: 'var(--text-secondary)' }}>Detail fotky</h4>
          <button className="icon-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Large Image Preview */}
        <div
          style={{
            width: '100%',
            maxHeight: '380px',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.3)',
            border: '2px solid var(--border-color)'
          }}
        >
          {displayPhoto ? (
            <img
              src={displayPhoto}
              alt={contact.name}
              style={{ width: '100%', height: '100%', maxHeight: '380px', objectFit: 'contain' }}
            />
          ) : (
            <div
              className="avatar-badge"
              style={{
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                background: getAvatarGradient(contact.id),
                fontSize: '4rem'
              }}
            >
              {getInitials(contact.name)}
            </div>
          )}
        </div>

        <div>
          <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
            {contact.name}
          </h3>
          <p style={{ color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
            {contact.role || contact.category}
          </p>
          {contact.cabinet && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.4rem', background: 'var(--bg-main)', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)' }}>
              <MapPin size={14} /> Kabinet: {contact.cabinet}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
