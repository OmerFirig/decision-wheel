import "./App.css";
import Wheel from "./Wheel";
import type { WheelOption } from "./Wheel";
import { useRef, useState, useEffect } from "react";

const defaultOptions: WheelOption[] = [
  { text: "Merhaba", color: "#2d8cff", size: 1 },
  { text: "Dünya", color: "#1a233a", size: 1 },
  { text: "Test", color: "#ff9900", size: 1 },
  { text: "550", color: "#00cc66", size: 1 },
  { text: "600", color: "#cc0066", size: 1 },
  { text: "Joker", color: "#333333", size: 1 },
  { text: "500₺", color: "#9900cc", size: 1 },
  { text: "Teşekkürler", color: "#ff3333", size: 1 },
];
const DEFAULT_SIZE = 150;
const STORAGE_KEY = "cark_settings_v1";

function getTargetAngle(options: WheelOption[], index: number) {
  const total = options.reduce((sum, o) => sum + o.size, 0);
  let angle = 0;
  for (let i = 0; i < index; i++) {
    angle += (options[i].size / total) * 360;
  }
  angle += (options[index].size / total) * 360 / 2;
  return 360 - angle;
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.options) || typeof parsed.size !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveSettings(options: WheelOption[], size: number) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ options, size }));
}

function App() {
  // LocalStorage'dan yükle
  const loaded = loadSettings();
  const [options, setOptions] = useState<WheelOption[]>(loaded?.options || defaultOptions);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [wheelSize, setWheelSize] = useState<number>(loaded?.size || DEFAULT_SIZE);
  const totalRotation = useRef(0);

  // Edit panel state
  const [editList, setEditList] = useState<WheelOption[]>(options);
  const [newItem, setNewItem] = useState<WheelOption>({ text: "", color: "#2d8cff", size: 1 });
  const [editWheelSize, setEditWheelSize] = useState(wheelSize);

  // Ayarları localStorage'a kaydet
  useEffect(() => {
    saveSettings(options, wheelSize);
  }, [options, wheelSize]);

  // Edit panel açıldığında mevcut ayarları yükle
  const openEdit = () => {
    setEditList(options);
    setEditWheelSize(wheelSize);
    setEditOpen(true);
  };
  const closeEdit = () => {
    setEditOpen(false);
  };
  const handleEditChange = (idx: number, field: keyof WheelOption, value: string | number) => {
    setEditList(list => list.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };
  const handleDelete = (idx: number) => {
    setEditList(list => list.filter((_, i) => i !== idx));
  };
  const handleAdd = () => {
    if (!newItem.text.trim()) return;
    setEditList(list => [...list, { ...newItem }]);
    setNewItem({ text: "", color: "#2d8cff", size: 1 });
  };
  const saveEdit = () => {
    setOptions(editList.length ? editList : defaultOptions);
    setWheelSize(editWheelSize);
    setEditOpen(false);
    setRotation(0);
    setResult(null);
    setSpinning(false);
    totalRotation.current = 0;
  };

  const spin = () => {
    if (spinning || showModal || editOpen) return;
    setSpinning(true);
    setResult(null);
    const index = Math.floor(Math.random() * options.length);
    const targetAngle = getTargetAngle(options, index);
    const extraRotation = 360 * 4 + targetAngle;
    const newTotal = totalRotation.current + extraRotation;
    setRotation(newTotal);
    setTimeout(() => {
      setResult(options[index].text);
      setSpinning(false);
      setShowModal(true);
      totalRotation.current = newTotal % 360;
    }, 3000);
  };

  const closeModal = () => {
    setShowModal(false);
    setResult(null);
    setRotation(0);
    setSpinning(false);
    totalRotation.current = 0;
  };

  return (
    <div className="container" >
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginBottom: 32 }}>
        <button className="button" onClick={spin} disabled={spinning || showModal || editOpen}>
          {spinning ? (
            <span style={{ display: 'inline-block', marginRight: 10, verticalAlign: 'middle' }}>
              <svg width="28" height="28" viewBox="0 0 50 50" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                <circle cx="25" cy="25" r="20" fill="none" stroke="#fff" strokeWidth="6" opacity="0.18" />
                <circle cx="25" cy="25" r="20" fill="none" stroke="#2d8cff" strokeWidth="6" strokeDasharray="31.4 94.2" strokeLinecap="round" style={{ transformOrigin: 'center', animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
              </svg>
            </span>
          ) : null}
          {spinning ? "Dönüyor..." : "Çevir"}
        </button>
        <button className="edit-button" onClick={openEdit} title="Ayarlar" disabled={spinning || showModal || editOpen}>
          <span role="img" aria-label="ayarlar">⚙️</span>
        </button>
      </div>
      <Wheel options={options} size={wheelSize} rotation={rotation} />
      {showModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div className="modal-winner">
            <div style={{ fontSize: 24, marginBottom: 16, color: '#ffd700' }}>Kazanan:</div>
            <div style={{ fontSize: 32, fontWeight: "bold", marginBottom: 24, color: '#2d8cff' }}>{result}</div>
            <button className="button" onClick={closeModal}>Kapat</button>
          </div>
        </div>
      )}
      {/* Edit Panel */}
      <div className={`edit-panel${editOpen ? " open" : ""}`}>
        <h2>Çark Ayarları</h2>
        <div className="edit-list" style={{ maxHeight: 320, overflowY: 'auto', marginBottom: 18 }}>
          {editList.map((item, idx) => (
            <div className="edit-list-item" key={idx}>
              <input type="text" value={item.text} maxLength={20} onChange={e => handleEditChange(idx, "text", e.target.value)} placeholder="Yazı" />
              <input type="color" value={item.color} onChange={e => handleEditChange(idx, "color", e.target.value)} />
              <input type="number" min={0.5} max={5} step={0.1} value={item.size} onChange={e => handleEditChange(idx, "size", +e.target.value)} style={{ width: 60 }} />
              <button className="delete-btn" onClick={() => handleDelete(idx)} title="Sil">✕</button>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid #333a', paddingTop: 12 }}>
          <label>Yeni Dilim</label>
          <input type="text" value={newItem.text} maxLength={20} onChange={e => setNewItem({ ...newItem, text: e.target.value })} placeholder="Yazı" />
          <input type="color" value={newItem.color} onChange={e => setNewItem({ ...newItem, color: e.target.value })} />
          <input type="number" min={0.5} max={5} step={0.1} value={newItem.size} onChange={e => setNewItem({ ...newItem, size: +e.target.value })} style={{ width: 60 }} />
          <div style={{ marginTop: 18 }}>
            <label>Çark Boyutu: <b>{editWheelSize}</b></label>
            <input type="range" min={50} max={200} value={editWheelSize} onChange={e => setEditWheelSize(+e.target.value)} style={{ width: '100%' }} />
          </div>
          <div className="edit-actions">
            <button onClick={handleAdd}>Ekle</button>
            <button onClick={saveEdit}>Kaydet</button>
            <button onClick={closeEdit}>Kapat</button>
          </div>
        </div>
      </div>
      {/* Paneli açınca arka planı karart */}
      {editOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 1000 }} onClick={closeEdit} />}
    </div>
  );
}

export default App;
