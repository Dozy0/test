
from django.http import Http404
from django.shortcuts import render


from django.shortcuts import get_object_or_404, render
from notification.models import Notification

# Create your views here.

def show_notification(request, notification_id):
    n = get_object_or_404(Notification, pk=notification_id)
    return render(request, 'account_summary', {'notification':n})









#
# def delete_notification(request, notification_id):
#     pass
    # n = Notification.objects.get(id=notification_id)
    # n.viewed = True
    # n.save()

    # # return HttpResponseRedirect('account_summary')








