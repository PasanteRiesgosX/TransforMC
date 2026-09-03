import React, { useState, useEffect } from 'react';
import { useAuth, type User, type Role } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Modal } from '../components/ui/Modal';
import { Plus, Search, Pencil, X, ShieldAlert } from 'lucide-react';
import axios from 'axios';

export const AdminUsers: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Form state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cargo: '',
    email: '',
    role: 'CERTIFIER' as Role,
    password: ''
  });
  
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const mapped = res.data.map((u: any) => ({
        ...u,
        role: u.rol,
        forceChange: u.mustChangePassword
      }));
      // Sort to put admin first, then alphabetically
      const sorted = mapped.sort((a: User, b: User) => {
        if (a.email === 'admin@midominio.com') return -1;
        if (b.email === 'admin@midominio.com') return 1;
        return a.nombre.localeCompare(b.nombre);
      });
      setUsers(sorted);
    } catch (err) {
      console.error(err);
      showToast('Error al cargar los usuarios');
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      nombre: '',
      apellido: '',
      cargo: '',
      email: '',
      role: 'CERTIFIER',
      password: 'TemporalPassword123'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (u: any) => {
    setEditingUser(u);
    setFormData({
      nombre: u.nombre,
      apellido: u.apellido,
      cargo: u.cargo,
      email: u.email,
      role: u.role,
      password: '' // Not editable here
    });
    setIsModalOpen(true);
  };

  const handleSaveUser = async () => {
    // Validation
    if (!formData.nombre || !formData.apellido || !formData.email || !formData.cargo) {
      showToast('Todos los campos obligatorios deben estar llenos');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (editingUser) {
        // Edit
        await axios.patch(`http://localhost:3000/users/${editingUser.id}`, {
          nombre: formData.nombre,
          apellido: formData.apellido,
          cargo: formData.cargo,
          email: formData.email,
          rol: formData.role,
        }, { headers });
        showToast('Usuario actualizado correctamente');
      } else {
        // Create
        await axios.post('http://localhost:3000/users', {
          nombre: formData.nombre,
          apellido: formData.apellido,
          cargo: formData.cargo,
          email: formData.email,
          rol: formData.role,
          genericPassword: formData.password
        }, { headers });
        showToast('Usuario creado correctamente');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error al guardar el usuario');
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/users/${userToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Usuario eliminado correctamente');
      setIsDeleteModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error al eliminar usuario');
    }
  };

  const filteredUsers = users.filter(u => 
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h1 className="page-title mb-1">Usuarios</h1>
        <p className="page-sub">
          Aquí creas y administras las cuentas de las personas que van a certificar. Nadie puede registrarse por su cuenta: tú les das una contraseña genérica y ellos la cambian en su primer ingreso.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="relative w-full max-w-[320px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-[var(--grayLight)]" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            className="w-full bg-white border border-[var(--border)] text-[var(--navy)] py-2 pl-9 pr-3 rounded-lg text-[13px] outline-none transition-colors focus:border-[var(--cian)] focus:ring-2 focus:ring-[var(--cian-bg)]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Button onClick={openCreateModal} variant="outline" icon={<Plus size={16} />} iconPosition="left">
          Nuevo usuario
        </Button>
      </div>

      {/* Tarjetas de Usuarios - Grid */}
      <div className="cards-grid">
        {filteredUsers.map((u, index) => {
          const isMasterAdmin = u.email === 'admin@midominio.com';
          const isCurrentUser = currentUser?.id === u.id;

          return (
            <div key={u.id} className="user-card">
              <div className="user-card-top">
                <Avatar size="lg" name={u.nombre} lastName={u.apellido} colorIndex={index} />
                <div>
                  <div className="user-card-name">
                    {u.nombre} {u.apellido}
                  </div>
                  <div className="user-card-cargo">{u.cargo}</div>
                </div>
              </div>
              
              <div className="user-card-mail">
                {u.email}
              </div>

              <div className="user-card-foot">
                <div className="user-card-tags">
                  <Badge color={u.role === 'ADMIN' ? 'cian' : 'neutral'}>
                    {u.role === 'ADMIN' ? 'Administrador' : 'Usuario'}
                  </Badge>
                  
                  {u.forceChange ? (
                    <Badge color="naranja">Clave pendiente</Badge>
                  ) : (
                    <Badge color="teal">Activo</Badge>
                  )}
                </div>
                
                <div className="flex gap-[6px]">
                  <button 
                    onClick={() => openEditModal(u)}
                    className="icon-btn"
                    title="Editar usuario"
                  >
                    <Pencil size={12} />
                  </button>
                  {!isMasterAdmin && !isCurrentUser && (
                    <button 
                      onClick={() => { setUserToDelete(u); setIsDeleteModalOpen(true); }}
                      className="icon-btn hover:bg-[var(--rojo-bg)] hover:text-[var(--rojo)]"
                      title="Eliminar usuario"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-16 text-[var(--grayLight)]">
          <Search size={40} className="mx-auto mb-4 opacity-50" />
          <p className="font-semibold text-[15px] text-[var(--navy)]">No se encontraron usuarios</p>
          <p className="text-[13px]">Intenta con otros términos de búsqueda.</p>
        </div>
      )}

      {/* Modal Crear/Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Editar usuario' : 'Nuevo usuario'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveUser}>{editingUser ? 'Guardar cambios' : 'Crear usuario'}</Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Nombre" 
            placeholder="Ej. Juan"
            value={formData.nombre}
            onChange={e => setFormData({...formData, nombre: e.target.value})}
          />
          <Input 
            label="Apellido" 
            placeholder="Ej. Pérez"
            value={formData.apellido}
            onChange={e => setFormData({...formData, apellido: e.target.value})}
          />
        </div>
        
        <Input 
          label="Cargo" 
          placeholder="Ej. Analista QA"
          value={formData.cargo}
          onChange={e => setFormData({...formData, cargo: e.target.value})}
        />
        
        <Input 
          label="Correo electrónico" 
          type="email"
          placeholder="juan.perez@midominio.com"
          value={formData.email}
          onChange={e => setFormData({...formData, email: e.target.value})}
        />
        
        <Select 
          label="Tipo de perfil"
          value={formData.role}
          onChange={e => setFormData({...formData, role: e.target.value as Role})}
          disabled={editingUser?.email === 'admin@midominio.com'} // Master admin role is locked
          options={[
            { value: 'CERTIFIER', label: 'Usuario (Certificador)' },
            { value: 'ADMIN', label: 'Administrador' }
          ]}
          hint={editingUser?.email === 'admin@midominio.com' ? 'El rol de la cuenta principal no puede ser modificado.' : ''}
        />

        {!editingUser && (
          <Input 
            label="Contraseña genérica" 
            value={formData.password}
            onChange={e => setFormData({...formData, password: e.target.value})}
            hint="El usuario deberá cambiarla en su primer ingreso."
          />
        )}
      </Modal>

      {/* Modal Eliminar */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Eliminar usuario"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
            <Button variant="danger" onClick={confirmDelete}>Eliminar</Button>
          </>
        }
      >
        <div className="flex flex-col items-center text-center py-2">
          <div className="w-[48px] h-[48px] rounded-full bg-[var(--naranja-bg)] text-[var(--naranjaFuerte)] flex items-center justify-center mb-4">
            <ShieldAlert size={22} />
          </div>
          <p className="text-[14px] text-[var(--gray)] leading-relaxed">
            ¿Estás seguro de que deseas eliminar al usuario <br />
            <strong className="text-[var(--navy)]">{userToDelete?.nombre} {userToDelete?.apellido}</strong>?<br />
            Esta acción no se puede deshacer.
          </p>
        </div>
      </Modal>

    </div>
  );
};
