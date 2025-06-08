$('#signup-btn').on('click', function() {
    console.log('signUp clicked');

    var fName = $('#fName').val();
    var lName = $('#lName').val();
    var email = $('#email').val();
    var phone = $('#phone').val();
    var password = $('#password').val();

    $.ajax({
       method: 'POST',
       url: 'http://localhost:8080/JavaEE_Final_Project_EMS_Backend_Web_exploded//api/v1/signup',
       contentType: "application/json",
       data: JSON.stringify({
           uFname : fName,
           uLName : lName,
           uEmail : email,
           uPhone : phone,
           uPassword: password
       }) ,
        success: function (response) {
           console.log(response);

           if (response.status === "success") {
               alert('User successfully created');
               window.location.href = '../pages/signIn.html';
           } else {
               alert('Error: ' + response.status);
           }
        }
    });
});