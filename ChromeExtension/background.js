function sendToServer(data) {
    try {
        fetch("http://localhost:1524/dwn", {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "content-type": "application/json"
            }
        });
    } catch (e) { };
    return true;
}

chrome.action.onClicked.addListener((tab) => {
    var c = confirm("Download Music/Playlist on this page?");
    if (c === true) {
        chrome.tabs.sendMessage(tab.id, {
            message: 'download'
        });
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'download') {
        chrome.tabs.sendMessage(sender.tab.id, {
            message: 'download'
        });
        return;
    }
    sendToServer(request);
});