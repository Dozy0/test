from django.db.models import Sum
from django.shortcuts import render

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
