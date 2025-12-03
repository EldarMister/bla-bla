import { useState } from 'react';

export default function Auth({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  
  // Данные для входа
  const [loginUser, setLoginUser] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Данные для регистрации
  const [regName, setRegName] = useState('');
  const [regUser, setRegUser] = useState('');
  const [regAvatar, setRegAvatar] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    setError('');
    const users = JSON.parse(localStorage.getItem('chat_users')) || [];
    const user = users.find(u => u.username.toLowerCase() === loginUser.toLowerCase().trim());
    if (!user) {
      setError('Пользователь не найден.');
      return;
    }

    // Пароль обязателен для входа у всех пользователей
    if (!loginPassword) {
      setError('Введите пароль.');
      return;
    }
    if (!user.password) {
      setError('У этого аккаунта не задан пароль — пожалуйста, зарегистрируйтесь заново.');
      return;
    }
    if (user.password !== loginPassword) {
      setError('Неверный пароль.');
      return;
    }

    sessionStorage.setItem('currentUser', JSON.stringify(user));
    onLogin(user);
  };

  const handleRegister = () => {
    setError('');
    if (!regName || !regUser) return setError('Заполните имя и логин');
    if (!regPassword) return setError('Установите пароль');
    if (regPassword.length < 4) return setError('Пароль должен быть не менее 4 символов');
    if (regPassword !== regConfirm) return setError('Пароли не совпадают');

    const users = JSON.parse(localStorage.getItem('chat_users')) || [];
    if (users.find(u => u.username.toLowerCase() === regUser.toLowerCase())) return setError('Такой логин уже занят');

    const newUser = {
      id: Date.now(),
      name: regName,
      username: regUser,
      avatar: regAvatar || `https://ui-avatars.com/api/?name=${regName}&background=random`,
      password: regPassword
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
        
        {error && <div style={{ color: 'var(--danger-color)', marginBottom: 8 }}>{error}</div>}

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
          <input
            className="auth-input"
            type="password"
            placeholder="Пароль"
            value={loginPassword}
            onChange={e => setLoginPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
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
              type="password"
              placeholder="Пароль"
              value={regPassword}
              onChange={e => setRegPassword(e.target.value)}
            />
            <input
              className="auth-input"
              type="password"
              placeholder="Повторите пароль"
              value={regConfirm}
              onChange={e => setRegConfirm(e.target.value)}
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