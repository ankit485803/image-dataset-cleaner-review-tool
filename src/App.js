import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Gallery from './components/Gallery';
import ImportPanel from './components/ImportPanel';

function App() {
  const [images, setImages]       = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  // ── Add new images (cap at 100) ──
  const handleImport = (newImages) => {
    setImages(prev => {
      const combined = [...prev, ...newImages];
      return combined.slice(0, 100);
    });
  };

  // ── Update a single image (status, notes, tags) ──
  const handleUpdate = (id, changes) => {
    setImages(prev =>
      prev.map(img => img.id === id ? { ...img, ...changes } : img)
    );
  };

  // ── Auto-flag duplicates + similar after every import ──
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

  // ── Import + auto-flag ──
  const handleImportWithFlags = (newImages) => {
    setImages(prev => {
      const combined = [...prev, ...newImages].slice(0, 100);
      return flagDuplicatesAndSimilar(combined);
    });
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
      <Header />
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
          />
        </div>
      </div>
    </div>
  );
}

export default App;