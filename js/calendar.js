document.addEventListener("DOMContentLoaded", function () {
	let calendar; // Declare globally

	function initializeCalendar() {
		if (typeof FullCalendar === "undefined") {
			console.error("FullCalendar is not loaded yet.");
			return;
		}

		const calendarEl = document.getElementById("calendar");

		if (calendarEl && !calendarEl.dataset.initialized) {
			// Prevent duplicate init
			loadEventsFromDB().then((events) => {
				calendar = new FullCalendar.Calendar(calendarEl, {
					initialView: "dayGridMonth",
					locale: "de",
					firstDay: 1, // Start the week with Monday (Sunday is 0)
					selectable: true, // Disable selecting new dates
					editable: false, // Prevent manual event changes
					headerToolbar: {
						left: "today,customPrev,customNext",
						right: "dayGridMonth,timeGridWeek,timeGridDay",
					},
					customButtons: {
						todayButton: {
							text: "Heute",
							click: function () {
								calendar.today();
							},
						},
						customPrev: {
							text: "", // You can replace this with your own HTML or icon
							click: function () {
								calendar.prev(); // Go to the previous view
							},
						},
						customNext: {
							text: "", // Replace this too
							click: function () {
								calendar.next(); // Go to the next view
							},
						},
					},
					buttonText: {
						dayGridMonth: "Monat", // Custom text for "Month"
						timeGridWeek: "Woche",
						timeGridDay: "Tag",
					},
					events: events, // Load database events
					eventClick: function (info) {
						const event = info.event;
						openEditModal(
							parseInt(event.id),
							event.extendedProps.name,
							event.extendedProps.description,
							event.backgroundColor || event.color,
							event.extendedProps.mood
						);
					},
				});

				calendar.render();

				document.querySelector(".fc-today-button").innerHTML = "Heute";
				document.querySelector(".fc-customPrev-button").innerHTML =
					'<i class="bi bi-caret-left-fill"></i>';
				document.querySelector(".fc-customNext-button").innerHTML =
					'<i class="bi bi-caret-right-fill"></i>';

				// Create title element dynamically
				var titleEl = document.createElement("h2");
				titleEl.id = "calendar-title";
				titleEl.innerText = calendar.view.title;

				// Insert the title below the header toolbar
				var toolbarEl = document.querySelector(".fc-header-toolbar");
				toolbarEl.insertAdjacentElement("afterend", titleEl);

				// Update title dynamically when view changes
				calendar.on("datesSet", function () {
					document.querySelector(".fc-today-button").innerHTML = "Heute";
					titleEl.innerText = calendar.view.title;
				});

				calendarEl.dataset.initialized = "true"; // Mark as initialized
			});
		}
	}
	// Function to fetch tasks from IndexedDB and convert them to events
	function loadEventsFromDB() {
		return new Promise((resolve) => {
			const transaction = db.transaction("tasks", "readonly");
			const store = transaction.objectStore("tasks");
			const request = store.getAll();

			request.onsuccess = function () {
				const tasks = request.result;
				console.log("Loaded tasks from DB:", tasks);

				// Convert tasks to FullCalendar event format
				const events = tasks.map((task) => ({
					id: task.id,
					title: task.mood + " " + task.name,
					start: new Date(task.timestamp).toISOString() /*.split("T")[0]*/, // Ensure correct date format
					color: task.color, // Use the task color
					description: task.description, // Additional info (not displayed by default)
					mood: task.mood, // add mood separately
					name: task.name, // add name separately
				}));

				resolve(events);
			};

			request.onerror = function () {
				console.error("Error loading tasks from DB.");
				resolve([]); // Return empty list on error
			};
		});
	}
	// Ensure function is available globally
	window.initializeCalendar = initializeCalendar;
});
