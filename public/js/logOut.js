const logout = document.querySelector('.logout')
    logout.addEventListener('click', e => {
        fetch("/logout")
            .then(window.location.href = '/')
            .catch(err => console.log(err))
    })