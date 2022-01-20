
export class LocalData {

    constructor() {
        
    }

    getUsers() {
        return JSON.parse(localStorage.getItem("users")) || [];
        
    }

    updateUsers(users) {
        localStorage.setItem("users", JSON.stringify(users));
    }
    
    sessionClear() {
        sessionStorage.clear();
    }

    sessionUpdate(user) {
        sessionStorage.setItem("user", JSON.stringify(user));
    }

    sessionGetUser() {
        return JSON.parse(sessionStorage.getItem("user"))
    }

    getNotesDB() {
        return JSON.parse(localStorage.getItem("notesDB")) || [];
    }

    updateNotesDB(notesDB) {
        localStorage.setItem("notesDB", JSON.stringify(notesDB));
    }
}