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


const mainDiv = document.querySelector('#content2');
const spinner = document.querySelector('#spinner');
const authPasswordError = document.querySelector('#auth-password-error');
const authPasswordInput = document.querySelector('#auth-password');
const nextButton = document.querySelector('#next-button');


// transfer auth password validation
const authPasswordValidation = () => {
    debugger

    let authPassword = [3450, 7889, 4568, 2345];   // items array
    localStorage.setItem("items", JSON.stringify(authPassword));  // store items array to local storage

    var retrievedData = localStorage.getItem("items"); // retrieve items array from local storage
    var newPassword = JSON.parse(retrievedData);            // cast array values to integers
    let authPasswordInput = document.querySelector('#auth-password'); // selects the input value
    let value = parseInt(authPasswordInput.value);
    if (newPassword.includes(value)){ // checks if input entered exists in the array
        newPassword = newPassword.filter(password => password != value); // returns the remaining values in the array
        localStorage.clear(); // clear local storage
        //newPassword = newPassword.splice(newPassword.indexOf(value), 1);
        // sweet alert
        swal({
            title: 'Transaction Successful',
            text: '',
            icon: 'success',
            type: 'success',
        }).then (function (){
            setTimeout(function () {
                spinner.style.visibility = 'visible';
            }, 1000);
            setTimeout(function(){
                window.location.href = 'http://127.0.0.1:8000/withdrawal/';
            }, 3000)
        })
    } else {
        authPasswordError.innerHTML = "Password is incorrect"
        authPasswordError.style.color = "red";
    }
}


nextButton.addEventListener('click', authPasswordValidation);
// $(function () {
//     $("#datepicker").datepicker({
//         autoclose: true,
//         todayHighlight: true
//     }).datepicker('update', new Date());
// });
