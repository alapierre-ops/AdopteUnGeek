class UsersRoutes {
    constructor(apiUrl) {
        console.log("UsersRoute : apiUrl == " + apiUrl)
        this.apiUrl = apiUrl+"/users";
    }

    async insert(userAccount) {
        const response = await fetch(`${this.apiUrl}/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userAccount)
        });
        if (!response.ok) {
            throw new Error(`Failed to insert user account: ${response.status}`);
        }
    }

    async signUp(nickname, email, password) {
        return new Promise((resolve, reject) => fetch(`${this.apiUrl}/auth/signup`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nickname, email, password })
        }).then(res => {
            if (res.status === 201) {
                console.log("signUp(): No error detected")
                resolve(res.json())
            } else {
                console.log("signUp(): Error detected")
                reject(res.status)
                throw new Error(`Failed to sign up: ${res.status}`)
            }
        }).catch(err => reject(err)))
    }

    logIn(email, password) {
        return new Promise((resolve, reject) => fetch(`${this.apiUrl}/auth/login`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        }).then(res => {
            if (res.status === 200) {
                resolve(res.json())
            } else {
                reject(res.status)
                throw new Error(`Failed to log in: ${res.status}`)
            }
        }).catch(err => reject(err)))
    }

    async verifyToken(token) {
        const response = await fetch(`${this.apiUrl}/auth/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token })
        });
        if (!response.ok) {
            throw new Error(`Failed to verify token: ${response.status}`);
        }
        return await response.json()
    }

    async getLikedMe(userID) {
        return new Promise((resolve, reject) => {
            fetch(`${this.apiUrl}/getLikedMe/${userID}`)
                .then(res => {
                    if (res.ok) {
                        resolve(res.json());
                    }
                    else {
                        reject(res.status);
                        throw new Error(`Failed to fetch users: ${res.status}`);
                    }
                })
                .catch(err => reject(err));
        });
    }

    async getILiked(userID) {
        return new Promise((resolve, reject) => {
            fetch(`${this.apiUrl}/getILiked/${userID}`)
                .then(res => {
                    if (res.ok) {
                        resolve(res.json());
                    }
                    else {
                        reject(res.status);
                        throw new Error(`Failed to fetch users: ${res.status}`);
                    }
                })
                .catch(err => reject(err));
        });
    }

    async getMatches(userID) {
        return new Promise((resolve, reject) => {
            fetch(`${this.apiUrl}/getMatches/${userID}`)
                .then(res => {
                    if (res.ok) {
                        resolve(res.json());
                    }
                    else {
                        reject(res.status);
                        throw new Error(`Failed to fetch users: ${res.status}`);
                    }
                })
                .catch(err => reject(err));
        });
    }

    async getNextUser(userID) {
        return new Promise((resolve, reject) => {
            fetch(`${this.apiUrl}/nextUser/${userID}`)
                .then(res => {
                    if (res.ok) {
                        resolve(res.json());
                    }
                    else {
                        reject(res.status);
                        throw new Error(`Failed to fetch user: ${res.status}`);
                    }
                })
                .catch(err => reject(err));
        });
    }

    async getUser(userID) {
        return new Promise((resolve, reject) => {
            fetch(`${this.apiUrl}/${userID}`)
                .then(res => {
                    if (res.ok) {
                        resolve(res.json());
                    }
                    else {
                        reject(res.status);
                        throw new Error(`Failed to fetch user: ${res.status}`);
                    }
                })
                .catch(err => reject(err));
        });
    }

    async updateUser(userId, userData) {
        console.log("updateUser(): userId == " + userId + " userData == " + userData)
        try {
            const response = await fetch(`${this.apiUrl}/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
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
            if(error.message !== "JSON.parse: unexpected end of data at line 1 column 1 of the JSON data"){
                console.error('Error updating user:', error.message);
                return { error: error.message };
            }
        }
    }

    async updatePhotos(userId, photo) {
        console.log("updatePhotos(): userId == " + userId + " photo == " + photo)

        await fetch(`${this.apiUrl}/${userId}/photos`, {
            method: 'DELETE',
        });

        try {
            const response = await fetch(`${this.apiUrl}/${userId}/photo`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'image/jpeg'
                },
                body: photo
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
            if(error.message !== "JSON.parse: unexpected end of data at line 1 column 1 of the JSON data"){
                console.error('Error updating photo:', error.message);
                return { error: error.message };
            }
        }
    }

    async getUserPhotos(userID) {
        return new Promise((resolve, reject) => {
            console.log("getUserPhotos(): userID == " + userID)
            fetch(`${this.apiUrl}/${userID}/photos`)
                .then(async res => {
                    if (res.status === 200) {
                        const blob = await res.blob();
                        resolve(URL.createObjectURL(blob));
                    }
                    else {
                        reject(res.status);
                        throw new Error(`Failed to fetch photos: ${res.status}`);
                    }
                })
                .catch(err => reject(err));
        });
    }
}