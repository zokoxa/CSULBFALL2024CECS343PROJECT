// public/js/index.js

// Wait for the DOM content to load
document.addEventListener("DOMContentLoaded", function () {
    console.log("JavaScript loaded"); // Debugging statement

    // Function to fetch available first-come, first-serve spots
    async function fetchAvailability() {
        try {
            const response = await fetch("http://localhost:3000/api/availabilityFirstCome");
            const data = await response.json();
            document.getElementById("spots-count").textContent = data.availableSpots;
        } catch (error) {
            console.error("Error fetching availability:", error);
        }
    }

    // Call the function every 10 seconds to update availability
    setInterval(fetchAvailability, 10000);

    // Initial call to populate on page load
    fetchAvailability();

    // Handle form submission for reservations
    const reservationForm = document.querySelector("form");
    if (reservationForm) {
        reservationForm.addEventListener("submit", async function (event) {
            event.preventDefault(); // Prevents the form from submitting normally
            console.log("Form submission intercepted"); // Debugging statement

            // Collect form data
            const reservationDate = document.getElementById("reservationDate").value;
            const licensePlate = document.getElementById("licensePlate").value;
            const lastName = document.getElementById("lname").value;
        
            // Send data to the backend (adjust URL to match your backend)
            try {
                const response = await fetch("http://localhost:3000/api/reserve", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ reservationDate, licensePlate, lastName })
                });

                if (response.ok) {
                    const result = await response.json();
                    alert(`${result.message} Your reservation ID is: ${result.reservationId}`); // Show success message
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
