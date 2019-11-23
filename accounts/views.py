from django.contrib import messages
from django.contrib.auth import (
    authenticate,
    login,
    logout,
)
from django.contrib.auth.decorators import login_required
from django.http import Http404
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.forms import PasswordChangeForm
from django.core.mail import send_mail
from django.conf import settings


from .forms import (
    UserLoginForm, UserRegistrationForm,
    AccountDetailsForm, UserAddressForm,
)
from .models import User


def register_view(request):
    if request.user.is_authenticated:
        return redirect("home")
    else:
        user_form = UserRegistrationForm(
            request.POST or None,
        )
        account_form = AccountDetailsForm(
            request.POST or None,
            request.FILES or None
        )
        address_form = UserAddressForm(
            request.POST or None
        )

        if user_form.is_valid() and account_form.is_valid() and address_form.is_valid():
            user = user_form.save(commit=False)
            account_details = account_form.save(commit=False)
            address = address_form.save(commit=False)
            password = user_form.cleaned_data.get("password1")
            user.set_password(password)
            user.save()
            account_details.user = user
            account_details.save()
            address.user = user
            address.save()
            new_user = authenticate(
                account_no=user.account_no, password=password
            )
            login(
                request, new_user, backend='accounts.backends.AccountNoBackend'
            )
            messages.success(
                request,
                '''Thank You For Creating A Bank Account {}.
                Your Account Number is {}, Please use this number to login
                '''.format(new_user.full_name, new_user.account_no))
            # subject = "thank you for signing up"
            # from_email= settings.EMAIL_HOST_USER
            # to_email = [user.email]
            # reg_message ="""Welcome to my Banking Application"""
            # send_mail(subject=subject, from_email=from_email,recipient_list=to_email, message=reg_message,fail_silently=False)
        context = {
            "title": "Create a Bank Account",
            "user_form": user_form,
            "account_form": account_form,
            "address_form": address_form,
        }

        return render(request, "accounts/register_form.html", context)


def login_view(request):
    if request.user.is_authenticated:
        return redirect("account_summary")
    else:
        form = UserLoginForm(request.POST or None)

        if form.is_valid():
            account_no = form.cleaned_data.get("account_no")
            password = form.cleaned_data.get("password")
            # authenticate with Account No & Password
            user = authenticate(account_no=account_no, password=password)
            login(request, user, backend='accounts.backends.AccountNoBackend')
            messages.success(request, 'Welcome, {}!' .format(user.full_name))
            return redirect("account_summary")

        context = {"form": form,
                   "title": "Load Account Details",
                   }

        return render(request, "accounts/form.html", context)


def logout_view(request):
    if not request.user.is_authenticated:
        return redirect("accounts:login")
    else:
        logout(request)
        return redirect("home")


send_mail(
    'Subject here',
    'Here is the message.',
    'info@bank.com',
    ['dozyamadi9@gmail.com'],
    fail_silently=False,
)