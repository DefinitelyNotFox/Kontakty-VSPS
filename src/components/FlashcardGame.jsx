import React, { useState, useEffect } from 'react';
import { Eye, Check, X, RotateCcw, Sparkles, StickyNote, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSound } from '../services/sound';
import { getInitials, getAvatarGradient } from '../utils/avatar';

export default function FlashcardGame({
  contacts,
  notesMap,
  customPhotosMap,
  learningState,
  soundEnabled,
  onRecordResult
}) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [roundBatchSize] = useState(10);
  
  // Current active cards batch (queue)
  const [activeQueue, setActiveQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Track round statistics (10 cards)
  const [roundErrors, setRoundErrors] = useState([]);
  const [roundSuccesses, setRoundSuccesses] = useState([]);
  const [isRoundSummary, setIsRoundSummary] = useState(false);

  // Initialize card queue (sort by lowest Leitner level first)
  const initDeck = (customList = null) => {
    let deck = [];

    if (customList && customList.length > 0) {
      deck = [...customList];
    } else {
      deck = [...contacts].sort((a, b) => {
        const stateA = learningState[a.id] || { level: 0, lastReviewed: 0 };
        const stateB = learningState[b.id] || { level: 0, lastReviewed: 0 };

        if (stateA.level !== stateB.level) {
          return stateA.level - stateB.level;
        }
        return stateA.lastReviewed - stateB.lastReviewed;
      });
    }

    setActiveQueue(deck);
    setCurrentIndex(0);
    setIsRevealed(false);
    setRoundErrors([]);
    setRoundSuccesses([]);
    setIsRoundSummary(false);
  };

  useEffect(() => {
    initDeck();
  }, [contacts]);

  const currentContact = activeQueue[currentIndex];

  const handleReveal = () => {
    if (!isRevealed) {
      playSound('flip', soundEnabled);
      setIsRevealed(true);
    }
  };

  const handleAnswer = (isCorrect) => {
    if (!currentContact) return;

    if (onRecordResult) {
      onRecordResult(currentContact.id, isCorrect);
    }

    if (isCorrect) {
      playSound('correct', soundEnabled);
      setRoundSuccesses((prev) => [...prev, currentContact]);
    } else {
      playSound('wrong', soundEnabled);
      setRoundErrors((prev) => [...prev, currentContact]);
    }

    setIsRevealed(false);

    // Check if end of 10-card round reached
    const isRoundEnd = (currentIndex + 1) >= Math.min(roundBatchSize, activeQueue.length);

    if (isRoundEnd) {
      setIsRoundSummary(true);
      if (soundEnabled) playSound('fanfare', true);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleReviewErrors = () => {
    if (roundErrors.length > 0) {
      initDeck(roundErrors);
    }
  };

  const handleContinueNextBatch = () => {
    const remaining = activeQueue.slice(roundBatchSize);
    if (remaining.length === 0) {
      initDeck();
    } else {
      setActiveQueue(remaining);
      setCurrentIndex(0);
      setIsRevealed(false);
      setRoundErrors([]);
      setRoundSuccesses([]);
      setIsRoundSummary(false);
    }
  };

  if (!currentContact && !isRoundSummary) return null;

  // Round Summary Screen (After 10 cards)
  if (isRoundSummary) {
    const totalRound = roundSuccesses.length + roundErrors.length;

    return (
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '2.5rem 1.5rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          <Sparkles size={36} />
        </div>

        <div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Série 10 kartiček dokončena!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Zde je vaše bilance z proběhlé série:</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', width: '100%' }}>
          <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalRound}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Projetých kartiček</div>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-success)' }}>{roundSuccesses.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Věděl jsem</div>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-danger)' }}>{roundErrors.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Nevěděl jsem</div>
          </div>
        </div>

        {/* Errors list for review */}
        {roundErrors.length > 0 ? (
          <div style={{ width: '100%', textAlign: 'left', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h4 style={{ color: '#fca5a5', fontSize: '0.95rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <X size={18} /> Kontakty, které jste v této sérii nevěděl ({roundErrors.length}):
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {roundErrors.map(c => (
                <span key={c.id} style={{ background: 'var(--bg-card)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontWeight: 600 }}>
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ background: 'var(--accent-success-bg)', color: 'var(--accent-success)', padding: '1rem', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
            🎉 Perfektní! Všechny kartičky z této série jste věděl bez jediné chyby!
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
          {roundErrors.length > 0 && (
            <button className="secondary-btn" onClick={handleReviewErrors} style={{ borderColor: 'var(--accent-danger)', color: 'var(--accent-danger)' }}>
              <RotateCcw size={18} /> Procvičit znovu {roundErrors.length} neznámých kontaktů
            </button>
          )}
          <button className="primary-btn" onClick={handleContinueNextBatch}>
            Pokračovat na dalších 10 kartiček ➔
          </button>
        </div>
      </div>
    );
  }

  const currentPhoto = customPhotosMap[currentContact.id] || (currentContact.hasPhoto ? currentContact.photoUrl : null);
  const note = notesMap[currentContact.id];

  return (
    <div style={{ maxWidth: '540px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Progress header */}
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <Layers size={18} style={{ color: 'var(--accent-primary)' }} />
          <span>Série (10 kartiček)</span>
        </div>

        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
          Karta {currentIndex + 1} / {Math.min(roundBatchSize, activeQueue.length)}
        </div>
      </div>

      {/* Main Flashcard Card with FIXED HEIGHT & STATIONARY BUTTONS */}
      <div
        className="glass-panel"
        style={{
          borderRadius: 'var(--radius-lg)',
          padding: '2rem 1.5rem',
          minHeight: '440px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          textAlign: 'center',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Upper Portion: Photo + Optional Note */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%' }}>
          {/* Large Photo / Avatar Badge */}
          <div className="avatar-wrapper" style={{ width: '140px', height: '140px', border: '3px solid var(--accent-primary)', boxShadow: 'var(--shadow-glow)' }}>
            {currentPhoto ? (
              <img src={currentPhoto} alt="Kolega" className="avatar-img" />
            ) : (
              <div className="avatar-badge" style={{ background: getAvatarGradient(currentContact.id), fontSize: '3rem' }}>
                {getInitials(currentContact.name)}
              </div>
            )}
          </div>

          {/* Photoless Badge */}
          {!currentContact.hasPhoto && !customPhotosMap[currentContact.id] && (
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', fontWeight: 600 }}>
              ⚠️ Avatar karta • Role: {currentContact.role || currentContact.category}
            </div>
          )}

          {/* Note if available */}
          {note && (
            <div className="user-note-box" style={{ width: '100%', maxWidth: '380px' }}>
              <StickyNote size={15} style={{ flexShrink: 0 }} /> <span>{note}</span>
            </div>
          )}
        </div>

        {/* Middle Reserved Name Area (Fixed height so buttons don't shift) */}
        <div style={{ minHeight: '80px', display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%' }}>
          {isRevealed && (
            <div style={{ animation: 'fadeIn 0.2s ease' }}>
              <h2 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', marginBottom: '0.2rem', lineHeight: '1.2' }}>
                {currentContact.name}
              </h2>
              <p style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>
                {currentContact.role || currentContact.category}
              </p>
            </div>
          )}
        </div>

        {/* Fixed Position Bottom Button Area (Stationary in exact same spot) */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', height: '64px', alignItems: 'center' }}>
          {!isRevealed ? (
            <button
              className="primary-btn"
              onClick={handleReveal}
              style={{ padding: '0.85rem 1.75rem', fontSize: '1rem', height: '52px' }}
            >
              <Eye size={18} /> Zobrazit odpověď
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', animation: 'fadeIn 0.2s ease' }}>
              {/* Incorrect Red Icon Tile */}
              <button
                onClick={() => handleAnswer(false)}
                title="Nevěděl jsem (Chyba)"
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
                  transition: 'transform 0.15s ease'
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.92)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <X size={30} strokeWidth={3} />
              </button>

              {/* Correct Green Icon Tile */}
              <button
                onClick={() => handleAnswer(true)}
                title="Věděl jsem! (Správně)"
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                  transition: 'transform 0.15s ease'
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.92)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Check size={30} strokeWidth={3} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
