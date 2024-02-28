class LoginController{
    constructor() {
        const apiUrl = 'http://localhost:3333/users';
        this.usersRoutes = new UsersRoutes(apiUrl);
        this.bindSignUpForm();
        this.bindLogInForm();
        this.bindFormSwitch();
        this.bindLogoutButton();
        this.isUserLoggedIn();
    }

    hideLogoutButton() {
        const logoutButton = document.getElementById('logoutButton');
        logoutButton.style.display = 'none';
        console.log("logout button hidden")
    }

    showLogoutButton() {
        const logoutButton = document.getElementById('logoutButton');
        logoutButton.style.display = 'block';
        console.log("logout button displayed")
    }

    bindSignUpForm() {
        const signupForm = document.getElementById('signupForm');
        signupForm.addEventListener('submit', this.handleSignUp.bind(this));
    }

    bindLogInForm() {
        const loginForm = document.getElementById('loginForm');
        loginForm.addEventListener('submit', this.handleLogIn.bind(this));
    }

    bindFormSwitch(){
        const alreadyAccount = document.getElementById('alreadyAccount');
        const dontHaveAccount = document.getElementById('dontHaveAccount');
        alreadyAccount.addEventListener('click', this.toggleForms.bind(this));
        dontHaveAccount.addEventListener('click', this.toggleForms.bind(this));
    }

    bindLogoutButton() {
        const logoutButton = document.getElementById('logoutButton');
        logoutButton.addEventListener('click', this.handleLogout.bind(this));
    }

    async handleSignUp(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const nickname = formData.get('nickname');
        const email = formData.get('email');
        const password = formData.get('password');

        if(!nickname){
            alert('Failed to sign up user. Please enter a nickname.');
            return
        }
        if(!email){
            alert('Failed to sign up user. Please enter an email.');
            return
        }
        if(!password){
            alert('Failed to sign up user. Please enter a password.');
            return
        }
        if(!this.checkPassword(password))
            return

        console.log("Form submitted:", nickname, email, password);

        try {
            await this.usersRoutes.signUp(nickname, email, password);
            alert('User signed up successfully!');
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Failed to sign up user:', error.message);
            alert('Failed to sign up user. Please try again.');
        }
    }
    async handleLogIn(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const email = formData.get('email');
        const password = formData.get('password');

        if(!email){
            alert('Failed to log in. Please enter an email.');
            return
        }

        console.log("Form submitted:", email, password);

        this.usersRoutes.logIn(email, password)
            .then(res => {
                console.log("Putting the token in place")
                sessionStorage.setItem("token", res.token)
                alert('User logged in successfully!');
                console.log("Token : " + res.token)
                console.log("Token : " + sessionStorage.getItem("token"))
                this.isUserLoggedIn()
            })
            .catch(err => {
                console.log(err)
                if (err === 401) {
                    alert("Adresse e-mail ou mot de passe incorrect")
                } else {
                    console.error('Failed to log user in:', err.message);
                    alert('Failed to log user in. Please try again.');
                }
            })
    }

    async handleLogout() {
        console.log("handleLogOut")

        try {
            sessionStorage.removeItem("token")
            alert('User logged out successfully!');
            console.log("handleLogout -> hide logOut")
            this.hideLogoutButton()
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
                    window.location.href = 'index.html';
                    return true
                })
                .catch(() => {
                    console.log('Token expired or invalid. User is not logged in.');
                    localStorage.removeItem('token');
                    this.hideLogoutButton();
                    return false
                });
        } else {
            console.log("token is empty")
            this.hideLogoutButton();
            return false
        }
    }

    checkPassword(password){
        if (password.length < 8) {
            alert('Password should be at least 8 characters long.');
            return false;
        }
        if (!/\d/.test(password)) {
            alert('Password should contain at least one number.');
            return false;
        }
        if (!/[A-Z]/.test(password)) {
            alert('Password should contain at least one uppercase letter.');
            return false;
        }
        if (!/[^a-zA-Z0-9]/.test(password)) {
            alert('Password should contain at least one special character.');
            return false;
        }
        return true
    }

    async toggleForms(){
        try {
            console.log("Toggling forms")
            document.getElementById('loginForm').classList.toggle('hidden');
            document.getElementById('signupForm').classList.toggle('hidden');
            document.getElementById('alreadyAccount').classList.toggle('hidden');
            document.getElementById('dontHaveAccount').classList.toggle('hidden');
        }
        catch (error) {
            console.log('Failed to switch forms', error.message);
            alert('Failed to switch forms');
        }
    }
}

window.loginController = new LoginController()