import { BASE_URL } from "./util/constants.js"
import { getJwtToken, logout, dateToString, goToLoginPage } from "./util/commons.js"

document.getElementById("logout-btn").addEventListener("click", logout)

let selectedOptions = {}

const options = document.querySelectorAll(".options")[0]
const optionsList = options.querySelectorAll(".option")
const loadingSpinner = document.querySelector('.loader-container')
const username = document.getElementById('username')
username.textContent = localStorage.getItem('username')

optionsList.forEach(option => {
  option.addEventListener("click", (event) => {
    optionsList.forEach(o => o.classList.remove('active'))
    event.target.classList.add('active');

    const value = event.target.innerHTML
    if (value.includes('Today')) {
      selectedOptions = { date: dateToString(new Date()) }
    } else if (value.includes('Week')) {
      selectedOptions = { thisWeek: true }
    } else if (value.includes('Month')) {
      selectedOptions = { thisMonth: true }
    } else {
      selectedOptions = {}
    }
    fetchTasks(selectedOptions)
  })
})


function resetModalState() {
  const title = document.getElementById('task-title')
  const description = document.getElementById('task-description')
  const status = document.getElementById('task-status')
  const dueDate = document.getElementById('task-due-date')

  // error div
  const newTaskErrors = document.getElementsByClassName('new-task-errors')[0]
  const errorMessage = newTaskErrors.getElementsByClassName('error-message')[0]
  errorMessage.textContent = ''

  title.value = null
  description.value = null
  status.value = null
  dueDate.value = null
}

async function createNewTask() {
  const title = document.getElementById('task-title')
  const description = document.getElementById('task-description')
  const status = document.getElementById('task-status')
  const dueDate = document.getElementById('task-due-date')

  const payload = {
    title: title.value,
    description: description.value,
    status: status.value,
    due_date: dueDate.value
  }

  loadingSpinner.classList.remove('invisible')
  const response = await fetch(`${BASE_URL}/task`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getJwtToken()}`
    },
    body: JSON.stringify(payload)
  })
  loadingSpinner.classList.add('invisible')
  const responseBody = await response.json()
  if (responseBody.success) {
    fetchTasks(selectedOptions)
  }
  return responseBody

}

function addTaskModalEvents() {
  const modal = document.getElementById("add-task-modal");

  // Get the button that opens the modal
  const btn = document.getElementById("add-task-btn");

  // Get the cancel div that closes the modal
  const modalCancel = document.getElementsByClassName("modal-cancel")[0];
  const cancelBtn = document.getElementById('cancel-btn')
  const saveBtn = document.getElementById('save-btn')

  // error div
  const newTaskErrors = document.getElementsByClassName('new-task-errors')[0]
  const errorMessage = newTaskErrors.getElementsByClassName('error-message')[0]

  // When the user clicks the button, open the modal 
  btn.onclick = function () {
    modal.style.display = "block";
  }

  // When the user clicks on close icon - close the modal
  modalCancel.onclick = function () {
    resetModalState()
    modal.style.display = "none";
  }

  // cancel button
  cancelBtn.onclick = () => {
    resetModalState()
    modal.style.display = 'none'
  }

  // save button click
  saveBtn.onclick = async () => {
    const response = await createNewTask()
    if (response.success) {
      resetModalState()
      modal.style.display = 'none'
    } else {
      errorMessage.textContent = response.message[0].message
    }

  }


  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
}

addTaskModalEvents()

async function fetchTasks(params) {
  loadingSpinner.classList.remove('invisible')
  const payload = {}
  if (params.date) {
    payload.date = new Date(params.date)
  } else if (params.thisWeek) {
    payload.thisWeek = true
  } else if (params.thisMonth) {
    payload.thisMonth = true
  }
  const response = await fetch(`${BASE_URL}/task/get-tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getJwtToken()}`
    },
    body: JSON.stringify(payload)
  })
  loadingSpinner.classList.add('invisible')
  if (response.status === 403) {
    goToLoginPage()
  }
  const responseBody = await response.json()
  populateTasks(responseBody.data.tasks)
}

const saveEdit = async (payload) => {
  loadingSpinner.classList.remove('invisible')
  const response = await fetch(`${BASE_URL}/task`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getJwtToken()}`
    },
    body: JSON.stringify(payload)
  })
  loadingSpinner.classList.add('invisible')
  if (response.status === 403) {
    goToLoginPage()
  }
  const responseBody = await response.json()
  if (responseBody.success) {
    fetchTasks(selectedOptions)
    return responseBody.data.task
  }


}

