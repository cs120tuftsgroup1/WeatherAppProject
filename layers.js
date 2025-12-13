document.addEventListener("DOMContentLoaded", function () {

  const headerHTML = `
    <header class="site-logo">
      <div class="header-content">
      <a href="home.html">  
      <img src="pics/TruSky.png" alt="Weather Logo" class="logo">
        <h2>My Weather App</h2>
      </div>
      <nav>
        <a href="#">Home</a> |
        <a href="#">About</a>
      </nav>
    </header>
  `;

  const footerHTML = `
    <footer class="footer-container">
      <p>&copy; 2025 My Weather App</p>
    </footer>
  `;

  
  document.getElementById("header").innerHTML = headerHTML;
  document.getElementById("footer").innerHTML = footerHTML;

});
