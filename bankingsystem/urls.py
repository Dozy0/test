"""bankingsystem URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls import url, include
from django.conf.urls.static import static
from django.contrib import admin
# from django.conf.urls import url
from notification.views import show_notification
from notification import views


from core.views import home, about, transfer, index, change_password, transfer_pin, transfer_auth, loginsuccessful,\
    account_summary,profile


urlpatterns = [
    # admin
    url(r'^admin/', admin.site.urls),
    # Accounts
    url(r'^accounts/', include('accounts.urls', namespace='accounts')),
    # url(r'^notification_summary/', views.delete_notification, name='delete_notification'),
    url(r'^notification_summary/', views.show_notification, name='show_notification'),
#     url(r'^notification_summary/', show_notification, name='show_notification'),
#     url(r'^notification_summary/', delete_notification, name='delete_notification'),
# url(r'^notification_summary/(?P<notification_id>[0-9]+)/$', views.delete_notification),
#     url(r'^(?P<notification_id>[0-9]+)/$', views.show_notification, name='show_notification'),
#     url(r'^(?P<notification_id>[0-9]+)/$', views.delete_notification, name='delete_notification'),
    # core
    url(r'^$', home, name='home'),
    url(r'^about/$', about, name='about'),
    url(r'^transfer.html/$', transfer, name='transfer'),
    url(r'^index.html/$', index, name='index'),

    url(r'^change_password.html/$', change_password, name='change_password'),
    url(r'^transfer_pin.html/$', transfer_pin, name='transfer_pin'),
    url(r'^transfer_auth.html/$', transfer_auth, name='transfer_auth'),
    url(r'^loginsuccessful.html/$', loginsuccessful, name='loginsuccessful'),
    url(r'^account_summary/$', account_summary, name='account_summary'),
    url(r'^profile/$', profile, name='profile'),

    # transactions
    url(r'^', include('transactions.urls', namespace='transactions')),
    # patterns('notification.views',
    #          url(r'^show/(?P<notification_id>/+)/$','show_notification'),
    #          url(r'^delete/(?P<notification_id>/+)/$','delete_notification'),
    # )
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)


if settings.DEBUG:
    urlpatterns += static(
        settings.STATIC_URL,
        document_root=settings.STATIC_ROOT
        )
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
        )
