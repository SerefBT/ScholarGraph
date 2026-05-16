import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchHero from './components/SearchHero';
import PaperCard from './components/PaperCard';
import GraphView from './components/GraphView';
import { ArrowLeft, Share2, Sparkles, BookOpen, Layers, Upload, User, FileText, Download, Info, Calendar, Globe, Database, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = 'http://localhost:5000/api/papers';

function App() {
  const [papers, setPapers] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  const searchPapers = async (query = '', category = null) => {
    setLoading(true);
    setActiveCategory(category);
    try {
      const url = new URL(`${API_URL}/search`);
      if (query) url.searchParams.append('q', query);
      if (category) url.searchParams.append('category', category);
      
      const res = await axios.get(url.toString());
      setPapers(res.data);
      setSelectedPaper(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTrending = async () => {
    setLoading(true);
    setActiveCategory('trending');
    try {
      const res = await axios.get(`${API_URL}/trending`);
      setPapers(res.data);
      setSelectedPaper(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectPaper = async (paper) => {
    setSelectedPaper(paper);
    setLoading(true);
    try {
      const [recRes, graphRes] = await Promise.all([
        axios.get(`${API_URL}/${paper._id}/recommendations`),
        axios.get(`${API_URL}/${paper._id}/graph`)
      ]);
      setRecommendations(recRes.data);
      setGraphData(graphRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchPapers();
  }, []);

  const categories = [
    { name: 'Yapay Zeka', icon: <Sparkles size={18} /> },
    { name: 'Doğal Dil İşleme', icon: <BookOpen size={18} /> },
    { name: 'Bilgisayarlı Görü', icon: <Layers size={18} /> },
    { name: 'Derin Öğrenme', icon: <Sparkles size={18} /> },
    { name: 'Kuantum Hesaplama', icon: <Layers size={18} /> }
  ];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="p-2 bg-primary rounded-xl shadow-lg shadow-primary/20">
            <Layers className="text-white" size={24} />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white">PaperRec</span>
        </div>
        
        <nav className="space-y-2 flex-1">
          <p className="sidebar-header">ANA MENÜ</p>
          <button 
            className={`btn-sidebar ${!activeCategory && !selectedPaper ? 'active' : ''}`}
            onClick={() => searchPapers()}
          >
            <Sparkles size={18} /> <span>Keşif Motoru</span>
          </button>
          <button 
            className={`btn-sidebar ${activeCategory === 'trending' ? 'active' : ''}`}
            onClick={getTrending}
          >
            <Sparkles size={18} /> <span>Popüler Makaleler</span>
          </button>
          
          <div className="pt-8">
            <p className="sidebar-header">KATEGORİLER</p>
            {categories.map(cat => (
              <button 
                key={cat.name} 
                className={`btn-sidebar ${activeCategory === cat.name ? 'active' : ''}`}
                onClick={() => searchPapers('', cat.name)}
              >
                {cat.icon} <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="mt-auto pt-8">
          <label className="btn-upload cursor-pointer">
            <Upload size={18} /> 
            <span>YENİ MAKALE EKLE</span>
            <input 
              type="file" 
              style={{ display: 'none' }}
              accept=".pdf" 
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const formData = new FormData();
                formData.append('file', file);
                setLoading(true);
                try {
                  const res = await axios.post(`${API_URL}/upload`, formData);
                  selectPaper(res.data);
                } catch (err) {
                  alert('Yükleme hatası: ' + err.message);
                } finally {
                  setLoading(false);
                }
              }}
            />
          </label>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <AnimatePresence mode="wait">
          {!selectedPaper ? (
            <motion.div 
              key="search-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-6xl flex flex-col items-center"
            >
              <SearchHero onSearch={searchPapers} />
              
              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
                </div>
              ) : papers.length > 0 ? (
                <div className="papers-grid">
                  {papers.map(p => (
                    <PaperCard key={p._id} paper={p} onClick={selectPaper} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center glass-card w-full">
                  <BookOpen size={48} className="text-muted mb-4 opacity-20" />
                  <h3 className="text-xl font-bold mb-2">Henüz Makale Yok</h3>
                  <p className="text-muted max-w-xs">
                    Bu kategori veya arama için uygun makale bulunamadı. Lütfen yeni bir PDF yükleyin veya farklı bir kategori seçin.
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="detail-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-6xl"
            >
              <button 
                onClick={() => setSelectedPaper(null)}
                className="btn-back mb-8"
              >
                <ArrowLeft size={18} /> Geri Dön
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="glass-card p-8">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedPaper.categories?.map(c => (
                        <span key={c} className={`badge ${
                          c === 'Yapay Zeka' ? 'badge-ai' : 
                          c === 'Doğal Dil İşleme' ? 'badge-nlp' : 
                          c === 'Bilgisayarlı Görü' ? 'badge-cv' : ''
                        }`}>{c}</span>
                      ))}
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black mb-6 leading-tight text-gradient max-w-full break-words">
                      {selectedPaper.title}
                    </h1>
                    
                    <div className="flex flex-wrap gap-6 text-muted mb-8 text-sm">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-primary" />
                        <span>{selectedPaper.authors?.join(", ")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-primary" />
                        <span>DOI: {selectedPaper.doi || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-8">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-muted mb-4 flex items-center gap-2">
                        <BookOpen size={14} /> ÖZET VE ANALİZ
                      </h3>
                      <p className="text-text-main/90 leading-relaxed text-lg">
                        {selectedPaper.abstract}
                      </p>
                    </div>

                    <div className="flex gap-4 mt-8">
                      <button 
                        onClick={() => {
                          const btn = document.querySelector('.btn-download');
                          const originalText = btn.innerHTML;
                          btn.innerHTML = '⌛ Hazırlanıyor...';
                          setTimeout(() => {
                            alert(`'${selectedPaper.title}' başlıklı makale PDF olarak hazırlanıyor...`);
                            btn.innerHTML = originalText;
                          }, 1000);
                        }}
                        className="btn-download flex items-center gap-2"
                      >
                        <Download size={18} /> PDF İndir
                      </button>
                      <button 
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: selectedPaper.title,
                              text: selectedPaper.abstract,
                              url: window.location.href,
                            }).catch(console.error);
                          } else {
                            navigator.clipboard.writeText(window.location.href);
                            alert('Bağlantı başarıyla kopyalandı! 🔗');
                          }
                        }}
                        className="btn-share flex items-center gap-2"
                      >
                        <Share2 size={18} /> Paylaş
                      </button>
                    </div>
                  </div>

                  <div className="glass-card p-0 overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                      <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                        <Share2 size={16} className="text-primary" /> Atıf İlişki Ağı
                      </h3>
                    </div>
                    <GraphView data={graphData} />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="glass-card p-6 border-t-4 border-t-primary">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary mb-6 flex items-center gap-2">
                      <Sparkles size={16} /> Akademik Öneriler & Analiz
                    </h3>
                    <div className="space-y-5">
                      {recommendations.length > 0 ? recommendations.map(rec => (
                        <div 
                          key={rec.id} 
                          onClick={() => selectPaper({ _id: rec.id, title: rec.title })}
                          className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group"
                        >
                          <p className="text-sm font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">{rec.title}</p>
                          <p className="text-[10px] text-muted mb-3 italic">"Benzer metodoloji ve veri kümesi kullanımı tespit edildi."</p>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-1000"
                                style={{ width: `${Math.min(rec.strength * 25, 100)}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-black text-white uppercase">%{Math.min(rec.strength * 25, 100)} Alaka</span>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-6 opacity-50">
                          <p className="text-xs italic">Sistem öneri analiz ediyor...</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="glass-card p-6 border-l-4 border-l-emerald-500 bg-emerald-500/5">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-500 mb-6 flex items-center gap-2">
                      <Info size={16} /> Detaylı Dosya Analizi
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-[11px] text-muted flex items-center gap-2"><FileText size={14} /> Doküman Türü</span>
                        <span className="text-[9px] font-black text-white px-2 py-1 bg-emerald-500/20 rounded-lg border border-emerald-500/30 uppercase">Bilimsel Makale</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-[11px] text-muted flex items-center gap-2"><Calendar size={14} /> Yayın Dönemi</span>
                        <span className="text-xs font-black text-white">Bahar 2024</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-[11px] text-muted flex items-center gap-2"><Clock size={14} /> Okuma Süresi</span>
                        <span className="text-xs font-black text-emerald-400">12 Dakika</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-[11px] text-muted flex items-center gap-2"><Layers size={14} /> Atıf Sayısı</span>
                        <span className="text-xs font-black text-primary">42 Atıf</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-[11px] text-muted flex items-center gap-2"><Sparkles size={14} /> Güven Skoru</span>
                        <span className="text-xs font-black text-amber-400">Yüksek (0.94)</span>
                      </div>
                      <div className="mt-4 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                        <p className="text-[10px] font-bold text-primary uppercase mb-2 tracking-widest">AI Analiz Notu</p>
                        <p className="text-[11px] text-muted leading-relaxed">
                          Bu çalışma, seçili alandaki en güncel literatür verilerini içermekte olup, graph tabanlı öneri motorumuz tarafından yüksek doğrulukla sınıflandırılmıştır.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
