import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ChatInterface from './components/ChatInterface';

// --- КОНСТАНТЫ API OPENAI ---
// *** ОБЯЗАТЕЛЬНО ЗАМЕНИТЕ ЭТО ЗНАЧЕНИЕ ВАШИМ КЛЮЧОМ ***
const OPENAI_API_KEY = "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"; 
const OPENAI_API_URL = "https://openrouter.ai/api/v1/chat/completions";


// Функция для генерации нового ID чата
const generateId = () => Date.now() + Math.random(); 

// Сообщение, которое показывается на "чистом листе"
const initialGreetingMessage = { 
    id: generateId(), 
    type: 'bot-text', 
    content: 'Привет! Я AI ассистент трейдера. Задайте мне вопрос, например: "Купи 10 акций Газпрома по 170.50".' 
};

// Структура для отображения "чистого листа"
const BLANK_SLATE_CHAT = { id: null, title: 'Новый диалог', messages: [] };


// --- ФУНКЦИЯ ДЛЯ БЕЗОПАСНОГО ВЫЗОВА API (С ПОВТОРНОЙ ПОПЫТКОЙ) ---
const fetchWithRetry = async (url, options, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Ошибка 401: Неверный или просроченный ключ OpenAI API. Проверьте файл App.jsx.");
                }
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response;
        } catch (error) {
            if (i === retries - 1) throw error;
            const delay = Math.pow(2, i) * 1000;
            console.warn(`API call failed, retrying in ${delay / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};


function App() {
    const [chats, setChats] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedChatIds, setSelectedChatIds] = useState(new Set());


    const getActiveChat = () => {
        return chats.find(c => c.id === activeChatId) || BLANK_SLATE_CHAT;
    };
    const activeChat = getActiveChat();

    const displayMessages = activeChat.id === null 
        ? [initialGreetingMessage] 
        : activeChat.messages;
    
    // --- ЛОГИКА УПРАВЛЕНИЯ ЧАТАМИ (Без изменений) ---

    const handleNewChat = () => {
        const newChat = {
            id: generateId(),
            title: "Новый чат",
            messages: [initialGreetingMessage],
        };
        setChats(prevChats => [newChat, ...prevChats]);
        setActiveChatId(newChat.id);
    };

    const handleDeleteChat = (idToDelete) => {
        if (!idToDelete) return;
        setChats(prevChats => {
            const remainingChats = prevChats.filter(chat => chat.id !== idToDelete);
            if (idToDelete === activeChatId) {
                setActiveChatId(remainingChats.length > 0 ? remainingChats[0].id : null);
            }
            return remainingChats;
        });
    };

    const handleClearChat = () => {
        if (!activeChatId) return;
        setChats(prevChats => prevChats.map(chat => 
            chat.id === activeChatId ? { ...chat, messages: [initialGreetingMessage] } : chat
        ));
    };

    const handleClearAllHistory = () => {
        if (window.confirm("Вы уверены, что хотите удалить ВСЮ историю чатов? Это действие необратимо.")) {
            setChats([]);
            setActiveChatId(null);
            setIsSelectionMode(false);
            setSelectedChatIds(new Set());
        }
    };

    const handleToggleSelectChat = (id) => {
        setSelectedChatIds(prevSelected => {
            const newSet = new Set(prevSelected);
            if (newSet.has(id)) { newSet.delete(id); } else { newSet.add(id); }
            return newSet;
        });
    };

    const handleDeleteMultiple = () => {
        if (selectedChatIds.size === 0) return;
        setChats(prevChats => {
            const remainingChats = prevChats.filter(chat => !selectedChatIds.has(chat.id));
            if (activeChatId && selectedChatIds.has(activeChatId)) {
                setActiveChatId(remainingChats.length > 0 ? remainingChats[0].id : null);
            }
            return remainingChats;
        });
        setIsSelectionMode(false);
        setSelectedChatIds(new Set());
    };


    // --- ГЛАВНАЯ ЛОГИКА: ОТПРАВКА СООБЩЕНИЯ (Здесь основные изменения) ---
    const handleSendMessage = async (text) => {
        if (!text.trim() || isProcessing) return;

        let currentChatId = activeChatId;
        let isFirstUserMessage = false; 

        // 1. УСЛОВНОЕ СОЗДАНИЕ ЧАТА
        if (!currentChatId) {
            const newChat = { id: generateId(), title: "...", messages: [] }; 
            currentChatId = newChat.id;
            setChats(prevChats => [newChat, ...prevChats]);
            setActiveChatId(currentChatId);
            isFirstUserMessage = true; 
        } else {
            const currentChat = chats.find(c => c.id === currentChatId);
            isFirstUserMessage = currentChat?.messages.length === 1 && currentChat?.messages[0].type === 'bot-text';
        }

        const newUserMessage = { id: generateId(), type: 'user', content: text };
        
        // Добавляем сообщение пользователя + заглушку загрузки
        const loadingMessageId = generateId();
        setChats(prevChats => prevChats.map(chat => 
            chat.id === currentChatId 
                ? { 
                    ...chat, 
                    messages: [...chat.messages, newUserMessage, { id: loadingMessageId, type: 'bot-loading', content: 'Обработка...' }]
                  }
                : chat
        ));
        setIsProcessing(true);

        // 2. ФОРМИРОВАНИЕ ПАЙЛОАДА ДЛЯ OPENAI API
        const systemInstruction = `Ты — эксперт по всем вопросам. Твоя задача — проанализировать запрос пользователя и ответить **ЧИСТЫМ JSON-объектом**.

        1. Если запрос — это **торговая команда** (купить, продать) или запрос данных (котировки, портфель, история, стакан), используй следующую структуру:
        {"type": "TRADE_COMMAND", "data": {"operation": "BUY" | "SELL" | "QUOTE" | "PORTFOLIO" | "CANDLES" | "ORDER_BOOK" | "OTHER_INFO", "ticker": "SBER" | null, "quantity": 10 | null, "price": 170.5 | null}}
        
        2. Если запрос — это **приветствие**, вопрос о тебе, или другой неторговый диалог, используй структуру:
        {"type": "TEXT_RESPONSE", "content": "Твой вежливый и уместный ответ здесь."}

        ВНИМАНИЕ: Всегда используй один из двух форматов. Не добавляй пояснений или Markdown.
        `;
        
        const payload = {
            model: "gpt-4o-mini",
            response_format: { type: "json_object" }, 
            messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: text }
            ]
        };

        // 3. ВЫЗОВ OPENAI API ДЛЯ ПАРСИНГА
        try {
            const response = await fetchWithRetry(OPENAI_API_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            
            const jsonText = result?.choices?.[0]?.message?.content;
            
            let parsedWrapper;
            try {
                // Парсим внешний JSON-объект с полями type и content/data
                const cleanJsonText = jsonText?.replace(/^```json\s*|(?:\r?\n)?\s*```$/g, '');
                parsedWrapper = JSON.parse(cleanJsonText);
            } catch (parseError) { 
                console.error("JSON Parsing Error:", parseError); 
                throw new Error(`Не удалось распарсить JSON. Сырой ответ: ${jsonText?.substring(0, 100)}...`); 
            }

            // 4. ОПРЕДЕЛЕНИЕ ТИПА ОТВЕТА И ЕГО ФОРМИРОВАНИЕ
            let botMessage;
            let newTitle = activeChat.title;
            
            if (parsedWrapper.type === 'TRADE_COMMAND') {
                const commandData = parsedWrapper.data;
                
                // *** НОВЫЙ ПОЛНЫЙ JSON-ОБЪЕКТ ДЛЯ ОТОБРАЖЕНИЯ ***
                // Имитируем старую структуру: "action": "TRADE_ORDER"
                const fullCommandPayload = {
                    action: "TRADE_ORDER",
                    data: commandData
                };
                
                // Ответ для команды (JSON-код)
                botMessage = {
                    id: generateId() + 1,
                    type: 'bot-code',
                    content: JSON.stringify(fullCommandPayload, null, 2), // <-- ТЕПЕРЬ ОТОБРАЖАЕМ ПОЛНЫЙ ОБЪЕКТ
                    explanation: `✅ Команда успешно распарсена в JSON-запрос для Finam API:`
                };
                
                // Автоматическое переименование чата
                if (isFirstUserMessage && commandData.operation) {
                    const op = commandData.operation;
                    const ticker = commandData.ticker || 'Запрос';
                    
                    if (op === 'BUY' || op === 'SELL') {
                        newTitle = `${op} ${ticker}`;
                    } else {
                        // Используем operation, например, QUOTE SBER
                        newTitle = `${op} ${ticker}`.substring(0, 30); 
                    }
                }

            } else if (parsedWrapper.type === 'TEXT_RESPONSE') {
                
                // Ответ для диалога (простой текст)
                botMessage = {
                    id: generateId() + 1,
                    type: 'bot-text',
                    content: parsedWrapper.content
                };
                
                // Переименование чата для диалога
                if (isFirstUserMessage) {
                   newTitle = text.substring(0, 30) + (text.length > 30 ? '...' : '');
                }

            } else {
                throw new Error(`Неизвестный тип ответа от AI: ${parsedWrapper.type}. Проверьте системный промпт.`);
            }

            // 5. ОБНОВЛЕНИЕ СОСТОЯНИЯ
            setChats(prevChats => prevChats.map(chat => {
                if (chat.id === currentChatId) {
                    // Удаляем заглушку и добавляем реальный ответ
                    const updatedMessages = chat.messages
                        .filter(msg => msg.id !== loadingMessageId)
                        .concat(botMessage);

                    return { ...chat, messages: updatedMessages, title: newTitle };
                }
                return chat;
            }));

        } catch (error) {
            console.error("Ошибка при выполнении API запроса:", error);
            
            // Сообщение об ошибке (используем префикс ❌ для обработки в ChatInterface)
            const errorMessage = {
                id: generateId() + 1,
                type: 'bot-text',
                content: `❌ Произошла ошибка при обработке запроса: ${error.message}. Пожалуйста, убедитесь, что ваш API-ключ действителен и что запрос сформулирован как торговая команда.`
            };

            setChats(prevChats => prevChats.map(chat => {
                    if (chat.id === currentChatId) {
                        // Удаляем заглушку и добавляем сообщение об ошибке
                        const updatedMessages = chat.messages
                            .filter(msg => msg.id !== loadingMessageId)
                            .concat(errorMessage);
                        return { ...chat, messages: updatedMessages };
                    }
                    return chat;
            }));

        } finally {
            setIsProcessing(false);
        }
    };


    return (
        <div className="app-container">
            <Sidebar 
                chats={chats} 
                activeChatId={activeChat.id}
                onSelectChat={setActiveChatId}
                onNewChat={handleNewChat}
                onDeleteChat={handleDeleteChat}
                onClearHistory={handleClearChat}
                onExampleClick={handleSendMessage}
                
                // ПРОПСЫ ДЛЯ РЕЖИМА ВЫБОРА
                isSelectionMode={isSelectionMode}
                selectedChatIds={selectedChatIds}
                onToggleSelectChat={handleToggleSelectChat}
                onDeleteMultiple={handleDeleteMultiple}
                onCancelSelection={() => {
                    setIsSelectionMode(false);
                    setSelectedChatIds(new Set());
                }}
            />
            
            <div className="flex-col flex-1"> 
                <Header 
                    activeChatTitle={activeChat.title} 
                    onSelectMode={setIsSelectionMode}
                    onClearAllHistory={handleClearAllHistory}
                />
                <ChatInterface 
                    messages={displayMessages} 
                    onSend={handleSendMessage} 
                    isProcessing={isProcessing}
                />
            </div>
        </div>
    );
}

export default App