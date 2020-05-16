/*******************************************************************************

	
	

*******************************************************************************/

$(function () {
    if (!IsIE8Browser()) {

    var pull = $('#pull');
    menu = $('#nav ul');

    menuHeight = menu.height();

    $(pull).on('click', function (e) {
        e.preventDefault();
        menu.slideToggle();
    });

    $(window).resize(function () {
        var w = $(window).width();
        if (w > 320 && menu.is(':hidden')) {
            menu.removeAttr('style');
        }

    

    });

  }
});


function IsIE8Browser() {    var rv = -1;    var ua = navigator.userAgent;    var re = new RegExp("Trident\/([0-9]{1,}[\.0-9]{0,})");    if (re.exec(ua) != null) {        rv = parseFloat(RegExp.$1);    }    return (rv == 4);}
		