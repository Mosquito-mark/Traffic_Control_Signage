
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useGeminiQuery } from '../hooks/useGeminiQuery';
// FIX: Update icon import path to the consolidated IconComponents.tsx file.
import { BackArrowIcon, LoadingIcon, SparklesIcon } from './IconComponents';
import Button from './ui/Button';

interface GeminiChatViewProps {
  onBack: () => void;
}

interface Message {
  author: 'user' | 'gemini';
  text: string;
}

const GeminiChatView: React.FC<GeminiChatViewProps> = ({ onBack }) => {
  const { summary: answer, isLoading, error, generateSummary: askQuestion } = useGeminiQuery();
  const [messages, setMessages] = useState<Message[]>([
    { author: 'gemini', text: "Hello! I'm here to help. Ask me anything about the inventory or deployment data." }
  ]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isAwaitingResponse = useRef(false);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Effect to add Gemini's response to the chat
  useEffect(() => {
    if (answer && isAwaitingResponse.current) {
      setMessages(prev => [...prev, { author: 'gemini', text: answer }]);
      isAwaitingResponse.current = false;
    }
  }, [answer]);
  
    // Effect to add error messages to the chat
  useEffect(() => {
    if (error && isAwaitingResponse.current) {
      setMessages(prev => [...prev, { author: 'gemini', text: `Sorry, I encountered an error: ${error}` }]);
      isAwaitingResponse.current = false;
    }
  }, [error]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const question = currentQuestion.trim();
    if (!question || isLoading) return;

    setMessages(prev => [...prev, { author: 'user', text: question }]);
    setCurrentQuestion('');
    isAwaitingResponse.current = true;
    askQuestion({ type: 'chat', question });
    
  }, [currentQuestion, isLoading, askQuestion]);
  
  const examplePrompts = [
    "Which yard has the most 28 Inch Cones?",
    "What was the total cost for the 'Downtown Music Festival' deployment?",
    "List all items with less than 100 units remaining in total.",
    "Which deployments used an 'Arrow Board Trailer'?"
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-lg animate-fade-in flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex-shrink-0">
        <button onClick={onBack} className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-2 font-semibold">
          <BackArrowIcon className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>
        <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
            <SparklesIcon className="h-8 w-8 text-brand-blue dark:text-brand-blue-light" />
            <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Ask Gemini</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">AI-powered assistant for inventory questions.</p>
            </div>
        </div>
      </div>
      
      <div ref={chatContainerRef} className="flex-grow overflow-y-auto space-y-4 pr-2 -mr-2">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2 ${msg.author === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.author === 'gemini' && <div className="flex-shrink-0 h-8 w-8 rounded-full bg-brand-blue flex items-center justify-center"><SparklesIcon className="h-5 w-5 text-white" /></div>}
            <div className={`max-w-md lg:max-w-2xl px-4 py-3 rounded-2xl ${msg.author === 'user' ? 'bg-brand-blue text-white rounded-br-none' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
              <div className="prose prose-sm max-w-none prose-gray dark:prose-invert">
                <p className="whitespace-pre-wrap m-0">{msg.text}</p>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex items-end gap-2 justify-start">
                 <div className="flex-shrink-0 h-8 w-8 rounded-full bg-brand-blue flex items-center justify-center"><SparklesIcon className="h-5 w-5 text-white" /></div>
                 <div className="max-w-md lg:max-w-2xl px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none">
                    <LoadingIcon className="h-5 w-5 animate-spin" />
                 </div>
            </div>
        )}
      </div>

      <div className="flex-shrink-0 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2 mb-2">
            {examplePrompts.map(prompt => (
                <button key={prompt} onClick={() => setCurrentQuestion(prompt)} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    {prompt}
                </button>
            ))}
        </div>
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            type="text"
            value={currentQuestion}
            onChange={(e) => setCurrentQuestion(e.target.value)}
            placeholder="e.g., How many barricades are deployed in total?"
            className="flex-grow block w-full rounded-md border bg-gray-50 border-gray-300 text-gray-900 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200 dark:focus:border-brand-blue-light dark:focus:ring-brand-blue-light"
            aria-label="Ask a question"
          />
          <Button type="submit" disabled={isLoading || !currentQuestion}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};

export default GeminiChatView;
