import React, { useMemo, useState, useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import ForceGraph3D from 'react-force-graph-3d';
import { BoxSelect, Layers } from 'lucide-react';

const categoryIcons = {
  'Yapay Zeka': '🤖',
  'Doğal Dil İşleme': '📝',
  'Bilgisayarlı Görü': '📷',
  'Derin Öğrenme': '🧠',
  'Kuantum Hesaplama': '⚛️',
  'default': '📖'
};

const GraphView = ({ data }) => {
  const [is3D, setIs3D] = useState(false);
  const fgRef = useRef();

  const graphData = useMemo(() => {
    if (!data) return { nodes: [], links: [] };
    return data;
  }, [data]);

  const handleNodeClick = useCallback(node => {
    if (!is3D && fgRef.current) {
      fgRef.current.centerAt(node.x, node.y, 1000);
      fgRef.current.zoom(3, 1000);
    }
  }, [is3D]);

  const drawNode = (node, ctx, globalScale) => {
    const label = node.title || 'Makale';
    const fontSize = 14 / globalScale;
    const icon = categoryIcons[node.category] || categoryIcons.default;
    
    // Subtle node glow
    ctx.shadowColor = node.main ? '#6366f1' : 'rgba(99, 102, 241, 0.3)';
    ctx.shadowBlur = 15 / globalScale;

    // Circle background
    ctx.beginPath();
    ctx.arc(node.x, node.y, 7, 0, 2 * Math.PI, false);
    ctx.fillStyle = node.main ? '#6366f1' : '#1e293b';
    ctx.fill();
    ctx.strokeStyle = node.main ? '#fff' : '#6366f1';
    ctx.lineWidth = 1.5 / globalScale;
    ctx.stroke();

    ctx.shadowBlur = 0; // Reset shadow for icon/text

    // Icon (Emoji)
    ctx.font = `${fontSize * 1.5}px "Segoe UI Emoji", "Apple Color Emoji", "Segoe UI Symbol", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, node.x, node.y);

    // Dynamic Label Visibility
    if (globalScale > 1.2) {
      ctx.font = `600 ${fontSize}px Inter, sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText(label, node.x, node.y + 14);
    }
  };

  return (
    <div className="h-[600px] w-full glass-card overflow-hidden relative border-none ring-1 ring-white/5">
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-4">
        <div className="graph-badge">
          <div className="graph-badge-dot" />
          CANLI ATIF AĞI ANALİZİ
        </div>
        
        <button 
          onClick={() => setIs3D(!is3D)}
          className="btn-graph-mode"
        >
          <div className="mode-icon-box">
            {is3D ? <BoxSelect size={16} /> : <Layers size={16} />}
          </div>
          <span>{is3D ? '2D Düzlemine Dön' : '3D Uzay Moduna Geç'}</span>
        </button>
      </div>

      <div className="absolute bottom-6 right-6 z-10 legend-box">
        <p className="legend-title">
          <div style={{ width: '15px', height: '2px', background: 'var(--primary)', opacity: 0.5 }} />
          GÖSTERGE
        </p>
        <div className="legend-content">
          <div className="legend-item">
            <div className="legend-icon">🤖</div>
            <span>Yapay Zeka</span>
          </div>
          <div className="legend-item">
            <div className="legend-icon">📝</div>
            <span>Dil İşleme</span>
          </div>
          <div className="legend-item">
            <div className="legend-icon">🧠</div>
            <span>Derin Öğrenme</span>
          </div>
        </div>
      </div>

      {is3D ? (
        <ForceGraph3D
          graphData={graphData}
          nodeLabel="title"
          nodeColor={n => n.main ? '#6366f1' : '#475569'}
          linkColor={() => 'rgba(99, 102, 241, 0.2)'}
          backgroundColor="rgba(0,0,0,0)"
          width={window.innerWidth < 1000 ? 600 : 900}
          height={600}
        />
      ) : (
        <ForceGraph2D
          ref={fgRef}
          graphData={graphData}
          nodeCanvasObject={drawNode}
          onNodeClick={handleNodeClick}
          linkColor={() => 'rgba(99, 102, 241, 0.2)'}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={0.005}
          linkDirectionalParticleWidth={2}
          linkDirectionalParticleColor={() => '#6366f1'}
          linkCurvature={0.25}
          backgroundColor="rgba(0,0,0,0)"
          width={window.innerWidth < 1000 ? 600 : 900}
          height={600}
        />
      )}
    </div>
  );
};

export default GraphView;
