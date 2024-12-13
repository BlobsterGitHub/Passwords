// Frontend logic for interacting with the backend
document.getElementById('checkPassword').addEventListener('click', async () => {
    const password = document.getElementById('password').value;

    if (!password) {
        alert("Please enter a password.");
        return;
    }

    // Send the password to the backend for checking
    const response = await fetch('/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
    });

    const data = await response.json();

    if (data.error) {
        alert(data.error);
        return;
    }

    // Update the results section
    document.getElementById('userCount').textContent = data.userCount || 0;
    document.getElementById('usageCount').textContent = data.usageCount || 0;

    // Update the common passwords list
    const list = document.getElementById('commonPasswords');
    list.innerHTML = '';
    data.commonPasswords.forEach(pw => {
        const li = document.createElement('li');
        li.textContent = pw;
        list.appendChild(li);
    });
});
