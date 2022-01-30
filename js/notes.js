import { LocalData } from "./data.js";


export class Note {

    constructor() {
        if (!window.location.href.includes("notes.html")) {
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
        if (!this.user) window.location.href = `./auth.html`;
        document.querySelector("[href='./notes.html']").className += " active";
    }

    initDOMElemets() {
        this.noteDate = document.querySelector("#note__date");
        this.notesWrap = document.querySelector(".todo-wrap");
        this.noteTitle = document.querySelector("#note__title");
        this.noteCheckbox = document.querySelector("#note__checkbox");
        this.addNoteBtn = document.querySelector("#note__add");
        this.overlay = document.querySelector(".overlay");
        this.searchEl = document.querySelector("#search-note");

        document.querySelector("#user__login").textContent = this.user.login;
    }

    initNotesDB() {
        let notesDB = this.local.getNotesDB();
        let userNotes = notesDB.find(item => item.user == this.user.login);

        if (!userNotes) {
            notesDB.push({
                user: this.user.login,
                notes: [],
            });
        }
        this.local.updateNotesDB(notesDB);
        this.notesDB = this.local.getNotesDB();
        this.userNotes = this.notesDB.find(item => item.user == this.user.login);
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
        this.searchNotes();
    }

    addNote() {

        this.addNoteBtn.addEventListener("click", (e) => {

            let date = this.noteDate.valueAsDate;
            if (date) date.setHours(0, 0, 0);
            else date = new Date();

            let title = this.noteTitle.value.trim();
            if (title == "") {
                this.showMessage(this.noteTitle, "message", "Fill in the title field");
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

            this.local.addNote(this.notesDB, this.user, tempNote);

            this.clearInputs();
            this.showNotes();
            this.showNotification("notification", "Note added");
        })

    }

    changeStatus() {
        this.notesWrap.addEventListener("click", (e) => {
            if (e.target.matches("p")) {
                e.target.parentElement.children[0].classList.toggle("done")
                e.target.parentElement.children[1].classList.toggle("done")
                e.target.parentElement.children[2].classList.toggle("done");

                let index = e.target.parentElement.dataset.index;

                this.local.changeStatus(this.notesDB, this.user, index);

            }
        })
    }

    delateNote() {
        this.notesWrap.addEventListener("click", (e) => {
            if (e.target.classList.contains("delate")) {
                let index = e.target.parentElement.dataset.index;
                e.target.parentElement.remove();
                this.local.delateNote(this.notesDB, this.user, index);
                this.showNotification("notification", "Note deleted");
            }
        });
    }

    searchNotes() {
        let notes = document.querySelectorAll(".todo-wrap .item");
        let text = this.searchEl.value;

        this.filterItem(notes, text);

        this.searchEl.addEventListener("input", (e) => {
            notes = document.querySelectorAll(".todo-wrap .item");
            text = e.target.value;
            this.filterItem(notes, text);
        });
    }

    filterItem(notes, text) {
        notes.forEach(note => {
            let title = note.querySelector(".note__title").textContent;

            if (title.includes(text)) {
                note.classList.add("show");
                note.classList.remove("hide");
            }
            else {
                note.classList.add("hide")
                note.classList.remove("show");
            }
        });
    }


    editNotes() {
        this.notesWrap.addEventListener("click", (e) => {
            if (!e.target.classList.contains("edit")) return
            const modalId = e.target.parentElement.dataset.modal;

            this.openModal(modalId);

            const modal = document.querySelector(".modal")

            modal.addEventListener("click", (e) => {
                if (!e.target.matches("button")) return
                const formEl = modal.querySelector("form")

                let newDate = formEl[0].valueAsDate;
                if (newDate) newDate.setHours(0, 0, 0);
                else newDate = new Date();
                newDate = this.getDateFormat(newDate)
                let newTitle = formEl[1].value.trim();
                if (newTitle == "") {
                    this.showMessage(formEl[0], "message", "Fill in the title field.")
                    return;
                }


                let newNote = {
                    id: modalId,
                    date: newDate,
                    title: newTitle,
                };

                this.local.editNote(this.notesDB, this.user, newNote);

                modal.remove();
                this.overlay.classList.remove("show");
                this.showNotification("notification", "Note changed");
                this.showNotes();

            });
        });
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
                       
                        <div class="edit__btn">
                            <button type="button" id="note__edit" class="btn btn-primary">Edit note</button>
                        </div>
                </form>
            </div>
        `;
        this.overlay.classList.add("show");
        this.notesWrap.insertAdjacentHTML("afterend", modalHtml)

        this.closeModal();

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

    showNotification(className, text) {
        const message = document.createElement("p");
        message.classList.add(className);
        message.textContent = text;
        this.notesWrap.insertAdjacentElement("afterend", message);
        setTimeout(() => {
            message.style.right = "1px";
        }, 250);
        setTimeout(() => {
            message.style.right = "-175px";

            setTimeout(() => {
                message.remove();
            }, 500);

        }, 2000);

    }
    showMessage(element, className, text) {
        const message = document.createElement("p");
        message.classList.add(className);
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

export class Categories {

    constructor() {
        if (!window.location.href.includes("categories.html")) {
            return;
        }
        this.local = new LocalData();
        this.verify();
        this.initDOMElemets();
        this.noteOperations();

    }

    verify() {
        this.user = this.local.sessionGetUser();
        if (!this.user) window.location.href = `./auth.html`;
        document.querySelector("[href='./categories.html']").className += " active";
    }

    initDOMElemets() {
        this.categoriesEl = document.querySelector(".categories");
        this.inProcessEl = document.querySelector("[data-category='warning']")
        this.importantEl = document.querySelector("[data-category='important']")
        this.doneEl = document.querySelector("[data-category='done']")

        this.noteDate = document.querySelector("#note__date");
        // this.notesWrap = document.querySelector(".todo-wrap");
        this.noteTitle = document.querySelector("#note__title");
        this.noteCheckbox = document.querySelector("#note__checkbox");
        this.addNoteBtn = document.querySelector("#note__add");
        document.querySelector("#user__login").textContent = this.user.login;
        this.overlay = document.querySelector(".overlay");

        this.notesDB = this.local.getNotesDB();
        this.userNotes = this.notesDB.find(item => item.user == this.user.login);
    }

    noteOperations() {
        this.showNotes();
        this.changeNotes();
        this.addNote();
        this.delateNote();
        this.editNotes();
    }
    showNotes() {
        const inProcessNotes = [];
        const imporatantNotes = [];
        const doneNotes = [];

        this.userNotes.notes.forEach(note => {
            if (note.status == "done") doneNotes.push(this.getNote(note));
            else if (note.important) imporatantNotes.push(this.getNote(note));
            else if (note.status == "warning") inProcessNotes.push(this.getNote(note));
        })

        this.inProcessEl.innerHTML = inProcessNotes.join("");
        this.importantEl.innerHTML = imporatantNotes.join("");
        this.doneEl.innerHTML = doneNotes.join("");

    }


    getNote(note) {
        return `
            <div class="note" data-index="${note.id}" data-modal="${note.id}" draggable="true">
                <div class="note__title">${note.title}</div>
                <div class="note__info-box">
                    <div class="note__date">${note.date}</div>
                    <button type="button" class="btn btn-danger delate btn-sm">Delate</button>
                    <button type="button" class="btn btn-info edit btn-sm">Edit</button>
                </div>
            </div>
        `;
    }

    changeNotes() {

        const categoryItems = this.categoriesEl.querySelectorAll(".category__item");

        let current;

        const dragStart = function (note) {
            note.className += ' hold';
            setTimeout(() => { note.className += ' invisable' }, 0);
        };

        const dragEnd = function (note) {
            note.className = 'note';
        }

        const dragOver = function (e) {
            e.preventDefault()

        }

        const dragEnter = function (e) {
            e.preventDefault();
            this.className += ' hovered';
        }

        const dragLeave = function () {
            this.className = 'category__item';
        }


        const dragDrop = function () {
            this.className = 'category__item';
            this.append(current);
        }

        // const notesEl = this.categoriesEl.querySelectorAll(".note");

        // notesEl.forEach(note => {
        //     note.addEventListener("dragstart", dragStart)
        //     current = note;
        // })

        // notesEl.forEach(note => {
        //     note.addEventListener("dragend", dragEnd)
        //     current = note;
        // })

        this.categoriesEl.addEventListener("dragstart", (e) => {
            if (!e.target.matches(".note")) return;
            current = e.target;
            dragStart(current);
        })

        this.categoriesEl.addEventListener("dragend", (e) => {
            if (!e.target.matches(".note")) return;
            current = e.target;
            dragEnd(current);
            let category = current.closest(".category__item").dataset.category;
            this.local.changeInCategory(this.notesDB, this.user, category, current.dataset.index);
        })

        for (const item of categoryItems) {
            item.addEventListener('dragover', dragOver);
            item.addEventListener('dragenter', dragEnter);
            item.addEventListener('dragleave', dragLeave);
            item.addEventListener('drop', dragDrop);
        }

    }

    addNote() {

        this.addNoteBtn.addEventListener("click", (e) => {
            let date = this.noteDate.valueAsDate;
            if (date) date.setHours(0, 0, 0);
            else date = new Date();

            let title = this.noteTitle.value.trim();
            if (title == "") {
                this.showMessage(this.noteTitle, "message", "Fill in the title field");
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

            this.local.addNote(this.notesDB, this.user, tempNote);

            this.clearInputs();
            this.showNotes()

            this.showNotification("notification", "Note added");
        })

    }

    delateNote() {
        this.categoriesEl.addEventListener("click", (e) => {
            if (e.target.classList.contains("delate")) {
                let index = e.target.closest(".note").dataset.index;
                e.target.closest(".note").remove();
                this.local.delateNote(this.notesDB, this.user, index);
                this.showNotification("notification", "Note deleted");
            }
        })
    }

    editNotes() {
        this.categoriesEl.addEventListener("click", (e) => {
            if (!e.target.classList.contains("edit")) return
            const modalId = e.target.closest(".note").dataset.modal;

            this.openModal(modalId);

            const modal = document.querySelector(".modal")

            modal.addEventListener("click", (e) => {
                if (!e.target.matches("button")) return
                const formEl = modal.querySelector("form")

                let newDate = formEl[0].valueAsDate;
                if (newDate) newDate.setHours(0, 0, 0);
                else newDate = new Date();
                newDate = this.getDateFormat(newDate)
                let newTitle = formEl[1].value.trim();
                if (newTitle == "") {
                    this.showMessage(formEl[0], "message", "Fill in the title field.")
                    return;
                }


                let newNote = {
                    id: modalId,
                    date: newDate,
                    title: newTitle,
                };

                this.local.editNote(this.notesDB, this.user, newNote);

                modal.remove();
                this.overlay.classList.remove("show");
                this.showNotification("notification", "Note changed");
                this.showNotes();

            });
        });
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
                       
                        <div class="edit__btn">
                            <button type="button" id="note__edit" class="btn btn-primary">Edit note</button>
                        </div>
                </form>
            </div>
        `;
        this.overlay.classList.add("show");
        this.categoriesEl.insertAdjacentHTML("afterend", modalHtml)

        this.closeModal();

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
    showNotification(className, text) {
        const message = document.createElement("p");
        message.classList.add(className);
        message.textContent = text;
        this.categoriesEl.insertAdjacentElement("afterend", message);
        setTimeout(() => {
            message.style.right = "1px";
        }, 250);
        setTimeout(() => {
            message.style.right = "-175px";

            setTimeout(() => {
                message.remove();
            }, 500);

        }, 2000);

    }
    showMessage(element, className, text) {
        const message = document.createElement("p");
        message.classList.add(className);
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