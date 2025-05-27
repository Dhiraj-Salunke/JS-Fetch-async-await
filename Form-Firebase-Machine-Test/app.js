const cl = console.log;
const healthForm = document.getElementById("healthForm");
const dataTable = document.getElementById("dataTable");
const fnameControl = document.getElementById("fname");
const lnameControl = document.getElementById("lname");
const emailControl = document.getElementById("email");
const weightControl = document.getElementById("weight");
const heightControl = document.getElementById("height");
const packageControl = document.getElementById("package");
const importanceControl = document.getElementById("importance");
const entryDateControl = document.getElementById("entryDate");
const submitBtn = document.getElementById("submitBtn");
const resetBtn = document.getElementById("resetBtn");
const tableContainer = document.getElementById("tableContainer");
const updateBtn = document.getElementById("updateBtn");

const BASE_URL = `https://crud-js-3070f-default-rtdb.firebaseio.com/`;

const DATA_URL = `${BASE_URL}/formdata.json`;

const createTable = (arr) => {
  let result = "";

  arr.forEach((data, i) => {
    result += `<tr id=${data.id}>
                  <td>${i + 1}</td>
                  <td>${data.fname}</td>
                  <td>${data.lname}</td>
                  <td>${data.email}</td>
                  <td>${data.weight}</td>
                  <td>${data.height}</td>
                  <td>${data.gender}</td>
                  <td>${data.trainer}</td>
                  <td>${data.package}</td>
                  <td>${data.importance}</td>
                  <td>${data.entryDate}</td>
                  <td><button onclick="onEdit(this)" class="btn btn-sm btn-outline-info">Edit</button></td>
                  <td><button onclick="onRemove(this)" class="btn btn-sm btn-outline-danger">Remove</button></td>   
              </tr>`;
  });

  dataTable.innerHTML = result;
};

const ObjToArr = (obj) => {
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
        "Content-Type": "application/json",
        Auth: "Token from Local Storage",
      },
    });
    return res.json();
  } catch (error) {
    cl(error);
  }
};

const fetchAllData = async () => {
  let data = await makeApiCall(DATA_URL, "GET");
  let dataArr = ObjToArr(data);
  createTable(dataArr);
};

fetchAllData();

const onSubmitBtn = async (eve) => {
  eve.preventDefault();

  let dataObj = {
    fname: fnameControl.value,
    lname: lnameControl.value,
    email: emailControl.value,
    weight: weightControl.value,
    height: heightControl.value,
    gender: document.querySelector('input[name="gender"]:checked')?.value || "",
    trainer:
      document.querySelector('input[name="trainer"]:checked')?.value || "",
    package: packageControl.value,
    importance: importanceControl.value,
    entryDate: entryDateControl.value,
  };

  healthForm.reset();

  let res = await makeApiCall(DATA_URL, "POST", dataObj);

  let tr = document.createElement("tr");

  tr.id = res.name;
  cl(tr.id);
  let rowCount = dataTable.rows.length + 1;
  tr.innerHTML = `
                  <td>${rowCount}</td>
                  <td>${dataObj.fname}</td>
                  <td>${dataObj.lname}</td>
                  <td>${dataObj.email}</td>
                  <td>${dataObj.weight}</td>
                  <td>${dataObj.height}</td>
                  <td>${dataObj.gender}</td>
                  <td>${dataObj.trainer}</td>
                  <td>${dataObj.package}</td>
                  <td>${dataObj.importance}</td>
                  <td>${dataObj.entryDate}</td>
                  <td><button onclick="onEdit(this)" class="btn btn-sm btn-outline-info">Edit</button></td>
                  <td><button onclick="onRemove(this)" class="btn btn-sm btn-outline-danger">Remove</button></td>`;

  dataTable.append(tr);
};

const onEdit = async (eve) => {
  let EDIT_ID = eve.closest("tr").id;
  cl(EDIT_ID);
  localStorage.setItem("EDIT_ID", EDIT_ID);

  let EDIT_URL = `${BASE_URL}/formdata/${EDIT_ID}.json`;

  let res = await makeApiCall(EDIT_URL, "GET");
  cl(res);

  if (res) {
    fnameControl.value = res.fname;
    lnameControl.value = res.lname;
    emailControl.value = res.email;
    weightControl.value = res.weight;
    heightControl.value = res.height;
    document.querySelector(
      `input[name="gender"][value="${res.gender}"]`
    ).checked = true;
    document.querySelector(
      `input[name="trainer"][value="${res.trainer}"]`
    ).checked = true;
    packageControl.value = res.package;
    importanceControl.value = res.importance;
    entryDateControl.value = res.entryDate;

    submitBtn.classList.add("d-none");
    resetBtn.classList.add("d-none");
    updateBtn.classList.remove("d-none");
  }
};

const onUpdateBtn = async (eve) => {
  let UPDATE_ID = localStorage.getItem("EDIT_ID");

  let UPDATE_URL = `${BASE_URL}/formdata/${UPDATE_ID}.json`;

  let updateObj = {
    fname: fnameControl.value,
    lname: lnameControl.value,
    email: emailControl.value,
    weight: weightControl.value,
    height: heightControl.value,
    gender: document.querySelector('input[name="gender"]:checked')?.value || "",
    trainer:
      document.querySelector('input[name="trainer"]:checked')?.value || "",
    package: packageControl.value,
    importance: importanceControl.value,
    entryDate: entryDateControl.value,
  };

  let res = await makeApiCall(UPDATE_URL, "PATCH", updateObj);

  if (res) {
    let tr = document.getElementById(UPDATE_ID).children;

    tr[1].textContent = updateObj.fname;
    tr[2].textContent = updateObj.lname;
    tr[3].textContent = updateObj.email;
    tr[4].textContent = updateObj.weight;
    tr[5].textContent = updateObj.height;
    tr[6].textContent = updateObj.gender;
    tr[7].textContent = updateObj.trainer;
    tr[8].textContent = updateObj.package;
    tr[9].textContent = updateObj.importance;
    tr[10].textContent = updateObj.entryDate;

    healthForm.reset();

    submitBtn.classList.remove("d-none");
    resetBtn.classList.remove("d-none");
    updateBtn.classList.add("d-none");
  }
};

const onRemove = async (eve) => {
  let result = await Swal.fire({
    title: "Do you want to delet this Member Info ?",
    showCancelButton: true,
    confirmButtonText: "Remove",
  });

  if (result.isConfirmed) {
    let REMOVE_ID = eve.closest("tr").id;

    let REMOVE_URL = `${BASE_URL}/formdata/${REMOVE_ID}.json`;

    let res = await makeApiCall(REMOVE_URL, "DELETE");

    eve.closest("tr").remove();
  } else {
    cl("something went Wrong...");
  }
};

healthForm.addEventListener("submit", onSubmitBtn);
updateBtn.addEventListener("click", onUpdateBtn);
