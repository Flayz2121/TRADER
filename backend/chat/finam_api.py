import requests
from django.conf import settings

BASE_URL = "https://api.finam.ru/v1"

def _headers():
    return {
        "Authorization": f"Bearer ",
        "Content-Type": "application/json"
    }

def get_accounts():
    """
    Получить список аккаунтов — чтобы узнать account_id.
    """
    url = f"{BASE_URL}/accounts"
    try:
        r = requests.get(url, headers=_headers(), timeout=10)
        r.raise_for_status()
        return r.json()
    except requests.RequestException as e:
        # Вернуть структуру ошибки, не None
        return {"error": f"{e}"}

def get_asset(symbol: str, account_id: str = None):
    """
    GET /v1/assets/{symbol}
    """
    url = f"{BASE_URL}/assets/{symbol}"
    params = {}
    if account_id:
        params["account_id"] = account_id
    elif getattr(settings, "FINAM_ACCOUNT_ID", None):
        params["account_id"] = settings.FINAM_ACCOUNT_ID

    try:
        r = requests.get(url, headers=_headers(), params=params or None, timeout=10)
        r.raise_for_status()
        return r.json()
    except requests.RequestException as e:
        return {"error": f"{e}"}

def place_order(symbol: str, quantity: int, operation: str = "BUY", account_id: str = None, price: float = None):
    """
    POST /v1/orders
    payload example (adjust per Finam docs):
    {
      "account_id": "...",
      "symbol": "SBER",
      "quantity": 1,
      "operation": "BUY",
      "price": 123.45  # optional for market/order types
    }
    """
    url = f"{BASE_URL}/orders"
    acct = account_id or getattr(settings, "FINAM_ACCOUNT_ID", None)
    if not acct:
        return {"error": "account_id is required to place orders."}

    payload = {
        "account_id": acct,
        "symbol": symbol,
        "quantity": quantity,
        "operation": operation.upper()
    }
    if price is not None:
        payload["price"] = price

    try:
        r = requests.post(url, headers=_headers(), json=payload, timeout=10)
        r.raise_for_status()
        return r.json()
    except requests.RequestException as e:
        return {"error": f"{e}"}
