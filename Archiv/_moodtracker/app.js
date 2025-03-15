import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// If IndexedDB is not supported, show an alert
if (!window.indexedDB) {
    alert("IndexedDB is not supported!");
}

// Open the IndexedDB
function openIndexedDB() {
    return new Promise((resolve, reject) => {
        let request = indexedDB.open("MoodTrackerDB", 1);
        
        request.onupgradeneeded = function(event) {
            let db = event.target.result;
            if (!db.objectStoreNames.contains("entries")) {
                db.createObjectStore("entries", { keyPath: "id", autoIncrement: true });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Save data to IndexedDB
async function saveToIndexedDB(text) {
    let db = await openIndexedDB();
    let transaction = db.transaction(["entries"], "readwrite");
    let store = transaction.objectStore("entries");

    // Only save the text if it's not empty
    if (text.trim()) {
        await store.add({ text: text, timestamp: new Date(), synced: false });
    }

    transaction.oncomplete = function() {
        console.log('Data successfully saved.');
    };

    transaction.onerror = function() {
        console.error('Error saving data.');
    };
}

// Save entry (called when user submits text)
window.saveEntry = async function() {
    const text = document.getElementById('entryText').value;
    if (text.trim()) {
        await saveToIndexedDB(text); // Save to IndexedDB
        syncWithFirebase(); // Sync with Firebase
        document.getElementById('entryText').value = ''; // Clear input field
        loadEntries(); // Reload all entries
    } else {
        console.log("The text is empty.");
    }
};

// Firebase config and initialization
const firebaseConfig = {
    apiKey: "AIzaSyBPMGiqCbCKsPnxjqSkIYSz_xwQ1esRcIc",
    authDomain: "mestertestpwa.firebaseapp.com",
    projectId: "mestertestpwa",
    storageBucket: "mestertestpwa.firebasestorage.app",
    messagingSenderId: "534872636779",
    appId: "1:534872636779:web:f8a2e3d2b947d97948202e",
    measurementId: "G-860YF2P731"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firebaseDB = getFirestore(app);

async function syncWithFirebase() {
    let db = await openIndexedDB();
    let transaction = db.transaction(["entries"], "readwrite");
    let store = transaction.objectStore("entries");
    
    let request = store.getAll();
    request.onsuccess = async function() {
        let entries = request.result.filter(entry => !entry.synced);
        
        // We need to make sure that each document is uploaded to Firebase
        for (let entry of entries) {
            // Check if this entry already exists in Firebase
            if (!entry.firebaseId) {
                // Add entry to Firebase
                let docRef = await addDoc(collection(firebaseDB, 'entries'), {
                    text: entry.text,
                    timestamp: entry.timestamp
                });

                // After successful upload, update the entry in IndexedDB
                let updateTransaction = db.transaction(["entries"], "readwrite");
                let updateStore = updateTransaction.objectStore("entries");

                entry.synced = true;
                entry.firebaseId = docRef.id; // Save Firebase ID to avoid re-upload
                updateStore.put(entry);

                updateTransaction.oncomplete = function() {
                    console.log('Entry synced and updated in IndexedDB.');
                };

                updateTransaction.onerror = function() {
                    console.error('Error syncing entry with Firebase and updating IndexedDB.');
                };
            } else {
                console.log(`Entry with Firebase ID ${entry.firebaseId} is already synced.`);
            }
        }
    };
}



// Delete entry (from Firebase and local IndexedDB)
window.deleteEntry = async function(docId) {
    // 1. Delete entry from Firebase
    await deleteDoc(doc(firebaseDB, 'entries', docId));

    // 2. Delete entry from local IndexedDB
    let db = await openIndexedDB();
    let transaction = db.transaction(["entries"], "readwrite");
    let store = transaction.objectStore("entries");

    let request = store.getAll();
    request.onsuccess = function() {
        let entries = request.result;
        let entryToDelete = entries.find(entry => entry.firebaseId === docId);
        if (entryToDelete) {
            store.delete(entryToDelete.id); // Delete from IndexedDB
            console.log(`Entry with Firebase ID ${docId} deleted from IndexedDB.`);
        }
    };

    request.onerror = function() {
        console.error('Error deleting entry from IndexedDB.');
    };

    // Reload entries after deletion
    loadEntries();
};

// Load entries (from Firebase or IndexedDB if offline)
async function loadEntries() {
    const entriesList = document.getElementById('entriesList');
    entriesList.innerHTML = '';

    try {
        // If online, load data from Firebase
        const q = query(collection(firebaseDB, 'entries'), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(docSnapshot => {
            displayEntry(docSnapshot.data().text, docSnapshot.id);
        });

    } catch (error) {
        console.log("No internet, loading local data...");
        let db = await openIndexedDB();
        let transaction = db.transaction(["entries"], "readonly");
        let store = transaction.objectStore("entries");
        let request = store.getAll();

        request.onsuccess = function() {
            request.result.forEach(entry => displayEntry(entry.text));
        };
    }
}

// Display entry on the page
function displayEntry(text, id) {
    const entriesList = document.getElementById('entriesList');
    const li = document.createElement('li');

    const entryText = document.createElement('span');
    entryText.textContent = text;
    li.appendChild(entryText);

    if (id) {
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '❌';
        deleteButton.onclick = () => deleteEntry(id);
        deleteButton.style.marginLeft = '10px';
        li.appendChild(deleteButton);
    }

    entriesList.appendChild(li);
}

// Load entries when page is loaded
window.onload = loadEntries;
