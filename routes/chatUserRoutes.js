const express = require('express');
const { protect } = require('../controllers/authController');
const { getAllChatUsers } = require('../controllers/chatUserController');

const router = express.Router();

router.use(protect);
router.route('/').get(getAllChatUsers);

module.exports = router;
