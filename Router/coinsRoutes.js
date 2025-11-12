import express from 'express';
const router = express.Router();
import { updateCoins, decreaseCoins, getUserCoins } from '../controllers/coinsController.js';
import { verifyToken } from '../Middleware/JWT.js';

router.post('/update', verifyToken, updateCoins);
router.post('/decrease', verifyToken, decreaseCoins);
router.get('/get', verifyToken, getUserCoins);

export default router;

