const toggleButton = document.getElementById("themeToggle");

function bodyClass() {
    return document.body.classList;
}

function setDark(isTrue) {
    if (isTrue) {
        bodyClass().remove("light");
        bodyClass().add("dark");
        toggleButton.innerHTML = '<i class="bi bi-brightness-high-fill"></i> Hellmodus';
    } else {
        bodyClass().remove("dark");
        bodyClass().add("light");
        toggleButton.innerHTML = '<i class="bi bi-moon-fill"></i> Dunkelmodus';
    }
}

toggleButton.addEventListener("click", () => {
    setDark(bodyClass().contains("light"));
});

// –––––– by system settings ––––––
// –––––– by system settings ––––––

// Check if the system prefers a dark theme
const themeQuery = window.matchMedia("(prefers-color-scheme: dark)");

// Check if the system-wide setting is supported
if (themeQuery.media === "(prefers-color-scheme: dark)") {
    // Add event listener if supported
    themeQuery.addEventListener("change", (event) => {
        setDark(event.matches);
    });

    // Set the initial theme based on the system preference
    setDark(themeQuery.matches);
} else {
    // Fallback when the system-wide setting is not available
    console.log("System-wide theme setting is not supported.");
    setDark(false); // Default to light theme
}
