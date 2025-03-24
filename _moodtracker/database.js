const DB_NAME = 'AdvancedTodoDB';
const DB_VERSION = 1;
const STORE_NAME = 'tasks';

let db;
let currentEditId = null;

function exportData() {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = function () {
        const data = request.result;
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'tasks_backup.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const jsonData = JSON.parse(e.target.result);
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        // Step 1: Clear existing tasks
        store.clear().onsuccess = function () {
            console.log('Existing tasks cleared.');

            // Step 2: Add new tasks from the file
            jsonData.forEach(task => store.add(task));

            transaction.oncomplete = function () {
                alert('Import successful! All old tasks were replaced.');
                loadTasks();
            };
        };

        transaction.onerror = function () {
            console.error('Transaction error: Import failed.');
        };
    };

    reader.readAsText(file);
}

document.getElementById('importFile').addEventListener('change', importData);

/* --------- DATABASE --------- */

function openDB() {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = function (event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, {
                keyPath: 'id',
                autoIncrement: true
            });
        }
    };
    request.onsuccess = function (event) {
        db = event.target.result;
        loadTasks();
    };
    request.onerror = function (event) {
        console.error('Database error:', event.target.error);
    };
}

function loadTasks() {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = function () {
        displayTasks(request.result);
    };
}

function displayTasks(tasks) {
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    tasks.forEach(task => {
        const li = document.createElement("li");
        li.className = "todo-item";
        li.style.borderLeftColor = task.color;

        const date = new Date(task.timestamp);
        const formattedDate = date.toLocaleString();

        // Sicherstellen, dass Mood existiert
        const mood = task.mood ? task.mood.replace(/'/g, "\\'") : "😐";

        li.innerHTML = `
            <div>
                <i class="bi bi-bookmark-fill" style="color: ${task.color}"></i>
                <strong>${mood} ${task.name}</strong><br>
                <small>${task.description}</small><br>
                <em>Added: ${formattedDate}</em>
            </div>
            <div>
                <button onclick="openEditModal(${task.id}, '${task.name.replace(/'/g, "\\'")}', '${task.description.replace(/'/g, "\\'")}', '${task.color}', '${task.mood}')">Edit</button>
                <button class="warning" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        `;

        taskList.appendChild(li);
    });
}



function addTask() {
    const name = document.getElementById('taskName').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const color = document.getElementById('taskColor').value;
    const mood = document.getElementById("taskMood").value || "😐"; 

    if (!name) return alert('Task name is required');

    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    store.add({
        name,
        description,
        timestamp: Date.now(), // Save the creation time as a timestamp
        color,
        mood  
    });

    transaction.oncomplete = function () {
        clearInputs();
        loadTasks();
    };
}

function clearInputs() {
    document.getElementById('taskName').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('taskColor').value = '#ff0000';
}

function openEditModal(id, name, description, color, mood) {
    currentEditId = id;
    document.getElementById('editTaskName').value = name;
    document.getElementById('editTaskDescription').value = description;
    document.getElementById('editTaskColor').value = color;
    document.getElementById("editTaskMood").value = mood;
    document.getElementById('editModal').style.display = 'block';
    document.getElementById('modalOverlay').style.display = 'block';

     // Vorausgewähltes Emoji hervorheben
     document.querySelectorAll(".edit-mood").forEach(moodEl => {
        moodEl.classList.remove("selected");
        if (moodEl.dataset.mood === task.mood) {
            moodEl.classList.add("selected");
        }
    });

    document.getElementById("editModal").style.display = "block";
}

function closeModal() {
    document.getElementById('editModal').style.display = 'none';
    document.getElementById('modalOverlay').style.display = 'none';
    currentEditId = null;
}

function saveEdit() {
    const newName = document.getElementById('editTaskName').value.trim();
    const newDescription = document.getElementById('editTaskDescription').value.trim();
    const newColor = document.getElementById('editTaskColor').value;
    const newMood = document.getElementById('editTaskMood').value; // Der gewählte Mood

    if (!newName) return alert('Task name is required');

    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    store.get(currentEditId).onsuccess = function (event) {
        const task = event.target.result;
        if (!task) return alert("Task not found!");

        task.name = newName;
        task.description = newDescription;
        task.color = newColor;
        task.mood = newMood || task.mood; // Falls kein neues Mood gesetzt wurde, behalte das alte

        store.put(task).onsuccess = function () {
            closeModal();
            loadTasks();
        };
    };
}


function deleteTask(id) {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.delete(id).onsuccess = function () {
        loadTasks();
    };
}

document.querySelectorAll(".mood").forEach((emoji) => {
    emoji.addEventListener("click", function () {
        document.querySelectorAll(".mood").forEach(e => e.classList.remove("selected"));
        this.classList.add("selected");
        document.getElementById("taskMood").value = this.dataset.mood;
    });
});

document.querySelectorAll(".edit-mood").forEach(moodEl => {
    moodEl.addEventListener("click", function() {
        document.querySelectorAll(".edit-mood").forEach(el => el.classList.remove("selected"));
        this.classList.add("selected");
        document.getElementById("editTaskMood").value = this.dataset.mood;
    });
});

openDB();
