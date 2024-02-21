class Model {
    constructor() {
        this.api = new UsersAPI()
    }
    async getAllLists() {
        let lists = []
        for (let list of await this.api.getAll()) {
            lists.push(Object.assign(new List(), list))
            list.builddate = new Date(list.builddate)
        }
        return lists
    }
    async getList(id) {
        try {
            return (Object.assign(new List(), await this.api.get(id)))
        } catch (e) {
            if (e === 404) return null
            return undefined
        }
    }
    delete(id) {
        return this.api.delete(id).then(res => res.status)
    }
    insert(list) {
        return this.api.insert(list).then(res => res.status)
    }
    update(list) {
        return this.api.update(list).then(res => res.status)
    }
}