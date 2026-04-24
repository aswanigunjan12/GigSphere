import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getData, setData } from '../utils/storage';
import './ChatPage.css';

export default function ChatPage() {
  const { applicationId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [app, setApp] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const apps = getData('applications') || [];
    const found = apps.find(a => a.id === applicationId);
    if (!found || found.status !== 'accepted') {
      navigate('/dashboard');
      return;
    }
    setApp(found);
    const users = getData('users') || [];
    const otherId = user.role === 'student' ? found.businessId : found.studentId;
    setOtherUser(users.find(u => u.id === otherId));
    setMessages((getData('messages') || []).filter(m => m.applicationId === applicationId));
  }, [applicationId, user, navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const allMsgs = getData('messages') || [];
    const newMsg = {
      id: 'm' + Date.now(), applicationId, senderId: user.id,
      text: input.trim(), timestamp: new Date().toISOString()
    };
    allMsgs.push(newMsg);
    setData('messages', allMsgs);
    setMessages([...messages, newMsg]);
    setInput('');
  };

  const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (!app) return null;

  return (
    <div className="chat-page">
      <div className="container">
        <div className="chat-container animate-fade-in">
          <div className="chat-header">
            <button onClick={() => navigate('/dashboard')} className="back-btn">←</button>
            <div className="chat-header-info">
              <span className="chat-header-avatar">{otherUser?.avatar || '👤'}</span>
              <div>
                <h3>{otherUser?.name || 'User'}</h3>
                <span className="chat-header-status">Online</span>
              </div>
            </div>
          </div>

          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="chat-empty"><p>No messages yet. Say hello! 👋</p></div>
            )}
            {messages.map(msg => (
              <div key={msg.id} className={`chat-bubble ${msg.senderId === user.id ? 'mine' : 'theirs'}`}>
                <p className="chat-bubble-text">{msg.text}</p>
                <span className="chat-bubble-time">{formatTime(msg.timestamp)}</span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={sendMessage} className="chat-input-bar">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." className="chat-input" />
            <button type="submit" className="btn btn-primary chat-send-btn">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}
