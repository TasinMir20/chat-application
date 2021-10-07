if (window.innerWidth < 768) {
    document.querySelector('.top-bar .dropdown-elements').style = `width: ${window.innerWidth - 30}px`;
}


function dropdownShowHide() {
    const dropdown = document.querySelector('.top-bar .dropdown-elements');
    const style = getComputedStyle(dropdown);

    const dropdownIcon = document.querySelector('.top-bar .dropdown i');

    if (style.display == "none") {
        dropdown.classList.add("show");
        dropdownIcon.classList.add('clicked');
    } else {
        dropdown.classList.remove("show");
        dropdownIcon.classList.remove('clicked');
    }
}
document.querySelector('.top-bar .dropdown i').onclick = dropdownShowHide;