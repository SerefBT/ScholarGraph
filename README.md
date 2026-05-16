# 🎓 ScholarGraph: Akıllı Akademik Keşif ve Atıf Analiz Sistemi

ScholarGraph, akademik literatürü **Neo4j Graph Database** ve **MongoDB** hibrit mimarisiyle analiz eden, makaleler arasındaki atıf bağlarını görselleştiren ve akıllı öneriler sunan ileri seviye bir web uygulamasıdır.

## 🚀 Öne Çıkan Özellikler
- **🌐 Atıf Ağı Görselleştirme:** Makaleler arasındaki ilişkileri 2D ve 3D modunda interaktif olarak inceleme.
- **🧠 Akıllı Öneri Motoru:** Graph algoritmaları ve benzerlik skorları ile kullanıcıya en alakalı akademik içerikleri sunma.
- **🔍 Gelişmiş Arama:** Türkçe karakter destekli, hızlı ve esnek arama motoru.
- **📊 Detaylı Analiz Paneli:** Makale metadatası, güven skoru ve AI tabanlı analiz notları.
- **📤 PDF Yönetimi:** Akademik makale yükleme ve sistemle anlık senkronizasyon.

## 🛠️ Teknolojik Stack
- **Frontend:** React, Vite, Framer Motion, Force Graph (2D/3D), Lucide Icons
- **Backend:** Node.js, Express.js
- **Veritabanı:** 
  - **MongoDB:** Makale metinleri ve metadata saklama.
  - **Neo4j:** Atıf ağları ve grafik tabanlı ilişki analizi.

## 📦 Kurulum ve Çalıştırma

1. **Repoyu Klonlayın:**
   ```bash
   git clone https://github.com/KullaniciAdiniz/ScholarGraph.git
   ```

2. **Bağımlılıkları Yükleyin:**
   ```bash
   # Server için
   cd server && npm install
   # Client için
   cd ../client && npm install
   ```

3. **Veritabanlarını Hazırlayın:**
   - Yerel bir MongoDB ve Neo4j sunucusu başlattığınızdan emin olun.
   - `server/.env` dosyasını oluşturun ve bilgilerinizi girin.

4. **Sistemi Başlatın:**
   ```bash
   # Server
   cd server && node index.js
   # Client
   cd client && npm run dev
   ```

## 📝 Lisans
Bu proje eğitim amaçlı geliştirilmiştir. [MIT License](LICENSE)
