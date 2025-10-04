import os
import django

# Указываем, где лежат настройки Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from chat.finam_api import get_quote, buy_stock, sell_stock

def main():
    print("=== ТЕСТ FINAM API ===")

    # 1. Проверим котировку
    try:
        quote = get_quote("SBER", 1984713)
        print("Котировка:", quote)
    except Exception as e:
        print("Ошибка при получении котировки:", e)

    # 2. Тестовая покупка (может не пройти, если у API включен только sandbox)
    try:
        order = buy_stock("SBER", 1)
        print("Покупка:", order)
    except Exception as e:
        print("Ошибка при покупке:", e)

    # 3. Тестовая продажа
    try:
        order = sell_stock("SBER", 1)
        print("Продажа:", order)
    except Exception as e:
        print("Ошибка при продаже:", e)


if __name__ == "__main__":
    main()
