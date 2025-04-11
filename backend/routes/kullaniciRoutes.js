const express = require('express');
const router = express.Router();
const kullaniciController = require('../controllers/kullaniciController');

module.exports = function(pool) {
  const controller = kullaniciController(pool);

  router.post('/kayit', controller.kayit);  

  return router;
};
