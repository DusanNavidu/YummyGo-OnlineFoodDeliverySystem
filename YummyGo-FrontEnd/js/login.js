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

      $.ajax({
        url: "http://localhost:8080/api/v1/auth/login",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(loginDTO),
        success: function (response) {
          if (response.code === 200) {
            console.log("Login successful", response);

            cookieStore.set("token", response.data.accessToken);
            const user = response.data.role;

            if (user === "ADMIN") {
              $("#message").html('<div class="alert alert-success">Admin Login successful! Redirecting...</div>');
            } else if (user === "CLIENT") {
              $("#message").html('<div class="alert alert-success">CLIENT Login successful! Redirecting...</div>');
            } else if (user === "PARTNER") {
              $("#message").html('<div class="alert alert-success">PARTNER Login successful! Redirecting...</div>');
            } else if (user === "BUSINESS") {
              $("#message").html('<div class="alert alert-success">BUSINESS Login successful! Redirecting...</div>');
            }

            setTimeout(() => {
              if (user === "ADMIN") {
                window.location.href = "/pages/dashboardAdmin.html";
              } else if (user === "CLIENT") {
                window.location.href = "/pages/clientDashboard.html";
              } else if (user === "PARTNER") {
                window.location.href = "/pages/dashboardPartner.html";
              } else if (user === "BUSINESS") {
                window.location.href = "/pages/businessDashboard.html";
              }
            }, 1000);
          } else {
            $("#message").html('<div class="alert alert-danger">Invalid credentials. Please try again.</div>');
          }
        },
        error: function (err) {
          console.error("Login failed", err);
          $("#message").html('<div class="alert alert-danger">Login failed. Please try again.</div>');
        }
      });
    });
  });