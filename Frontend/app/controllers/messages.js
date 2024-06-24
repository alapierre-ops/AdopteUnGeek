class MessagesController extends MainController {
    constructor() {
        super(true)
        this.token = sessionStorage.getItem('token');
        const apiUrl = 'https://www.main-bvxea6i-egndfhevug7ok.fr-3.platformsh.site/api';
        this.usersRoutes = new UsersRoutes(apiUrl, this.token);
        this.photosRoutes = new PhotosRoutes(apiUrl, this.token)
        this.messagesRoutes = new MessagesRoutes(apiUrl, this.token)
        this.interactionsRoutes = new InteractionsRoutes(apiUrl, this.token)
        this.initialize();
        this.addEventListeners();
    }

    async initialize() {
        this.userID = await this.isUserLoggedIn(this.token)
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

            if (matches.length > 0) {
                await this.loadMessages(matches[0].id, matches[0].nickname);
            }
        } catch (error) {
            console.error('Error fetching matches: ', error);
        }
    }

    async loadMessages(userId, nickname) {
        this.otherUserID = userId
        console.log('Loading messages for user: ', this.otherUserID);
        if(!nickname){
            const user = await this.usersRoutes.getUser(this.otherUserID)
            nickname = user.nickname
        }
        document.getElementById("nickname").textContent = nickname;
        const messages = await this.messagesRoutes.getMessages(this.userID, this.otherUserID);
        document.getElementById('userPhoto').src = await this.photosRoutes.getUserPhotos(this.otherUserID)

        const messageContainer = document.getElementById('messageContainer');

        messageContainer.innerHTML = '';

        messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message');

            const senderElement = document.createElement('div');
            if (message.sender_id === this.userID.toString()) {
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
}


window.messagesController = new MessagesController()
