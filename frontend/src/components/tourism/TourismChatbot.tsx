import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicTourismService } from '@/services/tourismService';
import { ROUTES } from '@/constants/routes';
import type { ChatbotMessage } from '@/types/tourism';

interface TourismChatbotProps {
  mode?: 'floating' | 'inline';
  initialLanguage?: 'en' | 'bn' | 'hi';
}

const DEFAULT_GREETINGS: Record<string, string> = {
  en: "Namaskar! I am your Durga Puja 2026 Tourism Concierge Assistant. Ask me about heritage Bonedi Bari circuits, contemporary art pandals, WBTDC stays, midnight metro schedules, Kumari Puja & Sandhi Puja timings, or customized itineraries. How can I help you today?",
  bn: "নমস্কার! আমি দুর্গোৎসব ২০২৬ ট্যুরিজম কনসিয়ার্জ সহকারী। বনেদি বাড়ির পুজো, থিম প্যান্ডেল, WBTDCL লজ, রাতভর মেট্রো সূচী, বেলুড় মঠের কুমারী পুজো কিংবা সন্ধিপুজোর সময় সম্পর্কে আমাকে জিজ্ঞাসা করতে পারেন। আপনি কীভাবে উৎসব উপভোগ করতে চান?",
  hi: "नमस्ते! मैं दुर्गा पूजा २०२६ टूरिज्म कंसीयर्ज असिस्टेंट हूँ। आप मुझसे हेरिटेज बोनेदी बाड़ी, भव्य थीम पंडाल, WBTDCL होटल, रातभर मेट्रो, कुमारी पूजा और संधि पूजा के समय के बारे में पूछ सकते हैं। मैं आपकी किस प्रकार सहायता करूँ?",
};

const SUGGESTIONS: Record<string, string[]> = {
  en: [
    "North Kolkata Heritage & Bonedi Bari trail",
    "South Kolkata Megapandal art circuit",
    "Belur Math Kumari Puja & Sandhi Puja timing",
    "WBTDCL Government stay options",
    "Kolkata Midnight Metro & Parikrama bus info",
    "How to get VIP Pandal passes?",
  ],
  bn: [
    "উত্তর কলকাতা বনেদি বাড়ি ও শোভাবাজার রাজবাড়ি",
    "দক্ষিণ কলকাতা মেগাপ্যান্ডেল ও আধুনিক আর্ট",
    "অষ্টমীর কুমারী পুজো ও সন্ধিপুজোর সময়সূচী",
    "WBTDCL সরকারি লজ ও বুকিং তথ্য",
    "রাতভর মেট্রো চলাচলের সময়সূচী",
    "ভিআইপি প্যান্ডেল পাস কীভাবে পাব?",
  ],
  hi: [
    "उत्तर कोलकाता हेरिटेज व बोनेदी बाड़ी सर्किट",
    "दक्षिण कोलकाता प्रसिद्ध मेगापंडाल",
    "बेलूर मठ कुमारी पूजा व संधि पूजा का समय",
    "WBTDCL सरकारी लॉज व आवास",
    "रातभर मेट्रो ट्रेन सुविधा व बस पास",
    "वीआईपी पास कैसे प्राप्त करें?",
  ],
};

