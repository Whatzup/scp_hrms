import React, { useState } from 'react';
import { User, Employee } from '../types';
import { motion } from 'motion/react';
import { 
  UserPlus, Shield, ShieldCheck, Trash2, Key, CheckCircle, 
  AlertTriangle, Phone, Mail, UserCheck, RefreshCw, Eye, EyeOff
} from 'lucide-react';

interface UsersMgmtProps {
  users: User[];
  employees?: Employee[];
  onRefreshUsers: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
  currentUser: User;
}

export default function UsersMgmt({ users, employees = [], onRefreshUsers, onShowToast, currentUser }: UsersMgmtProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // New user form state
  const [newEmail, setNewEmail] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user');

  // Edit user form state
  const [editPassword, setEditPassword] = useState<string>('');
  const [editName, setEditName] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editRole, setEditRole] = useState<'admin' | 'user'>('user');
  const [editStatus, setEditStatus] = useState<string>('ACTIVE');

  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword || !newName) {
      onShowToast("Please fill in all required fields", "error");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          name: newName,
          phone: newPhone
        })
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch (e) {
        data = { error: `Server returned an invalid response (status ${res.status})` };
      }
      if (res.ok) {
        // If we want to set role to admin specifically
        if (newRole === 'admin' && data.user && data.user.id) {
          await fetch(`/api/users/${data.user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: 'admin' })
          });
        }
        
        onShowToast(`User ${newName} registered successfully!`, "success");
        setIsAdding(false);
        // Clear form
        setNewEmail('');
        setNewPassword('');
        setNewName('');
        setNewPhone('');
        setNewRole('user');
        onRefreshUsers();
      } else {
        onShowToast(data.error || "Failed to add user", "error");
      }
    } catch (err: any) {
      onShowToast(err.message || "An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          phone: editPhone,
          role: editRole,
          status: editStatus,
          password: editPassword || undefined
        })
      });

      if (res.ok) {
        onShowToast("User account updated successfully!", "success");
        setEditingUserId(null);
        onRefreshUsers();
      } else {
        let data: any = {};
        try {
          data = await res.json();
        } catch (e) {
          data = { error: `Server returned an invalid response (status ${res.status})` };
        }
        onShowToast(data.error || "Failed to update user", "error");
      }
    } catch (err: any) {
      onShowToast(err.message || "An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (user: User) => {
    setEditingUserId(user.id);
    setEditName(user.name);
    setEditPhone(user.phone || '');
    setEditRole(user.role);
    setEditStatus(user.status || 'ACTIVE');
    setEditPassword('');
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (id === currentUser.id) {
      onShowToast("You cannot delete your own logged-in account!", "error");
      return;
    }
    if (confirm(`Are you sure you want to delete user account: ${name}?`)) {
      try {
        setLoading(true);
        const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
        if (res.ok) {
          onShowToast("User deleted successfully", "success");
          onRefreshUsers();
        } else {
          onShowToast("Failed to delete user", "error");
        }
      } catch (err: any) {
        onShowToast(err.message || "An error occurred", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6" id="users-mgmt-view">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            User Access & Login Management
          </h2>
          <p className="text-xs text-slate-500">Configure administrative and field operator login accounts with secure credentials.</p>
        </div>
        
        <div className="flex items-center gap-2.5">
          <button 
            onClick={onRefreshUsers}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer border border-slate-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Create New Account
          </button>
        </div>
      </div>

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4"
        >
          <h3 className="text-xs font-black uppercase text-indigo-950 tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
            <UserPlus className="w-4 h-4 text-indigo-600" />
            Register New Login Account
          </h3>
          
          <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Full Name</label>
              <input 
                type="text" 
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Aijaz Khan"
                required
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-indigo-600 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Email (User ID)</label>
              <input 
                type="email" 
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="e.g. user@domain.com"
                required
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-indigo-600 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Login Password</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-indigo-600 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Phone (Optional)</label>
              <input 
                type="text" 
                value={newPhone}
                onChange={e => setNewPhone(e.target.value)}
                placeholder="e.g. +91 90000 00000"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-indigo-600 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">System Permission Role</label>
              <select 
                value={newRole}
                onChange={e => setNewRole(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-indigo-600 font-bold bg-white"
              >
                <option value="user">USER (Restricted / Read-Only views)</option>
                <option value="admin">ADMIN (Full unrestricted system control)</option>
              </select>
            </div>

            <div className="flex items-end justify-end gap-2 md:col-span-3">
              <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Save Account
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Users table */}
      <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50/50 border-b border-slate-150 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Active User Logins ({users.length})</span>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            Admin accounts are marked with indigo security badges.
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/40 text-slate-500 border-b border-slate-150 font-black tracking-wider uppercase">
                <th className="p-3 pl-4">Full Name</th>
                <th className="p-3">Email ID (Username)</th>
                <th className="p-3">Associated Employee</th>
                <th className="p-3">Mobile Contact</th>
                <th className="p-3">Security Role</th>
                <th className="p-3">Account Status</th>
                <th className="p-3 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => {
                const isEditing = editingUserId === u.id;
                const isSelf = u.id === currentUser.id;
                const linkedEmployee = employees.find(emp => emp.id === u.employeeId);
                
                return (
                  <tr key={u.id} className="hover:bg-slate-50/40 font-medium transition-all">
                    {/* NAME */}
                    <td className="p-3 pl-4">
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="p-1.5 border border-slate-200 rounded-lg text-xs font-bold focus:outline-indigo-600"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-indigo-50 text-indigo-700 font-bold rounded-full flex items-center justify-center text-[10px] tracking-tight">
                            {u.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 block">{u.name}</span>
                            {isSelf && <span className="text-[9px] font-black uppercase text-indigo-650 tracking-wider">Your Account</span>}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* EMAIL & PASSWORD */}
                    <td className="p-3 font-mono text-slate-600">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {u.email}
                        </div>
                        {u.password && (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                            <Key className="w-3 h-3 text-slate-400" />
                            <span className="bg-slate-50 border border-slate-100 px-1 py-0.5 rounded text-[10px]">
                              {showPasswords[u.id] ? u.password : '••••••'}
                            </span>
                            <button 
                              type="button"
                              onClick={() => togglePasswordVisibility(u.id)}
                              className="p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600 transition-all cursor-pointer"
                              title={showPasswords[u.id] ? "Hide Password" : "Reveal Password"}
                            >
                              {showPasswords[u.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* ASSOCIATED EMPLOYEE */}
                    <td className="p-3">
                      {linkedEmployee ? (
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-950 block">{linkedEmployee.name}</span>
                          <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md font-mono inline-block">
                            {linkedEmployee.employee_code || `ID: ${linkedEmployee.id}`}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-mono text-[9px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-150 inline-block font-bold">
                          System Admin/Staff
                        </span>
                      )}
                    </td>

                    {/* PHONE */}
                    <td className="p-3 text-slate-600">
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={editPhone}
                          onChange={e => setEditPhone(e.target.value)}
                          className="p-1.5 border border-slate-200 rounded-lg text-xs font-bold focus:outline-indigo-600"
                        />
                      ) : (
                        <div className="flex items-center gap-1 text-[11px]">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {u.phone || '—'}
                        </div>
                      )}
                    </td>

                    {/* ROLE */}
                    <td className="p-3">
                      {isEditing ? (
                        <select 
                          value={editRole}
                          onChange={e => setEditRole(e.target.value as any)}
                          className="p-1.5 border border-slate-200 rounded-lg text-xs font-bold bg-white"
                          disabled={isSelf} // Can't de-promote oneself in line easily here
                        >
                          <option value="user">USER</option>
                          <option value="admin">ADMIN</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-full ${
                          u.role === 'admin' 
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                            : 'bg-slate-100 text-slate-650'
                        }`}>
                          {u.role === 'admin' ? (
                            <>
                              <ShieldCheck className="w-3 h-3 text-indigo-600" />
                              Admin
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3 h-3 text-slate-500" />
                              User
                            </>
                          )}
                        </span>
                      )}
                    </td>

                    {/* STATUS */}
                    <td className="p-3">
                      {isEditing ? (
                        <select 
                          value={editStatus}
                          onChange={e => setEditStatus(e.target.value)}
                          className="p-1.5 border border-slate-200 rounded-lg text-xs font-bold bg-white"
                          disabled={isSelf}
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="SUSPENDED">SUSPENDED</option>
                        </select>
                      ) : (
                        <span className={`inline-block px-2 py-0.5 text-[9px] font-black rounded-full ${
                          (u.status || 'ACTIVE') === 'ACTIVE' 
                            ? 'bg-emerald-50 text-emerald-700 font-extrabold' 
                            : 'bg-rose-50 text-rose-700 font-extrabold'
                        }`}>
                          {u.status || 'ACTIVE'}
                        </span>
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td className="p-3 text-right pr-4">
                      {isEditing ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={() => handleSaveEdit(u.id)}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] rounded-lg transition-all cursor-pointer"
                            >
                              Save
                            </button>
                            <button 
                              onClick={() => setEditingUserId(null)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg transition-all cursor-pointer border border-slate-200"
                            >
                              Cancel
                            </button>
                          </div>
                          <div className="flex items-center justify-end gap-1 font-mono">
                            <Key className="w-3 h-3 text-slate-400" />
                            <input 
                              type="text"
                              placeholder="Reset Password"
                              value={editPassword}
                              onChange={e => setEditPassword(e.target.value)}
                              className="p-1 border border-slate-200 rounded-lg text-[10px] w-24 focus:outline-indigo-600"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => startEdit(u)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer"
                            title="Edit Account"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            disabled={isSelf}
                            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                              isSelf ? 'opacity-30 cursor-not-allowed text-slate-300' : 'text-slate-500 hover:text-red-600 hover:bg-red-50'
                            }`}
                            title={isSelf ? "Self deletion locked" : "Delete Account"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Informative credentials helper card */}
      <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-xs flex gap-3 text-indigo-950">
        <AlertTriangle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-extrabold">Login Policy & Permissions Enforcement</h4>
          <p className="text-[11px] text-slate-650 leading-relaxed">
            Registered accounts let employees sign in securely. If a user is given the <strong>USER</strong> role, they will operate with Restricted/Read-Only security permission privileges. They will not be permitted to modify clients, financial quotes, delete employees, or authorized payroll sheets. <strong>ADMIN</strong> role grants full write, deletion, and financial authorization capabilities.
          </p>
        </div>
      </div>
    </div>
  );
}
