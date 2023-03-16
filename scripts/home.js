import { BASE_URL } from "./util/constants.js"
import { getJwtToken, logout, dateToString, goToLoginPage } from "./util/commons.js"

document.getElementById("logout-btn").addEventListener("click", logout)

const options = document.querySelectorAll(".options")[0]
const optionsList = options.querySelectorAll(".option")

optionsList.forEach(option => {
  option.addEventListener("click", (event) => {
    optionsList.forEach(o => o.classList.remove('active'))
    event.target.classList.add('active');

    const value = event.target.innerHTML
    const params = {}
    if (value.includes('Today')) {
      params.date = dateToString(new Date())
    } else if (value.includes('Week')) {
      params.thisWeek = true
    } else if (value.includes('Month')) {
      params.thisMonth = true
    }
    fetchTasks(params)
  })
})

async function fetchTasks(params) {
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
  if (response.status === 403) {
    goToLoginPage()
  }
  const responseBody = await response.json()
  populateTasks(responseBody.data.tasks)
}

const enableEdit = (id) => {
  console.log(id)
}

const cancelEdit = (id) => {
  console.log(id)
}

const saveEdit = (id) => {
  console.log(id)
}

function populateTasks(tasks) {
  const grid = document.getElementById("grid")
  grid.innerHTML = ''
  if (grid) {
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
            <span class="edit-icon" onclick="enableEdit('description_${idx}')">
              <i class="fa-solid fa-pen"></i>
            </span>
            <span class="cancel-icon invisible" onclick="cancelEdit('description_${idx}')">
              <i class="fa-sharp fa-solid fa-xmark"></i>
            </span>
            <span class="check-icon invisible" onclick="saveEdit('description_${idx}')">
              <i class="fa-solid fa-check"></i>
            </span>
            <textarea class="text block" rows="6" cols="40" disabled>${t.description}</textarea>
          </div>
          <div class="status" id="status_${idx}">
            <label>Status</label>
            <span class="edit-icon" onclick="enableEdit('status_${idx}')">
              <i class="fa-solid fa-pen"></i>
            </span>
            <span class="cancel-icon invisible" onclick="cancelEdit('status_${idx}')">
              <i class="fa-sharp fa-solid fa-xmark"></i>
            </span>
            <span class="check-icon invisible" onclick="saveEdit('status_${idx}')">
              <i class="fa-solid fa-check"></i>
            </span>
            <select class="text block" disabled>
              <option value=""></option>
              <option value="NOT_COMPLETED" ${t.status === 'NOT_COMPLETED' ? 'selected' : ''}>Not Completed</option>
              <option value="COMPLETED" ${t.status === 'COMPLETED' ? 'selected' : ''}>Completed</option>
              <option value="PENDING" ${t.status === 'PENDING' ? 'selected' : ''}>Pending</option>
            </select>
          </div>
          <div class="due-date" id="dud-date_${idx}">
            <label>Due Date</label>
            <span class="edit-icon" onclick="enableEdit('due-date_${idx}')">
              <i class="fa-solid fa-pen"></i>
            </span>
            <span class="cancel-icon invisible" onclick="cancelEdit('due-date_${idx}')">
              <i class="fa-sharp fa-solid fa-xmark"></i>
            </span>
            <span class="check-icon invisible" onclick="saveEdit('due-date_${idx}')">
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
    })
  }
}
fetchTasks({})
