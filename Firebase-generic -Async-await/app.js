const cl = console.log;

const postContainer = document.getElementById("postContainer");
const postForm = document.getElementById("postForm");
const titleControl = document.getElementById("title");
const contentControl = document.getElementById("content");
const userIdControl = document.getElementById("userId");
const submitBtn = document.getElementById("submitBtn");
const updateBtn = document.getElementById("updateBtn");

const BASE_URL = `https://crud-js-3070f-default-rtdb.firebaseio.com/`;

const POST_URL = `${BASE_URL}/posts.json`;

const createCard = (arr) => {
  let result = "";

  arr.forEach((post) => {
    result += `<div class="col-md-6 offset-md-3">
                <div class="card mb-3" id=${post.id}>
                    <div class="card-header">
                        <h3 class="m-0">${post.title}</h3>
                    </div>
                    <div class="card-body">
                        <p class="m-0">${post.content}</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button onclick="onEdit(this)" class="btn btn-sm btn-outline-info">Edit</button>
                        <button onclick="onRemove(this)" class="btn btn-sm btn-outline-danger">Remove</button>
                    </div>
                </div>
            </div>`;
  });

  postContainer.innerHTML = result;
};

const objToArr = (obj) => {
  let arr = [];
  for (const key in obj) {
    arr.push({ ...obj[key], id: key });
  }

  cl(arr);
  return arr;
};

const makeApiCall = async (apiUrl, methodName, msgBody) => {
  try {
    msgBody = msgBody ? JSON.stringify(msgBody) : null;
    let res = await fetch(apiUrl, {
      method: methodName,
      body: msgBody,
      headers: {
        "Content-type": "application/json",
        Auth: "Token from(LS)",
      },
    });

    return res.json();
  } catch (err) {
    cl(err);
  } finally {
  }
};

const fetchAllPosts = async () => {
  let data = await makeApiCall(POST_URL, "GET"); //up3 => for postArr
  let postArr = objToArr(data); //up2 -> for templating
  createCard(postArr); //up1
};

fetchAllPosts();

const onPostSubmit = async (eve) => {
  eve.preventDefault();

  let postObj = {
    title: titleControl.value,
    content: contentControl.value,
    userId: userIdControl.value,
  };

  let res = await makeApiCall(POST_URL, "POST", postObj);
  postForm.reset();

  let card = document.createElement("div");
  card.className = "card mb-3";
  card.id = res.name;

  card.innerHTML = `<div class="card-header">
                        <h3 class="m-0">${postObj.title}</h3>
                    </div>
                    <div class="card-body">
                        <p class="m-0">${postObj.content}</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button onclick="onEdit(this)" class="btn btn-sm btn-outline-info">Edit</button>
                        <button onclick="onRemove(this)" class="btn btn-sm btn-outline-danger">Remove</button>
                    </div>`;

  postContainer.prepend(card);
};

const onEdit = async (eve) => {
  let EDIT_ID = eve.closest(".card").id;

  localStorage.setItem("EDIT_ID", EDIT_ID);

  let EDIT_URL = `${BASE_URL}/posts/${EDIT_ID}.json`;

  let res = await makeApiCall(EDIT_URL, "GET");

  if (res) {
    titleControl.value = res.title;
    contentControl.value = res.content;
    userIdControl.value = res.userId;

    submitBtn.classList.add("d-none");
    updateBtn.classList.remove("d-none");
  }
};

const onUpdate = async () => {
  let UPDATE_ID = localStorage.getItem("EDIT_ID");

  let UPDATE_URL = `${BASE_URL}/posts/${UPDATE_ID}.json`;

  let UPDATED_OBJ = {
    title: titleControl.value,
    content: contentControl.value,
    userId: userIdControl.value,
  };

  postForm.reset();

  cl(UPDATED_OBJ);
  let res = await makeApiCall(UPDATE_URL, "PATCH", UPDATED_OBJ);

  let card = document.getElementById(UPDATE_ID);

  card.querySelector("h3").innerHTML = UPDATED_OBJ.title;
  card.querySelector("p").innerHTML = UPDATED_OBJ.content;

  submitBtn.classList.remove("d-none");
  updateBtn.classList.add("d-none");
};

const onRemove = async (eve) => {
  let result = await Swal.fire({
    title: "Do you want to remove this post ?",
    showCancelButton: true,
    confirmButtonText: "Remove",
  });

  if (result.isConfirmed) {
    let REMOVE_ID = eve.closest(".card").id;
    let REMOVE_URL = `${BASE_URL}/posts/${REMOVE_ID}.json`;

    let res = makeApiCall(REMOVE_URL, "DELETE");
    eve.closest(".card").remove();
  }
};

postForm.addEventListener("submit", onPostSubmit);
updateBtn.addEventListener("click", onUpdate);
