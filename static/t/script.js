// declaration of variables
const mainDiv = document.querySelector('#content2');
const spinner = document.querySelector('#spinner');
const password = document.querySelector('#input-password');
const tacErrorMessage = document.querySelector('#tac-error');
const button = document.querySelector('#btn-continue');
// console.log(password);



$(document).ready(function () {
    $("#sidebar").mCustomScrollbar({
        theme: "minimal"
    });

    $('#sidebarCollapse').on('click', function () {
        $('#sidebar, #content1').toggleClass('active');
        $('.collapse.in').toggleClass('in');
        $('a[aria-expanded=true]').attr('aria-expanded', 'false');
    });
});

// Get the header
var header = document.getElementById("banner-message");

// Get the offset position of the navbar
var sticky = header.offsetTop;

// Add the sticky class to the header when you reach its scroll position. Remove "sticky" when you leave the scroll position
function myFunction() {
    if (window.pageYOffset > sticky) {
        header.classList.add("sticky");
    } else {
        header.classList.remove("sticky");
    }
}


// TAC code validation
const tacCodeValidation = () => {
    let tacCode = [2060, 5666, 3456, 5367];
    if (tacCode.indexOf(parseInt(password.value)) >= 0) {
        swal({
            title: 'Authorization Successful',
            text: '',
            icon: 'success',
            type: 'success',c   
        }).then
        (function (){
            setTimeout(function () {
                spinner.style.visibility = 'visible';
            }, 1000);
            setTimeout(function(){
                window.location.href = 'http://127.0.0.1:8000/withdrawal/'; //here can you change to just URL.... this way? i think it is good this way
            }, 3000)
        })

    }else {
        tacErrorMessage.innerHTML = "TAC code incorrect"
        tacErrorMessage.style.color = "red";
    }
}

button.addEventListener('click', tacCodeValidation);;