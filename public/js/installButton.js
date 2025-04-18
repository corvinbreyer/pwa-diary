let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showManualInstallButton();
});

function showManualInstallButton() {
    const button = document.createElement('button');
    button.innerHTML = '<i class="bi bi-arrow-down-circle-fill"></i> Jetzt Installieren!';
    button.classList.add('installButton', 'info');

    button.onclick = () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((result) => {
            if (result.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            button.remove();
        });
    };

    document.body.appendChild(button);
}