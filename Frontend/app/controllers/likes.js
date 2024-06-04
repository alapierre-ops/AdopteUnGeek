class LikesController {
    constructor() {
        this.token = sessionStorage.getItem('token');
        const apiUrl = 'https://www.main-bvxea6i-egndfhevug7ok.fr-3.platformsh.site/api';
        this.usersRoutes = new UsersRoutes(apiUrl, this.token);
        this.photosRoutes = new PhotosRoutes(apiUrl, this.token);
        this.interactionsRoutes = new InteractionsRoutes(apiUrl, this.token);
        this.initialize();
    }

    async initialize(){
        this.addEventListeners();
        try {
            this.userID = await this.isUserLoggedIn();
            if (this.userID) {
                this.getUsers("")
            }
        } catch (error) {
            console.error("initialize(): ", error);
        }
    }

    addEventListeners(){
        this.bindFooter()
        this.bindHeader()

        const likedByMe = document.getElementById('likedByMe');
        likedByMe.addEventListener('click', () => {
            this.getUsers("iLiked")
        });

        const likedByOthers = document.getElementById('likedByOthers');
        likedByOthers.addEventListener('click', () => {
            this.getUsers("likedMe")
        });

        const matches = document.getElementById('matches');
        matches.addEventListener('click', () => {
            this.getUsers("matches")
        });
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

    async getUsers(category){
        try {
            const userGrid = document.getElementById('userGrid');
            userGrid.innerHTML = '';

            if(!category || category === "likedMe"){
                this.users = await this.interactionsRoutes.getLikedMe(this.userID);
            }

            if(category === "iLiked"){
                this.users = await this.interactionsRoutes.getILiked(this.userID);
            }

            if(category === "matches"){
                this.users = await this.interactionsRoutes.getMatches(this.userID);
            }

            console.log("getUsers(): ", this.users)

            const usersPerRow = 3;

            for (let i = 0; i < this.users.length; i += usersPerRow) {
                const row = document.createElement('div');
                row.classList.add('user-row');

                for (let j = i; j < i + usersPerRow && j < this.users.length; j++) {
                    const user = this.users[j];

                    const personDiv = document.createElement('div');
                    personDiv.classList.add('person');

                    const imageContainer = document.createElement('div');
                    imageContainer.classList.add('image-container');

                    const img = document.createElement('img');
                    img.alt = 'main picture';
                    img.src = "http://localhost:3333/photos/" + user.id;

                    const textContainer = document.createElement('div');
                    textContainer.classList.add('textContainer');

                    const userFirstRow = document.createElement('div');
                    userFirstRow.classList.add('userFirstRow');

                    const userName = document.createElement('h4');
                    userName.textContent = user.nickname;

                    const userAge = document.createElement('h4');
                    const currentDate = new Date();
                    const birthdate = new Date(user.birthdate);
                    const differenceMs = currentDate - birthdate;
                    const age = Math.floor(differenceMs / (1000 * 60 * 60 * 24 * 365));
                    userAge.textContent = age + " ans";

                    userFirstRow.appendChild(userName);
                    userFirstRow.appendChild(userAge);
                    textContainer.appendChild(userFirstRow);
                    imageContainer.appendChild(img);
                    imageContainer.appendChild(textContainer);
                    personDiv.appendChild(imageContainer);
                    row.appendChild(personDiv);

                    personDiv.addEventListener('click', () => {
                        window.location.href = `index.html?${user.id}`;
                    });
                }

                userGrid.appendChild(row);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
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
    }

    goToProfile() {
        this.photosRoutes.getUserPhotos(this.userID)
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

window.likesController = new LikesController()