class ProfileController {
    constructor() {
        const apiUrl = 'http://localhost:3333';
        this.usersRoutes = new UsersRoutes(apiUrl);
        this.initialize();
        this.addEventListeners();
    }

    async initialize(){
        try {
            this.userID = await this.isUserLoggedIn();
            if (this.userID) {
                await this.getUserInfo();
            }
        } catch (error) {
            console.error("initialize(): ", error);
        }
    }

    addEventListeners(){
        const form = document.getElementById('profile-form');
        form.addEventListener('submit', function(event) {
            if (event.target.id === 'photoForm') {
                this.handleConfirm(event);
            } else {
                this.handleNext(event);
            }
        }.bind(this));

        const photoInput = document.getElementById('photoInput');
        photoInput.addEventListener('change', this.handlePhotoInputChange.bind(this));

        const tags = document.querySelectorAll('.tag');
        tags.forEach(tag => {
            tag.addEventListener('click', this.toggleTag.bind(this, tag));
        });

        const cityInput = document.getElementById('cityInput');
        const suggestionsList = document.getElementById('suggestionsList');

        cityInput.addEventListener('input', async () => {
            const searchString = cityInput.value.trim();
            if (searchString.length < 2) {
                suggestionsList.innerHTML = '';
                return;
            }
            try {
                const suggestions = await this.fetchCitySuggestions(searchString);
                this.displaySuggestions(suggestions);
            } catch (error) {
                console.error('Error fetching city suggestions:', error);
            }
        });
    }

    async fetchCitySuggestions(searchString) {
        const apiUrl = 'https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/geonames-all-cities-with-a-population-500/records';
        const response = await fetch(`${apiUrl}?where=search(name%2C%20%22${searchString.charAt(0).toUpperCase() + searchString.slice(1)}%22)&limit=7&refine=country%3A%22France%22`);
        if (!response.ok) {
            throw new Error('Failed to fetch city suggestions');
        }
        const res = await response.json()
        return res.results
    }

    displaySuggestions(suggestions) {
        const cityInput = document.getElementById('cityInput');
        const suggestionsList = document.getElementById('suggestionsList');
        suggestionsList.innerHTML = '';
        suggestions.forEach(suggestion => {
            console.log(suggestion.name)
            const li = document.createElement('li');
            li.textContent = suggestion.name;
            li.addEventListener('click', () => {
                cityInput.value = suggestion.name;
                suggestionsList.innerHTML = '';
            });
            suggestionsList.appendChild(li);
        });
    }

    async handlePhotoInputChange() {
        console.log("handlePhotoInputChange()");
        const file = document.getElementById('photoInput').files[0];
        try {
            await this.usersRoutes.updatePhotos(this.userID, file);
            console.log("handlePhotoInputChange(): photo changed successfully");
            await this.displayPhotoPreview();
        } catch (error) {
            console.log("handlePhotoInputChange(): error updating photo: ", error);
        }
    }


    toggleTag(tag){
        if (this.selectedTags.includes(tag.textContent)) {
            this.selectedTags = this.selectedTags.filter(t => t !== tag.textContent);
            tag.classList.remove('selected');
            console.log("tag removed")

        } else {
            if (this.selectedTags.length < 5) {
                this.selectedTags.push(tag.textContent);
                tag.classList.add('selected');
                console.log("tag added, this.selectedTags == " + this.selectedTags)

            } else {
                alert('Vous ne pouvez sélectionner que 5 tags.');
            }
        }
    }

    async getUserInfo() {
        try {
            console.log("getUserInfo(): userID == ", this.userID);
            this.currentUser = await this.usersRoutes.getUser(this.userID);
            console.log("getUserInfo(): currentUser == ", this.currentUser)
            if(this.currentUser.gender === "male" || !this.currentUser.gender){
                document.getElementById('gender').options.item(0).selected = true;
            } else if(this.currentUser.gender === "female"){
                document.getElementById('gender').options.item(1).selected = true;
            } else if(this.currentUser.gender === "other"){
                document.getElementById('gender').options.item(2).selected = true;
            }

            document.getElementById('cityInput').value = this.currentUser.city;
            document.getElementById('bio').textContent = this.currentUser.bio;
            document.getElementById('birthdate').value = this.currentUser.birthdate ? this.currentUser.birthdate.substring(0, 10) : "";

            this.selectedTags = this.currentUser.tags ? this.currentUser.tags.split(',') : [];
            await this.displayPhotoPreview()
            this.colorSelectedTags();
        } catch (error) {
            console.error("getUserInfo():", error);
        }
    }

    colorSelectedTags(){
        console.log("Selected tags: " + this.selectedTags)
        const tags = document.querySelectorAll('.tag');
        tags.forEach(tag => {
            if (this.selectedTags.includes(tag.textContent)) {
                tag.classList.add('selected');
                console.log("tag added : " + tag.textContent);
            }
        });
    }

    async displayPhotoPreview() {
        console.log("displayPhotoPreview()");
        this.currentUser.photo = await this.usersRoutes.getUserPhotos(this.currentUser.id);
        if (this.currentUser.photo) {
            console.log("getUserInfo(): photo found");
            document.getElementById('preview').src = this.currentUser.photo;
            document.getElementById('preview').style.display = 'block';
        }
    }


    async handleNext(event) {
        event.preventDefault();
        const formData = new FormData(event.target);

        const birthdateString = formData.get('birthdate');
        const [year, month, day] = birthdateString.split('-').map(Number);
        const birthdate = new Date(year, month - 1, day);  //January is 0
        const currentDate = new Date();

        const eighteenYearsAgo = new Date(currentDate.getFullYear() - 18, currentDate.getMonth(), currentDate.getDate());
        if (birthdate > eighteenYearsAgo) {
            alert("L'âge minimum requis est de 18 ans.");
            return
        }


        this.updatedUserData = {
            gender: formData.get('gender'),
            bio: formData.get('bio'),
            city: document.getElementById('cityInput').value,
            birthdate: formData.get('birthdate'),
        };
        console.log("handleNext(): userCity == " + this.updatedUserData.city);
        document.getElementById('firstForm').style.display = 'none';
        document.getElementById('photoForm').style.display = 'block';

        await this.displayPhotoPreview()
    }

    async handleConfirm(event) {
        event.preventDefault();

        if(!this.currentUser.photo){
            alert("Veuillez ajouter au moins une photo")
            return
        }

        this.updatedUserData.tags = this.selectedTags.join(',');
        this.updatedUserData.interestedIn = "both"

        try {
            await this.usersRoutes.updateUser(this.userID, this.updatedUserData);
            console.log('User updated successfully');
            window.location.href = "index.html?me";
        } catch (error) {
            console.error('Failed to update user: ', error.message);
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
}

window.profileController = new ProfileController()