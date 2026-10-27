"""
Uzbek-language wrappers around Django's built-in password validators.

Django ships no Uzbek translation catalog for django.contrib.auth, so with
LANGUAGE_CODE='uz' these still render in English despite every other error
message on the site being Uzbek. Each validator's actual check logic
(length count, common-password list lookup, similarity ratio, digit check)
is inherited unchanged -- only get_error_message()/get_help_text() are
overridden, so behavior is identical to Django's originals.
"""
from django.contrib.auth.password_validation import (
    CommonPasswordValidator as _CommonPasswordValidator,
)
from django.contrib.auth.password_validation import (
    MinimumLengthValidator as _MinimumLengthValidator,
)
from django.contrib.auth.password_validation import (
    NumericPasswordValidator as _NumericPasswordValidator,
)
from django.contrib.auth.password_validation import (
    UserAttributeSimilarityValidator as _UserAttributeSimilarityValidator,
)


class MinimumLengthValidator(_MinimumLengthValidator):
    def get_error_message(self):
        return f"Parol kamida {self.min_length} ta belgidan iborat bo'lishi kerak."

    def get_help_text(self):
        return self.get_error_message()


class UserAttributeSimilarityValidator(_UserAttributeSimilarityValidator):
    def get_error_message(self):
        return "Parol shaxsiy ma'lumotlaringizga (ism, familiya, email) juda o'xshab ketmasligi kerak."

    def get_help_text(self):
        return "Parolingiz ismingiz, familiyangiz yoki emailingizga o'xshab ketmasligi kerak."


class CommonPasswordValidator(_CommonPasswordValidator):
    def get_error_message(self):
        return "Bu parol juda oddiy va osongina topiladigan."

    def get_help_text(self):
        return "Parolingiz keng tarqalgan/oddiy parol bo'lmasligi kerak."


class NumericPasswordValidator(_NumericPasswordValidator):
    def get_error_message(self):
        return "Parol faqat raqamlardan iborat bo'lmasligi kerak."

    def get_help_text(self):
        return self.get_error_message()
