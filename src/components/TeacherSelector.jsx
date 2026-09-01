import React, { useState, useRef, useEffect } from 'react';
import { UserCheck, ChevronDown, Plus, Trash2, Check, UserPlus, X, User } from 'lucide-react';

export default function TeacherSelector({
  profiles,
  activeProfileId,
  onSelectProfile,
  onCreateProfile,
  onDeleteProfile,
  variant = 'icon' // 'icon' or 'banner'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTeacherName, setNewTeacherName] = useState('');
  const dropdownRef = useRef(null);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0] || { name: 'Honza' };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsCreating(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newTeacherName.trim()) return;
    onCreateProfile(newTeacherName.trim());
    setNewTeacherName('');
    setIsCreating(false);
    setIsOpen(false);
  };

  const isBanner = variant === 'banner';
  const isIcon = variant === 'icon';

  return (
    <div
      className="teacher-selector-wrapper"
      ref={dropdownRef}
      style={{
        position: 'relative',
        zIndex: isOpen ? 99999 : 'auto'
      }}
    >
      {/* Trigger Button: Icon only for Header, or full button for Banner */}
      {isIcon ? (
        <button
          type="button"
          className="icon-button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            position: 'relative',
            border: isOpen ? '1px solid var(--accent-primary)' : undefined,
            background: isOpen ? 'rgba(59, 130, 246, 0.15)' : undefined
          }}
          title={`Aktivní učitel: ${activeProfile.name} (klikněte pro změnu profilu)`}
        >
          <UserCheck size={18} style={{ color: 'var(--accent-success)' }} />
        </button>
      ) : (
        <button
          type="button"
          className="primary-btn"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.45rem 0.85rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            cursor: 'pointer',
            border: 'none',
            color: '#ffffff',
            boxShadow: isOpen ? '0 0 0 2px var(--accent-primary)' : undefined
          }}
          title="Vyberte učitele nebo vytvořte nový profil"
        >
          <UserCheck size={16} style={{ color: '#ffffff' }} />
          <span>Učitel: <strong>{activeProfile.name}</strong></span>
          <ChevronDown size={14} style={{ opacity: 0.7, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
        </button>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: isBanner ? 'auto' : 0,
            left: isBanner ? 0 : 'auto',
            minWidth: '270px',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem',
            background: 'var(--bg-card)',
            backgroundColor: 'var(--bg-card)',
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.45), 0 0 0 1px var(--border-color)',
            zIndex: 999999,
            border: '1px solid var(--border-color)',
            animation: 'fadeIn 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.2rem 0.4rem', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Profil učitele
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-success)' }}>
              {activeProfile.name}
            </span>
          </div>

          {/* List of Profiles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '220px', overflowY: 'auto' }}>
            {profiles.map((profile) => {
              const isActive = profile.id === activeProfileId;
              return (
                <div
                  key={profile.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    background: isActive ? 'var(--accent-success-bg)' : 'transparent',
                    color: isActive ? 'var(--accent-success)' : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: isActive ? 600 : 400
                  }}
                  onClick={() => {
                    onSelectProfile(profile.id);
                    setIsOpen(false);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    {isActive ? <Check size={15} /> : <div style={{ width: '15px' }} />}
                    <span>{profile.name}</span>
                    {profile.id === 'honza' && (
                      <span style={{ fontSize: '0.68rem', padding: '0.1rem 0.35rem', background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', borderRadius: '4px', marginLeft: '0.2rem' }}>
                        Výchozí
                      </span>
                    )}
                  </div>

                  {/* Delete custom profile button (not allowed for Honza) */}
                  {profile.id !== 'honza' && onDeleteProfile && (
                    <button
                      type="button"
                      className="icon-button"
                      style={{ width: '24px', height: '24px', padding: 0 }}
                      title="Smazat profil učitele"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Opravdu chcete smazat profil učitele "${profile.name}" včetně jeho tříd a dat?`)) {
                          onDeleteProfile(profile.id);
                        }
                      }}
                    >
                      <Trash2 size={13} style={{ color: 'var(--accent-danger)' }} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
            {!isCreating ? (
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setIsCreating(true)}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.45rem 0.6rem',
                  fontSize: '0.82rem',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <Plus size={14} /> + Nový učitel
              </button>
            ) : (
              <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Jméno nového učitele:
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <X size={13} />
                  </button>
                </div>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Např. Mgr. Jana Nováková"
                  value={newTeacherName}
                  onChange={(e) => setNewTeacherName(e.target.value)}
                  autoFocus
                  style={{ padding: '0.4rem 0.5rem', fontSize: '0.82rem' }}
                />
                <button
                  type="submit"
                  className="primary-btn"
                  disabled={!newTeacherName.trim()}
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem', justifyContent: 'center' }}
                >
                  <UserPlus size={14} /> Vytvořit profil
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
