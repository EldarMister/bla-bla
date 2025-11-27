import { useState } from 'react';

export default function Auth({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  
  // Данные для входа
  const [loginUser, setLoginUser] = useState('');
  
  // Данные для регистрации
  const [regName, setRegName] = useState('');
  const [regUser, setRegUser] = useState('');
  const [regAvatar, setRegAvatar] = useState('');

  const handleLogin = () => {
    const users = JSON.parse(localStorage.getItem('chat_users')) || [];
    const user = users.find(u => u.username.toLowerCase() === loginUser.toLowerCase().trim());
    if (user) {
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      onLogin(user);
    } else {
      alert('Пользователь не найден (попробуйте Bret, Antonette или создайте нового).');
    }
  };

  const handleRegister = () => {
    if (!regName || !regUser) return alert('Заполните имя и логин');
    const users = JSON.parse(localStorage.getItem('chat_users')) || [];
    if (users.find(u => u.username.toLowerCase() === regUser.toLowerCase())) return alert('Такой логин уже занят');

    const newUser = {
      id: Date.now(),
      name: regName,
      username: regUser,
      avatar: regAvatar || `https://ui-avatars.com/api/?name=${regName}&background=random`
    };

    users.push(newUser);
    localStorage.setItem('chat_users', JSON.stringify(users));
    sessionStorage.setItem('currentUser', JSON.stringify(newUser));
    onLogin(newUser);
  };

  return (
    <div className="modal" style={{ display: 'flex', backdropFilter: 'blur(10px)' }}>
      <div className="auth-card">
        <h1 className="auth-logo">Chat App</h1>
        
        {!isRegister ? (
          // ФОРМА ВХОДА
          <div className="auth-form">
            <input 
                className="auth-input"
                type="text" 
                placeholder="Имя пользователя (Login)" 
                value={loginUser} 
                onChange={e => setLoginUser(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                autoFocus
            />
            <button className="auth-btn" onClick={handleLogin}>Войти</button>
            
            <p className="auth-switch-text">
              Нет аккаунта? 
              <span className="auth-link" onClick={() => setIsRegister(true)}>Создать</span>
            </p>
          </div>
        ) : (
          // ФОРМА РЕГИСТРАЦИИ
          <div className="auth-form">
            <input 
                className="auth-input"
                type="text" 
                placeholder="Ваше имя (как в паспорте)" 
                value={regName} 
                onChange={e => setRegName(e.target.value)} 
            />
            <input 
                className="auth-input"
                type="text" 
                placeholder="Придумайте логин (англ)" 
                value={regUser} 
                onChange={e => setRegUser(e.target.value)} 
            />
            <input 
                className="auth-input"
                type="text" 
                placeholder="Ссылка на фото (необязательно)" 
                value={regAvatar} 
                onChange={e => setRegAvatar(e.target.value)} 
            />
            <button className="auth-btn" onClick={handleRegister}>Создать аккаунт</button>
            
            <p className="auth-switch-text">
              Есть аккаунт? 
              <span className="auth-link" onClick={() => setIsRegister(false)}>Войти</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}