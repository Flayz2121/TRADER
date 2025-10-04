# chat/views.py
from pathlib import Path
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests
from .serializers import UserQuerySerializer, StockResponseSerializer
from dotenv import load_dotenv
import os

BASE_DIR = Path(__file__).resolve().parent.parent

# загружаем .env
load_dotenv(BASE_DIR / ".env")

# LLM
LLM_API_KEY = os.getenv("LLM_API_KEY")

# Finam
FINAM_ACCOUNT_ID = os.getenv("FINAM_ACCOUNT_ID")
FINAM_API_KEY = os.getenv("FINAM_API_KEY")

FINAM_AUTH_URL = "https://api.finam.ru/v1/sessions"
FINAM_QUOTE_URL_TEMPLATE = "https://api.finam.ru/v1/assets/{symbol}/params"


def get_finam_jwt(secret: str) -> str:
    response = requests.post(FINAM_AUTH_URL, json={"secret": secret})
    response.raise_for_status()
    return response.json()["token"]


def llm_text_to_json(text: str) -> dict:
    text = text.lower()
    if "сбер" in text:
        return {"action": "get_price", "symbol": "SBER"}
    raise ValueError("Не удалось определить действие")


def llm_json_to_text(json_data: dict) -> str:
    price = json_data.get("price")
    symbol = json_data.get("symbol")
    return f"Текущая цена акции {symbol}: {price} руб."


def get_stock_price(jwt_token: str, symbol: str):
    headers = {"Authorization": jwt_token}
    response = requests.get(f"https://api.finam.ru/v1/assets/{symbol}@MISX/params?account_id={FINAM_ACCOUNT_ID}", headers=headers)
    response.raise_for_status()
    return response.json()


class ChatAPIView(APIView):
    def post(self, request):
        serializer = UserQuerySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        text = serializer.validated_data["text"]

        try:
            json_request = llm_text_to_json(text)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        jwt_token = get_finam_jwt(FINAM_API_KEY)
        stock_data = get_stock_price(jwt_token, json_request["symbol"])

        # Для Finam API по этой ссылке цена может быть в 'lastPrice' или в 'params'
        last_price = stock_data.get("lastPrice") or stock_data.get("params", {}).get("lastPrice", "неизвестно")

        response_text = llm_json_to_text({
            "symbol": json_request["symbol"],
            "price": last_price
        })

        return Response(StockResponseSerializer({"response_text": response_text}).data)
