const body = document.querySelector("body");

function selfOnline() {
    document.querySelector(".sections .container .messenger-container .chat-list-left-sidebar .self-profile .wrap .img-wrap").style = "border-color: #2ecc71";
}
body.ononline = selfOnline;


function selfOffline() {
    document.querySelector(".sections .container .messenger-container .chat-list-left-sidebar .self-profile .wrap .img-wrap").style = "border-color: #c4c4c4";
}
body.onoffline = selfOffline;






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

        if (data.chatListSingleUser) {
            t.innerHTML = data.chatListSingleUser;
        } else {
            t.innerHTML = "<p>No previous chat</p>";
        }

        
        
    })
    .catch (function(reason) {
        console.log(reason);
    })
}
document.querySelector("body").onload = chatList;





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

    document.querySelector(".search-results").innerHTML = "";
    document.querySelector("#msg-sent-btn").value = id;

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

        // chat list message update front when switched to other chat
        if (data.msg) {

            










            document.querySelector(".chat-box").innerHTML = data.msg;
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

}

// It has been called here to view the last conversation when load web page
fetchUserChats("61377e147a5baf047ce6c51c"); // this function also called in HTML every single chat List user



const msgSentBtn = document.querySelector("#msg-sent-btn");
function sendMessage(event) {
    event.preventDefault();

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
                                <span class="msg-time">November 20, 2020 at 10: 20 PM</span>
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







function socketEventNameUpdate() {
    
    let socket = io();

    // socket.io server to client
    const mySelf = document.querySelector("#user-selft-id").value;
    const recipient= document.querySelector("#msg-sent-btn").value;
    const sEventNsme = mySelf+recipient;

    socket.on(sEventNsme, function(data) {

        const recipient = document.querySelector("#msg-sent-btn").value;
        
        console.log("Refresh")

        const chatBox = document.querySelector(".chat-box");
        chatBox.insertAdjacentHTML("afterbegin", data.theMessages);

        // temporarily call it to show realtime chat
        // fetchUserChats(recipient);
        
    });
}
// It has been called here to update the last conversation socketEventName when load web page
socketEventNameUpdate(); // this function also called in HTML every single chat List user