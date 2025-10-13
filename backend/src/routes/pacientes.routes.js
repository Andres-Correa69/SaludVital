const { Router } = require('express');
const { body, param } = require('express-validator');
const { authMiddleware } = require('../middlewares/auth.middleware');
const ctrl = require('../controllers/pacientes.controller');

const router = Router();

router.use(authMiddleware);

router.get('/', ctrl.listarPacientes);
router.get('/:id', [param('id').isMongoId()], ctrl.obtenerPaciente);
router.post(
  '/',
  [
    body('user').isMongoId(),
    body('documento').notEmpty(),
    body('telefono').notEmpty(),
    body('direccion').notEmpty(),
    body('fechaNacimiento').isISO8601(),
  ],
  ctrl.crearPaciente
);
router.put(
  '/:id',
  [param('id').isMongoId()],
  ctrl.actualizarPaciente
);
router.delete('/:id', [param('id').isMongoId()], ctrl.eliminarPaciente);

module.exports = router;


