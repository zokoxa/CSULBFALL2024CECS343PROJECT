document.addEventListener("DOMContentLoaded", () => {
    const manageForm = document.getElementById("manageForm");
    const reservationDetails = document.getElementById("reservationDetails");
    const cancelButton = document.getElementById("cancelButton");

    manageForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        
        const reservationId = document.getElementById("reservationId").value;
        const licensePlate = document.getElementById("licensePlate").value;

        try {
            const response = await fetch("http://localhost:3000/api/manageReservation", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ reservationId, licensePlate })
            });

            if (response.ok) {
                const reservation = await response.json();
                
                // Display reservation details
                document.getElementById("reservationIdDisplay").textContent = reservation._id;
                document.getElementById("licensePlateDisplay").textContent = reservation.licensePlate;
                document.getElementById("lastNameDisplay").textContent = reservation.lastName;
                document.getElementById("reservationDateDisplay").textContent = reservation.reservationDate;

                reservationDetails.style.display = "block";
            } else {
                alert("Reservation not found.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while fetching the reservation.");
        }
    });

    // Cancel Reservation
    cancelButton.addEventListener("click", async () => {
        const reservationId = document.getElementById("reservationIdDisplay").textContent;
        
        try {
            const response = await fetch(`http://localhost:3000/api/reservation/${reservationId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                alert("Reservation canceled successfully.");
                reservationDetails.style.display = "none";
                manageForm.reset();
            } else {
                alert("Failed to cancel the reservation.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while canceling the reservation.");
        }
    });
});
