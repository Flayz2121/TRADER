# chat/serializers.py
from rest_framework import serializers

class UserQuerySerializer(serializers.Serializer):
    text = serializers.CharField()

class StockResponseSerializer(serializers.Serializer):
    response_text = serializers.CharField()
