chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        id: "fillGuestInfo",
        title: "Tripla QA - Guest Info Filler",
        contexts: ["all"]
    });

    chrome.contextMenus.create({
        id: "switchDomain",
        title: "Tripla QA - Switch Domain",
        contexts: ["all"]
    });
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === "fillGuestInfo") {
        // Assuming you want to perform the same action as the chrome.action.onClicked:
        executeGuestInfoFillingScript(tab);
    } else if (info.menuItemId === "switchDomain") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: switchDomain
        });
    }
});

chrome.action.onClicked.addListener(function (tab) {
    executeGuestInfoFillingScript(tab);
});

function executeGuestInfoFillingScript(tab) {
    chrome.storage.local.get('customEmail', function (data) {
        const userEmail = data.customEmail || 'EveryQAisAngel@nodoubt.com';
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: injectedFunction,
            args: [userEmail]
        });
    });
}

function injectedFunction(userEmail) {
    const iframeSelector = "iframe#tripla-booking-widget-window";
    const iframe = document.querySelector(iframeSelector);
    if (iframe) {
        // Send a message to the background script (content) to handle the iframe case.
        chrome.runtime.sendMessage({ message: "handle-iframe" });
    } else {
        fillForm(document);
        console.log('Form filled successfully.');
    }

    function fillForm(doc) {
        const elements = [
            { id: 'email', value: userEmail },
            { id: 'email-confirm', value: userEmail },
            { id: 'phone', value: '0805201314' },
            // 'postal-code' and 'street-address' are optional to fill
            { id: 'postal-code', value: '89757', optional: true},
            { id: 'street-address', value: 'The way to Heaven', optional: true}
        ];

        // Fill and click each element
        elements.forEach(({ id, value, optional }) => {
            const input = doc.getElementById(id);
            if (input) {
            input.value = value;
            input.dispatchEvent(new Event('change', { bubbles: true }));
            input.click();
            } else if (!optional) {
                console.error(`Element with id "${id}" not found.`);
            }
        });

        doc.querySelectorAll('[id*=prefecture]').forEach((dropdown) => {
            dropdown.selectedIndex = 1;
            dropdown.dispatchEvent(new Event('change', { bubbles: true }));
        });

        // Process each name element and assign the corresponding value
        const nameElements = doc.querySelectorAll('[id*=name-]');
        nameElements.forEach((element) => {
            let id = element.id.toLowerCase();
            let match = id.match(/(\d+)$/);
            if (match) {
                let nameOrder = match[1];
                let nameType = id.includes('first-name') ? 'FirstName' : 'LastName';
                let nameValue = nameType + (nameOrder === "0" ? "" : numberToWord(nameOrder));

                element.focus();
                element.value = nameValue;
                element.dispatchEvent(new Event('input', { bubbles: true }));
                element.dispatchEvent(new Event('change', { bubbles: true }));
                element.blur();
            }
        });

        function numberToWord(number) {
            const words = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
            return words[parseInt(number, 10)] || number;
        }
    }
}

function switchDomain() {
    function getCodeValue(url) {
        return new URL(url).searchParams.get("code") || (url.match(/code=([^&]+)/) ? url.match(/code=([^&]+)/)[1] : null);
    }

    const currentUrl = window.location.href;
    let codeValue;
    let newUrl = "";

    if (currentUrl.includes('qa.tripla-hotel.com')) {
        const iframe = document.querySelector('iframe');
        if (!iframe) {
            console.error('No iframe found.');
            return;
        }
        codeValue = getCodeValue(iframe.src);
    } else if (currentUrl.includes('bw.qa.tripla.ai')) {
        codeValue = getCodeValue(currentUrl);
    }

    if (!codeValue) {
        console.error('Code value not found.');
        return;
    }

    // Build the new URL based on the current domain
    if (currentUrl.includes('bw.qa.tripla.ai')) {
        newUrl = `https://qa.tripla-hotel.com/?code=${codeValue}&tripla_booking_widget_open=search`;
    } else if (currentUrl.includes('qa.tripla-hotel.com')) {
        newUrl = `https://bw.qa.tripla.ai/booking/result?code=${codeValue}`;
    }

    // Redirect to the new URL if it's been set
    if (newUrl) {
        window.location.href = newUrl;
    } else {
        console.error('Failed to switch domain.');
    }
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message === "handle-iframe") {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs.length === 0) {
                console.error("No active tab found.");
                return;
            }
            chrome.tabs.sendMessage(tabs[0].id, { message: "iframe-detected" });
        });
    }
});
