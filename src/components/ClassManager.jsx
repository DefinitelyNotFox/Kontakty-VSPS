import React, { useState } from 'react';
import { Plus, Crop, Users, Trash2, UserPlus, StickyNote, CheckCircle2, Circle } from 'lucide-react';
import ClassPhotoCropper from './ClassPhotoCropper';
import { getInitials, getAvatarGradient } from '../utils/avatar';

export default function ClassManager({
  classes,
  onAddClass,
  onDeleteClass,
  onAddStudent,
  onDeleteStudent,
  tykaniMap,
  notesMap,
  onToggleTykani,
  onEditNote
}) {
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || null);
  const [newClassName, setNewClassName] = useState('');
  const [isCropperOpen, setIsCropperOpen] = useState(false);

  // Manual Add Student form states
  const [manualName, setManualName] = useState('');
  const [manualNote, setManualNote] = useState('');
  const [manualPhotoUrl, setManualPhotoUrl] = useState('');
  const [isManualAddOpen, setIsManualAddOpen] = useState(false);

  const activeClass = classes.find(c => c.id === selectedClassId) || classes[0];

  const handleCreateClassSubmit = (e) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    const updated = onAddClass(newClassName.trim());
    setNewClassName('');
    if (updated && updated.length > 0) {
      setSelectedClassId(updated[updated.length - 1].id);
    }
  };

  const handleManualAddSubmit = (e) => {
    e.preventDefault();
    if (!manualName.trim() || !activeClass) return;

    onAddStudent(activeClass.id, {
      name: manualName.trim(),
      photoUrl: manualPhotoUrl.trim(),
      note: manualNote.trim()
    });

    setManualName('');
    setManualNote('');
    setManualPhotoUrl('');
    setIsManualAddOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner & Create Class Form */}
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <Users size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Správa Tříd a Žáků</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Přidávejte třídy, vyřezávejte obličeje žáků ze společných fotek nebo přidávejte žáky ručně
            </p>
          </div>
        </div>

        {/* Create Class Form */}
        <form onSubmit={handleCreateClassSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Název nové třídy (např. 4.A)"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            style={{ width: '220px', padding: '0.5rem 0.8rem', fontSize: '0.85rem' }}
          />
          <button type="submit" className="primary-btn" style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}>
            <Plus size={16} /> Vytvořit třídu
          </button>
        </form>
      </div>

      {/* Class Tabs List */}
      {classes.length > 0 ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="nav-tabs">
              {classes.map((cls) => (
                <button
                  key={cls.id}
                  className={`nav-btn ${activeClass && activeClass.id === cls.id ? 'active' : ''}`}
                  onClick={() => setSelectedClassId(cls.id)}
                >
                  {cls.name} ({cls.students.length})
                </button>
              ))}
            </div>

            {activeClass && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="primary-btn"
                  onClick={() => setIsCropperOpen(true)}
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                >
                  <Crop size={16} /> Oříznout obličeje ze společné fotky
                </button>

                <button
                  className="secondary-btn"
                  onClick={() => setIsManualAddOpen(!isManualAddOpen)}
                  style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                >
                  <UserPlus size={16} /> + Přidat žáka ručně
                </button>

                <button
                  className="icon-button"
                  title="Smazat tuto třídu"
                  onClick={() => {
                    if (window.confirm(`Opravdu chcete smazat třídu ${activeClass.name} včetně všech žáků?`)) {
                      onDeleteClass(activeClass.id);
                    }
                  }}
                >
                  <Trash2 size={16} style={{ color: 'var(--accent-danger)' }} />
                </button>
              </div>
            )}
          </div>

          {/* Manual Add Student Drawer Form */}
          {isManualAddOpen && activeClass && (
            <div className="glass-panel" style={{ borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid var(--accent-primary)' }}>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--accent-primary)' }}>
                Přidat nového žáka do třídy {activeClass.name} (i pro žáky bez fotky)
              </h4>
              <form onSubmit={handleManualAddSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', alignItems: 'end' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Jméno žáka:*</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Např. Petr Dvořák"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Odkaz na fotku (volitelný):</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://..."
                    value={manualPhotoUrl}
                    onChange={(e) => setManualPhotoUrl(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Poznámka (např. chyběl v den focení):</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Paměťová pomůcka..."
                    value={manualNote}
                    onChange={(e) => setManualNote(e.target.value)}
                  />
                </div>
                <button type="submit" className="primary-btn" style={{ height: '42px' }}>
                  Uložit žáka
                </button>
              </form>
            </div>
          )}

          {/* Student Cards Grid */}
          {activeClass && activeClass.students.length > 0 ? (
            <div className="contacts-grid">
              {activeClass.students.map((student) => {
                const isTykani = !!tykaniMap[student.id];
                const note = notesMap[student.id];

                return (
                  <div key={student.id} className={`contact-card ${isTykani ? 'tykani-active' : ''}`}>
                    <div className="card-header-wrapper">
                      <div className="avatar-wrapper">
                        {student.photoUrl ? (
                          <img src={student.photoUrl} alt={student.name} className="avatar-img" />
                        ) : (
                          <div className="avatar-badge" style={{ background: getAvatarGradient(student.id) }}>
                            {getInitials(student.name)}
                          </div>
                        )}
                      </div>

                      <div className="contact-main-info">
                        <h3 className="contact-name">{student.name}</h3>
                        <p className="contact-role">Třída {activeClass.name}</p>
                      </div>

                      <button
                        className="icon-button"
                        style={{ width: '32px', height: '32px', flexShrink: 0 }}
                        title="Odstranit žáka"
                        onClick={() => onDeleteStudent(activeClass.id, student.id)}
                      >
                        <Trash2 size={14} style={{ color: 'var(--accent-danger)' }} />
                      </button>
                    </div>

                    {/* Tykání Button */}
                    <div
                      className={`tykani-toggle ${isTykani ? 'active' : ''}`}
                      onClick={() => onToggleTykani(student.id)}
                      style={{ padding: '0.35rem 0.6rem' }}
                    >
                      <div className="tykani-label" style={{ fontSize: '0.78rem', gap: '0.35rem' }}>
                        {isTykani ? <CheckCircle2 size={15} style={{ color: 'var(--accent-success)' }} /> : <Circle size={15} style={{ color: 'var(--text-muted)' }} />}
                        <span>{isTykani ? 'Tykání' : 'Vykání'}</span>
                      </div>
                    </div>

                    {/* Note Box */}
                    {note ? (
                      <div className="user-note-box">
                        <StickyNote size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div className="user-note-text">{note}</div>
                      </div>
                    ) : (
                      <button
                        onClick={() => onEditNote(student)}
                        style={{ background: 'none', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.5rem', color: 'var(--text-secondary)', fontSize: '0.78rem', cursor: 'pointer' }}
                      >
                        + Poznámka
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '3rem 2rem', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Tato třída zatím nemá žádné žáky</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Nahrajte společnou fotku třídy a vyřežte obličeje, nebo přidejte žáky ručně.
              </p>
              <button className="primary-btn" onClick={() => setIsCropperOpen(true)}>
                <Crop size={18} /> Oříznout obličeje ze společné fotky třídy
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '3rem 2rem', textAlign: 'center' }}>
          <h3>Zatím nemáte vytvořenou žádnou třídu</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Zadejte název výše (např. 4.A) a vytvořte svou první třídu.</p>
        </div>
      )}

      {/* Class Photo Cropper Modal */}
      {isCropperOpen && activeClass && (
        <ClassPhotoCropper
          targetClass={activeClass}
          onAddStudent={onAddStudent}
          onClose={() => setIsCropperOpen(false)}
        />
      )}
    </div>
  );
}
