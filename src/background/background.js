chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === 'menuItemClick') {
    const tab = message.tab;
    const menuItemId = message.menuItemId;

    if (menuItemId === "fillGuestInfo") {
      executeGuestInfoFillingScript(tab);
    } else if (menuItemId === "switchDomain") {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: switchDomain
      });
    }
  }
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
        alert('The script currently does not support iframes. Please switch to subdomain mode.');
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
      const iframeSelector = "iframe#tripla-booking-widget-window";
      const iframe = document.querySelector(iframeSelector);
      if (iframe) {
        if (iframe.src != ''){
          codeValue = getCodeValue(iframe.src);
        }
      }else {
        codeValue = getCodeValue(currentUrl);
      }
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


// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === 'updateCodeValue') {
    const selectedCode = request.code;

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs.length > 0) {
        const tabId = tabs[0].id;
        updateUrlWithCodeValue(tabId, selectedCode);
      }
    });
  }
});

function updateUrlWithCodeValue(tabId, newCode) {
  chrome.tabs.get(tabId, function (tab) {
    const currentUrl = tab.url;
    const url = new URL(currentUrl);
    const searchParams = new URLSearchParams(url.search);
    searchParams.set('code', newCode);

    if (url.hostname === 'qa.tripla-hotel.com') {
      searchParams.append('tripla_booking_widget_open', 'search');
      updatedUrl = `${url.origin}${url.pathname}?${searchParams.toString()}`;
    }
    else{
      updatedUrl = `${url.origin}${url.pathname}?${searchParams.toString()}`;
    }

    chrome.tabs.update(tabId, { url: updatedUrl });
  });
}
