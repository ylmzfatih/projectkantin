// backend/nfc-kayit.js
const express = require('express');
const cors = require('cors');
const mssql = require('mssql');
const kullaniciRoutes = require('./routes/kullaniciRoutes'); // Route'ları içeri aktar

const app = express();
app.use(cors());
app.use(express.json()); // JSON verisi almak için

// MSSQL bağlantı konfigürasyonu
const config = {
    server: 'ALPEREN-MSI\\alpcu',  // SQL Server instance'ı (sunucu adı)
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

        // API route'larını kullan
        app.use('/api/kullanici', kullaniciRoutes(pool)); // 'kullaniciRoutes' API'yi bağla

    })
    .catch(err => {
        console.error('Database connection failed:', err);
        process.exit(1);
    });

// Sunucuyu başlat
app.listen(3000, () => {
    console.log('Server running on http://localhost:5000');
});
