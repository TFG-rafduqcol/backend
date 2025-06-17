const Game = require('./models/game');
const FriendShips = require('./models/friendShip');
const User = require('./models/user');
const Avatar = require('./models/avatar');
const Range = require('./models/range');
const Tower = require('./models/tower');
const Projectile = require('./models/projectile');
const Enemy = require('./models/enemy');
const Stats = require('./models/stats');

const Avatars = [
    { id: 1, image_url: '/images/avatars/avatar_1.jpeg' },
    { id: 2, image_url: '/images/avatars/avatar_2.png' },
    { id: 3, image_url: '/images/avatars/avatar_3.png' },
    { id: 4, image_url: '/images/avatars/avatar_4.png' },
    { id: 5, image_url: '/images/avatars/avatar_5.png' },
    { id: 6, image_url: '/images/avatars/avatar_6.png' },
    { id: 7, image_url: '/images/avatars/avatar_7.png' },
    { id: 8, image_url: '/images/avatars/avatar_8.png' },
    { id: 9, image_url: '/images/avatars/avatar_9.png' },
    { id: 10, image_url: '/images/avatars/avatar_10.png' },
    { id: 11, image_url: '/images/avatars/avatar_11.png' },
];


// const Avatars = [
//     { id: 1, image_url: 'http://127.0.0.1:8000/www/images/avatars/avatar_1.jpeg' },
//     { id: 2, image_url: 'http://127.0.0.1:8000/www/images/avatars/avatar_2.png' },
//     { id: 3, image_url: 'http://127.0.0.1:8000/www/images/avatars/avatar_3.png' },
//     { id: 4, image_url: 'http://127.0.0.1:8000/www/images/avatars/avatar_4.png' },
//     { id: 5, image_url: 'http://127.0.0.1:8000/www/images/avatars/avatar_5.png' },
//     { id: 6, image_url: 'http://127.0.0.1:8000/www/images/avatars/avatar_6.png' },
//     { id: 7, image_url: 'http://127.0.0.1:8000/www/images/avatars/avatar_7.png' },
//     { id: 8, image_url: 'http://127.0.0.1:8000/www/images/avatars/avatar_8.png' },
//     { id: 9, image_url: 'http://127.0.0.1:8000/www/images/avatars/avatar_9.png' },
//     { id: 10, image_url: 'http://127.0.0.1:8000/www/images/avatars/avatar_10.png' },
//     { id: 11, image_url: 'http://127.0.0.1:8000/www/images/avatars/avatar_11.png' },
// ];

const Ranges = [
    { id: 1, name: 'Master', image_url: '/images/master.png' },
    { id: 2, name: 'Gold', image_url: '/images/gold.png' },
    { id: 3, name: 'Silver', image_url: '/images/silver.png' },

];


const usersData = [
    {
        firstName: 'Rafa',
        lastName: 'Duque',
        username: 'Rafa',
        email: 'rafa@email.com',
        password: '$2b$10$.WahX65e87xtCCrcbV5l8ufr/e7pAnXXapSb.xXyB7BHkI1leKq7W',
        experience: 5000,
        gold: 100,
        gems: 20,
        gameId: 1,
        activeAvatarId: 1, 
        rangeId: 3,

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
        rangeId: 2,

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
        rangeId: 3,

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
        rangeId: 2,

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
        rangeId: 3,
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
        email: 'admin@email.com',
        password: '$2b$10$.WahX65e87xtCCrcbV5l8ufr/e7pAnXXapSb.xXyB7BHkI1leKq7W',
        experience: 2000,
        gold: 0,
        gems: 0,
        isAdmin: 1,
        activeAvatarId: 1,
        rangeId: 2,

    },
];

const gamesData = [
    { id: 1, map: 'http://127.0.0.1:8000/www/images/MapaAzteka.png', path: 'path', round: 1, UserId: 1 },
    { id: 2, map: 'http://127.0.0.1:8000/www/images/MapaAzteka.png', path: 'path', round: 1, UserId: 2 },
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

    { userId: 2, avatarId: 1 },
    { userId: 3, avatarId: 2 },
    { userId: 4, avatarId: 3 },
    { userId: 5, avatarId: 4 },
    { userId: 6, avatarId: 5 },
    { userId: 7, avatarId: 1 },
    { userId: 8, avatarId: 2 },
];

const projectilesData = [
    { id: 1, name: 'stone', speed: 6 },
    { id: 2, name: 'iron', speed: 8 },
    { id: 3, name: 'fire', speed: 4 },
    { id: 4, name: 'rock',  speed: 4 },
];


const enemiesData = [
    { id: 1, name: 'daggerkin',  health: 40, speed: 30, lifes: 1, gold: 10 },
    { id: 2, name: 'orcutter', health: 60, speed: 15, lifes: 1, gold: 12 },
    { id: 3, name: 'oculom',  health: 40, speed: 25, lifes: 1, gold: 10 },
    { id: 4, name: 'devilOrc', health: 90, speed: 12, lifes: 1, gold: 15 },
    { id: 5, name: 'graySkull',  health: 140, speed: 8, lifes: 3, gold: 25 },
    { id: 6, name: 'carrionTropper',  health: 90, speed: 14, lifes: 2, gold: 2 },
    { id: 7, name: 'hellBat',  health: 80, speed: 17, lifes: 2, gold: 15 },
    { id: 8, name: 'hexLord', health: 90, speed: 17, lifes: 4, gold: 20 },
    { id: 9, name: 'darkSeer',  health: 140, speed: 10, lifes: 5, gold: 30 },
];

    

const statsData = [
  {
    userId: 1,
    enemies_killed: 150,
    towers_placed: 45,
    gold_earned: 12000,
    gems_earned: 30,
    rounds_passed: 25,
    games_played: 10
  },
  {
    userId: 2,
    enemies_killed: 80,
    towers_placed: 20,
    gold_earned: 6000,
    gems_earned: 10,
    rounds_passed: 12,
    games_played: 5
  },
  {
    userId: 3,
    enemies_killed: 300,
    towers_placed: 70,
    gold_earned: 20000,
    gems_earned: 50,
    rounds_passed: 40,
    games_played: 20
  },
  {
    userId: 4,
    enemies_killed: 0,
    towers_placed: 5,
    gold_earned: 800,
    gems_earned: 0,
    rounds_passed: 2,
    games_played: 1
  },
  {
    userId: 5,
    enemies_killed: 120,
    towers_placed: 33,
    gold_earned: 10000,
    gems_earned: 25,
    rounds_passed: 18,
    games_played: 9
  }
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

        const enemies = await Enemy.bulkCreate(enemiesData, { returning: true });
        console.log('Enemies created:', enemies.length);

        // Assign the avatars to the users
        for (let i = 0; i < UserAvatars.length; i++) {
            const { userId, avatarId } = UserAvatars[i];
            const user = await User.findByPk(userId);
            await user.addAvatar(avatarId);
          }

        const stats = await Stats.bulkCreate(statsData, { returning: true });
        console.log('Stats created:', stats.length);

    } catch (error) {
        console.error('Error populating the database:', error);
    }
};

module.exports = populateDatabase;