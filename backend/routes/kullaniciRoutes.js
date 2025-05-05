const express = require('express');
const router = express.Router();
const kullaniciController = require('../controllers/kullaniciController');

module.exports = function(pool) {
  const controller = kullaniciController(pool);

  router.post('/sifre-guncelle', controller.sifreGuncelle);
  router.post('/kayit', controller.kayit);
  router.get('/kartKontrol', controller.kartKontrol);
  router.post('/giris', controller.giris);
  router.get('/me', controller.me); // bu satırı ekle
  router.post('/bakiye-yukle', controller.bakiyeYukle);
  router.get('/bakiye-sorgula', controller.bakiyeSorgula);
  router.get('/hareketler', controller.islemGecmisi);



 // const controller = require('../controllers/kullaniciController');
  
  // GET endpointini ekleyin
  router.get('/bakiye-sorgula', controller.bakiyeSorgula);
  router.get('/mevcut-bakiye', controller.mevcutBakiye); // GET metodu olduğundan emin olun





  return router;
};