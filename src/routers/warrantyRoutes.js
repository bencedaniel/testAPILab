import express from 'express';
import { checkWarrantyVulnerable, mockExternalWarrantyApi } from '../controllers/warrantyController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 1. A szimulált külső API (nincs hitelesítés, nincs Swagger doksi)
router.get('/internal-mock/warranty/:id', mockExternalWarrantyApi);

// 2. A mi saját, védett, de sebezhető végpontunk
router.use('/devices', authenticateToken);

/**
 * @swagger
 * /api/warranty/devices/{id}:
 *   get:
 *     summary: Garancia állapotának lekérdezése (Külső API hívás)
 *     description: Lekérdezi az eszköz garanciális adatait közvetlenül a gyártó rendszeréből.
 *     tags: [Warranty]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Az eszköz egyedi azonosítója.
 *     responses:
 *       200:
 *         description: Sikeres lekérdezés a partner rendszertől.
 *       401:
 *         description: Hiányzó vagy érvénytelen hitelesítési token.
 */
router.get('/devices/:id', checkWarrantyVulnerable);

export default router;