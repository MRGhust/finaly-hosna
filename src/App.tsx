import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Send } from 'lucide-react';
import { digitsEnToFa } from 'persian-tools';
import axios from 'axios';

interface Message {
  text: string;
  sender: 'user' | 'ai';
}

// تنظیم پروکسی برای درخواست‌های axios
const API_BASE_URL = 'https://generativelanguage.googleapis.com';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'hosna') {
      setIsAuthenticated(true);
      setMessages([
        {
          text: 'سلام! من یک دستیار هوش مصنوعی هستم که برای کمک به حسنا ساخته شده‌ام. چطور می‌تونم کمکتون کنم؟',
          sender: 'ai'
        }
      ]);
    } else {
      alert('رمز عبور اشتباه است!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{
              text: `You are an AI assistant created to help Hosna. Always respond in Persian (Farsi) language with a helpful and supportive tone. Remember that you are not Hosna - you are an AI assistant created to help her. Here is the user's message: ${userMessage}`
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          proxy: {
            host: '78.157.42.100',
            port: 443,
            protocol: 'https'
          }
        }
      );

      const aiResponse = response.data.candidates[0].content.parts[0].text;
      setMessages(prev => [...prev, { text: aiResponse, sender: 'ai' }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        text: 'متأسفانه در پردازش پیام شما مشکلی پیش آمد. لطفاً دوباره تلاش کنید.',
        sender: 'ai'
      }]);
    }

    setIsLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-6">ورود به چت با دستیار هوش مصنوعی</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">رمز عبور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="رمز عبور را وارد کنید"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              ورود
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4">
      <div className="chat-container flex-1 rounded-lg shadow-xl p-4 mb-4 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message-bubble ${
                message.sender === 'user' ? 'user-message' : 'ai-message'
              } flex items-start gap-2`}
            >
              {message.sender === 'ai' ? (
                <Bot className="w-6 h-6 mt-1" />
              ) : (
                <User className="w-6 h-6 mt-1" />
              )}
              <div>{digitsEnToFa(message.text)}</div>
            </div>
          ))}
          {isLoading && (
            <div className="message-bubble ai-message flex items-center gap-2">
              <Bot className="w-6 h-6" />
              <div>در حال تایپ...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="پیام خود را بنویسید..."
          />
          <button
            type="submit"
            className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors"
            disabled={isLoading}
          >
            <Send className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
