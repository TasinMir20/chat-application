const IsGeneralInformationPath = document.querySelector(".general-information-area");

if (IsGeneralInformationPath) {
	function nameEdit() {
		document.querySelector(".user-property.name .inner").classList.add("hide");
		document.querySelector(".user-property.name .edit-area").classList.remove("hide");

		document.querySelector(".user-property.username .edit-area").classList.add("hide");
		document.querySelector(".user-property.email .edit-area").classList.add("hide");

		document.querySelector(".user-property.username .inner").classList.remove("hide");
		document.querySelector(".user-property.email .inner").classList.remove("hide");
	}
	document.querySelector(".user-property.name .edit-btn").onclick = nameEdit;

	function usernameEdit() {
		document.querySelector(".user-property.username .inner").classList.add("hide");
		document.querySelector(".user-property.username .edit-area").classList.remove("hide");

		document.querySelector(".user-property.name .edit-area").classList.add("hide");
		document.querySelector(".user-property.email .edit-area").classList.add("hide");

		document.querySelector(".user-property.name .inner").classList.remove("hide");
		document.querySelector(".user-property.email .inner").classList.remove("hide");
	}
	document.querySelector(".user-property.username .edit-btn").onclick = usernameEdit;

	function emailEdit() {
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

		const apiUrl = "/api/user/settings/general-information-update";

		fetch(apiUrl, {
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			method: "POST",
			body: JSON.stringify(dataObj),
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
				// loading animation clear
				document.querySelector("#load-animation").innerHTML = "";

				const response = data;

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
			})
			.catch(function (reason) {
				console.log(reason);
			});
	}
}

const IsSecurityInfoEditPath = document.querySelector(".security-info");

