import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Shield, User, X } from 'lucide-react';
import './Users.css';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  lastActive: string;
  createdAt: string;
}

const mockUsers: UserData[] = [
  { id: '1', name: 'Admin User', email: 'admin@teleaon.ai', role: 'admin', status: 'active', lastActive: '2 min ago', createdAt: '2024-01-01' },
  { id: '2', name: 'John Doe', email: 'john@example.com', role: 'user', status: 'active', lastActive: '15 min ago', createdAt: '2024-01-15' },
  { id: '3', name: 'Jane Smith', email: 'jane@example.com', role: 'user', status: 'active', lastActive: '1 hour ago', createdAt: '2024-01-20' },
  { id: '4', name: 'Bob Wilson', email: 'bob@example.com', role: 'user', status: 'inactive', lastActive: '3 days ago', createdAt: '2024-02-01' },
  { id: '5', name: 'Alice Brown', email: 'alice@example.com', role: 'user', status: 'active', lastActive: '5 min ago', createdAt: '2024-02-05' },
];

interface UserFormData {
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
}

const emptyFormData: UserFormData = {
  name: '',
  email: '',
  role: 'user',
  status: 'active',
};

export default function AdminUsers() {
  const [users, setUsers] = useState(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState<UserFormData>(emptyFormData);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData(emptyFormData);
    setShowModal(true);
  };

  const handleEditUser = (user: UserData) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setShowModal(true);
  };

  const handleSaveUser = () => {
    if (!formData.name || !formData.email) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingUser) {
      // Update existing user
      setUsers(users.map((u) =>
        u.id === editingUser.id
          ? { ...u, ...formData }
          : u
      ));
    } else {
      // Add new user
      const newUser: UserData = {
        id: String(Date.now()),
        ...formData,
        lastActive: 'Just now',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setUsers([...users, newUser]);
    }
    setShowModal(false);
    setFormData(emptyFormData);
    setEditingUser(null);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm(id);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm) {
      setUsers(users.filter((u) => u.id !== deleteConfirm));
      setDeleteConfirm(null);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData(emptyFormData);
    setEditingUser(null);
  };

  return (
    <div className="users-page animate-fade-in">
      <div className="users-header">
        <div className="search-box">
          <div className="input-with-icon">
            <Search size={18} className="input-icon" />
            <input
              type="text"
              className="input"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleAddUser}>
          <Plus size={18} /> Add User
        </button>
      </div>

      <div className="users-table glass-card">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Active</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="user-cell">
                    <div className="avatar avatar-sm">
                      {user.name.charAt(0)}
                    </div>
                    <div className="user-info">
                      <span className="user-name">{user.name}</span>
                      <span className="user-email">{user.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge ${user.role === 'admin' ? 'badge-purple' : 'badge-primary'}`}>
                    {user.role === 'admin' ? <Shield size={12} /> : <User size={12} />}
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`badge ${user.status === 'active' ? 'badge-success' : ''}`}>
                    <span className={`status-dot ${user.status === 'active' ? 'online' : 'offline'}`}></span>
                    {user.status}
                  </span>
                </td>
                <td className="text-muted">{user.lastActive}</td>
                <td className="text-muted">{user.createdAt}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-icon btn-ghost btn-sm"
                      title="Edit"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="btn-icon btn-ghost btn-sm btn-danger"
                      title="Delete"
                      onClick={() => handleDeleteClick(user.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button className="btn-icon btn-ghost" onClick={handleCloseModal}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="input-group">
                <label className="input-label">Name *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Enter name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Email *</label>
                <input
                  type="email"
                  className="input"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Role</label>
                <select
                  className="input select"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Status</label>
                <select
                  className="input select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={handleCloseModal}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveUser}>
                {editingUser ? 'Save Changes' : 'Add User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal modal-sm glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Delete</h3>
              <button className="btn-icon btn-ghost" onClick={() => setDeleteConfirm(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this user? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleConfirmDelete}>
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
