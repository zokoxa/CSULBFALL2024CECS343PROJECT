// Wait for the DOM content to load
document.addEventListener("DOMContentLoaded", function () {
    console.log("JavaScript loaded"); // Debugging statement

    // Elements
    const reservationDateInput = document.getElementById("reservationDate");
    const spotsCountElement = document.getElementById("spots-count");
    const reservationForm = document.querySelector("form");
    const qrCodeContainer = document.getElementById("qrCodeContainer");

    // Function to fetch availability for a specific date
    async function fetchReservedAvailability() {
        try {
            const reservationDate = reservationDateInput.value; // Get selected date
            if (!reservationDate) {
                spotsCountElement.textContent = "Please select a date.";
                return;
            }

            const response = await fetch(`http://localhost:3000/api/availabilityReserved?reservationDate=${reservationDate}`);
            if (response.ok) {
                const data = await response.json();
                spotsCountElement.textContent = `${data.availableSpots} spots available`;
            } else {
                spotsCountElement.textContent = "Error fetching availability.";
            }
        } catch (error) {
            console.error("Error fetching reserved availability:", error);
            spotsCountElement.textContent = "Error fetching availability.";
        }
    }

    // Update available spots when the reservation date changes
    if (reservationDateInput) {
        reservationDateInput.addEventListener("change", fetchReservedAvailability);
    }

    // Handle form submission for reservations
    if (reservationForm) {
        reservationForm.addEventListener("submit", async function (event) {
            event.preventDefault(); // Prevent default form submission
            console.log("Form submission intercepted"); // Debugging statement

            // Collect form data
            const reservationDate = reservationDateInput.value;
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

                    // Optionally reset form
                    reservationForm.reset();
                    spotsCountElement.textContent = "Please select a date.";
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
