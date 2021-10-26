function selectedFile() {
	document.querySelector("#input-file").onchange = function () {
		// const input = document.querySelector("#input-file");
		const fileChoose = this;
		if (fileChoose.files && fileChoose.files[0]) {
			const reader = new FileReader();
			reader.onload = function (e) {
				document.querySelector(".preview img").src = e.target.result;

				document.querySelector(".profile-photo-set-elements .file-choose-area").classList.add("hide");
				document.querySelector(".profile-photo-set-elements .preview").classList.remove("hide");
				document.querySelector(".profile-photo-set-elements .up-button").classList.remove("hide");
			};
			reader.readAsDataURL(fileChoose.files[0]);
		}
	};
}

function closePhotoUploadWindow() {
	document.querySelector(".profile .profile-photo .profile-photo-set-elements").innerHTML = "";
}

function unSelectedFile() {
	const fileChosen = document.querySelector("#input-file");
	fileChosen.value = fileChosen.defaultValue;

	document.querySelector(".profile-photo-set-elements .file-choose-area").classList.remove("hide");
	document.querySelector(".profile-photo-set-elements .preview").classList.add("hide");

	document.querySelector(".profile-photo-set-elements .up-button").classList.add("hide");

	// upload button reset
	const uploadBtn = document.querySelector(".profile-photo-set-elements .up-button .btn");
	uploadBtn.classList.remove("uploading");
	document.querySelector(".profile-photo-set-elements .up-button .btn").innerText = "Upload photo";
}

function profilePhotoUploading_ApiRequest() {
	const uploadBtn = document.querySelector(".profile-photo-set-elements .up-button .btn");
	uploadBtn.classList.add("uploading");
	uploadBtn.innerText = "Uploading";
	////////////////////////////////////////

	const fileChosen = document.querySelector("#input-file");

	if (fileChosen.files.length > 0) {
		// Profile photo upload process
		const messageForm = document.querySelector("#profile-photo-form");
		const formData = new FormData(messageForm);
		formData.append("thePhoto", fileChosen);

		const apiUrl = "/api/user/profile/profile-photo-upload";
		fetch(apiUrl, {
			method: "POST",
			body: formData,
		})
			.then((res) => {
				if (res.status == 500) {
					document.querySelector("body").innerHTML = "<h2>There is a Server Error. Please try again later, we are working to fix it...</h2>";
					throw new Error("Server Error");
				} else if (res.status == 404) {
					document.querySelector("body").innerHTML = "<h4>Not found...</h4>";
					throw new Error("Not found...");
				} else {
					window.statusCode = res.status;
					return res.json();
				}
			})
			.then((data) => {
				if (window.statusCode !== 406) {
					document.querySelector(".profile .profile-photo .profile-photo-set-elements").innerHTML = "";

					// update profile photo img tag src url
					document.querySelector(".top-bar .top-info .user-pic img").src = `/images/users/profile-photo/${data.uploadedProfilePhotoName}`;
					document.querySelector(".top-bar .dropdown .dropdown-elements .user-pic img").src = `/images/users/profile-photo/${data.uploadedProfilePhotoName}`;
					document.querySelector(".profile .profile-photo .photo img").src = `/images/users/profile-photo/${data.uploadedProfilePhotoName}`;

					// Floating message show if profile photo upload successful
					const element = document.querySelector(".floating-alert-notification");
					element.innerHTML = `<p class="success-alert alert-msg">${data.upload}</p>`;
					element.classList.add("show");
					setTimeout(() => {
						element.classList.remove("show");
					}, 3000);
				} else {
					unSelectedFile();

					// Floating message show if profile photo upload any requirement not be fill
					const element = document.querySelector(".floating-alert-notification");
					element.innerHTML = `<p class="danger-alert alert-msg">${data.issue}</p>`;
					element.classList.add("show");
					setTimeout(() => {
						element.classList.remove("show");
					}, 3000);
				}
			})
			.catch(function (reason) {
				console.log(reason);
			});
	}
}

function editProfilePhoto() {
	document.querySelector(".profile .profile-photo .profile-photo-set-elements").innerHTML = `<div class="photo-set-section">
        <div class="cont">
            <div class="inner">
                <div class="file-choose-area">
                    <form class="file file--upload" id="profile-photo-form" method="post" enctype="multipart/form-data">
                        <label for="input-file">
                            <i class="fas fa-cloud-upload-alt"></i>
                            Choose a picture
                        </label>
                        <input id="input-file" type="file" name="thePhoto" accept="image/*" />
                    </form>
                </div>
                <div class="preview hide">
                    <div class="preview-img"><img src="" /></div>
                    <i class="fas fa-times"></i>
                </div>
                <div class="up-button hide">
                    <button type="button" class="btn">Upload photo</button>
                </div>
            </div>
            <button class="close-button">Close</button>
        </div>
    </div>`;

	////////////////////////////////////////////////////////////////////////////////
	selectedFile();
	document.querySelector(".profile-photo .photo-set-section .cont .close-button").onclick = closePhotoUploadWindow;
	document.querySelector(".profile-photo-set-elements .preview i").onclick = unSelectedFile;
	document.querySelector(".profile-photo-set-elements .up-button .btn").onclick = profilePhotoUploading_ApiRequest;
}

const isSelfProfile = document.querySelector(".profile .profile-photo .edit-icon");
if (isSelfProfile) {
	document.querySelector(".profile .profile-photo .edit-icon i").onclick = editProfilePhoto;
}
