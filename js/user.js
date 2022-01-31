import { LocalData } from "./data.js";


export class Registration {

    constructor() {
        this.local = new LocalData();
        if (this.verify()) {
            this.initDOMElemets();
            this.creatUser();
        }
    }


    verify() {
        if (!window.location.href.includes("reg.html")) {
            return false;
        }
        return true;
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
        this.users = this.local.getUsers();

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

                let id, usersCount = this.users.length;
                if (usersCount != 0) id = this.users[usersCount - 1].id + 1;
                else id = usersCount;

                let newUser = {
                    id,
                    login,
                    pass,
                    role: "user",
                    permissions: { canAdd: true, canEdit: true, canDelete: true }
                }

                this.addUser(newUser) ?
                    window.location.href = "auth.html" :
                    this.showMessage(this.loginEl, "Login is already taken");
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

    showPassword() {
        this.checkboxEl.addEventListener("change", (e) => {
            this.passwordInputs.forEach(input => {
                input.type = e.target.checked ? "text" : "password";
            });
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
        if (!window.location.href.includes("auth.html")) {
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


export class Settings {

    constructor() {
        if (!window.location.href.includes("user.html")) return;

        this.local = new LocalData();
        if (!this.local.sessionGetUser()) window.location.href = `./auth.html`;

        this.initDOMElemets();
        this.update();
    }

    initDOMElemets() {
        this.formEl = document.querySelector("#msform");
        this.loginEl = document.querySelector("[name='login']");
        this.checkboxEl = document.querySelector("#show_pass");
        this.passwordInputs = document.querySelectorAll(".pass");
        this.exitBtn = document.querySelector(".exit");
        this.saveBtn = document.querySelector(".save");
    }

    update() {
        this.user = this.local.sessionGetUser();

        this.loginEl.value = this.user.login;
        this.passwordInputs.forEach(passEl => {
            passEl.value = this.user.pass;
            // passEl.type = "text";
            // this.checkboxEl.checked = "true";
        });
        this.showPassword();
        this.exit();
        this.save();
    }


    showPassword() {
        this.checkboxEl.addEventListener("change", (e) => {
            this.passwordInputs.forEach(input => {
                input.type = e.target.checked ? "text" : "password";
            });
        });
    }
    exit() {
        this.exitBtn.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = `./notes.html`;
        });
    }
    save() {
        this.saveBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const pass = this.passwordInputs[0].value;
            const cpass = this.passwordInputs[1].value;

            const login = this.user.login;
            const id = this.user.id;
            const role = this.user.role;
            const permissions = this.user.permissions

            if (pass == "") {
                this.showMessage(this.passwordInputs[0], "password is empty !")
                return;
            } else if (pass != cpass) {
                this.showMessage(this.passwordInputs[0], "Password mismatch !");
                return;
            } else if (pass == this.user.pass) {
                window.location.href = `./notes.html`;
                return;
            }
            const newPass = pass;


            const users = this.local.getUsers();
            this.user = this.local.updatePassword(users, this.user, newPass);

            this.local.sessionClear();
            this.local.sessionUpdate(this.user);

            window.location.href = "./notes.html";

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
