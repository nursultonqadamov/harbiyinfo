from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView


class LoginView(TokenObtainPairView):
    """JWT login, rate-limited per client IP to slow password guessing."""

    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'login'


class MeView(APIView):
    """Tells the Next.js admin DAL whether the JWT it's holding still
    belongs to a staff (CMS-admin) user."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'username': request.user.username,
            'is_staff': request.user.is_staff,
        })
