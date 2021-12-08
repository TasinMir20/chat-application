// right click disabled
document.addEventListener(
	"contextmenu",
	function (e) {
		e.preventDefault();
	},
	false
);

function regPgShow(event) {
	event.preventDefault();

	document.querySelector(".register-pg").classList.add("active");
	document.querySelector(".login-pg").classList.remove("active");

	document.querySelector(".login-form").classList.add("hide");
	document.querySelector(".register-form").classList.add("show");

	document.title = "Create a new account!";
	document.querySelector(".other-links .title").innerText = "Or register with";
}
document.querySelector(".register-pg").onclick = regPgShow;

function loginPgShow(event) {
	event.preventDefault();

	document.querySelector(".register-pg").classList.remove("active");
	document.querySelector(".login-pg").classList.add("active");

	document.querySelector(".login-form").classList.remove("hide");
	document.querySelector(".register-form").classList.remove("show");

	document.title = "Login to your Account!";
	document.querySelector(".other-links .title").innerText = "Or login with";
}
document.querySelector(".login-pg").onclick = loginPgShow;

function forgetPgShow(event) {
	event.preventDefault();

	document.querySelector(".login-register").classList.add("hide");
	document.querySelector(".forget-pass-form").classList.add("show");

	document.title = "Forget your password?";
}
document.querySelector(".forget-pg").onclick = forgetPgShow;

function forgetPgHide(event) {
	event.preventDefault();

	document.cookie = "recovery=;";

	document.querySelector(".login-register").classList.remove("hide");
	document.querySelector(".forget-pass-form").classList.remove("show");

	document.title = "Login to your Account!";
}
document.querySelector(".forget-pg-hide").onclick = forgetPgHide;

/**************************** API request Function start form here *****************************/
///////////////////////////////////////////////////////////////////////

// Login SignUp with Google -- START ----------->
async function onSignIn(googleUser) {
	const id_token = googleUser.getAuthResponse().id_token;

	// Get client Geolocation Data by third party API
	const response = await fetch(geolocationApiUrl);
	const geolocationData = await response.json();

	const dataObj = { id_token, geolocationData };

	const apiUrl = "/api/ls/login";
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
			const response = data;

			const alertType = response.authMsg ? "danger-alert" : response.msg ? "success-alert" : "";
			const serverMsg = response.authMsg || response.msg;
			// Floating message show if login success
			const element = document.querySelector(".floating-alert-notification");
			element.innerHTML = `<p class="${alertType} alert-msg">${serverMsg}</p>`;
			element.classList.add("show");
			setTimeout(() => {
				element.classList.remove("show");
			}, 3000);

			if (response.loginSuccess) {
				// redirecting after 3 seconds
				setTimeout(() => {
					location.replace("/user");
				}, 3000);
			} else {
				// if the id_token doesn't validate to the server side so Sign out with Google Signed in
				let auth2 = gapi.auth2.getAuthInstance();
				auth2.signOut();
			}
		})
		.catch(function (reason) {
			console.log(reason);
		});
}

// Login SignUp with Google -- END

