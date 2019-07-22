/*******************************************************************************

	
	

*******************************************************************************/

var Site = {

	/**
	 * Init Function
	 */
	init: function() {
	
		// top navigation current highlight
		//var path = '/'+location.pathname.split('/')[1];
		//$('#menu > li a[href^="'+path+'"]').parent().addClass('current');
		
		var lArr = location.pathname.split('index.php'); 
		var loc = lArr.splice(1,(location.port==9991?3:1)).join('index.php');
		if (loc != '') { 
			$('#menu > li a[href^="/'+loc+'"]').parent().addClass('current');
		}

                //main nav tabs .drop
                $('ul#menu > li > a').addClass("drop");

                //side nav active fix
                $('#leftNav .current').last().addClass('active');


		// copyright year
		$('.copyYear').html(new Date().getFullYear());

	//locations drop down
	    $(function () {
	        $('#header ul li.locations').hover(function () {
	            $('#locationsMenu').show();
	        }, function () {
	            $('#locationsMenu').hide();
	        });
	    });

		// content accordion
		if($('.box-details').length > 0) {
			var allPanels = $('.middle');

			$('.bottom p').on('click', function() {
				if(!($(this).parent().parent().hasClass('expanded'))) {
					allPanels.slideUp().parent().parent().removeClass('expanded');
					$('.bottom p span').text('See Details ▼');
					$('.close').removeClass('close');
					$(this).children('a').addClass('close');
					$(this).children('span').text('Hide Details ▲');
//					$('.excerpt').show();	
//					$(this).parent().parent().find('.excerpt').hide();
					$(this).parent().parent().addClass('expanded').children('.top').find('.middle').slideDown();
				} else {
					$('.bottom p span').text('See Details ▼');
					$('.close').removeClass('close');			
//					$('.excerpt').show();		
					$(this).parent().parent().removeClass('expanded').children('.top').find('.middle').slideUp();
				}
			});

			$('.bottom a').on('click', function() {
				if(!($(this).parent().parent().parent().hasClass('expanded'))) {
					allPanels.slideUp().parent().parent().removeClass('expanded');
					$('.bottom p span').text('See Details ▼');
					$('.close').removeClass('close');
					$(this).addClass('close');
					$(this).parent().children('span').text('Hide Details ▲');
//					$('.excerpt').show();
//					$(this).parent().parent().parent().find('.excerpt').hide();
					$(this).parent().parent().parent().addClass('expanded').children('.top').find('.middle').slideDown();
				} else {
					$('.bottom p span').text('See Details ▼');
					$('.close').removeClass('close');	
//					$('.excerpt').show();		
					$(this).parent().parent().parent().find('.excerpt').show();		
					$(this).parent().parent().parent().removeClass('expanded').children('.top').find('.middle').slideUp();
				}
				return false;
			})
		}

		
		
	}
}


    //FAQ EXPAND COLLAPSE
   // $(function () {
    
   // $('dd').hide();
         

   // $('dt').click( 
        //function() { 
            
          //  var toggle = $(this).nextUntil('dt');
         //   $(this).addClass('arrowClose');
          //  toggle.slideToggle();
            
          //  $('dd').not(toggle).slideUp();
           
        //});

   // });


   //FAQ EXPAND COLLAPSE
$(function () {

    //$('ul.expandMenu li.expand').hide();

    $('ul.expandMenu li.arrowOpen').click(

        function () {
            var toggle = $(this).nextUntil('ul.expandMenu li.arrowOpen');
           
            $(this).toggleClass('arrowClose');
      
            toggle.slideToggle();

           // $('ul.expandMenu li.expand').not(toggle).slideUp();


        });

});   
       

$(document).ready(function() {
	Site.init();
});


//homepage gallery 

$(document).ready(function() {		
	
	//Execute the slideShow
	slideShow();

});

function slideShow() {

	//Set the opacity of all images to 0
	$('#galleryLeft div').css({opacity: 0.0});
	$('#galleryRight div').css({opacity: 0.0});
    $('#mobiSlides div').css({opacity: 0.0});
    	
	//Get the first image and display it (set it to full opacity)
	$('#galleryLeft div:first').css({opacity: 1.0});
	$('#galleryRight div:first').css({opacity: 1.0});
    $('#mobiSlides div:first').css({opacity: 1.0});
	
	//Set the caption background to semi-transparent
	$('#galleryLeft div.imgCaption').css({opacity: 0.8});
	$('#galleryRight div.imgCaption').css({opacity: 0.8});
    $('#mobiSlides div.imgCaption').css({opacity: 0.8});
		 	
	setInterval('gallery()',6700);
	setInterval('gallery2()',7000);
    setInterval('mobiGallery()',7000);
  
}

function gallery() {
	
	//if no IMGs have the show class, grab the first image
	var current = ($('#galleryLeft div.show')?  $('#galleryLeft div.show') : $('#galleryLeft div:first'));

	//Get next image, if it reached the end of the slideshow, rotate it back to the first image
	var next = ((current.next().length) ? ((current.next().hasClass('caption'))? $('#galleryLeft div:first') :current.next()) : $('#galleryLeft div:first'));	

	//Set the fade in effect for the next image, show class has higher z-index
	next.css({opacity: 0.0})
	.addClass('show')
	.animate({opacity: 1.0}, 1000);

	//Hide the current image
	current.animate({opacity: 0.0}, 1000)
	.removeClass('show');

}

function gallery2() {
	
	//if no IMGs have the show class, grab the first image
	var current = ($('#galleryRight div.show')?  $('#galleryRight div.show') : $('#galleryRight div:first'));

	//Get next image, if it reached the end of the slideshow, rotate it back to the first image
	var next = ((current.next().length) ? ((current.next().hasClass('caption'))? $('#galleryRight div:first') :current.next()) : $('#galleryRight div:first'));	
	
	//Set the fade in effect for the next image, show class has higher z-index
	next.css({opacity: 0.0})
	.addClass('show')
	.animate({opacity: 1.0}, 1000);

	//Hide the current image
	current.animate({opacity: 0.0}, 1000)
	.removeClass('show');
	
}

function mobiGallery() {
	//if no IMGs have the show class, grab the first image
    var current = ($('#mobiSlides div.show')?  $('#mobiSlides div.show') : $('#mobiSlides div:first'));

	//Get next image, if it reached the end of the slideshow, rotate it back to the first image
	var next = ((current.next().length) ? ((current.next().hasClass('caption'))? $('#mobiSlides div:first') :current.next()) : $('#mobiSlides div:first'));	
	
	//Set the fade in effect for the next image, show class has higher z-index
	next.css({opacity: 0.0})
	.addClass('show')
	.animate({opacity: 1.0}, 1000);

	//Hide the current image
	current.animate({opacity: 0.0}, 1000)
	.removeClass('show');
	
}