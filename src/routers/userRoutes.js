// src/routers/userRoutes.js
import express from 'express';
import { getUserProfileVulnerable, getMyProfileSecure } from '../controllers/userController.js'; 
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

export default router;