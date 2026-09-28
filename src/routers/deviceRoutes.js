import express from 'express';
import { getAllDevices } from '../controllers/deviceController.js';
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

export default router;