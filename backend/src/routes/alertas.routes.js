const { Router } = require('express');
const { body, param } = require('express-validator');
const { authMiddleware } = require('../middlewares/auth.middleware');
const ctrl = require('../controllers/alertas.controller');

const router = Router();

router.use(authMiddleware);

router.get('/', ctrl.listarAlertas);
router.get('/:id', [param('id').isMongoId()], ctrl.obtenerAlerta);
router.post(
  '/',
  [
    body('paciente').isMongoId(),
    body('titulo').notEmpty(),
    body('mensaje').notEmpty(),
    body('prioridad').optional().isIn(['baja', 'media', 'alta']),
  ],
  ctrl.crearAlerta
);
router.put(
  '/:id',
  [param('id').isMongoId()],
  ctrl.actualizarAlerta
);
router.delete('/:id', [param('id').isMongoId()], ctrl.eliminarAlerta);

module.exports = router;


