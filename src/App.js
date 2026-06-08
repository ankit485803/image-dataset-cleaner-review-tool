import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Gallery from './components/Gallery';

function App() {
  const [images, setImages] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  const stats = {
    total: images.length,
    keep: images.filter(img => img.status === 'keep').length,
    reject: images.filter(img => img.status === 'reject').length,
    review: images.filter(img => img.status === 'needs_review').length,
  };

  return (
    <div className="app">
      <Header />
      <div className="main-layout">
        <Sidebar stats={stats} activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="content">
          <Gallery images={images} activeTab={activeTab} setImages={setImages} />
        </div>
      </div>
    </div>
  );
}

export default App;