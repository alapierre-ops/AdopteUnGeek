class IndexController extends MainController{
    constructor() {
        super(true);
        this.token = sessionStorage.getItem('token');
        const apiUrl = 'https://www.main-bvxea6i-egndfhevug7ok.fr-3.platformsh.site/api';
        this.usersRoutes = new UsersRoutes(apiUrl, this.token);
        this.photosRoutes = new PhotosRoutes(apiUrl, this.token);
        this.interactionsRoutes = new InteractionsRoutes(apiUrl, this.token);
        document.addEventListener("DOMContentLoaded", async () => {
            this.initialize()
                .then(() => {
                    console.log("User shown = " + this.nextUser)
                    this.addEventListeners();
                    this.isMobile();
                });
        })
        this.setupSliders();
    }

    async initialize() {

        this.currentUserID = await this.isUserLoggedIn(this.token);
        console.log("initialize(): currentUserID == ",this.currentUserID);
        this.currentUser = this.nextUser = await this.usersRoutes.getUser(this.currentUserID)
        console.log("initialize(): currentUser == ", this.currentUser);
        if (!this.currentUser.city) {window.location.href = "profile.html"}

        try {
            if(!await this.hasFilters()) return
            const url = window.location.href;
            const regex = /\?(\d+|me)/;
            const match = regex.exec(url);
            const userID = match ? match[1] : null;

            if(window.innerWidth < 600){
                this.skipIcon = document.getElementById('skipIcon2');
                this.likeIcon = document.getElementById('likeIcon2');
            }
            else{
                this.skipIcon = document.getElementById('skipIcon');
                this.likeIcon = document.getElementById('likeIcon');
            }

            if(userID === 'me') {
                await this.getUserInfo(this.currentUserID);

                if(!this.nextUser.city){
                    window.location.href = "profile.html";
                }

                const editButton = document.createElement('button');
                editButton.textContent = 'Modifier';
                editButton.classList.add('editButton');

                const continueButton = document.createElement('button');
                continueButton.textContent = 'Continuer';
                continueButton.classList.add('msgButton');

                this.skipIcon.parentNode.replaceChild(editButton, this.skipIcon);
                this.likeIcon.parentNode.replaceChild(continueButton, this.likeIcon);

                editButton.addEventListener('click', () => window.location.href = "profile.html");
                continueButton.addEventListener('click', () => window.location.href = "index.html");

                console.log('User is viewing their own profile');

            } else if(userID) {

                await this.getUserInfo(userID);
                console.log('User ID:', userID);

                console.log("Initialize(): Testing if user is matched")

                const matchedUsers = await this.interactionsRoutes.getMatches(this.currentUserID);
                console.log("matchedUsers: " + matchedUsers);
                const isMatched = matchedUsers.some(user => user.id === Number(userID));

                if(isMatched){
                    console.log("Initialize(): User is already matched")
                    const backButton = document.createElement('button');
                    backButton.textContent = 'Retour';
                    backButton.classList.add('backButton');

                    const msgButton = document.createElement('button');
                    msgButton.textContent = 'Discuter';
                    msgButton.classList.add('msgButton');

                    this.skipIcon.parentNode.replaceChild(backButton, this.skipIcon);
                    this.likeIcon.parentNode.replaceChild(msgButton, this.likeIcon);

                    backButton.addEventListener('click', () => window.location.href = `likes.html`);
                    msgButton.addEventListener('click', () => window.location.href = `messages.html?${userID}`);
                    return
                }
                else{
                    const likedUsers = await this.interactionsRoutes.getILiked(this.currentUserID);
                    const isLiked = likedUsers.some(user => user.id === Number(userID));

                    if(isLiked){
                        console.log("Initialize(): User is already liked");
                        document.getElementById('likeIcon').classList.add("hidden")
                        document.getElementById('skipIcon').classList.add("hidden")
                        return
                    }

                    if(!isLiked){
                        console.log("Initialize(): User isnt already liked")
                        if(window.innerWidth < 600) {
                            document.getElementById('likeIcon2')
                                .addEventListener('click', () => this.addInteraction(true));
                            document.getElementById('skipIcon2')
                                .addEventListener('click', () => this.addInteraction(false));
                        }
                        else{
                            document.getElementById('likeIcon')
                                .addEventListener('click', () => this.addInteraction(true));
                            document.getElementById('skipIcon')
                                .addEventListener('click', () => this.addInteraction(false));
                        }
                        return
                    }
                }

            } else {
                await this.getUserInfo();
                if(window.innerWidth < 600) {
                    document.getElementById('likeIcon2')
                        .addEventListener('click', () => this.addInteraction(true));
                    document.getElementById('skipIcon2')
                        .addEventListener('click', () => this.addInteraction(false));
                }
                else{
                    document.getElementById('likeIcon')
                        .addEventListener('click', () => this.addInteraction(true));
                    document.getElementById('skipIcon')
                        .addEventListener('click', () => this.addInteraction(false));
                }
            }
        } catch (error) {
            if(!this.nextUser){
                alert("Plus aucun profil ne correspond à vos filtres actuels.")
                this.showModal()
            }
            console.error("initialize(): ", error);
        }
    }

    async isMobile(){
        if (window.innerWidth < 600) {
            document.getElementById('tagContainer').classList.remove("hidden");
            this.showTags();
            document.getElementById('textContainer').classList.toggle("largeTextContainer");
            console.log("done")
        }
    }

    async hasFilters(){
        this.currentUser = await this.usersRoutes.getUser(this.currentUserID)

        console.log("initialize(): interestedIn == " + this.currentUser.interestedin)
        if(!this.currentUser.interestedin){
            this.showModal()
            return false
        }
        return true
    }


    async getUserInfo(userID) {
        try {
            console.log("getUserInfo(): alreadyFetchedUsers == " + this.alreadyFetchedUsers)
            if(!this.alreadyFetchedUsers){
                this.alreadyFetchedUsers = [0]
            }
            if(!userID){
                console.log("getUserInfo(): userID == ", this.currentUserID);
                this.nextUser = await this.interactionsRoutes.getNextUser(this.currentUserID, this.alreadyFetchedUsers);
                if(!this.nextUser.nickname){
                    alert("Plus aucun profil ne correspond à vos filtres actuels.")
                    this.showModal()
                }
                const isDistanceOk = await this.isDistanceOk()
                if( isDistanceOk ){
                    await this.displayUserInfo()
                }
                else{
                    this.alreadyFetchedUsers.push(this.nextUser.id)
                    await this.getUserInfo();
                }
            }
            else{
                this.nextUser = await this.usersRoutes.getUser(userID)
                await this.displayUserInfo()
            }
        } catch (error) {
            console.error("getUserInfo():", error);
            alert("Plus aucun profil ne correspond à vos filtres actuels.")
            this.showModal()
        }
    }

    async isDistanceOk(){
        const coord1 = await this.getCityCoordinates(this.nextUser.city)
        const coord2 = await this.getCityCoordinates(this.currentUser.city)

        this.distance = this.getDistanceFromLatLonInKm(coord1.lat, coord1.lon, coord2.lat, coord2.lon);

        console.log("dismax user: " + this.currentUser.filter_dismax)

        if(this.currentUser.filter_dismax === "150"){
            return true
        }

        console.log(`getUserInfo(): ${this.distance} > ${this.currentUser.filter_dismax} ?`)

        return this.distance <= this.currentUser.filter_dismax;

    }

    async displayUserInfo(){
        document.getElementById('userDistance').textContent = this.distance ? "à " + this.distance + " km" : "à 0 km"
        document.getElementById('userName').textContent = this.nextUser.nickname;
        document.getElementById('userBio').textContent = this.nextUser.bio;
        document.getElementById('userAge').textContent = this.getAge(this.nextUser.birthdate) + " ans";
        document.getElementById('imageContainer').src = await this.photosRoutes.getUserPhotos(this.nextUser.id)
    }

    addEventListeners(){
        this.bindFooter()
        this.bindHeader()
        this.bindModal()

        if (window.innerWidth > 600) {
            document.getElementById('textContainer')
                .addEventListener('click', () => {
                    document.getElementById('tagContainer')
                        .classList.toggle("hidden")
                    this.showTags();
                    document.getElementById('textContainer')
                        .classList.toggle("largeTextContainer");
                });
            document.getElementById('imageContainer').addEventListener('click', function () {
                document.getElementById('textContainer')
                    .classList.toggle("hidden");
            });
        }
    }

    bindModal(){
        const filterIcon = document.getElementById('filterIcon');
        filterIcon.addEventListener('click', this.showModal.bind(this));

        if (!this.currentUser.interestedin) {
            this.changeFilters();
        }
        window.onclick = function(event) {
            if (event.target === document.getElementById('filterModal')) {
                document.getElementById('filterModal').style.display = 'none';
            }
        }

        document.getElementById('closeBtn').addEventListener('click', () => {
            document.getElementById('filterModal').style.display = 'none'
        });

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
        document.getElementById('submitFilters')
            .addEventListener('click', () => {
                this.changeFilters();
                document.getElementById('filterModal').style.display = 'none'
            });
    }

    showModal(){
        document.getElementById('filterModal').style.display = "flex";

        if(this.currentUser.interestedin === "male" || !this.currentUser.interestedin){
            document.getElementById('interestedIn').options.item(0).selected = true;
        } else if(this.currentUser.interestedin === "female"){
            document.getElementById('interestedIn').options.item(1).selected = true;
        } else if(this.currentUser.interestedin === "both"){
            document.getElementById('interestedIn').options.item(2).selected = true;
        }

        const toInput = document.getElementById('toInput');
        const fromInput = document.getElementById('fromInput');
        const toSlider = document.getElementById('toSlider');
        const fromSlider = document.getElementById('fromSlider');

        const ageMax = this.currentUser.filter_agemax ? this.currentUser.filter_agemax : this.getAge(this.currentUser.birthdate) + 5;
        const ageMin = this.currentUser.filter_agemin ? this.currentUser.filter_agemin : Math.max(18, this.getAge(this.currentUser.birthdate) - 5);

        toInput.value = ageMax;
        fromInput.value = ageMin;

        toSlider.value = this.mapAgeToSlider(ageMax);
        fromSlider.value = this.mapAgeToSlider(ageMin);

        console.log("toInput.value = " + toInput.value)
        console.log("fromSlider.value = " + fromSlider.value);
        console.log("toSlider.value = " + toSlider.value);
        console.log("fromInput.value = " + fromInput.value);

        document.getElementById('distanceSlider').value = this.currentUser.filter_dismax ? this.currentUser.filter_dismax : 150

        if(document.getElementById('distanceSlider').value > 149){
            document.getElementById('distanceValue').textContent = "Pas de limite"
        }
        else{
            document.getElementById('distanceValue').textContent = document.getElementById('distanceSlider').value + " km";
        }
    }

    changeFilters(){
        if (!this.filters) {
            this.filters = {};
        }

        if (this.filters.distance > document.getElementById('distanceSlider').value) {
            this.alreadyFetchedUsers = [0];
        }

        if(document.getElementById('fromInput').value < 18){
            document.getElementById('fromInput').value = 18
        }
        if(document.getElementById('toInput').value < 18){
            document.getElementById('toInput').value = 18
        }
        if(document.getElementById('fromInput').value > 80){
            document.getElementById('fromInput').value = 80
        }
        if(document.getElementById('toInput').value > 80){
            document.getElementById('toInput').value = 80
        }

        this.filters = {
            distance: document.getElementById('distanceSlider').value,
            ageMax: document.getElementById('toInput').value,
            ageMin: document.getElementById('fromInput').value,
            interestedin: document.getElementById('interestedIn').value
        }
        console.log("changeFilters(): " + this.filters.ageMin, this.filters.ageMax, this.filters.distance, this.filters.interestedin)
        this.usersRoutes.updateUser(this.currentUserID, this.filters)
            .then(() =>
                this.hasFilters()
                    .then(() => this.getUserInfo()))
    }

    async getCityCoordinates(cityName) {
        try {
            const response = await fetch(`https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/geonames-all-cities-with-a-population-500/records?where=name%3D%22${cityName}%22&limit=20&refine=country%3A%22France%22`);
            const data = await response.json();

            if(data.results.length > 0) {
                const latitude = data.results[0].latitude;
                const longitude = data.results[0].longitude;
                return { lat: latitude, lon: longitude };
            } else {
                return null;
            }
        } catch(error) {
            console.error("Error fetching city coordinates:", error);
            return null;
        }
    }

    deg2rad(deg) {
        return deg * (Math.PI/180);
    }

    getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
        const R = 6371; // Radius of the Earth in km
        const dLat = this.deg2rad(lat2-lat1);
        const dLon = this.deg2rad(lon2-lon1);
        const a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return Math.ceil(R * c);
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
        if(!this.currentUser.city){
            alert("Vous devez compléter votre profil avant de continuer");
            window.location.href = "profile.html"
        }
        this.interactionsRoutes.addInteraction(this.currentUserID, this.nextUser.id, liked)
            .then(() => this.getUserInfo())
    }

    // Function to map slider value to age
    mapSliderToAge = (value) => {
        if (value <= 32) {
            return value + 18; // 18 to 50 maps to 0 to 32
        } else if (value <= 40) {
            return 50 + (value - 32) * 5; // 50 to 80 maps to 32 to 40
        } else {
            return 80; // Values greater than 40 map to 80+
        }
    };

    // Function to map age to slider value
    mapAgeToSlider = (age) => {
        if (age <= 50) {
            return age - 18; // 18 to 50 maps to 0 to 32
        } else if (age <= 80) {
            return 32 + (age - 50) / 5; // 50 to 80 maps to 32 to 40
        } else {
            return 41; // 80+ maps to 41
        }
    };

    setupSliders() {
        const fromSlider = document.querySelector('#fromSlider');
        const toSlider = document.querySelector('#toSlider');
        const fromInput = document.querySelector('#fromInput');
        const toInput = document.querySelector('#toInput');

        const controlFromInput = (fromSlider, fromInput, toInput, controlSlider) => {
            let from = parseInt(fromInput.value, 10);
            let to = parseInt(toInput.value, 10);
            if (from > to) {
                from = to;
                fromInput.value = toInput.value
            }
            fromSlider.value = this.mapAgeToSlider(from);
            fillSlider(fromSlider, toSlider, '#C6C6C6', '#25daa5', controlSlider);
        };

        const controlToInput = (toSlider, fromInput, toInput, controlSlider) => {
            let from = parseInt(fromInput.value, 10);
            let to = parseInt(toInput.value, 10);
            if (from > to) {
                to = from;
                toInput.value = fromInput.value
            }
            if (from < 18) {
                fromInput.value = 18
            }
            if(to > 80) {
                toInput.value = 80;
            }
            toSlider.value = this.mapAgeToSlider(to);
            fillSlider(fromSlider, toSlider, '#C6C6C6', '#25daa5', controlSlider);
            setToggleAccessible(toInput);
        };

        const controlFromSlider = (fromSlider, toSlider, fromInput) => {
            let from = this.mapSliderToAge(parseInt(fromSlider.value, 10));
            let to = this.mapSliderToAge(parseInt(toSlider.value, 10));
            if (from > to) {
                fromSlider.value = this.mapAgeToSlider(to);
                from = to;
            }
            if (from < 18) {
                fromInput.value = 18
            }
            if(to > 80) {
                toInput.value = 80;
            }
            fromInput.value = from;
            fillSlider(fromSlider, toSlider, '#C6C6C6', '#25daa5', toSlider);
        };

        const controlToSlider = (fromSlider, toSlider, toInput) => {
            let from = this.mapSliderToAge(parseInt(fromSlider.value, 10));
            let to = this.mapSliderToAge(parseInt(toSlider.value, 10));
            if (from > to) {
                toSlider.value = this.mapAgeToSlider(from);
                to = from;
            }
            toInput.value = to;
            fillSlider(fromSlider, toSlider, '#C6C6C6', '#25daa5', toSlider);
            setToggleAccessible(toSlider);
        };

        const fillSlider = (from, to, sliderColor, rangeColor, controlSlider) => {
            const rangeDistance = 41;
            const fromPosition = from.value - 0;
            const toPosition = to.value - 0;
            controlSlider.style.background = `linear-gradient(
          to right,
          ${sliderColor} 0%,
          ${sliderColor} ${(fromPosition / rangeDistance) * 100}%,
          ${rangeColor} ${(fromPosition / rangeDistance) * 100}%,
          ${rangeColor} ${(toPosition / rangeDistance) * 100}%, 
          ${sliderColor} ${(toPosition / rangeDistance) * 100}%, 
          ${sliderColor} 100%)`;
        };

        const setToggleAccessible = (currentTarget) => {
            const toSlider = document.querySelector('#toSlider');
            if (Number(currentTarget.value) <= 0) {
                toSlider.style.zIndex = 2;
            } else {
                toSlider.style.zIndex = 0;
            }
        };

        fromSlider.oninput = () => controlFromSlider(fromSlider, toSlider, fromInput);
        toSlider.oninput = () => controlToSlider(fromSlider, toSlider, toInput);
        fromInput.oninput = () => controlFromInput(fromSlider, fromInput, toInput, toSlider);
        toInput.oninput = () => controlToInput(toSlider, fromInput, toInput, toSlider);

        fillSlider(fromSlider, toSlider, '#C6C6C6', '#25daa5', toSlider);
        setToggleAccessible(toSlider);
    }
}


window.indexController = new IndexController()