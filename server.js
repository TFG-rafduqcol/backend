const express = require('express');
const path = require('path');
const cors = require('cors');
const sequelize = require('./config/db');
const swaggerSpec = require('./config/swagger');
const swaggerUi = require('swagger-ui-express');
const bodyParser = require('body-parser');

// Models
const models = require('./models');

const populateDatabase = require('./populateDatabase'); 


const app = express();

app.use(cors({
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
    origin: '*', 
}));

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.json());

// Route para swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Routes
const authRoutes = require('./routes/authRoute'); 
app.use('/api/auth/', authRoutes);

const adminRoutes = require('./routes/adminRoute');
app.use('/api/admin/', adminRoutes);

const socialRoutes = require('./routes/socialRoute');
app.use('/api/social/', socialRoutes);

const avatarRoutes = require('./routes/avatarRoute');
app.use('/api/avatars/', avatarRoutes);

const gameRoutes = require('./routes/gameRoute');
app.use('/api/games/', gameRoutes);

const towerRoutes = require('./routes/towerRoute');
app.use('/api/towers/', towerRoutes);

app.use(express.static(path.join(__dirname, 'public')));


const imageRoutes = require('./routes/imageRoute');
app.use('/api/images/', imageRoutes);



app.get('/', (req, res) => {
    res.send('Servidor corriendo');
});

if (require.main === module) {
    sequelize.drop() 
        .then(() => {
            return sequelize.sync({ alter: true }); 
        })
        .then(() => {
            console.log("✅ Database synchronized and tables recreated");


            return populateDatabase();
        })
        .then(() => {
            const PORT = 3000;
            app.listen(PORT, () => {
                console.log(`🚀 Servidor corriendo en http://127.0.0.1:${PORT}`);
                console.log('Swagger UI available at: http://localhost:3000/api-docs');
            });
        })
        .catch(err => {
            console.error("❌ Error syncing or populating the database:", err);
        });
}

module.exports = app;