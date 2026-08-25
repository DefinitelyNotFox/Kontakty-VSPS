import React, { useState, useEffect, useCallback } from 'react';
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
  
  // "Grab from a sack" - Unused deck remaining in current cycle
  const [sackDeck, setSackDeck] = useState([]);
  const [currentContact, setCurrentContact] = useState(null);

  // Stats tracking
  const [totalReviewedCount, setTotalReviewedCount] = useState(0);

  // Helper to shuffle an array
  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Pull next card from sack (or refill sack if empty)
  const drawNextFromSack = useCallback((currentSack, availableContacts) => {
    if (!availableContacts || availableContacts.length === 0) return { nextCard: null, newSack: [] };

    let activeSack = [...currentSack];
    if (activeSack.length === 0) {
      // Refill sack with freshly shuffled contacts
      activeSack = shuffleArray(availableContacts);
    }

    const nextCard = activeSack.pop();
    return { nextCard, newSack: activeSack };
  }, []);

  // Initialize or reset game deck
  useEffect(() => {
    if (contacts && contacts.length > 0) {
      const { nextCard, newSack } = drawNextFromSack([], contacts);
      setCurrentContact(nextCard);
      setSackDeck(newSack);
      setIsRevealed(false);
    }
  }, [contacts, drawNextFromSack]);

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

    setTotalReviewedCount((prev) => prev + 1);

    if (isCorrect) {
      playSound('correct', soundEnabled);
    } else {
      playSound('wrong', soundEnabled);
    }

    setIsRevealed(false);

    // Seamless advance to next card from sack without middle celebrations
    const { nextCard, newSack } = drawNextFromSack(sackDeck, contacts);
    setCurrentContact(nextCard);
    setSackDeck(newSack);
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

  if (!currentContact) return null;

  const currentPhoto = customPhotosMap[currentContact.id] || (currentContact.hasPhoto ? currentContact.photoUrl : null);
  const note = notesMap[currentContact.id];

  return (
    <div style={{ maxWidth: '540px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Progress header showing clean count indicator e.g. "16 ze 16" */}
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 700 }}>
          <Layers size={18} style={{ color: 'var(--accent-primary)' }} />
          <span>{sackDeck.length + 1} ze {contacts.length}</span>
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
          boxShadow: 'var(--shadow-lg)',
          position: 'relative'
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
