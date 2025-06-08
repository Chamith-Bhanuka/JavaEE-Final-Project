$(document).ready(function() {
    var email=localStorage.getItem('email');
    if (!email) {
        // If no email is found in localStorage, redirect to signin page
        window.location.href = 'signin.html';
    }else {
        // If email is found, display it in the dashboard
        //alert('Welcome to the dashboard, ' + email);
        console.log('entering to dashboard');
    }
});

// Function to handle sign out
$('#logout-btn').on('click', function() {
    // Clear the email from localStorage
    localStorage.removeItem('email');

    // Redirect to the signin page
    window.location.href = 'signin.html';
});