
import React, { useState, useMemo } from 'react';
import { SalesLink, ChatSession, ChatMessage } from '../../types';
import { GoogleGenAI } from "@google/genai";

interface ChatManagerProps {
  activeLink: SalesLink;
}

const ChatManager: React.FC<ChatManagerProps> = ({ activeLink }) => {
  // داده‌های فرضی برای نمایش اولیه
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: 'chat_1',
      customerEmail: 'ali.reza@gmail.com',
      productName: 'هندزفری سونی XM5',
      isUnread: true,
      lastMessageAt: new Date().toISOString(),
      messages: [
        { id: 'm1', sender: 'buyer', text: 'سلام، آیا این محصول گارانتی اصلی دارد؟', timestamp: new Date().toISOString() }
      ]
    },
    {
      id: 'chat_2',
      customerEmail: 'sara.m@yahoo.com',
      productName: 'ساعت هوشمند Amazfit',
      isUnread: false,
      lastMessageAt: new Date(Date.now() - 86400000).toISOString(),
      messages: [
        { id: 'm2', sender: 'buyer', text: 'ببخشید، باتری این مدل چقدر شارژ نگه می‌داره؟', timestamp: new Date(Date.now() - 90000000).toISOString() },
        { id: 'm3', sender: 'seller', text: 'سلام سارای عزیز، حدود ۲۱ روز شارژدهی دارد.', timestamp: new Date(Date.now() - 86400000).toISOString() }
      ]
    }
  ]);

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  
  // حالت‌های جدید برای جستجو و فیلتر
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread'>('all');

  const activeSession = sessions.find(s => s.id === activeSessionId);

  // منطق فیلتر و جستجوی گفتگوها
  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      const matchesSearch = s.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           s.productName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || s.isUnread;
      return matchesSearch && matchesFilter;
    });
  }, [sessions, searchTerm, filterType]);

  const handleSend = () => {
    if (!replyText.trim() || !activeSessionId) return;
    
    const newMsg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      sender: 'seller',
      text: replyText,
      timestamp: new Date().toISOString()
    };

    setSessions(prev => prev.map(s => 
      s.id === activeSessionId 
        ? { ...s, messages: [...s.messages, newMsg], lastMessageAt: newMsg.timestamp, isUnread: false }
        : s
    ));
    setReplyText('');
  };

  const handleAISuggestion = async () => {
    if (!activeSession) return;
    setIsSuggesting(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const lastBuyerMsg = [...activeSession.messages].reverse().find(m => m.sender === 'buyer')?.text;
      const prompt = `شما فروشنده فروشگاه "${activeLink.title}" هستید. خریدار درباره محصول "${activeSession.productName}" پرسیده است: "${lastBuyerMsg}". یک پاسخ کوتاه، مودبانه و حرفه‌ای به فارسی پیشنهاد دهید. فقط متن پاسخ را برگردانید.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      setReplyText(response.text?.trim() || "");
    } catch (e) {
      setReplyText("سلام، بله محصول دارای ضمانت اصالت و گارانتی معتبر است.");
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[650px] animate-in fade-in duration-500 text-right" dir="rtl">
      {/* لیست گفتگوها با قابلیت جستجو و فیلتر */}
      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-8 border-b border-slate-50 space-y-4">
           <div>
              <h3 className="text-xl font-black text-slate-900">گفتگوها</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-1">مدیریت سوالات خریداران</p>
           </div>
           
           {/* نوار جستجو */}
           <div className="relative">
              <input 
                type="text" 
                placeholder="جستجوی نام یا ایمیل..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2.5 text-[10px] font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
           </div>

           {/* فیلتر وضعیت */}
           <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
              <button 
                onClick={() => setFilterType('all')}
                className={`flex-1 py-2 rounded-lg text-[9px] font-black transition-all ${filterType === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
              >
                همه گفتگوها
              </button>
              <button 
                onClick={() => setFilterType('unread')}
                className={`flex-1 py-2 rounded-lg text-[9px] font-black transition-all ${filterType === 'unread' ? 'bg-white text-red-500 shadow-sm' : 'text-slate-400'}`}
              >
                خوانده نشده ({sessions.filter(s => s.isUnread).length})
              </button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
           {filteredSessions.length === 0 ? (
             <div className="p-10 text-center text-slate-300 italic font-bold text-[10px]">
                {searchTerm ? 'نتیجه‌ای یافت نشد.' : 'گفتگویی وجود ندارد.'}
             </div>
           ) : filteredSessions.map(s => (
             <button 
               key={s.id} 
               onClick={() => setActiveSessionId(s.id)}
               className={`w-full p-6 text-right flex items-center gap-4 transition-all relative ${activeSessionId === s.id ? 'bg-indigo-50 border-r-4 border-indigo-600' : 'hover:bg-slate-50'}`}
             >
                {s.isUnread && (
                  <div className="absolute top-6 left-6 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm"></div>
                )}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg shadow-sm shrink-0 ${s.isUnread ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                   {s.customerEmail.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-center mb-1">
                      <span className={`text-xs truncate max-w-[120px] ${s.isUnread ? 'font-black text-slate-900' : 'font-bold text-slate-600'}`}>{s.customerEmail}</span>
                      <span className="text-[8px] font-bold text-slate-400">{new Date(s.lastMessageAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</span>
                   </div>
                   <div className={`text-[10px] truncate ${s.isUnread ? 'font-black text-slate-700' : 'font-bold text-slate-400'}`}>{s.messages[s.messages.length - 1].text}</div>
                   <div className="mt-1 text-[9px] font-black text-indigo-500">{s.productName}</div>
                </div>
             </button>
           ))}
        </div>
      </div>

      {/* پنجره چت */}
      <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        {activeSession ? (
          <>
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
               <div>
                  <h4 className="font-black text-slate-800 text-sm">{activeSession.customerEmail}</h4>
                  <p className="text-[10px] text-indigo-600 font-bold">درباره محصول: {activeSession.productName}</p>
               </div>
               <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">👤</div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30">
               {activeSession.messages.map(m => (
                 <div key={m.id} className={`flex ${m.sender === 'seller' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-xs font-bold leading-relaxed shadow-sm ${m.sender === 'seller' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none border border-slate-100'}`}>
                       {m.text}
                       <div className={`text-[8px] mt-2 opacity-50 ${m.sender === 'seller' ? 'text-white' : 'text-slate-400'}`}>
                         {new Date(m.timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                       </div>
                    </div>
                 </div>
               ))}
            </div>

            <div className="p-6 border-t border-slate-50 space-y-4">
               <div className="flex justify-between items-center px-2">
                  <button 
                    onClick={handleAISuggestion} 
                    disabled={isSuggesting}
                    className="text-[10px] font-black text-indigo-600 flex items-center gap-1 hover:underline"
                  >
                    {isSuggesting ? 'در حال تحلیل...' : '✨ پیشنهاد پاسخ هوشمند (AI)'}
                  </button>
               </div>
               <div className="flex gap-4">
                  <input 
                    type="text" 
                    value={replyText} 
                    onChange={e => setReplyText(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSend()}
                    placeholder="پاسخ خود را اینجا بنویسید..." 
                    className="flex-1 px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold text-sm focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                  <button 
                    onClick={handleSend}
                    className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg hover:bg-indigo-600 transition-all"
                  >
                    🚀
                  </button>
               </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
             <div className="text-6xl mb-4 opacity-20">💬</div>
             <p className="font-black text-sm">یک گفتگو را برای شروع انتخاب کنید</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatManager;
