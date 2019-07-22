from django.contrib import admin

from .models import Diposit, Withdrawal, Interest, Transfer_fund
# Register your models here.

admin.site.register(Diposit)
admin.site.register(Withdrawal)
admin.site.register(Interest)
admin.site.register(Transfer_fund)