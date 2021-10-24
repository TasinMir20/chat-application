/**************************** API request *****************************/
///////////////////////////////////////////////////////////////////////

/* Email verify API request func Start */
function emailVerify_ApiRequest(event) {
	event.preventDefault();

	const userEnteredCode = document.querySelector("#email-verify-code").value;

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
		const apiUrl = "/api/user/email-verification";
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
					if (response.codeMatched) {
						// Floating message show if Email address confirmed
						const element = document.querySelector(".floating-alert-notification");
						element.innerHTML = '<p class="success-alert alert-msg">Email address confirmed successfully</p>';
						element.classList.add("show");
						setTimeout(() => {
							element.classList.remove("show");
						}, 3000);

						// redirecting after 3 seconds
						setTimeout(() => {
							location.replace("/user");
						}, 3000);
					} else if (response.codeMsg) {
						document.querySelector(".code_msg").innerHTML = `<small class='error-message'>${response.codeMsg}</small>`;
					}
				} else {
					document.querySelector("body").innerHTML = "<h2>There is a Server Error. Please try again later, we are working to fix it...</h2>";
					throw new Error("Server Error");
				}
			})
			.catch(function (reason) {
				console.log(reason);
			});
	} else {
		if (!userEnteredCode) {
			document.querySelector(".code_msg").innerHTML = "<small class='error-message'>Please Enter the recovery code</small>";
		} else if (!itsCode) {
			document.querySelector(".code_msg").innerHTML = "<small class='error-message'>Please Enter the 6 digits recovery code that you received most recent!</small>";
		}
	}
}

document.querySelector("#code-submit").onclick = emailVerify_ApiRequest;
/* Email verify API request func End */

/* Email verification Code Resend */
let interval = null;
function emailVerifyResendCode_ApiRequest(event) {
	event.preventDefault();

	// loading animation showing
	document.querySelector("#load-animation").innerHTML = `
                    <div class="load-bg">
                        <div class="wrap-loading">
                            <div class="loading"></div>
                        </div>
                    </div>`;

	const apiUrl = "/api/user/email-verification-code-resend";
	fetch(apiUrl, {
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		method: "POST",
		body: JSON.stringify({}),
	})
		.then((res) => res.json())
		.then((data) => {
			// loading animation clear
			document.querySelector("#load-animation").innerHTML = "";

			const response = data;

			if (!(response.error === "server error")) {
				if (response.seconds) {
					document.querySelector("#temporarily-store-seconds").value = response.seconds;

					if (interval != null) {
						clearInterval(interval);
					}

					interval = setInterval(function () {
						let seconds = document.querySelector("#temporarily-store-seconds").value;
						seconds = Number(seconds) - 1;
						document.querySelector("#temporarily-store-seconds").value = seconds; // temporarily store seconds

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
					// Floating message show if verification code resent
					const element = document.querySelector(".floating-alert-notification");
					element.innerHTML = '<p class="success-alert alert-msg">Verification code resent successfully</p>';
					element.classList.add("show");
					setTimeout(() => {
						element.classList.remove("show");
					}, 3000);
				} else if (response.resendTurnsNotAvailable === "yes") {
					// Floating message show if verification code resend turns not available at current time
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
			} else {
				document.querySelector("body").innerHTML = "<h2>There is a Server Error. Please try again later, we are working to fix it...</h2>";
				throw new Error("Server Error");
			}
		})
		.catch(function (reason) {
			console.log(reason);
		});
}
document.querySelector("#email-verify-code-resend").onclick = emailVerifyResendCode_ApiRequest;
