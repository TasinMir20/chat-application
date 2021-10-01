const body = document.querySelector("body");

function selfOnline() {
    document.querySelector(".sections .container .messenger-container .chat-list-left-sidebar .self-profile .wrap .img-wrap").style = "border-color: #2ecc71";
}
body.ononline = selfOnline;


function selfOffline() {
    document.querySelector(".sections .container .messenger-container .chat-list-left-sidebar .self-profile .wrap .img-wrap").style = "border-color: #c4c4c4";
}
body.onoffline = selfOffline;


// Whole messenger full screen and Exit full screen
function messengerFullScreenN_Exit() {
    if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement) {
        // current working methods
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
        
    } else {
        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }
    }
}
document.querySelector(".chatbox-header").ondblclick = messengerFullScreenN_Exit;



// when screen less than 768px and click ".left-arrow i" -> right side chat conversions hide and show left side chat user list
function chatListOfUserShowAndChatHide() {
    document.querySelector(".chat-list-left-sidebar").classList.add("show");
    document.querySelector(".messages-right-sidebar").classList.add("hide");
}
document.querySelector(".left-arrow i").onclick = chatListOfUserShowAndChatHide;



// Double click to Expand chatting conversation's Images
function imgExpand(imgUri) {
    const insertAbleElements = `<div class="inner">
                                    <div class="img-collapse-trigger trigger"><i class="fas fa-times" title="Collapse"></i></div>
                                    <div class="full-screen-trigger trigger"><i class="fas fa-expand-arrows-alt" title="Full screen"></i></div>
                                    <div class="img-wrap">
                                        <img src="${imgUri}" alt="">
                                    </div>
                                </div>`;

    const imgExpandElement = document.querySelector("#img-expand");
    imgExpandElement.innerHTML = insertAbleElements;
    imgExpandElement.style = "display: block";

    // check is already full screen
    const isFullScreen = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement ? true : false;


    // Do full screen
    function fullScreen() {
        document.querySelector("#img-expand .full-screen-trigger").style = "display: none";
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        }
    }
    document.querySelector("#img-expand .full-screen-trigger i").onclick = fullScreen;

    function imgScreenCollapse() {
        const imgExpandElement = document.querySelector("#img-expand");
        imgExpandElement.innerHTML = "";
        imgExpandElement.style = "display: none";


        if (!isFullScreen) {
            // Exit full screen
            if (document.cancelFullScreen) {
                document.cancelFullScreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }
        }
    }
    document.querySelector("#img-expand .img-collapse-trigger i").onclick = imgScreenCollapse;
}





// Start -> Reuseable function or component
function messageHtmlInnerBody(attachment, textMessage, participant) {
    // Text message or attachment
    let attachmentTag = "";
    let theMessage = "";
    if (attachment) {
        let attachmentName = attachment;
        let extension = attachmentName.split('.').pop();
        let attachmentPath = "/api/user/messenger/files/";
        if (["jpg", "jpeg", "png", "gif", "tiff", "ico", "webp", "svg"].includes(extension)) {
            attachmentTag = `<img ondblclick="imgExpand('${attachmentPath}${attachmentName}?rsp=${participant}')" src="${attachmentPath}${attachmentName}?rsp=${participant}" title="double click to expand" />`;

        } else if (["mp3", "mpeg", "ogg", "wav", "m4a"].includes(extension)) {
            attachmentTag = `<audio controls>
                                <source src="${attachmentPath}${attachmentName}?rsp=${participant}" />
                            </audio>`;
        } else if (["mp4", "mkv", "mov", "webm", "avi", "3gp"].includes(extension)) {
            attachmentTag = `<video controls>
                                <source src="${attachmentPath}${attachmentName}?rsp=${participant}">
                            </video>`;

        } else if (["pdf"].includes(extension)) {
            
            if (screen.width < 768) {
                attachmentTag = `<iframe src="${attachmentPath}${attachmentName}?rsp=${participant}"></iframe>`;
            } else {
                attachmentTag = `<embed src="${attachmentPath}${attachmentName}?rsp=${participant}" />`;
            } 

        } else {
            attachmentTag = `<div class="lnk-wrap">
                                <a target="_blank" class="fas fa-file-archive" title="click to download" href="${attachmentPath}${attachmentName}?rsp=${participant}"></a>
                            </div>`;
        }

        theMessage = attachmentTag;

    } else {
        //  HTML tag conflation resolve
        const rawMessage = textMessage;
        let validatedMessage = rawMessage.replace(/</g, "&lt").replace(/>/g, "&gt");
        // Line break or line ending replace with <br /> tag
        validatedMessage = validatedMessage.replace(/\r\n/g, '<br />').replace(/[\r\n]/g, '<br />');
        var textMessage = `<p class="message">${validatedMessage}</p>`;

        theMessage = textMessage;
    }

    return theMessage;
}
// End -> Reuseable function or component



