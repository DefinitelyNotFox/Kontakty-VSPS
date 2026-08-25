import React from 'react';
import { Mail, Phone, MapPin, CheckCircle2, Circle, StickyNote, Edit3, Camera } from 'lucide-react';
import { getInitials, getAvatarGradient, getTitlePrefix, getCleanName } from '../utils/avatar';

export default function ContactCard({ contact, isTykani, note, customPhoto, onToggleTykani, onEditNote, onViewPhoto }) {
  const displayPhoto = customPhoto || (contact.hasPhoto ? contact.photoUrl : null);
  const titlePrefix = getTitlePrefix(contact.name);
  const cleanName = getCleanName(contact.name);

  return (
    <div className={`contact-card ${isTykani ? 'tykani-active' : ''}`}>
      <div className="card-header-wrapper">
        <div
          className="avatar-wrapper"
          onClick={() => onViewPhoto && onViewPhoto(contact)}
          style={{ cursor: 'pointer' }}
          title="Klikněte pro velký náhled fotky"
        >
          {displayPhoto ? (
            <img src={displayPhoto} alt={contact.name} className="avatar-img" />
          ) : (
            <div className="avatar-badge" style={{ background: getAvatarGradient(contact.id) }}>
              {getInitials(contact.name)}
            </div>
          )}
          {!contact.hasPhoto && !customPhoto && (
            <div className="no-photo-tag" title="Tento kontakt nemá oficiální fotku">
              <Camera size={12} />
            </div>
          )}
        </div>

        <div className="contact-main-info">
          {titlePrefix && <div className="contact-titles">{titlePrefix}</div>}
          <h3 className="contact-name" title={cleanName}>
            {cleanName}
          </h3>
          <p className="contact-role" title={contact.role || contact.category}>
            {contact.role || contact.category}
          </p>
        </div>
      </div>

      {/* Tykání Switch Button */}
      <div
        className={`tykani-toggle ${isTykani ? 'active' : ''}`}
        onClick={() => onToggleTykani(contact.id)}
        style={{ padding: '0.35rem 0.6rem' }}
      >
        <div className="tykani-label" style={{ fontSize: '0.78rem', gap: '0.35rem' }}>
          {isTykani ? <CheckCircle2 size={15} style={{ color: 'var(--accent-success)' }} /> : <Circle size={15} style={{ color: 'var(--text-muted)' }} />}
          <span>{isTykani ? 'Tykání' : 'Vykání'}</span>
        </div>
      </div>

      {/* User Personal Note (if present) */}
      {note ? (
        <div className="user-note-box">
          <StickyNote size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div className="user-note-text">{note}</div>
          <button className="edit-note-btn" onClick={() => onEditNote(contact)} title="Upravit poznámku">
            <Edit3 size={14} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => onEditNote(contact)}
          style={{
            background: 'none',
            border: '1px dashed var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.35rem 0.5rem',
            color: 'var(--text-secondary)',
            fontSize: '0.78rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <StickyNote size={14} style={{ color: 'var(--accent-warning)' }} />
          <span>+ Poznámka / Fotka</span>
        </button>
      )}

      {/* Contact Details (Email, Phone, Cabinet) */}
      <div className="contact-details">
        <div className="detail-item">
          <MapPin size={14} />
          <span>Kabinet: {contact.cabinet || 'neuvedeno'}</span>
        </div>
        {contact.email && (
          <a href={`mailto:${contact.email}`} className="detail-item">
            <Mail size={14} />
            <span>{contact.email}</span>
          </a>
        )}
        {contact.phone && (
          <a href={`tel:${contact.phone.replace(/\s+/g, '')}`} className="detail-item">
            <Phone size={14} />
            <span>{contact.phone}</span>
          </a>
        )}
      </div>
    </div>
  );
}
