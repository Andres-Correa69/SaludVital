const { Router } = require('express');
const { body, param } = require('express-validator');
const { authMiddleware } = require('../middlewares/auth.middleware');
const ctrl = require('../controllers/citas.controller');

const router = Router();

router.use(authMiddleware);

router.get('/', ctrl.listarCitas);
router.get('/:id', [param('id').isMongoId()], ctrl.obtenerCita);
router.post(
  '/',
  [
    body('paciente').isMongoId(),
    body('fecha').isISO8601(),
    body('motivo').notEmpty(),
    body('estado').optional().isIn(['pendiente', 'confirmada', 'cancelada', 'completada']),
  ],
  ctrl.crearCita
);
router.put(
  '/:id',
  [param('id').isMongoId()],
  ctrl.actualizarCita
);
router.delete('/:id', [param('id').isMongoId()], ctrl.eliminarCita);

module.exports = router;


