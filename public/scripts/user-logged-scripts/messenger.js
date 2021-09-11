const body = document.querySelector("body");

function selfOnline() {
    document.querySelector(".sections .container .messenger-container .chat-list-left-sidebar .self-profile .wrap .img-wrap").style = "border-color: #2ecc71";
}
body.ononline = selfOnline;


function selfOffline() {
    document.querySelector(".sections .container .messenger-container .chat-list-left-sidebar .self-profile .wrap .img-wrap").style = "border-color: #c4c4c4";
}
body.onoffline = selfOffline;




// when screen less than 768px and click ".left-arrow i" -> right side chat conversions hide and show left side user chat list
function chatListOfUserShowAndChatHide() {
    document.querySelector(".chat-list-left-sidebar").classList.add("show");
    document.querySelector(".messages-right-sidebar").classList.add("hide");
}
document.querySelector(".left-arrow i").onclick = chatListOfUserShowAndChatHide;







/************************************************* API Function start form here to END ************************************/

function chatList() {

    const apiUrl = "/api/user/messenger/chat-list";

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
        const t = document.querySelector(".chat-list");

        if (data.chatListUsers) {
            t.innerHTML = data.chatListUsers;
        } else {
            t.innerHTML = "<p>No previous chat</p>";
        }

        
        
    })
    .catch (function(reason) {
        console.log(reason);
    })
}
window.addEventListener("load", chatList);




let timeOut = null;
function searchUsersToChat() {
    const searchKeyWord = document.querySelector("#search").value;

    if (timeOut != null) {
        clearTimeout(timeOut);
    }

    timeOut = setTimeout(() => {
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

            document.querySelector(".search-results").innerHTML = data.searchUser;

        })

    }, 500)

}
document.querySelector("#search").onkeyup = searchUsersToChat;




function fetchUserChats(id, isItSearch) {
    

    if (window.innerWidth < 770) {
        // START -- when screen less than 768px -> left side user chat list users hide and show chat conversions
        document.querySelector(".chat-list-left-sidebar").classList.remove("show");
        document.querySelector(".messages-right-sidebar").classList.remove("hide");
        // END -- when screen less than 768px -> left side user chat list users hide and show chat conversions
    }



    document.querySelector(".search-results").innerHTML = "";
    document.querySelector("#msg-sent-btn").value = id;

    if (id) {
        const mySelfId = document.querySelector("#user-selft-id").value;

        const apiUrl = "/api/user/messenger/fetch-chats";
        fetch(apiUrl, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({participant: id, isItSearch})
        })
        .then((res) => res.json())
        .then((data) => {

            // chat header name update front when switched to other chat
            document.querySelector(".chatbox-header .meta .name").innerText = data.fullName;


            // chat list message update to front when switched to other chat
            if (data.conversations) {
                
                let conversations = data.conversations;
                let messages = "";
                for (let i = 0; i < conversations.length; i++) {
                    // Time convert to client local (Whole Date and time)
                    const msgSendTime = conversations[i].msgSendTime;
                    const msgDate = new Date(msgSendTime * 1000);
                    const date = msgDate.toLocaleString('default', { month: 'long', day: "numeric", year: 'numeric'});
                    const time = msgDate.toLocaleString('default', { hour: "numeric", minute: "numeric"});
                    const localDateAndTime = `${date} at ${time}`;



                    // defining this message incoming or outgoing
                    let incomingOrOutgoing = "";
                    if (String(conversations[i].sender) === String(mySelfId)) {
                        incomingOrOutgoing = "outgoing-message";
                        
                    } else {
                        incomingOrOutgoing = "incoming-message";
                    }
                    
                    //  HTML tag conflation resolve
                    const rawMessage = conversations[i].message;
                    let validatedMessage = rawMessage.replace(/</g, "&lt");
                    validatedMessage = validatedMessage.replace(/>/g, "&gt");

                    // the message
                    messages += `<div class="${incomingOrOutgoing} single-msg-box">
                                    <div class="author-img">
                                        <img src="/images/users/profile-photo/man3.jpg" alt="">
                                    </div>
                                    <div class="msg-n-meta clearfix">
                                        <div class="msg-inner">
                                            <p class="message">${validatedMessage}</p>
                                            <span class="msg-time">${localDateAndTime}</span>
                                        </div>
                                    </div>
                                </div>`;
                }

                document.querySelector(".chat-box").innerHTML = messages;
            } else {
                document.querySelector(".chat-box").innerHTML = "<h1 style='color:black;'>No conversation yet</h1>";

                if (isItSearch) {
                    const chatList = document.querySelector(".chat-list");
                    // the searched user already inserted or not in chat list
                    const a = chatList.innerHTML.match(id);
                    if (!a) {
                        chatList.insertAdjacentHTML("afterbegin", data.newChatToAppendChatList);
                    }
                }
            }
        })

    } else {
        document.querySelector(".chat-box").innerHTML = "<h1 style='color:black;'>No conversation yet</h1>";
    }

}

