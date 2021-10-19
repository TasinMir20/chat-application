if (window.innerWidth < 768) {
	document.querySelector(".top-bar .dropdown-elements").style = `width: ${window.innerWidth - 30}px`;
}

function dropdownShowHide() {
	const dropdown = document.querySelector(".top-bar .dropdown-elements");
	const style = getComputedStyle(dropdown);

	const dropdownIcon = document.querySelector(".top-bar .dropdown i");

	if (style.display == "none") {
		dropdown.classList.add("show");
		dropdownIcon.classList.add("clicked");
	} else {
		dropdown.classList.remove("show");
		dropdownIcon.classList.remove("clicked");
	}
}
document.querySelector(".top-bar .dropdown i").onclick = dropdownShowHide;

function logOut_ApiRequest() {
	const apiUrl = "/api/user/logout";
	fetch(apiUrl, {
		method: "POST",
	})
		.then((res) => res.json())
		.then((data) => {
			if (!(data.error === "server error")) {
				if (data.logout) {
					location.replace("/account");
				} else {
					location.reload();
				}
			} else {
				document.querySelector("body").innerHTML = "There is a Server Error. Please try again later, we are working to fix it...";
				throw new Error("Server Error");
			}
		})
		.catch(function (reason) {
			console.log(reason);
		});
}
document.querySelector("#logout").onclick = logOut_ApiRequest;
