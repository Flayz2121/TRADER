from .llm_api import query_llm
from .finam_api import get_asset, get_accounts, place_order
import json

def handle_user_message(message: str):
    system_instruction = """
Ты — эксперт по анализу запросов трейдеров. Твоя задача — проанализировать запрос пользователя и ответить ЧИСТЫМ JSON-объектом.

        1. Если запрос — это торговая команда (купить, продать) или запрос данных (котировки, портфель, история, стакан), используй следующую структуру:
        {"type": "TRADE_COMMAND", "data": {"operation": "BUY" | "SELL" | "QUOTE" | "PORTFOLIO" | "CANDLES" | "ORDER_BOOK" | "OTHER_INFO", "ticker": "SBER" | null, "quantity": 10 | null, "price": 170.5 | null}}
        
        2. Если запрос — это приветствие, вопрос о тебе, или другой неторговый диалог, используй структуру:
        {"type": "TEXT_RESPONSE", "content": "Твой вежливый и уместный ответ здесь."}

        ВНИМАНИЕ: Всегда используй один из двух форматов. Не добавляй пояснений или Markdown.
"""

    prompt = f"System: {system_instruction}\nUser: {message}"
    llm_response = query_llm(prompt)

    try:
        parsed = json.loads(llm_response)
    except json.JSONDecodeError:
        return {"type": "TEXT_RESPONSE", "content": f"Ошибка LLM: {llm_response}"}

    if parsed.get("type") == "TRADE_COMMAND":
        data = parsed.get("data", {})
        op = data.get("operation")
        ticker = data.get("ticker")
        qty = data.get("quantity")
        price = data.get("price")

        # QUOTE -> get asset info (and price)
        if op == "QUOTE":
            if not ticker:
                return {"type": "TEXT_RESPONSE", "content": "Ticker is required for QUOTE."}
            res = get_asset(ticker)
            if res is None or "error" in res:
                return {"type": "TEXT_RESPONSE", "content": f"Ошибка Finam: {res.get('error') if res else 'no response'}"}
            # формируем понятный ответ
            # В зависимости от структуры res, надо вытащить цену (например res['last_price'] или res['price'])
            # В документации / примере в скриншоте есть только метаданные; если цена в другом эндпоинте - используем нужный.
            # Здесь возвращаем весь ответ в data
            data.update({"finam": res})
            return {"type": "TRADE_COMMAND", "data": data}

        # BUY / SELL
        if op in ("BUY", "SELL"):
            if not ticker or not qty:
                return {"type": "TEXT_RESPONSE", "content": "Ticker and quantity required for BUY/SELL."}
            res = place_order(ticker, qty, operation=op, price=price)
            if "error" in res:
                return {"type": "TEXT_RESPONSE", "content": f"Ошибка Finam: {res['error']}"}
            return {"type": "TRADE_COMMAND", "data": {"operation": op, "order_result": res}}

    return parsed
