import React from 'react';
import { Layers, EyeOff, Eye } from 'lucide-react';

export default function DatasetSelector({
  activeDataset,
  onSelectDataset,
  teacherCount,
  classes,
  includeMemorized,
  onToggleIncludeMemorized,
  memorizedCount,
  activePoolCount
}) {
  const totalStudentCount = classes.reduce((acc, c) => acc + c.students.length, 0);

  return (
    <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.65rem' }}>
        
        {/* Left Side: Single Dropdown Menu for Dataset Selection */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: '1', minWidth: '220px' }}>
          <Layers size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
          <select
            value={activeDataset}
            onChange={(e) => onSelectDataset(e.target.value)}
            className="form-input"
            style={{
              padding: '0.45rem 0.75rem',
              fontSize: '0.88rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              flex: 1
            }}
          >
            <option value="teachers">🏫 Učitelé & Vedení ({teacherCount})</option>
            {totalStudentCount > 0 && (
              <option value="all_students">🎓 Všichni žáci ({totalStudentCount})</option>
            )}
            {classes.map((cls) => (
              <option key={cls.id} value={`class_${cls.id}`}>
                📁 Třída {cls.name} ({cls.students.length})
              </option>
            ))}
            {totalStudentCount > 0 && (
              <option value="mix">🔀 Vše dohromady ({teacherCount + totalStudentCount})</option>
            )}
          </select>
        </div>

        {/* Right Side: Compact Memorized Filter Toggle & Pool Count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={onToggleIncludeMemorized}
            className="secondary-btn"
            style={{
              padding: '0.4rem 0.65rem',
              fontSize: '0.78rem',
              borderColor: !includeMemorized ? 'var(--accent-warning)' : undefined,
              color: !includeMemorized ? '#fbbf24' : 'var(--text-secondary)',
              borderRadius: 'var(--radius-md)'
            }}
            title={includeMemorized ? 'Klikněte pro skrytí zapamatovaných kontaktů' : 'Zobrazují se pouze nezpamatované kontakty'}
          >
            {!includeMemorized ? <EyeOff size={14} /> : <Eye size={14} />}
            <span>{!includeMemorized ? `Skryto ${memorizedCount}` : 'Včetně naučených'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
