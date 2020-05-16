
from django.conf.urls import url

from notification.views import show_notification,delete_notification

from. import views
# from django.conf.urls import path




# urlpatterns=[
#       url(r'^show/$',show_notification, name='show_notification'),
#       url(r'^delete/$',delete_notification,name='delete_notification')

#
urlpatterns = [
    url(r'^(?P<notification_id>[0-9]+)/$', views.show_notification, name='show_notification'),
    url(r'^(?P<notification_id>[0-9]+)/$', views.delete_notification, name='delete_notification'),
]