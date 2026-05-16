const mongoose = require('mongoose');
const { driver, connectMongo } = require('./db');
const Paper = require('./models/Paper');
require('dotenv').config({ path: __dirname + '/.env' });

const categories = ['Yapay Zeka', 'Doğal Dil İşleme', 'Bilgisayarlı Görü', 'Derin Öğrenme', 'Kuantum Hesaplama'];

const generatePapers = () => {
    const papers = [];
    const titles = [
        "Sürdürülebilir Enerji Sistemlerinde Yapay Zeka", "Derin Sinir Ağları ile Kanser Teşhisi", 
        "Kuantum Sonrası Kriptografi Standartları", "Türkçe Metin Özetleme Modelleri",
        "Otonom İHA'larda Nesne Takibi", "Büyük Dil Modellerinde Etik Sorunlar",
        "Robotik Cerrahide Görüntü İşleme", "Nesnelerin İnterneti ve Kenar Hesaplama",
        "Pekiştirmeli Öğrenme ile Borsa Analizi", "Üretken Yapay Zeka ve Sanat",
        "Duygu Analizinde Dönüştürücü Modeller", "Kuantum İnternet Protokolleri",
        "Tıbbi Verilerde Gizlilik Koruyan Yapay Zeka", "Giyilebilir Teknolojilerde Derin Öğrenme",
        "Görüntü Restorasyonunda GAN Kullanımı", "Biyoinformatikte Büyük Veri Analizi",
        "Akıllı Şehirlerde Trafik Optimizasyonu", "Eğitimde Kişiselleştirilmiş Öğrenme Sistemleri",
        "Uzaktan Algılamada Uydu Görüntü Analizi", "Siber Güvenlikte Anomali Tespiti",
        "Blokzincir ve Yapay Zeka Entegrasyonu", "Doğal Dil İşleme ile Hukuki Belge Analizi",
        "Kuantum Algoritmaları ve Karmaşıklık", "Düşük Kaynaklı Diller için Çeviri Modelleri",
        "Yüz Tanıma Sistemlerinde Gizlilik", "Tarımda Akıllı Sulama ve Görüntü İşleme",
        "Yazılım Testinde Otomasyon ve Yapay Zeka", "Metaverse ve Grafik Hesaplama",
        "Beyin-Bilgisayar Arayüzlerinde Sinyal İşleme", "Geleceğin Süper Bilgisayarları ve Kuantum"
    ];

    for (let i = 0; i < 30; i++) {
        papers.push({
            title: titles[i],
            abstract: `${titles[i]} üzerine yapılan bu çalışma, güncel akademik yaklaşımları ve teknolojik gelişmeleri detaylı bir şekilde ele almaktadır. Sektörel bazda uygulama alanları ve gelecek projeksiyonları tartışılmıştır.`,
            authors: [`Dr. Araştırmacı ${i + 1}`, `Yazar ${Math.floor(Math.random() * 50)}`],
            doi: `2024/PAPER-${1000 + i}`,
            categories: [categories[i % categories.length], categories[(i + 1) % categories.length]]
        });
    }
    return papers;
};

const seed = async () => {
    try {
        await connectMongo();
        await Paper.deleteMany({});
        console.log('🧹 MongoDB temizlendi.');

        const mockPapers = generatePapers();
        const savedPapers = [];
        for (const p of mockPapers) {
            const paper = new Paper(p);
            const saved = await paper.save();
            savedPapers.push(saved);
        }
        console.log(`✅ 30 Adet Türkçe Makale MongoDB'ye yüklendi.`);

        const session = driver.session();
        try {
            await session.run('MATCH (n) DETACH DELETE n');
            
            for (const p of savedPapers) {
                await session.run(`
                    CREATE (p:Paper {mongoId: $mongoId, title: $title, category: $category})
                    WITH p
                    UNWIND $categories AS cat
                    MERGE (c:Keyword {name: cat})
                    CREATE (p)-[:HAS_TOPIC]->(c)
                `, { 
                    mongoId: p._id.toString(), 
                    title: p.title, 
                    categories: p.categories,
                    category: p.categories[0] // İlk kategoriyi simge için saklıyoruz
                });
            }

            console.log('🔗 Rastgele atıf ağları oluşturuluyor...');
            for (let i = 0; i < savedPapers.length; i++) {
                // Her makale rastgele 2-4 diğer makaleye atıf yapsın
                const numCitations = Math.floor(Math.random() * 3) + 2;
                for (let j = 0; j < numCitations; j++) {
                    const targetIndex = (i + Math.floor(Math.random() * 10) + 1) % savedPapers.length;
                    await session.run(`
                        MATCH (p1:Paper {mongoId: $id1}), (p2:Paper {mongoId: $id2})
                        WHERE p1 <> p2
                        MERGE (p1)-[:CITES]->(p2)
                    `, { id1: savedPapers[i]._id.toString(), id2: savedPapers[targetIndex]._id.toString() });
                }
            }
            console.log('✅ Karmaşık atıf ağı başarıyla kuruldu!');
        } catch (neoErr) {
            console.error('❌ Neo4j Hatası:', neoErr);
        } finally {
            await session.close();
        }

    } catch (err) {
        console.error('❌ Hata:', err);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

seed();
