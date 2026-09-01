import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, Laptop, QrCode, Copy, Check, ArrowRight, RefreshCw, X, Download, AlertCircle, Sparkles } from 'lucide-react';
import { generateSyncPayload, fetchSyncPayload, applySyncPayload } from '../services/syncService';

export default function SyncModal({
  activeProfileName = 'Honza',
  initialCode = null,
  onClose,
  onSyncApplied
}) {
  const [activeTab, setActiveTab] = useState(initialCode ? 'receive' : 'send'); // 'send' or 'receive'
  
  // Sending states
  const [isGenerating, setIsGenerating] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [sendError, setSendError] = useState(null);

  // Receiving states
  const [inputCode, setInputCode] = useState(initialCode || '');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchedData, setFetchedData] = useState(null);
  const [receiveError, setReceiveError] = useState(null);
  const [isApplied, setIsApplied] = useState(false);

  // Auto-fetch if initialCode provided
  useEffect(() => {
    if (initialCode) {
      handleFetchCode(initialCode);
    }
  }, [initialCode]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setSendError(null);
    try {
      const res = await generateSyncPayload();
      setSyncResult(res);
    } catch (e) {
      setSendError(e.message || 'Chyba při generování kódu.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = () => {
    if (!syncResult?.syncCode) return;
    navigator.clipboard.writeText(syncResult.syncCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyUrl = () => {
    if (!syncResult?.syncAppUrl) return;
    navigator.clipboard.writeText(syncResult.syncAppUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleFetchCode = async (codeToFetch = inputCode) => {
    if (!codeToFetch.trim()) return;
    setIsFetching(true);
    setReceiveError(null);
    setFetchedData(null);
    try {
      const res = await fetchSyncPayload(codeToFetch);
      setFetchedData(res.data);
    } catch (e) {
      setReceiveError(e.message || 'Nepodařilo se stáhnout data.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleApply = () => {
    if (!fetchedData) return;
    const success = applySyncPayload(fetchedData);
    if (success) {
      setIsApplied(true);
      if (onSyncApplied) {
        onSyncApplied();
      }
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '560px', width: '95vw', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, #3b82f6, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <Smartphone size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Přenos dat mezi PC a mobilem</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                Přeneste profil, fotky i třídy do telefonu během vteřiny
              </p>
            </div>
          </div>
          <button className="icon-button" onClick={onClose} title="Zavřít">
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="nav-tabs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '0.25rem' }}>
          <button
            type="button"
            className={`nav-btn ${activeTab === 'send' ? 'active' : ''}`}
            onClick={() => setActiveTab('send')}
            style={{ justifyContent: 'center', fontSize: '0.85rem' }}
          >
            <Laptop size={16} /> Odeslat z tohoto zařízení
          </button>
          <button
            type="button"
            className={`nav-btn ${activeTab === 'receive' ? 'active' : ''}`}
            onClick={() => setActiveTab('receive')}
            style={{ justifyContent: 'center', fontSize: '0.85rem' }}
          >
            <Smartphone size={16} /> Přijmout na tomto zařízení
          </button>
        </div>

        {/* Tab 1: Send / Generate QR & Code */}
        {activeTab === 'send' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {!syncResult ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <QrCode size={54} style={{ color: 'var(--accent-primary)', opacity: 0.8 }} />
                <div>
                  <h4 style={{ fontSize: '1.05rem', marginBottom: '0.3rem' }}>
                    Odeslat profil „{activeProfileName}“ do telefonu
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto' }}>
                    Kliknutím níže se vytvoří zabezpečený přenosový kód a QR kód. Tyto kódy umožní načíst všechny třídy, žáky a nahrané fotky do vašeho mobilu.
                  </p>
                </div>

                {sendError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-danger)', fontSize: '0.85rem', background: 'var(--accent-danger-bg)', padding: '0.5rem 0.8rem', borderRadius: 'var(--radius-sm)' }}>
                    <AlertCircle size={16} /> {sendError}
                  </div>
                )}

                <button
                  type="button"
                  className="primary-btn"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  style={{ padding: '0.7rem 1.5rem', fontSize: '0.92rem' }}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw size={16} className="spin" /> Generuji přenosový kód...
                    </>
                  ) : (
                    <>
                      <QrCode size={18} /> Vygenerovat QR a kód pro mobil
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', padding: '0.5rem 0' }}>
                {/* QR Code Container */}
                <div style={{ background: '#ffffff', padding: '1rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <QRCodeSVG
                    value={syncResult.syncAppUrl}
                    size={200}
                    level="M"
                    includeMargin={false}
                  />
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                    Naskenujte fotoaparátem mobilu
                  </span>
                </div>

                {/* 6-8 digit Code Box */}
                <div style={{ width: '100%', background: 'var(--bg-main)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>
                      Přenosový kód pro ruční zadání:
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '0.15em', color: 'var(--accent-primary)', fontFamily: 'monospace' }}>
                      {syncResult.syncCode}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={handleCopyCode}
                    style={{ padding: '0.5rem 0.85rem', fontSize: '0.82rem' }}
                  >
                    {copied ? <Check size={16} style={{ color: 'var(--accent-success)' }} /> : <Copy size={16} />}
                    <span>{copied ? 'Zkopírováno!' : 'Kopírovat kód'}</span>
                  </button>
                </div>

                {/* Info and steps */}
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', background: 'rgba(59, 130, 246, 0.08)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(59, 130, 246, 0.2)', width: '100%' }}>
                  <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.3rem' }}>
                    📱 Jak načíst data do mobilu:
                  </strong>
                  <ol style={{ paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <li>Otevřete fotoaparát v mobilu a namiřte jej na QR kód výše (odkaz otevře aplikaci s daty).</li>
                    <li>Nebo na mobilu v této aplikaci klikněte na <em>„Přijmout na tomto zařízení“</em> a zadejte kód <strong>{syncResult.syncCode}</strong>.</li>
                  </ol>
                </div>

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                >
                  <RefreshCw size={14} /> Aktualizovat data v cloudu
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Receive / Import via Code */}
        {activeTab === 'receive' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', padding: '0.5rem 0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Zadejte přenosový kód z počítače:
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Např. FL52HXSLK"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  style={{ fontSize: '1.1rem', letterSpacing: '0.1em', fontWeight: 700, textTransform: 'uppercase' }}
                  autoFocus
                />
                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => handleFetchCode(inputCode)}
                  disabled={!inputCode.trim() || isFetching}
                  style={{ padding: '0.5rem 1.2rem', flexShrink: 0 }}
                >
                  {isFetching ? <RefreshCw size={16} className="spin" /> : <Download size={16} />}
                  <span>Vyhledat</span>
                </button>
              </div>
            </div>

            {receiveError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-danger)', fontSize: '0.85rem', background: 'var(--accent-danger-bg)', padding: '0.6rem 0.9rem', borderRadius: 'var(--radius-sm)' }}>
                <AlertCircle size={16} /> {receiveError}
              </div>
            )}

            {/* Fetched Data Preview Box */}
            {fetchedData && (
              <div style={{ background: 'var(--bg-main)', border: '1px solid var(--accent-success)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', animation: 'fadeIn 0.2s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-success)', fontWeight: 700, fontSize: '0.95rem' }}>
                  <Sparkles size={18} /> Nalezena synchronizační data!
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <div>Profil: <strong style={{ color: 'var(--text-primary)' }}>{fetchedData.profile?.name || 'Honza'}</strong></div>
                  <div>Třídy: <strong style={{ color: 'var(--text-primary)' }}>{fetchedData.classes?.length || 0} tříd</strong></div>
                  <div>Celkem žáků: <strong style={{ color: 'var(--text-primary)' }}>{fetchedData.classes?.reduce((acc, c) => acc + c.students.length, 0) || 0}</strong></div>
                  <div>Vlastní fotky: <strong style={{ color: 'var(--accent-success)' }}>{Object.keys(fetchedData.customPhotos || {}).length} žáků</strong></div>
                </div>

                {!isApplied ? (
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={handleApply}
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '0.7rem 1rem', justifyContent: 'center', marginTop: '0.4rem' }}
                  >
                    <Check size={18} /> Načíst tato data do telefonu
                  </button>
                ) : (
                  <div style={{ background: 'var(--accent-success-bg)', color: 'var(--accent-success)', padding: '0.6rem', borderRadius: 'var(--radius-sm)', textAlign: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                    🎉 Data byla úspěšně načtena! Aplikace se aktualizuje...
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
