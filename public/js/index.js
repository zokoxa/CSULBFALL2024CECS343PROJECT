// Wait for the DOM content to load
document.addEventListener("DOMContentLoaded", function () {
    console.log("JavaScript loaded"); // Debugging statement

    // Function to fetch availability of reserved spots
    async function fetchReservedAvailability() {
        try {
            const response = await fetch("http://localhost:3000/api/availabilityReserved");
            const data = await response.json();
            document.getElementById("spots-count").textContent = data.availableSpots; // Update available spots count
        } catch (error) {
            console.error("Error fetching reserved availability:", error);
        }
    }

    // Call the function every 10 seconds to update availability
    setInterval(fetchReservedAvailability, 10000);

    // Initial call to populate on page load
    fetchReservedAvailability();

    // Handle form submission for reservations
    const reservationForm = document.querySelector("form");
    const qrCodeContainer = document.getElementById("qrCodeContainer");

    if (reservationForm) {
        reservationForm.addEventListener("submit", async function (event) {
            event.preventDefault(); // Prevent default form submission
            console.log("Form submission intercepted"); // Debugging statement

            // Collect form data
            const reservationDate = document.getElementById("reservationDate").value;
            const licensePlate = document.getElementById("licensePlate").value;
            const lastName = document.getElementById("lname").value;

            try {
                // Send data to the backend
                const response = await fetch("http://localhost:3000/api/reserve", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ reservationDate, licensePlate, lastName }),
                });

                if (response.ok) {
                    const result = await response.json();

                    // Show success message and reservation ID
                    alert(`${result.message} Your reservation ID is: ${result.reservationId}`);

                    // Display QR code
                    qrCodeContainer.innerHTML = ""; // Clear any existing QR code
                    const qrCodeImage = document.createElement("img");
                    qrCodeImage.src = result.qrCode; // Use the QR code returned by the backend
                    qrCodeImage.alt = "Your QR Code";
                    qrCodeContainer.appendChild(qrCodeImage);
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
