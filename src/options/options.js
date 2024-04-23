document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.local.get('customEmail', function(data) {
    document.getElementById('customEmail').value = data.customEmail || '';
  });
});

document.getElementById('save').addEventListener('click', function() {
  const email = document.getElementById('customEmail').value;
  chrome.storage.local.set({ 'customEmail': email }, function() {
    console.log('Settings saved');
  });
});

document.addEventListener('DOMContentLoaded', function() {
    const saveButton = document.getElementById('save');
    saveButton.addEventListener('click', function() {
        alert('Customized email saved!');
    });
});

