import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase/config';
import { collection, getDocs, setDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import './Dashboard.css';

const Dashboard = () => {
  const [keys, setKeys] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newKey, setNewKey] = useState({
    key: '',
    name: '',
    durationDays: 30
  });

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    const snapshot = await getDocs(collection(db, 'access_keys'));
    const keysData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setKeys(keysData);
  };

  const generateRandomKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = '';
    for (let i = 0; i < 16; i++) {
      if (i > 0 && i % 4 === 0) key += '-';
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  };

  const handleAddKey = async () => {
    if (!newKey.key || !newKey.name) {
      alert('Заполните все поля');
      return;
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(newKey.durationDays));

    // Используем setDoc с ключом как ID документа
    await setDoc(doc(db, 'access_keys', newKey.key), {
      name: newKey.name,
      createdAt: Timestamp.now(),
      expiryDate: Timestamp.fromDate(expiryDate),
      durationDays: parseInt(newKey.durationDays)
    });

    setShowModal(false);
    setNewKey({ key: '', name: '', durationDays: 30 });
    loadKeys();
  };

  const handleDeleteKey = async (id) => {
    if (window.confirm('Удалить этот ключ?')) {
      await deleteDoc(doc(db, 'access_keys', id));
      loadKeys();
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div className="dashboard">
      <div className="header">
        <h1>DollVPN Admin Panel</h1>
        <button onClick={handleLogout} className="logout-btn">Выход</button>
      </div>

      <div className="controls">
        <button onClick={() => setShowModal(true)} className="add-btn">
          + Добавить ключ
        </button>
        <div className="stats">
          <span>Всего ключей: {keys.length}</span>
        </div>
      </div>

      <div className="keys-table">
        <table>
          <thead>
            <tr>
              <th>Ключ</th>
              <th>Название</th>
              <th>Создан</th>
              <th>Срок действия</th>
              <th>Истекает</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {keys.map(key => (
              <tr key={key.id}>
                <td className="key-cell">{key.id}</td>
                <td>{key.name}</td>
                <td>{new Date(key.createdAt?.seconds * 1000).toLocaleDateString('ru-RU')}</td>
                <td>{key.durationDays} дней</td>
                <td>{new Date(key.expiryDate?.seconds * 1000).toLocaleDateString('ru-RU')}</td>
                <td>
                  <button 
                    onClick={() => handleDeleteKey(key.id)}
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

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Добавить новый ключ</h2>
            <div className="form-group">
              <label>Ключ доступа</label>
              <div className="key-input-group">
                <input
                  type="text"
                  value={newKey.key}
                  onChange={e => setNewKey({...newKey, key: e.target.value})}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                />
                <button 
                  onClick={() => setNewKey({...newKey, key: generateRandomKey()})}
                  className="generate-btn"
                >
                  Генерировать
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Название</label>
              <input
                type="text"
                value={newKey.name}
                onChange={e => setNewKey({...newKey, name: e.target.value})}
                placeholder="Premium User"
              />
            </div>
            <div className="form-group">
              <label>Срок действия (дней)</label>
              <input
                type="number"
                value={newKey.durationDays}
                onChange={e => setNewKey({...newKey, durationDays: e.target.value})}
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowModal(false)} className="cancel-btn">
                Отмена
              </button>
              <button onClick={handleAddKey} className="save-btn">
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
