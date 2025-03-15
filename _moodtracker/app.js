const DB_NAME = 'AdvancedTodoDB';
const DB_VERSION = 1;
const STORE_NAME = 'tasks';

let db;
let currentEditId = null;

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
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'todo-item';
        li.style.borderLeftColor = task.color;
        li.innerHTML = `
                    <div>
                        <strong>${task.name}</strong><br>
                        <small>${task.description}</small><br>
                        <em>Due: ${task.date || 'N/A'}</em>
                    </div>
                    <div>
                        <button onclick="openEditModal(${task.id}, '${task.name.replace(/'/g, "\\'")}', '${task.description.replace(/'/g, "\\'")}', '${task.date}', '${task.color}')">Edit</button>
                        <button onclick="deleteTask(${task.id})">Delete</button>
                    </div>
                `;
        taskList.appendChild(li);
    });
}

function addTask() {
    const name = document.getElementById('taskName').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const date = document.getElementById('taskDate').value;
    const color = document.getElementById('taskColor').value;

    if (!name) return alert('Task name is required');

    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.add({
        name,
        description,
        date,
        color
    });

    transaction.oncomplete = function () {
        clearInputs();
        loadTasks();
    };
}

function clearInputs() {
    document.getElementById('taskName').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('taskDate').value = '';
    document.getElementById('taskColor').value = '#ff0000';
}

function openEditModal(id, name, description, date, color) {
    currentEditId = id;
    document.getElementById('editTaskName').value = name;
    document.getElementById('editTaskDescription').value = description;
    document.getElementById('editTaskDate').value = date || '';
    document.getElementById('editTaskColor').value = color;

    document.getElementById('editModal').style.display = 'block';
    document.getElementById('modalOverlay').style.display = 'block';
}

function closeModal() {
    document.getElementById('editModal').style.display = 'none';
    document.getElementById('modalOverlay').style.display = 'none';
    currentEditId = null;
}

function saveEdit() {
    const newName = document.getElementById('editTaskName').value.trim();
    const newDescription = document.getElementById('editTaskDescription').value.trim();
    const newDate = document.getElementById('editTaskDate').value;
    const newColor = document.getElementById('editTaskColor').value;

    if (!newName) return alert('Task name is required');

    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    store.get(currentEditId).onsuccess = function (event) {
        const task = event.target.result;
        task.name = newName;
        task.description = newDescription;
        task.date = newDate;
        task.color = newColor;

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

openDB();
