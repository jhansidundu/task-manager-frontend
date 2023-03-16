const tokenExists = () => {
  if (localStorage.getItem("jwtToken")) {
    const [jwtToken, expirationTime] = localStorage.getItem("jwtToken")?.split(";")
    if (jwtToken) {
      return true
    }
  }
  return false
}

if (!tokenExists()) {
  window.location.href = "index.html"
}