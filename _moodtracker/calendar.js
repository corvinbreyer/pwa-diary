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
            loadEventsFromDB().then((events) => {
                calendar = new FullCalendar.Calendar(calendarEl, {
                    initialView: "dayGridMonth",
                    selectable: false, // Disable selecting new dates
                    editable: false, // Prevent manual event changes
                    events: events, // Load database events
                });
                calendar.render();
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
                    title: task.name,
                    start: new Date(task.timestamp).toISOString().split("T")[0], // Ensure correct date format
                    color: task.color, // Use the task color
                    description: task.description, // Additional info (not displayed by default)
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
