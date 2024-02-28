class IndexController {
    constructor() {
        const apiUrl = 'http://localhost:3333/users';
        this.usersRoutes = new UsersRoutes(apiUrl);
        this.isUserLoggedIn();
        this.bindFooter();
        this.bindHeader();
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

        console.log("binding footer icons")
    }

    bindHeader(){
        console.log("binding header icons")

        const profileIcon = document.getElementById('profileIcon');
        profileIcon.addEventListener('click', this.goToProfile.bind(this));

        const filterIcon = document.getElementById('filterIcon');
        filterIcon.addEventListener('click', this.goToFilters.bind(this));
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
                    window.location.href = 'login.html';
                    return false
                });
        } else {
            console.log("token is empty")
            window.location.href = 'login.html';
            return false
        }
    }

    goToIndex(){
        console.log("going to index")
        window.location.href = 'index.html';
    }

    goToLikes(){
        console.log("going to likes")
        window.location.href = 'likes.html';
    }
    goToMessages(){
        console.log("going to messages")
        window.location.href = 'messages.html';
    }
    goToSettings(){
        console.log("going to settings")
        window.location.href = 'settings.html';
    }

    goToProfile(){
        console.log("going to profile")
        window.location.href = 'profile.html';
    }

    goToFilters(){
        console.log("going to filters")
        //window.location.href = 'settings.html';
    }
}


window.indexController = new IndexController()