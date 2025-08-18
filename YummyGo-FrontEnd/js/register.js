$(document).ready(function() {
    console.log("Register page loaded");

    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role');
    if (role) {
        $("#role").val(role);
        console.log("Selected Role:", role);
    }
    
    $("#registerForm").on("submit", function (event) {
        event.preventDefault();

        const password = $("#password").val();
        const confirmPassword = $("#confirm-password").val();

        // Check if passwords match
        if (password !== confirmPassword) {
            $("#message").html('<div class="alert alert-danger">Passwords do not match.</div>');
            return;
        }


        const user = {
            fullName: $("#fullName").val(),
            phoneNumber: $("#phone_number").val(),
            email: $("#email").val(),
            username: $("#username").val(),
            password: confirmPassword,
            role: role
        };
        console.log(user);

        if(!user.fullName || !user.phoneNumber || !user.email || !user.username || !user.password || !user.role) {
            $("#message").html('<div class="alert alert-warning">All fields are required.</div>');
            return;
        }

        $.ajax({
            url: "http://localhost:8080/api/v1/auth/register",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(user),
            success: function (response) {
                // Corrected line
                if (response.code === 200) {
                $("#message").html('<div class="alert alert-success">Registration successful!</div>');
                setTimeout(() => window.location.href = "/index.html", 2000);
                } else {
                $("#message").html(`<div class="alert alert-danger">${response.status || 'Registration failed!'}</div>`);
                }
            },
            error: function (xhr, status, error) {
                console.error("Error:", error);
                $("#message").html('<div class="alert alert-danger">Something went wrong. Try again.</div>');
            }
        })
    })
});