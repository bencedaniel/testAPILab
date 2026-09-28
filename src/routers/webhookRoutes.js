import express from 'express';
import { registerWebhookVulnerable } from '../controllers/webhookController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

/**
 * @swagger
 * /api/webhooks/register:
 *   post:
 *     summary: Új webhook regisztrálása
 *     description: Értesítési végpont beállítása. A rendszer azonnal küld egy HTTP GET tesztkérést a megadott URL-re a kapcsolat ellenőrzése céljából.
 *     tags: [Webhooks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               targetUrl:
 *                 type: string
 *                 format: uri
 *                 example: "https://sajat-szerverem.hu/api/webhook-fogado"
 *     responses:
 *       200:
 *         description: Webhook sikeresen ellenőrizve és regisztrálva.
 *       400:
 *         description: Hiányzó targetUrl paraméter.
 *       401:
 *         description: Hiányzó vagy érvénytelen hitelesítési token.
 *       500:
 *         description: A megadott webhook URL nem elérhető.
 */
router.post('/register', registerWebhookVulnerable);

export default router;