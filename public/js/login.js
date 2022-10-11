document.querySelector('.login_form').addEventListener('submit', e => {
    e.preventDefault();

    axios.post('http://127.0.0.1:3000/api/v1/users/login', {
        username: e.target.username.value,
        password: e.target.password.value
    })
    .then(function (response) {
        window.location.href = 'http://127.0.0.1:3000/';
    })
    .catch(function (error) {
    console.log(error);
    });

});

