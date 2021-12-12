// right click disabled
document.addEventListener(
	"contextmenu",
	function (e) {
		e.preventDefault();
	},
	false
);

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
		.then((res) => {
			if (res.status == 500) {
				document.querySelector("body").innerHTML = "<h2>There is a Server Error. Please try again later, we are working to fix it...</h2>";
				throw new Error("Server Error");
			} else if (res.status == 404) {
				document.querySelector("body").innerHTML = "<h4>Not found...</h4>";
				throw new Error("Not found...");
			} else {
				return res.json();
			}
		})
		.then((data) => {
			if (!data) {
				return;
			}

			if (data.logout) {
				location.replace("/account");
			} else {
				location.reload();
			}
		})
		.catch(function (reason) {
			console.log(reason);
		});
}
document.querySelector("#logout").onclick = logOut_ApiRequest;
