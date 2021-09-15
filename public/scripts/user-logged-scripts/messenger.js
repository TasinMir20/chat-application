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
        const chatList = document.querySelector(".chat-list");

        const {chatListUsers} = data;

        if (chatListUsers[0]) {
            // both left-sidebar and right-sidebar show when at least one previous users exist in chat list
            document.querySelector(".sections .container .messenger-container .chat-list-left-sidebar").classList.remove("w0");
            document.querySelector(".sections .container .messenger-container .messages-right-sidebar").classList.remove("w0");

            let chatListHTML = "";
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
                let validatedMessage = rawMessage.replace(/</g, "&lt");
                validatedMessage = validatedMessage.replace(/>/g, "&gt");


                chatListHTML += `
                        <div class="single-user ${setUniqueCssClass}" onclick="fetchUserChats('${chatListUsers[i]._id}');">
                            <div class="img-wrap">
                                <img src="/images/users/profile-photo/man2.jpg" alt="">
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

            chatList.innerHTML = chatListHTML;
        } else {
            // only left-sidebar show when no previous users in chat list
            document.querySelector(".sections .container .messenger-container").classList.add("no-previous-people");

            chatList.innerHTML = "<p class='no-u-chat-list'>You have no connected people to chat with!</p>";
        }
        
    })
    .catch (function(reason) {
        console.log(reason);
    });
}
window.addEventListener("load", chatList);

// chatList() function in Interval to refresh user online offline time
setInterval(() => {
    chatList();
}, 60000);




let timeOut = null;
function searchUsersToChat() {
    const searchKeyWord = document.querySelector("#search").value;

    if (searchKeyWord) {

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

                if (data.foundUser) {
                    document.querySelector(".search-results").innerHTML = data.foundUser;
                } else {
                    document.querySelector(".search-results").innerHTML = "";
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

            // when no previous user in the chat list then search someone and click on it- show chat box
            document.querySelector(".sections .container .messenger-container").classList.remove("no-previous-people");
            document.querySelector(".sections .container .messenger-container .chat-list-left-sidebar").classList.remove("w0");
            document.querySelector(".sections .container .messenger-container .messages-right-sidebar").classList.remove("w0");

            // chat header name update when switched to other chat
            document.querySelector(".chatbox-header .meta .name").innerText = data.fullName;

            
            // chat header user or current chatting partner active-inactive update when switched to other chat
            const element = document.querySelector(".chatbox-header .img-wrap i");
            if (data.lastOnlineTime === 1) {
                element.classList.remove("hide", "red", "yellow");
                element.classList.add("green");
                document.querySelector(".messages-right-sidebar .act").innerText = "Active now";
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

                let conversations = data.conversations;
                let messages = "";
                for (let i = 0; i < conversations.length; i++) {
                    // Time convert to client local (Whole Date and time)
                    const msgSendTime = conversations[i].msgSendTime;
                    const msgDate = new Date(msgSendTime * 1000);
                    const date = msgDate.toLocaleString('en-US', { month: 'long', day: "numeric", year: 'numeric'});
                    const time = msgDate.toLocaleString('en-US', { hour: "numeric", minute: "numeric"});
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
                document.querySelector(".chat-box").innerHTML = "<h1 class='no-conv-yet'>No conversation yet!</h1>";

                if (isItSearch) {
                    const chatList = document.querySelector(".chat-list");

                    // If No previous user in chat list so first remove the "You have no connected people to chat with" message
                    const noUcL = chatList.innerHTML.match('no-u-chat-list">');
                    if (noUcL) {
                        chatList.innerHTML = "";
                    }


                    // the searched user already inserted or not in chat list
                    const alreadyExist = chatList.innerHTML.match(id);
                    if (!alreadyExist) {
                        chatList.insertAdjacentHTML("afterbegin", data.newChatToAppendChatList);
                    }

                    
                }
            }

            // in chat list current conversation user background color change as selected
            const str = id;
            const getUniqueCssClass = "c"+(str.substr(str.length - 5, str.length));
            const toRemoveClass = document.querySelectorAll(".chat-list .single-user");

            for (let i = 0; i < toRemoveClass.length; i++) {
                toRemoveClass[i].classList.remove("selected");
            }
            if (incre > 0) {
                document.querySelector(`.${getUniqueCssClass}`).classList.add("selected");
            }
            incre++;
            
        })
        .catch (function(reason) {
            console.log(reason);
        });

    } else {
        document.querySelector(".chat-box").innerHTML = "<h1 class='no-conv-yet'>No conversation yet!</h1>";
    }

}

// fetchUserChats(lastChatUserId); // this function also called onload event in HTML to view the last conversation when load web page
// and also called every single chat List user



function sendMessage(event) {
    event.preventDefault();

    const message = document.querySelector("#input-msg").value.trim();
    if (message) {
        const recipientId = this.value;
        // Local Time (Whole Date and time)
        const msgDate = new Date();
        const date = msgDate.toLocaleString('en-US', { month: 'long', day: "numeric", year: 'numeric'});
        const time = msgDate.toLocaleString('en-US', { hour: "numeric", minute: "numeric"});
        const localDateAndTime = `${date} at ${time}`;


        
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

        // if the first message so first remove the "No conversation yet" message
        const noConversation = chatBox.innerHTML.match('no-conv-yet">');
        if (noConversation) {
            chatBox.innerHTML = "";
        }

        // append every single message
        chatBox.insertAdjacentHTML("afterbegin", theMessages);




        // self last message and last message send time update in chat list
        const str = recipientId;
        const getUniqueCssClass = "c"+(str.substr(str.length - 5, str.length));
        const lastMessage = message.length > 30 ? `${message.slice(0, 30)}...` : message;
        //  HTML tag conflation resolve
        let validatedMessage1 = lastMessage.replace(/</g, "&lt");
        validatedMessage1 = validatedMessage1.replace(/>/g, "&gt");
        document.querySelector(`.${getUniqueCssClass} .meta .last-message`).innerHTML = `You: ${validatedMessage1}`;
        document.querySelector(`.${getUniqueCssClass} .meta .last-msg-time`).innerText = "Just now";
        ////////////



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
            document.querySelector("#input-msg").value = "";
        })
        .catch (function(reason) {
            console.log(reason);
        });
    }

}
const msgSentBtn = document.querySelector("#msg-sent-btn");
msgSentBtn.addEventListener("click", sendMessage);






const socket = io();
function socketEvent() {
    const mySelfId = document.querySelector("#user-selft-id").value;
    
    // socket.io messages Listener at client
    const sEventNsme = mySelfId+"message";
    socket.on(sEventNsme, function(data) {
        const recipientId = document.querySelector("#msg-sent-btn").value;
 
        // Message update real time in viewed conversion
        if (String(recipientId) === String(data.sender)) {
            // Time convert to client local (Whole Date and time)
            const msgSendTime = data.msgSendTime;
            const msgDate = new Date(msgSendTime * 1000);
            const date = msgDate.toLocaleString('en-US', { month: 'long', day: "numeric", year: 'numeric'});
            const time = msgDate.toLocaleString('en-US', { hour: "numeric", minute: "numeric"});
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
        

        // last message and last message send time update in chat list
        const chatList = document.querySelector(".chat-list");
        const exist = chatList.innerHTML.match(data.sender);
        if (exist) {
            const str = data.sender;
            const getUniqueCssClass = "c"+(str.substr(str.length - 5, str.length));
            const lastMessage = data.message.length > 30 ? `${data.message.slice(0, 30)}...` : data.message;
            //  HTML tag conflation resolve
            const rawMessage = lastMessage;
            let validatedMessage = rawMessage.replace(/</g, "&lt");
            validatedMessage = validatedMessage.replace(/>/g, "&gt");
            document.querySelector(`.${getUniqueCssClass} .meta .last-message`).innerHTML = validatedMessage;
            document.querySelector(`.${getUniqueCssClass} .meta .last-msg-time`).innerText = "Just now";
        }

    });





    // socket.io Typing Listener at client
    const typingEventName = mySelfId+"typing";
    socket.on(typingEventName, function(data) {
        const recipientId = document.querySelector("#msg-sent-btn").value;
        if (String(recipientId) === String(data.typer)) {

            if (timeOut != null) {
                clearTimeout(timeOut);
            }
            document.querySelector(".messages-right-sidebar .act").innerText = "Typing...";
    
            timeOut = setTimeout(function() {
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

           const chatList = document.querySelector(".chat-list");
           const exist = chatList.innerHTML.match(data.id);

           if (exist) {
               document.querySelector(`.${getUniqueCssClass} .img-wrap span`).classList.add("hide");
               const element = document.querySelector(`.${getUniqueCssClass} .img-wrap i`);

               element.classList.remove("hide", "red", "yellow");
               element.classList.add("green");



                // viewed conversation user connect event - active
                const recipientId = document.querySelector("#msg-sent-btn").value;
                if (String(recipientId) === String(data.id)) {

                    document.querySelector(".chatbox-header .img-wrap span").classList.add("hide");
                    const element = document.querySelector(".chatbox-header .img-wrap i");

                    element.classList.remove("hide", "red", "yellow");
                    element.classList.add("green");

                    document.querySelector(".messages-right-sidebar .act").innerText = "Active now";
                }
           }
       }
   })

    // user disconnect listener
    let interval = null;
    socket.on("AnUserD", function(data) {

        const str = data.id;
        const getUniqueCssClass = "c"+(str.substr(str.length - 5, str.length));

        const chatList = document.querySelector(".chat-list");
        const exist = chatList.innerHTML.match(data.id);

        if (exist) {

            const element = document.querySelector(`.${getUniqueCssClass} .img-wrap i`);
            element.classList.add("hide");

            const inactiveTimeElement = document.querySelector(`.${getUniqueCssClass} .img-wrap span`);
            inactiveTimeElement.classList.remove("hide");
            inactiveTimeElement.innerText = "fw s"; 




            // viewed conversation user disconnect event - inactive
            const recipientId = document.querySelector("#msg-sent-btn").value;
            if (String(recipientId) === String(data.id)) {
                if (interval != null) {
                    clearInterval(interval);
                }


                const element = document.querySelector(".chatbox-header .img-wrap i");
                element.classList.remove("green");
                element.classList.add("hide");

                const oppositePartnerInactiveTime = document.querySelector(".chatbox-header .img-wrap span");
                oppositePartnerInactiveTime.classList.remove("hide");
                oppositePartnerInactiveTime.innerText = "fw s";
                document.querySelector(".messages-right-sidebar .act").innerText = "a few seconds";

                const whenInactive = Math.floor(new Date().getTime()/1000);
                interval = setInterval(() => {
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
    })

}
window.addEventListener("load", socketEvent);







// typing Message Event sent by API request
function typingMessage() {
    const recipientId = document.querySelector("#msg-sent-btn").value;

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
        
    })
    .catch (function(reason) {
        console.log(reason);
     });
}
document.querySelector("#input-msg").onkeyup = typingMessage;



