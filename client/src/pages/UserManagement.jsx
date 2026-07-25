import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FiPlus, FiTrash2, FiShield } from 'react-icons/fi';
import api from '../services/api';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import Select from '../components/Common/Select';
import Modal from '../components/Common/Modal';
import Badge from '../components/Common/Badge';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load user directory');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData) => {
    try {
      await api.post('/users', formData);
      toast.success('Team member created successfully!');
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create user');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User removed');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="loading-screen min-h-[350px]">
        <div className="spinner" />
        <p>Loading team directory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight flex items-center gap-2">
            <FiShield className="w-7 h-7 text-indigo-400" />
            <span>Team Members</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage admin and member accounts and roles.</p>
        </div>
        <Button
          variant="primary"
          icon={FiPlus}
          onClick={() => setShowModal(true)}
        >
          Add Member
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {users.map((u) => (
          <div
            key={u._id}
            className="bg-[#12122b]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-4 group relative hover:border-white/20 transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-bold text-white shadow-md">
                {u.name.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={() => handleDelete(u._id)}
                className="p-2 rounded-lg bg-white/5 border border-white/10 opacity-0 group-hover:opacity-100 hover:bg-red-500/15 hover:border-red-500/20 hover:text-red-400 transition-all text-slate-400"
                title="Delete User"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="font-heading font-bold text-base text-white">{u.name}</h3>
              <p className="text-xs text-slate-400 truncate">{u.email}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <Badge value={u.role} />
              <span className="text-[10px] text-slate-500">Joined {new Date(u.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add New Team Member"
        maxWidth="max-w-md"
      >
        <CreateUserForm onClose={() => setShowModal(false)} onSubmit={handleCreate} />
      </Modal>
    </div>
  );
};

const CreateUserForm = ({ onClose, onSubmit }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  const roleOptions = [
    { value: 'member', label: 'Member' },
    { value: 'admin', label: 'Admin' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Full Name" name="name" value={form.name} onChange={handleChange} required />
      <Input label="Email Address" type="email" name="email" value={form.email} onChange={handleChange} required />
      <Input label="Password" type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} />
      <Select label="Role" name="role" value={form.role} onChange={handleChange} options={roleOptions} />

      <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="primary">Create User</Button>
      </div>
    </form>
  );
};

export default UserManagement;
