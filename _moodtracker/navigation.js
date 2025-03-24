document.addEventListener("DOMContentLoaded", function () {
	// Get references to all sections and tabs
	const sections = {
		home: document.querySelector(".addentry"),
		overview: document.querySelector(".overview"),
		calendar: document.querySelector(".calendar"),
	};

	const tabs = document.querySelectorAll("#tabs a");

	// Function to show only the selected section
	function showSection(section) {
		Object.values(sections).forEach((sec) => (sec.style.display = "none")); // Hide all
		sections[section].style.display = "block"; // Show the selected one
	}

	// Event listeners for tab clicks
	tabs.forEach((tab, index) => {
		tab.addEventListener("click", function (event) {
			event.preventDefault(); // Prevent default link behavior

			// Determine which section to show based on the tab index
			const sectionNames = ["home", "overview", "calendar"];
			showSection(sectionNames[index]);

			// Update active tab style
			tabs.forEach((t) => t.classList.remove("active"));
			tab.classList.add("active");
		});
	});

	// Show "Home" section by default on load
	showSection("home");
});
