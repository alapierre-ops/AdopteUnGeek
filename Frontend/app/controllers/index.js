class IndexController {
    constructor() {
        const apiUrl = 'http://localhost:3333';
        this.usersRoutes = new UsersRoutes(apiUrl);
        this.interactionsRoutes = new InteractionsRoutes(apiUrl);
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
            this.nextUser = await this.usersRoutes.getNextUser(this.userID);
            console.log("getUserInfo(): nextUser == ", this.nextUser[0].nickname)
            document.getElementById('userName').textContent = this.nextUser[0].nickname;
            document.getElementById('userBio').textContent = this.nextUser[0].bio;
            document.getElementById('imageContainer').src = "http://localhost:3333/users/" + this.nextUser[0].id + "/photos";

            const currentDate = new Date();
            const birthdate = new Date(this.nextUser[0].birthdate);
            const differenceMs = currentDate - birthdate;
            const nextUserAge = Math.floor(differenceMs / (1000 * 60 * 60 * 24 * 365));
            document.getElementById('userAge').textContent = nextUserAge + " ans";
        } catch (error) {
            console.error("getUserInfo():", error);
            alert("No more available users. You swiped on everyone.")
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

        const likeButton = document.getElementById('likeIcon');
        likeButton.addEventListener('click', () => this.addInteraction(true));
        const skipButton = document.getElementById('skipIcon');
        skipButton.addEventListener('click', () => this.addInteraction(false));
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

    addInteraction(liked){
        this.interactionsRoutes.addInteraction(this.userID, this.nextUser[0].id, liked)
            .then((r => this.getUserInfo(this.userID)))
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


window.indexController = new IndexController()
