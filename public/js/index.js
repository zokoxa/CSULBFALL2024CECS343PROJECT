// public/js/index.js

// Wait for the DOM content to load
document.addEventListener("DOMContentLoaded", function () {
    console.log("JavaScript loaded"); // Debugging statement

    const reservationForm = document.querySelector("form");
    if (reservationForm) {
        reservationForm.addEventListener("submit", async function (event) {
            event.preventDefault(); // Prevents the form from submitting normally
            console.log("Form submission intercepted"); // Debugging statement

            // Collect form data
            const licensePlate = document.getElementById("licensePlate").value;
            const lastName = document.getElementById("lname").value;

            // Send data to the backend (adjust URL to match your backend)
            try {
                const response = await fetch("http://localhost:3000/api/reserve", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ licensePlate, lastName })
                });

                if (response.ok) {
                    const result = await response.json();
                    alert(result.message); // Show success message
                } else {
                    alert("Failed to make reservation.");
                }
            } catch (error) {
                console.error("Error:", error);
                alert("An error occurred.");
            }
        });
    }
});

