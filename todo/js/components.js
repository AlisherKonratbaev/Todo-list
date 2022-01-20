import { LocalData } from "./data.js";


export class Registration {

    constructor() {
        if (window.location.href != `${window.location.origin}/todo/reg.html`) {
            return;
        }
        this.local = new LocalData();
        this.initDOMElemets();
        this.creatUser();
    }



    initDOMElemets() {

        this.formEl = document.querySelector("#msform");
        this.loginEl = document.querySelector("[name='login']");
        this.checkboxEl = document.querySelector("#show_pass");
        this.passwordInputs = document.querySelectorAll(".pass");
        this.btnEl = document.querySelector(".action-button");
    }

    creatUser() {

        this.showPassword();


        this.btnEl.addEventListener("click", (e) => {
            e.preventDefault();
            const pass = this.passwordInputs[0].value;
            const cpass = this.passwordInputs[1].value;
            const login = this.loginEl.value.trim();


            if (pass == "") {
                this.showMessage(this.passwordInputs[0], "password is empty !")
            } else if (pass != cpass) {
                this.showMessage(this.passwordInputs[0], "Password mismatch !")
            } else if (login == "") {
                this.showMessage(this.loginEl, "Login is empty !")
            } else {

                let userTemp = {
                    login,
                    pass,
                }

                const users = this.local.getUsers();
                const findUser = users.find(user => user.login == userTemp.login);

                if (!findUser) users.push(userTemp);
                else {
                    this.showMessage(this.loginEl, "Login is already taken");
                    return;
                }

                this.local.updateUsers(users);
                window.location.href = "auth.html";
            }

        });
    }

    showPassword() {
        this.checkboxEl.addEventListener("change", (e) => {
            if (e.target.checked) {
                this.passwordInputs.forEach(input => {
                    input.type = "text";
                });
            } else {
                this.passwordInputs.forEach(input => {
                    input.type = "password";
                });
            }
        });
    }

    showMessage(element, text) {
        const message = document.createElement("p")
        message.classList.add("message");
        message.textContent = text;
        element.after(message);
        setTimeout(() => {
            message.remove();
        }, 2000);
    }

}

export class Authorization {

    constructor() {
        if (window.location.href != `${window.location.origin}/todo/auth.html`) {
            return;
        }
        this.local = new LocalData();
        this.initDOMElemets();
        this.auth();
    }



    initDOMElemets() {

        this.loginEl = document.querySelector("#login");
        this.passEl = document.querySelector("#pass");
        this.btnEl = document.querySelector("#auth");
    }

    auth() {
        this.local.sessionClear();
        const users = this.local.getUsers();

        this.btnEl.addEventListener("click", (e) => {

            const login = this.loginEl.value;
            const pass = this.passEl.value;

            let findUser = users.find(user => (user.login === login && user.pass === pass));
            if (findUser) {
                this.local.sessionClear();
                this.local.sessionUpdate(findUser);

                window.location.href = "notes.html";
            }
            else {
                this.showMessage(this.passEl, "Login or password is incorrect");
            }
        });


    }

    showMessage(element, text) {
        const message = document.createElement("p")
        message.classList.add("message");
        message.textContent = text;
        element.after(message);
        setTimeout(() => {
            message.remove();
        }, 2000);
    }

}

export class Note {

    constructor() {
        if (window.location.href != `${window.location.origin}/todo/notes.html`) {
            return;
        }
        this.local = new LocalData();
        this.verify();
        this.initDOMElemets();
        this.initNotesDB();

        this.noteOperations();
    }

    verify() {
        this.user = this.local.sessionGetUser();
        if (!this.user) window.location.href = `${window.location.origin}/todo/auth.html`;
    }

    initDOMElemets() {
        this.noteDate = document.querySelector("#note__date");
        this.notesWrap = document.querySelector(".todo-wrap");
        this.noteTitle = document.querySelector("#note__title");
        this.noteCheckbox = document.querySelector("#note__checkbox");
        this.addNoteBtn = document.querySelector("#note__add");
        this.overlay = document.querySelector(".overlay");
    }

    initNotesDB() {
        this.notesDB = this.local.getNotesDB();
        this.userNotes = this.notesDB.find(item => item.user == this.user.login);

        if (!this.userNotes) {
            this.notesDB.push({
                user: this.user.login,
                notes: [],
            });
            this.local.updateNotesDB(this.notesDB);
        }
    }

    noteOperations() {
        this.showNotes();
        this.addNote();
        this.changeStatus();
        this.delateNote();
        this.editNotes();
    }

    showNotes() {

        if (!this.userNotes) return;

        let notesHtml = this.userNotes.notes.map(note => {
            let important = note.important ? "important" : "";
            let done = note.status == "done" ? "done" : "";
            return `
                    <div class="item" data-index = "${note.id}" data-modal="${note.id}">
                        <span class="dots ${important} ${done}"></span>
                        <p class="note__title ${done}">${note.title}</p>
                        <p class="note__date ${done}">${note.date}</p>
                        <button type="button" class="btn btn-danger delate">Delate</button>
                        <button type="button" class="btn btn-info edit">Edit</button>
                    </div>
                `;
        });

        this.notesWrap.innerHTML = notesHtml.join("");
    }

