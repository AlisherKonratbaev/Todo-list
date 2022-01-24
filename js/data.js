
export class LocalData {

    constructor() {

    }

    getUsers() {
        return JSON.parse(localStorage.getItem("users")) || [];

    }

    updateAllUsers(users) {
        localStorage.setItem("users", JSON.stringify(users));
    }
    updateUser(users, currentUser, newPass) {
        users.forEach(user =>{
            if(user.login == currentUser.login) {
                user.pass = newPass;
            }
        })
        this.updateAllUsers(users);
    }

    sessionClear() {
        sessionStorage.clear();
    }

    sessionUpdate(user) {
        sessionStorage.setItem("authorizedUser", JSON.stringify(user));
    }

    sessionGetUser() {
        return JSON.parse(sessionStorage.getItem("authorizedUser"))
    }

    getNotesDB() {
        return JSON.parse(localStorage.getItem("notesDB")) || [];
    }

    addNote(notesDB, user, note) {
        notesDB.forEach(item => {
            if (item.user == user.login) {
                item.notes.push(note);
            }
        });
        this.updateNotesDB(notesDB);
    }

    changeStatus(notesDB, user, index) {
        notesDB.forEach(item => {
            if (item.user == user.login) {
                item.notes.forEach(note => {
                    if (note.id == index) {
                        note.status = (note.status == "warning") ? "done" : "warning";
                    }
                });
            }
        });
        this.updateNotesDB(notesDB);
    }

    delateNote(notesDB, user, index) {
        notesDB.forEach(item => {
            if (item.user == user.login) {
                item.notes.forEach((note, i, arr) => {
                    if (note.id == index) {
                        arr.splice(i, 1);
                    }
                });
            }
        });

        this.updateNotesDB(notesDB);
    }

    editNote(notesDB, user, newNote) {
        notesDB.forEach(item => {
            if (item.user == user.login) {
                item.notes.forEach(note => {
                    if (note.id == newNote.id) {
                        note.date = newNote.date;
                        note.title = newNote.title;
                        note.important = newNote.important;
                    }
                });
            }
        });

        this.updateNotesDB(notesDB);
    }

    updateNotesDB(notesDB) {
        localStorage.setItem("notesDB", JSON.stringify(notesDB));
    }
}