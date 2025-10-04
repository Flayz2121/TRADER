// src/components/ChatInput.jsx
import React, { useState } from 'react';
import { FiSend } from 'react-icons/fi';

// Принимаем функцию onSend И isProcessing
const ChatInput = ({ onSend, isProcessing }) => { 
    // Состояние для хранения текста в поле ввода
    const [input, setInput] = useState('');

    // Обработчик отправки (по клику или Enter)
    const handleSubmit = (e) => {
        e.preventDefault(); 
        
        // Добавляем проверку на isProcessing
        if (input.trim() && !isProcessing) {
            onSend(input); 
            setInput(''); 
        }
    };

    return (
        <form onSubmit={handleSubmit} className="chat-input-container">
            <div className="chat-input-wrapper">
                <input
                    type="text"
                    placeholder={isProcessing ? "Ожидаем ответа AI..." : "Напишите ваш вопрос..."}
                    className="chat-input-field"
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    disabled={isProcessing} // Отключаем ввод во время обработки
                />
                <button 
                    type="submit" 
                    className="chat-input-send-button"
                    disabled={isProcessing || !input.trim()} // Отключаем кнопку, если обрабатывается или поле пустое
                    style={{ 
                        opacity: isProcessing ? 0.5 : 1, 
                        cursor: isProcessing ? 'not-allowed' : 'pointer'
                    }}
                >
                    <FiSend size={20} />
                </button>
            </div>
        </form>
    );
};

export default ChatInput;