import React from 'react';
import { Users, HelpCircle, Layers, Moon, Sun, Volume2, VolumeX, GraduationCap } from 'lucide-react';

export default function Header({
  activeTab,
  onTabChange,
  theme,
  onToggleTheme,
  soundEnabled,
  onToggleSound
}) {
  return (
    <header className="app-header glass-panel">
      {/* Main Navigation Tabs - Compact Mobile Friendly */}
      <nav className="nav-tabs">
        <button
          className={`nav-btn ${activeTab === 'contacts' ? 'active' : ''}`}
          onClick={() => onTabChange('contacts')}
        >
          <Users size={17} /> Učitelé
        </button>

        <button
          className={`nav-btn ${activeTab === 'classes' ? 'active' : ''}`}
          onClick={() => onTabChange('classes')}
        >
          <GraduationCap size={17} /> Žáci
        </button>

        <button
          className={`nav-btn ${activeTab === 'quiz' ? 'active' : ''}`}
          onClick={() => onTabChange('quiz')}
        >
          <HelpCircle size={17} /> Kvíz
        </button>

        <button
          className={`nav-btn ${activeTab === 'flashcards' ? 'active' : ''}`}
          onClick={() => onTabChange('flashcards')}
        >
          <Layers size={17} /> Flashcards
        </button>
      </nav>

      {/* Controls Bar: Sound & Theme Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
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
      </div>
    </header>
  );
}
