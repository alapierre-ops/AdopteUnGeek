class LoginController{
    constructor() {
        const apiUrl = 'http://localhost:3333';
        this.usersRoutes = new UsersRoutes(apiUrl);
        this.bindSignUpForm();
        this.bindLogInForm();
        this.bindFormSwitch();
        this.isUserLoggedIn();
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

    async handleSignUp(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const nickname = formData.get('nickname');
        const email = formData.get('email');
        const password = formData.get('password');

        if(!nickname){
            alert('Veuillez entrer votre pseudonyme');
            return
        }
        if(!email){
            alert('Veuillez entrer votre email.');
            return
        }
        if(!password){
            alert('Veuillez entrer votre mot de passe.');
            return
        }
        if(!this.checkPassword(password))
            return

        console.log("Form submitted:", nickname, email, password);

        this.usersRoutes.signUp(nickname, email, password)
            .then(res => {
                console.log("handleSignUp(): No error detected")
                console.log("Putting the token in place")
                sessionStorage.setItem("token", res.token)
                window.location.href = 'profile.html';
                this.isUserLoggedIn()
            })
            .catch(err => {
                console.log("handleSignUp(): Error detected")
                if (err === 500) {
                    alert("Erreur lors de la connection au serveur. Veuillez réessayer plus tard.")
                }
                else if (err === 409) {
                    alert("Un compte existe déjà avec cette adresse mail. Veuillez vous connecter.")
                }
                else {
                    console.error('Failed to log user in:', err.message);
                    alert('Erreur lors de la connexion, veuillez réessayer');
                }
            })
    }
    async handleLogIn(event){
        event.preventDefault();
        const formData = new FormData(event.target);
        const email = formData.get('email');
        const password = formData.get('password');


        console.log("Form submitted:", email, password);

        this.usersRoutes.logIn(email, password)
            .then(res => {
                console.log("Putting the token in place")
                sessionStorage.setItem("token", res.token)
                window.location.href = 'index.html';
                console.log("Token : " + res.token)
                console.log("Token : " + sessionStorage.getItem("token"))
                this.isUserLoggedIn()
            })
            .catch(err => {
                if (err === 500) {
                    alert("Erreur lors de la connection au serveur. Veuillez réessayer plus tard")
                }
                else if (err === 401) {
                    alert("Adresse e-mail ou mot de passe incorrect.")
                }
                else if (err === 404) {
                    alert("Aucun compte n'est lié à cette adresse mail")
                }
                else {
                    console.error('Failed to sign user in:', err.message);
                }
            })
    }

    async isUserLoggedIn() {
        const token = sessionStorage.getItem('token');
        console.log("isUserLoggedIn() : Token: " + token);
        if (token) {
            try {
                const { userId } = await this.usersRoutes.verifyToken(token);
                console.log("isUserLoggedIn() : token is valid, user ID : " + userId);
                window.location.href = 'index.html'
                return userId;
            } catch (error) {
                console.log(error)
                console.log('isUserLoggedIn() : Token expired or invalid. User is not logged in.');
                localStorage.removeItem('token');
                throw new Error('Token expired or invalid');
            }
        } else {
            console.log("token is empty");
            throw new Error('Token is missing');
        }
    }

    checkPassword(password){
        if (password.length < 8) {
            alert('Votre mot de passe doit contenir minimum 8 charatères.');
            return false;
        }
        if (!/\d/.test(password)) {
            alert('Votre mot de passe doit contenir au moins un chiffre.');
            return false;
        }
        if (!/[A-Z]/.test(password)) {
            alert('Votre mot de passe doit contenir au moins une majuscule.');
            return false;
        }
        if (!/[^a-zA-Z0-9]/.test(password)) {
            alert('Votre mot de passe doit contenir au moins un charactère spécial');
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