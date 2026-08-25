import React, { useState, useEffect, useCallback } from 'react';
import { Check, X, Sparkles, Image, User, Layers, StickyNote, Eye } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSound } from '../services/sound';
import { getInitials, getAvatarGradient, getGender } from '../utils/avatar';

export default function QuizGame({
  contacts,
  notesMap,
  customPhotosMap,
  soundEnabled,
  onRecordResult
}) {
  const [quizType, setQuizType] = useState('photoToName'); // 'photoToName', 'nameToPhoto', 'mixed'
  const [currentTarget, setCurrentTarget] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [currentMode, setCurrentMode] = useState('photoToName');

  // "Grab from a sack" - Unused deck remaining in current cycle
  const [sackDeck, setSackDeck] = useState([]);

  // Mini inspection modal for option contacts
  const [previewingContact, setPreviewingContact] = useState(null);

  // Stats
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  // Helper to shuffle an array
  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Generate next question using "Grab from a sack"
  const generateQuestion = useCallback((currentSack, availableContacts) => {
    if (!availableContacts || availableContacts.length === 0) return;

    let activeSack = [...currentSack];
    if (activeSack.length === 0) {
      // Sack empty -> Refill with freshly shuffled contacts
      activeSack = shuffleArray(availableContacts);
    }

    const target = activeSack.pop();
    const targetGender = getGender(target);

    // Determine actual sub-mode
    let mode = quizType;
    if (quizType === 'mixed') {
      mode = Math.random() > 0.5 ? 'photoToName' : 'nameToPhoto';
    }
    setCurrentMode(mode);

    // Filter distractors matching exact same gender
    let sameGenderPool = availableContacts.filter(c => c.id !== target.id && getGender(c) === targetGender);

    if (sameGenderPool.length < 3) {
      sameGenderPool = availableContacts.filter(c => c.id !== target.id);
    }

    const shuffledPool = shuffleArray(sameGenderPool);
    const selectedDistractors = shuffledPool.slice(0, 3);
    const allOptions = shuffleArray([...selectedDistractors, target]);

    setCurrentTarget(target);
    setOptions(allOptions);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setPreviewingContact(null);
    setSackDeck(activeSack);
  }, [quizType]);

  // Initial load
  useEffect(() => {
    generateQuestion([], contacts);
  }, [contacts, quizType]);

  const handleOptionClick = (option) => {
    if (isAnswered) return;

    setSelectedAnswer(option);
    setIsAnswered(true);

    const isCorrect = option.id === currentTarget.id;

    if (onRecordResult) {
      onRecordResult(currentTarget.id, isCorrect);
    }

    if (isCorrect) {
      playSound('correct', soundEnabled);
      setScore((prev) => prev + 1);
      setStreak((prev) => {
        const next = prev + 1;
        if (next > bestStreak) setBestStreak(next);
        return next;
      });

      if ((streak + 1) % 5 === 0) {
        playSound('fanfare', soundEnabled);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      }
    } else {
      playSound('wrong', soundEnabled);
      setStreak(0);
    }
  };

  const handleNext = () => {
    generateQuestion(sackDeck, contacts);
  };

  if (!contacts || contacts.length === 0) {
    return (
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '2.5rem 1.5rem', textAlign: 'center' }}>
        <Sparkles size={48} style={{ color: 'var(--accent-warning)', marginBottom: '1rem' }} />
        <h3>🎉 Všechno je naučené!</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Všechny dostupné kontakty máte označené jako zapamatované.</p>
      </div>
    );
  }

  if (!currentTarget) return null;

  const targetPhoto = customPhotosMap[currentTarget.id] || (currentTarget.hasPhoto ? currentTarget.photoUrl : null);
  const targetNote = notesMap[currentTarget.id];

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Header & Sub-mode switch */}
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '0.85rem 1rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          <button
            className={`secondary-btn ${quizType === 'photoToName' ? 'active' : ''}`}
            onClick={() => setQuizType('photoToName')}
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
          >
            <Image size={14} /> Fotka → Jméno
          </button>
          <button
            className={`secondary-btn ${quizType === 'nameToPhoto' ? 'active' : ''}`}
            onClick={() => setQuizType('nameToPhoto')}
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
          >
            <User size={14} /> Jméno → Fotka
          </button>
          <button
            className={`secondary-btn ${quizType === 'mixed' ? 'active' : ''}`}
            onClick={() => setQuizType('mixed')}
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
          >
            <Layers size={14} /> Smíšený
          </button>
        </div>

        {/* Count Indicator: e.g. "16 ze 16" */}
        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
          {sackDeck.length + 1} ze {contacts.length}
        </div>
      </div>

      {/* Main Question Card */}
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '1.5rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', boxShadow: 'var(--shadow-lg)' }}>
        
        {/* Mode 1: Photo -> Pick 1 of 4 Names */}
        {currentMode === 'photoToName' && (
          <>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Kdo je na této fotce?
            </div>

            {/* Target Large Photo / Avatar */}
            <div className="avatar-wrapper" style={{ width: '140px', height: '140px', border: '3px solid var(--accent-primary)', boxShadow: 'var(--shadow-glow)' }}>
              {targetPhoto ? (
                <img src={targetPhoto} alt="Kolega" className="avatar-img" />
              ) : (
                <div className="avatar-badge" style={{ background: getAvatarGradient(currentTarget.id), fontSize: '2.75rem' }}>
                  {getInitials(currentTarget.name)}
                </div>
              )}
            </div>

            {/* Note prompt if present */}
            {targetNote && (
              <div className="user-note-box" style={{ maxWidth: '400px', margin: '0 auto' }}>
                <StickyNote size={14} style={{ flexShrink: 0 }} /> <span>Nápověda: {targetNote}</span>
              </div>
            )}

            {/* 4 Responsive Name Options Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem', width: '100%', marginTop: '0.25rem' }}>
              {options.map((option) => {
                let btnStyle = {
                  padding: '0.75rem 0.6rem',
                  fontSize: 'clamp(0.78rem, 2.5vw, 0.9rem)',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  cursor: isAnswered ? 'default' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  minHeight: '48px',
                  lineHeight: '1.25'
                };

                if (isAnswered) {
                  if (option.id === currentTarget.id) {
                    btnStyle.background = 'linear-gradient(135deg, #10b981, #059669)';
                    btnStyle.color = 'white';
                    btnStyle.borderColor = '#10b981';
                  } else if (selectedAnswer && option.id === selectedAnswer.id) {
                    btnStyle.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                    btnStyle.color = 'white';
                    btnStyle.borderColor = '#ef4444';
                  } else {
                    btnStyle.opacity = 0.5;
                  }
                }

                return (
                  <div key={option.id} style={{ display: 'flex', width: '100%', gap: '0.25rem' }}>
                    <button
                      style={{ ...btnStyle, flex: 1 }}
                      onClick={() => handleOptionClick(option)}
                      disabled={isAnswered}
                    >
                      <span style={{ overflowWrap: 'break-word', wordBreak: 'break-word', textAlign: 'center', width: '100%' }}>{option.name}</span>
                      {isAnswered && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', flexShrink: 0 }}>
                          {option.id === currentTarget.id && <Check size={16} />}
                          {selectedAnswer && option.id === selectedAnswer.id && option.id !== currentTarget.id && <X size={16} />}
                        </div>
                      )}
                    </button>

                    {/* Image inspection button after answer */}
                    {isAnswered && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewingContact(option);
                        }}
                        style={{
                          width: '38px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-card)',
                          color: 'var(--accent-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          flexShrink: 0
                        }}
                        title={`Zobrazit fotku: ${option.name}`}
                      >
                        <Eye size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Mode 2: Name -> Pick 1 of 4 Square Photos (Aspect Ratio 1:1) */}
        {currentMode === 'nameToPhoto' && (
          <>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Vyberte fotku pro jméno:
            </div>

            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', margin: 0, wordBreak: 'break-word' }}>
              {currentTarget.name}
            </h2>

            <p style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>
              {currentTarget.role || currentTarget.category}
            </p>

            {/* 4 Square Photo Options Grid (Aspect Ratio 1:1) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', width: '100%', maxWidth: '420px', margin: '0.25rem auto 0 auto' }}>
              {options.map((option) => {
                const photo = customPhotosMap[option.id] || (option.hasPhoto ? option.photoUrl : null);
                const isCorrect = option.id === currentTarget.id;
                const isSelected = selectedAnswer && option.id === selectedAnswer.id;

                let borderStyle = '3px solid transparent';
                if (isAnswered) {
                  if (isCorrect) borderStyle = '3px solid var(--accent-success)';
                  else if (isSelected) borderStyle = '3px solid var(--accent-danger)';
                }

                return (
                  <div key={option.id} style={{ position: 'relative' }}>
                    <div
                      onClick={() => handleOptionClick(option)}
                      style={{
                        position: 'relative',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        border: borderStyle,
                        cursor: isAnswered ? 'default' : 'pointer',
                        background: 'var(--bg-card)',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'transform 0.15s ease',
                        aspectRatio: '1 / 1',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {photo ? (
                        <img
                          src={photo}
                          alt="Možnost"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
                        />
                      ) : (
                        <div className="avatar-badge" style={{ background: getAvatarGradient(option.id), width: '100%', height: '100%', fontSize: '2.5rem' }}>
                          {getInitials(option.name)}
                        </div>
                      )}

                      {isAnswered && (
                        <div style={{ position: 'absolute', inset: 0, background: isCorrect ? 'rgba(16, 185, 129, 0.4)' : isSelected ? 'rgba(239, 68, 68, 0.4)' : 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                          {isCorrect && <Check size={32} strokeWidth={3} />}
                          {isSelected && !isCorrect && <X size={32} strokeWidth={3} />}
                        </div>
                      )}
                    </div>

                    {/* Name inspection button after answer */}
                    {isAnswered && (
                      <button
                        type="button"
                        onClick={() => setPreviewingContact(option)}
                        style={{
                          marginTop: '0.35rem',
                          width: '100%',
                          padding: '0.35rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-card)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.25rem',
                          cursor: 'pointer'
                        }}
                      >
                        <Eye size={13} /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{option.name}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Next Question Button */}
        {isAnswered && (
          <button
            className="primary-btn"
            onClick={handleNext}
            style={{ marginTop: '0.25rem', padding: '0.85rem 2rem', fontSize: '1rem', width: '100%', animation: 'fadeIn 0.2s ease' }}
          >
            Další otázka ➔
          </button>
        )}
      </div>

      {/* Mini Photo Inspection Lightbox */}
      {previewingContact && (
        <div className="modal-overlay" onClick={() => setPreviewingContact(null)}>
          <div className="modal-content" style={{ maxWidth: '320px', textAlign: 'center', padding: '1.25rem' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem' }}>{previewingContact.name}</h3>
              <button className="icon-button" onClick={() => setPreviewingContact(null)}>
                <X size={18} />
              </button>
            </div>
            
            <div className="avatar-wrapper" style={{ width: '160px', height: '160px', margin: '0 auto 0.75rem auto', border: '3px solid var(--accent-primary)', boxShadow: 'var(--shadow-glow)' }}>
              {customPhotosMap[previewingContact.id] || previewingContact.photoUrl ? (
                <img src={customPhotosMap[previewingContact.id] || previewingContact.photoUrl} alt={previewingContact.name} className="avatar-img" />
              ) : (
                <div className="avatar-badge" style={{ background: getAvatarGradient(previewingContact.id), fontSize: '3rem' }}>
                  {getInitials(previewingContact.name)}
                </div>
              )}
            </div>

            <p style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600, margin: '0 0 0.25rem 0' }}>
              {previewingContact.role || previewingContact.category}
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: 0 }}>
              Kabinet: {previewingContact.cabinet || 'neuvedeno'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
