$(document).ready(function () {
  $("#loginForm").on("submit", function (e) {
    e.preventDefault();

    const loginDTO = {
      username: $("#username").val(),
      password: $("#password").val()
    };

    console.log("Login DTO:", loginDTO);

    if (!loginDTO.username || !loginDTO.password) {
      $("#message").html('<div class="alert alert-warning">Please enter both username and password.</div>');
      return;
    }

    const $btn = $("#loginBtn");
    const originalText = $btn.html();
    $btn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging in...');
    
    $.ajax({
      url: "http://localhost:8080/api/v1/auth/login",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(loginDTO),
      complete: function () {
        // Hide spinner after request
        $btn.prop("disabled", false).html(originalText);
      },
      success: function (response) {
        if (response.code === 200) {
          console.log("Login successful", response);

          const token = response.data.accessToken;
          const userRole = response.data.role;
          const userId = response.data.userId; // <-- save userId

          cookieStore.set("token", token);
          sessionStorage.setItem("userId", userId); // instead of localStorage

          if (userRole === "ADMIN") {
            $("#message").html('<div class="alert alert-success">Admin Login successful! Redirecting...</div>');
          } else if (userRole === "CLIENT") {
            $("#message").html('<div class="alert alert-success">CLIENT Login successful! Redirecting...</div>');
          } else if (userRole === "PARTNER") {
            $("#message").html('<div class="alert alert-success">PARTNER Login successful! Redirecting...</div>');
          } else if (userRole === "BUSINESS") {
            $("#message").html('<div class="alert alert-success">BUSINESS Login successful! Redirecting...</div>');
          }

          setTimeout(() => {
            if (userRole === "ADMIN") {
              window.location.href = "/pages/adminOverviweDashboard.html";
            } else if (userRole === "CLIENT") {
              window.location.href = "/pages/mainDashboard.html";
            } else if (userRole === "PARTNER") {
              window.location.href = "/pages/partnerDashboard.html";
            } else if (userRole === "BUSINESS") {
              window.location.href = "/pages/businessDashboard.html";
            }
          }, 1000);
        } else {
          $("#message").html('<div class="alert alert-danger">Invalid credentials. Please try again.</div>');
        }
      },
      error: function (xhr) {
        console.error("Login failed", xhr);

        let errorMessage = "Login failed. Please try again.";

        if (xhr.responseJSON) {
          const apiResponse = xhr.responseJSON;
          errorMessage = apiResponse.data || apiResponse.status || errorMessage;
        }

        $("#message").html(
          `<div class="alert alert-danger">${errorMessage}</div>`
        );
      }
    });
  });

  // Forgot password step 1: send OTP
  $("#sendResetLinkBtn").click(function () {
    const email = $("#resetEmail").val();
    if (!email) { 
      Swal.fire({
        icon: 'warning',
        title: 'Missing Email',
        text: 'Enter your email',
        confirmButtonColor: '#f8bb86'
      });
      return; 
    }

    const $btn = $(this);
    const originalText = $btn.html();
    $btn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...');

    $.post("http://localhost:8080/api/v1/auth/otp/send?email=" + email)
      .done(() => { 
        $("#forgotStep1").hide(); 
        $("#forgotStep2").removeClass("d-none"); 
        Swal.fire({
          icon: 'success',
          title: 'OTP Sent',
          text: 'Check your email for the OTP',
          confirmButtonColor: '#3085d6'
        });
      })
      .fail(() => { 
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: 'Failed to send OTP',
          confirmButtonColor: '#d33'
        });
      })
      .always(() => {
        $btn.prop("disabled", false).html(originalText);
      });
  });

  // Forgot password step 2: reset
  $("#resetPasswordBtn").click(function () {
    const dto = {
      email: $("#resetEmail").val(),
      otp: $("#resetToken").val(),
      newUsername: $("#newUsername").val(),
      newPassword: $("#newPassword").val()
    };

    const $btn = $(this);
    const originalText = $btn.html();
    $btn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Resetting...');

    $.ajax({
      url: "http://localhost:8080/api/v1/auth/otp/reset",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(dto),
      complete: function () {
        $btn.prop("disabled", false).html(originalText);
      },
      success: function () {
        Swal.fire({
          icon: 'success',
          title: 'Password Updated',
          text: 'Your password has been reset successfully!',
          confirmButtonColor: '#3085d6'
        }).then(() => {
          $("#forgotPasswordModal").modal("hide");
        });
      },
      error: function () {
        Swal.fire({
          icon: 'error',
          title: 'Reset Failed',
          text: 'Failed to reset password. Try again.',
          confirmButtonColor: '#d33'
        });
      }
    });
  });
});