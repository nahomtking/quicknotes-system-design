const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadButton = document.getElementById("load-btn");
const statusMessage = document.getElementById("status");
const noteForm = document.getElementById("note-form");
const notesList = document.getElementById("notes-list");

async function request(url, options = {}) {
    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    return response;
}

function showStatus(message, type = "") {
    statusMessage.textContent = message;
    statusMessage.className = type;
}

function displayNotes(notes) {
    notesList.innerHTML = "";

    if (notes.length === 0) {
        const emptyMessage = document.createElement("li");
        emptyMessage.textContent = "No notes found.";
        notesList.appendChild(emptyMessage);
        return;
    }

    notes.forEach(note => {
        const listItem = document.createElement("li");

        const title = document.createElement("h2");
        title.textContent = note.title;

        const body = document.createElement("p");
        body.textContent = note.body;

        listItem.appendChild(title);
        listItem.appendChild(body);
        notesList.appendChild(listItem);
    });
}

async function loadNotes() {
    loadButton.disabled = true;
    showStatus("Loading notes...", "");

    try {
        const response = await request(`${API_URL}?_limit=10`);
        const notes = await response.json();

        displayNotes(notes);
        showStatus(`Loaded ${notes.length} notes from the server.`, "success");
    } catch (error) {
        showStatus("Sorry, we could not load the notes. Please try again.", "error");
    } finally {
        loadButton.disabled = false;
    }
}

loadButton.addEventListener("click", loadNotes);