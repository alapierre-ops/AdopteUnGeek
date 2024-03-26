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
        form.addEventListener('submit', this.handleConfirm.bind(this));
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

            if(this.currentUser.interestedIn === "male"){
                document.getElementById('interestedIn').options.item(0).selected = true;
            } else if(this.currentUser.interestedIn === "female" || !this.currentUser.interestedIn){
                document.getElementById('interestedIn').options.item(1).selected = true;
            } else if(this.currentUser.interestedIn === "both"){
                document.getElementById('interestedIn').options.item(2).selected = true;
            }

            document.getElementById('bio').textContent = this.currentUser.bio;
            document.getElementById('birthdate').value = this.currentUser.birthdate.substring(0, 10);

        } catch (error) {
            console.error("getUserInfo():", error);
        }
    }

    async handleConfirm(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const updatedUserData = {
            gender: formData.get('gender'),
            bio: formData.get('bio'),
            interestedIn: formData.get('interestedIn'),
            birthdate: formData.get('birthdate')
        };
        console.log("handleConfirm(): birthdate == " + updatedUserData.birthdate);
        try {
            const updatedUser = await this.usersRoutes.updateUser(this.userID, updatedUserData);
            console.log('User updated successfully:', updatedUser);
            window.location.href = 'index.html';
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