// Register API request func Start
async function regApiRequest(event) {
	event.preventDefault();

	const firstName = document.querySelector("#first_name").value;
	const lastName = document.querySelector("#last_name").value;
	const regEmail = document.querySelector("#reg_email").value;
	const newPass = document.querySelector("#reg_password").value;
	const confirmPass = document.querySelector("#reg_confirm_password").value;

	const allFilled = firstName.length > 0 && lastName.length > 0 && regEmail.length > 0 && newPass.length > 0 && confirmPass.length > 0;

	if (allFilled) {
		// loading animation showing
		document.querySelector("#load-animation").innerHTML = `
                    <div class="load-bg">
                        <div class="wrap-loading">
                            <div class="loading"></div>
                        </div>
                    </div>`;

		// Get client Geolocation Data by third party API
		const response = await fetch(geolocationApiUrl);
		const geolocationData = await response.json();

		const dataObj = { firstName, lastName, regEmail, newPass, confirmPass, geolocationData };

		const apiUrl = "/api/ls/signup";
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

				if (response.account_create) {
					// Clear input box after register successful
					document.querySelector("#first_name").value = "";
					document.querySelector("#last_name").value = "";
					document.querySelector("#reg_email").value = "";
					document.querySelector("#reg_password").value = "";
					document.querySelector("#reg_confirm_password").value = "";

					// Error message remove if account created
					document.querySelector(".fst-nm-msg").innerHTML = "";
					document.querySelector(".lst-nm-msg").innerHTML = "";
					document.querySelector(".eml-msg").innerHTML = "";
					document.querySelector(".reg-pass-msg").innerHTML = "";
					document.querySelector(".confirm-pass-msg").innerHTML = "";

					// Floating message show if account create successful
					const element = document.querySelector(".floating-alert-notification");
					element.innerHTML = '<p class="success-alert alert-msg">Account created successfully</p>';
					element.classList.add("show");
					setTimeout(() => {
						element.classList.remove("show");
					}, 3000);

					// redirecting after 3 seconds
					setTimeout(() => {
						location.replace("/user");
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

					target = document.querySelector(".eml-msg");
					if (response.emailMsg) {
						target.innerHTML = `<small class="error-message">${response.emailMsg}</small>`;
					} else {
						target.innerHTML = "";
					}

					target = document.querySelector(".reg-pass-msg");
					if (response.newPassMsg) {
						target.innerHTML = `<small class="error-message">${response.newPassMsg}</small>`;
					} else {
						target.innerHTML = "";
					}

					target = document.querySelector(".confirm-pass-msg");
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
	} else {
		// Showing floating alert message if any fields empty
		const element = document.querySelector(".floating-alert-notification");
		element.innerHTML = '<p class="danger-alert alert-msg">Please fill all the fields.</p>';
		element.classList.add("show");

		setTimeout(() => {
			element.classList.remove("show");
		}, 3000);
	}
}

document.querySelector("#register-submit").onclick = regApiRequest;

// Register API request func End

// Login API request func Start

async function loginApiRequest(event) {
	event.preventDefault();

	const emailOrUsername = document.querySelector("#user_or_email").value;
	const password = document.querySelector("#password").value;
	const keepLogged = document.querySelector("#chk1").checked;

	const allFilled = emailOrUsername.length > 0 && password.length;

	if (allFilled) {
		// loading animation showing
		document.querySelector("#load-animation").innerHTML = `
                    <div class="load-bg">
                        <div class="wrap-loading">
                            <div class="loading"></div>
                        </div>
                    </div>`;

		// Get client Geolocation Data by third party API
		const response = await fetch(geolocationApiUrl);
		const geolocationData = await response.json();

		const dataObj = { emailOrUsername, password, keepLogged, geolocationData };

		const apiUrl = "/api/ls/login";
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
				if (response.loginSuccess) {
					// Error message remove if Logged in
					document.querySelector(".eml_or_user_msg").innerHTML = "";
					document.querySelector(".pass-msg").innerHTML = "";

					// Floating message show if login success
					const element = document.querySelector(".floating-alert-notification");
					element.innerHTML = '<p class="success-alert alert-msg">You\'re successfully Logged in.</p>';
					element.classList.add("show");
					setTimeout(() => {
						element.classList.remove("show");
					}, 3000);

					// redirecting after 3 seconds
					setTimeout(() => {
						location.replace("/user");
					}, 3000);
				} else {
					let target = document.querySelector(".eml_or_user_msg");
					if (response.userMsg) {
						target.innerHTML = `<small class="error-message">${response.userMsg}</small>`;
					} else {
						target.innerHTML = "";
					}

					target = document.querySelector(".pass-msg");
					if (response.passMsg) {
						target.innerHTML = `<small class="error-message">${response.passMsg}</small>`;
					} else {
						target.innerHTML = "";
					}
				}
			})
			.catch(function (reason) {
				console.log(reason);
			});
	} else {
		// Showing floating alert message if any fields empty
		const element = document.querySelector(".floating-alert-notification");
		element.innerHTML = '<p class="danger-alert alert-msg">Please fill all the fields.</p>';
		element.classList.add("show");

		setTimeout(() => {
			element.classList.remove("show");
		}, 3000);
	}
}
document.querySelector("#login-submit").onclick = loginApiRequest;

// Login API request func End

//////////////////////////// Forget pass API request Start ////////////////////////////

/* Forget Email or USername Submit */
function forgetPassEmail_ApiRequest(event) {
	event.preventDefault();

	const userOrEmail = document.querySelector("#forget-email-input").value;
	if (userOrEmail) {
		// loading animation showing
		document.querySelector("#load-animation").innerHTML = `
                    <div class="load-bg">
                        <div class="wrap-loading">
                            <div class="loading"></div>
                        </div>
                    </div>`;

		const dataObj = { userOrEmail };
		const apiUrl = "/api/ls/forget-email-submit";
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

				if (response.codeSend) {
					// Floating message show if recovery code sent
					const element = document.querySelector(".floating-alert-notification");
					element.innerHTML = '<p class="success-alert alert-msg">We have sent a recovery code to your email.</p>';
					element.classList.add("show");
					setTimeout(() => {
						element.classList.remove("show");
					}, 3000);

					// hiding forget- email input part and show forget code input part
					document.querySelector(".forget-email-div").classList.add("hide");
					document.querySelector(".forget-code-div").classList.remove("hide");
				} else if (response.forgetUserMsg) {
					document.querySelector(".forget_eml_msg").innerHTML = `<small class='error-message'>${response.forgetUserMsg}</small>`;
				} else if (response.rld) {
					// reload current page
					setTimeout(() => {
						location.reload();
					}, 2000);
				}
			})
			.catch(function (reason) {
				console.log(reason);
			});
	} else {
		document.querySelector(".forget_eml_msg").innerHTML = "<small class='error-message'>Enter your email address or username to recover your account!</small>";
	}
}
document.querySelector("#forget-email-submit").onclick = forgetPassEmail_ApiRequest;