if (IsSecurityInfoEditPath) {
	// Password input value hide show func - START
	function currentPassInputValueHideSHow() {
		const input = document.querySelector("#current-password");
		const inputTypeValue = input.getAttribute("type");
		if (inputTypeValue == "password") {
			input.setAttribute("type", "text");
			this.classList.remove("fa-eye");
			this.classList.add("fa-eye-slash");
		} else {
			input.setAttribute("type", "password");
			this.classList.remove("fa-eye-slash");
			this.classList.add("fa-eye");
		}
	}

	const currentPassElement = document.querySelector("#current-password");
	if (currentPassElement) {
		document.querySelector(".security-info form .current-pass-cont i.fas").onclick = currentPassInputValueHideSHow;
	}

	function newPassInputValueHideSHow() {
		const input = document.querySelector("#new-password");
		const inputTypeValue = input.getAttribute("type");
		if (inputTypeValue == "password") {
			input.setAttribute("type", "text");
			this.classList.remove("fa-eye");
			this.classList.add("fa-eye-slash");
		} else {
			input.setAttribute("type", "password");
			this.classList.remove("fa-eye-slash");
			this.classList.add("fa-eye");
		}
	}
	document.querySelector(".security-info form .new-pass-cont i.fas").onclick = newPassInputValueHideSHow;

	function confirmPassInputValueHideSHow() {
		const input = document.querySelector("#confirm-password");
		const inputTypeValue = input.getAttribute("type");
		if (inputTypeValue == "password") {
			input.setAttribute("type", "text");
			this.classList.remove("fa-eye");
			this.classList.add("fa-eye-slash");
		} else {
			input.setAttribute("type", "password");
			this.classList.remove("fa-eye-slash");
			this.classList.add("fa-eye");
		}
	}
	document.querySelector(".security-info form .confirm-pass-cont i.fas").onclick = confirmPassInputValueHideSHow;
	// Password input value hide show func - END

	function passwordGenerate(event) {
		event.preventDefault();

		// Password generating -> START
		const length = 12;
		const string = "abcdefghijklmnopqrstuvwxyz";
		const numeric = "0123456789";
		const punctuation = "!@#$%^&*()_+~`}{[]:;?><,./-=";
		let password = "";
		let character = "";
		while (password.length < length) {
			entity1 = Math.ceil(string.length * Math.random() * Math.random());
			entity2 = Math.ceil(numeric.length * Math.random() * Math.random());
			entity3 = Math.ceil(punctuation.length * Math.random() * Math.random());
			hold = string.charAt(entity1);
			hold = password.length % 2 == 0 ? hold.toUpperCase() : hold;
			character += hold;
			character += numeric.charAt(entity2);
			character += punctuation.charAt(entity3);
			password = character;
		}
		password = password
			.split("")
			.sort(function () {
				return 0.5 - Math.random();
			})
			.join("");
		password = password.substr(0, length);
		// Password generating -> END

		const newPass = document.querySelector("#new-password");
		const confirmPass = document.querySelector("#confirm-password");
		newPass.value = password;
		confirmPass.value = password;
		newPass.setAttribute("type", "text");
		confirmPass.setAttribute("type", "text");

		document.querySelector(".new-pass-cont i.fas").classList.remove("fa-eye");
		document.querySelector(".new-pass-cont i.fas").classList.add("fa-eye-slash");

		document.querySelector(".confirm-pass-cont i.fas").classList.remove("fa-eye");
		document.querySelector(".confirm-pass-cont i.fas").classList.add("fa-eye-slash");
	}
	document.querySelector("#password-generate").onclick = passwordGenerate;

	function logExpandCollapse() {
		const thisElement = this;
		const expandCollapseEl = thisElement.parentElement.nextElementSibling;
		expandCollapseEl.classList.toggle("expand");
		const colClass = expandCollapseEl.getAttribute("class");
		const isShow = !!colClass.match("expand");
		if (isShow) {
			thisElement.classList.remove("fa-chevron-left");
			thisElement.classList.add("fa-chevron-down");
			thisElement.setAttribute("title", "Collapse");
		} else {
			thisElement.classList.remove("fa-chevron-down");
			thisElement.classList.add("fa-chevron-left");
			thisElement.setAttribute("title", "Expand");
		}
	}

	let coll = document.getElementsByClassName("expand-coll-8uo71nk");
	let i;
	for (i = 0; i < coll.length; i++) {
		coll[i].addEventListener("click", logExpandCollapse);
	}

	// Api request
	function securityPassUpdate_ApiRequest(event) {
		event.preventDefault();

		const currentPassElement = document.querySelector("#current-password");
		const currentPass = currentPassElement ? currentPassElement.value : "NO_NEED_PASSWORD";
		const newPass = document.querySelector("#new-password").value;
		const confirmPass = document.querySelector("#confirm-password").value;

		if (!(currentPass && newPass && confirmPass)) {
			// Floating message show if empty any input fields of the three pass input fields
			const element = document.querySelector(".floating-alert-notification");
			element.innerHTML = `<p class="danger-alert alert-msg">Please fill all the fields!</p>`;
			element.classList.add("show");
			setTimeout(() => {
				element.classList.remove("show");
			}, 3000);

			return;
		}

		// loading animation showing
		document.querySelector("#load-animation").innerHTML = `
                    <div class="load-bg">
                        <div class="wrap-loading">
                            <div class="loading"></div>
                        </div>
                    </div>`;

		const dataObj = { currentPass, newPass, confirmPass };
		const apiUrl = "/api/user/settings/security-password-update";
		fetch(apiUrl, {
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			method: "POST",
			body: JSON.stringify(dataObj),
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
				// loading animation clear
				document.querySelector("#load-animation").innerHTML = "";

				const response = data;

				if (response.passwordUpdated) {
					// Error message remove if password changed successfully
					document.querySelector(".crnt-pass-msg").innerHTML = "";
					document.querySelector(".new-pass-msg").innerHTML = "";
					document.querySelector(".cnfrm-pass-msg").innerHTML = "";

					// Password input box empty if password changed successfully
					const currentPassElement = document.querySelector("#current-password");
					currentPassElement ? (currentPassElement.value = "") : "";
					document.querySelector("#new-password").value = "";
					document.querySelector("#confirm-password").value = "";

					// Floating message show if password changed successfully
					const element = document.querySelector(".floating-alert-notification");
					element.innerHTML = `<p class="success-alert alert-msg">${response.passwordUpdated}</p>`;
					element.classList.add("show");
					setTimeout(() => {
						element.classList.remove("show");
						const currentPassElement = document.querySelector("#current-password");
						if (!currentPassElement) {
							location.reload();
						}
					}, 3000);
				} else {
					let target = document.querySelector(".crnt-pass-msg");
					if (response.curntPassMsg) {
						target.innerHTML = `<small class="error-message">${response.curntPassMsg}</small>`;
					} else {
						target.innerHTML = "";
					}

					target = document.querySelector(".new-pass-msg");
					if (response.newPassMsg) {
						target.innerHTML = `<small class="error-message">${response.newPassMsg}</small>`;
					} else {
						target.innerHTML = "";
					}

					target = document.querySelector(".cnfrm-pass-msg");
					if (response.cnfrmPassMsg) {
						target.innerHTML = `<small class="error-message">${response.cnfrmPassMsg}</small>`;
					} else {
						target.innerHTML = "";
					}
				}
			})
			.catch(function (reason) {
				console.log(reason);
			});
	}
	document.querySelector(".security-info #pass-change-btn").onclick = securityPassUpdate_ApiRequest;

	function logoutFromLoggedDevices_ApiRequest(logId) {
		// loading animation showing
		document.querySelector("#load-animation").innerHTML = `
                    <div class="load-bg">
                        <div class="wrap-loading">
                            <div class="loading"></div>
                        </div>
                    </div>`;

		const dataObj = { logId };
		const apiUrl = "/api/user/settings/logout-from-logged-devices";
		fetch(apiUrl, {
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			method: "POST",
			body: JSON.stringify(dataObj),
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
				// loading animation clear
				document.querySelector("#load-animation").innerHTML = "";

				const response = data;

				if (response.requestSuccess) {
					if (logId === "ALL_LOGOUT") {
						location.reload();
					} else {
						const str = logId;
						const getUniqueCssClass = "c" + str.substr(str.length - 7, str.length);
						const removeAbleElement = document.querySelector(`.logged-device-part .cont .${getUniqueCssClass}`);
						const isExist = document.querySelector(".logged-device-part").contains(removeAbleElement);

						if (isExist) {
							removeAbleElement.remove();
						}
					}
				}
			})
			.catch(function (reason) {
				console.log(reason);
			});
	}
}

