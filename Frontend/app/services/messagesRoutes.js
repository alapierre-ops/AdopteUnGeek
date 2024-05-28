class MessagesRoutes {
    constructor(apiUrl) {
        console.log("MessagesRoute : apiUrl == " + apiUrl)
        this.apiUrl = apiUrl+"/users";
    }

    async getMessages(currentUser, otherUser) {
        return new Promise((resolve, reject) => {
            fetch(`${this.apiUrl}/messages/${currentUser}/${otherUser}`)
                .then(res => {
                    if (res.ok) {
                        resolve(res.json());
                    }
                    else {
                        reject(res.status);
                        throw new Error(`Failed to fetch messages: ${res.status}`);
                    }
                })
                .catch(err => reject(err));
        });
    }

    async sendMessage(senderID, receiverID, content) {
        console.log("content = " , content)
        console.log("senderID = " , senderID)
        console.log("receiverID = " , receiverID)

        try {
            const response = await fetch(`${this.apiUrl}/messages/${senderID}/${receiverID}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: content })
            });
            if (!response.ok) {
                return { error: response.statusText };
            }
            if (response.status !== 204) {
                return await response.json();
            } else {
                return { success: true };
            }
        } catch (error) {
            console.error('Error updating photo:', error.message);
            return { error: error.message };
        }
    }
}