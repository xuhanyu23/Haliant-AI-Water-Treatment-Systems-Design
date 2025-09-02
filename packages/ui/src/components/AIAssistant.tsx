import React, { useState, useRef, useEffect } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  isOpen: boolean;
  onToggle: () => void;
  systemContext?: {
    systemType: string;
    currentParameters?: any;
    designResults?: any;
  };
  className?: string;
}

export function AIAssistant({ isOpen, onToggle, systemContext, className = '' }: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0 && systemContext) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: getWelcomeMessage(systemContext.systemType),
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [systemContext, messages.length]);

  const getWelcomeMessage = (systemType: string): string => {
    switch (systemType) {
      case 'cip-ro':
        return `👋 Hi! I'm your water treatment design assistant. I can help you with:

• **Parameter Selection**: Choosing optimal flow rates, vessel counts, and temperatures
• **Design Optimization**: Improving efficiency and reducing costs  
• **Troubleshooting**: Solving design issues and pressure problems
• **Industry Standards**: Ensuring compliance with water treatment best practices

What would you like help with today?`;
      default:
        return `👋 Hi! I'm here to help you design water treatment systems. Ask me anything about system parameters, specifications, or best practices!`;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';
      
      const response = await fetch(`${API_BASE}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.filter(m => m.role !== 'assistant' || m.id !== 'welcome').map(m => ({
            role: m.role,
            content: m.content,
          })),
          systemContext,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message.content,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSimulatedResponse = (userInput: string, context?: any): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('flow rate') || input.includes('gpm')) {
      return `For membrane cleaning systems, I recommend:

🔧 **Flow Rate Guidelines:**
• Small restaurants: 35-50 GPM per stage
• Industrial facilities: 60-120 GPM per stage
• Keep velocity at 5-8 ft/sec in headers

💡 **Pro Tip:** Higher flow rates clean better but increase pump costs. Your current design with ${context?.currentParameters?.perVesselFlowGPM || 40} GPM per vessel looks good for most applications.`;
    }
    
    if (input.includes('pressure') || input.includes('psi')) {
      return `⚠️ **Pressure Management:**

Keep differential pressure per vessel ≤10-15 psi to avoid membrane damage.

📊 **Current Analysis:**
• Your design has ${context?.designResults?.summary?.Fmax || 'N/A'} GPM max flow
• Recommended pump head: ~110 ft
• Use VFD for pressure control

🛠️ **Quick Fix:** If pressure is too high, consider parallel vessel arrangements.`;
    }
    
    if (input.includes('cost') || input.includes('optimize')) {
      return `💰 **Cost Optimization Tips:**

1. **Tank Sizing:** Your ${context?.designResults?.summary?.tankGal || 'calculated'} gal tank is sized for efficiency
2. **Pump Selection:** Consider 50Hz vs 60Hz based on location
3. **Heater Options:** Electric vs steam based on utility costs

🎯 **Potential Savings:**
• Use standard tank sizes (400, 500, 600 gal)
• Consider multiple smaller pumps vs one large pump
• Optimize cleaning cycles to reduce chemical usage`;
    }

    return `I understand you're asking about "${userInput}". 

Here are some general water treatment design tips:
• Always size systems with 20-30% safety margin
• Consider local codes and regulations
• Plan for maintenance access
• Use 316L stainless steel for chemical compatibility

Could you be more specific about what you'd like help with? I can provide detailed guidance on parameters, specifications, or troubleshooting.`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className={`fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all z-50 ${className}`}
        aria-label="Open AI Assistant"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <div className="absolute -top-2 -right-2 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <h3 className="font-semibold">AI Design Assistant</h3>
        </div>
        <button
          onClick={onToggle}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              <div className={`text-xs mt-1 opacity-70 ${
                message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about flow rates, pressure, optimization..."
            className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}