/************************************************* API Function start form here to END ************************************/

function chatUserList() {
    const apiUrl = "/api/user/messenger/chat-user-list";

    fetch(apiUrl, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({})
    })
    .then((res) => res.json())
    .then((data) => {

        if (!(data.error === "server error")) {

            const chatUserList = document.querySelector(".chat-list");

            const {chatListUsers} = data;

            if (chatListUsers[0]) {
                // both left-sidebar and right-sidebar show when at least one previous users exist in chat list
                document.querySelector(".sections .container .messenger-container .chat-list-left-sidebar").classList.remove("w0");
                document.querySelector(".sections .container .messenger-container .messages-right-sidebar").classList.remove("w0");

                let chatUserListHTML = "";
                for (let i = 0; i < chatListUsers.length; i++) {
                    const currentEpochTime = Math.floor(new Date().getTime()/1000);

                    let circleVisibility = "";
                    let circleColor = "";
                    let inactiveTimeVisibility = "";
                    let inactiveTime = "";
                    // check user online or not
                    if (chatListUsers[i].lastOnlineTime === 1) {
                        inactiveTimeVisibility = "hide";
                        circleColor = 'green';
                    } else if (chatListUsers[i].lastOnlineTime === 0) {
                        inactiveTimeVisibility = "hide";
                        circleVisibility = "hide";
                    } else {
                        // last online time
                        const seconds = currentEpochTime - chatListUsers[i].lastOnlineTime;
                        if (seconds > 86400) {
                            inactiveTimeVisibility = "hide";
                            circleColor = 'red';
                            
                        } else if (seconds > 43200) {
                            inactiveTimeVisibility = "hide";
                            circleColor = 'yellow';
                        } else {
                            circleVisibility = "hide";
                            
                            const min = Math.floor(seconds / 60);
                            const andSec = Math.floor(seconds % 60);
                            const hour = Math.floor(min / 60);
                            const andMin = Math.floor(min % 60);
                            if (hour < 1) {
                                inactiveTime = `${andMin}m`;
                                if (andMin < 1) {
                                    inactiveTime = `${andSec}s`;
                                }
                            } else  {
                                inactiveTime = `${hour}h`;
                            }
                        } 
                    }

                    // last message time
                    const seconds = currentEpochTime - chatListUsers[i].lastMessageTime;
                    const min = Math.floor(seconds / 60);
                    const andSec = Math.floor(seconds % 60);
                    const hour = Math.floor(min / 60);
                    const andMin = Math.floor(min % 60);
                    const day = Math.floor(hour / 24);
                    let lastMsgTime = "";
                    if (day < 1) {
                        if (hour < 1) {
                            lastMsgTime = `${andMin}m ago`;
                            if (andMin < 1) {
                                lastMsgTime = `${andSec}s ago`;
                            }
                        } else  {
                            lastMsgTime = `${hour}h ago`;
                        }
                    } else {
                        lastMsgTime = `${day}d ago`;
                    }


                    // generate unique css class from user obj ID
                    let str = chatListUsers[i]._id;
                    let setUniqueCssClass = "c"+(str.substr(str.length - 5, str.length));

                    //  HTML tag conflation resolve
                    const rawMessage = chatListUsers[i].lastMessage;
                    let validatedMessage = rawMessage.replace(/</g, "&lt").replace(/>/g, "&gt");


                    chatUserListHTML += `
                            <div class="single-user ${setUniqueCssClass}" onclick="fetchUserChats('${chatListUsers[i]._id}');">
                                <div class="img-wrap">
                                    <img src="/images/users/profile-photo/${chatListUsers[i].profilePic}" alt="">
                                    <i class="${circleColor} ${circleVisibility} fas fa-circle"></i>
                                    <span class="${inactiveTimeVisibility}">${inactiveTime}</span>
                                </div>
                                <div class="meta">
                                    <p class="name">${chatListUsers[i].firstName} ${chatListUsers[i].lastName}</p>
                                    <p class="last-message">${validatedMessage}</p>
                                    <span class="last-msg-time">${lastMsgTime}</span>
                                </div>
                            </div>`;
                }

                chatUserList.innerHTML = chatUserListHTML;
            } else {
                // only left-sidebar show when no previous users in chat list
                document.querySelector(".sections .container .messenger-container").classList.add("no-previous-people");

                chatUserList.innerHTML = "<p class='no-u-chat-list'>You have no connected people to chat with!</p>";
            }

        } else {
            document.querySelector("body").innerHTML = "There is a Server Error. Please try again later, we are working to fix it...";
            throw new Error('Server Error');
        }

    })
    .catch (function(reason) {
        console.log(reason);
    });
}
window.addEventListener("load", chatUserList);

