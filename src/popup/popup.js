document.addEventListener('DOMContentLoaded', function () {
  const codeSelect = document.getElementById('codeSelect');

  codeSelect.addEventListener('change', function () {
    const selectedCode = codeSelect.value;
    console.log('Sending message with selected code:', selectedCode);
    chrome.runtime.sendMessage({ message: 'updateCodeValue', code: selectedCode });
  });
});

document.addEventListener('DOMContentLoaded', function() {
  // Find the button elements by their IDs
  const fillGuestInfoButton = document.getElementById('fillGuestInfoButton');
  const switchDomainButton = document.getElementById('switchDomainButton');

  // Add click event listeners to the buttons
  fillGuestInfoButton.addEventListener('click', function() {
    simulateContextMenuClick('fillGuestInfo');
  });

  switchDomainButton.addEventListener('click', function() {
    simulateContextMenuClick('switchDomain');
  });
});

function simulateContextMenuClick(menuItemId) {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs && tabs.length > 0) {
      const activeTabId = tabs[0];

      // Send a message to the background script to simulate item click
      chrome.runtime.sendMessage({ action: 'menuItemClick', menuItemId: menuItemId, tab: activeTabId  });
    }
  });
}
