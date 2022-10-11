if (typeof(document.querySelector('.logoutbtn')) != 'undefined' && document.querySelector('.logoutbtn') != null){
    document.querySelector('.logoutbtn').addEventListener('click', e => {
        axios.get('http://127.0.0.1:3000/api/v1/users/logout')
        .then(function (response) {
            window.location.href = 'http://127.0.0.1:3000/login';
        })
        .catch(function (error) {
        console.log(error);
        });
    })
}
if (typeof(document.querySelector('.form-user-data')) != 'undefined' && document.querySelector('.form-user-data') != null){
    document.querySelector('.form-user-data').addEventListener('submit', e => {
        e.preventDefault();

        const form = new FormData();
        form.append('username',e.target.username.value);
        form.append('email',e.target.email.value);
        form.append('photo',e.target.photo.files[0]);

        axios.post('http://127.0.0.1:3000/api/v1/users/updateuser', form)
        .then(function (response) {
            window.location.href = 'http://127.0.0.1:3000/profile';
        })
        .catch(function (error) {
        console.log(error);
        });

    });
}
if (typeof(document.querySelector('.form-user-password')) != 'undefined' && document.querySelector('.form-user-password') != null){
    document.querySelector('.form-user-password').addEventListener('submit', e => {
        e.preventDefault();

        axios.post('http://127.0.0.1:3000/api/v1/users/updatePassword', {
            currentPassword: e.target.currentPassword.value,
            newPassword: e.target.newPassword.value,
            confirmPassword: e.target.confirmPassword.value
        })
        .then(function (response) {
            window.location.href = 'http://127.0.0.1:3000/profile';
        })
        .catch(function (error) {
        console.log(error);
        });

    });
}
if (typeof(document.querySelector('.buy-tour')) != 'undefined' && document.querySelector('.buy-tour') != null){
    document.querySelector('.buy-tour').addEventListener('click', e => {
        id = document.querySelector('.buy-tour').getAttribute('data-tour-id');
        axios.get(`http://127.0.0.1:3000/api/v1/tours/buytour/${id}`)
        .then(function (response) {
            window.location.href = response.data.session.url;
        })
        .catch(function (error) {
        console.log(error);
        });
    });
}