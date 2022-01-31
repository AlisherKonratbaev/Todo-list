
export class LocalData {

    constructor() {

    }

    getUsers() {
        return JSON.parse(localStorage.getItem("users")) || [];
    }
    addNewUser(users, newUser) {
        users.push(newUser);
        this.updateAllUsers(users);
    }
    deleteUser(users, id) {
        let login;
        users.forEach((user, i, arr) => {
            if (user.id == id) {
                login = user.login;
                arr.splice(i, 1);
            }
        });
        this.updateAllUsers(users);
        this.deleteUserInNotesDB(login);
    }
    deleteUserInNotesDB(login) {
        const notesDB = this.getNotesDB();
        notesDB.forEach((item, i, arr) => {
            if (item.user == login) {
                arr.splice(i, 1);
            }
        })
        this.updateNotesDB(notesDB);
    }

    updatePassword(users, currentUser, newPass) {
        let current;
        users.forEach(user => {
            if (user.login == currentUser.login) {
                user.pass = newPass;
                current = user;
            }
        })
        this.updateAllUsers(users);
        return current;
    }
    updateUser(users, updateUser) {
        users.forEach(user => {
            if (user.login == updateUser.login) {
                user.permissions.canAdd = updateUser.permissions.canAdd;
                user.permissions.canEdit = updateUser.permissions.canEdit;
                user.permissions.canDelete = updateUser.permissions.canDelete;
                user.pass = updateUser.pass;
                user.role = updateUser.role;
            }
        });
        this.updateAllUsers(users);
    }

    updateAllUsers(users) {
        localStorage.setItem("users", JSON.stringify(users));
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

    deleteNote(notesDB, user, index) {
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
                    }
                });
            }
        });

        this.updateNotesDB(notesDB);
    }
    changeInCategory(notesDB, user, category, index) {
        let important = category == "important";
        let status;

        if (important) {
            status = "warning";
        } else {
            status = category == "done" ? "done" : "warning";
        }

        notesDB.forEach(item => {
            if (item.user == user.login) {
                item.notes.forEach(note => {
                    if (note.id == index) {
                        note.important = important;
                        note.status = status;
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