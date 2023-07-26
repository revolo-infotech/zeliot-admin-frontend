function getLoginId() {
  return parseInt(localStorage.getItem('Login_id'), 10)
}

export default getLoginId