// chatUserList() function in Interval to refresh user online offline time
setInterval(() => {
    chatUserList();
}, 60000);




let timeOut1 = null;
function searchUsersToChat() {
    const searchKeyWord = document.querySelector("#search").value;

    if (searchKeyWord) {

        if (timeOut1 != null) {
            clearTimeout(timeOut1);
        }

        timeOut1 = setTimeout(() => {
            const apiUrl = "/api/user/messenger/search-users";
            fetch(apiUrl, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify({searchKeyWord})
            })
            .then((res) => res.json())
            .then((data) => {
                if (!(data.error === "server error")) {

                    if (data.foundUser) {
                        document.querySelector(".search-results").innerHTML = data.foundUser;
                    } else {
                        document.querySelector(".search-results").innerHTML = "";
                    }

                } else {
                    document.querySelector("body").innerHTML = "There is a Server Error. Please try again later, we are working to fix it...";
                    throw new Error('Server Error');
                }
            })
            .catch (function(reason) {
                console.log(reason);
            });

        }, 500);

    } else {
        document.querySelector(".search-results").innerHTML = "";
    }

}
document.querySelector("#search").onkeyup = searchUsersToChat;



let incre = 0;
function fetchUserChats(participant, isItSearch, pagination) {

    if (window.innerWidth < 770) {
        // START -- when screen less than 768px -> left side user chat list users hide and show chat conversions
        document.querySelector(".chat-list-left-sidebar").classList.remove("show");
        document.querySelector(".messages-right-sidebar").classList.remove("hide");
        // END -- when screen less than 768px -> left side user chat list users hide and show chat conversions
    }

    document.querySelector(".search-results").innerHTML = "";
    recipientId = participant; // updating message recipient id

    if (participant) {

        if (!pagination) {
            const chatBox = document.querySelector(".chat-box");
            chatBox.scrollTop = chatBox.scrollHeight - chatBox.clientHeight;
        }

        const apiUrl = "/api/user/messenger/fetch-chats";
        fetch(apiUrl, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({participant, isItSearch, pagination})
        })
        .then((res) => res.json())
        .then((data) => {
            if (!(data.error === "server error")) {

                // when no previous user in the chat list then search someone and click on it- show chat box
                document.querySelector(".sections .container .messenger-container").classList.remove("no-previous-people");
                document.querySelector(".sections .container .messenger-container .chat-list-left-sidebar").classList.remove("w0");
                document.querySelector(".sections .container .messenger-container .messages-right-sidebar").classList.remove("w0");

                // chat header name and profile pic update when switched to other chat
                document.querySelector(".chatbox-header .meta .name").innerText = data.fullName;
                document.querySelector(".chatbox-header .img-wrap .pic").src = `/images/users/profile-photo/${data.profilePic}`;

                
                
                document.querySelector(".msg-form-wrap .msg-input-form").classList.remove("hide");
                document.querySelector(".unavailable-to-sent-msg").style = "display: none";
                // chat header user or current chatting partner active-inactive update when switched to other chat
                const element = document.querySelector(".chatbox-header .img-wrap i");
                if (data.lastOnlineTime === 1) {
                    element.classList.remove("hide", "red", "yellow");
                    element.classList.add("green");
                    document.querySelector(".messages-right-sidebar .act").innerText = "Active now";
                } else if (data.lastOnlineTime === 0) {
                    element.classList.remove("green", "red", "yellow");
                    element.classList.add("hide");
                    document.querySelector(".messages-right-sidebar .act").innerText = "Unavailable";

                    // lastOnlineTime = 0 means user does not exist, if does not exist so message input form have to be hide
                    document.querySelector(".msg-form-wrap .msg-input-form").classList.add("hide")
                    document.querySelector(".unavailable-to-sent-msg").style = "display: block";
                } else {
                    const currentEpochTime = Math.floor(new Date().getTime()/1000);
                    const seconds = currentEpochTime - data.lastOnlineTime;

                    /////////////////////////////////////////
                    const min = Math.floor(seconds / 60);
                    const andSec = Math.floor(seconds % 60);
                    const hour = Math.floor(min / 60);
                    const andMin = Math.floor(min % 60);
                    const day = Math.floor(hour / 24);

                    let inactiveTime = "";
                    if (day < 1) {
                        if (hour < 1) {
                            inactiveTime = `${andMin}m`;
                            if (andMin < 1) {
                                inactiveTime = `${andSec}s`;
                            }
                        } else  {
                            inactiveTime = `${hour}h`;
                        }
                    } else {
                        inactiveTime = `${day}d`;
                    }
                    document.querySelector(".messages-right-sidebar .act").innerText = `Active ${inactiveTime} ago`;
                    /////////////////////////////////////////


                    if (seconds > 86400) {
                        element.classList.remove("hide", "yellow", "green");
                        element.classList.add("red");
                    } else if (seconds < 86400) {
                        element.classList.remove("hide", "red", "green");
                        element.classList.add("yellow");
                    }


                }
                /////////////////////////////////////////////////////////


                // chat list message update to front when switched to other chat
                if (data.conversations) {
                    const selfProfilePic = document.querySelector(".chat-list-left-sidebar .self-profile .img-wrap img").src;

                    let conversations = data.conversations;
                    let eachMessageHTMLBody = "";
                    for (let i = 0; i < conversations.length; i++) {
                        // Time convert to client local (Whole Date and time)
                        const msgSendTime = conversations[i].msgSendTime;
                        const msgDate = new Date(msgSendTime * 1000);
                        const date = msgDate.toLocaleString('en-US', { month: 'long', day: "numeric", year: 'numeric'});
                        const time = msgDate.toLocaleString('en-US', { hour: "numeric", minute: "numeric"});
                        const localDateAndTime = `${date} at ${time}`;


                        // defining this message incoming or outgoing
                        let incomingOrOutgoing = "";
                        let messageAuthorPic = "";
                        if (String(conversations[i].sender) === String(mySelfId)) {
                            incomingOrOutgoing = "outgoing-message";
                            messageAuthorPic = selfProfilePic;
                            
                        } else {
                            incomingOrOutgoing = "incoming-message";
                            messageAuthorPic = `/images/users/profile-photo/${data.profilePic}`;
                        }


                        const cssClass = conversations[i].attachmentName ? "attachment-style" : "";
                        const theMessage = messageHtmlInnerBody(conversations[i].attachmentName, conversations[i].message, participant);
                        // the message html structure
                        eachMessageHTMLBody += `<div class="${incomingOrOutgoing} single-msg-box">
                                                    <div class="author-img">
                                                        <img src="${messageAuthorPic}" alt="">
                                                    </div>
                                                    <div class="msg-n-meta clearfix">
                                                        <div class="msg-inner ${cssClass}">
                                                            ${theMessage}
                                                        </div>
                                                        <span class="msg-time">${localDateAndTime}</span>
                                                    </div>
                                                </div>`;
                    }

                    if (pagination > 1) {
                        document.querySelector(".chat-box").insertAdjacentHTML("beforeend", eachMessageHTMLBody);
                    } else {
                        window.pagination = 1;
                        document.querySelector(".chat-box").innerHTML = eachMessageHTMLBody;
                    }


                    // all message fetching finished
                    window.allMessagesFetched = data.allMessagesFetched;

                } else {
                    document.querySelector(".chat-box").innerHTML = "<h1 class='no-conv-yet'>No conversation yet!</h1>";

                    if (isItSearch) {
                        const chatUserList = document.querySelector(".chat-list");

                        // If No previous user in chat list so first remove the "You have no connected people to chat with" message
                        const noUcL = chatUserList.innerHTML.match('no-u-chat-list">');
                        if (noUcL) {
                            chatUserList.innerHTML = "";
                        }


                        // the searched user already inserted or not in chat list
                        const alreadyExist = chatUserList.innerHTML.match(participant);
                        if (!alreadyExist) {
                            chatUserList.insertAdjacentHTML("afterbegin", data.newChatToAppendChatUserList);
                        }

                        
                    }
                }

                // in chat list current conversation user background color change as selected
                const str = participant;
                const getUniqueCssClass = "c"+(str.substr(str.length - 5, str.length));
                const toRemoveClass = document.querySelectorAll(".chat-list .single-user");

                for (let i = 0; i < toRemoveClass.length; i++) {
                    toRemoveClass[i].classList.remove("selected");
                }
                if (incre > 0) {
                    document.querySelector(`.${getUniqueCssClass}`).classList.add("selected");
                }
                incre++;

            } else {
                document.querySelector("body").innerHTML = "There is a Server Error. Please try again later, we are working to fix it...";
                throw new Error('Server Error');
            }
        })
        .catch (function(reason) {
            console.log(reason);
        });

    } else {
        document.querySelector(".chat-box").innerHTML = "<h1 class='no-conv-yet'>No conversation yet!</h1>";
    }

}