    addNote() {

        this.addNoteBtn.addEventListener("click", (e) => {
            let date = this.noteDate.valueAsDate;
            if (date) date.setHours(0, 0, 0);
            else date = new Date();

            let title = this.noteTitle.value.trim();
            if (title == "") {
                this.showMessage(this.noteTitle, "Fill in the title field");
                return;
            }

            let id, amountOfNotes = this.userNotes.notes.length;
            if (amountOfNotes != 0) id = this.userNotes.notes[amountOfNotes - 1].id + 1;
            else id = amountOfNotes;

            let tempNote = {
                id,
                title,
                date: this.getDateFormat(date),
                important: this.noteCheckbox.checked,
                status: "warning",
            };

            this.notesDB.forEach(item => {
                if (item.user == this.user.login) {
                    item.notes.push(tempNote);
                }
            });

            this.local.updateNotesDB(this.notesDB);

            this.clearInputs();
            this.showNotes();
        })

    }

    changeStatus() {


        this.notesWrap.addEventListener("click", (e) => {
            if (e.target.matches("p")) {
                e.target.parentElement.children[0].classList.toggle("done")
                e.target.parentElement.children[1].classList.toggle("done")
                e.target.parentElement.children[2].classList.toggle("done");

                let index = e.target.parentElement.dataset.index;
                this.notesDB.forEach(item => {
                    if (item.user == this.user.login) {
                        item.notes.forEach(note => {
                            if (note.id == index) {
                                note.status = (note.status == "warning") ? "done" : "warning";
                            }
                        });
                    }
                });

                this.local.updateNotesDB(this.notesDB);
            }
        })
    }

    delateNote() {

        this.notesWrap.addEventListener("click", (e) => {
            if (e.target.classList.contains("delate")) {
                let indexEl = e.target.parentElement.dataset.index;
                e.target.parentElement.remove();

                this.notesDB.forEach(item => {
                    if (item.user == this.user.login) {
                        item.notes.forEach((note, index, arr) => {
                            if (note.id == indexEl) {
                                arr.splice(index, 1);
                            }
                        });
                    }
                });

                this.local.updateNotesDB(this.notesDB);
            }
        });

    }

    editNotes() {
        this.notesWrap.addEventListener("click", (e) => {
            if (!e.target.classList.contains("edit")) return
            const modalId = e.target.parentElement.dataset.modal;

            this.openModal(modalId);

        })
    }

    openModal(id) {
        const note = this.userNotes.notes.find(note => note.id == id)
        const modalHtml = `
            <div class="modal show" data-modal = "${note.id}">
                <svg class="modal__cross" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                    viewBox="0 0 96 96" enable-background="new 0 0 96 96" xml:space="preserve">
                    <polygon fill="black" points="96,14 82,0 48,34 14,0 0,14 34,48 0,82 14,96 48,62 82,96 96,82 62,48 "/>
                </svg>
                <form action="" id="edit-note" class="edit-note row">
                        <input type="date" id="modal-note__date" class="note__date form-control">
                        <input type="text" id="modal-note__text" class="note__title form-control"
                                placeholder="edit note ..." value = "${note.title}">
                        <div class=" form-check form-switch ">
                            <input class="form-check-input" type="checkbox" role="switch" id="modal-note__checkbox" ${note.important ? "checked" : ""}>
                            <label class="form-check-label" for="modal-note__checkbox">Important</label>
                        </div>
                        <div class="edit__btn">
                            <button type="button" id="note__edit" class="btn btn-primary">Edit note</button>
                        </div>
                </form>
            </div>
        `;
        this.overlay.classList.add("show");
        this.notesWrap.insertAdjacentHTML("afterend", modalHtml)

        this.closeModal();

        const modal = document.querySelector(".modal")

        modal.addEventListener("click", (e) => {
            if (!e.target.matches("button")) return
            const formEl = modal.querySelector("form")

            let newDate = formEl[0].valueAsDate;
            if (newDate) newDate.setHours(0, 0, 0);
            else newDate = new Date();

            let newTitle = formEl[1].value.trim();
            if(newTitle == "") {
                this.showMessage(formEl[0], "Fill in the title field.")
                return;
            }
            let important = formEl[2].checked;

            this.notesDB.forEach(item => {
                if (item.user == this.user.login) {
                    item.notes.forEach((note) => {
                        if (note.id == id) {
                            note.date = this.getDateFormat(newDate);
                            note.title = newTitle;
                            note.important = important;
                        }
                    });
                }
            });
            this.local.updateNotesDB(this.notesDB);

            modal.remove();
            this.overlay.classList.remove("show");

            this.showNotes();
        })

    }

    closeModal() {
        const modal = document.querySelector(".modal")

        this.overlay.addEventListener("click", (e) => {
            this.overlay.classList.remove("show");
            modal.remove();
        })

        const modalCross = document.querySelector(".modal__cross");
        modalCross.addEventListener("click", (e) => {
            this.overlay.classList.remove("show");
            modal.remove();
        })
    }
    showMessage(element, text) {
        const message = document.createElement("p");
        message.classList.add("message");
        message.textContent = text;
        element.insertAdjacentElement("afterend", message);
        setTimeout(() => {
            message.remove();
        }, 2000);
    }

    getDateFormat(date) {
        let d = date.getDate() <= 9 ? "0" + date.getDate() : date.getDate();
        let month = (date.getMonth() + 1) <= 9 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1);
        let hours = date.getHours() <= 9 ? "0" + date.getHours() : date.getHours();
        let minutes = date.getMinutes() <= 9 ? "0" + date.getMinutes() : date.getMinutes();
        return `${d}.${month}.${date.getFullYear()} ${hours}:${minutes}`;
    }

    clearInputs() {
        this.noteDate.value = "";
        this.noteTitle.value = "";
        this.noteCheckbox.checked = false;
    }

}