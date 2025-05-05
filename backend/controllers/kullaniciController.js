const sql = require('mssql/msnodesqlv8');

module.exports = function(pool) {
  return {
    kayit: async (req, res) => {
      const { KartId, OgrenciNo, Ad, Soyad, Sifre } = req.body;

      if (!KartId) {
        return res.status(400).json({ message: 'Kart ID gereklidir!' });
      }

      try {
        const kartKontrol = await pool.request()
          .input('KartId', sql.VarChar(50), KartId)
          .query('SELECT * FROM Kartlar WHERE KartId = @KartId');

        if (kartKontrol.recordset.length === 0) {
          return res.status(400).json({ message: 'Geçersiz kart!' });
        }

        const kart = kartKontrol.recordset[0];
        if (kart.IsAssigned) {
          return res.status(400).json({ message: 'Bu kart zaten kayıtlı!' });
        }

        await pool.request()
          .input('KartId', sql.VarChar(50), KartId)
          .input('OgrenciNo', sql.VarChar(20), OgrenciNo)
          .input('Ad', sql.VarChar(50), Ad)
          .input('Soyad', sql.VarChar(50), Soyad)
          .input('Sifre', sql.VarChar(50), Sifre)
          .query('INSERT INTO Kullanicilar (KartId, OgrenciNo, Ad, Soyad, Sifre) VALUES (@KartId, @OgrenciNo, @Ad, @Soyad, @Sifre)');

        await pool.request()
          .input('KartId', sql.VarChar(50), KartId)
          .query('UPDATE Kartlar SET IsAssigned = 1 WHERE KartId = @KartId');

        res.status(200).json({ message: 'Kayıt başarıyla tamamlandı!' });

      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası!', error: err.message });
      }
    },

    giris: async (req, res) => {
      const { OgrenciNo, Sifre } = req.body;

      try {
        const result = await pool.request()
          .input('OgrenciNo', sql.VarChar(20), OgrenciNo)
          .input('Sifre', sql.VarChar(50), Sifre)
          .query('SELECT * FROM Kullanicilar WHERE OgrenciNo = @OgrenciNo AND Sifre = @Sifre');

        if (result.recordset.length === 0) {
          return res.status(401).json({ success: false, message: 'Öğrenci numarası veya şifre hatalı!' });
        }

        res.json({ success: true, message: 'Giriş başarılı!' });
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Sunucu hatası!' });
      }
    },

    sifreGuncelle: async (req, res) => {
      console.log("Şifre güncelleme isteği alındı", req.body);
      const { OgrenciNo, mevcutSifre, yeniSifre } = req.body;

      if (!OgrenciNo || !mevcutSifre || !yeniSifre) {
        return res.status(400).json({ message: 'Öğrenci numarası, mevcut şifre ve yeni şifre gereklidir!' });
      }

      try {
        // Kullanıcıyı mevcut şifre ile doğrula
        const result = await pool.request()
          .input('OgrenciNo', sql.VarChar(20), OgrenciNo)
          .input('Sifre', sql.VarChar(50), mevcutSifre)
          .query('SELECT * FROM Kullanicilar WHERE OgrenciNo = @OgrenciNo AND Sifre = @Sifre');

        if (result.recordset.length === 0) {
          return res.status(401).json({ message: 'Mevcut şifre hatalı!' });
        }

        // Yeni şifreyi güncelle
        await pool.request()
          .input('OgrenciNo', sql.VarChar(20), OgrenciNo)
          .input('YeniSifre', sql.VarChar(50), yeniSifre)
          .query('UPDATE Kullanicilar SET Sifre = @YeniSifre WHERE OgrenciNo = @OgrenciNo');

        res.status(200).json({ message: 'Şifre başarıyla güncellendi!' });
      } catch (err) {
        console.error("Hata:", err);  
        res.status(500).json({ message: 'Sunucu hatası!', error: err.message, stack: err.stack });
      }
    },
    
    kartKontrol: async (req, res) => {
      const { kartId } = req.query;

      try {
        const result = await pool.request()
          .input('KartId', sql.VarChar(50), kartId)
          .query('SELECT * FROM Kartlar WHERE KartId = @KartId');

        if (result.recordset.length === 0) {
          return res.json({ gecerli: false, message: 'Kart sistemde kayıtlı değil!' });
        }

        const kart = result.recordset[0];
        if (kart.IsAssigned) {
          return res.json({ gecerli: false, message: 'Bu kart zaten kullanılmış!' });
        }

        res.json({ gecerli: true, message: 'Kart kullanılabilir.' });

      } catch (err) {
        console.error(err);
        res.status(500).json({ gecerli: false, message: 'Sunucu hatası.', error: err.message });
      }
    },

    me: async (req, res) => {
      const { ogrenciNo } = req.query;
    
      if (!ogrenciNo) {
        return res.status(400).json({ message: 'Öğrenci numarası gereklidir.' });
      }
    
      try {
        const result = await pool.request()
          .input('OgrenciNo', sql.VarChar(20), ogrenciNo)
          .query('SELECT KartId, Ad, Soyad, OgrenciNo, Bakiye FROM Kullanicilar WHERE OgrenciNo = @OgrenciNo');
    
        if (result.recordset.length === 0) {
          return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }
    
        res.status(200).json(result.recordset[0]);
      } catch (err) {
        console.error('Sunucu hatası:', err);
        res.status(500).json({ message: 'Sunucu hatası', error: err.message });
      }
    },

    // YENİ DÜZENLENMİŞ BAKİYE FONKSİYONLARI
    bakiyeYukle: async (req, res) => {
      const { OgrenciNo, YuklenecekTutar } = req.body;
      console.log("Gelen veri:", req.body);
    
      if (!OgrenciNo || !YuklenecekTutar) {
        return res.status(400).json({
          success: false,
          message: 'Öğrenci numarası ve yüklemek istediğiniz tutar gereklidir!'
        });
      }
    
      if (isNaN(YuklenecekTutar) || YuklenecekTutar <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz tutar!'
        });
      }
    
      try {
        // 1. Bakiye güncelle
        const result = await pool.request()
          .input('OgrenciNo', sql.VarChar(20), OgrenciNo)
          .input('YuklenecekTutar', sql.Float, YuklenecekTutar)
          .query('UPDATE Kullanicilar SET Bakiye = Bakiye + @YuklenecekTutar WHERE OgrenciNo = @OgrenciNo');
    
        if (result.rowsAffected[0] === 0) {
          return res.status(404).json({
            success: false,
            message: 'Kullanıcı bulunamadı!'
          });
        }
    
        // 2. Hesap hareketleri kaydı ekle
        await pool.request()
          .input('OgrenciNo', sql.VarChar(20), OgrenciNo)
          .input('Tutar', sql.Float, YuklenecekTutar)
          .input('Aciklama', sql.VarChar(255), 'Bakiye Yükleme')
          .input('Tarih', sql.DateTime, new Date())
          .query(`
            INSERT INTO HesapHareketleri (OgrenciNo, Tutar, Aciklama, Tarih)
            VALUES (@OgrenciNo, @Tutar, @Aciklama, @Tarih)
          `);
    
        // 3. Yeni bakiyeyi getir
        const newBalance = await pool.request()
          .input('OgrenciNo', sql.VarChar(20), OgrenciNo)
          .query('SELECT Bakiye FROM Kullanicilar WHERE OgrenciNo = @OgrenciNo');
    
        res.status(200).json({
          success: true,
          message: 'Bakiye yüklendi',
          yeniBakiye: newBalance.recordset[0].Bakiye
        });
    
      } catch (err) {
        console.error("Sunucu hatası:", err);
        res.status(500).json({
          success: false,
          message: 'Sunucu hatası'
        });
      }
    },
    

    bakiyeSorgula: async (req, res) => {
      const { OgrenciNo } = req.query;
    
      if (!OgrenciNo) {
        return res.status(400).json({ 
          success: false,
          message: 'Öğrenci numarası gereklidir' 
        });
      }
    
      try {
        const result = await pool.request()
          .input('OgrenciNo', sql.VarChar(20), OgrenciNo)
          .query('SELECT Bakiye FROM Kullanicilar WHERE OgrenciNo = @OgrenciNo');
    
        if (result.recordset.length === 0) {
          return res.status(404).json({ 
            success: false,
            message: 'Kullanıcı bulunamadı' 
          });
        }
    
        res.status(200).json({
          success: true,
          bakiye: result.recordset[0].Bakiye
        });
      } catch (err) {
        console.error('Bakiye sorgulama hatası:', err);
        res.status(500).json({ 
          success: false,
          message: 'Sunucu hatası' 
        });
      }
    },

    mevcutBakiye: async (req, res) => {
      const { OgrenciNo } = req.query; // DİKKAT: req.query kullanıyoruz (GET isteği)
      
      if (!OgrenciNo) {
        return res.status(400).json({ message: 'Öğrenci numarası gereklidir!' });
      }
    
      try {
        const result = await pool.request()
          .input('OgrenciNo', sql.VarChar(20), OgrenciNo)
          .query('SELECT Bakiye FROM Kullanicilar WHERE OgrenciNo = @OgrenciNo');
    
        res.status(200).json({ 
          success: true,
          bakiye: result.recordset[0].Bakiye // "Bakiye" kolon adı veritabanıyla aynı mı?
        });
      } catch (err) {
        res.status(500).json({ message: 'Sunucu hatası!' });
      }
    },

    islemGecmisi: (pool) => async (req, res) => {
      try {
        const { ogrenciNo } = req.query;
        if (!ogrenciNo) {
          return res.status(400).json({ message: 'Öğrenci numarası gereklidir' });
        }
    
        const veriler = await kullaniciModel.getIslemGecmisi(pool, ogrenciNo);
        res.json(veriler);
      } catch (err) {
        console.error("İşlem geçmişi hatası:", err);
        res.status(500).json({ message: 'İşlem geçmişi alınamadı' });
      }
    },

    

    
  };
};