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

/************************   Create   ************************/

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

/************************   Read   ************************/
let listTodo = document.getElementById("list-todo");
let listDone = document.getElementById("list-done");
//시간순 정렬해서 query로 불러오기
let docs = await getDocs(query(collection(db, "todolist"), orderBy("time")));

function readTodo() {
  docs.forEach((doc) => {
    let todo = doc.data()["todo"];
    let done = doc.data()["done"];

    let template = document.getElementById("template-id");
    let clone = document.importNode(template.content, true);
    let chkBox = clone.querySelector("ul > li > input");
    let label = clone.querySelector("ul > li > label");
    let buttons = clone.querySelector("ul > li > .two-buttons");
    let leftBtn = clone.querySelector("ul > li > .two-buttons > #left-button");
    let rightBtn = clone.querySelector(
      "ul > li > .two-buttons > #right-button"
    );
    chkBox.id = doc.id;
    label.htmlFor = doc.id;
    label.textContent = todo;
    buttons.id = doc.id;

    //DB의 done 필드가 "no" 일 때
    if (done == "no") {
      listTodo.append(clone);
    }
    //DB의 done 필드가 "yes" 일 때
    else if (done == "yes") {
      chkBox.checked = true;
      chkBox.parentElement.querySelector("label").classList.add("checked");
      listDone.append(clone);
    } else {
    }

    //leftBtn onclick event 추가
    leftBtn?.addEventListener("click", (event) => {
      if (event.target.classList[0] == "edit-button") {
        editTodo(event.target);
      } else if (event.target.classList[0] == "confirm-button") {
        confirmEdit(event.target);
      } else {
      }
    });
    //rightBtn onclick event 추가
    rightBtn?.addEventListener("click", (event) => {
      if (event.target.classList[0] == "delete-button") {
        deleteTodo(event.target);
      } else if (event.target.classList[0] == "cancel-button") {
        cancelEdit(event.target);
      } else {
      }
    });
    //chcBox onclick event 추가
    chkBox?.addEventListener("click", (event) => {
      checkTodo(event.target);
    });
  });
}

/************************   Update   ************************/

//'edit 버튼' 클릭시
function editTodo(element) {
  let item_to_edit = element.parentElement.parentElement.querySelector("label");
  //label 텍스트를 before_edit에 저장하고
  let before_edit = item_to_edit.textContent;
  //label 텍스트를 비움
  item_to_edit.textContent = "";
  //label 안에 입력창 만들고
  let new_input = document.createElement("input");
  item_to_edit.appendChild(new_input);
  //입력창의 디폴트값으로 before_edit을 삽입
  item_to_edit.querySelector("input").value = before_edit;

  //'edit-button'을 'confirm-button'으로 변경
  element.textContent = "✓";
  element.classList.remove("edit-button");
  element.classList.add("confirm-button");
  //'delete-button'을 'cancel-button'으로 변경
  element.parentElement.querySelector("#right-button").textContent = "↺";
  element.parentElement
    .querySelector("#right-button")
    .classList.remove("delete-button");
  element.parentElement
    .querySelector("#right-button")
    .classList.add("cancel-button");
}

//'confirm 버튼' 클릭시
async function confirmEdit(element) {
  let buttons = element.parentElement;
  let docID = buttons.id;
  let todoDoc = await getDoc(doc(db, "todolist", docID));
  let before_edit = todoDoc.data()["todo"];
  let after_edit = buttons.parentElement.querySelector("label > input").value;
  buttons.parentElement.querySelector("label > input").remove();

  //check if the input is blank
  if (after_edit == "") {
    // do nothing on todo-text
    buttons.parentElement.querySelector("label").textContent = before_edit;
  } else {
    //update todo-text in label
    buttons.parentElement.querySelector("label").textContent = after_edit;
    //update todo-text in DB
    await updateDoc(doc(db, "todolist", docID), {
      todo: after_edit,
    });
  }
  //'confirm-button'을 'edit-button'으로 변경
  element.textContent = "✎";
  element.classList.remove("confirm-button");
  element.classList.add("edit-button");
  //'cancel-button'을 'delete-button'으로 변경
  buttons.querySelector("#right-button").textContent = "—";
  buttons.querySelector("#right-button").classList.remove("cancel-button");
  buttons.querySelector("#right-button").classList.add("delete-button");
  console.log(buttons.querySelector("#right-button").classList);
}

//'cancel 버튼' 클릭시
async function cancelEdit(element) {
  let buttons = element.parentElement;
  let docID = buttons.id;
  let todoDoc = await getDoc(doc(db, "todolist", docID));
  let before_edit = todoDoc.data()["todo"];

  // do nothing on todo-text
  buttons.parentElement.querySelector("label").textContent = before_edit;
  //'confirm-button'을 'edit-button'으로 변경
  buttons.querySelector("#left-button").textContent = "✎";
  buttons.querySelector("#left-button").classList.remove("confirm-button");
  buttons.querySelector("#left-button").classList.add("edit-button");

  //'cancel-button'을 'delete-button'으로 변경
  element.textContent = "—";
  element.classList.remove("cancel-button");
  element.classList.add("delete-button");
}

//'checkbox' 클릭시
async function checkTodo(element) {
  let docID = element.id;
  if (element.checked) {
    element.parentElement.querySelector("label").classList.add("checked");
    await updateDoc(doc(db, "todolist", docID), {
      done: "yes",
    });
  } else {
    element.parentElement.querySelector("label").classList.remove("checked");
    await updateDoc(doc(db, "todolist", docID), {
      done: "no",
    });
  }
  window.location.reload();
}
/************************   Delete   ************************/

async function deleteTodo(element) {
  let docID = element.parentElement.id;
  await deleteDoc(doc(db, "todolist", docID));
  window.location.reload();
}

/************************   Initiate   ************************/
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
/************************   Initiate   ************************/
initPage();
let addBtn = document.getElementById("add-button");
let inputBox = document.getElementById("input-box");
let confBtn = document.querySelector(".confirm-button");
let cancBtn = document.querySelector(".cancel-button");
let keysPressed = {};

document.addEventListener("keydown", (event) => {
  keysPressed[event.key] = true;
});
//'Add 버튼' 클릭시
addBtn?.addEventListener("click", addTodo);
//'Enter-key' 클릭시
inputBox?.addEventListener("keypress", (event) => {
  if (event.key == "Enter") {
    event.preventDefault();
    addTodo();
  }
});
//'Confirm 버튼' 클릭시
confBtn?.addEventListener("click", (event) => {
  event.preventDefault();
  confirmEdit(event.target);
});
//'Cancel 버튼' 클릭시
cancBtn?.addEventListener("click", (event) => {
  event.preventDefault();
  cancelEdit(event.target);
});
