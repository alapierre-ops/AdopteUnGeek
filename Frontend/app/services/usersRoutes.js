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
            body: JSON.stringify({ email, password })
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
}