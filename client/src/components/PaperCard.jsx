import React from 'react';
import { motion } from 'framer-motion';
import { User, Tag } from 'lucide-react';

const PaperCard = ({ paper, onClick }) => {
  // İlk kategoriye göre renk sınıfını belirle
  const primaryCat = paper.categories[0];
  const colorClass = 
    primaryCat === 'Yapay Zeka' ? 'ai' :
    primaryCat === 'Doğal Dil İşleme' ? 'nlp' :
    primaryCat === 'Bilgisayarlı Görü' ? 'cv' :
    primaryCat === 'Derin Öğrenme' ? 'dl' :
    primaryCat === 'Kuantum Hesaplama' ? 'qc' : '';

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      onClick={() => onClick(paper)}
      className={`glass-card paper-card paper-card-${colorClass} cursor-pointer group h-full flex flex-col`}
    >
      <div className="flex flex-wrap gap-1 mb-3">
        {paper.categories.map(cat => (
          <span key={cat} className="text-[9px] font-bold uppercase tracking-wider text-primary opacity-70">
            {cat}
          </span>
        ))}
      </div>

      <h3 className={`text-xl font-bold mb-3 line-clamp-2 transition-all title-${colorClass}`}>
        {paper.title}
      </h3>

      <p className="text-muted text-sm line-clamp-3 mb-4 flex-1">
        {paper.abstract}
      </p>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
        <div className="flex items-center gap-2 text-xs text-muted">
          <User size={12} className="text-primary" />
          <span className="truncate max-w-[120px]">{paper.authors[0]}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
          <Tag size={10} />
          <span>DOI</span>
        </div>
      </div>
    </motion.div>
  );
};

export default PaperCard;
