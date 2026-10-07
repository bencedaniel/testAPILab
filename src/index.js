// Környezeti változók betöltése ES modulként
import 'dotenv/config'; 

// Alapvető csomagok importálása
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import warrantyRoutes from './routers/warrantyRoutes.js';

import connectDB from './db/db.js';
import authRoutes from './routers/authRoutes.js';
import userRoutes from './routers/userRoutes.js';
import deviceRoutes from './routers/deviceRoutes.js';
import webhookRoutes from './routers/webhookRoutes.js';
import systemRoutes from './routers/systemRoutes.js';
import legacyRoutes from './routers/legacyRoutes.js';
import morgan from 'morgan';



const app = express();
app.use(express.json());
app.use(morgan('dev')); // HTTP kérések logolása a konzolra
// Swagger-jsdoc konfiguráció
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Vulnerable API Lab',
      version: '1.0.0',
      description: 'Szándékosan sebezhető REST API az OWASP Top 10 teszteléséhez',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  // Mivel a kódodban a 'routers' mappát hivatkoztad, itt is frissíteni kell az elérési utat
  apis: ['./src/routers/*.js', './src/controllers/*.js'], 
};

// OpenAPI dokumentum generálása és Swagger UI kiszolgálása
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ÚJ SOR: Nyers OpenAPI JSON publikálása a biztonsági scanner számára
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Routerek (végpontok) bekötése
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/system', systemRoutes);
// Az app.use() szekcióba (a többi végpont alá):
app.use('/api/v1', legacyRoutes);
// Az importok közé tedd be:
// Az importok közé:

// Az app.use() szekcióba:
app.use('/api/warranty', warrantyRoutes);
// Az app.use() szekcióba (a többi router alá) tedd be:
app.use('/api/devices', deviceRoutes);
// Egyszerű állapotellenőrző (health check) végpont
app.get('/health', (req, res) => {
    res.json({ status: "Vulnerable API Lab fut!" });
});

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// Adatbázis csatlakozás és a szerver indítása
const startServer = async () => {
    try {
        // Megvárjuk, amíg az adatbázis kapcsolat felépül
        await connectDB(MONGODB_URI);
        
        // Csak sikeres DB kapcsolat után indítjuk az Express szervert
        app.listen(PORT, () => {
            console.log(`A szerver elindult a ${PORT}-es porton.`);
            console.log(`API Dokumentáció: http://localhost:${PORT}/api-docs`);
        });
    } catch (error) {
        console.error('Kritikus hiba induláskor:', error);
        process.exit(1);
    }
};

// Inicializálás
startServer();