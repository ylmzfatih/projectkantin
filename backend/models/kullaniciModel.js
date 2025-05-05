const express = require('express');
const cors = require('cors');
const mssql = require('mssql');
const kullaniciRoutes = require('./routes/kullaniciRoutes'); // Route'ları içeri aktar

const app = express();
app.use(cors());
app.use(express.json()); // JSON verisi almak için

// MSSQL bağlantı konfigürasyonu
const config = {
    server: 'FF\\SQLEXPRESS',  // SQL Server instance'ı (sunucu adı)
    database: 'KantinDB',  // Veritabanı adı
    options: {
        encrypt: true, // Veritabanı şifrelemesi
        trustServerCertificate: true  // Sertifika güvenliği
    }
};


  

// MSSQL bağlantısı
mssql.connect(config)
    .then(pool => {
        console.log('Database connected');
        app.use('/api/kullanici', kullaniciRoutes(pool)); // API'yi bağla
    })
    .catch(err => {
        console.error('Database connection failed:', err);
        process.exit(1);
    });

    app.post('/bakiye-yukleme', (req, res) => {
        const { ogrenciNo, tutar } = req.body;
      
        if (!ogrenciNo || !tutar) {
          return res.status(400).send('Öğrenci No ve Tutar gereklidir.');
        }
      
        // Kalan bakiyeyi hesapla (örnek: şu anki bakiye + yüklenen tutar)
        db.query('SELECT KalanBakiye FROM HesapHareketleri WHERE OgrenciNo = ? ORDER BY Tarih DESC LIMIT 1', [ogrenciNo], (err, result) => {
          if (err) {
            console.error('Veritabanı hatası:', err);
            return res.status(500).send('Veritabanı hatası.');
          }
      
          const mevcutBakiye = result[0] ? result[0].KalanBakiye : 0;
          const yeniBakiye = mevcutBakiye + tutar;
      
          // Bakiye yükleme işlemini kaydet
          const query = 'INSERT INTO HesapHareketleri (OgrenciNo, IslemTuru, Tutar, KalanBakiye, Aciklama, Tarih) VALUES (?, "Bakiye Yükleme", ?, ?, "Bakiye yükleme işlemi", NOW())';
          db.query(query, [ogrenciNo, tutar, yeniBakiye], (err, result) => {
            if (err) {
              console.error('Veritabanı hatası:', err);
              return res.status(500).send('Veritabanı hatası.');
            }
      
            res.status(200).send('Bakiye başarıyla yüklendi.');
          });
        });
      });

      
      
      

// Sunucuyu başlat
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
