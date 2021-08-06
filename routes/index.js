import express from 'express';
import sessionController from '../controllers';

const router = express.Router();

router.get('/startGame', sessionController.createSession)

router.get('/playGame/:id', sessionController.startPlaying)

router.get('/endGame/:id', sessionController.endSession)

module.exports = router;