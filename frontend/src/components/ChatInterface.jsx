import React, { useRef, useEffect, useState } from 'react';
import ChatInput from './ChatInput'; 
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ReferenceLine, Label } from 'recharts';


// --- Кастомный Tooltip для графика ---
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const formattedDate = new Date(label).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });

        return (
            <div className="custom-tooltip bg-gray-800 p-3 rounded-lg border border-sky-500 shadow-2xl backdrop-blur-sm bg-opacity-90">
                <p className="label text-gray-100 font-semibold mb-1">{`${formattedDate}`}</p>
                <p className="intro text-sky-400 font-bold">{`Цена: ${payload[0].value.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}`}</p>
            </div>
        );
    }
    return null;
};


// --- Компонент для графика PriceChart ---
const PriceChart = ({ data, title }) => {
    const dateFormatter = (date) => {
        if (!date) return '';
        const parts = date.split('-');
        if (parts.length === 3) {
            return `${parts[2]}.${parts[1]}`;
        }
        return date;
    };

    const average = data.reduce((total, item) => total + item.price, 0) / data.length;

    const lastIndex = data.length - 1;

    const CustomDot = (props) => {
        const { cx, cy, index } = props; 

        if (index === lastIndex) {
            return (
                <svg x={cx - 6} y={cy - 6} width={12} height={12} fill="#14b8a6" viewBox="0 0 12 12" key={`dot-${index}`}>
                    <circle cx="6" cy="6" r="5.5" stroke="#0f766e" strokeWidth="2" fill="white" opacity={0.8} />
                    <circle cx="6" cy="6" r="4" fill="#14b8a6" /> 
                </svg>
            );
        }
        return null; 
    };


    return (
        <div className="chart-container p-6 bg-gray-900 rounded-xl shadow-2xl border border-gray-800 transition duration-300 hover:border-sky-500/50">
            <h3 className="text-white text-xl font-extrabold mb-6 tracking-wide border-b border-gray-700/50 pb-2">{title}</h3>
            <ResponsiveContainer width={800} height={300}>
                <LineChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#0284c7" stopOpacity={0.1}/>
                        </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="5 5" stroke="#374151" opacity={0.7} vertical={false} />

                    <XAxis
                        dataKey="date"
                        stroke="#9ca3af"
                        tickFormatter={dateFormatter}
                        style={{ fontSize: '12px' }}
                        tickLine={{ stroke: '#0080ffff' }}
                        axisLine={{ stroke: '#ffffffff' }}
                        padding={{ left: 20, right: 20 }}
                        minTickGap={30}
                    />
                    <YAxis
                        domain={['dataMin - 10', 'dataMax + 10']} 
                        stroke="#9ca3af"
                        style={{ fontSize: '12px' }}
                        tickLine={{ stroke: '#0069fbff' }}
                        axisLine={{ stroke: '#ffffffff' }}
                        tickFormatter={(value) => `₽${Math.round(value).toLocaleString('ru-RU')}`}
                    />

                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#4f46e5', strokeWidth: 1, strokeDasharray: '2 2' }} />

                    <ReferenceLine y={average} stroke="#f59e0b" strokeDasharray="6 3" strokeWidth={2}>
                         <Label 
                            value={`Среднее: ₽${average.toFixed(2)}`} 
                            position="top" 
                            fill="#f59e0b" 
                            fontSize={13} 
                            fontWeight="bold"
                            style={{ textShadow: '0 0 5px rgba(245, 158, 11, 0.5)' }}
                        />
                    </ReferenceLine>

                    <Area type="monotone" dataKey="price" stroke={false} fill="url(#colorPrice)" fillOpacity={1} />

                    <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#38bdf8"
                        strokeWidth={3}
                        dot={<CustomDot />}
                        activeDot={{ r: 6, stroke: '#38bdf8', strokeWidth: 2, fill: '#e0f2fe' }}
                        animationDuration={800}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};


// --- Вспомогательные компоненты сообщений ---

const UserMessage = ({ content }) => (
    <div className="message user-message flex items-start gap-3 p-4 bg-sky-900/40 rounded-t-2xl rounded-bl-2xl rounded-br-md max-w-3xl ml-auto shadow-lg border border-sky-800">
        <span className="text-sky-400 font-extrabold text-xl">👤</span> 
        <p className="text-gray-100 whitespace-pre-wrap">{content}</p>
    </div>
);

const BotCodeMessage = ({ content, explanation }) => (
    <div className="message bot-code flex flex-col gap-3 p-4 bg-gray-900 rounded-2xl max-w-4xl mr-auto shadow-xl border border-gray-700">
        {explanation && (
            <div className="flex items-center gap-2 text-base font-semibold text-sky-400">
                <span className="text-xl">✨</span>
                <span>{explanation}</span>
            </div>
        )}
        <div className="syntax-highlighter-container rounded-lg overflow-hidden border border-gray-600">
            <pre style={{ margin: 0, padding: '1rem', backgroundColor: '#2d2d2d', color: '#ccc', overflowX: 'auto', borderRadius: '0.5rem' }}>
                <code className="language-jsx">
                    {content}
                </code>
            </pre>
        </div>
    </div>
);

// В этом компоненте сохранено исправление w-full для максимальной ширины графика
const BotChartMessage = ({ content, explanation }) => {
    const { history, title } = content;
    return (
        <div className="message bot-chart flex flex-col gap-3 p-4 bg-gray-900 rounded-2xl mr-auto shadow-xl border border-gray-700 w-full">
            {explanation && (
                <div className="flex items-center gap-2 text-base font-semibold text-sky-400">
                    <span className="text-xl">📊</span>
                    <span>{explanation}</span>
                </div>
            )}
            {history && history.length > 0 ? (
                <PriceChart data={history} title={title} />
            ) : (
                <p className="text-red-400">Нет данных для построения графика.</p>
            )}
        </div>
    );
};

const BotTextMessage = ({ content }) => (
    <div className="message bot-text flex items-start gap-3 p-4 bg-gray-800 rounded-t-2xl rounded-br-2xl rounded-bl-md max-w-3xl mr-auto shadow-lg border border-gray-700">
        <span className="text-green-400 font-extrabold text-xl">🤖</span>
        <p className="text-gray-100 whitespace-pre-wrap">{content}</p>
    </div>
);

const BotLoadingMessage = () => (
    <div className="message bot-text flex items-center gap-3 p-4 bg-gray-800 rounded-xl max-w-3xl mr-auto shadow-lg border border-gray-700">
        <span className="text-blue-400 animate-spin text-xl">🔄</span> 
        <p className="text-gray-400 italic">Обработка запроса...</p>
    </div>
);

const ApiErrorBlock = ({ error }) => {
    const [isOpen, setIsOpen] = useState(false);
    const messageMatch = error.match(/при обработке запроса: (.*)\. Пожалуйста/);
    const primaryMessage = messageMatch ? messageMatch[1] : error;

    return (
        <div className="api-error-block p-4 bg-red-900/50 border border-red-700 rounded-xl text-red-100 shadow-xl">
            <div className="api-error-header flex items-center gap-3 font-bold text-lg mb-2">
                <span className="text-yellow-400 text-xl">⚠️</span>
                <p>Критическая ошибка!</p>
            </div>
            <div className="api-error-details-section">
                <p className="api-error-next-steps font-medium">{primaryMessage}</p>
                <button className="details-toggle-button mt-3 flex items-center gap-1 text-red-300 hover:text-red-100 transition duration-150" onClick={() => setIsOpen(!isOpen)}>
                    Детали API ответа
                    <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-90' : 'rotate-0'}`}>▶️</span> 
                </button>
                {isOpen && <p className="api-error-request-info mt-2 text-sm bg-red-900 p-2 rounded">{error}</p>}
                <p className="api-error-interpretation mt-3 text-sm italic border-t border-red-800 pt-2">
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
            case 'bot-chart':
                return (
                    <div key={message.id} style={style}>
                        <BotChartMessage content={message.content} explanation={message.explanation} />
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
        <div className="chat-interface flex flex-col h-full bg-gray-900">
            <div className="chat-content flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => renderMessage(msg, idx))}
                <div ref={messagesEndRef} />
            </div>
            <div>
                <ChatInput onSend={onSend} isProcessing={isProcessing} />
            </div>
        </div>
    );
};

export default ChatInterface;