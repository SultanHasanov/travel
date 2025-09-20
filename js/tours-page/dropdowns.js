const selectedAll = document.querySelectorAll(".custom-dropdown");

selectedAll.forEach((selected) => {
    const optionsList = selected.querySelectorAll("div.custom-dropdown__options li");

    selected.addEventListener("click", () => {

        if (selected.classList.contains("active")) {
            handleDropdown(selected, false);
        } else {
            let currentActive = document.querySelector(".custom-dropdown.active");

            if (currentActive) {
                handleDropdown(currentActive, false);
            }

            handleDropdown(selected, true);
        }
    });

    // update the display of the dropdown
    for (let o of optionsList) {
        o.addEventListener("click", () => {
            selected.querySelector(".custom-dropdown__options-selected").innerHTML = o.innerHTML;
        });
    }
});

// check if anything else other than the dropdown is clicked
window.addEventListener("click", function (e) {
    if (e.target.closest(".custom-dropdown") === null) {
        closeAllDropdowns();
    }
});

// close all the dropdowns
function closeAllDropdowns() {
    const selectedAll = document.querySelectorAll(".custom-dropdown");
    selectedAll.forEach((selected) => {
        handleDropdown(selected, false);
    });
}

// open all the dropdowns
function handleDropdown(dropdown, open) {
    if (open) {
        dropdown.classList.add("active");
    } else {
        dropdown.classList.remove("active");
    }
}
