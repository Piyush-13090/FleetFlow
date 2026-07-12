import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles 
} from 'lucide-react';

interface Message {
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  action?: { label: string; onClick: () => void };
}

interface AiAssistantProps {
  onTriggerQuickAction: (actionType: string) => void;
  onShowToast: (msg: string) => void;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({
  onTriggerQuickAction,
  onShowToast,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: 'Hello! I am your FleetFlow Assistant. I can help dispatch vehicles, look up driver statuses, or log maintenance requests. How can I help you today?',
      timestamp: 'Just now'
    }
  ]);

  const suggestions = [
    { label: 'Show delayed drivers', id: 'delayed' },
    { label: 'Create new trip', id: 'trip' },
    { label: 'Log fuel expense', id: 'fuel' }
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMsg('');

    // Generate mock AI response
    setTimeout(() => {
      let replyText = "I'm sorry, I didn't quite catch that. Try asking to locate delayed drivers, log fuel, or create a trip!";
      let action: Message['action'] = undefined;

      const lower = text.toLowerCase();
      if (lower.includes('delayed') || lower.includes('driver')) {
        replyText = 'Checking telemetry logs... Driver Sarah Davis is currently delayed on Route CHI-MSP with Asset #TRK-201. ETA is pushed back by 1.2 hours due to high congestion on Interstate-94.';
        action = {
          label: 'Locate Sarah Davis',
          onClick: () => {
            onShowToast("Map viewport centered on Route CHI-MSP (Sarah Davis)");
            setIsOpen(false);
          }
        };
      } else if (lower.includes('trip') || lower.includes('dispatch') || lower.includes('create')) {
        replyText = 'I can help you coordinate a new dispatch trip. Click the button below to launch the Trip Dispatcher panel.';
        action = {
          label: 'Open Dispatcher Panel',
          onClick: () => {
            onTriggerQuickAction('trip');
            setIsOpen(false);
          }
        };
      } else if (lower.includes('fuel') || lower.includes('expense') || lower.includes('cost')) {
        replyText = 'Fuel consumption logged. You can file new fuel invoice receipts immediately here.';
        action = {
          label: 'File Fuel Entry',
          onClick: () => {
            onTriggerQuickAction('fuel');
            setIsOpen(false);
          }
        };
      }

      setMessages((prev) => [...prev, {
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action
      }]);
    }, 1000);
  };

  const handleSuggestionClick = (label: string) => {
    handleSend(label);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 select-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="absolute bottom-16 right-0 w-80 bg-white border border-border-gray rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[400px] z-50"
          >
            {/* Header */}
            <div className="bg-primary p-4 text-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-none">FleetFlow AI</h4>
                  <span className="text-[9px] text-blue-100 font-medium">Fleet Dispatch Assistant</span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-3 rounded-xl text-left ${
                    msg.sender === 'user' 
                      ? 'bg-primary text-white text-xs font-medium rounded-tr-none' 
                      : 'bg-white border border-border-gray text-xs font-medium text-slate-700 rounded-tl-none shadow-sm'
                  }`}>
                    <p className="leading-relaxed">{msg.text}</p>
                    
                    {msg.action && (
                      <button
                        onClick={msg.action.onClick}
                        className="mt-2.5 w-full py-1.5 bg-primary hover:bg-primary/95 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center cursor-pointer shadow-sm"
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        {msg.action.label}
                      </button>
                    )}

                    <span className={`text-[8.5px] block mt-1 text-right ${
                      msg.sender === 'user' ? 'text-blue-100' : 'text-slate-400'
                    }`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Suggestions list */}
            {messages.length === 1 && (
              <div className="p-2 border-t border-border-gray/50 bg-white flex flex-wrap gap-1.5 justify-center">
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSuggestionClick(s.label)}
                    className="px-2.5 py-1 bg-slate-50 hover:bg-blue-50 hover:text-primary border border-border-gray hover:border-primary/20 text-[9.5px] font-bold text-slate-600 rounded-lg transition-colors cursor-pointer"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}

            {/* Chat Input Footer */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputMsg);
              }}
              className="p-3 border-t border-border-gray bg-white flex items-center space-x-2"
            >
              <input
                type="text"
                placeholder="Ask about active vehicles..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                className="flex-1 bg-slate-50 border border-border-gray rounded-xl px-3 py-1.5 text-xs text-text-dark focus:bg-white focus:outline-none focus:border-primary/45"
              />
              <button
                type="submit"
                className="p-2 bg-primary hover:bg-primary/95 text-white rounded-xl shadow-sm cursor-pointer flex items-center justify-center shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Glowing Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:shadow-primary/25 cursor-pointer relative overflow-hidden group focus:outline-none border-2 border-white"
        style={{
          boxShadow: '0 0 15px rgba(37, 99, 235, 0.45)'
        }}
      >
        <Bot className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
      </motion.button>
    </div>
  );
};
