import requests

url = "http://127.0.0.1:8000/api/chat/"
payload = {"text": "Сколько сейчас стоит акция сбера?"}
headers = {"Content-Type": "application/json"}

response = requests.post(url, json=payload, headers=headers)
print(response.json())
