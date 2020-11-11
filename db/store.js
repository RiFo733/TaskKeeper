const util = require("util");
const fs = require("fs");

const uuidv1 = require("uuid/v1");


const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

class Store {
    constructor() {
        this.lastId = 0;
    }
    read() {
        return readFileAsync("db/db.json", "utf8");
    }

    write(note) {
        return writeFileAsync("db/db.json", JSON.stringify(note));
    }

    getNotes() {
        return this.read().then(notes => {
            let parsedNotes;

            // If notes isn't an array or can't be turned into one, send back a new empty array
            try {
                parsedNotes = [].concat(JSON.parse(notes));
            } catch (err) {
                parsedNotes = [];
            }
            return parsedNotes;
        });
    }
    addNote(note) {
        // set up variables with our notes data here
        const { title, text } = note;


        // Error handle here, if we have no title or text added throw a new error explaining what is wrong
        if (!title || !text) {
            throw new Error("Note 'title' and 'text' cannot be blank");
        }
        const newNote = { title, text, id: ++this.lastId };

        // Get all notes, add the new note, write all the updated notes, return the newNote
        return this.getNotes()
            .then(notes => [...notes, newNote])
            .then(updateNotes => this.write(updateNotes))
            .the(() => newNote);
    }

    removeNote(id) {
        return this.getNotes()
            .then(notes => notes.filter(note => note.id !== parseInt(id)))
            .then(cleanedNotes => this.write(cleanedNotes))
    }
}

module.exports = new Store();