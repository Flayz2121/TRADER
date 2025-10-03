// src/components/Header.jsx - ЧИСТЫЙ CSS
import React from 'react';
import { FiArrowUpRight } from 'react-icons/fi';

const Header = ({ activeChatTitle }) => {
  return (
    <header className="header">
      <div>
        <h1 className="text-2xl font-bold">{activeChatTitle || "AI Ассистент Трейдера"}</h1>
        <p className="header-subtitle">Интеллектуальный помощник для работы с Finam TradeAPI</p>
      </div>
      <button className="header-deploy-button">
        <span>Deploy</span>
        <FiArrowUpRight size={16} />
      </button>
    </header>
  );
};

export default Header;