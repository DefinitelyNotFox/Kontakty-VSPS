import React, { useState } from 'react';
import { Users, HelpCircle, Layers, Moon, Sun, Volume2, VolumeX, BarChart2, School, User, Plus } from 'lucide-react';

export default function Header({
  activeTab,
  onTabChange,
  theme,
  onToggleTheme,
  soundEnabled,
  onToggleSound,
  onOpenStats,
  profiles,
  activeProfileId,
  onSelectProfile,
  onCreateProfile,
  totalCount
}) {
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;
    onCreateProfile(newProfileName.trim());
    setNewProfileName('');
    setIsCreatingProfile(false);
  };

  return (
    <header className="app-header glass-panel">
      <div className="app-brand">
        <div className="brand-icon">
          <School size={24} />
        </div>
        <div>
          <h1 className="brand-title">Kontakty & Poznávání</h1>
          <div className="brand-subtitle">VOŠ a SPŠ Šumperk • {totalCount} kolegy</div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <nav className="nav-tabs">
        <button
          className={`nav-btn ${activeTab === 'contacts' ? 'active' : ''}`}
          onClick={() => onTabChange('contacts')}
        >
          <Users size={18} /> Kontakty Učitelů
        </button>

        <button
          className={`nav-btn ${activeTab === 'classes' ? 'active' : ''}`}
          onClick={() => onTabChange('classes')}
        >
          <School size={18} /> Třídy & Žáci
        </button>

        <button
          className={`nav-btn ${activeTab === 'quiz' ? 'active' : ''}`}
          onClick={() => onTabChange('quiz')}
        >
          <HelpCircle size={18} /> Kvíz 4Možnosti
        </button>

        <button
          className={`nav-btn ${activeTab === 'flashcards' ? 'active' : ''}`}
          onClick={() => onTabChange('flashcards')}
        >
          <Layers size={18} /> Flashcards (10ky)
        </button>
      </nav>

      {/* Quick Action Controls */}
      <div className="header-actions">
        {/* Profile Switcher Dropdown */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(0, 0, 0, 0.15)', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <User size={16} style={{ color: 'var(--accent-primary)' }} />
          {!isCreatingProfile ? (
            <select
              value={activeProfileId}
              onChange={(e) => {
                if (e.target.value === 'NEW') {
                  setIsCreatingProfile(true);
                } else {
                  onSelectProfile(e.target.value);
                }
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {profiles.map(p => (
                <option key={p.id} value={p.id} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                  {p.name}
                </option>
              ))}
              <option value="NEW" style={{ background: 'var(--bg-card)', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                + Přidat nový profil...
              </option>
            </select>
          ) : (
            <form onSubmit={handleProfileSubmit} style={{ display: 'flex', gap: '0.3rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Jméno profilu"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                autoFocus
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', width: '110px' }}
              />
              <button type="submit" className="primary-btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}>
                <Plus size={14} />
              </button>
            </form>
          )}
        </div>

        {/* Sound Toggle */}
        <button
          className="icon-button"
          onClick={onToggleSound}
          title={soundEnabled ? 'Zvuky zapnuty' : 'Zvuky vypnuty'}
        >
          {soundEnabled ? <Volume2 size={18} style={{ color: 'var(--accent-primary)' }} /> : <VolumeX size={18} style={{ color: 'var(--text-muted)' }} />}
        </button>

        {/* Theme Toggle */}
        <button
          className="icon-button"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim'}
        >
          {theme === 'dark' ? <Sun size={18} style={{ color: '#f59e0b' }} /> : <Moon size={18} style={{ color: '#6366f1' }} />}
        </button>

        {/* Stats Modal Trigger */}
        <button
          className="icon-button"
          onClick={onOpenStats}
          title="Statistiky a záloha dat"
        >
          <BarChart2 size={18} style={{ color: 'var(--accent-success)' }} />
        </button>
      </div>
    </header>
  );
}
