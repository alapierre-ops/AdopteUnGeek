class InteractionsRoutes {
    constructor(apiUrl, token) {
        console.log("InteractionsRoutes : apiUrl == " + apiUrl);
        this.apiUrl = apiUrl + "/interactions";
        this.token = token
    }

    async addInteraction(userWhoInteracted, userShown, liked) {
        const date = new Date();
        console.log("addInteraction() : date == " + date + "userWhoInteracted == " + userWhoInteracted + " & userShown == " + userShown + " & liked == " + liked);
        return new Promise((resolve, reject) => fetch(`${this.apiUrl}/`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.token
            },
            body: JSON.stringify({ date, userWhoInteracted, userShown, liked })
        }).then(res => {
            if (res.status === 200) {
                console.log("addInteraction(): No error detected");
                resolve(res.json());
            } else {
                console.log("addInteraction(): Error detected " + res.statusText + res.status);
                reject(res.status);
                throw new Error(`Failed to add interaction: ${res.status}`);
            }
        }).catch(err => reject(err)));
    }

    async getLikedMe(userID) {
        return new Promise((resolve, reject) => {
            fetch(`${this.apiUrl}/getLikedMe/${userID}`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + this.token
                }
            })
                .then(res => {
                    if (res.ok) {
                        resolve(res.json());
                    } else {
                        reject(res.status);
                        throw new Error(`Failed to fetch users: ${res.status}`);
                    }
                })
                .catch(err => reject(err));
        });
    }

    async getILiked(userID) {
        return new Promise((resolve, reject) => {
            fetch(`${this.apiUrl}/getILiked/${userID}`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + this.token
                }
            })
                .then(res => {
                    if (res.ok) {
                        resolve(res.json());
                    } else {
                        reject(res.status);
                        throw new Error(`Failed to fetch users: ${res.status}`);
                    }
                })
                .catch(err => reject(err));
        });
    }

    async getMatches(userID) {
        return new Promise((resolve, reject) => {
            fetch(`${this.apiUrl}/getMatches/${userID}`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + this.token
                }
            })
                .then(res => {
                    if (res.ok) {
                        resolve(res.json());
                    } else {
                        reject(res.status);
                        throw new Error(`Failed to fetch users: ${res.status}`);
                    }
                })
                .catch(err => reject(err));
        });
    }

    async getNextUser(userID, shownUserIds) {
        console.log("getNextUser(): shownUserIds == " + shownUserIds);
        return new Promise((resolve, reject) => {
            fetch(`${this.apiUrl}/nextUser/${userID}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.token
                },
                body: JSON.stringify(shownUserIds)
            })
                .then(res => {
                    if (res.ok) {
                        resolve(res.json());
                    } else {
                        reject(res.status);
                        throw new Error(`Failed to fetch user: ${res.status}`);
                    }
                })
                .catch(err => reject(err));
        });
    }
}