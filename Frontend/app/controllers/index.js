class IndexController {
    constructor() {
        const apiUrl = 'http://localhost:3333';
        this.usersRoutes = new UsersRoutes(apiUrl);
        this.interactionsRoutes = new InteractionsRoutes(apiUrl);
        this.initialize();
        this.addEventListeners();
        this.setupSliders();
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

        document.getElementById('textContainer')
            .addEventListener('click', () => {
                document.getElementById('tagContainer')
                    .classList.toggle("hidden")
                this.showTags();
                document.getElementById('textContainer')
                    .classList.toggle("largeTextContainer");
        });

        document.getElementById('imageContainer').addEventListener('click', function (){
            document.getElementById('textContainer')
                .classList.toggle("hidden");
        });

        document.getElementById('likeIcon')
            .addEventListener('click', () => this.addInteraction(true));
        document.getElementById('skipIcon')
            .addEventListener('click', () => this.addInteraction(false));
    }


    bindFooter(){
        document.getElementById('indexIcon')
            .addEventListener('click', this.goToIndex.bind(this));

        document.getElementById('heartIcon')
            .addEventListener('click', this.goToLikes.bind(this));

        document.getElementById('messagesIcon')
            .addEventListener('click', this.goToMessages.bind(this));

        document.getElementById('settingsIcon')
            .addEventListener('click', this.goToSettings.bind(this));

        console.log("bindFooter(): binding footer icons")
    }

    bindHeader(){
        console.log("bindHeader(): binding header icons")

        document.getElementById('profileIcon')
            .addEventListener('click', this.goToProfile.bind(this));

        document.getElementById('filterIcon')
            .addEventListener('click', function() {
            document.getElementById('filterModal').style.display = "block";
        });

        document.getElementById('closeBtn').onclick = function() {
            document.getElementById('filterModal').style.display = 'none';
        }

        window.onclick = function(event) {
            if (event.target === document.getElementById('filterModal')) {
                document.getElementById('filterModal').style.display = 'none';
            }
        }

        document.getElementById('distanceSlider').oninput = function() {
            if(this.value > 149){
                document.getElementById('distanceValue').textContent = "Pas de limite"
            }
            else{
                document.getElementById('distanceValue').textContent = this.value + " km";
            }
        };

        document.getElementById('submitFilters')
            .addEventListener('click', this.changeFilters.bind(this))
    }

    changeFilters(){
        this.filters = {
            distance: document.getElementById('distanceSlider').value,
            ageMax: document.getElementById('toInput').value,
            ageMin: document.getElementById('fromInput').value,
        }
        console.log("changeFilters(): " + this.filters.ageMin, this.filters.ageMax, this.filters.distance)
        this.usersRoutes.updateUser(this.userID, this.filters)
            .then(r => this.getUserInfo())
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

    setupSliders() {
        const fromSlider = document.querySelector('#fromSlider');
        const toSlider = document.querySelector('#toSlider');
        const fromInput = document.querySelector('#fromInput');
        const toInput = document.querySelector('#toInput');

        // Function to control slider from input
        const controlFromInput = (fromSlider, fromInput, toInput, controlSlider) => {
            const [from, to] = getParsed(fromInput, toInput);
            fillSlider(fromInput, toInput, '#C6C6C6', '#25daa5', controlSlider);
            if (from > to) {
                fromSlider.value = to;
                fromInput.value = to;
            } else {
                fromSlider.value = from;
            }
        };

        // Function to control slider to input
        const controlToInput = (toSlider, fromInput, toInput, controlSlider) => {
            const [from, to] = getParsed(fromInput, toInput);
            fillSlider(fromInput, toInput, '#C6C6C6', '#25daa5', controlSlider);
            setToggleAccessible(toInput);
            if (from <= to) {
                toSlider.value = to;
                toInput.value = to;
            } else {
                toInput.value = from;
            }
        };

        // Function to control slider from slider
        const controlFromSlider = (fromSlider, toSlider, fromInput) => {
            const [from, to] = getParsed(fromSlider, toSlider);
            fillSlider(fromSlider, toSlider, '#C6C6C6', '#25daa5', toSlider);
            if (from > to) {
                fromSlider.value = to;
                fromInput.value = to;
            } else {
                fromInput.value = from;
            }
        };

        // Function to control slider to slider
        const controlToSlider = (fromSlider, toSlider, toInput) => {
            const [from, to] = getParsed(fromSlider, toSlider);
            fillSlider(fromSlider, toSlider, '#C6C6C6', '#25daa5', toSlider);
            setToggleAccessible(toSlider);
            if (from <= to) {
                toSlider.value = to;
                toInput.value = to;
            } else {
                toInput.value = from;
                toSlider.value = from;
            }
        };

        // Function to get parsed values
        const getParsed = (currentFrom, currentTo) => {
            const from = parseInt(currentFrom.value, 10);
            const to = parseInt(currentTo.value, 10);
            return [from, to];
        };

        // Function to fill the slider
        const fillSlider = (from, to, sliderColor, rangeColor, controlSlider) => {
            const rangeDistance = to.max - to.min;
            const fromPosition = from.value - to.min;
            const toPosition = to.value - to.min;
            controlSlider.style.background = `linear-gradient(
              to right,
              ${sliderColor} 0%,
              ${sliderColor} ${(fromPosition / rangeDistance) * 100}%,
              ${rangeColor} ${((fromPosition / rangeDistance)) * 100}%,
              ${rangeColor} ${(toPosition / rangeDistance) * 100}%, 
              ${sliderColor} ${(toPosition / rangeDistance) * 100}%, 
              ${sliderColor} 100%)`;
        };

        // Function to set toggle accessible
        const setToggleAccessible = (currentTarget) => {
            const toSlider = document.querySelector('#toSlider');
            if (Number(currentTarget.value) <= 0) {
                toSlider.style.zIndex = 2;
            } else {
                toSlider.style.zIndex = 0;
            }
        };

        // Bind event listeners
        fromSlider.oninput = () => controlFromSlider(fromSlider, toSlider, fromInput);
        toSlider.oninput = () => controlToSlider(fromSlider, toSlider, toInput);
        fromInput.oninput = () => controlFromInput(fromSlider, fromInput, toInput, toSlider);
        toInput.oninput = () => controlToInput(toSlider, fromInput, toInput, toSlider);

        // Initial setup
        fillSlider(fromSlider, toSlider, '#C6C6C6', '#25daa5', toSlider);
        setToggleAccessible(toSlider);
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
