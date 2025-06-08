$('#signup-btn').on('click', function() {
    console.log('signUp clicked');

    var fName = $('#fName').val();
    var lName = $('#lName').val();
    var email = $('#email').val();
    var phone = $('#phone').val();
    var password = $('#password').val();

    $.ajax({
       method: 'POST',
       url: '',
       contentType: "application/json",
       data: JSON.stringify({
           uFname : fName,
           uLName : lName,
           uEmail : email,
           uPhone : phone,
           uPassword: password,
       }) ,
        success: function (response) {
           console.log(response);

           if (response.status === 200) {
               alert('User successfully created');
               window.location.href = '../pages'
           } else {
               alert('Error: ' + response.status);
           }
        }
    });
});