document.addEventListener("DOMContentLoaded", function () {
	let calendar; // Declare globally

	function waitForFullCalendar(callback) {
		if (typeof FullCalendar !== "undefined") {
			callback(); // If FullCalendar is ready, execute callback
		} else {
			console.warn("FullCalendar not ready, retrying...");
			setTimeout(() => waitForFullCalendar(callback), 100); // Retry every 100ms
		}
	}

	function initializeCalendar() {
		if (typeof FullCalendar === "undefined") {
			console.error("FullCalendar is not loaded yet.");
			return;
		}
		const calendarEl = document.getElementById("calendar");

		if (calendarEl && !calendarEl.dataset.initialized) {
			// Prevent duplicate init
			calendar = new FullCalendar.Calendar(calendarEl, {
				initialView: "dayGridMonth",
				selectable: true,
				editable: true,
				events: [],
				dateClick: function (info) {
					const title = prompt("Enter event title:");
					if (title) {
						calendar.addEvent({
							title: title,
							start: info.dateStr,
							allDay: true,
						});
					}
				},
			});

			calendar.render();
			calendarEl.dataset.initialized = "true"; // Mark as initialized
		}
	}

	// Ensure function is available globally
	window.initializeCalendar = initializeCalendar;
});
