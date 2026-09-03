import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { getModuleIcon } from './AdminCatalog';
import { Plus, Trash2, Pencil, ShieldAlert, ChevronRight } from 'lucide-react';

const colors = ['cian', 'morado', 'magenta', 'naranja', 'teal'];

function getHashIndex(str: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % max;
}

export const AdminCatalogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [modulo, setModulo] = useState<any>(null);
  const [activeSubModuloId, setActiveSubModuloId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'submodulo' | 'clasificador' | 'caso' | 'deleteModulo' | 'deleteSubModulo' | 'deleteClasificador' | 'deleteCaso';
    mode: 'create' | 'edit' | 'delete';
    entityId?: string; // For edit/delete
    defaultClasificadorId?: string;
  }>({ isOpen: false, type: 'submodulo', mode: 'create' });

  const [formData, setFormData] = useState({ nombre: '', clasificadorId: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchModulo();
  }, [id]);

  const fetchModulo = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:3000/api/modulos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModulo(res.data);
      if (res.data.subModulos.length > 0 && !activeSubModuloId) {
        setActiveSubModuloId(res.data.subModulos[0].id);
      }
    } catch (err: any) {
      showToast((Array.isArray(err.response?.data?.message) ? err.response?.data?.message[0] : err.response?.data?.message) || err.response?.data?.error || 'Error al cargar el módulo');
      navigate('/admin/catalogo');
    } finally {
      setLoading(false);
    }
  };

  const activeSubModulo = modulo?.subModulos.find((sm: any) => sm.id === activeSubModuloId);

  const openModal = (type: any, mode: any, entityId?: string, extraData?: any) => {
    setModalState({ isOpen: true, type, mode, entityId, defaultClasificadorId: extraData?.defaultClasificadorId });
    setErrorMsg('');
    if (mode === 'create') {
      setFormData({ nombre: '', clasificadorId: extraData?.defaultClasificadorId || '' });
    } else if (mode === 'edit' && extraData) {
      setFormData({ nombre: extraData.nombre, clasificadorId: extraData.clasificadorId || '' });
    }
  };

  const handleSave = async () => {
    if (['submodulo', 'clasificador', 'caso'].includes(modalState.type) && !formData.nombre) {
      setErrorMsg('El nombre es obligatorio.');
      return;
    }
    setErrorMsg('');
    setIsSaving(true);
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      if (modalState.type === 'submodulo') {
        if (modalState.mode === 'create') {
          await axios.post(`http://localhost:3000/api/modulos/${id}/submodulos`, { nombre: formData.nombre }, { headers });
          showToast('SubMódulo creado');
        } else if (modalState.mode === 'edit') {
          await axios.patch(`http://localhost:3000/api/submodulos/${modalState.entityId}`, { nombre: formData.nombre }, { headers });
          showToast('SubMódulo actualizado');
        }
      } else if (modalState.type === 'clasificador') {
        if (modalState.mode === 'create') {
          await axios.post(`http://localhost:3000/api/submodulos/${activeSubModuloId}/clasificadores`, { nombre: formData.nombre }, { headers });
          showToast('Clasificador creado');
        } else if (modalState.mode === 'edit') {
          await axios.patch(`http://localhost:3000/api/clasificadores/${modalState.entityId}`, { nombre: formData.nombre }, { headers });
          showToast('Clasificador actualizado');
        }
      } else if (modalState.type === 'caso') {
        const payload = { 
          nombre: formData.nombre, 
          clasificadorId: formData.clasificadorId || null 
        };
        if (modalState.mode === 'create') {
          await axios.post(`http://localhost:3000/api/submodulos/${activeSubModuloId}/casos`, payload, { headers });
          showToast('Caso de prueba creado');
        } else if (modalState.mode === 'edit') {
          await axios.patch(`http://localhost:3000/api/casos/${modalState.entityId}`, payload, { headers });
          showToast('Caso de prueba actualizado');
        }
      }
      setModalState({ ...modalState, isOpen: false });
      await fetchModulo();
    } catch (err: any) {
      setErrorMsg((Array.isArray(err.response?.data?.message) ? err.response?.data?.message[0] : err.response?.data?.message) || err.response?.data?.error || 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsSaving(true);
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      if (modalState.type === 'deleteModulo') {
        await axios.delete(`http://localhost:3000/api/modulos/${id}`, { headers });
        showToast('Módulo eliminado');
        navigate('/admin/catalogo');
        return;
      } else if (modalState.type === 'deleteSubModulo') {
        await axios.delete(`http://localhost:3000/api/submodulos/${modalState.entityId}`, { headers });
        showToast('SubMódulo eliminado');
        setActiveSubModuloId(null);
      } else if (modalState.type === 'deleteClasificador') {
        await axios.delete(`http://localhost:3000/api/clasificadores/${modalState.entityId}`, { headers });
        showToast('Clasificador eliminado');
      } else if (modalState.type === 'deleteCaso') {
        await axios.delete(`http://localhost:3000/api/casos/${modalState.entityId}`, { headers });
        showToast('Caso de prueba eliminado');
      }
      setModalState({ ...modalState, isOpen: false });
      await fetchModulo();
    } catch (err: any) {
      showToast((Array.isArray(err.response?.data?.message) ? err.response?.data?.message[0] : err.response?.data?.message) || err.response?.data?.error || 'Error al eliminar');
      setModalState({ ...modalState, isOpen: false });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !modulo) return <div className="p-8 text-center text-[var(--grayLight)]">Cargando módulo...</div>;

  const IconComponent = getModuleIcon(modulo.nombre);
  const colorName = colors[getHashIndex(modulo.id, colors.length)];
  const bgVar = `var(--${colorName}-bg)`;
  const colorVar = `var(--${colorName})`;

  const casosSuenos = activeSubModulo?.casosPrueba.filter((c: any) => !c.clasificadorId) || [];

  return (
    <div className="fade-in">
      <div className="flex items-center text-[13px] font-[600] text-[var(--grayLight)] mb-6">
        <Link to="/admin/catalogo" className="hover:text-[var(--navy)] transition-colors">Catálogo</Link>
        <ChevronRight size={14} className="mx-2 opacity-60" />
        <span className="text-[var(--navy)]">{modulo.nombre}</span>
      </div>

      <div className="bg-white border border-[var(--border)] rounded-[16px] p-[24px] shadow-[0_2px_8px_rgba(30,34,51,0.06)] mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-[16px]">
            <div 
              className="w-[48px] h-[48px] rounded-[12px] flex items-center justify-center shrink-0"
              style={{ backgroundColor: bgVar, color: colorVar }}
            >
              <IconComponent size={22} />
            </div>
            <div>
              <h1 className="text-[20px] font-[700] text-[var(--navy)] leading-tight">{modulo.nombre}</h1>
              <div className="text-[13px] font-[400] text-[var(--grayLight)] mt-[2px]">
                {modulo.version ? `Versión ${modulo.version}` : 'Sin versión'} · {modulo.subModulos.length} submódulos
              </div>
            </div>
          </div>
          <div className="flex items-center gap-[12px]">
            <Button variant="outline" onClick={() => openModal('submodulo', 'create')} icon={<Plus size={16} />} iconPosition="left">
              SubMódulo
            </Button>
            <Button variant="danger" onClick={() => openModal('deleteModulo', 'delete')}>
              Eliminar módulo
            </Button>
          </div>
        </div>
      </div>

      {modulo.subModulos.length > 0 ? (
        <div className="mb-6 flex gap-[8px] overflow-x-auto pb-2 scrollbar-hide">
          {modulo.subModulos.map((sm: any) => (
            <button
              key={sm.id}
              onClick={() => setActiveSubModuloId(sm.id)}
              className={`whitespace-nowrap px-[16px] py-[8px] rounded-[20px] text-[13px] font-[700] transition-colors ${
                activeSubModuloId === sm.id
                  ? 'bg-[var(--cian)] text-white'
                  : 'bg-[var(--border)] text-[var(--gray)] hover:bg-[#DDE2EE]'
              }`}
            >
              {sm.nombre} <span className="opacity-70 font-[400]">({sm.casosPrueba.length})</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-[var(--grayLight)]">
          <p className="font-semibold text-[15px] text-[var(--navy)]">No hay submódulos</p>
          <p className="text-[13px] mb-4">Crea el primer submódulo para comenzar a agregar casos de prueba.</p>
        </div>
      )}

      {activeSubModulo && (
        <div className="bg-white border border-[var(--border)] rounded-[16px] shadow-[0_2px_8px_rgba(30,34,51,0.06)] overflow-hidden fade-in">
          {/* SubModulo Header */}
          <div className="bg-[var(--bg)] p-[16px_24px] border-b border-[var(--border)] flex justify-between items-center">
            <h2 className="text-[16px] font-[700] text-[var(--navy)]">{activeSubModulo.nombre}</h2>
            <div className="flex items-center gap-[8px]">
              <button 
                onClick={() => openModal('clasificador', 'create')}
                className="border border-[var(--border)] bg-white text-[var(--gray)] text-[12px] font-[700] px-[12px] py-[6px] rounded-[6px] transition-colors hover:bg-[var(--bg)] flex items-center gap-[6px]"
              >
                <Plus size={14} />
                Clasificador
              </button>
              <button 
                onClick={() => openModal('caso', 'create')}
                className="border border-[var(--border)] bg-white text-[var(--gray)] text-[12px] font-[700] px-[12px] py-[6px] rounded-[6px] transition-colors hover:bg-[var(--bg)] flex items-center gap-[6px]"
              >
                <Plus size={14} />
                Caso de Prueba
              </button>
              <button 
                onClick={() => openModal('deleteSubModulo', 'delete', activeSubModulo.id)}
                className="w-[30px] h-[30px] flex items-center justify-center rounded-[6px] text-[var(--grayLight)] hover:bg-[var(--rojo-bg)] hover:text-[var(--rojo)] transition-colors ml-1"
                title="Eliminar submódulo"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          <div className="p-[24px]">
            {activeSubModulo.casosPrueba.length === 0 && activeSubModulo.clasificadores.length === 0 ? (
              <div className="text-center py-10 text-[var(--grayLight)]">
                Todavía no hay casos de prueba en este submódulo.
              </div>
            ) : (
              <div className="flex flex-col gap-[24px]">
                {/* Casos sueltos */}
                {casosSuenos.length > 0 && (
                  <div className="flex flex-col gap-[8px]">
                    {casosSuenos.map((c: any) => (
                      <CasoItem key={c.id} caso={c} openModal={openModal} />
                    ))}
                  </div>
                )}

                {/* Por clasificador */}
                {activeSubModulo.clasificadores.map((clas: any) => {
                  const casos = activeSubModulo.casosPrueba.filter((c: any) => c.clasificadorId === clas.id);
                  return (
                    <div key={clas.id}>
                      <div className="flex items-center justify-between mb-[12px] group">
                        <h3 className="text-[12px] font-[700] text-[var(--gray)] uppercase tracking-[0.02em]">{clas.nombre}</h3>
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-[4px] transition-opacity">
                          <button 
                            onClick={() => openModal('clasificador', 'edit', clas.id, { nombre: clas.nombre })}
                            className="w-[24px] h-[24px] flex items-center justify-center rounded-[4px] bg-[var(--bg)] text-[var(--grayLight)] hover:text-[var(--cian)]"
                          >
                            <Pencil size={11} />
                          </button>
                          <button 
                            onClick={() => openModal('deleteClasificador', 'delete', clas.id)}
                            className="w-[24px] h-[24px] flex items-center justify-center rounded-[4px] bg-[var(--bg)] text-[var(--grayLight)] hover:text-[var(--rojo)] hover:bg-[var(--rojo-bg)]"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                      
                      {casos.length > 0 ? (
                        <div className="flex flex-col gap-[8px]">
                          {casos.map((c: any) => (
                            <CasoItem key={c.id} caso={c} openModal={openModal} />
                          ))}
                        </div>
                      ) : (
                        <div className="text-[13px] text-[var(--grayLight)] py-2 border border-dashed border-[var(--border)] rounded-[8px] text-center bg-[var(--bg)] bg-opacity-50">
                          No hay casos en esta clasificación.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODALS */}
      <Modal
        isOpen={modalState.isOpen && ['submodulo', 'clasificador', 'caso'].includes(modalState.type)}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        title={`${modalState.mode === 'create' ? 'Nuevo' : 'Editar'} ${
          modalState.type === 'submodulo' ? 'submódulo' : modalState.type === 'clasificador' ? 'clasificador' : 'caso de prueba'
        }`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalState({ ...modalState, isOpen: false })}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving}>Guardar</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input 
            label="Nombre *" 
            placeholder="Ingresa el nombre"
            value={formData.nombre}
            onChange={e => setFormData({...formData, nombre: e.target.value})}
            autoFocus
          />
          {modalState.type === 'caso' && activeSubModulo?.clasificadores.length > 0 && (
            <Select
              label="Clasificador (Opcional)"
              value={formData.clasificadorId}
              onChange={e => setFormData({...formData, clasificadorId: e.target.value})}
              options={[
                { value: '', label: 'Sin clasificador' },
                ...activeSubModulo.clasificadores.map((c: any) => ({ value: c.id, label: c.nombre }))
              ]}
            />
          )}
          {errorMsg && (
            <div className="text-[var(--rojo)] text-[12px] font-bold mt-1 bg-[var(--rojo-bg)] p-[6px_10px] rounded-[6px]">
              {errorMsg}
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={modalState.isOpen && modalState.type.startsWith('delete')}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        title="Confirmar eliminación"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalState({ ...modalState, isOpen: false })}>Cancelar</Button>
            <Button variant="danger" onClick={handleDelete} disabled={isSaving}>Eliminar</Button>
          </>
        }
      >
        <div className="flex flex-col items-center text-center py-2">
          <div className="w-[48px] h-[48px] rounded-full bg-[var(--rojo-bg)] text-[var(--rojo)] flex items-center justify-center mb-4">
            <ShieldAlert size={22} />
          </div>
          <p className="text-[14px] text-[var(--gray)] leading-relaxed">
            {modalState.type === 'deleteModulo' && '¿Estás seguro de que deseas eliminar este módulo? Se borrarán en cascada todos sus submódulos, clasificadores y casos de prueba.'}
            {modalState.type === 'deleteSubModulo' && '¿Estás seguro de que deseas eliminar este submódulo? Se borrarán en cascada todos sus clasificadores y casos de prueba.'}
            {modalState.type === 'deleteClasificador' && '¿Eliminar este clasificador? Los casos de prueba que agrupa no se eliminan, solo dejarán de estar agrupados.'}
            {modalState.type === 'deleteCaso' && '¿Estás seguro de que deseas eliminar este caso de prueba?'}
            <br /><br />Esta acción no se puede deshacer.
          </p>
        </div>
      </Modal>

    </div>
  );
};

const CasoItem = ({ caso, openModal }: { caso: any, openModal: any }) => {
  return (
    <div className="flex items-center justify-between p-[12px_16px] bg-white border border-[var(--border)] rounded-[8px] group hover:border-[var(--cian)] transition-colors">
      <div className="text-[13.5px] font-[600] text-[var(--navy)]">{caso.nombre}</div>
      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-[6px] transition-opacity">
        <button 
          onClick={() => openModal('caso', 'edit', caso.id, { nombre: caso.nombre, clasificadorId: caso.clasificadorId })}
          className="w-[26px] h-[26px] flex items-center justify-center rounded-[6px] bg-[var(--bg)] text-[var(--grayLight)] hover:text-[var(--cian)] transition-colors"
          title="Editar"
        >
          <Pencil size={12} />
        </button>
        <button 
          onClick={() => openModal('deleteCaso', 'delete', caso.id)}
          className="w-[26px] h-[26px] flex items-center justify-center rounded-[6px] bg-[var(--bg)] text-[var(--grayLight)] hover:bg-[var(--rojo-bg)] hover:text-[var(--rojo)] transition-colors"
          title="Eliminar"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
};
