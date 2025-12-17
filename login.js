document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault()

  const email = e.target.email.value
  const password = e.target.password.value

  const res = await fetch('https://truesky-993c654d7f65.herokuapp.com/logMeIn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  })
  const data = await res.json()
  if (data.success) {

    alert('Login successful!')
    window.location.href = "home.html";
  } else {
    alert('Invalid email or password.')
  }

})
