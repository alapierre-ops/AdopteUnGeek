class PhotosRoutes {
    constructor(apiUrl) {
        console.log("PhotosRoutes : apiUrl == " + apiUrl)
        this.apiUrl = apiUrl+"/photos";
    }

    async updatePhotos(userId, photo) {
        console.log("updatePhotos(): userId == " + userId + " photo == " + photo)

        await fetch(`${this.apiUrl}/${userId}`, {
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
            fetch(`${this.apiUrl}/${userID}`)
                .then(async res => {
                    if (res.status === 200) {
                        const blob = await res.blob();
                        resolve(URL.createObjectURL(blob));
                    } else {
                        reject(res.status);
                        throw new Error(`Failed to fetch photos: ${res.status}`);
                    }
                })
                .catch(err => reject(err));
        });
    }
}