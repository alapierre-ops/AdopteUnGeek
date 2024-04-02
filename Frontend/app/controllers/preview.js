class PreviewController {
    constructor() {
        const apiUrl = 'http://localhost:3333';
        this.usersRoutes = new UsersRoutes(apiUrl);
        this.initialize();
        this.addEventListeners();
    }

    async initialize() {
        try {
            this.userID = await this.isUserLoggedIn();
            if (this.userID) {
                await this.getUserInfo();
            }
        } catch (error) {
            console.error("initialize(): ", error);
        }
    }

    async getUserInfo() {
        try {
            console.log("getUserInfo(): userID == ", this.userID);
            this.currentUser = await this.usersRoutes.getUser(this.userID);
            console.log("getUserInfo(): currentUser == ", this.currentUser.nickname)
            document.getElementById('userName').textContent = this.currentUser.nickname;
            document.getElementById('userBio').textContent = this.currentUser.bio;
            document.getElementById('imageContainer').src = "http://localhost:3333/users/" + this.currentUser.id + "/photos";

            const currentDate = new Date();
            const birthdate = new Date(this.currentUser.birthdate);
            const differenceMs = currentDate - birthdate;
            const age = Math.floor(differenceMs / (1000 * 60 * 60 * 24 * 365));
            document.getElementById('userAge').textContent = age + " ans";
        } catch (error) {
            console.error("getUserInfo():", error);
        }
    }

    addEventListeners(){
        this.bindFooter()
        this.bindHeader()

        const textContainer = document.getElementById('textContainer');
        textContainer.addEventListener('click', function (){
            textContainer.classList.toggle("largeTextContainer");
        });
        const imageContainer = document.getElementById('imageContainer');
        imageContainer.addEventListener('click', function (){
            textContainer.classList.toggle("hidden");
        });

        const confirmButton = document.getElementById('confirmButton');
        confirmButton.addEventListener('click', () => window.location.href = "index.html");
        const editButton = document.getElementById('editButton');
        editButton.addEventListener('click', () => window.location.href = "profile.html");
    }


    bindFooter(){
        const indexIcon = document.getElementById('indexIcon');
        indexIcon.addEventListener('click', this.goToIndex.bind(this));

        const heartIcon = document.getElementById('heartIcon');
        heartIcon.addEventListener('click', this.goToLikes.bind(this));

        const messagesIcon = document.getElementById('messagesIcon');
        messagesIcon.addEventListener('click', this.goToMessages.bind(this));

        const settingsIcon = document.getElementById('settingsIcon');
        settingsIcon.addEventListener('click', this.goToSettings.bind(this));

        console.log("bindFooter(): binding footer icons")
    }

    bindHeader(){
        console.log("bindHeader(): binding header icons")

        const profileIcon = document.getElementById('profileIcon');
        profileIcon.addEventListener('click', this.goToProfile.bind(this));

        const filterIcon = document.getElementById('filterIcon');
        filterIcon.addEventListener('click', this.goToFilters.bind(this));
    }

    async isUserLoggedIn() {
        const token = sessionStorage.getItem('token');
        console.log("isUserLoggedIn(): Token:", token);
        if (token) {
            try {
                const { userId } = await this.usersRoutes.verifyToken(token);
                console.log("isUserLoggedIn(): token is valid, user ID:", userId);
                return userId;
            } catch (error) {
                console.log("isUserLoggedIn():", error);
                console.log('isUserLoggedIn(): Token expired or invalid. User is not logged in.');
                localStorage.removeItem('token');
                window.location.href = 'login.html';
                throw new Error('Token expired or invalid');
            }
        } else {
            console.log("isUserLoggedIn(): token is empty");
            window.location.href = 'login.html';
            throw new Error('Token is missing');
        }
    }

    goToIndex(){
        console.log("goToIndex(): going to index")
        window.location.href = 'index.html';
    }

    goToLikes(){
        console.log("goToLikes(): going to likes")
        window.location.href = 'likes.html';
    }
    goToMessages(){
        console.log("goToMessages(): going to messages")
        window.location.href = 'messages.html';
    }
    goToSettings(){
        console.log("goToSettings(): going to settings")
        this.handleLogout();
        //window.location.href = 'settings.html';
    }

    goToProfile(){
        console.log("goToProfile(): going to profile")
        window.location.href = 'profile.html';
    }

    goToFilters(){
        console.log("goToFilters(): going to filters")
        //window.location.href = 'settings.html';
    }

    async handleLogout() {
        console.log("handleLogOut")
        try {
            sessionStorage.removeItem("token")
            window.location.href = 'login.html';
        } catch (error) {
            console.log('Erreur lors de la déconnexion. ', error.message);
            alert('Erreur lors de la déconnexion, veuillez réessayer plus tard.');
        }
    }
}


window.previewController = new PreviewController()