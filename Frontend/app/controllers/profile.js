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
        const form = document.getElementById('form');
        form.addEventListener('submit', this.handleNext.bind(this));

        const photoForm = document.getElementById('photoForm');
        photoForm.addEventListener('submit', this.handleConfirm.bind(this));

        const tags = document.querySelectorAll('.tag');
        tags.forEach(tag => {
            tag.addEventListener('click', this.toggleTag.bind(this, tag));
        });
    }

    toggleTag(tag) {
        if (this.selectedTags.includes(tag.textContent)) {
            this.selectedTags = this.selectedTags.filter(t => t !== tag.textContent);
            tag.classList.remove('selected');
            console.log("tag removed")
        } else {
            if (this.selectedTags.length < 5) {
                this.selectedTags.push(tag.textContent);
                tag.classList.add('selected');
                console.log("tag added")

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

            console.log("interestedin == " + this.currentUser.interestedin)
            if(this.currentUser.interestedin === "male"){
                document.getElementById('interestedIn').options.item(0).selected = true;
            } else if(this.currentUser.interestedin === "female" || !this.currentUser.interestedin){
                document.getElementById('interestedIn').options.item(1).selected = true;
            } else if(this.currentUser.interestedin === "both"){
                document.getElementById('interestedIn').options.item(2).selected = true;
            }

            document.getElementById('bio').textContent = this.currentUser.bio;
            document.getElementById('birthdate').value = this.currentUser.birthdate ? this.currentUser.birthdate.substring(0, 10) : "";

            this.selectedTags = this.currentUser.tags ? this.currentUser.tags.split(',') : [];
            this.colorSelectedTags();
        } catch (error) {
            console.error("getUserInfo():", error);
        }
    }

    colorSelectedTags(){
        const tags = document.querySelectorAll('.tag');
        tags.forEach(tag => {
            if (this.selectedTags.includes(tag.textContent)) {
                tag.classList.add('selected');
                console.log("tag added : " + tag.textContent);
            }
        });
    }

    async handleNext(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        this.updatedUserData = {
            gender: formData.get('gender'),
            bio: formData.get('bio'),
            interestedin: formData.get('interestedin'),
            birthdate: formData.get('birthdate'),
        };
        console.log("handleConfirm(): birthdate == " + this.updatedUserData.birthdate);
        document.getElementById('firstForm').style.display = 'none';
        document.getElementById('photoForm').style.display = 'block';
    }

    async handleConfirm(event) {
        event.preventDefault();

        this.updatedUserData.photo = document.getElementById('photoInput').files[0];
        this.updatedUserData.tags = this.selectedTags.join(',');

        try {
            await this.usersRoutes.updateUser(this.userID, this.updatedUserData);
            console.log('User updated successfully');
            window.location.href = "index.html";
        } catch (error) {
            console.error('Failed to update user:', error.message);
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