/* Forget Code Submit */
function forgetPassCode_ApiRequest(event) {
	event.preventDefault();

	const userEnteredCode = document.querySelector("#forget-code-input").value;

	const itsCode = !(String(Number(userEnteredCode)) === "NaN");

	if (userEnteredCode && itsCode) {
		// loading animation showing
		document.querySelector("#load-animation").innerHTML = `
                    <div class="load-bg">
                        <div class="wrap-loading">
                            <div class="loading"></div>
                        </div>
                    </div>`;

		const dataObj = { userEnteredCode };
		const apiUrl = "/api/ls/forget-code-submit";
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

				if (response.codeMatched) {
					// hiding forget- code input part and show forget password input part
					document.querySelector(".forget-code-div").classList.add("hide");
					document.querySelector(".forget-pass-div").classList.remove("hide");
				} else if (response.codeMsg) {
					document.querySelector(".forget_code_msg").innerHTML = `<small class='error-message'>${response.codeMsg}</small>`;
				} else if (response.rld) {
					// reload current page
					setTimeout(() => {
						location.reload();
					}, 2000);
				}
			})
			.catch(function (reason) {
				console.log(reason);
			});
	} else {
		if (!userEnteredCode) {
			document.querySelector(".forget_code_msg").innerHTML = "<small class='error-message'>Please Enter the recovery code</small>";
		} else if (!itsCode) {
			document.querySelector(".forget_code_msg").innerHTML = "<small class='error-message'>Please Enter the 6 digits recovery code that you received most recent!</small>";
		}
	}
}
document.querySelector("#forget-code-submit").onclick = forgetPassCode_ApiRequest;

