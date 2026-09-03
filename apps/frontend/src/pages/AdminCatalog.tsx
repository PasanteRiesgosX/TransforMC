import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { 
  Search, Plus, 
  Clapperboard, Ticket, CreditCard, Building2, Archive, 
  Video, Banknote, ShoppingCart, Receipt, Bot, Monitor, 
  DoorOpen, Package
} from 'lucide-react';

const colors = ['cian', 'morado', 'magenta', 'naranja', 'teal'];

function getHashIndex(str: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % max;
}

export const getModuleIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('film') || lower.includes('program')) return Clapperboard;
  if (lower.includes('voucher') || lower.includes('vmanagement')) return Ticket;
  if (lower.includes('loyalty')) return CreditCard;
  if (lower.includes('head office') || lower.includes('headoffice')) return Building2;
  if (lower.includes('back office') || lower.includes('backoffice')) return Archive;
  if (lower.includes('cinema manager')) return Video;
  if (lower.includes('cash desk')) return Banknote;
  if (lower.includes('kiosco trade') || lower.includes('trade')) return ShoppingCart;
  if (lower.includes('pos')) return Receipt;
  if (lower.includes('ta ia') || lower.includes('ia interactive')) return Bot;
  if (lower.includes('kiosco vista') || lower.includes('kiosk')) return Monitor;
  if (lower.includes('usher')) return DoorOpen;
  return Package;
};