// fetchUserChats(lastChatUserId); // this function also called onload event in HTML to view the last conversation when load web page
// and also called every single chat List user



const msgSentBtn = document.querySelector("#msg-sent-btn");
function sendMessage(event) {
    event.preventDefault();

    // Local Time (Whole Date and time)
    const msgDate = new Date();
    const date = msgDate.toLocaleString('default', { month: 'long', day: "numeric", year: 'numeric'});
    const time = msgDate.toLocaleString('default', { hour: "numeric", minute: "numeric"});
    const localDateAndTime = `${date} at ${time}`;


    const message = document.querySelector("#input-msg").value;
    const rawMessage = message;
    let validatedMessage = rawMessage.replace(/</g, "&lt");
    validatedMessage = validatedMessage.replace(/>/g, "&gt");
    let theMessages = `<div class="outgoing-message single-msg-box">
                        <div class="author-img">
                            <img src="/images/users/profile-photo/man3.jpg" alt="">
                        </div>
                        <div class="msg-n-meta clearfix">
                            <div class="msg-inner">
                                <p class="message">${validatedMessage}</p>
                                <span class="msg-time">${localDateAndTime}</span>
                            </div>
                        </div>
                    </div>`;


    const chatBox = document.querySelector(".chat-box");
    chatBox.insertAdjacentHTML("afterbegin", theMessages);

    const recipient = this.value;

    const apiUrl = "/api/user/messenger/send-message";
    fetch(apiUrl, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({message, recipient})
    })
    .then((res) => res.json())
    .then((data) => {
        document.querySelector("#input-msg").value = "";
    })

}

msgSentBtn.addEventListener("click", sendMessage);







function socketEvent() {
    
    let socket = io();

    // socket.io server to client
    const mySelfId = document.querySelector("#user-selft-id").value;
    const sEventNsme = mySelfId;

    socket.on(sEventNsme, function(data) {

        console.log("Socket event Refresh")

        const recipientId = document.querySelector("#msg-sent-btn").value;

        if (recipientId == data.sender) {
            // Time convert to client local (Whole Date and time)
            const msgSendTime = data.msgSendTime;
            const msgDate = new Date(msgSendTime * 1000);
            const date = msgDate.toLocaleString('default', { month: 'long', day: "numeric", year: 'numeric'});
            const time = msgDate.toLocaleString('default', { hour: "numeric", minute: "numeric"});
            const localDateAndTime = `${date} at ${time}`;


            //  HTML tag conflation resolve
            const rawMessage = data.message;
            let validatedMessage = rawMessage.replace(/</g, "&lt");
            validatedMessage = validatedMessage.replace(/>/g, "&gt");

            let theMessages = `<div class="incoming-message single-msg-box">
                                <div class="author-img">
                                    <img src="/images/users/profile-photo/man3.jpg" alt="">
                                </div>
                                <div class="msg-n-meta clearfix">
                                    <div class="msg-inner">
                                        <p class="message">${validatedMessage}</p>
                                        <span class="msg-time">${localDateAndTime}</span>
                                    </div>
                                </div>
                            </div>`;


            const chatBox = document.querySelector(".chat-box");
            chatBox.insertAdjacentHTML("afterbegin", theMessages);
        }
    });
}

window.addEventListener("load", socketEvent);