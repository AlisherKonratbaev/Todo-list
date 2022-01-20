
const user = JSON.parse(sessionStorage.getItem("user"))


if (!user) window.location.href = "auth.html";


const notesAll = JSON.parse(localStorage.getItem("notesAll")) || [];
const userNotes = notesAll.find(item => item.user == user.login);
console.log(userNotes);
if (!userNotes) {
    notesAll.push({
        user: user.login,
        notes: [],
    })
    localStorage.setItem("notesAll", JSON.stringify(notesAll));

} else{
    showNotes();
}



const noteDate = document.querySelector("#note__date");
const noteTitle = document.querySelector("#note__title");
const noteCheckbox = document.querySelector("#note__checkbox");
const addNoteBtn = document.querySelector("#note__add");




addNoteBtn.addEventListener("click", (e) => {
    let date = noteDate.valueAsDate;

    if (date) date.setHours(0, 0, 0);
    else date = new Date();

    let message = document.createElement("p");
    message.classList.add("message");

    let title = noteTitle.value.trim();
    if (title == "") {
        message.textContent = "Fill in the title field";
        noteTitle.insertAdjacentElement("afterend", message);
        setTimeout(() => { message.remove() }, 2000);
        return;
    }


    const userNotes = notesAll.find(item => item.user == user.login);
    
    let id;
    if(userNotes.notes.length != 0) id = userNotes.notes[userNotes.notes.length - 1].id + 1;
    else id = userNotes.notes.length;
    let tempNote = {
        id,
        title,
        date: getDateFormat(date),
        important: noteCheckbox.checked,
        status: "warning",
    };


    notesAll.forEach(item => {
        if (item.user == user.login) {
            item.notes.push(tempNote);
        }
    });

    localStorage.setItem("notesAll", JSON.stringify(notesAll));

    clearInputs();
    showNotes();
})

function getDateFormat(date) {
    let d = date.getDate() <= 9 ? "0" + date.getDate() : date.getDate();
    let month = (date.getMonth() + 1) <= 9 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1);
    let hours = date.getHours() <= 9 ? "0" + date.getHours() : date.getHours();
    let minutes = date.getMinutes() <= 9 ? "0" + date.getMinutes() : date.getMinutes();
    return `${d}.${month}.${date.getFullYear()} ${hours}:${minutes}`;
}

function showNotes() {
    const userNotes = notesAll.find(item => item.user == user.login);
    if(!userNotes) return;
    const notesWrap = document.querySelector(".todo-wrap");
    let notesHtml = userNotes.notes.map(note => {
        let important = note.important ? "important" : "";
        let done = note.status == "done" ? "done" : "";
        return `
                <div class="item" data-index = "${note.id}">
                    <span class="dots ${important} ${done}"></span>
                    <p class="note__title ${done}">${note.title}</p>
                    <p class="note__date ${done}">${note.date}</p>
                    <button type="button" class="btn btn-danger delate">Delate</button>
                    <button type="button" class="btn btn-info edit">Edit</button>
                </div>
            `;
    });
    // console.log(userNotes);
    notesWrap.innerHTML = notesHtml.join("");


}

notesAction();
delateNote();
function notesAction() {
    const notesWrap = document.querySelector(".todo-wrap");
    
    notesWrap.addEventListener("click", (e) => {
        if (e.target.matches("p")) {
            e.target.parentElement.children[0].classList.toggle("done")
            e.target.parentElement.children[1].classList.toggle("done")
            e.target.parentElement.children[2].classList.toggle("done");

            let index = e.target.parentElement.dataset.index;
            notesAll.forEach(item => {
                if (item.user == user.login) {
                    item.notes.forEach(note => {
                        if (note.id == index) {
                            note.status = (note.status == "warning") ? "done" : "warning";
                        }
                    });
                }
            });

            localStorage.setItem("notesAll", JSON.stringify(notesAll));


        }
    })
}

function delateNote() {

    const notesWrap = document.querySelector(".todo-wrap");
    notesWrap.addEventListener("click", (e) => {
        if (e.target.classList.contains("delate")) {
            let indexEl = e.target.parentElement.dataset.index;
            e.target.parentElement.remove();

            notesAll.forEach(item => {
                if (item.user == user.login) {
                    item.notes.forEach((note, index, arr) => {
                        if (note.id == indexEl) {
                            arr.splice(index, 1);
                        }
                    });
                }
            });


            localStorage.setItem("notesAll", JSON.stringify(notesAll));

        }
    });

}
function clearInputs() {
    noteDate.value = "";
    noteTitle.value = "";
    noteCheckbox.checked = false;
}


function editNote() {
    const notesWrap = document.querySelector(".todo-wrap");

    notesWrap.addEventListener("click", (e) => {
        if (e.target.classList.contains("edit")) {
            console.log(1);

        }
    })
}
editNote();


