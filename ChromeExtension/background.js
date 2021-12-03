function sendToServer(data) {
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://localhost:1524/dwn",
        "method": "POST",
        "headers": {
            "content-type": "application/json"
        },
        "processData": false,
        "data": JSON.stringify(data)
    }

    $.ajax(settings)
}

chrome.browserAction.onClicked.addListener((tab) => {
    var c = confirm("Download Music/Playlist on this page?");
    if (c === true) {
        chrome.tabs.sendMessage(tab.id, {
            message: 'download'
        });
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    sendToServer(request);
});