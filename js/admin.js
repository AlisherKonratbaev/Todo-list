
import { LocalData } from "./data.js";

export class Admin {

    constructor() {
        if (!window.location.href.includes("permissions.html")) {
            return;
        }
        this.local = new LocalData();

        if (this.verify()) {
            this.initDOMElemets();
            this.creatUser();
            this.showUsers();
            this.deleteUsers();
            this.change();
            this.goBack();
        }
    }

    verify() {
        let flag = false;
        this.user = this.local.sessionGetUser();

        if (!this.user) {
            window.location.href = `./auth.html`;
            flag = false;
        }
        else if (this.user.role != "admin") {
            window.location.href = `./notes.html`;
            flag = false;
        } else flag = true;

        return flag;
    }

    initDOMElemets() {
        this.wrap = document.querySelector(".admin__block-wrap");
        this.usersWrap = document.querySelector(".users__wrap");
        this.loginEl = document.querySelector("#login");
        this.passEl = document.querySelector("#pass");
        this.showPassEl = document.querySelector(".show_pass");
        this.isAdminEl = document.querySelector("#isAdmin");
        this.creatBtn = document.querySelector("#creat");
        this.overlay = document.querySelector(".overlay");
        this.backEl = document.querySelector(".admin__block-back");
        this.users = this.local.getUsers();
    }

    showUsers() {
        this.users = this.local.getUsers();

        this.usersList = document.createElement("ul");

        const itemsHtml = this.users.filter(user => (user.login != "admin" && user.login != this.user.login))
            .map((user, index) => {
                return `
                <li class="user-item" data-index = ${user.id}>
                    <p><span>${index + 1}</span>${user.login}</p>
                    <div>
                        <button type="button" class="btn btn-danger delete btn-sm">Delete</button>
                        <button type="button" class="btn btn-info edit btn-sm">Change</button>
                    </div>
                </li>`;
            });
        this.usersList.innerHTML = itemsHtml.join("");
        this.usersWrap.append(this.usersList);
    }

