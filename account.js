window.onload = function() {
  const userId = getCookie("userId");
  if (!userId) {
    // Redirect to login page if userId cookie is not found
  window.location.href = "login.html";
  }
};

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}