/* Forget Code Resend */
let interval = null;
function forgetPassResendCode_ApiRequest(event) {
	event.preventDefault();

	// loading animation showing
	document.querySelector("#load-animation").innerHTML = `
                    <div class="load-bg">
                        <div class="wrap-loading">
                            <div class="loading"></div>
                        </div>
                    </div>`;

	const apiUrl = "/api/ls/forget-code-resend";
	fetch(apiUrl, {
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		method: "POST",
		body: JSON.stringify({}),
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

			if (response.seconds) {
				let seconds = response.seconds;

				if (interval != null) {
					clearInterval(interval);
				}

				interval = setInterval(function () {
					seconds = Number(seconds) - 1;

					if (seconds >= 0) {
						const min = Math.floor(seconds / 60);
						const retailSeconds = Math.floor(seconds % 60);
						const hour = Math.floor(min / 60);
						const retailMins = Math.floor(min % 60);

						if (hour < 1) {
							var resendCodeAfter = `${retailMins} minutes: ${retailSeconds} seconds`;
							if (retailMins < 1) {
								resendCodeAfter = `${retailSeconds} seconds`;
							}
						} else {
							resendCodeAfter = `${hour} hours: ${retailMins} minutes: ${retailSeconds} seconds`;
						}
						document.querySelector("#code-send-next-time-show .txt").innerText = "Code resend request after";
						document.querySelector("#code-send-next-time-show .tm").innerText = resendCodeAfter;
					} else {
						document.querySelector("#code-send-next-time-show .txt").innerText = "";
						document.querySelector("#code-send-next-time-show .tm").innerText = "";
					}
				}, 1000);
			}

			if (response.codeResend) {
				// Floating message show if recovery code resent
				const element = document.querySelector(".floating-alert-notification");
				element.innerHTML = '<p class="success-alert alert-msg">Code resent successfully</p>';
				element.classList.add("show");
				setTimeout(() => {
					element.classList.remove("show");
				}, 3000);
			} else if (response.resendTurnsNotAvailable === "yes") {
				// Floating message show if recovery code resend turns not available at current time
				const element = document.querySelector(".floating-alert-notification");
				const resendCodeAfter = document.querySelector("#code-send-next-time-show .tm").innerText;

				if (resendCodeAfter.length > 2) {
					element.innerHTML = `<p class="danger-alert alert-msg">Try again after ${resendCodeAfter}</p>`;
				} else {
					element.innerHTML = `<p class="danger-alert alert-msg">Try again later!</p>`;
				}

				element.classList.add("show");
				setTimeout(() => {
					element.classList.remove("show");
				}, 3000);
			} else if (response.rld) {
				// reload current page
				setTimeout(() => {
					location.reload();
				}, 2000);
			}
		})
		.catch(function (reason) {
			console.log(reason);
		});
}
document.querySelector("#forget-code-resend").onclick = forgetPassResendCode_ApiRequest;

/* Forget Password Submit */
async function forgetPassPassword_ApiRequest() {
	event.preventDefault();
	const forgetNewPass = document.querySelector("#forget-newpass-input").value;
	const forgetConfirmNewPass = document.querySelector("#forget-confirmpass-input").value;

	if (forgetNewPass && forgetConfirmNewPass) {
		// loading animation showing
		document.querySelector("#load-animation").innerHTML = `
                    <div class="load-bg">
                        <div class="wrap-loading">
                            <div class="loading"></div>
                        </div>
                    </div>`;

		// Get client Geolocation Data by third party API
		const response = await fetch(geolocationApiUrl);
		const geolocationData = await response.json();

		const dataObj = { forgetNewPass, forgetConfirmNewPass, geolocationData };
		const apiUrl = "/api/ls/forget-password-submit";
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

				if (response.passUpdate) {
					// Floating message show if password changed successful by forget
					const element = document.querySelector(".floating-alert-notification");
					element.innerHTML = '<p class="success-alert alert-msg">Password changed successfully</p>';
					element.classList.add("show");
					setTimeout(() => {
						element.classList.remove("show");
					}, 3000);

					// redirecting after 4 seconds
					setTimeout(() => {
						location.replace("/user");
					}, 3000);
				} else if (response.rld) {
					// reload current page
					setTimeout(() => {
						location.reload();
					}, 2000);
				} else {
					if (response.forgetNewPassMsg) {
						document.querySelector(".forget_newpass_msg").innerHTML = `<small class='error-message'>${response.forgetNewPassMsg}</small>`;
					} else {
						document.querySelector(".forget_newpass_msg").innerHTML = "";
					}

					if (response.forgetcnfrmPassMsg) {
						document.querySelector(".forget_confirmpass_msg").innerHTML = `<small class='error-message'>${response.forgetcnfrmPassMsg}</small>`;
					} else {
						document.querySelector(".forget_confirmpass_msg").innerHTML = "";
					}
				}
			})
			.catch(function (reason) {
				console.log(reason);
			});
	} else {
		if (!forgetNewPass) {
			document.querySelector(".forget_newpass_msg").innerHTML = "<small class='error-message'>Please Enter a new password!</small>";
		} else {
			document.querySelector(".forget_newpass_msg").innerHTML = "";
		}

		if (!forgetConfirmNewPass) {
			document.querySelector(".forget_confirmpass_msg").innerHTML = "<small class='error-message'>Please Enter confirm password!</small>";
		} else {
			document.querySelector(".forget_confirmpass_msg").innerHTML = "";
		}
	}
}
document.querySelector("#forget-pass-submit").onclick = forgetPassPassword_ApiRequest;

//////////////////////////// Forget pass API request End ////////////////////////////
