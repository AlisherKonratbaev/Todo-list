
const authEl = document.querySelector("#auth");
const loginEl = document.querySelector("#login");
const passEl = document.querySelector("#pass");
const users = JSON.parse(localStorage.getItem("users")) || [];

// let authUser = JSON.parse(sessionStorage.getItem("user")) || {};
// 
authEl.addEventListener("click", (e) => {

    let login = loginEl.value;
    let pass = passEl.value;

    let findUser = users.find(user => {
        return user.login === login && user.pass === pass;
    });
    if (findUser) {
        sessionStorage.clear();
        // authUser = {...findUser}
        sessionStorage.setItem("user", JSON.stringify(findUser))
        window.location.href = "notes.html";
    }
    else {
        const message = document.createElement("p")
        message.classList.add("message");
        message.textContent = "Login or password is incorrect";
        passEl.after(message);
        setTimeout(() => { message.remove() }, 2000);
    }

})