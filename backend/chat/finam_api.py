import requests
from django.conf import settings

API_KEY = settings.FINAM_API_KEY
BASE_URL = "https://api.finam.ru/v1"


def get_quote(symbol: str, account_id: str = None):
    url = f"{BASE_URL}/assets/{symbol}"
    params = {}
    if account_id:
        params["account_id"] = account_id

    headers = {"Authorization": f"Bearer {API_KEY}"}

    try:
        r = requests.get(url, headers=headers, params=params)
        r.raise_for_status()
        return r.json()
    except requests.exceptions.RequestException as e:
        print(f"Ошибка при получении котировки: {e}")
        return None


def buy_stock(ticker: str, quantity: int, price: float = None):
    """
    Отправка заявки на покупку.
    """
    url = f"{BASE_URL}/orders"
    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
    payload = {
        "operation": "BUY",
        "symbol": ticker,
        "quantity": quantity,
        "price": price,
    }

    r = requests.post(url, headers=headers, json=payload)
    r.raise_for_status()
    return r.json()


def sell_stock(ticker: str, quantity: int, price: float = None):
    """
    Отправка заявки на продажу.
    """
    url = f"{BASE_URL}/orders"
    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
    payload = {
        "operation": "SELL",
        "symbol": ticker,
        "quantity": quantity,
        "price": price,
    }

    r = requests.post(url, headers=headers, json=payload)
    r.raise_for_status()
    return r.json()
