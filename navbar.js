// navbar.js

async function loadNavbar() {
  const navbarContainer = document.getElementById("navbar");
  const response = await fetch("navbar.html");
  const navbarHTML = await response.text();
  navbarContainer.innerHTML = navbarHTML;
}

// load immediately
loadNavbar();
