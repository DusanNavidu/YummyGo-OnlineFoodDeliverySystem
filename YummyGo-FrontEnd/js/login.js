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
                window.location.href = "/pages/adminDashbordHome.html";
              } else if (userRole === "CLIENT") {
                window.location.href = "/pages/mainDashboard.html";
              } else if (userRole === "PARTNER") {
                window.location.href = "/pages/dashboardPartner.html";
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
  });