# apps/core/views.py
import json
import re

from django.conf import settings
from django.core.mail import send_mail
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from apps.core.models import NotifyEmail


def coming_soon(request):
    """Render the coming soon page"""
    return render(request, 'coming_soon.html')

@csrf_exempt
@require_http_methods(["POST"])
def subscribe_email(request):
    """Handle email subscription for early access"""
    try:
        data = json.loads(request.body)
        email = data.get('email', '').strip()

        # Basic email validation
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            return JsonResponse({
                'success': False,
                'message': 'Please enter a valid email address.'
            }, status=400)

        # Save the email to the database
        try:
            notify_email = NotifyEmail(email=email)
            notify_email.save()
        except Exception as e:
            print(f"Database error: {str(e)}")
            return JsonResponse({
                'success': False,
                'message': 'Failed to save email. Please try again.'
            }, status=500)

        # Send confirmation email
        try:
            send_mail(
                subject='Welcome to Pragati Education IELTS Preparation',
                message=f'''
                Dear Student,

                Thank you for your interest in our IELTS Preparation System!

                We're excited to have you on board. You'll be among the first to know when we launch our comprehensive IELTS preparation platform.

                What to expect:
                • Comprehensive practice tests for all four skills
                • AI-powered speaking practice
                • Detailed performance analytics
                • Expert tips and strategies
                • Personalized study plans

                We'll notify you as soon as we're ready to launch!

                Best regards,
                The Pragati Education Team
                ''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
        except Exception as e:
            print(f"Email sending failed: {str(e)}")
            # Still return success since email is saved
            return JsonResponse({
                'success': True,
                'message': 'Thank you! We\'ll notify you when we launch.'
            })

        return JsonResponse({
            'success': True,
            'message': 'Thank you! We\'ll notify you when we launch.'
        })

    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Invalid request format.'
        }, status=400)

    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return JsonResponse({
            'success': False,
            'message': 'Something went wrong. Please try again.'
        }, status=500)