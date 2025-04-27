import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { SendHorizontal, Settings } from 'lucide-react';
import botAvatar from './assets/catdp.png';

const socket = io('http://localhost:3001');

const App = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });
    return () => socket.off('receive_message');
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    socket.emit('send_message', { text: trimmed, timestamp: new Date().toISOString(), sender: 'user' });
    setMessage('');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <img className="w-12 h-12 rounded-full object-cover shadow-md" src={botAvatar} alt="Bot Avatar" />
          <h1 className="text-lg font-bold text-gray-800">
            Sylvester Bigglesworth <span className="ml-1">🐾</span>
          </h1>
        </div>
        <button className="text-gray-500 hover:text-indigo-500 transition-transform hover:rotate-90 duration-300">
          <Settings size={20} />
        </button>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2 ${msg.sender === 'bot' ? 'justify-start' : 'justify-end'} animate-slide-up`}
          >
            {msg.sender === 'bot' && (
              <img src={botAvatar} alt="Bot Avatar" className="w-8 h-8 rounded-full shadow-sm" />
            )}
            <div
              className={`max-w-xs px-4 py-3 rounded-2xl shadow-md ${
                msg.sender === 'bot'
                  ? 'bg-white text-gray-800 border border-gray-200'
                  : 'bg-indigo-500 text-white'
              }`}
            >
              <div className="flex justify-between items-center gap-2">
                <span className="text-sm font-semibold truncate">
                  {msg.sender === 'bot' ? 'Sylvester' : 'You'}
                </span>
                <span className="text-xs opacity-60">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="mt-1 text-sm break-words">{msg.text}</p>
            </div>
            {msg.sender !== 'bot' && (
              <div className="w-8 h-8 rounded-full bg-indigo-400 shadow-sm" />
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <div className="flex items-center px-6 py-4 bg-white shadow-inner">
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
