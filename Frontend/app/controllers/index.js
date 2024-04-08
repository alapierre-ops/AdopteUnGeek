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
                const url = window.location.href;
                const regex = /\?(\d+|me)/; // Update regex to match user ID or "me"
                const match = regex.exec(url);
                const userID = match ? match[1] : null;
                if(userID === 'me') {
                    const skipIcon = document.getElementById('skipIcon');
                    const likeIcon = document.getElementById('likeIcon');

                    const editButton = document.createElement('button');
                    editButton.textContent = 'Modifier';
                    editButton.classList.add('editButton');

                    const continueButton = document.createElement('button');
                    continueButton.textContent = 'Continuer';
                    continueButton.classList.add('msgButton');

                    skipIcon.parentNode.replaceChild(editButton, skipIcon);
                    likeIcon.parentNode.replaceChild(continueButton, likeIcon);

                    editButton.addEventListener('click', () => window.location.href = "profile.html");
                    continueButton.addEventListener('click', () => window.location.href = "index.html");

                    console.log('User is viewing their own profile');
                    this.getUserInfo(this.userID);

                } else if(userID) {
                    const skipIcon = document.getElementById('skipIcon');
                    const likeIcon = document.getElementById('likeIcon');

                    const backButton = document.createElement('button');
                    backButton.textContent = 'Retour';
                    backButton.classList.add('backButton');

                    const msgButton = document.createElement('button');
                    msgButton.textContent = 'Discuter';
                    msgButton.classList.add('msgButton');

                    skipIcon.parentNode.replaceChild(backButton, skipIcon);
                    likeIcon.parentNode.replaceChild(msgButton, likeIcon);

                    backButton.addEventListener('click', () => window.location.href = `likes.html`);
                    msgButton.addEventListener('click', () => window.location.href = `messages.html?${userID}`);

                    this.getUserInfo(userID);
                    console.log('User ID:', userID);

                } else {
                    this.getUserInfo();
                }
            }
        } catch (error) {
            console.error("initialize(): ", error);
        }
    }


    async getUserInfo(userID) {
        try {
            if(!userID){
                console.log("getUserInfo(): userID == ", this.userID);
                this.nextUser = await this.usersRoutes.getNextUser(this.userID);
                if(!this.nextUser.nickname){
                    alert("No more available users. You swiped on everyone.")
                }
            }
            else{
                this.nextUser = await this.usersRoutes.getUser(userID)
            }
            console.log("getUserInfo(): nextUser == ", this.nextUser.nickname)
            document.getElementById('userName').textContent = this.nextUser.nickname;
            document.getElementById('userBio').textContent = this.nextUser.bio;
            document.getElementById('imageContainer').src = "http://localhost:3333/users/" + this.nextUser.id + "/photos";

            const currentDate = new Date();
            const birthdate = new Date(this.nextUser.birthdate);
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
        textContainer.addEventListener('click', () => {
            document.getElementById('tagContainer').classList.toggle("hidden")
            this.showTags();
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

    showTags(){
        const tagContainer = document.getElementById('tagContainer');

        if(document.getElementById('textContainer').className === "textContainer largeTextContainer"){
            while (tagContainer.firstChild) {
                tagContainer.removeChild(tagContainer.firstChild);
            }
        }
        else{
            const tags = this.nextUser.tags ? this.nextUser.tags.split(',') : [];
            console.log("showTags(): " + tags)
            tags.forEach(tag => {
                const tagElement = document.createElement('div');
                tagElement.textContent = tag;
                tagElement.classList.add('tag');
                tagContainer
                    .appendChild(document.createElement('div')
                        .appendChild(tagElement));
            });
        }
    }

    async addInteraction(liked){
        try{
            await this.usersRoutes.getUserPhotos(this.userID)
        }
        catch (e) {
            alert("Vous devez compléter votre profil avant de continuer");
            window.location.href = "profile.html"
        }
        this.interactionsRoutes.addInteraction(this.userID, this.nextUser.id, liked)
            .then(() => this.getUserInfo(this.userID))
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
    }

    goToProfile() {
        this.usersRoutes.getUserPhotos(this.userID)
            .then(res => {
                if (!res) {
                    console.log("goToProfile(): Profile not complete, can't preview");
                    window.location.href = 'profile.html';
                } else {
                    window.location.href = `index.html?me`;
                }
            })
                .catch(e => {
                    console.log("Error fetching user photos:", e)
                    window.location.href = 'profile.html';
                })
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
