const express = require('express');
const router = express.Router();
const ruleController = require('../controllers/rule.controller');
const verifyToken = require('../middlewares/auth.middleware');

router.use(verifyToken);
router.post('/', ruleController.createRule);

module.exports = router;
