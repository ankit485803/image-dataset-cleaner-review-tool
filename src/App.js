
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

  // ── Stats for sidebar ──
  const stats = {
    total:  images.length,
    keep:   images.filter(img => img.status === 'keep').length,
    reject: images.filter(img => img.status === 'reject').length,
    review: images.filter(img => img.status === 'needs_review').length,
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
            onImport={handleImport}
            existingCount={images.length}
          />
          <Gallery
            images={images}
            activeTab={activeTab}
            setImages={setImages}
          />
        </div>
      </div>
    </div>
  );
}

export default App;