// src/components/Sidebar.jsx
import React from 'react';
import { 
  FiSettings, FiFolder, FiChevronRight, FiUser, FiInfo, 
  FiTrash2, FiCheckCircle, FiPlus, FiMessageSquare, FiX 
} from 'react-icons/fi';

// Компонент для элемента боковой панели (используется для статуса)
// eslint-disable-next-line no-unused-vars
const SidebarItem = ({ icon: Icon, label, status = false }) => (
  <div className={`sidebar-item ${status ? 'status-connected' : 'status-default'}`}>
    <Icon size={18} />
    <span>{label}</span>
    {label.includes('API') && <FiChevronRight size={16} />}
  </div>
);

// Компонент для отдельного чата в списке
const ChatListItem = ({ chat, isActive, onSelect, onDelete }) => (
    <div 
        className={`chat-list-item ${isActive ? 'active' : ''}`}
        onClick={() => onSelect(chat.id)}
    >
        <FiMessageSquare size={16} />
        <span className="truncate">{chat.title}</span>
        {/* Кнопка удаления */}
        <button 
            className="delete-chat-btn"
            onClick={(e) => {
                e.stopPropagation(); // Не переключает чат при удалении
                onDelete(chat.id);
            }}
        >
            <FiX size={14} />
        </button>
    </div>
);


// Основной компонент Sidebar
const Sidebar = ({ 
    chats, 
    activeChatId, 
    onSelectChat, 
    onNewChat, 
    onDeleteChat, 
    onClearHistory, // Новая функция для очистки
    onExampleClick 
}) => {
  const exampleQuestions = [
    "Какая цена Сбербанка?", "Покажи мой портфель", "Что в стакане по Газпрому?",
    "Покажи свечи YNDX за последний день", "Какие у меня активные ордера?", "Детали моей сессии"
  ];

  const handleExampleClick = (question) => {
      if (onExampleClick) {
          onExampleClick(question);
      }
  };

  return (
    <div className="sidebar">
      <div>
        
        {/* 1. КНОПКА НОВОГО ЧАТА */}
        <button 
          className="sidebar-new-chat-button"
          onClick={onNewChat}
        >
          <FiPlus size={20} />
          <span>Новый чат</span>
        </button>
        
        {/* 2. СПИСОК ЧАТОВ */}
        <div className="sidebar-chat-list">
            {chats.map(chat => (
                <ChatListItem 
                    key={chat.id}
                    chat={chat}
                    isActive={chat.id === activeChatId}
                    onSelect={onSelectChat}
                    onDelete={onDeleteChat}
                />
            ))}
        </div>
        
        {/* 3. НАСТРОЙКИ (разделение) */}
        <div className="mt-8 border-t border-gray-800 pt-4">
            <div className="sidebar-group">
                <SidebarItem icon={FiFolder} label="Finam API" />
            </div>
        </div>


        {/* 4. Счет */}
        <div className="sidebar-section">
            <div className="sidebar-account-info">
                <div className="space-x-2">
                    <FiUser size={18} />
                    <span className="text-lg">ID счета</span>
                </div>
                <FiInfo size={16} className="cursor-pointer" />
            </div>
        </div>

        {/* 5. Управление диалогом (ОЧИСТКА ТЕКУЩЕЙ ИСТОРИИ) */}
        <button 
          className="sidebar-clear-button"
          onClick={onClearHistory} // Вызываем новую функцию
        >
          <FiTrash2 size={18} />
          <span>Очистить историю</span>
        </button>

        {/* 6. Примеры вопросов */}
        <h3 className="sidebar-examples-title">Примеры вопросов:</h3>
        <div className="sidebar-group">
          {exampleQuestions.map(q => (
            <a 
              key={q} 
              href="#" 
              onClick={(e) => { e.preventDefault(); handleExampleClick(q); }}
              className="sidebar-example-link"
            >
              {q}
            </a>
          ))}
        </div>
      </div>
      
      {/* 7. Статус подключения */}
      <div className="sidebar-footer">
        <SidebarItem icon={FiCheckCircle} label="Finam API установлен" status={true} />
      </div>
    </div>
  );
};

export default Sidebar;