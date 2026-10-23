import { Router } from 'express';
import {
  mechanicController,
  nearbyMechanicsQuerySchema,
  updateLocationBodySchema,
} from '../controllers/mechanicController';
import { validateBody, validateQuery } from '../middlewares/validate';

const router = Router();

// GET /api/v1/mechanics/nearby
router.get('/nearby', validateQuery(nearbyMechanicsQuerySchema), (req, res, next) => {
  mechanicController.getNearby(req, res, next);
});

// PATCH /api/v1/mechanics/location
router.patch('/location', validateBody(updateLocationBodySchema), (req, res, next) => {
  mechanicController.updateLocation(req, res, next);
});

// GET /api/v1/mechanics
router.get('/', (req, res, next) => {
  mechanicController.getAll(req, res, next);
});

// GET /api/v1/mechanics/:id
router.get('/:id', (req, res, next) => {
  mechanicController.getById(req, res, next);
});

export default router;
