'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';

// Prevent SSR for this component
const UsersPageContent = dynamic(() => Promise.resolve(({ session, status }: { session: any; status: string }) => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form data when closing modals
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: '',
      active: true,
    });
    setSelectedUser(null);
  };

  // Handle edit user click
  const handleEditClick = (user: UserRecord) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email,
      password: '', // Don't populate password
      role: user.role,
      active: user.active,
    });
    setShowEditUserModal(true);
  };

  // Handle delete user
  const handleDeleteClick = async (user: UserRecord) => {
    // Check if trying to delete self
    if (session?.user?.email === user.email) {
      toast.error('You cannot delete your own account');
      return;
    }

    // Check if this is the last admin
    const adminUsers = users.filter(u => u.role === 'admin' && u.active);
    if (user.role === 'admin' && adminUsers.length <= 1) {
      toast.error('Cannot delete the last admin account');
      return;
    }

    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete user');
      }

      // Remove user from the list
      setUsers((prevUsers) => prevUsers.filter((u) => u.id !== user.id));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete user');
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsSubmitting(true);

    try {
      // First update user data
      const userData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        active: formData.active,
      };

      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user');
      }

      // If password is provided, update it separately
      if (formData.password) {
        const passwordResponse = await fetch(`/api/users/${selectedUser.id}/password`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password: formData.password }),
        });

        if (!passwordResponse.ok) {
          throw new Error('Failed to update password');
        }
      }

      // Update user in the list
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === selectedUser.id ? data.user : user
        )
      );

      // Reset form and close modal
      resetForm();
      setShowEditUserModal(false);
      toast.success('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchUsers();
    }
  }, [status]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      // Add new user to the list
      setUsers((prevUsers) => [data.user, ...prevUsers]);
      
      // Reset form and close modal
      resetForm();
      setShowAddUserModal(false);
      toast.success('User created successfully');
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const columns = [
    {
      key: 'name',
      title: 'Name',
      render: (record: UserRecord) => (
        <div>
          <div className="font-medium text-dark-100">{record.name || 'N/A'}</div>
          <div className="text-dark-400 text-sm">{record.email}</div>
        </div>
      ),
    },
    {
      key: 'role',
      title: 'Role',
      render: (record: UserRecord) => {
        let colorClass = '';
        switch (record.role) {
          case 'admin':
            colorClass = 'bg-purple-500/10 text-purple-400';
            break;
          case 'data_entry':
            colorClass = 'bg-blue-500/10 text-blue-400';
            break;
          case 'viewer':
            colorClass = 'bg-green-500/10 text-green-400';
            break;
          case 'auditor':
            colorClass = 'bg-amber-500/10 text-amber-400';
            break;
        }
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
            {record.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        );
      },
    },
    {
      key: 'lastLogin',
      title: 'Last Login',
      render: (record: UserRecord) => (
        <span className="text-dark-300">
          {record.lastLogin ? format(new Date(record.lastLogin), 'MMM d, yyyy h:mm a') : 'Never'}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (record: UserRecord) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            record.active ? 'bg-green-500/10 text-green-400' : 'bg-dark-500/50 text-dark-400'
          }`}
        >
          {record.active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (record: UserRecord) => {
        const isCurrentUser = session?.user?.email === record.email;
        const isLastAdmin = record.role === 'admin' && users.filter(u => u.role === 'admin' && u.active).length <= 1;
        
        return (
        <div className="flex space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleEditClick(record)}
            >
              Edit
            </Button>
            <div className="relative group">
              <Button
                size="sm"
                variant="ghost"
                className={`text-red-400 hover:text-red-300 ${
                  (isCurrentUser || isLastAdmin) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => !isCurrentUser && !isLastAdmin && handleDeleteClick(record)}
                disabled={isCurrentUser || isLastAdmin}
              >
                Delete
              </Button>
              {(isCurrentUser || isLastAdmin) && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-sm text-white bg-dark-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  {isCurrentUser 
                    ? 'Cannot delete your own account' 
                    : 'Cannot delete the last admin account'}
                </div>
              )}
            </div>
        </div>
        );
      },
    },
  ];

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-dark-100">Users</h1>
        <p className="mt-1 text-dark-300">Manage your system users</p>
      </div>

      <Card className="mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between md:space-y-0 space-y-2 py-2 px-4">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                className="h-5 w-5 text-dark-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="block w-full pl-10 pr-3 py-1.5 bg-dark-700 border border-dark-600 rounded-md leading-5 text-dark-100 placeholder-dark-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>

            <Button
              leftIcon={
                <svg
                  className="h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
              }
              onClick={() => setShowAddUserModal(true)}
            >
              Add User
            </Button>
        </div>
      </Card>

      <div className="bg-dark-700 border border-dark-600 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-dark-300">No users found</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-dark-600">
            <thead className="bg-dark-800">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider"
                  >
                    {column.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-600">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-dark-600">
                  {columns.map((column) => (
                    <td key={`${user.id}-${column.key}`} className="px-6 py-4 whitespace-nowrap">
                      {column.render(user)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit User Modal */}
      {showEditUserModal && (
        <div className="fixed inset-0 bg-dark-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-dark-700 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-dark-100">Edit User</h3>
                <button
                  type="button"
                  className="text-dark-400 hover:text-dark-200"
                  onClick={() => {
                    setShowEditUserModal(false);
                    resetForm();
                  }}
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-dark-200">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full bg-dark-800 border-dark-600 rounded-md shadow-sm text-dark-100 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Enter name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-dark-200">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full bg-dark-800 border-dark-600 rounded-md shadow-sm text-dark-100 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Enter email"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-dark-200">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="mt-1 block w-full bg-dark-800 border-dark-600 rounded-md shadow-sm text-dark-100 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Leave blank to keep current password"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-dark-200">
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    required
                    value={formData.role}
                    onChange={handleInputChange}
                    className="mt-1 block w-full bg-dark-800 border-dark-600 rounded-md shadow-sm text-dark-100 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="">Select role</option>
                    <option value="admin">Admin</option>
                    <option value="data_entry">Data Entry</option>
                    <option value="viewer">Viewer</option>
                    <option value="auditor">Auditor</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    name="active"
                    checked={formData.active}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        active: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-dark-600 rounded bg-dark-800"
                  />
                  <label htmlFor="active" className="ml-2 block text-sm text-dark-200">
                    Active
                  </label>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowEditUserModal(false);
                      resetForm();
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-dark-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-dark-700 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-dark-100">Add New User</h3>
                <button
                  type="button"
                  className="text-dark-400 hover:text-dark-200"
                  onClick={() => setShowAddUserModal(false)}
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-dark-200">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full bg-dark-800 border-dark-600 rounded-md shadow-sm text-dark-100 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Enter name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-dark-200">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full bg-dark-800 border-dark-600 rounded-md shadow-sm text-dark-100 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Enter email"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-dark-200">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="mt-1 block w-full bg-dark-800 border-dark-600 rounded-md shadow-sm text-dark-100 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Enter password"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-dark-200">
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    required
                    value={formData.role}
                    onChange={handleInputChange}
                    className="mt-1 block w-full bg-dark-800 border-dark-600 rounded-md shadow-sm text-dark-100 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="">Select role</option>
                    <option value="admin">Admin</option>
                    <option value="data_entry">Data Entry</option>
                    <option value="viewer">Viewer</option>
                    <option value="auditor">Auditor</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowAddUserModal(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Save'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}), { ssr: false });

interface UserRecord {
  id: number;
  name: string | null;
  email: string;
  role: 'admin' | 'data_entry' | 'viewer' | 'auditor';
  lastLogin: string | null;
  active: boolean;
  createdAt: string;
}

const UsersPage = () => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-dark-300">Please sign in to view this page</div>
      </div>
    );
  }

  return <UsersPageContent session={session} status={status} />;
};

export default UsersPage; 