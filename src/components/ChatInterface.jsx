// src/components/ChatInterface.jsx
import React, { useRef, useEffect, useState } from 'react';
import ChatInput from './ChatInput';
import { FiAperture, FiZap, FiLoader, FiAlertTriangle, FiChevronRight } from 'react-icons/fi';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';

// --- Вспомогательные компоненты ---

const UserMessage = ({ content }) => (
  <div className="message user-message">
    <FiAperture size={20} />
    <p>{content}</p>
  </div>
);

const BotCodeMessage = ({ content, explanation }) => (
  <div className="message bot-code flex flex-col gap-2">
    {explanation && (
      <div className="flex items-center gap-2 text-sm font-semibold">
        <FiZap size={18} />
        <span>{explanation}</span>
      </div>
    )}
    <div className="syntax-highlighter-container">
      <SyntaxHighlighter language="json" style={darcula} wrapLongLines={true}>
        {content}
      </SyntaxHighlighter>
    </div>
  </div>
);

const BotTextMessage = ({ content }) => (
  <div className="message bot-text">
    <p>{content}</p>
  </div>
);

const BotLoadingMessage = () => (
  <div className="message bot-text">
    <FiLoader size={20} className="animate-spin text-blue-400" />
    <p className="text-gray-400 italic">Обработка запроса...</p>
  </div>
);

const ApiErrorBlock = ({ error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const messageMatch = error.match(/при обработке запроса: (.*)\. Пожалуйста/);
  const primaryMessage = messageMatch ? messageMatch[1] : error;

  return (
    <div className="api-error-block">
      <div className="api-error-header">
        <FiAlertTriangle size={20} />
        <p>Критическая ошибка!</p>
      </div>
      <div className="api-error-details-section">
        <p className="api-error-next-steps">{primaryMessage}</p>
        <button className="details-toggle-button mt-2" onClick={() => setIsOpen(!isOpen)}>
          Детали API ответа
          <FiChevronRight size={14} className={`arrow ${isOpen ? 'open' : ''}`} />
        </button>
        {isOpen && <p className="api-error-request-info mt-2">{error}</p>}
        <p className="api-error-interpretation">
          Проверьте ваш **OPENAI_API_KEY** в файле **App.jsx** и попробуйте сформулировать команду более чётко.
        </p>
      </div>
    </div>
  );
};

// --- Основной компонент чата ---

const ChatInterface = ({ messages, onSend, isProcessing }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const renderMessage = (message, index) => {
    const prevMessage = messages[index - 1];
    const isMarginNeeded =
      prevMessage &&
      ((prevMessage.type.startsWith('bot') && message.type === 'user') ||
        (prevMessage.type === 'user' && message.type.startsWith('bot')));

    const style = isMarginNeeded ? { marginTop: '16px' } : {};

    switch (message.type) {
      case 'user':
        return (
          <div key={message.id} style={style}>
            <UserMessage content={message.content} />
          </div>
        );
      case 'bot-code':
        return (
          <div key={message.id} style={style}>
            <BotCodeMessage content={message.content} explanation={message.explanation} />
          </div>
        );
      case 'bot-loading':
        return (
          <div key={message.id} style={style}>
            <BotLoadingMessage />
          </div>
        );
      case 'bot-text':
        if (message.content.startsWith('❌')) {
          return (
            <div key={message.id} style={style}>
              <ApiErrorBlock error={message.content} />
            </div>
          );
        }
        return (
          <div key={message.id} style={style}>
            <BotTextMessage content={message.content} />
          </div>
        );
      default:
        return null;
    }
  };

return (
  <div className="chat-interface flex flex-col h-full">
    {/* История сообщений */}
    <div className="chat-content flex-1 overflow-y-auto p-4">
      {messages.map((msg, idx) => renderMessage(msg, idx))}
      <div ref={messagesEndRef} />
    </div>

    {/* Поле ввода */}
    <div className>
      <ChatInput onSend={onSend} isProcessing={isProcessing} />
    </div>
  </div>
);

};

export default ChatInterface;