const IsSocialLinksEditPath = document.querySelector(".social-links");

if (IsSocialLinksEditPath) {
	function socialLinksEdit() {
		// Edit button hide and update button show
		document.querySelector(".social-links .links-show .btn-wrap .edit-btn").classList.add("hide");
		document.querySelector(".social-links .links-show .btn-wrap .update-btn").classList.remove("hide");

		// click redirect disable
		let lnkToDisableHref = document.getElementsByClassName("single-link");
		for (let i = 0; i < lnkToDisableHref.length; i++) {
			lnkToDisableHref[i].setAttribute("onclick", "return false;");
		}

		// Enable links input box
		let lnkTo = document.getElementsByClassName("link-input");
		for (let i = 0; i < lnkTo.length; i++) {
			lnkTo[i].removeAttribute("disabled");
		}
	}

	document.querySelector(".social-links .links-show .btn-wrap .edit-btn").onclick = socialLinksEdit;

	// Api request
	function socialLinksUpdate_ApiRequest() {
		const linkedinInput = document.querySelector("#linkedin-input").value;
		const facebookInput = document.querySelector("#facebook-input").value;
		const instagramInput = document.querySelector("#instagram-input").value;
		const twitterInput = document.querySelector("#twitter-input").value;
		const githubInput = document.querySelector("#github-input").value;
		const dribbbleInput = document.querySelector("#dribbble-input").value;

		// loading animation showing
		document.querySelector("#load-animation").innerHTML = `
                    <div class="load-bg">
                        <div class="wrap-loading">
                            <div class="loading"></div>
                        </div>
                    </div>`;

		const dataObj = { linkedinInput, facebookInput, instagramInput, twitterInput, githubInput, dribbbleInput };
		const apiUrl = "/api/user/settings/social-link-update";
		fetch(apiUrl, {
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			method: "POST",
			body: JSON.stringify(dataObj),
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
				// loading animation clear
				document.querySelector("#load-animation").innerHTML = "";

				const response = data;

				const noIssue = !(response.linkedinIssue || response.facebookIssue || response.instagramIssue || response.twitterIssue || response.githubIssue || response.dribbbleIssue);
				if (noIssue) {
					// Update button hide and edit button show
					document.querySelector(".social-links .links-show .btn-wrap .update-btn").classList.add("hide");
					document.querySelector(".social-links .links-show .btn-wrap .edit-btn").classList.remove("hide");

					// click redirect re-enable
					let lnkToDisableHref = document.getElementsByClassName("single-link");
					for (let i = 0; i < lnkToDisableHref.length; i++) {
						lnkToDisableHref[i].removeAttribute("onclick");
					}

					// Disable links input box
					let lnkTo = document.getElementsByClassName("link-input");
					for (let i = 0; i < lnkTo.length; i++) {
						lnkTo[i].setAttribute("disabled", "disabled");
					}
				}

				// Update issues
				let target = document.querySelector(".social-links .links-show .wrap .err-show.l-err");
				if (response.linkedinIssue) {
					target.innerHTML = `<small class="error-message">${response.linkedinIssue}</small>`;
				} else {
					target.innerHTML = "";
				}

				target = document.querySelector(".social-links .links-show .wrap .err-show.f-err");
				if (response.facebookIssue) {
					target.innerHTML = `<small class="error-message">${response.facebookIssue}</small>`;
				} else {
					target.innerHTML = "";
				}

				target = document.querySelector(".social-links .links-show .wrap .err-show.i-err");
				if (response.instagramIssue) {
					target.innerHTML = `<small class="error-message">${response.instagramIssue}</small>`;
				} else {
					target.innerHTML = "";
				}

				target = document.querySelector(".social-links .links-show .wrap .err-show.t-err");
				if (response.twitterIssue) {
					target.innerHTML = `<small class="error-message">${response.twitterIssue}</small>`;
				} else {
					target.innerHTML = "";
				}

				target = document.querySelector(".social-links .links-show .wrap .err-show.g-err");
				if (response.githubIssue) {
					target.innerHTML = `<small class="error-message">${response.githubIssue}</small>`;
				} else {
					target.innerHTML = "";
				}

				target = document.querySelector(".social-links .links-show .wrap .err-show.d-err");
				if (response.dribbbleIssue) {
					target.innerHTML = `<small class="error-message">${response.dribbbleIssue}</small>`;
				} else {
					target.innerHTML = "";
				}
			})
			.catch(function (reason) {
				console.log(reason);
			});
	}

	document.querySelector(".social-links .links-show .btn-wrap .update-btn").onclick = socialLinksUpdate_ApiRequest;
}
