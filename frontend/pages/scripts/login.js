function sendLogin() {
    const login = document.getElementById('username').value;
    const senha = document.getElementById('password').value;

    if (login === '' || senha === '') {
        toastAlert('warn', 'Preencha todos os campos!');
        return;
    }

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ login, senha })
    })
    .then(res => {
        if (res.ok) {
            window.location.href = '/adm';
        } else {
            toastAlert('error', 'Erro ao fazer login!');
        }
    })
    .catch(err => {
        toastAlert('error', 'Erro ao fazer login!');
        console.error(err);
    });
}

document.querySelector('.btnLogin').addEventListener('click', sendLogin);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        sendLogin();
    }
});