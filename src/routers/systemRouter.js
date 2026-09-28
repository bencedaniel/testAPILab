import express from 'express';
import { importDeviceInventory } from '../controllers/systemController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

/**
 * @swagger
 * /api/system/import:
 *   post:
 *     summary: Eszközlista tömeges importálása
 *     description: Több eszköz adatainak egyidejű feltöltése a nyilvántartásba.
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               devices:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     serial:
 *                       type: string
 *     responses:
 *       200:
 *         description: Sikeres importálás.
 *       500:
 *         description: Hiba a feldolgozás során.
 */
router.post('/import', importDeviceInventory);

export default router;