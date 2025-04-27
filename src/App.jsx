import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { SendHorizontal, Settings } from 'lucide-react';
import botAvatar from './assets/catdp.png';
import Login from './Login'; // your login page

let socket; // declare globally so we can control connection

const App = () => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('bubble_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user) {
      socket = io('http://localhost:3001');

      socket.on('receive_message', (data) => {
        setMessages((prev) => {
          // Remove any existing "typing" messages first
          const filtered = prev.filter((msg) => !msg.typing);
          return [...filtered, data];
        });
      });

      socket.on('typing', (data) => {
        if (data.sender === 'bot') {
          setMessages((prev) => [...prev, { typing: true, sender: 'bot' }]);
        }
      });

      socket.on('stop_typing', (data) => {
        if (data.sender === 'bot') {
          setMessages((prev) => prev.filter((msg) => !msg.typing));
        }
      });
    }

    return () => {
      socket?.disconnect();
    };
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    socket.emit('send_message', {
      text: trimmed,
      timestamp: new Date().toISOString(),
      sender: user.username,
    });
    setMessage('');
  };

  const handleLogout = () => {
    localStorage.removeItem('bubble_user');
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <img className="w-12 h-12 rounded-full object-cover shadow-md" src={botAvatar} alt="Bot Avatar" />
          <h1 className="text-md font-bold text-gray-800">
            Sylvester Bigglesworth <span className="ml-1">🐾</span>
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="text-gray-500 hover:text-indigo-500 transition-transform hover:rotate-90 duration-300"
        >
          Logout
        </button>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg, idx) => {
          const isOwnMessage = msg.sender === user.username;
          const isBotMessage = msg.sender === 'bot';

          const formatName = (name) => {
            if (name === 'bot') return 'Sylvester';
            if (name.toLowerCase() === 'ishmam') return 'Ishmam';
            if (name.toLowerCase() === 'anastasia') return 'Anastasia';
            return name.charAt(0).toUpperCase() + name.slice(1);
          };

          if (msg.typing) {
            return (
              <div
                key={idx}
                className="flex items-start gap-2 justify-start animate-pulse"
              >
                <img
                  src={botAvatar}
                  alt="Bot Avatar"
                  className="w-8 h-8 rounded-full shadow-sm"
                />
                <div className="max-w-xs px-4 py-3 rounded-2xl shadow-md bg-white text-gray-800 border border-gray-200">
                  <div className="text-sm font-semibold truncate mb-1">
                    Sylvester
                  </div>
                  <div className="text-sm italic text-gray-400">
                    typing...
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={idx}
              className={`flex items-start gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'} animate-slide-up`}
            >
              {!isOwnMessage && (
                <img
                  src={isBotMessage ? botAvatar : 'https://via.placeholder.com/32'}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full shadow-sm"
                />
              )}

              <div
                className={`max-w-xs px-4 py-3 rounded-2xl shadow-md ${isOwnMessage
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white text-gray-800 border border-gray-200'
                  }`}
              >
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm font-semibold truncate">
                    {isOwnMessage ? 'You' : formatName(msg.sender)}
                  </span>
                  <span className="text-xs opacity-60">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="mt-1 text-sm break-words">{msg.text}</p>
              </div>

              {isOwnMessage && (
                <div className="w-8 h-8 rounded-full bg-indigo-400 shadow-sm" />
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <div className="flex items-center px-6 py-4 bg-white shadow-inner border-t">
        <input
          type="text"
          className="flex-1 px-5 py-2.5 rounded-full bg-gray-100 border border-gray-200 shadow-sm outline-none placeholder-gray-500 focus:ring-2 focus:ring-indigo-400 transition"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button
          className="ml-3 p-2.5 bg-indigo-500 text-white rounded-full hover:bg-indigo-400 transition-transform shadow-sm hover:scale-110"
          onClick={sendMessage}
        >
          <SendHorizontal size={20} />
        </button>
      </div>
    </div>
  );
};

export default App;
