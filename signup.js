document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = e.target.username.value;
  const email = e.target.email.value;
  const password = e.target.password.value;

  const res = await fetch("/api/signup", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ username, email, password })
  });

  const data = await res.json();

  if (data.success) {
    localStorage.setItem("token", data.token);
    window.location.href = "index.html";  // redirect to homepage
  } else {
    alert(data.message || "Signup failed");
  }
});
