
import React, { useState, useRef, useEffect, FormEvent } from 'react';
import type { ChatMessage } from '../types';
import { sendMessageToBot } from '../services/geminiService';

const BotIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12C20,13.85 19.13,15.5 17.85,16.63L16.63,17.85C15.5,19.13 13.85,20 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M8.5,8A1.5,1.5 0 0,1 10,9.5A1.5,1.5 0 0,1 8.5,11A1.5,1.5 0 0,1 7,9.5A1.5,1.5 0 0,1 8.5,8M15.5,8A1.5,1.5 0 0,1 17,9.5A1.5,1.5 0 0,1 15.5,11A1.5,1.5 0 0,1 14,9.5A1.5,1.5 0 0,1 15.5,8M8,14H16A2,2 0 0,1 18,16V16.5A1.5,1.5 0 0,1 16.5,18H7.5A1.5,1.5 0 0,1 6,16.5V16A2,2 0 0,1 8,14Z" />
    </svg>
);


export const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { sender: 'bot', text: "Hello! How can I help you with your KPA application today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const stream = await sendMessageToBot(input);
            let botReply = '';
            setMessages(prev => [...prev, { sender: 'bot', text: '' }]);

            for await (const chunk of stream) {
                botReply += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { sender: 'bot', text: botReply };
                    return newMessages;
                });
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { sender: 'bot', text: "Sorry, I'm having trouble connecting. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <>
            <div className="fixed bottom-5 right-5 z-50">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="bg-red-600 text-white rounded-full p-4 shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-transform transform hover:scale-110"
                >
                   <BotIcon className="h-8 w-8" />
                </button>
            </div>
            {isOpen && (
                <div className="fixed bottom-20 right-5 w-full max-w-sm h-[60vh] bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col z-40 border border-gray-200 dark:border-gray-700">
                    <header className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
                        <h3 className="text-lg font-semibold">KPA Assistant</h3>
                        <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">&times;</button>
                    </header>
                    <main className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs md:max-w-sm rounded-lg px-4 py-2 ${msg.sender === 'user' ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                                    <p className="text-sm break-words">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-200 dark:bg-gray-700 rounded-lg px-4 py-2">
                                    <div className="flex items-center space-x-1">
                                        <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </main>
                    <footer className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <form onSubmit={handleSubmit} className="flex space-x-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask a question..."
                                className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            <button type="submit" disabled={isLoading} className="bg-red-600 text-white rounded-full p-3 hover:bg-red-700 disabled:bg-red-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                </svg>
                            </button>
                        </form>
                    </footer>
                </div>
            )}
        </>
    );
};
