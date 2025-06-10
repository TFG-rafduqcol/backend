-- Eliminar las tablas en orden correcto
DROP TABLE IF EXISTS Enemy;
DROP TABLE IF EXISTS Horde;
DROP TABLE IF EXISTS Upgrade;
DROP TABLE IF EXISTS Projectile;
DROP TABLE IF EXISTS Tower;
DROP TABLE IF EXISTS Game;
DROP TABLE IF EXISTS User_Friends;
DROP TABLE IF EXISTS User;

CREATE TABLE User (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar JSON,
    experienceLevel INT CHECK (experienceLevel BETWEEN 1 AND 99),
    gold INT CHECK (gold BETWEEN 0 AND 1000000)
);

CREATE TABLE User_Friends (
    user_id INT,
    friend_id INT,
    PRIMARY KEY (user_id, friend_id),
    FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES User(id) ON DELETE CASCADE
);

CREATE TABLE Game (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    map VARCHAR(255) NOT NULL,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE SET NULL
);

CREATE TABLE Tower (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cost INT CHECK (cost BETWEEN 1 AND 500),
    avatar JSON,
    fire_rate DOUBLE CHECK (fire_rate BETWEEN 0.00 AND 10.00),
    attack_range DOUBLE CHECK (attack_range BETWEEN 0.00 AND 100.00)horde
);

CREATE TABLE Projectile (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    damage INT CHECK (damage BETWEEN 1 AND 999),
    speed INT CHECK (speed BETWEEN 1 AND 500),
    stroke ENUM('MAGIC', 'FIRE', 'ICE'),
    avatar VARCHAR(255),
    tower_id INT,
    FOREIGN KEY (tower_id) REFERENCES Tower(id) ON DELETE CASCADE
);

CREATE TABLE Upgrade (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cost INT CHECK (cost BETWEEN 1 AND 999),
    level INT CHECK (level BETWEEN 1 AND 999),
    damageBoost DOUBLE CHECK (damageBoost BETWEEN 0.00 AND 1.00),
    rangeBoost DOUBLE CHECK (rangeBoost BETWEEN 0.00 AND 1.00)
);

CREATE TABLE Horde (
    id INT AUTO_INCREMENT PRIMARY KEY,
    total INT CHECK (total BETWEEN 3 AND 999),
    game_id INT,
    FOREIGN KEY (game_id) REFERENCES Game(id) ON DELETE CASCADE
);

CREATE TABLE Enemy (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('GROUND', 'AIR', 'BOSS'),
    level INT CHECK (level BETWEEN 1 AND 100),
    name VARCHAR(255) NOT NULL,
    health INT CHECK (health BETWEEN 0 AND 999),
    speed INT CHECK (speed BETWEEN 0 AND 500),
    resistence ENUM('MAGIC', 'FIRE', 'ICE'),
    damage_reduction DOUBLE CHECK (damage_reduction BETWEEN 0.00 AND 1.00),
    avatar VARCHAR(255),
    wave_id INT,
    FOREIGN KEY (wave_id) REFERENCES Horde(id) ON DELETE CASCADE
);
