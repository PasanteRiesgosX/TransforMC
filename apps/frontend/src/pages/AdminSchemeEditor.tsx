import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { getModuleIcon } from './AdminCatalog';
import {
  ChevronRight,
  ChevronDown,
  Zap,
  Pencil,
  Trash2,
  Package,
  ShieldAlert,
} from 'lucide-react';

const API = 'http://localhost:3000';

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const readError = (err: any, fallback: string) =>
  (Array.isArray(err.response?.data?.message)
    ? err.response?.data?.message[0]
    : err.response?.data?.message) ||
  err.response?.data?.error ||
  fallback;

const uid = (p: string) => `${p}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

interface Certifier {
  id: string;
  nombre: string;
  apellido: string;
  cargo?: string;
  rol: string;
}

// Vista normalizada de un paquete (unifica borrador local y esquema del backend)
interface ViewPaquete {
  key: string;
  id: string;
  nombre: string;
  itemIds: string[];
  userIds: string[];
  responsables: { id: string; nombre: string; apellido: string }[];
}

export const AdminSchemeEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const mode: 'create' | 'edit' = id ? 'edit' : 'create';
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);

  // Datos generales
  const [nombre, setNombre] = useState('');
  const [ambiente, setAmbiente] = useState<'Pruebas' | 'Producción'>('Pruebas');
  const [savingGeneral, setSavingGeneral] = useState(false);

  // Catálogo (picker) — carga perezosa por módulo
  const [modulos, setModulos] = useState<any[]>([]);
  const [moduloCache, setModuloCache] = useState<Record<string, any>>({});
  const [openModulos, setOpenModulos] = useState<Set<string>>(new Set());
  const [loadingModulos, setLoadingModulos] = useState<Set<string>>(new Set());

  // Selección en staging (casoPruebaId)
  const [staging, setStaging] = useState<Set<string>>(new Set());

  // Responsables candidatos
  const [certifiers, setCertifiers] = useState<Certifier[]>([]);

  // Modo crear: borrador en memoria. Modo editar: esquema del backend.
  const [draftPaquetes, setDraftPaquetes] = useState<
    { localId: string; nombre: string; userIds: string[]; itemIds: string[] }[]
  >([]);
  const [scheme, setScheme] = useState<any>(null);

  const [savingScheme, setSavingScheme] = useState(false);

  // Modal de paquete
  const [pqModal, setPqModal] = useState<{
    open: boolean;
    editId: string | null;
    nombre: string;
    userIds: string[];
  }>({ open: false, editId: null, nombre: '', userIds: [] });
  const [pqSaving, setPqSaving] = useState(false);
  const [pqError, setPqError] = useState('');

  // Confirmación de eliminar paquete (modo editar)
  const [deletePqTarget, setDeletePqTarget] = useState<ViewPaquete | null>(null);
  const [pqDeleting, setPqDeleting] = useState(false);

  // ── Carga inicial ────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchModulos(), fetchCertifiers(), mode === 'edit' ? fetchScheme() : Promise.resolve()]);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchModulos = async () => {
    try {
      const res = await axios.get(`${API}/api/modulos`, { headers: authHeaders() });
      setModulos(res.data);
    } catch (err: any) {
      showToast(readError(err, 'Error al cargar el catálogo'));
    }
  };

  const fetchCertifiers = async () => {
    try {
      const res = await axios.get(`${API}/users`, { headers: authHeaders() });
      setCertifiers((res.data as Certifier[]).filter((u) => u.rol === 'CERTIFIER'));
    } catch (err: any) {
      showToast(readError(err, 'Error al cargar los responsables'));
    }
  };

  const fetchScheme = async () => {
    try {
      const res = await axios.get(`${API}/api/esquemas/${id}`, { headers: authHeaders() });
      setScheme(res.data);
      setNombre(res.data.nombre);
      setAmbiente(res.data.ambiente);
    } catch (err: any) {
      showToast(readError(err, 'Error al cargar el esquema'));
      navigate('/admin/esquemas');
    }
  };

  const ensureModuloLoaded = async (moduloId: string): Promise<any> => {
    if (moduloCache[moduloId]) return moduloCache[moduloId];
    setLoadingModulos((s) => new Set(s).add(moduloId));
    try {
      const res = await axios.get(`${API}/api/modulos/${moduloId}`, { headers: authHeaders() });
      setModuloCache((c) => ({ ...c, [moduloId]: res.data }));
      return res.data;
    } catch (err: any) {
      showToast(readError(err, 'Error al cargar el módulo'));
      return null;
    } finally {
      setLoadingModulos((s) => {
        const n = new Set(s);
        n.delete(moduloId);
        return n;
      });
    }
  };

  // ── Paquetes normalizados + mapa de ítems tomados ────────────────
  const viewPaquetes: ViewPaquete[] =
    mode === 'edit'
      ? (scheme?.paquetes ?? []).map((p: any) => ({
          key: p.id,
          id: p.id,
          nombre: p.nombre,
          itemIds: p.itemIds,
          userIds: p.userIds,
          responsables: p.responsables,
        }))
      : draftPaquetes.map((p) => ({
          key: p.localId,
          id: p.localId,
          nombre: p.nombre,
          itemIds: p.itemIds,
          userIds: p.userIds,
          responsables: p.userIds
            .map((u) => certifiers.find((c) => c.id === u))
            .filter(Boolean) as Certifier[],
        }));

  const takenMap: Record<string, string> = {};
  viewPaquetes.forEach((p) => p.itemIds.forEach((iid) => { takenMap[iid] = p.nombre; }));

  const moduleItemIds = (detail: any): string[] =>
    detail.subModulos.flatMap((sm: any) => sm.casosPrueba.map((c: any) => c.id));

  // ── Handlers de selección ────────────────────────────────────────
  const toggleModulo = async (moduloId: string) => {
    if (openModulos.has(moduloId)) {
      setOpenModulos((s) => {
        const n = new Set(s);
        n.delete(moduloId);
        return n;
      });
    } else {
      setOpenModulos((s) => new Set(s).add(moduloId));
      if (!moduloCache[moduloId]) ensureModuloLoaded(moduloId);
    }
  };

  const toggleItem = (itemId: string, checked: boolean) => {
    if (takenMap[itemId]) return;
    setStaging((s) => {
      const n = new Set(s);
      checked ? n.add(itemId) : n.delete(itemId);
      return n;
    });
  };

  const setManyStaging = (ids: string[], checked: boolean) => {
    setStaging((s) => {
      const n = new Set(s);
      ids.forEach((i) => (checked ? n.add(i) : n.delete(i)));
      return n;
    });
  };

  const onModuleCheck = async (moduloId: string, checked: boolean) => {
    const detail = await ensureModuloLoaded(moduloId);
    if (!detail) return;
    const avail = moduleItemIds(detail).filter((i) => !takenMap[i]);
    setManyStaging(avail, checked);
  };

  const onSubCheck = (sub: any, checked: boolean) => {
    const avail = sub.casosPrueba.map((c: any) => c.id).filter((i: string) => !takenMap[i]);
    setManyStaging(avail, checked);
  };

  const quickAssignModule = async (mod: any) => {
    const detail = await ensureModuloLoaded(mod.id);
    if (!detail) return;
    const avail = moduleItemIds(detail).filter((i) => !takenMap[i]);
    if (avail.length === 0) {
      showToast('No hay ítems disponibles en este módulo');
      return;
    }
    setStaging(new Set(avail));
    openNewPaqueteModal(detail.nombre);
  };

  const quickAssignSub = (sub: any) => {
    const avail = sub.casosPrueba.map((c: any) => c.id).filter((i: string) => !takenMap[i]);
    if (avail.length === 0) {
      showToast('No hay ítems disponibles en esta sección');
      return;
    }
    setStaging(new Set(avail));
    openNewPaqueteModal(sub.nombre);
  };

  // ── Modal de paquete ─────────────────────────────────────────────
  const openNewPaqueteModal = (presetNombre: string) => {
    setPqError('');
    setPqModal({ open: true, editId: null, nombre: presetNombre, userIds: [] });
  };

  const openEditPaqueteModal = (p: ViewPaquete) => {
    setPqError('');
    setPqModal({ open: true, editId: p.id, nombre: p.nombre, userIds: [...p.userIds] });
  };

  const closePqModal = () => setPqModal((m) => ({ ...m, open: false }));

  const savePaquete = async () => {
    const nombrePq = pqModal.nombre.trim();
    if (!nombrePq) {
      setPqError('Ponle un nombre al paquete');
      return;
    }
    const userIds = pqModal.userIds;

    if (pqModal.editId) {
      // Editar paquete existente: SOLO nombre + responsables (nunca ítems)
      if (mode === 'edit') {
        setPqSaving(true);
        try {
          const res = await axios.patch(
            `${API}/api/paquetes/${pqModal.editId}`,
            { nombre: nombrePq, userIds },
            { headers: authHeaders() },
          );
          setScheme(res.data);
          showToast('Paquete actualizado');
          closePqModal();
        } catch (err: any) {
          setPqError(readError(err, 'Error al guardar el paquete'));
        } finally {
          setPqSaving(false);
        }
      } else {
        setDraftPaquetes((list) =>
          list.map((p) => (p.localId === pqModal.editId ? { ...p, nombre: nombrePq, userIds } : p)),
        );
        closePqModal();
      }
      return;
    }

    // Crear paquete nuevo: ítems desde el staging
    const itemIds = [...staging];
    if (itemIds.length === 0) {
      setPqError('Selecciona al menos un ítem para el paquete');
      return;
    }
    if (mode === 'edit') {
      setPqSaving(true);
      try {
        const res = await axios.post(
          `${API}/api/esquemas/${id}/paquetes`,
          { nombre: nombrePq, itemIds, userIds },
          { headers: authHeaders() },
        );
        setScheme(res.data);
        setStaging(new Set());
        showToast('Paquete creado');
        closePqModal();
      } catch (err: any) {
        setPqError(readError(err, 'Error al crear el paquete'));
      } finally {
        setPqSaving(false);
      }
    } else {
      setDraftPaquetes((list) => [...list, { localId: uid('pq'), nombre: nombrePq, userIds, itemIds }]);
      setStaging(new Set());
      closePqModal();
    }
  };

  // ── Eliminar paquete ─────────────────────────────────────────────
  const deletePaquete = (p: ViewPaquete) => {
    if (mode === 'edit') {
      setDeletePqTarget(p);
    } else {
      setDraftPaquetes((list) => list.filter((x) => x.localId !== p.id));
    }
  };

  const confirmDeletePaquete = async () => {
    if (!deletePqTarget) return;
    setPqDeleting(true);
    try {
      const res = await axios.delete(`${API}/api/paquetes/${deletePqTarget.id}`, {
        headers: authHeaders(),
      });
      setScheme(res.data);
      showToast('Paquete eliminado');
      setDeletePqTarget(null);
    } catch (err: any) {
      showToast(readError(err, 'Error al eliminar el paquete'));
    } finally {
      setPqDeleting(false);
    }
  };

  // ── Guardar esquema / datos generales ────────────────────────────
  const createScheme = async () => {
    if (draftPaquetes.length === 0) {
      showToast('Crea al menos un paquete de ítems antes de guardar el esquema.');
      return;
    }
    setSavingScheme(true);
    try {
      await axios.post(
        `${API}/api/esquemas`,
        {
          nombre: nombre.trim(),
          ambiente,
          paquetes: draftPaquetes.map((p) => ({
            nombre: p.nombre,
            itemIds: p.itemIds,
            userIds: p.userIds,
          })),
        },
        { headers: authHeaders() },
      );
      showToast('Esquema creado correctamente');
      navigate('/admin/esquemas');
    } catch (err: any) {
      showToast(readError(err, 'Error al crear el esquema'));
    } finally {
      setSavingScheme(false);
    }
  };

  const saveGeneral = async () => {
    setSavingGeneral(true);
    try {
      const res = await axios.patch(
        `${API}/api/esquemas/${id}`,
        { nombre: nombre.trim(), ambiente },
        { headers: authHeaders() },
      );
      setScheme(res.data);
      setNombre(res.data.nombre);
      setAmbiente(res.data.ambiente);
      showToast('Datos generales guardados');
    } catch (err: any) {
      showToast(readError(err, 'Error al guardar los datos generales'));
    } finally {
      setSavingGeneral(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-[var(--grayLight)]">Cargando esquema...</div>;
  }

  const sectionHeading = {
    fontWeight: 700,
    fontSize: 13,
    margin: '0 0 4px',
    color: 'var(--navy)',
  } as React.CSSProperties;

  return (
    <div className="fade-in">
      <div className="breadcrumbs">
        <Link to="/admin/esquemas">Esquemas de evaluación</Link>
        <span className="sep">/</span>
        <span className="current">
          {mode === 'edit' ? scheme?.nombre : 'Nuevo esquema'}
        </span>
      </div>

      <div className="page-head">
        <h1 className="page-title">
          {mode === 'edit' ? 'Editar esquema de evaluación' : 'Nuevo esquema de evaluación'}
        </h1>
        <p className="page-sub">
          Dale un nombre, elige el ambiente, selecciona los ítems a certificar y agrúpalos en
          paquetes — cada paquete se le asigna a uno o más responsables.
        </p>
      </div>

      {/* Datos generales */}
      <div className="panel" style={{ maxWidth: 760, marginBottom: 16 }}>
        <div className="grid-2">
          <Input
            label="Nombre del esquema"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Certificación HeadOffice — Pruebas"
            style={{ marginBottom: 0 } as React.CSSProperties}
          />
          <Select
            label="Ambiente"
            value={ambiente}
            onChange={(e) => setAmbiente(e.target.value as 'Pruebas' | 'Producción')}
            options={[
              { value: 'Pruebas', label: 'Pruebas' },
              { value: 'Producción', label: 'Producción' },
            ]}
          />
        </div>
        <div className="hint" style={{ marginTop: 10 }}>
          Si necesitas certificar los mismos módulos en pruebas y en producción, crea dos esquemas —
          uno por ambiente.
        </div>
        {mode === 'edit' && (
          <div className="mt-3 flex justify-end">
            <Button size="sm" onClick={saveGeneral} disabled={savingGeneral}>
              Guardar datos generales
            </Button>
          </div>
        )}
      </div>

      {/* Dos paneles */}
      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Panel izquierdo: picker */}
        <div className="panel">
          <p style={sectionHeading}>1. Elige los ítems a certificar</p>
          <p className="hint" style={{ marginBottom: 12 }}>
            Marca módulos, secciones o ítems sueltos — puedes combinar ítems de distintas secciones en
            un mismo paquete.
          </p>

          <div className="picker-tree">
            {modulos.length === 0 ? (
              <div className="picker-loading">No hay módulos en el catálogo todavía.</div>
            ) : (
              modulos.map((mod) => {
                const isOpen = openModulos.has(mod.id);
                const detail = moduloCache[mod.id];
                const isLoadingMod = loadingModulos.has(mod.id);
                const ModIcon = getModuleIcon(mod.nombre);

                let allSel = false;
                let modHasAvail = false;
                if (detail) {
                  const avail = moduleItemIds(detail).filter((i) => !takenMap[i]);
                  modHasAvail = avail.length > 0;
                  allSel = modHasAvail && avail.every((i) => staging.has(i));
                }

                return (
                  <div className="picker-mod" key={mod.id}>
                    <div className="picker-mod-head">
                      <span className="picker-caret" onClick={() => toggleModulo(mod.id)}>
                        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </span>
                      <input
                        type="checkbox"
                        checked={allSel}
                        disabled={!!detail && !modHasAvail}
                        onChange={(e) => onModuleCheck(mod.id, e.target.checked)}
                      />
                      <ModIcon size={15} />
                      <span className="picker-name" onClick={() => toggleModulo(mod.id)}>
                        {mod.nombre}
                      </span>
                      <button className="quick-assign" onClick={() => quickAssignModule(mod)}>
                        <Zap size={13} /> Asignar módulo completo
                      </button>
                    </div>

                    {isOpen &&
                      (isLoadingMod && !detail ? (
                        <div className="picker-loading">Cargando ítems...</div>
                      ) : detail ? (
                        detail.subModulos.map((sub: any) => {
                          const subAvail = sub.casosPrueba
                            .map((c: any) => c.id)
                            .filter((i: string) => !takenMap[i]);
                          const subAllSel =
                            subAvail.length > 0 && subAvail.every((i: string) => staging.has(i));
                          return (
                            <div key={sub.id}>
                              <div className="picker-sub-head">
                                <input
                                  type="checkbox"
                                  checked={subAllSel}
                                  disabled={subAvail.length === 0}
                                  onChange={(e) => onSubCheck(sub, e.target.checked)}
                                />
                                <span>{sub.nombre}</span>
                                <button className="quick-assign" onClick={() => quickAssignSub(sub)}>
                                  <Zap size={13} /> Asignar sección
                                </button>
                              </div>
                              {sub.casosPrueba.map((c: any) => {
                                const taken = takenMap[c.id];
                                return (
                                  <div
                                    key={c.id}
                                    className={`picker-item-row ${taken ? 'taken' : ''}`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={staging.has(c.id)}
                                      disabled={!!taken}
                                      onChange={(e) => toggleItem(c.id, e.target.checked)}
                                    />
                                    <span>{c.nombre}</span>
                                    {taken && (
                                      <span className="picker-item-taken-tag">en: {taken}</span>
                                    )}
                                  </div>
                                );
                              })}
                              {sub.casosPrueba.length === 0 && (
                                <div className="picker-item-row" style={{ color: 'var(--grayLight)' }}>
                                  (sin ítems)
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : null)}
                  </div>
                );
              })
            )}
          </div>

          {staging.size > 0 && (
            <div className="selection-bar">
              <span className="selection-bar-count">{staging.size} ítem(s) seleccionados</span>
              <Button size="sm" onClick={() => openNewPaqueteModal('')}>
                Crear paquete con esto →
              </Button>
            </div>
          )}
        </div>

        {/* Panel derecho: paquetes */}
        <div className="panel">
          <p style={sectionHeading}>2. Paquetes y responsables</p>
          <p className="hint" style={{ marginBottom: 12 }}>
            Cada paquete es un conjunto de ítems asignado a una o más personas.
          </p>

          {viewPaquetes.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 10px' }}>
              <div className="es-icon flex justify-center">
                <Package size={32} />
              </div>
              <div className="es-title">Todavía no hay paquetes</div>
              Selecciona ítems a la izquierda y arma tu primer paquete.
            </div>
          ) : (
            viewPaquetes.map((p) => (
              <div className="paquete-card" key={p.key}>
                <div className="paquete-card-top">
                  <span className="paquete-name">{p.nombre}</span>
                  <div className="flex gap-[6px]">
                    <button
                      className="icon-btn"
                      title="Renombrar / reasignar"
                      onClick={() => openEditPaqueteModal(p)}
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      className="icon-btn"
                      title="Eliminar paquete"
                      onClick={() => deletePaquete(p)}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <div className="paquete-meta">
                  {p.itemIds.length} ítem{p.itemIds.length !== 1 ? 's' : ''}
                </div>
                <div className="paquete-users">
                  {p.responsables.length > 0 ? (
                    p.responsables.map((u) => (
                      <span key={u.id} className="tag tag-neutral">
                        {u.nombre} {u.apellido}
                      </span>
                    ))
                  ) : (
                    <span className="tag tag-naranja">Sin responsable asignado</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pie */}
      <div className="modal-foot" style={{ border: 'none', paddingTop: 20 }}>
        <Button variant="ghost" onClick={() => navigate('/admin/esquemas')}>
          Cancelar
        </Button>
        {mode === 'create' ? (
          <Button onClick={createScheme} disabled={savingScheme}>
            Crear esquema
          </Button>
        ) : (
          <Button onClick={() => navigate('/admin/esquemas')}>Listo</Button>
        )}
      </div>

      {/* Modal crear / editar paquete */}
      <Modal
        isOpen={pqModal.open}
        onClose={closePqModal}
        title={pqModal.editId ? 'Editar paquete' : 'Nuevo paquete'}
        footer={
          <>
            <Button variant="ghost" onClick={closePqModal}>
              Cancelar
            </Button>
            <Button onClick={savePaquete} disabled={pqSaving}>
              {pqModal.editId ? 'Guardar cambios' : 'Crear paquete'}
            </Button>
          </>
        }
      >
        <Input
          label="Nombre del paquete"
          value={pqModal.nombre}
          onChange={(e) => setPqModal({ ...pqModal, nombre: e.target.value })}
          placeholder="Ej. HeadOffice — Box Office"
          autoFocus
        />
        {!pqModal.editId && (
          <div className="hint" style={{ margin: '-10px 0 14px' }}>
            {staging.size} ítem(s) seleccionados se incluirán en este paquete.
          </div>
        )}
        <div className="field">
          <label>Responsable(s)</label>
          <select
            multiple
            className="responsables-select"
            value={pqModal.userIds}
            onChange={(e) =>
              setPqModal({
                ...pqModal,
                userIds: Array.from(e.target.selectedOptions).map((o) => o.value),
              })
            }
          >
            {certifiers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre} {u.apellido}{u.cargo ? ` — ${u.cargo}` : ''}
              </option>
            ))}
          </select>
          <div className="hint">Ctrl/Cmd + clic para elegir varios. Puedes dejarlo sin responsable.</div>
        </div>
        {pqError && (
          <div className="text-[var(--rojo)] text-[12px] font-bold mt-1 bg-[var(--rojo-bg)] p-[6px_10px] rounded-[6px]">
            {pqError}
          </div>
        )}
      </Modal>

      {/* Confirmar eliminar paquete (modo editar) */}
      <Modal
        isOpen={!!deletePqTarget}
        onClose={() => setDeletePqTarget(null)}
        title="Eliminar paquete"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeletePqTarget(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmDeletePaquete} disabled={pqDeleting}>
              Eliminar
            </Button>
          </>
        }
      >
        <div className="flex flex-col items-center text-center py-2">
          <div className="w-[48px] h-[48px] rounded-full bg-[var(--rojo-bg)] text-[var(--rojo)] flex items-center justify-center mb-4">
            <ShieldAlert size={22} />
          </div>
          <p className="text-[14px] text-[var(--gray)] leading-relaxed">
            ¿Eliminar el paquete <b className="text-[var(--navy)]">{deletePqTarget?.nombre}</b>? Sus
            ítems quedarán disponibles nuevamente para incluirse en otro paquete de este esquema.
          </p>
        </div>
      </Modal>
    </div>
  );
};
