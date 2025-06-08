$(document).ready(function() {
    var email=localStorage.getItem('email');
    if (email) {
        // If no email is found in localStorage, redirect to signin page
        window.location.href = 'dashboard.html';
    }
});

$('#sign-in-btn').on('click', function(){
    console.log('signIn clicked!');

    var email = $('#email').val();
    var password = $('#password').val();

    $.ajax({
       method: 'POST',
       url: 'http://localhost:8080/JavaEE_Final_Project_EMS_Backend_Web_exploded//api/v1/signin',
       contentType: 'application/json',
       data: JSON.stringify({
           uemail: email,
           upassword: password
       }),
        success: function(response){
            console.log(response);

            if(response.status === "success"){
                localStorage.setItem('email', email);
                window.location.href = '../pages/dashboard.html';
            } else{
                alert('Error: ' + response.status);
            }
        },
        error: function () {
           alert('Error: Incorrect email or password');
        }
    });

    $('#email').val('');
    $('#password').val('');

});