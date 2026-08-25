import React, { useState, useMemo } from 'react';
import { Search, Users, UserCheck, Filter, Award, BookOpen } from 'lucide-react';
import ContactCard from './ContactCard';

export default function ContactList({
  contacts,
  tykaniMap,
  memorizedMap,
  notesMap,
  customPhotosMap,
  onToggleTykani,
  onToggleMemorized,
  onEditNote,
  onViewPhoto
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'vedeni', 'pedagogove'
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'to_learn', 'memorized', 'tykani', 'nophoto', 'hasnote'

  // Counters
  const totalCount = contacts.length;
  const tykaniCount = useMemo(() => {
    return contacts.filter(c => tykaniMap[c.id]).length;
  }, [contacts, tykaniMap]);

  const memorizedCount = useMemo(() => {
    return contacts.filter(c => memorizedMap[c.id]).length;
  }, [contacts, memorizedMap]);

  const toLearnCount = totalCount - memorizedCount;
  const noPhotoCount = contacts.filter(c => !c.hasPhoto && !customPhotosMap[c.id]).length;

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      // Category filter
      if (activeTab === 'vedeni' && contact.category !== 'Vedení') return false;
      if (activeTab === 'pedagogove' && contact.category !== 'Pedagogové') return false;

      // Attribute filter
      const isTykani = !!tykaniMap[contact.id];
      const isMemorized = !!memorizedMap[contact.id];
      const hasNote = !!notesMap[contact.id];
      const isNoPhoto = !contact.hasPhoto && !customPhotosMap[contact.id];

      if (filterMode === 'to_learn' && isMemorized) return false;
      if (filterMode === 'memorized' && !isMemorized) return false;
      if (filterMode === 'tykani' && !isTykani) return false;
      if (filterMode === 'vykani' && isTykani) return false;
      if (filterMode === 'nophoto' && !isNoPhoto) return false;
      if (filterMode === 'hasnote' && !hasNote) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = contact.name.toLowerCase().includes(q);
        const roleMatch = (contact.role || '').toLowerCase().includes(q);
        const emailMatch = (contact.email || '').toLowerCase().includes(q);
        const cabinetMatch = (contact.cabinet || '').toLowerCase().includes(q);
        const noteMatch = (notesMap[contact.id] || '').toLowerCase().includes(q);
        return nameMatch || roleMatch || emailMatch || cabinetMatch || noteMatch;
      }

      return true;
    });
  }, [contacts, activeTab, filterMode, searchQuery, tykaniMap, memorizedMap, notesMap, customPhotosMap]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Stats Summary Bar */}
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <UserCheck size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>
              S {tykaniCount} z {totalCount} kolegů si týkáš! • {memorizedCount} zapamatováno
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
              Tlačítkem „Pamatuji si“ skryjete naučené kontakty z kvízů a procvičování.
            </p>
          </div>
        </div>

        {/* Quick Filter Pill Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          <button
            className={`secondary-btn ${filterMode === 'all' ? 'active' : ''}`}
            onClick={() => setFilterMode('all')}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: 'var(--radius-full)', background: filterMode === 'all' ? 'var(--accent-primary)' : undefined, color: filterMode === 'all' ? 'white' : undefined }}
          >
            Všechny ({totalCount})
          </button>
          <button
            className={`secondary-btn ${filterMode === 'to_learn' ? 'active' : ''}`}
            onClick={() => setFilterMode('to_learn')}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: 'var(--radius-full)', background: filterMode === 'to_learn' ? '#3b82f6' : undefined, color: filterMode === 'to_learn' ? 'white' : undefined }}
          >
            <BookOpen size={13} /> K procvičení ({toLearnCount})
          </button>
          <button
            className={`secondary-btn ${filterMode === 'memorized' ? 'active' : ''}`}
            onClick={() => setFilterMode('memorized')}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: 'var(--radius-full)', background: filterMode === 'memorized' ? '#f59e0b' : undefined, color: filterMode === 'memorized' ? 'white' : undefined }}
          >
            <Award size={13} /> Naučeno ({memorizedCount})
          </button>
          <button
            className={`secondary-btn ${filterMode === 'tykani' ? 'active' : ''}`}
            onClick={() => setFilterMode('tykani')}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: 'var(--radius-full)', background: filterMode === 'tykani' ? 'var(--accent-success)' : undefined, color: filterMode === 'tykani' ? 'white' : undefined }}
          >
            Tykáme si ({tykaniCount})
          </button>
          <button
            className={`secondary-btn ${filterMode === 'nophoto' ? 'active' : ''}`}
            onClick={() => setFilterMode('nophoto')}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: 'var(--radius-full)', background: filterMode === 'nophoto' ? '#ec4899' : undefined, color: filterMode === 'nophoto' ? 'white' : undefined }}
          >
            Bez fotky ({noPhotoCount})
          </button>
        </div>
      </div>

      {/* Search & Category Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.75rem' }}
            placeholder="Hledat jméno, roli, e-mail, kabinet nebo poznámku..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Department Category Buttons */}
        <div className="nav-tabs">
          <button
            className={`nav-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <Users size={16} /> Všichni
          </button>
          <button
            className={`nav-btn ${activeTab === 'vedeni' ? 'active' : ''}`}
            onClick={() => setActiveTab('vedeni')}
          >
            Vedení školy (5)
          </button>
          <button
            className={`nav-btn ${activeTab === 'pedagogove' ? 'active' : ''}`}
            onClick={() => setActiveTab('pedagogove')}
          >
            Pedagogové (58)
          </button>
        </div>
      </div>

      {/* Contacts Grid */}
      {filteredContacts.length > 0 ? (
        <div className="contacts-grid">
          {filteredContacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              isTykani={!!tykaniMap[contact.id]}
              isMemorized={!!memorizedMap[contact.id]}
              note={notesMap[contact.id]}
              customPhoto={customPhotosMap[contact.id]}
              onToggleTykani={onToggleTykani}
              onToggleMemorized={onToggleMemorized}
              onEditNote={onEditNote}
              onViewPhoto={onViewPhoto}
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '3rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Filter size={48} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Žádný kontakt neodpovídá zadání</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
            Zkus změnit vyhledávací dotaz nebo vynulovat aktivní filtry.
          </p>
          <button className="secondary-btn" onClick={() => { setSearchQuery(''); setFilterMode('all'); setActiveTab('all'); }}>
            Zobrazit všechny kontakty
          </button>
        </div>
      )}
    </div>
  );
}