    creatUser() {
        this.showPassword(this.passEl, this.showPassEl);

        this.creatBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const pass = this.passEl.value;
            const login = this.loginEl.value.trim();


            if (pass == "") {
                this.showMessage(this.passEl, "Password is empty !")
            } else if (login == "") {
                this.showMessage(this.loginEl, "Login is empty !")
            } else {

                let id, usersCount = this.users.length;
                if (usersCount != 0) id = this.users[usersCount - 1].id + 1;
                else id = usersCount;

                let newUser = {
                    id,
                    login,
                    pass,
                    role: this.isAdminEl.checked ? "admin" : "user",
                    permissions: { canAdd: true, canEdit: true, canDelete: true }
                }

                if (this.addUser(newUser)) {
                    this.showNotification("notification", "User created");
                    this.clearInputs();
                    this.usersList.remove();
                    this.showUsers();
                } else {
                    this.showMessage(this.loginEl, "Login is already taken");
                }
            }
        });
    }
    addUser(newUser) {
        let creat = false;
        const users = this.local.getUsers();
        const findUser = users.find(user => user.login == newUser.login);

        if (!findUser) {
            this.local.addNewUser(users, newUser);
            creat = true;
        } else {
            creat = false;
        }
        return creat;
    }


    deleteUsers() {
        this.usersWrap.addEventListener("click", (e) => {
            if (!e.target.matches("button.delete")) return
            const id = e.target.closest(".user-item").dataset.index;
            e.target.closest(".user-item").remove();
            this.showNotification("notification", "User deleted");
            this.local.deleteUser(this.users, id);
        })
    }

    change() {
        let id;
        this.usersWrap.addEventListener("click", (e) => {
            if (!e.target.matches("button.edit")) return
            id = e.target.closest(".user-item").dataset.index;
            this.openModal(id);
            this.modalDragAndDrop(id)
            this.save();
            this.closeModal();
        });
    }

    openModal(id) {
        let user = { ...this.users.find(user => user.id == id) }

        this.modalWrap = document.createElement("div");
        this.modalWrap.className = "admin__modal-wrap";

        const modalHtml = `
            <div class="modal show" data-modal = "${user.id}">
                <svg class="modal__cross" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                    viewBox="0 0 96 96" enable-background="new 0 0 96 96" xml:space="preserve">
                    <polygon fill="black" points="96,14 82,0 48,34 14,0 0,14 34,48 0,82 14,96 48,62 82,96 96,82 62,48 "/>
                </svg>
                <form action="" id="modal__admin-form" class="edit-note row">
                    <h2 class="fs-title">Setttings</h2>
                    <input type="text" name="login" id="login__modal" placeholder="Login" value="${user.login}"  disabled/>
                    <input type="password" name="pass" id="pass__modal" placeholder="Password" value="${user.pass}" />
                               
                    <div class="checkbox-wrap">
                        <input type="checkbox" id="show_pass-modal" name="show_pass" class="show_pass">
                        <label for="show_pass-modal">Show password</label>
                        <input type="checkbox" id="isAdmin_modal" ${user.role == "admin" ? "checked" : ""}>
                        <label for="isAdmin_modal">Make admin</label>
                    </div>
                    
                </form>
                <div class="modal__wrap">
                    ${this.getPremissions(user.permissions)}
                </div>
                
                <div class="modal__btns">
                    <button type="button" id="modal__exit" class="btn btn-danger">Exit</button>
                    <button type="button" id="modal__save" class="btn btn-primary">Save</button>
                </div> 
            </div>
        `;
        this.modalWrap.innerHTML = modalHtml;

        this.overlay.classList.add("show");
        this.wrap.insertAdjacentElement("afterend", this.modalWrap);
    }
    getPremissions(permissions) {
        let active = "", notActive = "";

        for (let key in permissions) {
            if (permissions[key]) {
                active += `<div class="modal__item" draggable="true" data-permission="${key}">${key}</div>`
            } else {
                notActive += `<div class="modal__item" draggable="true" data-permission="${key}">${key}</div>`
            }
        }
        return `
            <div class="box" data-id="active">
                Active
            ${active}
            </div>
            <div class="box" data-id="notActive">
                Not active
                ${notActive}
            </div>`;
    }

    modalDragAndDrop(id) {
        let user = this.users.find(user => user.id == id);
        this.stateUser = JSON.parse(JSON.stringify(user))
        if (!this.stateUser) return;

        const boxes = document.querySelectorAll(".box");
        let current, permissionBox, permission;

        const dragStart = function (item) {
            item.className += ' hold';
            setTimeout(() => { item.className += ' invisable' }, 0);
        };

        const dragEnd = function (item) {
            item.className = 'modal__item';

        }

        const dragOver = function (e) {
            e.preventDefault()
        }

        const dragEnter = function (e) {
            e.preventDefault();
            this.className += ' hovered';
        }

        const dragLeave = function () {
            this.className = 'box';
        }

        const dragDrop = function () {
            this.className = 'box';
            this.append(current)
            permissionBox = this.dataset.id;
        }

        this.dragstart = document.addEventListener("dragstart", (e) => {
            if (!e.target.matches(".modal__item")) return;
            current = e.target
            dragStart(current);
        })

        this.dragend = document.addEventListener("dragend", (e) => {
            if (!e.target.matches(".modal__item")) return;
            current = e.target;
            permission = current.dataset.permission;
            dragEnd(current);
            this.checkState(permission, permissionBox);
        })

        for (const box of boxes) {
            box.addEventListener('dragover', dragOver);
            box.addEventListener('dragenter', dragEnter);
            box.addEventListener('dragleave', dragLeave);
            box.addEventListener('drop', dragDrop);
        }
    }

    checkState(permission, permissionBox) {
        if (permissionBox == "active") {
            this.stateUser.permissions[permission] = true;
        } else if (permissionBox == "notActive") {
            this.stateUser.permissions[permission] = false;
        }
    }


    save() {
        const loginEl = document.querySelector("#login__modal")
        const passEl = document.querySelector("#pass__modal");
        const showPassEl = document.querySelector("#show_pass-modal");
        const isAdminEl = document.querySelector("#isAdmin_modal");
        const saveBtn = document.querySelector("#modal__save");

        this.showPassword(passEl, showPassEl)
        saveBtn.addEventListener("click", (e) => {
            if (passEl.value == "") {
                this.showMessage(passEl, "Password is empty !")
                return;
            }
            isAdminEl.checked ? this.stateUser.role = "admin" : this.stateUser.role = "user";
            this.stateUser.pass = passEl.value;

            this.local.updateUser(this.users, this.stateUser)

            this.overlay.classList.remove("show");
            this.modal.remove();
            this.modalWrap.remove();
        })
    }
    closeModal() {
        this.modal = document.querySelector(".modal");
        this.overlay.addEventListener("click", (e) => {
            this.overlay.classList.remove("show");
            this.modal.remove();
            this.modalWrap.remove();
        })

        const modalCross = document.querySelector(".modal__cross");
        modalCross.addEventListener("click", (e) => {
            this.overlay.classList.remove("show");
            this.modal.remove();
            this.modalWrap.remove();
        })

        const modalExitBtn = document.querySelector("#modal__exit");
        modalExitBtn.addEventListener("click", () => {
            this.overlay.classList.remove("show");
            this.modal.remove();
            this.modalWrap.remove();
        })
    }

    goBack() {
        this.backEl.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "./notes.html";
        })
    }
    showPassword(passEl, showPassEl) {
        showPassEl.addEventListener("change", (e) => {
            showPassEl.checked ? passEl.type = "text" : passEl.type = "password";
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

    showNotification(className, text) {
        const message = document.createElement("p");
        message.classList.add(className);
        message.textContent = text;
        this.wrap.insertAdjacentElement("afterend", message);
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

    clearInputs() {
        this.loginEl.value = "";
        this.passEl.value = "";
        this.showPassEl.checked = false;
        this.isAdminEl.checked = false;
    }
}