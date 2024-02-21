class UsersAPI {
    constructor() {
        this.apiServer = "http://localhost:3333"
    }

    fetchList(routesURL) {
        return new Promise(((resolve, reject) => {
            fetch(`${this.apiServer}${routesURL}`)
                .then(response => {
                    if (response.status === 200) {
                        resolve(response.json())
                    } else {
                        reject(response.status)
                    }
                })
                .catch(err => reject(err))
        }))
    }

    getAll() {
        return fetchJSON(`${this.apiServer}/users`)
    }
    get(id) {
        return fetchJSON(`${this.apiServer}/users/${id}`)
    }
    delete(id) {
        return fetch(`${this.apiServer}/users/${id}`, { method: 'DELETE' })
    }
    insert(user) {
        return fetch(`${this.apiServer}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        })
    }
    update(user) {
        return fetch(`${this.apiServer}/users/${user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        })
    }
}