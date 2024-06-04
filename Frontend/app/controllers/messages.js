class MessagesController {
    constructor() {
        this.token = sessionStorage.getItem('token');
        const apiUrl = 'https://www.main-bvxea6i-egndfhevug7ok.fr-3.platformsh.site/';
        this.usersRoutes = new UsersRoutes(apiUrl, this.token);
        this.photosRoutes = new PhotosRoutes(apiUrl, this.token)
        this.messagesRoutes = new MessagesRoutes(apiUrl, this.token)
        this.interactionsRoutes = new InteractionsRoutes(apiUrl, this.token)
        this.initialize();
        this.addEventListeners();
    }

    async initialize() {
        this.userID = await this.isUserLoggedIn()
        await this.fetchMatches()

        const url = window.location.href;
        const regex = /\?(\d+)/;
        const match = regex.exec(url);
        this.otherUserID = match ? match[1] : null;
        if(this.otherUserID){
            this.loadMessages(this.otherUserID)
        }
    }

    async fetchMatches() {
        try {
            const matches = await this.interactionsRoutes.getMatches(this.userID);

            console.log("fetchMatches(): ", matches)

            const matchesList = document.getElementById('matchesList');

            matchesList.innerHTML = '';

            if (matches.length > 0) {
                await this.loadMessages(matches[0].id, matches[0].nickname);
            }

            matches.forEach(match => {
                const listItem = document.createElement('li');
                listItem.textContent = match.nickname;
                listItem.dataset.userId = match.id;
                listItem.dataset.nickname = match.nickname;
                listItem.classList.add('match-item');
                matchesList.appendChild(listItem);
            });

            const matchItems = document.querySelectorAll('.match-item');
            matchItems.forEach(item => {
                item.addEventListener('click', () => {
                    this.loadMessages(item.dataset.userId, item.dataset.nickname);
                });
            });
        } catch (error) {
            console.error('Error fetching matches: ', error);
        }
    }

    async loadMessages(userId, nickname) {
        if(userId){
            this.otherUserID = userId
        }
        console.log('Loading messages for user: ', this.otherUserID);
        if(!nickname){
            const user = await this.usersRoutes.getUser(this.otherUserID)
            nickname = user.nickname
        }
        document.getElementById("nickname").textContent = nickname;
        document.getElementById('userPhoto').src = await this.photosRoutes.getUserPhotos(this.otherUserID)

        const messages = await this.messagesRoutes.getMessages(this.userID, this.otherUserID);

        const messageContainer = document.getElementById('messageContainer');

        messageContainer.innerHTML = '';

        messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message');

            const senderElement = document.createElement('div');
            if (message.sender_id === this.userID) {
                senderElement.textContent = 'Vous: ';
                messageElement.classList.add('sent-by-current-user');
            } else {
                senderElement.textContent = nickname + ': ';
                messageElement.classList.add('sent-by-other-user');
            }

            senderElement.classList.add('message-sender');
            messageElement.appendChild(senderElement);

            const contentElement = document.createElement('div');
            contentElement.textContent = message.content;
            contentElement.classList.add('message-content');
            messageElement.appendChild(contentElement);

            messageContainer.appendChild(messageElement);
        });
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }

    addEventListeners(){
        this.bindFooter()
        this.bindHeader()

        document.getElementById('sendButton').addEventListener('click', async () => {
            const messageInput = document.getElementById('messageInput').value;
            if (messageInput.trim() !== '') {
                await this.messagesRoutes.sendMessage(this.userID, this.otherUserID, messageInput);
                await this.loadMessages(this.otherUserID);
                document.getElementById('messageInput').value = '';
            }
        });

        document.getElementById('user-info')
            .addEventListener('click', () => {
                window.location.href = "index.html?" + this.otherUserID;
            })
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


window.messagesController = new MessagesController()
