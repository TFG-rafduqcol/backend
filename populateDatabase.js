const Game = require('./models/game');
const FriendShips = require('./models/friendShip');
const User = require('./models/user');
const Avatar = require('./models/avatar');
const Range = require('./models/range');
const Tower = require('./models/tower');
const Projectile = require('./models/projectile');

const Avatars = [
    { id: 1, image_url: 'http://192.168.100.7:8000/www/images/avatars/avatar_1.jpeg' },
    { id: 2, image_url: 'http://192.168.100.7:8000/www/images/avatars/avatar_2.png' },
    { id: 3, image_url: 'http://192.168.100.7:8000/www/images/avatars/avatar_3.png' },
    { id: 4, image_url: 'http://192.168.100.7:8000/www/images/avatars/avatar_4.png' },
    { id: 5, image_url: 'http://192.168.100.7:8000/www/images/avatars/avatar_5.png' },
    { id: 6, image_url: 'http://192.168.100.7:8000/www/images/avatars/avatar_6.png' },
    { id: 7, image_url: 'http://192.168.100.7:8000/www/images/avatars/avatar_7.png' },
    { id: 8, image_url: 'http://192.168.100.7:8000/www/images/avatars/avatar_8.png' },
    { id: 9, image_url: 'http://192.168.100.7:8000/www/images/avatars/avatar_9.png' },
    { id: 10, image_url: 'http://192.168.100.7:8000/www/images/avatars/avatar_10.png' },
    { id: 11, image_url: 'http://192.168.100.7:8000/www/images/avatars/avatar_11.png' },
];

const Ranges = [
    { id: 1, name: 'Master', image_url: 'http://192.168.100.7:8000/www/images/master.png' },
];


const usersData = [
    {
        firstName: 'Rafa',
        lastName: 'Duque',
        username: 'Gafa',
        email: 'gafa@email.com',
        password: '$2b$10$.WahX65e87xtCCrcbV5l8ufr/e7pAnXXapSb.xXyB7BHkI1leKq7W',
        experience: 5000,
        gold: 100,
        gems: 20,
        gameId: 1,
        activeAvatarId: 1, 
        rangeId: 1,

    },
    {
        firstName: 'Player2',
        lastName: 'Player2',
        username: 'Player2',
        email: 'player2@email.com',
        password: '$2b$10$.WahX65e87xtCCrcbV5l8ufr/e7pAnXXapSb.xXyB7BHkI1leKq7W',
        experience: 10000,
        gold: 200,
        gems: 50,
        gameId: 2,
        activeAvatarId: 2,
        rangeId: 1,

    },
    {
        firstName: 'Player3',
        lastName: 'Player3',
        username: 'Player3',
        email: 'player3@email.com',
        password: '$2b$10$.WahX65e87xtCCrcbV5l8ufr/e7pAnXXapSb.xXyB7BHkI1leKq7W',
        experience: 14000,
        gold: 150,
        gems: 30,
        gameId: 3,
        activeAvatarId: 3, 
        rangeId: 1,

    },
    {
        firstName: 'Player4',
        lastName: 'Player4',
        username: 'Player4',
        email: 'player4@email.com',
        password: '$2b$10$.WahX65e87xtCCrcbV5l8ufr/e7pAnXXapSb.xXyB7BHkI1leKq7W',
        experience: 16000,
        gold: 120,
        gems: 25,
        gameId: 4,
        activeAvatarId: 4, 
        rangeId: 1,

    },
    {
        firstName: 'Player5',
        lastName: 'Player5',
        username: 'Player5',
        email: 'player5@email.com',
        password: '$2b$10$.WahX65e87xtCCrcbV5l8ufr/e7pAnXXapSb.xXyB7BHkI1leKq7W',
        experience: 20000,
        gold: 130,
        gems: 40,
        gameId: 5,
        activeAvatarId: 5,
        rangeId: 1,

    },
    {
        firstName: 'Player6',
        lastName: 'Player6',
        username: 'Player6',
        email: 'player6@email.com',
        password: '$2b$10$.WahX65e87xtCCrcbV5l8ufr/e7pAnXXapSb.xXyB7BHkI1leKq7W',
        experience: 21000,
        gold: 110,
        gems: 15,
        gameId: 6,
        activeAvatarId: 1,
        rangeId: 1,

    },
    {
        firstName: 'Player7',
        lastName: 'Player7',
        username: 'Player7',
        email: 'player7@email.com',
        password: '$2b$10$.WahX65e87xtCCrcbV5l8ufr/e7pAnXXapSb.xXyB7BHkI1leKq7W',
        experience: 6500,
        gold: 180,
        gems: 60,
        gameId: 7,
        activeAvatarId: 2, 
        rangeId: 1,
    },
    {
        firstName: 'Player8',
        lastName: 'Player8',
        username: 'Player8',
        email: 'player8@email.com',
        password: '$2b$10$.WahX65e87xtCCrcbV5l8ufr/e7pAnXXapSb.xXyB7BHkI1leKq7W',
        experience: 18000,
        gold: 250,
        gems: 80,
        gameId: 8,
        activeAvatarId: 3, 
        rangeId: 1,

    },
    {
        firstName: 'Admin',
        lastName: 'Admin',
        username: 'Admin',
        email: 'Admin@email.com',
        password: '$2b$10$.WahX65e87xtCCrcbV5l8ufr/e7pAnXXapSb.xXyB7BHkI1leKq7W',
        experience: 2000,
        gold: 0,
        gems: 0,
        isAdmin: 1,
        activeAvatarId: 1,
        rangeId: 1,

    },
];

