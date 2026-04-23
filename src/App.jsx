import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Servers from './pages/Servers';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('keys');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return <div style={{background: '#000', minHeight: '100vh'}} />;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div style={{ background: 'linear-gradient(180deg, #000 0%, #1a1a1a 50%, #000 100%)', minHeight: '100vh' }}>
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        padding: '20px',
        borderBottom: '1px solid #333',
        marginBottom: '20px'
      }}>
        <button 
          onClick={() => setCurrentPage('keys')}
          style={{
            background: currentPage === 'keys' ? '#00ff88' : '#333',
            color: currentPage === 'keys' ? '#000' : '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Ключи доступа
        </button>
        <button 
          onClick={() => setCurrentPage('servers')}
          style={{
            background: currentPage === 'servers' ? '#00ff88' : '#333',
            color: currentPage === 'servers' ? '#000' : '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Серверы
        </button>
      </div>
      
      {currentPage === 'keys' && <Dashboard />}
      {currentPage === 'servers' && <Servers />}
    </div>
  );
}

export default App;
