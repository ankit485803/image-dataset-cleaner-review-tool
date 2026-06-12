import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Gallery from './components/Gallery';
import ImportPanel from './components/ImportPanel';
import { saveSession, loadSession, clearSession, hasSession } from './utils/dbUtils';

function App() {
  const [images, setImages]       = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  // ── Session state ──
  const [hasSavedSession, setHasSavedSession] = useState(false);
  const [lastSaved, setLastSaved]             = useState(null);
  const [isSaving, setIsSaving]               = useState(false);

  // ── Activity log ──
  const [logs, setLogs] = useState([]);

  const addLog = (action, details) => {
    setLogs(prev => [
      ...prev,
      { timestamp: new Date().toISOString(), action, details },
    ]);
  };

  // ── On mount: check if a saved session exists ──
  useEffect(() => {
    hasSession().then(setHasSavedSession);
  }, []);

  // ── Add new images (cap at 100) ──
  const handleImportWithFlags = (newImages) => {
    setImages(prev => {
      const combined = [...prev, ...newImages].slice(0, 100);
      return flagDuplicatesAndSimilar(combined);
    });
    addLog('import', `Imported ${newImages.length} image(s)`);
  };

  // ── Update a single image (status, notes, tags) ──
  const handleUpdate = (id, changes) => {
    setImages(prev =>
      prev.map(img => img.id === id ? { ...img, ...changes } : img)
    );
    const changeDesc = Object.entries(changes).map(([k, v]) => `${k}=${v}`).join(', ');
    addLog('edit', `Image ${id} updated → ${changeDesc}`);
  };

  // ── Auto-flag duplicates + similar ──
  const flagDuplicatesAndSimilar = (imgs) => {
    const similarity = (a, b) => {
      if (a === b) return 1;
      if (!a.length || !b.length) return 0;
      const longer  = a.length > b.length ? a : b;
      const shorter = a.length > b.length ? b : a;
      let matches   = 0;
      for (let i = 0; i < shorter.length; i++) {
        if (longer.includes(shorter[i])) matches++;
      }
      return matches / longer.length;
    };

    return imgs.map((img, _, arr) => {
      const name     = img.name.toLowerCase().trim();
      const baseName = name.replace(/\.[^/.]+$/, '');

      const isDuplicate = arr.some(other =>
        other.id !== img.id &&
        other.name.toLowerCase().trim() === name
      );

      const isSimilar = !isDuplicate && arr.some(other => {
        if (other.id === img.id) return false;
        const otherBase = other.name.toLowerCase().trim().replace(/\.[^/.]+$/, '');
        return (
          otherBase.includes(baseName) ||
          baseName.includes(otherBase) ||
          similarity(baseName, otherBase) >= 0.7
        );
      });

      return { ...img, isDuplicate, isSimilar };
    });
  };

  // ── Save session ──
  const handleSaveSession = async () => {
    if (images.length === 0) {
      alert('Nothing to save — import some images first.');
      return;
    }
    setIsSaving(true);
    try {
      await saveSession(images);
      const now = new Date().toISOString();
      setLastSaved(now);
      setHasSavedSession(true);
      addLog('save', `Session saved with ${images.length} image(s)`);
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save session. Check console for details.');
    }
    setIsSaving(false);
  };

  // ── Load session ──
  const handleLoadSession = async () => {
    try {
      const session = await loadSession();
      if (!session) {
        alert('No saved session found.');
        return;
      }
      setImages(session.images);
      setLastSaved(session.savedAt);
      addLog('load', `Session loaded with ${session.images.length} image(s)`);
    } catch (err) {
      console.error('Load failed:', err);
      alert('Failed to load session. Check console for details.');
    }
  };

  // ── New session (clear everything) ──
  const handleNewSession = async () => {
    if (images.length > 0) {
      const confirmClear = window.confirm(
        'Start a new session? Unsaved changes will be lost (saved sessions stay in storage unless cleared).'
      );
      if (!confirmClear) return;
    }
    setImages([]);
    setActiveTab('all');
    addLog('new_session', 'Started a new session');
  };

  // ── Stats for sidebar ──
  const stats = {
    total:      images.length,
    keep:       images.filter(img => img.status === 'keep').length,
    reject:     images.filter(img => img.status === 'reject').length,
    review:     images.filter(img => img.status === 'needs_review').length,
    duplicates: images.filter(img => img.isDuplicate).length,
    similar:    images.filter(img => img.isSimilar).length,
  };

  return (
    <div className="app">
      <Header
        onSaveSession={handleSaveSession}
        onLoadSession={handleLoadSession}
        onNewSession={handleNewSession}
        hasSavedSession={hasSavedSession}
        lastSaved={lastSaved}
        isSaving={isSaving}
      />
      <div className="main-layout">
        <Sidebar
          stats={stats}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <div className="content">
          <ImportPanel
            onImport={handleImportWithFlags}
            existingCount={images.length}
          />
          <Gallery
            images={images}
            activeTab={activeTab}
            setImages={setImages}
            onUpdate={handleUpdate}
            logs={logs}
          />
        </div>
      </div>
    </div>
  );
}

export default App;