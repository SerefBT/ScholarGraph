import React, { useState } from 'react';
import { Search } from 'lucide-react';

const SearchHero = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className="py-20 text-center w-full max-w-4xl">
      <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight text-gradient">
        Geleceğin Akademik <br /> Keşif Motoru
      </h1>
      <p className="text-muted text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
        Milyonlarca makale arasından senin için en doğru olanı bulalım. 
        Yapay zeka destekli önerilerle araştırmanı bir üst seviyeye taşı.
      </p>
      
      <form onSubmit={handleSubmit} className="search-container group mx-auto">
        <Search className="search-icon" size={20} />
        <input 
          type="text" 
          placeholder="Makale başlığı, yazar veya anahtar kelime ara..."
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button 
          type="submit"
          className="search-btn"
        >
          Ara
        </button>
      </form>
    </div>
  );
};

export default SearchHero;
