import React, { useState, useRef, useEffect } from 'react';
import { Crop, Upload, Check, UserPlus, X, Image as ImageIcon, Sparkles } from 'lucide-react';

export default function ClassPhotoCropper({ targetClass, onAddStudent, onClose }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [cropRect, setCropRect] = useState(null); // { x, y, width, height } in percent or pixels
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const [studentName, setStudentName] = useState('');
  const [studentNote, setStudentNote] = useState('');
  const [croppedPreviewUrl, setCroppedPreviewUrl] = useState(null);
  const [addedCount, setAddedCount] = useState(0);

  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

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

  // Mouse / Touch drawing box handlers on image container
  const handleMouseDown = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setStartPos({ x, y });
    setCropRect({ x, y, width: 10, height: 10 });
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const x = Math.min(startPos.x, currentX);
    const y = Math.min(startPos.y, currentY);
    const width = Math.abs(currentX - startPos.x);
    const height = Math.abs(currentY - startPos.y);

    setCropRect({ x, y, width, height });
  };

  const handleMouseUp = () => {
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
    const outputSize = 240;
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext('2d');

    // Fill white background before drawing
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

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCroppedPreviewUrl(dataUrl);
  };

  const handleSaveStudent = (e) => {
    e.preventDefault();
    if (!studentName.trim()) return;

    onAddStudent(targetClass.id, {
      name: studentName.trim(),
      photoUrl: croppedPreviewUrl || '',
      note: studentNote.trim()
    });

    setAddedCount(prev => prev + 1);
    setStudentName('');
    setStudentNote('');
    setCropRect(null);
    setCroppedPreviewUrl(null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '900px', width: '95vw', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Crop size={22} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>
              Ořezávání obličejů ze společné fotky • Třída {targetClass.name}
            </h3>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Step 1: Upload Image */}
        {!imageSrc ? (
          <div className="glass-panel" style={{ border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '3rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <ImageIcon size={48} style={{ color: 'var(--accent-primary)', opacity: 0.8 }} />
            <div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Nahrát společnou fotku třídy</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Vyberte fotografii třídy ze svého počítače</p>
            </div>
            <label className="primary-btn" style={{ cursor: 'pointer' }}>
              <Upload size={18} /> Vybrat fotku třídy
              <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.25rem', alignItems: 'start' }}>
            {/* Interactive Image Container */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>💡 Tahem myši po fotce nakreslete obdélník kolem obličeje žáka</span>
                <label style={{ cursor: 'pointer', color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.8rem' }}>
                  Změnit fotku
                  <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
              </div>

              <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                style={{
                  position: 'relative',
                  width: '100%',
                  background: '#000',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  cursor: 'crosshair',
                  userSelect: 'none'
                }}
              >
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Class photo"
                  style={{ width: '100%', display: 'block', pointerEvents: 'none' }}
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
                      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                      pointerEvents: 'none'
                    }}
                  />
                )}
              </div>
            </div>

            {/* Right Panel: Cropped Preview & Student Info Form */}
            <div className="glass-panel" style={{ borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h4 style={{ fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <UserPlus size={18} style={{ color: 'var(--accent-success)' }} />
                Přidat vyříznutého žáka
              </h4>

              {/* Cropped Face Preview */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                {croppedPreviewUrl ? (
                  <div className="avatar-wrapper" style={{ width: '96px', height: '96px', border: '3px solid var(--accent-success)' }}>
                    <img src={croppedPreviewUrl} alt="Ořez" className="avatar-img" />
                  </div>
                ) : (
                  <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: 'var(--bg-main)', border: '2px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center', padding: '0.5rem' }}>
                    Nakreslete výřez na fotce
                  </div>
                )}
              </div>

              <form onSubmit={handleSaveStudent} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                    Jméno žáka:
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Např. Petr Svoboda"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                    Poznámka (volitelná):
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Např. druhá řada vlevo"
                    value={studentNote}
                    onChange={(e) => setStudentNote(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={!studentName.trim()}
                  style={{ width: '100%', marginTop: '0.25rem' }}
                >
                  <Check size={18} /> Přidat žáka z fotky
                </button>
              </form>

              {addedCount > 0 && (
                <div style={{ background: 'var(--accent-success-bg)', color: 'var(--accent-success)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', textAlign: 'center', fontWeight: 600 }}>
                  🎉 Přidáno žáků z fotky: {addedCount}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