function populateTasks(tasks) {
  const grid = document.getElementById("grid")
  const noContent = document.getElementById('no-content')

  grid.innerHTML = ''
  if (grid) {
    grid.classList.remove('invisible')
    noContent.classList.add('invisible')
    if (tasks && tasks.length > 0) {
      tasks.forEach((t, idx) => {
        const card = document.createElement("div")
        card.classList.add('card')
        grid.appendChild(card)

        // cardHeader
        const cardHeader = document.createElement("div")
        cardHeader.classList.add('card-header')
        const cardTitle = document.createElement('h3')
        cardTitle.classList.add('card-title')
        cardTitle.innerText = t.title
        cardHeader.appendChild(cardTitle)

        // cardBody
        const cardBody = document.createElement('div')
        cardBody.classList.add('card-body')

        let innerHTML = `
          <div class="description" id="description_${idx}" >
            <label>Description</label>
            <span class="edit-icon">
              <i class="fa-solid fa-pen"></i>
            </span>
            <span class="cancel-icon invisible">
              <i class="fa-sharp fa-solid fa-xmark"></i>
            </span>
            <span class="check-icon invisible">
              <i class="fa-solid fa-check"></i>
            </span>
            <textarea class="text block" rows="6" cols="40" disabled>${t.description}</textarea>
          </div>
          <div class="status" id="status_${idx}">
            <label>Status</label>
            <span class="edit-icon">
              <i class="fa-solid fa-pen"></i>
            </span>
            <span class="cancel-icon invisible">
              <i class="fa-sharp fa-solid fa-xmark"></i>
            </span>
            <span class="check-icon invisible">
              <i class="fa-solid fa-check"></i>
            </span>
            <select class="text block" disabled>
              <option value=""></option>
              <option value="NOT_STARTED" ${t.status === 'NOT_STARTED' ? 'selected' : ''}>Not Started</option>
              <option value="IN_PROGRESS" ${t.status === 'IN_PROGRESS' ? 'selected' : ''}>In Progress</option>
              <option value="COMPLETED" ${t.status === 'COMPLETED' ? 'selected' : ''}>Completed</option>
            </select>
          </div>
          <div class="due-date" id="due-date_${idx}">
            <label>Due Date</label>
            <span class="edit-icon">
              <i class="fa-solid fa-pen"></i>
            </span>
            <span class="cancel-icon invisible">
              <i class="fa-sharp fa-solid fa-xmark"></i>
            </span>
            <span class="check-icon invisible">
              <i class="fa-solid fa-check"></i>
            </span>
            <input class="block text" type="date" name="" value=${dateToString(new Date(t.due_date))} disabled />
          </div>
        `

        cardBody.innerHTML = innerHTML

        // cardFooter
        const cardFooter = document.createElement('div')
        cardFooter.classList.add('card-footer')
        const completeBtn = document.createElement('button')
        completeBtn.classList.add('btn', 'btn-primary')
        completeBtn.textContent = 'Complete'
        cardFooter.appendChild(completeBtn)

        card.appendChild(cardHeader)
        card.appendChild(cardBody)
        card.appendChild(cardFooter)

        const description = document.getElementById(`description_${idx}`)
        const descriptionEditIcon = description.querySelector('.edit-icon')
        const descriptionCancelIcon = description.querySelector('.cancel-icon')
        const descriptionCheckIcon = description.querySelector('.check-icon')
        const textArea = description.getElementsByTagName('textarea')[0]
        descriptionEditIcon.addEventListener('click', (event) => {
          descriptionEditIcon.classList.add('invisible')
          descriptionCancelIcon.classList.remove('invisible')
          descriptionCheckIcon.classList.remove('invisible')
          textArea.removeAttribute("disabled")
        })

        descriptionCancelIcon.addEventListener('click', event => {
          descriptionEditIcon.classList.remove('invisible')
          descriptionCancelIcon.classList.add('invisible')
          descriptionCheckIcon.classList.add('invisible')
          textArea.value = t.description
          textArea.setAttribute('disabled', true)
        })

        descriptionCheckIcon.addEventListener('click', async event => {
          descriptionEditIcon.classList.remove('invisible')
          descriptionCancelIcon.classList.add('invisible')
          descriptionCheckIcon.classList.add('invisible')
          const payload = { ...t, description: textArea.value }
          await saveEdit(payload)
          textArea.setAttribute('disabled', true)
        })

        const status = document.getElementById(`status_${idx}`)
        const statusEditIcon = status.querySelector('.edit-icon')
        const statusCancelIcon = status.querySelector('.cancel-icon')
        const statusCheckIcon = status.querySelector('.check-icon')
        const select = status.getElementsByTagName('select')[0]
        statusEditIcon.addEventListener('click', (event) => {
          statusEditIcon.classList.add('invisible')
          statusCancelIcon.classList.remove('invisible')
          statusCheckIcon.classList.remove('invisible')
          select.removeAttribute('disabled')
        })

        statusCancelIcon.addEventListener('click', event => {
          statusEditIcon.classList.remove('invisible')
          statusCancelIcon.classList.add('invisible')
          statusCheckIcon.classList.add('invisible')
          select.value = t.status
          select.setAttribute("disabled", "true")
        })

        statusCheckIcon.addEventListener('click', async event => {
          statusEditIcon.classList.remove('invisible')
          statusCancelIcon.classList.add('invisible')
          statusCheckIcon.classList.add('invisible')
          const payload = { ...t, status: select.value }
          await saveEdit(payload)
          select.setAttribute("disabled", "true")
        })

        const dueDate = document.getElementById(`due-date_${idx}`)
        const dueDateEditIcon = dueDate.querySelector('.edit-icon')
        const dueDateCancelIcon = dueDate.querySelector('.cancel-icon')
        const dueDateCheckIcon = dueDate.querySelector('.check-icon')
        const input = dueDate.getElementsByTagName('input')[0]
        dueDateEditIcon.addEventListener('click', (event) => {
          dueDateEditIcon.classList.add('invisible')
          dueDateCancelIcon.classList.remove('invisible')
          dueDateCheckIcon.classList.remove('invisible')
          input.removeAttribute('disabled')
        })

        dueDateCancelIcon.addEventListener('click', event => {
          dueDateEditIcon.classList.remove('invisible')
          dueDateCancelIcon.classList.add('invisible')
          dueDateCheckIcon.classList.add('invisible')
          input.value = dateToString(new Date(t.due_date))
          input.setAttribute('disabled', true)
        })

        dueDateCheckIcon.addEventListener('click', async event => {
          dueDateEditIcon.classList.remove('invisible')
          dueDateCancelIcon.classList.add('invisible')
          dueDateCheckIcon.classList.add('invisible')
          const payload = { ...t, due_date: input.value }
          t = await saveEdit(payload)
          input.setAttribute('disabled', true)
        })

      })
    }
    else {
      noContent.classList.remove('invisible')
      grid.classList.add('invisible')
    }
  }
}
fetchTasks(selectedOptions)
