class LikesController extends MainController {
    constructor() {
        super(true)
        this.token = sessionStorage.getItem('token');
        this.apiUrl = 'https://www.main-bvxea6i-egndfhevug7ok.fr-3.platformsh.site/api';
        this.usersRoutes = new UsersRoutes(this.apiUrl, this.token);
        this.photosRoutes = new PhotosRoutes(this.apiUrl, this.token);
        this.interactionsRoutes = new InteractionsRoutes(this.apiUrl, this.token);
        this.initialize();
        this.isLoading = false
        this.userCache = {};
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
        document.getElementById("loader").style.display = "block";
        try {
            if (!this.isLoading) {
                this.isLoading = true;
                const userGrid = document.getElementById('userGrid');
                userGrid.innerHTML = '';
                this.users = [];

                if (category) {
                    document.getElementById("likedByOthers").classList.remove("category-option-selected");
                }

                if (!category || category === "likedMe") {
                    this.users = await this.fetchUsers('getLikedMe');
                }

                if (category === "iLiked") {
                    this.users = await this.fetchUsers('getILiked');
                }

                if (category === "matches") {
                    this.users = await this.fetchUsers('getMatches');
                }

                console.log("getUsers(): ", this.users);

                if (this.users.length === 0) {
                    const noUsersMessage = document.createElement('div');
                    noUsersMessage.classList.add('no-users-message');
                    noUsersMessage.textContent = "Il n'y a pas d'utilisateurs dans cette catégorie.";
                    userGrid.appendChild(noUsersMessage);
                } else {
                    this.renderUsers(this.users, userGrid);
                }
                document.getElementById("loader").style.display = "none";
                this.isLoading = false;
            }
        } catch (error) {
            document.getElementById("loader").style.display = "none";
            console.error('Error fetching users:', error);
        }
    }

    async fetchUsers(route) {
        if (this.userCache[route]) {
            return this.userCache[route];
        }
        const users = await this.interactionsRoutes[route](this.userID);
        this.userCache[route] = users;
        return users;
    }

    renderUsers(users, userGrid) {
        try {
            const usersPerRow = 3;
            const numberOfRows = Math.ceil(users.length / usersPerRow);
            for (let i = 0; i < users.length; i += usersPerRow) {
                const row = document.createElement('div');
                row.classList.add('user-row');

                for (let j = i; j < i + usersPerRow && j < users.length; j++) {
                    const user = users[j];

                    const personDiv = document.createElement('div');
                    personDiv.classList.add('person');

                    const imageContainer = document.createElement('div');
                    imageContainer.classList.add('image-container');

                    const img = document.createElement('img');
                    img.alt = 'main picture';
                    img.src = '../res/loader.gif';

                    this.changePicture(user, img);

                    const textContainer = document.createElement('div');
                    textContainer.classList.add('textContainer');

                    const userFirstRow = document.createElement('div');
                    userFirstRow.classList.add('userFirstRowLikes');

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

                if (numberOfRows >= 2) {
                    const rows = userGrid.getElementsByClassName('user-row');
                    for (let i = 0; i < rows.length - 1; i++) {
                        rows[i].style.marginBottom = '20px';
                    }
                }
            }
        }
        catch (e) {
            console.error('Error rendering users:', e);
        }
    }

    async changePicture(user, imgElement) {
        try {
            const imageUrl = await this.photosRoutes.getUserPhotos(user.id);
            imgElement.src = imageUrl;
        } catch (error) {
            console.error('Failed to fetch user photo:', error);
        }
    }
}

window.likesController = new LikesController()