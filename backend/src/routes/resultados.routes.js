const { Router } = require('express');
const { body, param } = require('express-validator');
const { authMiddleware } = require('../middlewares/auth.middleware');
const ctrl = require('../controllers/resultados.controller');

const router = Router();

router.use(authMiddleware);

router.get('/', ctrl.listarResultados);
router.get('/:id', [param('id').isMongoId()], ctrl.obtenerResultado);
router.post(
  '/',
  [
    body('paciente').isMongoId(),
    body('tipo').notEmpty(),
    body('descripcion').notEmpty(),
    body('fechaResultado').isISO8601(),
  ],
  ctrl.crearResultado
);
router.put(
  '/:id',
  [param('id').isMongoId()],
  ctrl.actualizarResultado
);
router.delete('/:id', [param('id').isMongoId()], ctrl.eliminarResultado);

module.exports = router;


