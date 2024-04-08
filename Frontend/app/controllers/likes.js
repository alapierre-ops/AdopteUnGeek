class LikesController {
    constructor() {
        const apiUrl = 'http://localhost:3333';
        this.usersRoutes = new UsersRoutes(apiUrl);
        this.initialize();
    }

    async initialize(){
        try {
            this.userID = await this.isUserLoggedIn();
            if (this.userID) {
                this.changeCategory("")
            }
        } catch (error) {
            console.error("initialize(): ", error);
        }
    }

    changeCategory(category){
        if(!category || category === "likedMe"){
            this.getLikedMe()
        }
    }

    async getLikedMe(){
        try {
            const users = await this.usersRoutes.getLikedMe(this.userID);
            console.log("getLikedMe(): ", users)

            if(users.length === 0){
                alert("Vous n'avez pas encore reçu de like")
                this.changeCategory("iLiked")
            }

            const userGrid = document.getElementById('userGrid');

            users.forEach(user => {
                const personDiv = document.createElement('div');
                personDiv.classList.add('person');

                const imageContainer = document.createElement('div');
                imageContainer.classList.add('image-container');

                const img = document.createElement('img');
                img.alt = 'main picture';
                img.src = "http://localhost:3333/users/" + user.id + "/photos";

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
                userGrid.appendChild(personDiv);
            });
        } catch (error) {
            console.error('Error fetching liked users:', error);
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

window.likesController = new LikesController()