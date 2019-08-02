from django.conf.urls import url
from accounts import views


from .views import (
    login_view,
    register_view,
    logout_view,
)
from django.contrib.auth.views import password_reset, password_reset_done


urlpatterns = [
    url(r'^login/$', login_view, name='login'),
    url(r'^register/$', register_view, name='register'),
    url(r'^logout/$', logout_view, name='logout'),
    # url(r'^change-password/$', views.change_password, name='change_password'),
    # url(r'reset-password/$', password_reset, name='reset_password'),
    # url(r'reset-password/done/$', password_reset_done, name='password_reset_done'),
    # url(r'^password/$', views.change_password, name='change_password'),
]
