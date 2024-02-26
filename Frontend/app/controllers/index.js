class IndexController {
    constructor() {
        const apiUrl = 'http://localhost:3333/users';
        this.usersRoutes = new UsersRoutes(apiUrl);
        this.bindLogoutButton();
        this.isUserLoggedIn();
    }

    bindLogoutButton() {
        const logoutButton = document.getElementById('logoutButton');
        logoutButton.addEventListener('click', this.handleLogout.bind(this));
    }

    async handleLogout() {
        console.log("handleLogOut")

        try {
            sessionStorage.removeItem("token")
            alert('User logged out successfully!');
            console.log("redirection to login page")
            window.location.href = 'views/login.html';
        } catch (error) {
            console.log('Failed to log out user', error.message);
            alert('Failed to log out user. Please try again.');
        }
    }

    isUserLoggedIn() {
        const token = sessionStorage.getItem('token');
        console.log("isUserLoggedIn ? Token: " + token)
        if (token) {
            this.usersRoutes.verifyToken(token)
                .then(() => {
                    console.log("token is valid")
                    return true
                })
                .catch(() => {
                    console.log('Token expired or invalid. User is not logged in.');
                    localStorage.removeItem('token');
                    window.location.href = 'views/login.html';
                    return false
                });
        } else {
            console.log("token is empty")
            window.location.href = 'views/login.html';
            return false
        }
    }
}


window.indexController = new IndexController()