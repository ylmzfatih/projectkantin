import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [kartId, setKartId] = useState(''); 
  const [ogrenciNo, setOgrenciNo] = useState('');
  const [ad, setAd] = useState('');
  const [soyad, setSoyad] = useState('');
  const [sifre, setSifre] = useState('');


  useEffect(() => {
    const fetchKartId = async () => {
      try {                               
        const response = await axios.get('http://192.168.123.195:3000/api/getKartId');
        if (response.data.kartId) {
          setKartId(response.data.kartId);  
        }
      } catch (error) {
        console.error('Kart ID alınırken hata oluştu:', error);
      }
    };

    fetchKartId();  
  }, []);  

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!kartId) {
      alert("Kart ID okunamadı. Lütfen kartı okutun.");
      return;
    }

    try {
      const response = await axios.post('http://192.168.123.195:3000/api/kullanici/kayit', {
        KartId: kartId,
        OgrenciNo: ogrenciNo,
        Ad: ad,
        Soyad: soyad,
        Sifre: sifre,
      });

      if (response.status === 200) {
        alert('Kayıt başarıyla tamamlandı!');
      } else {
        alert('Kayıt işlemi başarısız! Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error('Hata:', error);
      alert(`Bir hata oluştu: ${error.response ? error.response.data.message : error.message}`);
    }
  };

  

  return (
    <div
  style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    flexDirection: "column",
    backgroundColor: "#f5f5f5",  // Arkaplan rengi
    fontFamily: "Arial, sans-serif", // Yazı tipi
  }}
>
  <h2 style={{ color: "#333", marginBottom: "20px" }}>Kayıt Formu</h2>

  <div style={{ marginBottom: "20px" }}>
    <h3 style={{ color: "#555" }}>
      Okunan Kart ID: {kartId ? kartId : "Kart okutulmadı"}
    </h3>
  </div>

  <form
    onSubmit={handleSubmit}
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "15px",
      width: "300px",
      padding: "25px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      backgroundColor: "white",
      boxShadow: "0 2px 10px rgba(153, 58, 58, 0.1)",  // Hafif gölge efekti
    }}
  >
    <input type="hidden" value={kartId || ""} readOnly />

    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <label style={{ fontWeight: "bold", color: "#444" }}>Öğrenci No:</label>
      <input
        type="text"
        value={ogrenciNo}
        onChange={(e) => setOgrenciNo(e.target.value)}
        required
        style={{
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          fontSize: "16px",
        }}
      />
    </div>

    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <label style={{ fontWeight: "bold", color: "#444" }}>Ad:</label>
      <input
        type="text"
        value={ad}
        onChange={(e) => setAd(e.target.value)}
        required
        style={{
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          fontSize: "16px",
        }}
      />
    </div>

    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <label style={{ fontWeight: "bold", color: "#444" }}>Soyad:</label>
      <input
        type="text"
        value={soyad}
        onChange={(e) => setSoyad(e.target.value)}
        required
        style={{
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          fontSize: "16px",
        }}
      />
    </div>

    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <label style={{ fontWeight: "bold", color: "#444" }}>Şifre:</label>
      <input
        type="password"
        value={sifre}
        onChange={(e) => setSifre(e.target.value)}
        required
        style={{
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          fontSize: "16px",
        }}
      />
    </div>

    <button
      type="submit"
      style={{
        padding: "12px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "16px",
        fontWeight: "bold",
        transition: "background-color 0.3s",  // Geçiş efekti
      }}
      onMouseOver={(e) => (e.target.style.backgroundColor = "#45a049")}  // Hover efekti
      onMouseOut={(e) => (e.target.style.backgroundColor = "#4CAF50")}
    >
      Kayıt Ol
    </button>
  </form>
</div>
  );
}

export default App;
