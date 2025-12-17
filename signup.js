document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = e.target.username.value;
  const email = e.target.email.value;
  const password = e.target.password.value;

  //
  const res = await fetch('https://truesky-993c654d7f65.herokuapp.com/signUp', {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    credentials: 'include',
    body: JSON.stringify({ username, email, password })
  });
  if(res.status !== 200) {  
    alert(res.message || "Signup failed");
  }
  else
  {
    alert("Signup successful!");
    const loginRes = await fetch('http://localhost:8080/logMeIn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    }) 
    if(loginRes.status !== 200) { 
      alert(loginRes.message || "Login after signup failed");
      return;
    }
    else
    {
      window.location.href = "home.html";
    }
  }
});