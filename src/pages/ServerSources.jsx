import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, setDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import './Dashboard.css';

const ServerSources = () => {
  const [sources, setSources] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newSource, setNewSource] = useState({
    name: '',
    url: '',
    category: 'main'
  });

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    const snapshot = await getDocs(collection(db, 'server_sources'));
    const sourcesData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setSources(sourcesData);
  };

  const handleAddSource = async () => {
    if (!newSource.name || !newSource.url) {
      alert('Заполните все поля');
      return;
    }

    const sourceId = newSource.name.toLowerCase().replace(/\s+/g, '-');
    
    await setDoc(doc(db, 'server_sources', sourceId), {
      name: newSource.name,
      url: newSource.url,
      category: newSource.category,
      createdAt: Timestamp.now()
    });

    setShowModal(false);
    setNewSource({ name: '', url: '', category: 'main' });
    loadSources();
  };

  const handleDeleteSource = async (id) => {
    if (window.confirm('Удалить этот источник?')) {
      await deleteDoc(doc(db, 'server_sources', id));
      loadSources();
    }
  };

  const categories = {
    main: 'Основные',
    backup: 'Резервные',
    premium: 'Премиум',
    custom: 'Пользовательские'
  };

  const groupedSources = sources.reduce((acc, source) => {
    const cat = source.category || 'main';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(source);
    return acc;
  }, {});

  return (
    <div className="dashboard">
      <div className="controls">
        <button onClick={() => setShowModal(true)} className="add-btn">
          + Добавить источник
        </button>
        <div className="stats">
          <span>Всего источников: {sources.length}</span>
        </div>
      </div>

      {Object.entries(groupedSources).map(([category, items]) => (
        <div key={category} style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#fff', marginBottom: '15px' }}>
            {categories[category] || category}
          </h2>
          <div className="keys-table">
            <table>
              <thead>
                <tr>
                  <th>Название</th>
                  <th>URL</th>
                  <th>Создан</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {items.map(source => (
                  <tr key={source.id}>
                    <td>{source.name}</td>
                    <td className="key-cell" style={{ fontSize: '12px' }}>
                      {source.url}
                    </td>
                    <td>
                      {new Date(source.createdAt?.seconds * 1000).toLocaleDateString('ru-RU')}
                    </td>
                    <td>
                      <button 
                        onClick={() => handleDeleteSource(source.id)}
                        className="delete-btn"
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Добавить источник серверов</h2>
            <div className="form-group">
              <label>Название</label>
              <input
                type="text"
                value={newSource.name}
                onChange={e => setNewSource({...newSource, name: e.target.value})}
                placeholder="GitHub Russia"
              />
            </div>
            <div className="form-group">
              <label>URL</label>
              <input
                type="text"
                value={newSource.url}
                onChange={e => setNewSource({...newSource, url: e.target.value})}
                placeholder="https://raw.githubusercontent.com/..."
              />
            </div>
            <div className="form-group">
              <label>Категория</label>
              <select
                value={newSource.category}
                onChange={e => setNewSource({...newSource, category: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#0a0a0a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '16px'
                }}
              >
                <option value="main">Основные</option>
                <option value="backup">Резервные</option>
                <option value="premium">Премиум</option>
                <option value="custom">Пользовательские</option>
              </select>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowModal(false)} className="cancel-btn">
                Отмена
              </button>
              <button onClick={handleAddSource} className="save-btn">
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServerSources;
