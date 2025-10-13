const { Router } = require('express');
const { body } = require('express-validator');
const { registro, login } = require('../controllers/auth.controller');

const router = Router();

router.post(
  '/registro',
  [
    body('nombre').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('rol').optional().isIn(['paciente', 'admin', 'medico']),
  ],
  registro
);

router.post(
  '/login',
  [
    body('email').isEmail(),
    body('password').notEmpty(),
  ],
  login
);

module.exports = router;


