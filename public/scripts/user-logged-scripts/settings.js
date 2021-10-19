const IsGeneralInformationPath = document.querySelector(".general-information-area");

if (IsGeneralInformationPath) {
	function nameEdit() {
		console.log("NAME");
		document.querySelector(".user-property.name .inner").classList.add("hide");
		document.querySelector(".user-property.name .edit-area").classList.remove("hide");

		document.querySelector(".user-property.username .edit-area").classList.add("hide");
		document.querySelector(".user-property.email .edit-area").classList.add("hide");

		document.querySelector(".user-property.username .inner").classList.remove("hide");
		document.querySelector(".user-property.email .inner").classList.remove("hide");
	}
	document.querySelector(".user-property.name .edit-btn").onclick = nameEdit;

	function usernameEdit() {
		console.log("USERNAME");

		document.querySelector(".user-property.username .inner").classList.add("hide");
		document.querySelector(".user-property.username .edit-area").classList.remove("hide");

		document.querySelector(".user-property.name .edit-area").classList.add("hide");
		document.querySelector(".user-property.email .edit-area").classList.add("hide");

		document.querySelector(".user-property.name .inner").classList.remove("hide");
		document.querySelector(".user-property.email .inner").classList.remove("hide");
	}
	document.querySelector(".user-property.username .edit-btn").onclick = usernameEdit;

	function emailEdit() {
		console.log("EMAIL");

		document.querySelector(".user-property.email .inner").classList.add("hide");
		document.querySelector(".user-property.email .edit-area").classList.remove("hide");

		document.querySelector(".user-property.name .edit-area").classList.add("hide");
		document.querySelector(".user-property.username .edit-area").classList.add("hide");

		document.querySelector(".user-property.name .inner").classList.remove("hide");
		document.querySelector(".user-property.username .inner").classList.remove("hide");
	}
	document.querySelector(".user-property.email .edit-btn").onclick = emailEdit;

	function inputPsswordHideShow() {
		const inputTypeValue = document.querySelector("#auth-password").getAttribute("type");
		if (inputTypeValue == "password") {
			document.querySelector("#auth-password").setAttribute("type", "text");
			document.querySelector(".general-information-area .auth-password-cont i.fas").classList.remove("fa-eye");
			document.querySelector(".general-information-area .auth-password-cont i.fas").classList.add("fa-eye-slash");
		} else {
			document.querySelector("#auth-password").setAttribute("type", "password");
			document.querySelector(".general-information-area .auth-password-cont i.fas").classList.remove("fa-eye-slash");
			document.querySelector(".general-information-area .auth-password-cont i.fas").classList.add("fa-eye");
		}
	}
	document.querySelector(".general-information-area .auth-password-cont i.fas").onclick = inputPsswordHideShow;

	// Api request
	function generalInfoUpdate_ApiRequest(whichPropertyChange) {
		if (whichPropertyChange == "name") {
			var firstName = document.querySelector(".general-information-area #first-name").value;
			var lastName = document.querySelector(".general-information-area #last-name").value;

			const inputFirstNameElement = document.querySelector(".user-property.name .edit-area #first-name");
			const inputLastNameElement = document.querySelector(".user-property.name .edit-area #last-name");
			if (inputFirstNameElement.hasAttribute("disabled") || inputLastNameElement.hasAttribute("disabled")) {
				return;
			}
		} else if (whichPropertyChange == "username") {
			var username = document.querySelector(".general-information-area #username").value;
		} else if (whichPropertyChange == "email") {
			var email = document.querySelector(".general-information-area #email").value;
			var authPassword = document.querySelector(".general-information-area #auth-password").value;
		} else {
			return;
		}

		// loading animation showing
		document.querySelector("#load-animation").innerHTML = `
                    <div class="load-bg">
                        <div class="wrap-loading">
                            <div class="loading"></div>
                        </div>
                    </div>`;

		const dataObj = { firstName, lastName, username, email, authPassword, whichPropertyChange };

		const apiUrl = "/api/user/settings/general-information-edit";

		fetch(apiUrl, {
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			method: "POST",
			body: JSON.stringify(dataObj),
		})
			.then((res) => res.json())
			.then((data) => {
				// loading animation clear
				document.querySelector("#load-animation").innerHTML = "";

				const response = data;

				if (!(response.error === "server error")) {
					if (response.whichPropertyChange == "name") {
						if (response.nameUpdated) {
							// Error message remove if name changed successfully
							document.querySelector(".fst-nm-msg").innerHTML = "";
							document.querySelector(".lst-nm-msg").innerHTML = "";
							document.querySelector(".nm-msg").innerHTML = "";

							// Disable name's input and hide name's update button and hide and show related messages
							document.querySelector(".user-property.name .edit-area #first-name").setAttribute("disabled", "disabled");
							document.querySelector(".user-property.name .edit-area #last-name").setAttribute("disabled", "disabled");
							document.querySelector(".user-property.name .edit-area .msg-for-nm-change").classList.add("hide");
							document.querySelector(".user-property.name .edit-area .btn-cont").classList.add("hide");

							// Editing collapse
							document.querySelector(".user-property.name .edit-area").classList.add("hide");
							document.querySelector(".user-property.name .inner").classList.remove("hide");

							// instantly update name to the front-end
							const { firstName, lastName } = response.theUpdatedName;
							const fullName = `${firstName} ${lastName}`;
							document.querySelector(".user-property.name .inner .content").innerText = fullName;
							document.querySelector(".top-bar .top-info .user-name").innerText = firstName;
							document.querySelector(".top-bar .dropdown .dropdown-elements .user-name .name").innerText = fullName;

							// Floating message show if name changed successfully
							const element = document.querySelector(".floating-alert-notification");
							element.innerHTML = `<p class="success-alert alert-msg">${response.nameUpdated}</p>`;
							element.classList.add("show");
							setTimeout(() => {
								element.classList.remove("show");
							}, 3000);
						} else {
							let target = document.querySelector(".fst-nm-msg");
							if (response.firstNameMsg) {
								target.innerHTML = `<small class="error-message">${response.firstNameMsg}</small>`;
							} else {
								target.innerHTML = "";
							}

							target = document.querySelector(".lst-nm-msg");
							if (response.lastNameMsg) {
								target.innerHTML = `<small class="error-message">${response.lastNameMsg}</small>`;
							} else {
								target.innerHTML = "";
							}

							target = document.querySelector(".nm-msg");
							if (response.nameMsg) {
								target.innerHTML = `<small class="error-message">${response.nameMsg}</small>`;
							} else {
								target.innerHTML = "";
							}
						}
					} else if (response.whichPropertyChange == "username") {
						if (response.usernameUpdated) {
							// Error message remove if name changed successfully
							document.querySelector(".usernm-msg").innerHTML = "";

							// Editing collapse
							document.querySelector(".user-property.username .edit-area").classList.add("hide");
							document.querySelector(".user-property.username .inner").classList.remove("hide");

							// instantly update username to the front-end
							document.querySelector(".user-property.username .inner .content").innerText = response.theUpdatedUsername;
							document.querySelector(".top-bar .top-info .user").href = `/${response.theUpdatedUsername}`;
							document.querySelector(".top-bar .dropdown .dropdown-elements .user").href = `/${response.theUpdatedUsername}`;

							// Floating message show if username changed successfully
							const element = document.querySelector(".floating-alert-notification");
							element.innerHTML = `<p class="success-alert alert-msg">${response.usernameUpdated}</p>`;
							element.classList.add("show");
							setTimeout(() => {
								element.classList.remove("show");
							}, 3000);
						} else {
							let target = document.querySelector(".usernm-msg");
							if (response.usernameMsg) {
								target.innerHTML = `<small class="error-message">${response.usernameMsg}</small>`;
							} else {
								target.innerHTML = "";
							}
						}
					} else if (response.whichPropertyChange == "email") {
						if (response.emailUpdated) {
							// Error message remove if name changed successfully
							document.querySelector(".eml-msg").innerHTML = "";
							document.querySelector(".auth-password-msg").innerHTML = "";
							document.querySelector(".general-information-area #auth-password").value = "";

							// Editing collapse
							document.querySelector(".user-property.email .edit-area").classList.add("hide");
							document.querySelector(".user-property.email .inner").classList.remove("hide");

							// instantly update username to the front-end
							document.querySelector(".user-property.email .inner .content").innerText = response.theUpdatedEmail;

							// Floating message show if username changed successfully
							const element = document.querySelector(".floating-alert-notification");
							element.innerHTML = `<p class="success-alert alert-msg">${response.emailUpdated}</p>`;
							element.classList.add("show");
							setTimeout(() => {
								element.classList.remove("show");
								location.assign("/user/email-verification");
							}, 3000);
						} else {
							let target = document.querySelector(".eml-msg");
							if (response.emailMsg) {
								target.innerHTML = `<small class="error-message">${response.emailMsg}</small>`;
							} else {
								target.innerHTML = "";
							}

							target = document.querySelector(".auth-password-msg");
							if (response.authPassMsg) {
								target.innerHTML = `<small class="error-message">${response.authPassMsg}</small>`;
							} else {
								target.innerHTML = "";
							}
						}
					} else {
						return;
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
}
