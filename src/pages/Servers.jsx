import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import './Dashboard.css';

function Servers() {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingServer, setEditingServer] = useState(null);
  const [serverConfig, setServerConfig] = useState('');
  const [serverName, setServerName] = useState('');
  const [serverCountry, setServerCountry] = useState('');

  useEffect(() => {
    loadServers();
  }, []);

  const loadServers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'servers'));
      const serversData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setServers(serversData);
    } catch (error) {
      console.error('Error loading servers:', error);
      alert('Ошибка загрузки серверов');
    } finally {
      setLoading(false);
    }
  };

  const handleAddServer = async () => {
    if (!serverConfig.trim() || !serverName.trim()) {
      alert('Заполните все поля');
      return;
    }

    try {
      // Проверяем что это валидный JSON
      const config = JSON.parse(serverConfig);
      
      const serverData = {
        name: serverName,
        country: serverCountry || 'Unknown',
        config: config,
        createdAt: new Date().toISOString(),
        enabled: true
      };

      if (editingServer) {
        await updateDoc(doc(db, 'servers', editingServer.id), serverData);
      } else {
        await addDoc(collection(db, 'servers'), serverData);
      }

      setShowAddModal(false);
      setServerConfig('');
      setServerName('');
      setServerCountry('');
      setEditingServer(null);
      loadServers();
    } catch (error) {
      console.error('Error saving server:', error);
      alert('Ошибка: ' + error.message);
    }
  };

  const handleDeleteServer = async (serverId) => {
    if (!confirm('Удалить этот сервер?')) return;

    try {
      await deleteDoc(doc(db, 'servers', serverId));
      loadServers();
    } catch (error) {
      console.error('Error deleting server:', error);
      alert('Ошибка удаления сервера');
    }
  };

  const handleEditServer = (server) => {
    setEditingServer(server);
    setServerName(server.name);
    setServerCountry(server.country);
    setServerConfig(JSON.stringify(server.config, null, 2));
    setShowAddModal(true);
  };

  const handleToggleServer = async (server) => {
    try {
      await updateDoc(doc(db, 'servers', server.id), {
        enabled: !server.enabled
      });
      loadServers();
    } catch (error) {
      console.error('Error toggling server:', error);
      alert('Ошибка изменения статуса');
    }
  };

  const extractServerInfo = (config) => {
    try {
      if (config.outbounds && config.outbounds.length > 0) {
        const proxy = config.outbounds.find(o => o.tag === 'proxy');
        if (proxy && proxy.settings && proxy.settings.vnext) {
          const server = proxy.settings.vnext[0];
          return {
            address: server.address,
            port: server.port,
            protocol: proxy.protocol
          };
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="dashboard">
      <div className="header">
        <h1>Управление серверами</h1>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          + Добавить сервер
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{servers.length}</div>
          <div className="stat-label">Всего серверов</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{servers.filter(s => s.enabled).length}</div>
          <div className="stat-label">Активных</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{servers.filter(s => !s.enabled).length}</div>
          <div className="stat-label">Отключенных</div>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Страна</th>
              <th>Адрес</th>
              <th>Протокол</th>
              <th>Статус</th>
              <th>Создан</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {servers.map(server => {
              const info = extractServerInfo(server.config);
              return (
                <tr key={server.id}>
                  <td>{server.name}</td>
                  <td>{server.country}</td>
                  <td>{info ? `${info.address}:${info.port}` : 'N/A'}</td>
                  <td>{info ? info.protocol.toUpperCase() : 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${server.enabled ? 'active' : 'inactive'}`}>
                      {server.enabled ? 'Активен' : 'Отключен'}
                    </span>
                  </td>
                  <td>{new Date(server.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-icon"
                        onClick={() => handleToggleServer(server)}
                        title={server.enabled ? 'Отключить' : 'Включить'}
                      >
                        {server.enabled ? '⏸️' : '▶️'}
                      </button>
                      <button 
                        className="btn-icon"
                        onClick={() => handleEditServer(server)}
                        title="Редактировать"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-icon btn-danger"
                        onClick={() => handleDeleteServer(server.id)}
                        title="Удалить"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {servers.length === 0 && (
          <div className="empty-state">
            <p>Нет серверов</p>
            <button className="btn-primary" onClick={() => setShowAddModal(true)}>
              Добавить первый сервер
            </button>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => {
          setShowAddModal(false);
          setEditingServer(null);
          setServerConfig('');
          setServerName('');
          setServerCountry('');
        }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editingServer ? 'Редактировать сервер' : 'Добавить сервер'}</h2>
            
            <div className="form-group">
              <label>Название сервера</label>
              <input
                type="text"
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                placeholder="Finland Server"
              />
            </div>

            <div className="form-group">
              <label>Страна</label>
              <input
                type="text"
                value={serverCountry}
                onChange={(e) => setServerCountry(e.target.value)}
                placeholder="🇫🇮 Finland"
              />
            </div>

            <div className="form-group">
              <label>JSON конфигурация</label>
              <textarea
                value={serverConfig}
                onChange={(e) => setServerConfig(e.target.value)}
                placeholder='{"dns": {...}, "inbounds": [...], "outbounds": [...]}'
                rows={15}
                style={{ fontFamily: 'monospace', fontSize: '12px' }}
              />
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => {
                setShowAddModal(false);
                setEditingServer(null);
                setServerConfig('');
                setServerName('');
                setServerCountry('');
              }}>
                Отмена
              </button>
              <button className="btn-primary" onClick={handleAddServer}>
                {editingServer ? 'Сохранить' : 'Добавить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Servers;
