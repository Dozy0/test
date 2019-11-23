from django.db.models import Sum
from django.shortcuts import render, redirect
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib import messages
from django.contrib.auth.decorators import login_required


from transactions.models import Diposit, Withdrawal, Interest, Transfer_fund



def home(request):
    if not request.user.is_authenticated:
        return render(request, "core/home.html", {})

    else:
        user = request.user
        deposit = Diposit.objects.filter(user=user)
        deposit_sum = deposit.aggregate(Sum('amount'))['amount__sum']
        withdrawal = Withdrawal.objects.filter(user=user)
        withdrawal_sum = withdrawal.aggregate(Sum('amount'))['amount__sum']
        interest = Interest.objects.filter(user=user)
        interest_sum = interest.aggregate(Sum('amount'))['amount__sum']
        transfer_fund = Transfer_fund.objects.filter(user=user)

        context = {
                    "user": user,
                    "deposit": deposit,
                    "deposit_sum": deposit_sum,
                    "withdrawal": withdrawal,
                    "withdrawal_sum": withdrawal_sum,
                    "interest": interest,
                    "interest_sum": interest_sum,
                    "transfer_fund": transfer_fund,
                  }

        return render(request, "core/transactions.html", context)


def about(request):
    return render(request, "core/about.html", {})



def transfer(request):
    return render(request, "core/transfer.html", {})

def index(request):
    return render(request, "core/index.html", {})

def transfer_pin(request):
    return render(request, "core/transfer_pin.html", {})

def account_summary(request):
    return render(request, "core/account_summary.html", {})

def transfer_auth(request):
    return render(request, "core/transfer_auth.html", {})

def loginsuccessful(request):
    return render(request, "core/loginsuccessful.html", {})






@login_required
def change_password(request):
    if request.method == 'POST':
        form = PasswordChangeForm(request.user, request.POST)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)  # Important!
            messages.success(request, 'Your password was successfully updated!')
            return redirect('change_password')
        else:
            messages.error(request, 'Please correct the error below.')
    else:
        form = PasswordChangeForm(request.user)
    return render(request, 'core/change_password.html', {
        'form': form
    })