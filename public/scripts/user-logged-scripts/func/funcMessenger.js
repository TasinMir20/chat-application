function messageHtmlInnerBody(attachment, textMessage, participant) {
    // Text message or attachment
    let attachmentTag = "";
    let theMessage = "";
    if (attachment) {
        let attachmentName = attachment;
        let extension = attachmentName.split('.').pop();
        let attachmentPath = "/api/user/messenger/files/";
        if (["jpg", "jpeg", "png", "gif", "tiff", "icon", "webp", "svg"].includes(extension)) {
            attachmentTag = `<img src="${attachmentPath}${attachmentName}?rsp=${participant}" />`;

        } else if (["mp3", "mpeg", "ogg", "wav", "m4a"].includes(extension)) {
            attachmentTag = `<audio controls class="sqs-audio-player>
                                <source src="${attachmentPath}${attachmentName}?rsp=${participant}" >
                            </audio>`;
        } else if (["pdf"].includes(extension)) {
            attachmentTag = `<embed src="${attachmentPath}${attachmentName}?rsp=${participant}" />`;
        } else {
            attachmentTag = `<a target="_blank" class="fas fa-file-archive" title="click to download" href="${attachmentPath}${attachmentName}?rsp=${participant}"></a>`;
        }

        theMessage = attachmentTag;

    } else {
        //  HTML tag conflation resolve
        const rawMessage = textMessage;
        let validatedMessage = rawMessage.replace(/</g, "&lt");
        validatedMessage = validatedMessage.replace(/>/g, "&gt");
        var textMessage = `<p class="message">${validatedMessage}</p>`;

        theMessage = textMessage;
    }

    return theMessage;
}