const gamesData = [
    { id: 1, map: 'http://192.168.100.7:8000/www/images/MapaAzteka.png', path: 'path', round: 1, UserId: 1 },
    { id: 2, map: 'http://192.168.100.7:8000/www/images/MapaAzteka.png', path: 'path', round: 1, UserId: 2 },
];


const friendshipsData = [
    { user1Id: 1, user2Id: 2, status: 'pending' },
    { user1Id: 1, user2Id: 3, status: 'accepted' },
    { user1Id: 1, user2Id: 4, status: 'pending' },
    { user1Id: 1, user2Id: 5, status: 'accepted' },
    { user1Id: 1, user2Id: 6, status: 'accepted' },
    { user1Id: 1, user2Id: 7, status: 'accepted' },
    { user1Id: 1, user2Id: 8, status: 'accepted' },
    { user1Id: 8, user2Id: 2, status: 'rejected' },
];


const UserAvatars = [
    { userId: 1, avatarId: 1 },
    { userId: 1, avatarId: 2 },
    { userId: 1, avatarId: 3 },
    { userId: 1, avatarId: 4 },
    { userId: 1, avatarId: 5 },
    { userId: 1, avatarId: 6 },
    { userId: 1, avatarId: 7 },
    { userId: 1, avatarId: 8 },
    { userId: 1, avatarId: 9 },
    { userId: 1, avatarId: 10 },
    { userId: 1, avatarId: 11 },

    { userId: 2, avatarId: 1 },
    { userId: 3, avatarId: 2 },
    { userId: 4, avatarId: 3 },
    { userId: 5, avatarId: 4 },
    { userId: 6, avatarId: 5 },
    { userId: 7, avatarId: 1 },
    { userId: 8, avatarId: 2 },
];

const projectilesData = [
    { id: 1, name: 'bullet', damage: 15, speed: 6, stroke: 'ICE', avatarId: 1 },
    { id: 2, name: 'magic_ball', damage: 20, speed: 8, stroke: 'FIRE', avatarId: 2 },
    { id: 3, name: 'bomb', damage: 25, speed: 4, stroke: 'MAGIC', avatarId: 3 },
];
const towersData = [
    { id: 1, name: 'canon', damage: 10, cost: 100, fire_rate: 1, range: 0.4, position: 1, gameId: 1, projectileId: 1 },
    { id: 2, name: 'canon', damage: 12, cost: 125, fire_rate: 0.8, range: 0.5, position: 5, gameId: 2, projectileId: 2 },
    { id: 3, name: 'mortar', damage: 15, cost: 150, fire_rate: 0.3, range: 0.6, position: 6, gameId: 2, projectileId: 3 },
];

 



const populateDatabase = async () => {
    try {
       
        // Create the ranges
        const ranges = await Range.bulkCreate(Ranges, { returning: true });
        console.log('Ranges created:', ranges.length);

        //Cretae the avatars
        const avatars = await Avatar.bulkCreate(Avatars, { returning: true });
        console.log('Avatars created:', avatars.length);

        // Create the users
        const users = await User.bulkCreate(usersData, { returning: true });
        console.log('Users created:', users.length);

         // Create the games
         const games = await Game.bulkCreate(gamesData, { returning: true });
         console.log('Games created:', games.length); 

        // Create the friendships between users
        const friendships = await FriendShips.bulkCreate(friendshipsData, { returning: true });
        console.log('Friendships created:', friendships.length);

        // Create the projectiles
        const projectiles = await Projectile.bulkCreate(projectilesData, { returning: true });
        console.log('Projectiles created:', projectiles.length);

        // Create the towers
        const towers = await Tower.bulkCreate(towersData, { returning: true });
        console.log('Towers created:', towers.length);

        // Assign the avatars to the users
        for (let i = 0; i < UserAvatars.length; i++) {
            const { userId, avatarId } = UserAvatars[i];
            const user = await User.findByPk(userId);
            await user.addAvatar(avatarId);
          }

        // Assign active avatar to the users


        

       

    } catch (error) {
        console.error('Error populating the database:', error);
    }
};

module.exports = populateDatabase;