export const getJwtToken = () => {
  const token = localStorage.getItem("jwtToken")
  if (!!token) {
    const temp = token.split(';')[0]
    if (temp.includes("token=")) {
      return temp.split("token=")[1]
    }
  }
}

export const logout = () => {
  localStorage.setItem("jwtToken", "")
  window.location.href = "index.html"
}

export const dateToString = (date) => {
  let mm = date.getMonth() + 1
  let dd = date.getDate()
  let yyyy = date.getFullYear()
  return `${yyyy}-${(mm > 9 ? '' : '0') + mm}-${(dd > 9 ? '' : '0') + dd}`
}

export const goToLoginPage = () => {
  window.alert("Session Expired\nPlease login again!!")
  window.location.href = 'index.html'
}