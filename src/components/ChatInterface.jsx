import { useState, useEffect, useRef } from 'react';

export default function ChatInterface({ currentUser, onLogout }) {
  // --- ДАННЫЕ ---
  const [channels, setChannels] = useState([]);
  const [activeChannelId, setActiveChannelId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  
  // --- UI ---
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(currentUser);

  // --- МОДАЛКИ ---
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [currentFont, setCurrentFont] = useState('system');
  const [isChannelSettingsOpen, setChannelSettingsOpen] = useState(false);
  const [participantSearch, setParticipantSearch] = useState('');

  // Состояние для красивого окна подтверждения
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, text: '', onConfirm: null });

  // --- ССЫЛКИ ---
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // --- ЭФФЕКТЫ ---
  useEffect(() => {
    loadData();
    loadFont();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChannelId]);

  // --- ЛОГИКА ---
  const loadData = () => {
    let loadedChannels = JSON.parse(localStorage.getItem('chat_channels')) || [];
    loadedChannels = loadedChannels.map(c => {
        if (!c.creatorId) return { ...c, creatorId: 1 };
        return c;
    });
    setChannels(loadedChannels);
    setMessages(JSON.parse(localStorage.getItem('chat_messages')) || []);
    setAllUsers(JSON.parse(localStorage.getItem('chat_users')) || []);
  };

  const toggleTheme = () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
  };

  const loadFont = () => applyFont(localStorage.getItem('app_font') || 'system');
  const applyFont = (fontName) => {
    let fontValue = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
    if(fontName === 'serif') fontValue = '"Georgia", serif';
    if(fontName === 'mono') fontValue = '"Consolas", monospace';
    if(fontName === 'comic') fontValue = '"Comic Sans MS", sans-serif';
    document.documentElement.style.setProperty('--font-main', fontValue);
    localStorage.setItem('app_font', fontName);
    setCurrentFont(fontName);
  };

  // Функция вызова подтверждения
  const triggerConfirm = (text, action) => {
    setConfirmModal({ isOpen: true, text, onConfirm: action });
  };

  // Выполнение действия после нажатия "Да"
  const handleConfirmAction = () => {
    if (confirmModal.onConfirm) confirmModal.onConfirm();
    setConfirmModal({ isOpen: false, text: '', onConfirm: null });
  };

  const saveProfile = () => {
    if (!editName.trim()) return;
    const users = [...allUsers];
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
        users[idx] = { ...users[idx], name: editName, avatar: editAvatar || `https://ui-avatars.com/api/?name=${editName}&background=random` };
        localStorage.setItem('chat_users', JSON.stringify(users));
        sessionStorage.setItem('currentUser', JSON.stringify(users[idx]));
        setUser(users[idx]);
        setAllUsers(users);
        setProfileOpen(false);
    }
  };

  const createChannel = () => {
    if (!newChannelName.trim()) return;
    const newChan = { id: 'chan_' + Date.now(), name: newChannelName, creatorId: user.id, participants: [user.id] };
    const newChans = [...channels, newChan];
    setChannels(newChans);
    localStorage.setItem('chat_channels', JSON.stringify(newChans));
    setActiveChannelId(newChan.id);
    setCreateModalOpen(false);
    setNewChannelName('');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputText.trim() && activeChannelId) {
        saveMessage(inputText, null);
        setInputText('');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.size < 500000) {
        const reader = new FileReader();
        reader.onload = (ev) => saveMessage('', ev.target.result);
        reader.readAsDataURL(file);
    } else if (file) alert('Файл слишком большой (>0.5MB)');
    e.target.value = null;
  };

  const saveMessage = (text, image) => {
    const newMsg = {
        id: Date.now(), channelId: activeChannelId, senderId: user.id, senderName: user.name,
        text, image, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
    };
    const newMsgs = [...messages, newMsg];
    setMessages(newMsgs);
    localStorage.setItem('chat_messages', JSON.stringify(newMsgs));
  };

  const myChats = channels.filter(c => c.participants.includes(user.id) && c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const globalChats = searchTerm ? channels.filter(c => !c.participants.includes(user.id) && c.name.toLowerCase().includes(searchTerm.toLowerCase())) : [];
  const activeChannel = channels.find(c => c.id === activeChannelId);
  const currentMessages = messages.filter(m => m.channelId === activeChannelId);
  const channelParticipants = activeChannel ? allUsers.filter(u => activeChannel.participants.includes(u.id) && u.name.toLowerCase().includes(participantSearch.toLowerCase())) : [];

  return (
    <div className="app-wrapper">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="user-mini-profile" onClick={() => {setEditName(user.name); setEditAvatar(user.avatar); setProfileOpen(true);}}>
            <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} className="avatar-circle" />
            <div className="user-details"><h3>{user.name}</h3><span className="status-badge">Online</span></div>
          </div>
          <div className="header-actions">
            <button onClick={() => setSettingsOpen(true)}><i className="fa-solid fa-gear"></i></button>
            <button onClick={toggleTheme}><i className="fa-solid fa-moon"></i></button>
            <button onClick={onLogout}><i className="fa-solid fa-right-from-bracket"></i></button>
          </div>
        </div>
        <div className="search-container">
            <div className="search-input-wrapper"><i className="fa-solid fa-magnifying-glass"></i><input placeholder="Поиск..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/></div>
        </div>
        <div className="channels-section">
          <div className="section-title"><span>Сообщения</span><button onClick={() => setCreateModalOpen(true)}><i className="fa-solid fa-pen-to-square"></i></button></div>
          <ul id="channels-list">
            {myChats.map(c => <li key={c.id} className={c.id === activeChannelId ? 'active' : ''} onClick={() => setActiveChannelId(c.id)}><div className="channel-icon"><i className="fa-solid fa-hashtag"></i></div>{c.name}</li>)}
            {globalChats.map(c => <li key={c.id} onClick={() => {
                const newChans = channels.map(ch => ch.id === c.id ? {...ch, participants: [...ch.participants, user.id]} : ch);
                setChannels(newChans); localStorage.setItem('chat_channels', JSON.stringify(newChans)); setActiveChannelId(c.id);
            }}><div className="channel-icon" style={{background:'#e1f5fe', color:'#0095f6'}}><i className="fa-solid fa-plus"></i></div>{c.name}</li>)}
          </ul>
        </div>
      </aside>

      <main className="chat-area">
        <header className="chat-header">
            <div className="chat-header-info"><h2>{activeChannel ? activeChannel.name : 'Чат не выбран'}</h2>{activeChannel && <span className="header-status-row">{activeChannel.participants.length} уч.</span>}</div>
            {activeChannel && <button className="settings-btn" onClick={() => setChannelSettingsOpen(true)}>Настройки</button>}
        </header>

        <div className="messages-container">
          {!activeChannelId ? (
             <div className="empty-state"><div className="icon-bubble"><i className="fa-regular fa-paper-plane"></i></div><h3>Ваши сообщения</h3><p>Выберите чат или создайте новый</p></div>
          ) : currentMessages.length === 0 ? (
             <div className="empty-state"><div className="icon-bubble"><i className="fa-regular fa-paper-plane"></i></div><h3>Ваши сообщения</h3><p>Напишите первое сообщение!</p></div>
          ) : (
             currentMessages.map(msg => (
                <div key={msg.id} className={`message ${msg.senderId === user.id ? 'my' : 'other'}`}>
                    {!msg.senderId !== user.id && <div className="msg-header"><span className="msg-sender">{msg.senderName}</span></div>}
                    {msg.image && <img src={msg.image} style={{maxWidth:'200px', borderRadius:'8px', display:'block', marginBottom:'5px'}} />}
                    {msg.text}
                    <span className="msg-time">{msg.time}</span>
                </div>
             ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="input-area" onSubmit={handleSendMessage}>
            <button type="button" onClick={() => fileInputRef.current.click()} disabled={!activeChannelId} style={{background:'transparent', color:'var(--text-secondary)', marginRight:'5px'}}><i className="fa-solid fa-paperclip"></i></button>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileSelect} style={{display:'none'}} />
            <input placeholder="Написать сообщение..." disabled={!activeChannelId} value={inputText} onChange={e => setInputText(e.target.value)} />
            <button type="submit" disabled={!activeChannelId || !inputText.trim()}><i className="fa-solid fa-arrow-up"></i></button>
        </form>
      </main>

      {/* --- МОДАЛКИ --- */}
      {isCreateModalOpen && (
        <div className="modal">
          <div className="modal-card">
            <div className="modal-top"><h2>Новый чат</h2><button className="close-btn" onClick={() => setCreateModalOpen(false)}><i className="fa-solid fa-xmark"></i></button></div>
            <label className="input-label">Название канала</label><input type="text" value={newChannelName} onChange={(e) => setNewChannelName(e.target.value)} autoFocus />
            <button className="btn-primary" onClick={createChannel}>Создать</button>
          </div>
        </div>
      )}

      {isProfileOpen && (
        <div className="modal">
          <div className="modal-card">
            <div className="modal-top"><h2>Профиль</h2><button className="close-btn" onClick={() => setProfileOpen(false)}><i className="fa-solid fa-xmark"></i></button></div>
            <label className="input-label">Имя</label><input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} />
            <label className="input-label">Аватар (ссылка)</label><input type="text" value={editAvatar} onChange={(e) => setEditAvatar(e.target.value)} placeholder="https://..." />
            <button className="btn-primary" onClick={saveProfile}>Сохранить</button>
          </div>
        </div>
      )}

      {isSettingsOpen && (
        <div className="modal">
          <div className="modal-card">
            <div className="modal-top"><h2>Настройки</h2><button className="close-btn" onClick={() => setSettingsOpen(false)}><i className="fa-solid fa-xmark"></i></button></div>
            <label className="input-label">Шрифт</label><select className="styled-select" value={currentFont} onChange={(e) => applyFont(e.target.value)}><option value="system">Стандарт</option><option value="serif">Serif</option><option value="mono">Mono</option></select>
          </div>
        </div>
      )}

      {isChannelSettingsOpen && activeChannel && (
        <div className="modal">
          <div className="modal-card settings-card">
            <div className="modal-top">
                <h2 style={{fontSize:'16px'}}>Настройки: {activeChannel.name}</h2>
                <button className="close-btn" onClick={() => setChannelSettingsOpen(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            
            <div className="settings-content">
                {/* поиск участников */}
                <div className="search-input-wrapper small-search">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input type="text" placeholder="Найти участника..." value={participantSearch} onChange={(e) => setParticipantSearch(e.target.value)} />
                </div>
                
                <h3 className="list-title">Участники</h3>
                <ul className="user-list">
                    {channelParticipants.map(p => {
                        const isOwner = p.id === activeChannel.creatorId;
                        const canKick = (activeChannel.creatorId === user.id || activeChannel.creatorId === 1) && p.id !== user.id;
                        return (
                            <li key={p.id}>
                                <div style={{display:'flex', alignItems:'center'}}>
                                    <img src={p.avatar || `https://ui-avatars.com/api/?name=${p.name}`} className="avatar-small"/>
                                    <span>{p.name} {isOwner && <i className="fa-solid fa-crown" style={{color:'gold', marginLeft:'5px'}}></i>}</span>
                                </div>
                                {/* Используем новое красивое окно вместо confirm() */}
                                {canKick && <button className="kick-btn" onClick={() => {
                                    triggerConfirm(`Исключить ${p.name}?`, () => {
                                        const newChans = channels.map(c => c.id === activeChannelId ? {...c, participants: c.participants.filter(id => id !== p.id)} : c);
                                        setChannels(newChans); localStorage.setItem('chat_channels', JSON.stringify(newChans));
                                    });
                                }}>Исключить</button>}
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div className="modal-footer">
                {activeChannel.creatorId === user.id || activeChannel.creatorId === 1 ? 
                    <button className="danger-action-btn" onClick={() => {
                        triggerConfirm('Удалить этот чат навсегда?', () => {
                            const newChans = channels.filter(c => c.id !== activeChannelId);
                            setChannels(newChans); localStorage.setItem('chat_channels', JSON.stringify(newChans)); setActiveChannelId(null); setChannelSettingsOpen(false);
                        });
                    }}>Удалить чат</button> 
                    : 
                    <button className="danger-action-btn" onClick={() => {
                        triggerConfirm('Покинуть этот чат?', () => {
                            const newChans = channels.map(c => c.id === activeChannelId ? {...c, participants: c.participants.filter(id => id !== user.id)} : c);
                            setChannels(newChans); localStorage.setItem('chat_channels', JSON.stringify(newChans)); setActiveChannelId(null); setChannelSettingsOpen(false);
                        });
                    }}>Покинуть чат</button>
                }
            </div>
          </div>
        </div>
      )}

      {/* --- КРАСИВОЕ ОКНО ПОДТВЕРЖДЕНИЯ */}
      {confirmModal.isOpen && (
        <div className="modal">
          <div className="modal-card" style={{width:'300px', textAlign:'center'}}>
             <h3 style={{marginBottom:'15px', fontSize:'18px'}}>{confirmModal.text}</h3>
             <div className="confirm-actions">
                <button className="btn-secondary" onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}>Отмена</button>
                <button className="btn-primary" onClick={handleConfirmAction}>Да</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
