const { VarChar } = require('msnodesqlv8');
const sql = require('mssql/msnodesqlv8');

module.exports = function(pool) {
  return {
    kayit: async (req, res) => {
      const { KartId, OgrenciNo, Ad, Soyad, Sifre } = req.body;

      if (!KartId) {
        return res.status(400).json({ message: 'Kart ID gereklidir!' });
      }

      try {
        const kartId = String(KartId);

        const result = await pool.request()
          .input('KartId', sql.VarChar(50), kartId)
          .input('OgrenciNo', sql.VarChar(20), OgrenciNo)
          .input('Ad', sql.VarChar(50), Ad)
          .input('Soyad', sql.VarChar(50), Soyad)
          .input('Sifre', sql.VarChar(50), Sifre)
          .query('INSERT INTO Kullanicilar (KartId, OgrenciNo, Ad, Soyad, Sifre) VALUES (@KartId, @OgrenciNo, @Ad, @Soyad, @Sifre)');

        res.status(200).json({ message: 'Kayıt başarıyla tamamlandı!' });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Bir hata oluştu!', error: err.message });
      }
    }
  };
};
