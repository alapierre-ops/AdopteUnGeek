const Users = require('../Tables/users')
const Interactions = require('../Tables/interactions')
const Messages = require('../Tables/messages')
const Photos = require('../Tables/photos')
const axios = require('axios');

module.exports = (usersService, interactionsService, messagesService, photosService) => {
    return new Promise(async (resolve, reject) => {
        try {
            await interactionsService.dao.db.query("CREATE TABLE IF NOT EXISTS interactions(id SERIAL PRIMARY KEY, date DATE, userWhoInteracted INTEGER, userShown INTEGER, liked BOOLEAN )")
            await usersService.usersDAO.db.query("CREATE TABLE IF NOT EXISTS users(id SERIAL PRIMARY KEY, nickname TEXT, email TEXT, password TEXT, bio TEXT, birthdate DATE, gender TEXT, tags TEXT, interestedIn TEXT, filter_agemin TEXT, filter_agemax TEXT, filter_dismax TEXT, city TEXT)")
            await photosService.dao.db.query("CREATE TABLE IF NOT EXISTS photos(id SERIAL PRIMARY KEY, user_id TEXT, photo_data bytea )")
            await messagesService.dao.db.query("CREATE TABLE IF NOT EXISTS messages(id SERIAL PRIMARY KEY, sender_id TEXT, receiver_id TEXT, sent_at DATE, content TEXT )")

            async function seedUsers() {
                const users = [
                    {
                        nickname: "LeGeek123",
                        email: "legeek123@example.com",
                        password: "password123",
                        bio: "Passionné de jeux vidéo et de science-fiction. Toujours prêt pour une nouvelle aventure geek!",
                        birthdate: "1992-05-15",
                        gender: "male",
                        tags: "Jeux vidéos,Science-fiction,Manga",
                        interestedIn: "both",
                        filter_agemin: "18",
                        filter_agemax: "80",
                        filter_dismax: "150",
                        city: "Paris"
                    },
                    {
                        nickname: "MangaFan92",
                        email: "mangafan92@example.com",
                        password: "password123",
                        bio: "Amateur de manga et de culture japonaise. J'aime découvrir de nouvelles séries et discuter avec d'autres passionnés.",
                        birthdate: "1994-09-22",
                        gender: "female",
                        tags: "Manga,Anime,Fantasy",
                        interestedIn: "both",
                        filter_agemin: "18",
                        filter_agemax: "80",
                        filter_dismax: "150",
                        city: "Lyon"
                    },
                    {
                        nickname: "CinephileGeek",
                        email: "cinephilegeek@example.com",
                        password: "password123",
                        bio: "Grand fan de cinéma et de séries TV. J'adore les films de super-héros et les thrillers psychologiques.",
                        birthdate: "1988-11-05",
                        gender: "male",
                        tags: "Cinéma,Science-fiction,Comics",
                        interestedIn: "both",
                        filter_agemin: "18",
                        filter_agemax: "80",
                        filter_dismax: "150",
                        city: "Marseille"
                    },
                    {
                        nickname: "TechnoLover",
                        email: "technolover@example.com",
                        password: "password123",
                        bio: "Ingénieur en informatique, passionné de technologie et de gadgets. Toujours à la recherche de la dernière nouveauté tech.",
                        birthdate: "1990-02-12",
                        gender: "female",
                        tags: "Technologie,Programmation,Intelligence artificielle",
                        interestedIn: "both",
                        filter_agemin: "18",
                        filter_agemax: "80",
                        filter_dismax: "150",
                        city: "Toulouse"
                    },
                    {
                        nickname: "BoardGameKing",
                        email: "boardgameking@example.com",
                        password: "password123",
                        bio: "Aficionado des jeux de société et des soirées entre amis. Toujours partant pour une partie de Catan ou de Carcassonne.",
                        birthdate: "1986-04-28",
                        gender: "male",
                        tags: "Jeu de rôle (RP),Jeux vidéos,Manga",
                        interestedIn: "both",
                        filter_agemin: "18",
                        filter_agemax: "80",
                        filter_dismax: "150",
                        city: "Bordeaux"
                    },
                    {
                        nickname: "ScienceNerd",
                        email: "sciencenerd@example.com",
                        password: "password123",
                        bio: "Chercheur en biologie, passionné par les mystères de la vie et de l'univers. J'aime partager des découvertes scientifiques fascinantes.",
                        birthdate: "1995-07-19",
                        gender: "female",
                        tags: "Science-fiction,Technologie,Histoire",
                        interestedIn: "both",
                        filter_agemin: "18",
                        filter_agemax: "80",
                        filter_dismax: "150",
                        city: "Strasbourg"
                    },
                    {
                        nickname: "RetroGamer",
                        email: "retrogamer@example.com",
                        password: "password123",
                        bio: "Fan de jeux vidéo rétro et collectionneur de consoles vintage. Nostalgique des années 80 et 90.",
                        birthdate: "1983-06-14",
                        gender: "male",
                        tags: "Jeux vidéos,Cinéma,Art",
                        interestedIn: "both",
                        filter_agemin: "18",
                        filter_agemax: "80",
                        filter_dismax: "150",
                        city: "Nice"
                    },
                    {
                        nickname: "FantasyQueen",
                        email: "fantasyqueen@example.com",
                        password: "password123",
                        bio: "Amoureuse des mondes fantastiques, des dragons et des quêtes épiques. Toujours plongée dans un livre ou un jeu de rôle.",
                        birthdate: "1991-08-03",
                        gender: "female",
                        tags: "Fantasy,Livres,Jeu de rôle (RP)",
                        interestedIn: "both",
                        filter_agemin: "18",
                        filter_agemax: "80",
                        filter_dismax: "150",
                        city: "Lille"
                    },
                    {
                        nickname: "SciFiBuff",
                        email: "scifibuff@example.com",
                        password: "password123",
                        bio: "Adorateur de science-fiction et de futurisme. Fan de Star Wars et de tout ce qui concerne l'espace et les technologies avancées.",
                        birthdate: "1989-10-25",
                        gender: "male",
                        tags: "Science-fiction,Intelligence artificielle,Comics",
                        interestedIn: "both",
                        filter_agemin: "18",
                        filter_agemax: "80",
                        filter_dismax: "150",
                        city: "Nantes"
                    },
                    {
                        nickname: "ComicBookHero",
                        email: "comicbookhero@example.com",
                        password: "password123",
                        bio: "Collectionneur de bandes dessinées et amateur de super-héros. Toujours à la recherche de la perle rare.",
                        birthdate: "1993-12-30",
                        gender: "female",
                        tags: "Comics,Art,Photographie",
                        interestedIn: "both",
                        filter_agemin: "18",
                        filter_agemax: "80",
                        filter_dismax: "150",
                        city: "Rennes"
                    }
                ];

                for (const user of users) {
                    const result = await usersService.usersDAO.db.query(
                        `INSERT INTO users (nickname, email, password, bio, birthdate, gender, tags, interestedIn, filter_agemin, filter_agemax, filter_dismax, city) 
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
                        RETURNING id`,
                        [user.nickname, user.email, user.password, user.bio, user.birthdate, user.gender, user.tags, user.interestedIn, user.filter_agemin, user.filter_agemax, user.filter_dismax, user.city]
                    );

                    const userId = result.rows[0].id;
                    const photoUrl = "https://thispersondoesnotexist.com/";
                    const photoData = await fetchImageAsBinary(photoUrl);

                    await usersService.usersDAO.db.query(
                        "INSERT INTO photos (user_id, photo_data) VALUES ($1, $2)",
                        [userId, photoData]
                    );
                }

                console.log('Seeding complete.');
            }

            async function fetchImageAsBinary(url) {
                const response = await axios.get(url, { responseType: 'arraybuffer' });
                return response.data;
            }

// Run the seed function
            seedUsers().catch(console.error);
            resolve()
        } catch (e) {
            if (e.code === "42P07") { // TABLE ALREADY EXISTS https://www.postgresql.org/docs/8.2/errcodes-appendix.html
                resolve()
            } else {
                reject(e)
            }
        }
    })
}