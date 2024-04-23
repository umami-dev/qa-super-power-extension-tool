chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.message === "iframe-detected") {
        alert('The script currently does not support iframes. Please switch to subdomain mode.');
    }
});
