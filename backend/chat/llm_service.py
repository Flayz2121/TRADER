from .llm_api import query_llm
from . import finam_api
import json


def handle_user_message(message: str):
    """
    Анализирует сообщение пользователя через LLM и, если это TRADE_COMMAND,
    выполняет нужное действие через Finam API.
    """
    system_instruction = """
Ты — эксперт по анализу запросов трейдеров. 
Твоя задача — проанализировать запрос пользователя и ответить ЧИСТЫМ JSON-объектом.

1. Если запрос — торговая команда (купить, продать) или запрос данных (котировки, портфель, история, стакан), используй структуру:
{
  "type": "TRADE_COMMAND", 
  "data": {
    "operation": "BUY" | "SELL" | "QUOTE" | "PORTFOLIO" | "CANDLES" | "ORDER_BOOK" | "OTHER_INFO",
    "ticker": "SBER" | null,
    "quantity": 10 | null,
    "price": 170.5 | null
  }
}

2. Если запрос — приветствие, вопрос о тебе, или другой неторговый диалог, используй структуру:
{
  "type": "TEXT_RESPONSE",
  "content": "Твой вежливый и уместный ответ здесь."
}

ВНИМАНИЕ: Всегда используй один из двух форматов. 
Не добавляй пояснений, текста или Markdown.
"""

    prompt = f"""
System: {system_instruction}

User: {message}
"""

    llm_response = query_llm(prompt)

    try:
        structured_response = json.loads(llm_response)
    except json.JSONDecodeError:
        return {"type": "TEXT_RESPONSE", "content": f"Ошибка LLM: {llm_response}"}

    # 🔹 Если это торговая команда → пробуем выполнить через Finam
    if structured_response.get("type") == "TRADE_COMMAND":
        data = structured_response.get("data", {})
        operation = data.get("operation")
        ticker = data.get("ticker")
        quantity = data.get("quantity")
        price = data.get("price")

        try:
            if operation == "QUOTE":
                result = finam_api.get_quote(ticker, quantity)
                return {"type": "TRADE_COMMAND", "data": {**data, **result}}

            elif operation == "BUY":
                result = finam_api.buy_stock(ticker, quantity, price)
                return {"type": "TRADE_COMMAND", "data": result}

            elif operation == "SELL":
                result = finam_api.sell_stock(ticker, quantity, price)
                return {"type": "TRADE_COMMAND", "data": result}

        except Exception as e:
            return {"type": "TEXT_RESPONSE", "content": f"Ошибка Finam API: {str(e)}"}

    return structured_response
