import requests
from pathlib import Path
import os
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# загружаем .env
load_dotenv(BASE_DIR / ".env")

# LLM
LLM_API_KEY = os.getenv("LLM_API_KEY")

def query_llm(prompt: str):
    """
    Отправка запроса к OpenRouter и получение ответа.
    """
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {LLM_API_KEY}",
        "Content-Type": "application/json",
    }
    data = {
        "model": "openrouter/auto",  # OpenRouter автоматически выберет подходящую модель
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7,
        "max_tokens": 1000,
        "top_p": 1,
        "frequency_penalty": 0,
        "presence_penalty": 0,
    }

    response = requests.post(url, headers=headers, json=data)
    response.raise_for_status()  # Вызывает исключение при ошибке HTTP
    return response.json()["choices"][0]["message"]["content"]
