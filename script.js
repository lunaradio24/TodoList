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

/************************   Create  ************************/
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
//'Add 버튼' 클릭시
addBtn.addEventListener("click", addTodo);
//'Enter-key' 클릭시

inputBox.addEventListener("keyup", function (event) {
  if (event.key == "Enter") {
    event.preventDefault();
    addTodo();
  }
});

/************************   Read  ************************/
let listTodo = document.getElementById("list-todo");
let listDone = document.getElementById("list-done");
//시간순 정렬해서 query로 불러오기
let docs = await getDocs(query(collection(db, "todolist"), orderBy("time")));

function readTodo() {
  docs.forEach((doc) => {
    let todo = doc.data()["todo"];
    let done = doc.data()["done"];
    let time = doc.data()["time"];

    let template = document.getElementById("template-id");
    let clone = document.importNode(template.content, true);
    let input = clone.querySelector("ul > li > input");
    let label = clone.querySelector("ul > li > label");

    clone.id = doc.id;
    input.id = time;
    label.for = time;
    label.textContent = todo;

    if (done == "no") {
      listTodo.append(clone);
    } else if (done == "yes") {
      input.checked = checked;
      label.classList.add("done");
      listDone.append(clone);
    } else {
    }
  });
}

/************************   Update  ************************/
let button1 = document.getElementById("button1");
let button2 = document.getElementById("button2");
let chkBox = document.querySelector(".form-check-input");

//'edit 버튼' 클릭시
function editTodo(element) {
  let item_to_edit = element.parentElement.querySelector("li > label");
  let before_edit = item_to_edit.text();
  item_to_edit.text("");
  item_to_edit.append(`<input type="text" value="${before_edit}"/>`);
  // edit-button -> confirm-button
  element.text("✓").removeClass("edit-button").addClass("confirm-button");
  // delete-button -> cancel-button
  element.parentElement
    .querySelector(".delete-button")
    .text("↺")
    .removeClass("delete-button")
    .addClass("cancel-button");
}

button1?.addEventListener("click", (event) => {
  if (button1.className == "edit-button") {
    editTodo(event.target);
  } else if (button1.className == "confirm-button") {
    confirmEdit(event.target);
  } else {
  }
});

button2?.addEventListener("click", (event) => {
  if (button2.className == "delete-button") {
    deleteTodo(event.target);
  } else if (button2.className == "cancel-button") {
    cancelEdit(event.target);
  } else {
  }
});

// editBtn?.addEventListener("click", (event) => {
//   console.log(event);
//   editTodo(event.target);
// });

//'confirm 버튼' 클릭시
async function confirmEdit(element) {
  let docID = element.parentElement.id;
  let todoDoc = await getDoc(doc(db, "todolist", docID));
  let before_edit = todoDoc.data()["todo"];
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
    // element.parent().children("li").children("label").text(after_edit);
    updateDoc(doc(db, "todolist", docID), {
      todo: after_edit,
    });
    window.location.reload();
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
// if (confBtn) {
//   confBtn.addEventListener("click", confirmEdit(this));
// }

//'cancel 버튼' 클릭시
async function cancelEdit(element) {
  let docID = element.parentElement.id;
  let todoDoc = await getDoc(doc(db, "todolist", docID));
  let before_edit = todoDoc.data()["todo"];

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
// if (cancBtn) {
//   cancBtn.addEventListener("click", cancelEdit(this));
// }

//'checkbox' 클릭시
if (chkBox) {
  chkBox.addEventListener("click", function (event) {
    let docID = event.target.parentElement.parentElement.id;

    if (event.target.checked) {
      event.target.parent().children("label").addClass("done");
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
}

/************************   Delete  ************************/
let delBtn = document.querySelector("#buttons > button.delete-button");
function deleteTodo(event) {
  console.log("hi");

  let docID = event.target.parentElement.parentElement.parentElement.id;
  deleteDoc(doc(db, "todolist", docID));
  window.location.reload();
}
//'delete 버튼' 클릭시
if (delBtn) {
  delBtn.addEventListener("click", deleteTodo);
}

/************************   Initiate  ************************/
let toastkey = sessionStorage.getItem("toastkey");
function initPage() {
  //문서의 현재 상태가 로딩 중이 아니라면
  if (document.readyState !== "loading") {
    //바로 readTodo 함수를 사용해 저장된 데이터를 불러와 웹페이지에 표시합니다.
    readTodo();
    //active toastOn function depending on toastkey
    toastOn(toastkey);
    //reset the toastkey in the session storage into "off"
    sessionStorage.setItem("toastkey", "off");
  } else {
    //로딩 중이라면 DOM 컨텐츠 로딩을 모두 완료한 후, 위의 3가지를 실행합니다.
    document.addEventListener("DOMContentLoaded", function () {
      readTodo();
      toastOn(toastkey);
      sessionStorage.setItem("toastkey", "off");
    });
  }
}
initPage();
