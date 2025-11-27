import { useState, useEffect } from 'react';
import Auth from './components/Auth';
import ChatInterface from './components/ChatInterface';
import { usersData, initialChannels } from './initialData';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  // Инициализация при первом запуске (как твой initStorage)
  useEffect(() => {
    if (!localStorage.getItem('chat_users')) {
      localStorage.setItem('chat_users', JSON.stringify(usersData));
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