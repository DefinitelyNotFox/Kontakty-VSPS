import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Crop, Upload, Check, UserPlus, X, Image as ImageIcon, CheckCircle2, Circle, Search, ChevronRight, Sparkles, RefreshCw } from 'lucide-react';
import { getInitials, getAvatarGradient } from '../utils/avatar';

export default function ClassPhotoCropper({
  classes,
  targetClass,
  onUpdateStudentPhoto,
  onAddStudent,
  onClose
}) {
  const [selectedClassId, setSelectedClassId] = useState(targetClass?.id || classes[0]?.id);
  const [imageSrc, setImageSrc] = useState(null);
  const [cropRect, setCropRect] = useState(null); // { x, y, width, height } in container px
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const [croppedPreviewUrl, setCroppedPreviewUrl] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [rosterFilter, setRosterFilter] = useState('missing'); // 'missing', 'all', 'done'
  const [rosterSearch, setRosterSearch] = useState('');
  const [addedCount, setAddedCount] = useState(0);

  // Manual fallback mode for adding new student not on list
  const [isManualMode, setIsManualMode] = useState(false);
  const [customStudentName, setCustomStudentName] = useState('');
  const [customStudentNote, setCustomStudentNote] = useState('');

  const imgRef = useRef(null);
  const containerRef = useRef(null);

  // Current active class object
  const currentClass = useMemo(() => {
    return classes.find(c => c.id === selectedClassId) || targetClass || classes[0];
  }, [classes, selectedClassId, targetClass]);

  // Students of current class
  const students = useMemo(() => {
    return currentClass?.students || [];
  }, [currentClass]);

  // Auto-select first student without photo when class changes
  useEffect(() => {
    if (students.length > 0) {
      const firstWithoutPhoto = students.find(s => !s.hasPhoto && !s.photoUrl);
      if (firstWithoutPhoto) {
        setSelectedStudentId(firstWithoutPhoto.id);
      } else {
        setSelectedStudentId(students[0].id);
      }
    } else {
      setSelectedStudentId(null);
    }
  }, [selectedClassId, students]);

  const selectedStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentId) || null;
  }, [students, selectedStudentId]);

  // Filtered roster for UI list
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const hasPhoto = !!student.photoUrl || student.hasPhoto;
      if (rosterFilter === 'missing' && hasPhoto) return false;
      if (rosterFilter === 'done' && !hasPhoto) return false;
      if (rosterSearch.trim()) {
        const q = rosterSearch.toLowerCase().trim();
        if (!student.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [students, rosterFilter, rosterSearch]);

  const missingPhotoCount = useMemo(() => {
    return students.filter(s => !s.hasPhoto && !s.photoUrl).length;
  }, [students]);

  const donePhotoCount = useMemo(() => {
    return students.filter(s => s.hasPhoto || !!s.photoUrl).length;
  }, [students]);

  // File upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
      setCropRect(null);
      setCroppedPreviewUrl(null);
    };
    reader.readAsDataURL(file);
  };

  // Mouse & Touch drawing handlers
  const getCoordinatesFromEvent = (e) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: Math.max(0, Math.min(clientX - rect.left, rect.width)),
      y: Math.max(0, Math.min(clientY - rect.top, rect.height))
    };
  };

  const handleStartDraw = (e) => {
    if (e.touches && e.touches.length > 1) return; // ignore pinch zoom
    const pos = getCoordinatesFromEvent(e);
    setStartPos(pos);
    setCropRect({ x: pos.x, y: pos.y, width: 10, height: 10 });
    setIsDrawing(true);
  };

  const handleMoveDraw = (e) => {
    if (!isDrawing || !containerRef.current) return;
    const current = getCoordinatesFromEvent(e);

    const x = Math.min(startPos.x, current.x);
    const y = Math.min(startPos.y, current.y);
    const width = Math.abs(current.x - startPos.x);
    const height = Math.abs(current.y - startPos.y);

    setCropRect({ x, y, width, height });
  };

  const handleEndDraw = () => {
    if (isDrawing) {
      setIsDrawing(false);
      generateCropDataUrl();
    }
  };

  // Render cropped face to canvas data URL
  const generateCropDataUrl = () => {
    if (!cropRect || !imgRef.current || cropRect.width < 10 || cropRect.height < 10) return;

    const img = imgRef.current;
    const container = containerRef.current;
    if (!container) return;

    const scaleX = img.naturalWidth / container.clientWidth;
    const scaleY = img.naturalHeight / container.clientHeight;

    const sourceX = cropRect.x * scaleX;
    const sourceY = cropRect.y * scaleY;
    const sourceWidth = cropRect.width * scaleX;
    const sourceHeight = cropRect.height * scaleY;

    const canvas = document.createElement('canvas');
    const outputSize = 256;
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext('2d');

    // White background fill
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, outputSize, outputSize);

    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      outputSize,
      outputSize
    );

    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setCroppedPreviewUrl(dataUrl);
  };

  // Assign cropped photo to existing student in class roster
  const handleAssignToSelectedStudent = () => {
    if (!selectedStudent || !croppedPreviewUrl || !currentClass) return;

    if (onUpdateStudentPhoto) {
      onUpdateStudentPhoto(currentClass.id, selectedStudent.id, croppedPreviewUrl);
    }

    setAddedCount(prev => prev + 1);
    setCropRect(null);
    setCroppedPreviewUrl(null);

    // Auto-advance to next student who still needs a photo
    const currentIndex = students.findIndex(s => s.id === selectedStudent.id);
    const nextCandidates = [
      ...students.slice(currentIndex + 1),
      ...students.slice(0, currentIndex)
    ];
    const nextStudentWithoutPhoto = nextCandidates.find(
      s => s.id !== selectedStudent.id && !s.hasPhoto && !s.photoUrl
    );

    if (nextStudentWithoutPhoto) {
      setSelectedStudentId(nextStudentWithoutPhoto.id);
    }
  };

  // Add a brand new student not on the roster
  const handleSaveCustomStudent = (e) => {
    e.preventDefault();
    if (!customStudentName.trim() || !currentClass) return;

    if (onAddStudent) {
      onAddStudent(currentClass.id, {
        name: customStudentName.trim(),
        photoUrl: croppedPreviewUrl || '',
        note: customStudentNote.trim()
      });
    }

    setAddedCount(prev => prev + 1);
    setCustomStudentName('');
    setCustomStudentNote('');
    setCropRect(null);
    setCroppedPreviewUrl(null);
    setIsManualMode(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{
          maxWidth: '1150px',
          width: '96vw',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.25rem'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <Crop size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Hromadný ořez fotek ze společné fotografie
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                Vyberte třídu, ořízněte obličej a přiřaďte ho žákovi ze seznamu jedním kliknutím
              </p>
            </div>
          </div>

          {/* Class Selector Dropdown in Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Třída:</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="form-input"
                style={{
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-md)',
                  minWidth: '150px'
                }}
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    Třída {cls.name} ({cls.students.length} žáků)
                  </option>
                ))}
              </select>
            </div>

            <button className="icon-button" onClick={onClose} title="Zavřít">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Step 1: Upload or Main Work Area */}
        {!imageSrc ? (
          <div className="glass-panel" style={{ border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '3.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', margin: 'auto' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
              <ImageIcon size={32} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>Nahrát společnou fotku třídy {currentClass?.name}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '480px' }}>
                Nahrajte společnou fotografii třídy ve formátu JPG nebo PNG. Následně z ní budete moci tahem myši postupně vyřezávat obličeje a přiřazovat je žákům ze seznamu.
              </p>
            </div>
            <label className="primary-btn" style={{ cursor: 'pointer', padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}>
              <Upload size={18} /> Vybrat společnou fotku z počítače
              <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem', alignItems: 'start', flex: 1, minHeight: 0, overflow: 'hidden' }}>
            {/* Left Column: Interactive Image Viewer & Crop Box */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%', minHeight: 0 }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>💡 <strong>Návod:</strong> Tahem myši/prstu po fotce nakreslete obdélník kolem obličeje</span>
                <label style={{ cursor: 'pointer', color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <RefreshCw size={13} /> Změnit fotku třídy
                  <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
              </div>

              <div
                ref={containerRef}
                onMouseDown={handleStartDraw}
                onMouseMove={handleMoveDraw}
                onMouseUp={handleEndDraw}
                onTouchStart={handleStartDraw}
                onTouchMove={handleMoveDraw}
                onTouchEnd={handleEndDraw}
                style={{
                  position: 'relative',
                  width: '100%',
                  maxHeight: '65vh',
                  background: '#090d16',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'auto',
                  cursor: 'crosshair',
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--border-color)'
                }}
              >
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Class photo"
                  style={{ width: '100%', height: 'auto', display: 'block', pointerEvents: 'none' }}
                />

                {/* Drawing Box Overlay */}
                {cropRect && (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${cropRect.x}px`,
                      top: `${cropRect.y}px`,
                      width: `${cropRect.width}px`,
                      height: `${cropRect.height}px`,
                      border: '2px solid #3b82f6',
                      background: 'rgba(59, 130, 246, 0.25)',
                      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.55)',
                      pointerEvents: 'none',
                      borderRadius: '4px'
                    }}
                  />
                )}
              </div>
            </div>

            {/* Right Column: Student Roster & Fast Assignment */}
            <div className="glass-panel" style={{ borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '72vh', overflowY: 'auto' }}>
              
              {/* Cropped Face Preview Area */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ width: '68px', height: '68px', flexShrink: 0, borderRadius: '50%', overflow: 'hidden', border: croppedPreviewUrl ? '3px solid var(--accent-success)' : '2px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
                  {croppedPreviewUrl ? (
                    <img src={croppedPreviewUrl} alt="Výřez" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Crop size={24} style={{ color: 'var(--text-muted)' }} />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>
                    Aktuální výřez obličeje
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: croppedPreviewUrl ? 'var(--accent-success)' : 'var(--text-secondary)' }}>
                    {croppedPreviewUrl ? '✓ Obličej oříznut' : 'Označte obličej na fotce'}
                  </div>
                </div>
              </div>

              {/* Mode Toggle: Assign to Roster vs Add New */}
              <div style={{ display: 'flex', gap: '0.35rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <button
                  type="button"
                  className={`nav-btn ${!isManualMode ? 'active' : ''}`}
                  onClick={() => setIsManualMode(false)}
                  style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.78rem', justifyContent: 'center' }}
                >
                  Seznam žáků ({students.length})
                </button>
                <button
                  type="button"
                  className={`nav-btn ${isManualMode ? 'active' : ''}`}
                  onClick={() => setIsManualMode(true)}
                  style={{ padding: '0.35rem 0.5rem', fontSize: '0.78rem', justifyContent: 'center' }}
                >
                  + Jiné jméno
                </button>
              </div>

              {!isManualMode ? (
                <>
                  {/* Selected Student Confirmation / Quick Action Button */}
                  {selectedStudent ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Přiřadit pro:</span>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                          {selectedStudent.name}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="primary-btn"
                        disabled={!croppedPreviewUrl}
                        onClick={handleAssignToSelectedStudent}
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.9rem',
                          fontSize: '0.85rem',
                          background: croppedPreviewUrl ? 'linear-gradient(135deg, #10b981, #059669)' : undefined,
                          justifyContent: 'center'
                        }}
                      >
                        <Check size={16} /> Přiřadit fotku: {selectedStudent.name.split(' ')[0]}
                      </button>
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                      Vyberte žáka ze seznamu níže
                    </p>
                  )}

                  {/* Filter Tabs for Roster */}
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className={`secondary-btn ${rosterFilter === 'missing' ? 'active' : ''}`}
                      onClick={() => setRosterFilter('missing')}
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', borderRadius: 'var(--radius-full)' }}
                    >
                      Bez fotky ({missingPhotoCount})
                    </button>
                    <button
                      type="button"
                      className={`secondary-btn ${rosterFilter === 'all' ? 'active' : ''}`}
                      onClick={() => setRosterFilter('all')}
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', borderRadius: 'var(--radius-full)' }}
                    >
                      Všichni ({students.length})
                    </button>
                    <button
                      type="button"
                      className={`secondary-btn ${rosterFilter === 'done' ? 'active' : ''}`}
                      onClick={() => setRosterFilter('done')}
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', borderRadius: 'var(--radius-full)' }}
                    >
                      Hotovo ({donePhotoCount})
                    </button>
                  </div>

                  {/* Search input in roster */}
                  <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Hledat žáka v seznamu..."
                      value={rosterSearch}
                      onChange={(e) => setRosterSearch(e.target.value)}
                      style={{ paddingLeft: '2rem', paddingRight: '0.5rem', height: '32px', fontSize: '0.8rem' }}
                    />
                  </div>

                  {/* Interactive Student Roster List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', overflowY: 'auto', maxHeight: '250px', paddingRight: '0.2rem' }}>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => {
                        const isSelected = selectedStudent?.id === student.id;
                        const hasPhoto = !!student.photoUrl || student.hasPhoto;

                        return (
                          <div
                            key={student.id}
                            onClick={() => setSelectedStudentId(student.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.45rem 0.6rem',
                              borderRadius: 'var(--radius-sm)',
                              background: isSelected ? 'rgba(59, 130, 246, 0.18)' : 'var(--bg-card)',
                              border: isSelected ? '1px solid var(--accent-primary)' : '1px solid transparent',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                              <div style={{ width: '28px', height: '28px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: getAvatarGradient(student.id), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem' }}>
                                {student.photoUrl ? (
                                  <img src={student.photoUrl} alt={student.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  getInitials(student.name)
                                )}
                              </div>

                              <span style={{ fontSize: '0.82rem', fontWeight: isSelected ? 600 : 400, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {student.name}
                              </span>
                            </div>

                            {hasPhoto ? (
                              <CheckCircle2 size={15} style={{ color: 'var(--accent-success)', flexShrink: 0 }} />
                            ) : (
                              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', flexShrink: 0, padding: '0.1rem 0.35rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                                Chybí
                              </span>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ textAlign: 'center', padding: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Žádný žák neodpovídá filtru
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Manual Custom Student Form */
                <form onSubmit={handleSaveCustomStudent} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
                      Jméno žáka:*
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Např. Petr Novák"
                      value={customStudentName}
                      onChange={(e) => setCustomStudentName(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
                      Poznámka (volitelná):
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Např. přistoupil v pololetí..."
                      value={customStudentNote}
                      onChange={(e) => setCustomStudentNote(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="primary-btn"
                    disabled={!customStudentName.trim() || !croppedPreviewUrl}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <UserPlus size={16} /> Vytvořit žáka s výřezem
                  </button>
                </form>
              )}

              {addedCount > 0 && (
                <div style={{ background: 'var(--accent-success-bg)', color: 'var(--accent-success)', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', textAlign: 'center', fontWeight: 600 }}>
                  🎉 Přiřazeno z této fotky: {addedCount} žáků
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
