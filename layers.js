document.addEventListener("DOMContentLoaded", function () {

    function loadFragment(section, wrapperTag, wrapperClass, insertAtStart = false) {
        fetch(section)
            .then(response => {
                if (!response.ok) throw new Error(`Failed to load ${section}`);
                return response.text();
            })
            .then(data => {
                const wrapper = document.createElement(wrapperTag);
                if (wrapperClass) wrapper.className = wrapperClass;
                wrapper.innerHTML = data;

                if (insertAtStart) {
                    document.body.insertBefore(wrapper, document.body.firstChild);
                } else {
                    document.body.appendChild(wrapper);
                }
            })
            .catch(err => console.error(err));
    }

    loadFragment("header.html", "header", "site-header", true);


    loadFragment("footer.html", "footer", "footer-container", false);
});