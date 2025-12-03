import { useState, useEffect } from 'react';
import Auth from './components/Auth';
import ChatInterface from './components/ChatInterface';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  // Дефолтные пользователи
  const defaultUsers = [
    { id: 1, name: 'Bret', username: 'bret', avatar: 'https://ui-avatars.com/api/?name=Bret' },
    { id: 2, name: 'Antonette', username: 'antonette', avatar: 'https://ui-avatars.com/api/?name=Antonette' }
  ];

  // Дефолтные каналы
  const initialChannels = [
    { id: 'chan_1', name: 'Общий чат', creatorId: 1, participants: [1, 2] }
  ];

  // Инициализация при первом запуске
  useEffect(() => {
    if (!localStorage.getItem('chat_users')) {
      localStorage.setItem('chat_users', JSON.stringify(defaultUsers));
    }
    if (!localStorage.getItem('chat_channels')) {
      localStorage.setItem('chat_channels', JSON.stringify(initialChannels));
    }

    // Проверка авторизации
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Загрузка темы
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') document.body.classList.add('dark-mode');
  }, []);

  // Функция выхода
  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    setUser(null);
  };

  return (
    <div className="app-container">
      {!user ? (
        <Auth onLogin={(u) => setUser(u)} />
      ) : (
        <ChatInterface currentUser={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
