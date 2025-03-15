import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Replace with your Firebase config
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
const db = getFirestore(app);

window.saveEntry = async function() {
    const text = document.getElementById('entryText').value;
    if (text.trim()) {
        await addDoc(collection(db, 'entries'), {
            text: text,
            timestamp: new Date()
        });
        loadEntries();
        document.getElementById('entryText').value = '';
    }
};

window.deleteEntry = async function(docId) {
    await deleteDoc(doc(db, 'entries', docId));
    loadEntries();
};

async function loadEntries() {
    const entriesList = document.getElementById('entriesList');
    entriesList.innerHTML = '';

    const q = query(collection(db, 'entries'), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(docSnapshot => {
        const data = docSnapshot.data();
        const li = document.createElement('li');

        // Add entry text
        const entryText = document.createElement('span');
        entryText.textContent = data.text;
        li.appendChild(entryText);

        // Add delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '❌';
        deleteButton.onclick = () => deleteEntry(docSnapshot.id);  // Pass docId to deleteEntry()
        deleteButton.style.marginLeft = '10px';
        li.appendChild(deleteButton);

        entriesList.appendChild(li);
    });
}

window.onload = loadEntries;
