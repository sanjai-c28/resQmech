import { Router } from 'express';
import {
  acceptRequestBodySchema,
  cancelRequestBodySchema,
  createRequestBodySchema,
  requestController,
  verifyOtpBodySchema,
} from '../controllers/requestController';
import { validateBody } from '../middlewares/validate';

const router = Router();

// POST /api/v1/requests/create
router.post('/create', validateBody(createRequestBodySchema), (req, res, next) => {
  requestController.create(req, res, next);
});

// POST /api/v1/requests/:id/accept
router.post('/:id/accept', validateBody(acceptRequestBodySchema), (req, res, next) => {
  requestController.accept(req, res, next);
});

// POST /api/v1/requests/:id/verify-otp
router.post('/:id/verify-otp', validateBody(verifyOtpBodySchema), (req, res, next) => {
  requestController.verifyOtp(req, res, next);
});

// POST /api/v1/requests/:id/complete
router.post('/:id/complete', (req, res, next) => {
  requestController.complete(req, res, next);
});

// POST /api/v1/requests/:id/cancel
router.post('/:id/cancel', validateBody(cancelRequestBodySchema), (req, res, next) => {
  requestController.cancel(req, res, next);
});

// GET /api/v1/requests/:id
router.get('/:id', (req, res, next) => {
  requestController.getById(req, res, next);
});

export default router;
