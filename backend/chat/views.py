from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .llm_service import handle_user_message


class ChatAPIView(APIView):
    def post(self, request):
        user_message = request.data.get("message")
        if not user_message:
            return Response({"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            response_json = handle_user_message(user_message)
            return Response(response_json)
        except Exception as e:
            return Response({"text": f"Ошибка сервиса: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