export function TourismChatbot({ mode = 'floating', initialLanguage = 'en' }: TourismChatbotProps) {
  const [isOpen, setIsOpen] = useState(mode === 'inline');
  const [language, setLanguage] = useState<'en' | 'bn' | 'hi'>(initialLanguage);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatbotMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: DEFAULT_GREETINGS[initialLanguage] || DEFAULT_GREETINGS.en,
      timestamp: new Date().toISOString(),
      language: initialLanguage,
    },
  ]);
  const [quickOptions, setQuickOptions] = useState<string[]>(SUGGESTIONS[initialLanguage] || SUGGESTIONS.en);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleLanguageChange = (newLang: 'en' | 'bn' | 'hi') => {
    setLanguage(newLang);
    setQuickOptions(SUGGESTIONS[newLang]);
    setMessages((prev) => [
      ...prev,
      {
        id: `lang-change-${Date.now()}`,
        sender: 'assistant',
        text: DEFAULT_GREETINGS[newLang],
        timestamp: new Date().toISOString(),
        language: newLang,
      },
    ]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: ChatbotMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toISOString(),
      language,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await publicTourismService.chatbot.ask({
        message: query,
        language,
        conversationHistory: messages.slice(-4),
      });

      const assistantMsg: ChatbotMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        timestamp: new Date().toISOString(),
        language: res.language || language,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      if (res.quickOptions && res.quickOptions.length > 0) {
        setQuickOptions(res.quickOptions);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: language === 'bn'
            ? 'দুঃখিত, সংযোগে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
            : language === 'hi'
            ? 'क्षमा करें, कनेक्शन में समस्या है। कृपया पुनः प्रयास करें।'
            : 'Sorry, I encountered a temporary connection issue. Please try again.',
          timestamp: new Date().toISOString(),
          language,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className={`tourism-chatbot ${mode === 'inline' ? 'tourism-chatbot--inline' : 'tourism-chatbot--floating'}`}>
      <div className="tourism-chatbot__header">
        <div className="tourism-chatbot__title-box">
          <span className="tourism-chatbot__icon" aria-hidden="true">🤖</span>
          <div>
            <h3 className="tourism-chatbot__title">
              {language === 'bn' ? 'উৎসব সহায়ক' : language === 'hi' ? 'उत्सव सहायक' : 'Festival Concierge AI'}
            </h3>
            <span className="tourism-chatbot__badge">
              {language === 'bn' ? 'অনলাইন' : language === 'hi' ? 'सक्रिय' : 'Live Knowledge'}
            </span>
          </div>
        </div>

        <div className="tourism-chatbot__header-actions">
          {/* Language selector */}
          <div className="tourism-chatbot__lang-pills">
            <button
              type="button"
              className={`tourism-chatbot__lang-btn ${language === 'en' ? 'tourism-chatbot__lang-btn--active' : ''}`}
              onClick={() => handleLanguageChange('en')}
            >
              EN
            </button>
            <button
              type="button"
              className={`tourism-chatbot__lang-btn ${language === 'bn' ? 'tourism-chatbot__lang-btn--active' : ''}`}
              onClick={() => handleLanguageChange('bn')}
            >
              বাং
            </button>
            <button
              type="button"
              className={`tourism-chatbot__lang-btn ${language === 'hi' ? 'tourism-chatbot__lang-btn--active' : ''}`}
              onClick={() => handleLanguageChange('hi')}
            >
              हिं
            </button>
          </div>

          {mode === 'floating' && (
            <button
              type="button"
              className="tourism-chatbot__close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close Assistant"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="tourism-chatbot__messages">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`tourism-chatbot__msg tourism-chatbot__msg--${m.sender}`}
          >
            <div className="tourism-chatbot__bubble">
              <p style={{ whiteSpace: 'pre-line', margin: 0 }}>{m.text}</p>
            </div>
            <span className="tourism-chatbot__time">
              {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </span>
          </div>
        ))}

        {loading && (
          <div className="tourism-chatbot__msg tourism-chatbot__msg--assistant">
            <div className="tourism-chatbot__bubble tourism-chatbot__bubble--typing">
              <span className="tourism-chatbot__dot" />
              <span className="tourism-chatbot__dot" />
              <span className="tourism-chatbot__dot" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {quickOptions.length > 0 && (
        <div className="tourism-chatbot__suggestions">
          <span className="tourism-chatbot__suggestions-label">
            {language === 'bn' ? 'পরামর্শ:' : language === 'hi' ? 'सुझाव:' : 'Quick Questions:'}
          </span>
          <div className="tourism-chatbot__suggestions-list">
            {quickOptions.slice(0, 4).map((opt, i) => (
              <button
                key={i}
                type="button"
                className="tourism-chatbot__chip"
                onClick={() => handleSendMessage(opt)}
                disabled={loading}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      <form
        className="tourism-chatbot__input-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            language === 'bn'
              ? 'পুজো, পরিক্রমা বা থাকার ব্যাপারে লিখুন...'
              : language === 'hi'
              ? 'दुर्गा पूजा, सर्किट या होटल के बारे में पूछें...'
              : 'Ask about pandals, stays, metro, rituals...'
          }
          className="tourism-chatbot__input"
          disabled={loading}
        />
        <button
          type="submit"
          className="tourism-chatbot__send-btn"
          disabled={!input.trim() || loading}
          aria-label="Send query"
        >
          ➤
        </button>
      </form>

      <div className="tourism-chatbot__footer">
        <span>Need a verified package?</span>
        <Link to={ROUTES.PUBLIC_TOURISM_ENQUIRY} className="tourism-chatbot__enquiry-link">
          Submit Official Enquiry →
        </Link>
      </div>
    </div>
  );

  if (mode === 'inline') {
    return content;
  }

  return (
    <>
      {isOpen && content}
      {!isOpen && (
        <button
          type="button"
          className="tourism-chatbot__toggle-trigger"
          onClick={() => setIsOpen(true)}
          aria-label="Open Tourism Concierge Assistant"
        >
          <span className="tourism-chatbot__trigger-icon">🌺</span>
          <span className="tourism-chatbot__trigger-text">Concierge AI</span>
        </button>
      )}
    </>
  );
}
