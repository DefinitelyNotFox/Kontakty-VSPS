import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Award, Zap, RefreshCw, CheckCircle, XCircle, Sparkles, Image, User, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSound } from '../services/sound';
import { getInitials, getAvatarGradient } from '../utils/avatar';

export default function QuizGame({ contacts, notesMap, customPhotosMap, soundEnabled, onRecordResult }) {
  const [quizType, setQuizType] = useState('photoToName'); // 'photoToName', 'nameToPhoto', 'noPhotoQuiz', 'mixed'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [questionPool, setQuestionPool] = useState([]);
  const [options, setOptions] = useState([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState([]);

  // Generate question deck
  const initQuiz = useCallback(() => {
    let pool = [...contacts];

    if (quizType === 'noPhotoQuiz') {
      pool = contacts.filter(c => !c.hasPhoto && !customPhotosMap[c.id]);
      if (pool.length < 4) {
        // Fallback to all contacts if pool too small
        pool = [...contacts];
      }
    }

    // Shuffle pool
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 10);
    setQuestionPool(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setWrongAnswers([]);
    setQuizFinished(false);
    setSelectedOption(null);
    setIsAnswered(false);
  }, [contacts, customPhotosMap, quizType]);

  useEffect(() => {
    initQuiz();
  }, [initQuiz]);

  // Current question contact
  const currentTarget = questionPool[currentIndex];

  // Determine current question mode (for mixed)
  const currentMode = useMemo(() => {
    if (quizType !== 'mixed') return quizType;
    const modes = ['photoToName', 'nameToPhoto'];
    return modes[currentIndex % modes.length];
  }, [quizType, currentIndex]);

  // Generate 4 options for current question
  useEffect(() => {
    if (!currentTarget) return;

    // Pick 3 distractor contacts distinct from currentTarget
    const distractors = contacts
      .filter((c) => c.id !== currentTarget.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const fourOptions = [...distractors, currentTarget].sort(() => Math.random() - 0.5);
    setOptions(fourOptions);
    setSelectedOption(null);
    setIsAnswered(false);
  }, [currentTarget, contacts]);

  const handleOptionClick = (option) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option.id === currentTarget.id;

    if (onRecordResult) {
      onRecordResult(currentTarget.id, isCorrect);
    }

    if (isCorrect) {
      playSound('correct', soundEnabled);
      setScore((prev) => prev + 10 + streak * 2);
      setStreak((prev) => prev + 1);
    } else {
      playSound('wrong', soundEnabled);
      setStreak(0);
      setWrongAnswers((prev) => [...prev, currentTarget]);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questionPool.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setQuizFinished(true);
      if (soundEnabled) playSound('fanfare', true);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
  };

  if (!currentTarget && !quizFinished) return null;

  // Quiz Completion View
  if (quizFinished) {
    const accuracy = Math.round(((questionPool.length - wrongAnswers.length) / questionPool.length) * 100) || 0;

    return (
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '2.5rem 1.5rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          <Sparkles size={36} />
        </div>

        <div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Kvíz dokončen!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Skvělý trénink paměti na kolegy z VOŠ a SPŠ Šumperk</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', width: '100%' }}>
          <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{score}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Celkové skóre</div>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-success)' }}>{accuracy}%</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Úspěšnost</div>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-warning)' }}>{wrongAnswers.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Chybné odp.</div>
          </div>
        </div>

        {wrongAnswers.length > 0 && (
          <div style={{ width: '100%', textAlign: 'left', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <h4 style={{ color: '#fca5a5', fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <XCircle size={16} /> Kontakty k procvičení z tohoto kvízu:
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {wrongAnswers.map(c => (
                <span key={c.id} style={{ background: 'var(--bg-card)', padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="primary-btn" onClick={initQuiz}>
            <RefreshCw size={18} /> Hrát znovu
          </button>
        </div>
      </div>
    );
  }

  const currentPhoto = customPhotosMap[currentTarget.id] || (currentTarget.hasPhoto ? currentTarget.photoUrl : null);

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header & Sub-mode switch */}
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            className={`secondary-btn ${quizType === 'photoToName' ? 'active' : ''}`}
            onClick={() => setQuizType('photoToName')}
            style={{ padding: '0.4rem 0.7rem', fontSize: '0.8rem' }}
          >
            <Image size={14} /> Fotka → Jméno
          </button>
          <button
            className={`secondary-btn ${quizType === 'nameToPhoto' ? 'active' : ''}`}
            onClick={() => setQuizType('nameToPhoto')}
            style={{ padding: '0.4rem 0.7rem', fontSize: '0.8rem' }}
          >
            <User size={14} /> Jméno → Fotka
          </button>
          <button
            className={`secondary-btn ${quizType === 'noPhotoQuiz' ? 'active' : ''}`}
            onClick={() => setQuizType('noPhotoQuiz')}
            style={{ padding: '0.4rem 0.7rem', fontSize: '0.8rem' }}
          >
            <Layers size={14} /> Bez fotek (11)
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.9rem', fontWeight: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-warning)' }}>
            <Award size={18} /> {score} bodů
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-secondary)' }}>
            <Zap size={18} /> Séria: {streak}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${((currentIndex + 1) / questionPool.length) * 100}%` }} />
        </div>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          {currentIndex + 1} / {questionPool.length}
        </span>
      </div>

      {/* Main Question Card */}
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', textAlign: 'center' }}>
        {currentMode === 'photoToName' || currentMode === 'noPhotoQuiz' ? (
          <>
            <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', tracking: '0.05em', color: 'var(--accent-primary)', fontWeight: 700 }}>
              Kdo je na tomto obrázku / vizitce?
            </div>

            <div className="avatar-wrapper" style={{ width: '130px', height: '130px', border: '3px solid var(--accent-primary)', boxShadow: 'var(--shadow-glow)' }}>
              {currentPhoto ? (
                <img src={currentPhoto} alt="Target" className="avatar-img" />
              ) : (
                <div className="avatar-badge" style={{ background: getAvatarGradient(currentTarget.id), fontSize: '2.5rem' }}>
                  {getInitials(currentTarget.name)}
                </div>
              )}
            </div>

            {/* If note exists or contact is without photo, display hints */}
            {notesMap[currentTarget.id] && (
              <div className="user-note-box" style={{ maxWidth: '400px', width: '100%' }}>
                <span style={{ fontWeight: 700 }}>Nápověda (vaše poznámka):</span> {notesMap[currentTarget.id]}
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', tracking: '0.05em', color: 'var(--accent-primary)', fontWeight: 700 }}>
              Vyber správnou fotku pro kolegu:
            </div>
            <div>
              <h2 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{currentTarget.name}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{currentTarget.role || currentTarget.category}</p>
            </div>
          </>
        )}

        {/* 4 Options Grid */}
        <div className="quiz-options-grid">
          {options.map((opt) => {
            const isCorrect = opt.id === currentTarget.id;
            const isSelected = selectedOption && selectedOption.id === opt.id;
            let statusClass = '';

            if (isAnswered) {
              if (isCorrect) statusClass = 'correct';
              else if (isSelected) statusClass = 'wrong';
            }

            const optPhoto = customPhotosMap[opt.id] || (opt.hasPhoto ? opt.photoUrl : null);

            return (
              <button
                key={opt.id}
                className={`quiz-option-btn ${statusClass}`}
                disabled={isAnswered}
                onClick={() => handleOptionClick(opt)}
              >
                {currentMode === 'nameToPhoto' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="avatar-wrapper" style={{ width: '54px', height: '54px' }}>
                      {optPhoto ? (
                        <img src={optPhoto} alt={opt.name} className="avatar-img" />
                      ) : (
                        <div className="avatar-badge" style={{ background: getAvatarGradient(opt.id), fontSize: '1.2rem' }}>
                          {getInitials(opt.name)}
                        </div>
                      )}
                    </div>
                    {isAnswered && <span style={{ fontSize: '0.85rem' }}>{opt.name}</span>}
                  </div>
                ) : (
                  <span>{opt.name}</span>
                )}

                {isAnswered && isCorrect && <CheckCircle size={20} />}
                {isAnswered && isSelected && !isCorrect && <XCircle size={20} />}
              </button>
            );
          })}
        </div>

        {/* Next Question Button */}
        {isAnswered && (
          <button className="primary-btn" onClick={handleNextQuestion} style={{ marginTop: '0.5rem', width: '100%', maxWidth: '300px' }}>
            Další otázka ➔
          </button>
        )}
      </div>
    </div>
  );
}