window.addEventListener("load", fetchUserChats(lastChattingUserId)); // also called every single chat List user and called chat box scroll top event




// Chat conversation->> Pagination When scrolled top end (behind the scene actually scrolled bottom of the element 'chatBox') then load previous messages
let timeOut2 = null;
function chatsPagination() {
    if (!window.allMessagesFetched) {
        const chatBox = document.querySelector(".chat-box");
        if (chatBox.clientHeight +  (Math.ceil(Math.abs(chatBox.scrollTop)) + 3) >= chatBox.scrollHeight) {
            console.log("Scrolled Bottom");
            if (timeOut2 != null) {
                clearTimeout(timeOut2);
            }

            timeOut2 = setTimeout(() => {
                window.pagination++;
                fetchUserChats(recipientId, false, window.pagination);
            }, 500);
        }
    }
    
}
document.querySelector(".chat-box").addEventListener('scroll', chatsPagination)



function sendMessage(event) {
    event.preventDefault();
    
    const selfProfilePic = document.querySelector(".chat-list-left-sidebar .self-profile .img-wrap img").src;

    const messageInput = document.querySelector("#input-msg");

    const message = messageInput.value.replace(/  +/g, ' ').trim(); // multiple spaces replace with single space
    const fileChosen = document.querySelector("#file-input");

    // Keyboard keep appears on mobile after submit form
    if (fileChosen.files.length == 0) {
        messageInput.focus();
    }


    if (message || fileChosen.files.length > 0) {
        document.querySelector("#input-msg").value = "";

        // Local Time (Whole Date and time)
        const msgDate = new Date();
        const date = msgDate.toLocaleString('en-US', { month: 'long', day: "numeric", year: 'numeric'});
        const time = msgDate.toLocaleString('en-US', { hour: "numeric", minute: "numeric"});
        const localDateAndTime = `${date} at ${time}`;


        // My Self last message insert into the conversation
        const cssClass = fileChosen.files.length > 0 ? "attachment-style" : "";
        const rawMessage = message;
        let validatedMessage = rawMessage.replace(/</g, "&lt").replace(/>/g, "&gt");
        // Line break or line ending replace with <br /> tag
        validatedMessage = validatedMessage.replace(/\r\n/g, '<br />').replace(/[\r\n]/g, '<br />');
        let eachMessageHTMLBody = `<div class="outgoing-message single-msg-box">
                                        <div class="author-img">
                                            <img src="${selfProfilePic}" alt="">
                                        </div>
                                        <div class="msg-n-meta clearfix">
                                            <div class="msg-inner ${cssClass}">
                                                ${fileChosen.files.length > 0 ?
                                                    `<img style="height: 80px; width: 80px;" src="/images/utils-img/loading.gif" title="Just wait..." />` :
                                                    `<p class="message">${validatedMessage}</p>`
                                                }
                                            </div>
                                            <span class="msg-time">${localDateAndTime}</span>
                                        </div>
                                    </div>`;

        const chatBox = document.querySelector(".chat-box");


        // if the first message so first remove the "No conversation yet" message
        const noConversation = chatBox.innerHTML.match('no-conv-yet">');
        if (noConversation) {
            chatBox.innerHTML = "";
        }

        // append every single HTML message body
        chatBox.insertAdjacentHTML("afterbegin", eachMessageHTMLBody);

        // Scroll bottom chat box when append message in chat box
        chatBox.scrollTop = chatBox.scrollHeight - chatBox.clientHeight;


        // self last message and last message send time update in chat list
        const str = recipientId;
        const getUniqueCssClass = "c"+(str.substr(str.length - 5, str.length));
        const lastMessage = message.length > 30 ? `${message.slice(0, 30)}...` : message;
        //  HTML tag conflation resolve
        let validatedMessage1 = lastMessage.replace(/</g, "&lt").replace(/>/g, "&gt");
        document.querySelector(`.${getUniqueCssClass} .meta .last-message`).innerHTML = `You: ${fileChosen.files.length > 0 ? "Attachment" : validatedMessage1}`;
        document.querySelector(`.${getUniqueCssClass} .meta .last-msg-time`).innerText = "Just now";

        //////////////////////////////////////////
        //////////////////////////////////////////


        if (fileChosen.files.length > 0) {
            // Attachment file message sending process
            const insertAfterResponse = document.querySelector(".chat-box .outgoing-message:first-child .msg-n-meta .msg-inner");
            const messageForm = document.querySelector(".msg-input-form");
            const formData = new FormData(messageForm);
            formData.append('theFile', fileChosen);
            formData.append('recipientId', recipientId);

            fileChosen.value = fileChosen.defaultValue;
            const apiUrl = "/api/user/messenger/send-message";
            fetch(apiUrl, {
                method: "POST",
                body: formData,
            })
            .then((res) => {
                window.statusCode = res.status;
                return res.json();
            })
            .then((data) => {
                if (!(data.error === "server error")) {

                    if (window.statusCode !== 406) {
                        const theMessage = messageHtmlInnerBody(data.attachmentName, "", recipientId);
                        insertAfterResponse.innerHTML = theMessage;
                    } else {
                        // remove message sending loading
                        insertAfterResponse.remove();

                        // Floating message show if file upload any requirement not fill
                        const element = document.querySelector(".floating-alert-notification");
                        element.innerHTML = `<p class="danger-alert alert-msg">${data.issue}</p>`;
                        element.classList.add("show");
                        setTimeout(() => {
                            element.classList.remove("show");
                        }, 3000);
                    }
                    
                    

                } else {
                    document.querySelector("body").innerHTML = "There is a Server Error. Please try again later, we are working to fix it...";
                    throw new Error('Server Error');
                }
            })
            .catch (function(reason) {
                console.log(reason);
            });

        } else if (message) {
            // Text message sending process
            const apiUrl = "/api/user/messenger/send-message";
            fetch(apiUrl, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify({message, recipientId})
            })
            .then((res) => res.json())
            .then((data) => {
                if (!(data.error === "server error")) {

                } else {
                    document.querySelector("body").innerHTML = "There is a Server Error. Please try again later, we are working to fix it...";
                    throw new Error('Server Error');
                }
                
            })
            .catch (function(reason) {
                console.log(reason);
            });
        }

    }

}
document.querySelector("#msg-sent-btn").addEventListener("click", sendMessage);


