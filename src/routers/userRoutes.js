import express from 'express';
// Bővített import a biztonságos profilkezelő funkciókkal
import { 
    getUserProfileVulnerable, 
    getMyProfileSecure,
    updateMyProfileSecure,
    deleteMyProfileSecure
} from '../controllers/userController.js'; 
import { authenticateToken } from '../middleware/auth.js'; 
const router = express.Router();

router.use(authenticateToken); 

/**
 * @swagger
 * /api/users/me/secure:
 *   get:
 *     summary: Saját profil lekérése
 *     description: Visszaadja az aktuálisan bejelentkezett felhasználó részletes profiladatait a megadott hitelesítési token alapján.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sikeres lekérdezés. Visszaadja a felhasználó profilját.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *       401:
 *         description: Hiányzó vagy érvénytelen hitelesítési token.
 *       404:
 *         description: A felhasználó nem található.
 */
router.get('/me/secure', getMyProfileSecure); 

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Adott felhasználó profiljának lekérése
 *     description: Visszaadja a megadott egyedi azonosítóhoz (ID) tartozó felhasználó részletes adatait.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: A lekérdezendő felhasználó egyedi azonosítója.
 *     responses:
 *       200:
 *         description: Sikeres lekérdezés.
 *       401:
 *         description: Hiányzó vagy érvénytelen hitelesítési token.
 *       404:
 *         description: A megadott azonosítóval nem található felhasználó.
 *       500:
 *         description: Belső szerverhiba.
 */
router.get('/:id', getUserProfileVulnerable);

import express from 'express';
// Bővített import a biztonságos funkciókkal
import { 
    getAllDevices, 
    deleteDeviceVulnerable, 
    reserveDeviceVulnerable,
    createDeviceSecure,
    getDeviceByIdSecure,
    updateDeviceSecure,
    deleteDeviceSecure
} from '../controllers/deviceController.js';
import { authenticateToken } from '../middleware/auth.js';


router.use(authenticateToken);

// ... (Itt vannak a korábbi végpontok: GET /, DELETE /admin/:id, POST /:id/reserve) ...

/**
 * @swagger
 * /api/devices/secure:
 *   post:
 *     summary: Új eszköz regisztrálása (Biztonságos)
 *     description: Létrehoz egy új eszközt a nyilvántartásban. A végpont védett a Mass Assignment támadások ellen.
 *     tags: [Devices (Secure CRUD)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               serialNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: Eszköz sikeresen létrehozva.
 *       400:
 *         description: Érvénytelen vagy hiányzó bemeneti adatok.
 */
router.post('/secure', createDeviceSecure);

/**
 * @swagger
 * /api/devices/secure/{id}:
 *   get:
 *     summary: Egyetlen eszköz lekérése (Biztonságos)
 *     description: Visszaadja a megadott azonosítójú eszköz részleteit.
 *     tags: [Devices (Secure CRUD)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sikeres lekérdezés.
 *       404:
 *         description: Eszköz nem található.
 */
router.get('/secure/:id', getDeviceByIdSecure);

/**
 * @swagger
 * /api/devices/secure/{id}:
 *   put:
 *     summary: Eszköz adatainak módosítása (Adminisztrátori funkció)
 *     description: Módosítja egy létező eszköz adatait. Szigorú szerepkör-ellenőrzést alkalmaz.
 *     tags: [Devices (Secure CRUD)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, maintenance, retired, reserved]
 *     responses:
 *       200:
 *         description: Sikeres frissítés.
 *       403:
 *         description: Nincs jogosultságod a művelethez (RBAC védelem).
 *       404:
 *         description: Eszköz nem található.
 */
router.put('/secure/:id', updateDeviceSecure);

/**
 * @swagger
 * /api/devices/secure/{id}:
 *   delete:
 *     summary: Eszköz törlése (Adminisztrátori funkció)
 *     description: Töröl egy eszközt a rendszerből. Helyesen implementált BFLA védelemmel.
 *     tags: [Devices (Secure CRUD)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sikeres törlés.
 *       403:
 *         description: Nincs jogosultságod a művelethez (RBAC védelem).
 *       404:
 *         description: Eszköz nem található.
 */
router.delete('/secure/:id', deleteDeviceSecure);






/**
 * @swagger
 * /api/users/me/secure:
 *   put:
 *     summary: Saját profil frissítése (Biztonságos)
 *     description: A bejelentkezett felhasználó módosíthatja az alapvető adatait. A végpont BOLA és BOPLA ellen is védett (nem engedi a 'role' felülírását).
 *     tags: [Users (Secure CRUD)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profil sikeresen frissítve.
 *       400:
 *         description: Érvénytelen bemeneti adatok.
 */
router.put('/me/secure', updateMyProfileSecure);

/**
 * @swagger
 * /api/users/me/secure:
 *   delete:
 *     summary: Saját fiók törlése (Biztonságos)
 *     description: Véglegesen törli a bejelentkezett felhasználó fiókját a token alapján.
 *     tags: [Users (Secure CRUD)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fiók sikeresen törölve.
 *       500:
 *         description: Belső szerverhiba.
 */
router.delete('/me/secure', deleteMyProfileSecure);

export default router;