export const AdminCatalog: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [modulos, setModulos] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', version: '', conjunto: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchModulos();
  }, []);

  const fetchModulos = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/api/modulos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModulos(res.data);
    } catch (err: any) {
      showToast((Array.isArray(err.response?.data?.message) ? err.response?.data?.message[0] : err.response?.data?.message) || err.response?.data?.error || 'Error al cargar los módulos');
    }
  };

  const handleSaveModulo = async () => {
    if (!formData.nombre) {
      setErrorMsg('El nombre es obligatorio.');
      return;
    }
    setErrorMsg('');
    setIsSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/modulos', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Módulo creado correctamente');
      setIsModalOpen(false);
      fetchModulos();
    } catch (err: any) {
      setErrorMsg((Array.isArray(err.response?.data?.message) ? err.response?.data?.message[0] : err.response?.data?.message) || err.response?.data?.error || 'Error al guardar el módulo');
    } finally {
      setIsSaving(false);
    }
  };

  const openCreateModal = () => {
    setFormData({ nombre: '', version: '', conjunto: '' });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const searchResults = useMemo(() => {
    if (!searchTerm) return [];
    const term = searchTerm.toLowerCase();
    const results: any[] = [];
    
    modulos.forEach(m => {
      if (m.nombre.toLowerCase().includes(term)) {
        results.push({ type: 'módulo', name: m.nombre, location: m.nombre, link: `/admin/catalogo/${m.id}` });
      }
      m.subModulos?.forEach((sm: any) => {
        if (sm.nombre.toLowerCase().includes(term)) {
          results.push({ type: 'submódulo', name: sm.nombre, location: `${m.nombre} › ${sm.nombre}`, link: `/admin/catalogo/${m.id}` });
        }
        sm.casosPrueba?.forEach((cp: any) => {
          if (cp.nombre.toLowerCase().includes(term)) {
            results.push({ type: 'caso de prueba', name: cp.nombre, location: `${m.nombre} › ${sm.nombre}`, link: `/admin/catalogo/${m.id}` });
          }
        });
      });
    });
    return results;
  }, [modulos, searchTerm]);

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h1 className="text-[23px] font-[700] text-[var(--navy)] mb-1">Catálogo de Pruebas</h1>
        <p className="text-[13px] font-[400] text-[var(--grayLight)]">
          Administra los módulos, submódulos y casos de prueba del sistema.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="relative w-full max-w-[420px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-[var(--grayLight)]" />
          </div>
          <input
            type="text"
            placeholder="Buscar módulo, submódulo o caso de prueba..."
            className="w-full bg-white border border-[var(--border)] text-[var(--navy)] py-2 pl-9 pr-3 rounded-[6px] text-[13px] outline-none transition-colors focus:border-[var(--cian)] focus:ring-2 focus:ring-[var(--cian-bg)]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Button onClick={openCreateModal} variant="primary" icon={<Plus size={16} />} iconPosition="left">
          Nuevo módulo
        </Button>
      </div>

      {!searchTerm ? (
        <div className="grid gap-[14px] sm:gap-[16px]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
          {modulos.map((m) => {
            const IconComponent = getModuleIcon(m.nombre);
            const colorName = colors[getHashIndex(m.id, colors.length)];
            const bgVar = `var(--${colorName}-bg)`;
            const colorVar = `var(--${colorName})`;

            return (
              <div 
                key={m.id} 
                className="bg-white border border-[var(--border)] rounded-[16px] p-[18px_22px] shadow-[0_2px_8px_rgba(30,34,51,0.06)] cursor-pointer transition-all hover:border-[var(--cian)]"
                onClick={() => navigate(`/admin/catalogo/${m.id}`)}
              >
                <div className="flex items-center gap-[12px] mb-3">
                  <div 
                    className="w-[42px] h-[42px] rounded-[12px] flex items-center justify-center shrink-0"
                    style={{ backgroundColor: bgVar, color: colorVar }}
                  >
                    <IconComponent size={19} />
                  </div>
                  <div>
                    <div className="text-[14.5px] font-[700] text-[var(--navy)] leading-tight">{m.nombre}</div>
                    <div className="text-[12px] font-[400] text-[var(--grayLight)] mt-[2px]">{m.version || 'Sin versión'}</div>
                  </div>
                </div>
                <div className="text-[12px] text-[var(--grayLight)]">
                  {m._count.subModulos} submódulos · {m._count.casosPrueba} casos de prueba
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-[var(--border)] rounded-[16px] overflow-hidden shadow-[0_2px_8px_rgba(30,34,51,0.06)]">
          {searchResults.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--bg)] border-b border-[var(--border)]">
                  <th className="p-[12px_16px] text-[12px] font-[700] text-[var(--gray)]">Coincidencia</th>
                  <th className="p-[12px_16px] text-[12px] font-[700] text-[var(--gray)]">Tipo</th>
                  <th className="p-[12px_16px] text-[12px] font-[700] text-[var(--gray)]">Ubicación</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((r, i) => (
                  <tr 
                    key={i} 
                    className="border-b border-[var(--border)] hover:bg-[var(--bg)] cursor-pointer transition-colors"
                    onClick={() => navigate(r.link)}
                  >
                    <td className="p-[12px_16px] text-[13.5px] font-[700] text-[var(--navy)]">{r.name}</td>
                    <td className="p-[12px_16px] text-[12px] font-[400] text-[var(--grayLight)] capitalize">{r.type}</td>
                    <td className="p-[12px_16px] text-[12px] font-[400] text-[var(--grayLight)]">{r.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16 text-[var(--grayLight)]">
              <Search size={40} className="mx-auto mb-4 opacity-50" />
              <p className="font-semibold text-[15px] text-[var(--navy)]">No se encontraron resultados</p>
              <p className="text-[13px]">Intenta con otros términos de búsqueda.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Nuevo Módulo */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nuevo módulo"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveModulo} disabled={isSaving}>Crear módulo</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div>
            <Input 
              label="Nombre del módulo *" 
              placeholder="Ej. POS, Loyalty..."
              value={formData.nombre}
              onChange={e => setFormData({...formData, nombre: e.target.value})}
            />
            {errorMsg && (
              <div className="text-[var(--rojo)] text-[12px] font-bold mt-1 bg-[var(--rojo-bg)] p-[6px_10px] rounded-[6px]">
                {errorMsg}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Versión (Opcional)" 
              placeholder="Ej. 1.0.0"
              value={formData.version}
              onChange={e => setFormData({...formData, version: e.target.value})}
            />
            <Input 
              label="Conjunto (Opcional)" 
              placeholder="Ej. Vista"
              value={formData.conjunto}
              onChange={e => setFormData({...formData, conjunto: e.target.value})}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
