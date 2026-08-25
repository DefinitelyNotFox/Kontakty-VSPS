import React from 'react';
import { School, GraduationCap, Sparkles, Layers } from 'lucide-react';

export default function DatasetSelector({
  activeDataset,
  onSelectDataset,
  teacherCount,
  classes
}) {
  const totalStudentCount = classes.reduce((acc, c) => acc + c.students.length, 0);

  return (
    <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '0.85rem 1.25rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
        <Layers size={18} style={{ color: 'var(--accent-primary)' }} />
        <span>Dataset pro výuku:</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        {/* Teachers Dataset */}
        <button
          className={`secondary-btn ${activeDataset === 'teachers' ? 'active' : ''}`}
          onClick={() => onSelectDataset('teachers')}
          style={{
            padding: '0.4rem 0.8rem',
            fontSize: '0.8rem',
            borderRadius: 'var(--radius-full)',
            background: activeDataset === 'teachers' ? 'var(--accent-primary)' : undefined,
            color: activeDataset === 'teachers' ? 'white' : undefined
          }}
        >
          <School size={14} /> Učitelé & Vedení ({teacherCount})
        </button>

        {/* All Students Dataset */}
        {totalStudentCount > 0 && (
          <button
            className={`secondary-btn ${activeDataset === 'all_students' ? 'active' : ''}`}
            onClick={() => onSelectDataset('all_students')}
            style={{
              padding: '0.4rem 0.8rem',
              fontSize: '0.8rem',
              borderRadius: 'var(--radius-full)',
              background: activeDataset === 'all_students' ? 'var(--accent-secondary)' : undefined,
              color: activeDataset === 'all_students' ? 'white' : undefined
            }}
          >
            <GraduationCap size={14} /> Všichni žáci ({totalStudentCount})
          </button>
        )}

        {/* Specific Classes */}
        {classes.map((cls) => (
          <button
            key={cls.id}
            className={`secondary-btn ${activeDataset === `class_${cls.id}` ? 'active' : ''}`}
            onClick={() => onSelectDataset(`class_${cls.id}`)}
            style={{
              padding: '0.4rem 0.8rem',
              fontSize: '0.8rem',
              borderRadius: 'var(--radius-full)',
              background: activeDataset === `class_${cls.id}` ? '#ec4899' : undefined,
              color: activeDataset === `class_${cls.id}` ? 'white' : undefined
            }}
          >
            Třída {cls.name} ({cls.students.length})
          </button>
        ))}

        {/* Mix Dataset */}
        {totalStudentCount > 0 && (
          <button
            className={`secondary-btn ${activeDataset === 'mix' ? 'active' : ''}`}
            onClick={() => onSelectDataset('mix')}
            style={{
              padding: '0.4rem 0.8rem',
              fontSize: '0.8rem',
              borderRadius: 'var(--radius-full)',
              background: activeDataset === 'mix' ? 'var(--accent-success)' : undefined,
              color: activeDataset === 'mix' ? 'white' : undefined
            }}
          >
            <Sparkles size={14} /> Vše dohromady ({teacherCount + totalStudentCount})
          </button>
        )}
      </div>
    </div>
  );
}
