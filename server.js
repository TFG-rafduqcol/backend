const express = require('express');
const fs = require('fs');
const http = require('http');
const path = require('path');
const cors = require('cors');
const sequelize = require('./config/db');
const swaggerSpec = require('./config/swagger');
const swaggerUi = require('swagger-ui-express');
const bodyParser = require('body-parser');
const { networkInterfaces } = require('os');

// Función para obtener la dirección IP local
function getIPAddress() {
    const nets = networkInterfaces();
    
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Solo queremos IPv4 y no direcciones internas
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return '127.0.0.1'; // Fallback
}

// Models
const models = require('./models');

const populateDatabase = require('./populateDatabase'); 


const app = express();

// Configuración CORS mejorada
app.use(cors({
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
    origin: '*',
    credentials: true,
    optionsSuccessStatus: 200,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware para debug de solicitudes
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

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

const horderRoutes = require('./routes/hordeRoute');
app.use('/api/hordes/', horderRoutes);

app.use(express.static(path.join(__dirname, 'public')));


const imageRoutes = require('./routes/imageRoute');
app.use('/api/images/', imageRoutes);



app.get('/', (req, res) => {
    res.send('Servidor corriendo');
});

const PORT = process.env.PORT || 3000;

// Solo HTTP, ignora certificados
http.createServer(app).listen(PORT, () => {
    console.log(`Servidor HTTP escuchando en http://0.0.0.0:${PORT}`);
    console.log(`📱 Accede desde dispositivos en la misma red usando: http://${getIPAddress()}:${PORT}`);
    console.log('Swagger UI available at: http://localhost:3000/api-docs');
});

if (require.main === module) {
    sequelize.drop() 
        .then(() => {
            return sequelize.sync({ alter: true }); 
        })
        .then(() => {
            console.log("✅ Database synchronized and tables recreated");


            return populateDatabase();
        })        .then(() => {
            console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
            console.log(`📱 Accede desde dispositivos en la misma red usando: http://${getIPAddress()}:${PORT}`);
            console.log('Swagger UI available at: http://localhost:3000/api-docs');
        })
        .catch(err => {
            console.error("❌ Error syncing or populating the database:", err);
        });
}

module.exports = app;