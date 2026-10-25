const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadButton = document.getElementById("load-btn");
const statusMessage = document.getElementById("status");
const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const submitButton = document.getElementById("submit-btn");
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

function createNoteElement(note) {
    const listItem = document.createElement("li");

    const title = document.createElement("h2");
    title.textContent = note.title;

    const body = document.createElement("p");
    body.textContent = note.body;

    listItem.appendChild(title);
    listItem.appendChild(body);

    return listItem;
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

async function createNote(event) {
    event.preventDefault();

    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    if (!title) {
        showStatus("Title is required.", "error");
        return;
    }

    if (title.length > 100) {
        showStatus("Title must be 100 characters or fewer.", "error");
        return;
    }

    submitButton.disabled = true;
    showStatus("Creating note...", "");

    try {
        const response = await request(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: title,
                body: body,
                userId: 1
            })
        });

        const newNote = await response.json();

        notesList.prepend(createNoteElement(newNote));

        showStatus(
            `Note created (status ${response.status}, id ${newNote.id}).`,
            "success"
        );

        noteForm.reset();
    } catch (error) {
        showStatus(
            "Sorry, we could not create the note. Please try again.",
            "error"
        );
    } finally {
        submitButton.disabled = false;
    }
}

loadButton.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", createNote);