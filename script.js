// Firebase SDK 라이브러리 가져오기
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Firebase 구성 정보 설정
const firebaseConfig = {
  apiKey: "AIzaSyAWprZet_YauIxbEG6bMbRPCZEDzMZx3iI",
  authDomain: "sparta-12205.firebaseapp.com",
  projectId: "sparta-12205",
  storageBucket: "sparta-12205.appspot.com",
  messagingSenderId: "1030544097571",
  appId: "1:1030544097571:web:2368d1ac1eeb2439c24c96",
  measurementId: "G-FD4Q8M4PP1",
};

// Firebase 인스턴스 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Toast Message Pop-up function
let toastMessage = document.getElementById("toast_message");
function toastOn(toastkey) {
  if (toastkey == "on") {
    toastMessage.classList.add("active");
    setTimeout(function () {
      toastMessage.classList.remove("active");
    }, 1000);
  } else {
  }
}

/******* When Document is Ready *******/
let toastkey = sessionStorage.getItem("toastkey");
function readyDoc() {
  if (document.readyState !== "loading") {
    //read saved data
    readTodo();
    //active toastOn function depending on toastkey
    toastOn(toastkey);
    //reset the toastkey in the session storage into "off"
    sessionStorage.setItem("toastkey", "off");
  } else {
    document.addEventListener("DOMContentLoaded", toastOn);
  }
}

/*******   Create   *******/
let addBtn = document.getElementById("add-button");
let inputBox = document.getElementById("input-box");

async function addTodo() {
  let input = inputBox.value;
  if (input == "") {
    alert("Please enter what to do"); // do nothing
  } else {
    //data storage에 저장할 document 생성
    let doc = {
      todo: input,
      time: Timestamp.now(),
      done: "no",
    };
    //"todolist"라는 collection에 데이터 저장
    await addDoc(collection(db, "todolist"), doc);
    //toast를 위해 session storage에 toastkey 저장
    sessionStorage.setItem("toastkey", "on");
    //입력창 초기화 및 추가된 할일 목록 업데이트를 위한 페이지 새로고침
    window.location.reload();
  }
}
//'Add 버튼' 클릭시
addBtn.addEventListener("click", addTodo);
//'Enter-key' 클릭시
inputBox.addEventListener("keypress", function () {
  if (KeyboardEvent.keyCode == 13) {
    KeyboardEvent.preventDefault();
    addTodo();
  }
});

/*******   Read   *******/
let listTodo = document.getElementById("list-todo");
let listDone = document.getElementById("list-done");
//시간순 정렬해서 query로 불러오기
let docs = await getDocs(query(collection(db, "todolist"), orderBy("time")));

function readTodo() {
  docs.forEach((doc) => {
    let todo = doc.data()["todo"];
    let done = doc.data()["done"];
    let time = doc.data()["time"];

    //done이 "no"일 때 추가할 template
    let temp_html_todo = `
         <ul class="list-group" id="${doc.id}">
             <li class="list-group-item">
               <input class="form-check-input me-1" type="checkbox" id="${time}" />
               <label for="${time}">${todo}</label>
             </li>
             <button class="edit-button">✄</button>
             <button class="delete-button">✕</button>
         </ul>`;

    //done이 "yes"일 때 추가할 template
    let temp_html_done = `
         <ul class="list-group" id="${doc.id}">
             <li class="list-group-item">
               <input class="form-check-input me-1" type="checkbox" id="${time}" checked/>
               <label for="${time}" class="done">${todo}</label>
             </li>
             <button class="edit-button">✄</button>
             <button class="delete-button">✕</button>
         </ul>`;

    if (done == "no") {
      listTodo.append(temp_html_todo);
    } else if (done == "yes") {
      listDone.append(temp_html_done);
    } else {
    }
  });
}

/*******   Update   *******/
let editBtn = document.getElementsByClassName("edit-button")[0];
let confBtn = document.getElementsByClassName("confirm-button")[0];
let cancBtn = document.getElementsByClassName("cancel-button")[0];

//'edit 버튼' 클릭시
function editTodo(element) {
  let item_to_edit = element.parent().children("li").children("label");
  let before_edit = item_to_edit.text();
  item_to_edit.text("");
  item_to_edit.append(`<input type="text" value="${before_edit}"/>`);
  // edit-button -> confirm-button
  element.text("✓").removeClass("edit-button").addClass("confirm-button");
  // delete-button -> cancel-button
  element
    .parent()
    .children(".delete-button")
    .text("↺")
    .removeClass("delete-button")
    .addClass("cancel-button");
}

editBtn?.addEventListener("click", editTodo(this));

//'confirm 버튼' 클릭시
async function confirmEdit(element) {
  let docID = element.parentElement.id;
  let findRef = doc(db, "todolist", docID);
  let findDoc = await getDoc(findRef);
  let before_edit = findDoc.data()["todo"];
  let after_edit = element
    .parent()
    .children("li")
    .children("label")
    .children("input")
    .val();

  // check if the input is blank
  if (after_edit == "") {
    // do nothing on todo-text
    element.parent().children("li").children("label").text(before_edit);
  } else {
    // update todo-text
    element.parent().children("li").children("label").text(after_edit);
    updateDoc(doc(db, "todolist", docID), {
      todo: after_edit,
    });
  }
  // confirm-button -> edit-button
  element.text("✄").removeClass("confirm-button").addClass("edit-button");

  // cancel-button -> delete-button
  element
    .parent()
    .children(".cancel-button")
    .text("✕")
    .removeClass("cancel-button")
    .addClass("delete-button");
}
if (confBtn) confBtn.addEventListener("click", confirmEdit(this));

//'cancel 버튼' 클릭시
async function cancelEdit(element) {
  let docID = element.parentElement.id;
  let findRef = doc(db, "todolist", docID);
  let findDoc = await getDoc(findRef);
  let before_edit = findDoc.data()["todo"];

  // do nothing on todo-text
  element.parent().children("li").children("label").text(before_edit);
  // confirm-button -> edit-button
  element
    .parent()
    .children(".confirm-button")
    .text("✄")
    .removeClass("confirm-button")
    .addClass("edit-button");

  // cancel-button -> delete-button
  element.text("✕").removeClass("cancel-button").addClass("delete-button");
}

if (cancBtn) cancBtn.addEventListener("click", cancelEdit(this));

//'checkbox' 클릭시
let chkBox = document.getElementsByClassName("form-check-input")[0];
if (chkBox)
  chkBox.addEventListener("click", function () {
    let docID = this.parentElement.parentElement.id;

    if (this.checked) {
      this.parent().children("label").addClass("done");
      updateDoc(doc(db, "todolist", docID), {
        done: "yes",
      });
    } else {
      this.parent().children("label").removeClass("done");
      updateDoc(doc(db, "todolist", docID), {
        done: "no",
      });
    }
    window.location.reload();
  });

/*******   Delete   *******/
let delBtn = document.getElementsByClassName("delete-button")[0];

if (delBtn)
  //'delete 버튼' 클릭시
  delBtn.addEventListener("click", function () {
    let docID = this.parentElement.id;
    this.parent().remove();
    deleteDoc(doc(db, "todolist", docID));
  });

readyDoc();
