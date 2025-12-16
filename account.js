import { getUserById, updateUserSettings } from "./database.js";

window.onload = async function () {
  const userId = getCookie("userId");

  if (!userId) {
    window.location.href = "login.html";
    return;
  }

  // Load user info
  const user = await getUserById(userId);

  if (!user) {
    alert("User not found.");
    document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    window.location.href = "login.html";
    return;
  }

  // Display user data
  document.getElementById("username").innerText = user.name;
  // Load user settings
  document.getElementById("defaultCity").value = user.settings?.defaultCity || "";
  document.getElementById("tempUnit").value = user.settings?.tempUnit || "F";
  document.getElementById("theme").value = user.settings?.theme || "light";
};

function getCookie(name) {
  const cookies = document.cookie.split(";").map(c => c.trim());
  for (const cookie of cookies) {
    if (cookie.startsWith(name + "=")) {
      return cookie.split("=")[1];
    }
  }
  return null;
}

window.saveSettings = async function () {
  const userId = getCookie("userId");

  const updatedSettings = {
    defaultCity: document.getElementById("defaultCity").value,
    tempUnit: document.getElementById("tempUnit").value,
    theme: document.getElementById("theme").value
  };

  const success = await updateUserSettings(userId, updatedSettings);

  if (success) {
    alert("Settings saved!");
  } else {
    alert("Failed to save settings.");
  }
};

window.logout = function () {
  document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
  window.location.href = "login.html";
};
