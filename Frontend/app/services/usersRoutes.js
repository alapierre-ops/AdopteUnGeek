class UsersRoutes {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
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

    async search(email) {
        const response = await fetch(`${this.apiUrl}/${email}`);
        if (!response.ok) {
            throw new Error(`Failed to search for username: ${response.status}`);
        }
        const data = await response.json();
        return data.total > 0;
    }

    async signUp(nickname, email, password) {
        const response = await fetch(`${this.apiUrl}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nickname, email, password })
        });
        if (!response.ok) {
            console.log(response.status);
            throw new Error(`Failed to sign up: ${response.status}`);
        }
        return true;
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
        return await response.json();
    }

    async logOut(token) {
        const response = await fetch(`${this.apiUrl}/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to log out: ${response.status}`);
        }
        return true;
    }
}