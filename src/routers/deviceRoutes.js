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


const router = express.Router();

router.use(authenticateToken);

/**
 * @swagger
 * /api/devices:
 *   get:
 *     summary: Összes eszköz lekérése
 *     description: Visszaadja a nyilvántartásban szereplő eszközök listáját. Az eredmény a limit paraméterrel korlátozható.
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: A visszatérő elemek maximális száma.
 *     responses:
 *       200:
 *         description: Sikeres lekérdezés.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   type:
 *                     type: string
 *                   status:
 *                     type: string
 *       401:
 *         description: Hiányzó vagy érvénytelen hitelesítési token.
 */
router.get('/', getAllDevices);

/**
 * @swagger
 * /api/devices/admin/{id}:
 *   delete:
 *     summary: Eszköz törlése (Adminisztrátori funkció)
 *     description: Töröl egy eszközt a nyilvántartásból. Rendszergazdai jogosultságot igényel.
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: A törlendő eszköz egyedi azonosítója.
 *     responses:
 *       200:
 *         description: Eszköz sikeresen törölve.
 *       401:
 *         description: Hiányzó vagy érvénytelen hitelesítési token.
 *       403:
 *         description: Nincs megfelelő jogosultság a művelethez.
 *       404:
 *         description: Az eszköz nem található.
 */
router.delete('/admin/:id', deleteDeviceVulnerable);


/**
 * @swagger
 * /api/devices/{id}/reserve:
 *   post:
 *     summary: Eszköz lefoglalása
 *     description: Lefoglal egy aktív státuszú eszközt a raktárból a bejelentkezett felhasználó számára.
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: A lefoglalni kívánt eszköz azonosítója.
 *     responses:
 *       200:
 *         description: A foglalás sikeresen megtörtént.
 *       400:
 *         description: Az eszköz nem található vagy már le van foglalva.
 *       401:
 *         description: Hiányzó vagy érvénytelen hitelesítési token.
 */
router.post('/:id/reserve', reserveDeviceVulnerable);




/**
 * @swagger
 * /api/devices/secure:
 *   post:
 *     summary: Új eszköz regisztrálása
 *     description: Létrehoz egy új eszközt a nyilvántartásban.
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
 *     summary: Egyetlen eszköz lekérése
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
 *     description: Módosítja egy létező eszköz adatait. 
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
 *     summary: Eszköz törlése
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

export default router;