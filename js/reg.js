
const formEl = document.querySelector("#msform");
const loginEl = document.querySelector("[name='login']");
const showPass = document.querySelector("#show_pass");
const passwordInputs = document.querySelectorAll(".pass");
const btnEl = document.querySelector(".action-button");

const users = JSON.parse(localStorage.getItem("users")) || [];

showPass.addEventListener("change", (e) => {
    if (e.target.checked) {
        passwordInputs.forEach(input => {
            input.type = "text";
        });
    } else {
        passwordInputs.forEach(input => {
            input.type = "password";
        });
    }
});

btnEl.addEventListener("click", (e) => {
    e.preventDefault();
    const pass = passwordInputs[0].value;
    const cpass = passwordInputs[1].value;

    const message = document.createElement("p")
    message.classList.add("message");


    if (pass !== cpass && loginEl.value.trim() != "") {
        message.textContent = "Password mismatch !";
        passwordInputs[0].after(message);
        setTimeout(() => {
            message.remove();
        }, 2000);
    }
    else {
        let userTemp = {
            login: loginEl.value.trim(),
            pass: pass,
        }

        let findUser = users.find(user => user.login == userTemp.login);
        if (!findUser) users.push(userTemp);
        else {
            message.textContent = "Login is already taken";
            loginEl.after(message);
            setTimeout(() => {
                message.remove();
            }, 2000);
            return;
        }

       
        localStorage.setItem("users", JSON.stringify(users));

        window.location.href = "auth.html";
    }
});



