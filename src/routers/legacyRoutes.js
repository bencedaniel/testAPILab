import express from 'express';
import { getLegacyUsersVulnerable } from '../controllers/legacyController.js';

const router = express.Router();

// FIGYELEM: Itt szándékosan HIÁNYZIK az authenticateToken middleware! 
// Ez a végpont teljesen nyitott a külvilág felé.

/**
 * @swagger
 * /api/v1/users/list:
 *   get:
 *     summary: Felhasználói lista (Elavult v1 API)
 *     description: Visszaadja a rendszer összes felhasználóját. Ez egy korábbi API verzió, amelyet hamarosan kivezetünk.
 *     tags: [Legacy]
 *     responses:
 *       200:
 *         description: Sikeres lekérdezés.
 *       500:
 *         description: Szerverhiba.
 */
router.get('/users/list', getLegacyUsersVulnerable);




export default router;