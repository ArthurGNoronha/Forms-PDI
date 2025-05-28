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
            return res.json();
        } else if (res.status === 401) {
            toastAlert('warn', 'Senha ou login incorretos!');
            document.getElementById('password').value = '';
            return;
        } else {
            toastAlert('error', 'Erro ao fazer login!');
        }
    })
    .then(data => {
        if (data && data.token) {
            localStorage.setItem('token', data.token);
            window.location.href = '/adm';
        }
    })
}

document.querySelector('.btnLogin').addEventListener('click', sendLogin);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        sendLogin();
    }
});