from .llm_api import query_llm
import json

def handle_user_message(message: str):
    """
    Обрабатывает команду пользователя и возвращает структурированный JSON.
    """
    prompt = f"""
Пользователь написал: "{message}"

Ответь в формате JSON с тремя полями:
1. text — краткий текстовый ответ для пользователя
2. visual — если нужно показать график, иначе null
3. actions — список действий для интерфейса, иначе пустой список

Пример:
{{
  "text": "Пример текста",
  "visual": {{"type": "pie", "data": {{"Сбербанк": 50, "Яндекс": 50}}}},
  "actions": [{{"type": "buy", "ticker": "SBER", "quantity": 10}}]
}}

Обязательно верни корректный JSON!
"""

    llm_response = query_llm(prompt)

    try:
        structured_response = json.loads(llm_response)
    except json.JSONDecodeError:
        structured_response = {
            "text": llm_response,
            "visual": None,
            "actions": []
        }

    return structured_response
