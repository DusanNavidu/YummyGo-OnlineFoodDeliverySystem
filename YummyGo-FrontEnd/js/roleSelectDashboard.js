document.addEventListener("DOMContentLoaded", function () {
    fetch("http://localhost:8080/api/v1/auth/roleSelector", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
        // "Authorization": "Bearer " + localStorage.getItem("jwtToken") // token oni nam
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Network response was not ok: " + response.status);
        }
        return response.json();
      })
      .then(data => {
        console.log("GET Response:", data);

        // Example: UI eke pennanna
        // alert(data.message + " → " + data.data);
      })
      .catch(error => {
        console.error("Error fetching role selector:", error);
      });
  });