function messageSendByHitEnter(event){
    if (event.keyCode == 13 && !event.ctrlKey) {
        sendMessage(event);
    }
}
document.querySelector("#input-msg").addEventListener("keyup", messageSendByHitEnter);







const socket = io();
function socketEvent() {
    
    // socket.io messages Listener at client
    const sEventNsme = mySelfId+"message";
    socket.on(sEventNsme, function(data) {
 
        // Message update real time in viewed conversion
        if (String(recipientId) === String(data.sender)) {
            const oppositeAuthorPic = document.querySelector(".messages-right-sidebar .chatbox-header .img-wrap .pic").src;

            // Time convert to client local (Whole Date and time)
            const msgSendTime = data.msgSendTime;
            const msgDate = new Date(msgSendTime * 1000);
            const date = msgDate.toLocaleString('en-US', { month: 'long', day: "numeric", year: 'numeric'});
            const time = msgDate.toLocaleString('en-US', { hour: "numeric", minute: "numeric"});
            const localDateAndTime = `${date} at ${time}`;


            const cssClass = data.attachmentName ? "attachment-style" : "";
            const theMessage = messageHtmlInnerBody(data.attachmentName, data.message, recipientId);
            // the message html structure
            let eachMessageHTMLBody = `<div class="incoming-message single-msg-box">
                                            <div class="author-img">
                                                <img src="${oppositeAuthorPic}" alt="">
                                            </div>
                                            <div class="msg-n-meta clearfix">
                                                <div class="msg-inner ${cssClass}">
                                                    ${theMessage}
                                                </div>
                                                <span class="msg-time">${localDateAndTime}</span>
                                            </div>
                                        </div>`;

            const chatBox = document.querySelector(".chat-box");

            // if the first message so first remove the "No conversation yet" message
            const noConversation = chatBox.innerHTML.match('no-conv-yet">');
            if (noConversation) {
                chatBox.innerHTML = "";
            }


            // append every single HTML message body
            chatBox.insertAdjacentHTML("afterbegin", eachMessageHTMLBody);


            // Scroll bottom chat box when append message in chat box
            chatBox.scrollTop = chatBox.scrollHeight - chatBox.clientHeight;
        }
        

        // last message and last message send time update in chat list
        const chatUserList = document.querySelector(".chat-list");
        const exist = chatUserList.innerHTML.match(data.sender);
        if (exist) {
            const str = data.sender;
            const getUniqueCssClass = "c"+(str.substr(str.length - 5, str.length));
            const lastMessage = data.message.length > 30 ? `${data.message.slice(0, 30)}...` : data.message;
            //  HTML tag conflation resolve
            const rawMessage = lastMessage;
            let validatedMessage = rawMessage.replace(/</g, "&lt").replace(/>/g, "&gt");
            document.querySelector(`.${getUniqueCssClass} .meta .last-message`).innerHTML = `${data.attachmentName ? "Attachment" : validatedMessage}`;
            document.querySelector(`.${getUniqueCssClass} .meta .last-msg-time`).innerText = "Just now";
        }

    });





    // socket.io Typing Listener at client
    let timeOut3 = null;
    const typingEventName = mySelfId+"typing";
    socket.on(typingEventName, function(data) {
        if (String(recipientId) === String(data.typer)) {

            if (timeOut3 != null) {
                clearTimeout(timeOut3);
            }
            document.querySelector(".messages-right-sidebar .act").innerText = "Typing...";
    
            timeOut3 = setTimeout(function() {
                document.querySelector(".messages-right-sidebar .act").innerText = "Active now";
            }, 2000);
        }
    });






    


   // self connect event sent
   socket.emit("AnUserConnected", {id: mySelfId});

   // user connect listener
   socket.on("anUser", function(data) {

       // chat list user active inactive
       if (String(mySelfId) != String(data.id)) {

           const str = data.id;
           const getUniqueCssClass = "c"+(str.substr(str.length - 5, str.length));

           const chatUserList = document.querySelector(".chat-list");
           const exist = chatUserList.innerHTML.match(data.id);

           if (exist) {
               document.querySelector(`.${getUniqueCssClass} .img-wrap span`).classList.add("hide");
               const element = document.querySelector(`.${getUniqueCssClass} .img-wrap i`);

               element.classList.remove("hide", "red", "yellow");
               element.classList.add("green");



                // viewed conversation user connect event - active
                if (String(recipientId) === String(data.id)) {

                    document.querySelector(".chatbox-header .img-wrap span").classList.add("hide");
                    const element = document.querySelector(".chatbox-header .img-wrap i");

                    element.classList.remove("hide", "red", "yellow");
                    element.classList.add("green");

                    document.querySelector(".messages-right-sidebar .act").innerText = "Active now";
                }
           }
       }
   });

    // user disconnect listener
    let interval1 = null;
    socket.on("AnUserD", function(data) {

        const str = data.id;
        const getUniqueCssClass = "c"+(str.substr(str.length - 5, str.length));

        const chatUserList = document.querySelector(".chat-list");
        const exist = chatUserList.innerHTML.match(data.id);

        if (exist) {

            const element = document.querySelector(`.${getUniqueCssClass} .img-wrap i`);
            element.classList.add("hide");

            const inactiveTimeElement = document.querySelector(`.${getUniqueCssClass} .img-wrap span`);
            inactiveTimeElement.classList.remove("hide");
            inactiveTimeElement.innerText = "fw s"; 




            // viewed conversation user disconnect event - inactive
            if (String(recipientId) === String(data.id)) {
                if (interval1 != null) {
                    clearInterval(interval1);
                }


                const element = document.querySelector(".chatbox-header .img-wrap i");
                element.classList.remove("green");
                element.classList.add("hide");

                const oppositePartnerInactiveTime = document.querySelector(".chatbox-header .img-wrap span");
                oppositePartnerInactiveTime.classList.remove("hide");
                oppositePartnerInactiveTime.innerText = "fw s";
                document.querySelector(".messages-right-sidebar .act").innerText = "a few seconds";

                const whenInactive = Math.floor(new Date().getTime()/1000);
                interval1 = setInterval(() => {
                    const isActive = document.querySelector(".chatbox-header .img-wrap").innerHTML.match("green");

                    if (!isActive) {
                        const currentEpochTime = Math.floor(new Date().getTime()/1000);
                        let seconds = currentEpochTime - whenInactive;

                        const min = Math.floor(seconds / 60);
                        const andSec = Math.floor(seconds % 60);
                        const hour = Math.floor(min / 60);
                        const andMin = Math.floor(min % 60);

                        let inactiveTime = "";
                        if (hour < 1) {
                            inactiveTime = `${andMin}m`;
                            if (andMin < 1) {
                                inactiveTime = `${andSec}s`;
                            }
                        } else  {
                            inactiveTime = `${hour}h`;
                        }

                        oppositePartnerInactiveTime.innerText = inactiveTime;
                        document.querySelector(".messages-right-sidebar .act").innerText = `Active ${inactiveTime} ago`;
                    }
                }, 60000);
            }
        }
    });

}
window.addEventListener("load", socketEvent);







// typing Message Event sent by API request
function typingMessage() {

    const apiUrl = "/api/user/messenger/typing";
    fetch(apiUrl, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({recipientId})
    })
    .then((res) => res.json())
    .then((data) => {
        if (!(data.error === "server error")) {

        } else {
            document.querySelector("body").innerHTML = "There is a Server Error. Please try again later, we are working to fix it...";
            throw new Error('Server Error');
        }
        
    })
    .catch (function(reason) {
        console.log(reason);
     });
}
document.querySelector("#input-msg").onkeyup = typingMessage;




function logOut() {
    const apiUrl = "/api/user/logout";
    fetch(apiUrl, {
        method: "POST"
    })
    .then((res) => res.json())
    .then((data) => {

        if (!(data.error === "server error")) {

            if(data.logout) {
                location.replace("/account");
            } else {
                location.reload();
            }

        } else {
            document.querySelector("body").innerHTML = "There is a Server Error. Please try again later, we are working to fix it...";
            throw new Error('Server Error');
        }
    })
    .catch (function(reason) {
        console.log(reason);
     });
}
document.querySelector("#logout").onclick = logOut;