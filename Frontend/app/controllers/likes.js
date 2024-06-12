class LikesController extends MainController {
    constructor() {
        super(true)
        this.token = sessionStorage.getItem('token');
        this.apiUrl = 'https://www.main-bvxea6i-egndfhevug7ok.fr-3.platformsh.site/api';
        this.usersRoutes = new UsersRoutes(this.apiUrl, this.token);
        this.photosRoutes = new PhotosRoutes(this.apiUrl, this.token);
        this.interactionsRoutes = new InteractionsRoutes(this.apiUrl, this.token);
        this.initialize();
    }

    async initialize(){
        this.addEventListeners();
        try {
            this.userID = await this.isUserLoggedIn(this.token);
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

    async getUsers(category) {
        try {
            const userGrid = document.getElementById('userGrid');
            userGrid.innerHTML = '';

            if (category) {
                document.getElementById("likedByOthers").classList.remove("category-option-selected")
            }

            if (!category || category === "likedMe") {
                this.users = await this.interactionsRoutes.getLikedMe(this.userID);
            }

            if (category === "iLiked") {
                this.users = await this.interactionsRoutes.getILiked(this.userID);
            }

            if (category === "matches") {
                this.users = await this.interactionsRoutes.getMatches(this.userID);
            }

            console.log("getUsers(): ", this.users);

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
                    img.src = 'https://cdn.pixabay.com/animation/2023/11/18/09/26/09-26-08-99_512.gif';

                    const actualImg = new Image();
                    actualImg.src = await this.photosRoutes.getUserPhotos(user.id);
                    actualImg.onload = () => {
                        img.src = actualImg.src;
                    };

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
                    userAge.textContent = `${age} ans`;

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
}

window.likesController = new LikesController()