import React, { useState } from 'react';
import { X, Award, RotateCcw, Download, Upload, Check, AlertTriangle } from 'lucide-react';
import { exportAllData, importAllData } from '../services/storage';

export default function StatsModal({ contacts, learningState, tykaniMap, notesMap, onClose, onDataReset, onDataImported }) {
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState(null);

  // Compute stats
  const totalContacts = contacts.length;
  const tykaniCount = contacts.filter(c => tykaniMap[c.id]).length;
  const notesCount = Object.keys(notesMap).length;

  let levelCounts = [0, 0, 0, 0, 0, 0];
  let totalReviews = 0;

  Object.values(learningState).forEach(st => {
    const lvl = Math.min(5, Math.max(0, st.level || 0));
    levelCounts[lvl]++;
    totalReviews += (st.correctCount || 0) + (st.wrongCount || 0);
  });

  // Level 0 includes unreviewed contacts
  const reviewedCount = Object.keys(learningState).length;
  levelCounts[0] += (totalContacts - reviewedCount);

  const masteredCount = levelCounts[4] + levelCounts[5];
  const overallMastery = Math.round((masteredCount / totalContacts) * 100);

  const handleExport = () => {
    const dataStr = exportAllData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kontakty_vsps_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = (e) => {
    e.preventDefault();
    if (!importText.trim()) return;
    const success = importAllData(importText);
    if (success) {
      setImportStatus('success');
      if (onDataImported) onDataImported();
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setImportStatus('error');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={24} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Statistiky & Správa dat</h3>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Overview Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{overallMastery}%</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Celkové osvojení</div>
          </div>

          <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-success)' }}>{tykaniCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tykáš si</div>
          </div>

          <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-warning)' }}>{notesCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Osobní poznámky</div>
          </div>
        </div>

        {/* Leitner Boxes Progress Breakdown */}
        <div>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Rozložení znalostí podle úrovní (Leitner boxy):
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {[
              { label: 'Úroveň 5 (Mastered)', count: levelCounts[5], color: '#10b981' },
              { label: 'Úroveň 4 (Very Good)', count: levelCounts[4], color: '#3b82f6' },
              { label: 'Úroveň 3 (Good)', count: levelCounts[3], color: '#8b5cf6' },
              { label: 'Úroveň 2 (Learning)', count: levelCounts[2], color: '#f59e0b' },
              { label: 'Úroveň 1 (Struggling)', count: levelCounts[1], color: '#ef4444' },
              { label: 'Úroveň 0 (Noví / Neprojetí)', count: levelCounts[0], color: '#64748b' }
            ].map((lvl, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem' }}>
                <span style={{ width: '160px', color: 'var(--text-secondary)' }}>{lvl.label}</span>
                <div className="progress-bar-track" style={{ flex: 1 }}>
                  <div className="progress-bar-fill" style={{ width: `${(lvl.count / totalContacts) * 100}%`, background: lvl.color }} />
                </div>
                <span style={{ fontWeight: 700, width: '35px', textAlign: 'right' }}>{lvl.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Data Backup Export & Import */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h4 style={{ fontSize: '0.95rem', margin: 0 }}>Zálohování a přenos dat</h4>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="secondary-btn" onClick={handleExport} style={{ flex: 1, fontSize: '0.85rem' }}>
              <Download size={16} /> Stáhnout zálohu (JSON)
            </button>
          </div>

          <form onSubmit={handleImportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Sem vložte JSON kód pro obnovení zálohy..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              style={{ fontSize: '0.8rem' }}
            />
            {importText && (
              <button type="submit" className="secondary-btn" style={{ fontSize: '0.85rem' }}>
                <Upload size={16} /> Obnovit ze zadaného kódu
              </button>
            )}
            {importStatus === 'success' && (
              <p style={{ color: 'var(--accent-success)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Check size={16} /> Data byla úspěšně načtena!
              </p>
            )}
            {importStatus === 'error' && (
              <p style={{ color: 'var(--accent-danger)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <AlertTriangle size={16} /> Chybný JSON kód. Obnovení se nezdařilo.
              </p>
            )}
          </form>
        </div>

        {/* Danger zone reset */}
        <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Vynulovat pouze výsledky výuky?</span>
          <button
            className="secondary-btn"
            onClick={() => {
              if (window.confirm('Opravdu chcete vynulovat všechny vaše naměřené výsledky a začít výuku od nuly?')) {
                onDataReset();
                onClose();
              }
            }}
            style={{ color: 'var(--accent-danger)', borderColor: 'rgba(239, 68, 68, 0.4)', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
          >
            <RotateCcw size={14} /> Vynulovat pokrok výuky
          </button>
        </div>
      </div>
    </div>
  );
}
