import { LocalData } from "./data.js";


export class Registration {

    constructor() {
        if (window.location.href != `${window.location.origin}/reg.html`) {
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

                this.local.updateAllUsers(users);
                window.location.href = "auth.html";
            }

        });
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
        if (window.location.href != `${window.location.origin}/auth.html`) {
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
        if (window.location.href != `${window.location.origin}/user.html`) {
            return;
        }
        this.local = new LocalData();
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
            window.location.href = `${window.location.origin}/notes.html`;
        });
    }
    save() {
        this.saveBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const pass = this.passwordInputs[0].value;
            const cpass = this.passwordInputs[1].value;
            const login = this.loginEl.value.trim();


            if (pass == "") {
                this.showMessage(this.passwordInputs[0], "password is empty !")
            } else if (pass != cpass) {
                this.showMessage(this.passwordInputs[0], "Password mismatch !");
            } else if (login == "") {
                this.showMessage(this.loginEl, "Login is empty !");
            } else {

                let userUpdate = {
                    login,
                    pass,
                }

                let noteDB = this.local.getNotesDB();
                const users = this.local.getUsers();

                const findUser = users.filter(user =>user.login != this.user.login)
                                      .find(user => user.login == userUpdate.login);

                if (findUser){
                    this.showMessage(this.loginEl, "Login is already taken");
                    return;
                } 
                else {
                    this.local.updateUser(users, this.user, userUpdate);
                    this.local.updateUserInNotesDB(noteDB, this.user, userUpdate)
                    this.local.sessionClear();
                    this.local.sessionUpdate(userUpdate);
                }

                window.location.href = "notes.html";
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
