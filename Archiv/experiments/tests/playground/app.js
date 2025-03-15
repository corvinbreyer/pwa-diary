let db;

document.addEventListener("DOMContentLoaded", () => {
    let request = indexedDB.open("todoDB", 1);

    request.onupgradeneeded = (event) => {
        db = event.target.result;
        let store = db.createObjectStore("tasks", { keyPath: "id", autoIncrement: true });
        store.createIndex("task", "task", { unique: false });
    };

    request.onsuccess = (event) => {
        db = event.target.result;
        loadTasks();
    };

    request.onerror = (event) => {
        console.error("IndexedDB Error:", event.target.errorCode);
    };
});

function addTask() {
    let taskInput = document.getElementById("taskInput");
    let task = taskInput.value.trim();

    if (task === "") return;

    let transaction = db.transaction(["tasks"], "readwrite");
    let store = transaction.objectStore("tasks");

    store.add({ task });

    transaction.oncomplete = () => {
        taskInput.value = "";
        loadTasks();
    };
}

function loadTasks() {
    let taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    let transaction = db.transaction(["tasks"], "readonly");
    let store = transaction.objectStore("tasks");

    store.openCursor().onsuccess = (event) => {
        let cursor = event.target.result;
        if (cursor) {
            let li = document.createElement("li");
            li.textContent = cursor.value.task;
            taskList.appendChild(li);
            cursor.continue();
        }
    };
}

window.addTask = addTask;
