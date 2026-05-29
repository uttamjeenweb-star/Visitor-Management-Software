import React, { useState, useEffect } from "react";
import api from "../../shared/services/api";
import { getRoles, createRole, updateRole, deleteRole } from "@/master/rolePermissionCalling";

export const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [view, setView] = useState('list');
  const [editingRole, setEditingRole] = useState(null);

  const [name, setName] = useState("");
  const [dataScope, setDataScope] = useState("personal");
  const [permissions, setPermissions] = useState([]);

  // Categorized Modules
  const masterDataModules = ["Employee", "Department", "VisitorType", "VisitingArea", "Purpose", "CarryWith", "IdType", "Location"];
  const systemSettingsModules = ["Role", "CompanyRegister"];
  const dashboardModules = ["Dashboard"];
  const reportModules = ["Report", "Print"];
  
  const allModules = [...masterDataModules, ...systemSettingsModules, ...dashboardModules, ...reportModules];

  const fetchRoles = async () => {
    try {
      const rolesData = await getRoles();
      setRoles(rolesData);
    } catch (err) {
      setError("Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleOpenForm = (role = null) => {
    if (role) {
      setEditingRole(role);
      setName(role.name);
      setDataScope(role.dataScope || "personal");
      setPermissions(role.permissions || []);
    } else {
      setEditingRole(null);
      setName("");
      setDataScope("personal");
      setPermissions([]);
    }
    setView('form');
  };

  const handleCloseForm = () => {
    setView('list');
    setEditingRole(null);
  };

  const handlePermissionChange = (module, field, value, isDashboardAction = false) => {
    setPermissions(prev => {
      const existing = prev.find(p => p.module === module) || { 
        module, canRead: false, canCreate: false, canUpdate: false, canDelete: false, dashboardActions: {} 
      };
      
      let updated = { ...existing };

      if (isDashboardAction) {
        updated.dashboardActions = {
          ...updated.dashboardActions,
          [field]: value
        };
      } else {
        updated[field] = value;
      }

      return prev.find(p => p.module === module) 
        ? prev.map(p => p.module === module ? updated : p) 
        : [...prev, updated];
    });
  };

  const handleBulkPermissionChange = (updates) => {
    setPermissions(prev => {
      let next = [...prev];
      updates.forEach(({ module, field, value, isDashboardAction }) => {
        const index = next.findIndex(p => p.module === module);
        let updated = index !== -1 ? { ...next[index] } : { 
          module, canRead: false, canCreate: false, canUpdate: false, canDelete: false, dashboardActions: {} 
        };
        
        if (isDashboardAction) {
          updated.dashboardActions = {
            ...updated.dashboardActions,
            [field]: value
          };
        } else {
          updated[field] = value;
        }

        if (index !== -1) {
          next[index] = updated;
        } else {
          next.push(updated);
        }
      });
      return next;
    });
  };

  const handleSelectAllCrud = (module, checked) => {
    handleBulkPermissionChange([
      { module, field: 'canRead', value: checked },
      { module, field: 'canCreate', value: checked },
      { module, field: 'canUpdate', value: checked },
      { module, field: 'canDelete', value: checked }
    ]);
  };

  const handleSelectAllCategory = (category, checked) => {
    let updates = [];
    if (category === 'master') {
      masterDataModules.forEach(module => {
        updates.push({ module, field: 'canRead', value: checked });
        updates.push({ module, field: 'canCreate', value: checked });
        updates.push({ module, field: 'canUpdate', value: checked });
        updates.push({ module, field: 'canDelete', value: checked });
      });
    } else if (category === 'system') {
      systemSettingsModules.forEach(module => {
        updates.push({ module, field: 'canRead', value: checked });
        updates.push({ module, field: 'canCreate', value: checked });
        updates.push({ module, field: 'canUpdate', value: checked });
        updates.push({ module, field: 'canDelete', value: checked });
      });
    } else if (category === 'dashboard') {
      dashboardModules.forEach(module => {
        ['check_in', 'check_out', 'print', 'view_detail', 'create_pass', 'approve', 'reject'].forEach(action => {
          updates.push({ module, field: action, value: checked, isDashboardAction: true });
        });
        ['view_requested_list', 'view_pending_approval_list', 'view_rejected_list', 'view_approved_list', 'view_inside_list', 'view_multi_day_list', 'view_exited_list', 'view_expired_list'].forEach(list => {
          updates.push({ module, field: list, value: checked, isDashboardAction: true });
        });
      });
    } else if (category === 'report') {
      reportModules.forEach(module => {
        const actionsList = module === 'Report' ? ['view', 'export'] : ['print_setting', 'print'];
        actionsList.forEach(action => {
          updates.push({ module, field: action, value: checked, isDashboardAction: true });
        });
      });
    }
    handleBulkPermissionChange(updates);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Clean up permissions to prevent Prisma nested create errors
      let cleanPermissions = permissions.map(({ id, roleId, createdAt, updatedAt, ...rest }) => rest);
      
      // Enforce data scope strictness on the frontend before sending
      if (dataScope === "personal") {
        cleanPermissions = cleanPermissions.filter(p => !masterDataModules.includes(p.module) && !reportModules.includes(p.module));
      }

      if (editingRole) {
        await updateRole(editingRole.id, { name, dataScope, permissions: cleanPermissions });
      } else {
        await createRole({ name, dataScope, permissions: cleanPermissions });
      }
      handleCloseForm();
      fetchRoles();
    } catch (err) {
      console.error(err);
      alert("Error saving role: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      try {
        await deleteRole(id);
        fetchRoles();
      } catch (err) {
        alert(err.response?.data?.message || "Error deleting role");
      }
    }
  };

  if (view === 'form') {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{editingRole ? "Edit Role" : "Create Role"}</h1>
          <button onClick={handleCloseForm} className="text-gray-600 hover:text-gray-800 font-medium">
            &larr; Back to Roles
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Role Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Guard, Manager, Super Admin"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Data Visibility Scope</label>
              <select
                value={dataScope}
                onChange={(e) => setDataScope(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="personal">Personal (Own Records Only)</option>
                <option value="departmental">Departmental (Department Records)</option>
                <option value="global">Global (All Records)</option>
              </select>
            </div>
          </div>

          <h3 className="font-semibold mb-6 text-gray-800 text-lg border-b pb-3">Permissions Configuration</h3>
          
          <div className="space-y-10">
            {/* Master Data Category */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-700">Master Data Permissions</h4>
                <label className={`flex items-center gap-1 cursor-pointer text-sm font-semibold px-3 py-1 rounded ${dataScope === "personal" ? "text-gray-400 bg-gray-100 cursor-not-allowed" : "text-blue-600 bg-blue-50"}`}>
                  <input type="checkbox" disabled={dataScope === "personal"} onChange={(e) => handleSelectAllCategory('master', e.target.checked)} className={dataScope === "personal" ? "text-gray-400" : "text-blue-600"} /> Select All Master Data
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {masterDataModules.map(module => {
                  const p = permissions.find(x => x.module === module) || {};
                  const allChecked = p.canRead && p.canCreate && p.canUpdate && p.canDelete;
                  return (
                    <div key={module} className="border rounded-lg bg-gray-50 p-4 flex justify-between items-center">
                      <span className="font-medium text-gray-800">{module}</span>
                      <div className="flex gap-3 text-sm">
                        <label className={`flex items-center gap-1 cursor-pointer font-semibold border-r pr-3 border-gray-300 ${dataScope === "personal" ? "text-gray-400 cursor-not-allowed" : "text-gray-700"}`}>
                          <input type="checkbox" disabled={dataScope === "personal"} checked={!!allChecked && dataScope !== "personal"} onChange={(e) => handleSelectAllCrud(module, e.target.checked)} className={dataScope === "personal" ? "text-gray-400" : "text-blue-600"} /> All
                        </label>
                        <label className={`flex items-center gap-1 cursor-pointer ${dataScope === "personal" ? "text-gray-400 cursor-not-allowed" : ""}`}>
                          <input type="checkbox" disabled={dataScope === "personal"} checked={!!p.canRead && dataScope !== "personal"} onChange={(e) => handlePermissionChange(module, 'canRead', e.target.checked)} className={dataScope === "personal" ? "text-gray-400" : "text-blue-600"} /> Read
                        </label>
                        <label className={`flex items-center gap-1 cursor-pointer ${dataScope === "personal" ? "text-gray-400 cursor-not-allowed" : ""}`}>
                          <input type="checkbox" disabled={dataScope === "personal"} checked={!!p.canCreate && dataScope !== "personal"} onChange={(e) => handlePermissionChange(module, 'canCreate', e.target.checked)} className={dataScope === "personal" ? "text-gray-400" : "text-blue-600"} /> Create
                        </label>
                        <label className={`flex items-center gap-1 cursor-pointer ${dataScope === "personal" ? "text-gray-400 cursor-not-allowed" : ""}`}>
                          <input type="checkbox" disabled={dataScope === "personal"} checked={!!p.canUpdate && dataScope !== "personal"} onChange={(e) => handlePermissionChange(module, 'canUpdate', e.target.checked)} className={dataScope === "personal" ? "text-gray-400" : "text-blue-600"} /> Update
                        </label>
                        <label className={`flex items-center gap-1 cursor-pointer ${dataScope === "personal" ? "text-gray-400 cursor-not-allowed" : ""}`}>
                          <input type="checkbox" disabled={dataScope === "personal"} checked={!!p.canDelete && dataScope !== "personal"} onChange={(e) => handlePermissionChange(module, 'canDelete', e.target.checked)} className={dataScope === "personal" ? "text-gray-400" : "text-blue-600"} /> Delete
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* System Settings Category */}
            <div>
              <div className="flex items-center justify-between mb-4 mt-6">
                <h4 className="text-lg font-bold text-gray-700">System Settings Permissions</h4>
                <label className="flex items-center gap-1 cursor-pointer text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded">
                  <input type="checkbox" onChange={(e) => handleSelectAllCategory('system', e.target.checked)} className="text-blue-600" /> Select All Settings
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {systemSettingsModules.map(module => {
                  const p = permissions.find(x => x.module === module) || {};
                  const allChecked = p.canRead && p.canCreate && p.canUpdate && p.canDelete;
                  return (
                    <div key={module} className="border rounded-lg bg-gray-50 p-4 flex justify-between items-center">
                      <span className="font-medium text-gray-800">{module === "CompanyRegister" ? "Company Info" : module}</span>
                      <div className="flex gap-3 text-sm">
                        <label className="flex items-center gap-1 cursor-pointer font-semibold text-gray-700 border-r pr-3 border-gray-300">
                          <input type="checkbox" checked={!!allChecked} onChange={(e) => handleSelectAllCrud(module, e.target.checked)} className="text-blue-600" /> All
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input type="checkbox" checked={!!p.canRead} onChange={(e) => handlePermissionChange(module, 'canRead', e.target.checked)} className="text-blue-600" /> Read
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input type="checkbox" checked={!!p.canCreate} onChange={(e) => handlePermissionChange(module, 'canCreate', e.target.checked)} className="text-blue-600" /> Create
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input type="checkbox" checked={!!p.canUpdate} onChange={(e) => handlePermissionChange(module, 'canUpdate', e.target.checked)} className="text-blue-600" /> Update
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input type="checkbox" checked={!!p.canDelete} onChange={(e) => handlePermissionChange(module, 'canDelete', e.target.checked)} className="text-blue-600" /> Delete
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dashboard Category */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-700">Dashboard Features</h4>
                <label className="flex items-center gap-1 cursor-pointer text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded">
                  <input type="checkbox" onChange={(e) => handleSelectAllCategory('dashboard', e.target.checked)} className="text-blue-600" /> Select All Dashboard
                </label>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {dashboardModules.map(module => {
                  const p = permissions.find(x => x.module === module) || {};
                  const dActions = p.dashboardActions || {};
                  return (
                    <div key={module} className="border rounded-lg bg-gray-50 p-4">
                      <div className="font-medium text-gray-800 mb-3 text-lg border-b pb-2">{module} Actions</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {['check_in', 'check_out', 'print', 'view_detail', 'create_pass', 'approve', 'reject'].map(action => (
                          <label key={action} className="flex items-center gap-2 cursor-pointer text-sm">
                            <input type="checkbox" checked={!!dActions[action]} onChange={(e) => handlePermissionChange(module, action, e.target.checked, true)} className="text-blue-600 w-4 h-4" />
                            {action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </label>
                        ))}
                      </div>
                      
                      <div className="font-medium text-gray-800 mb-3 text-lg border-b pb-2 mt-4">List Visibilities</div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {['view_requested_list', 'view_pending_approval_list', 'view_rejected_list', 'view_approved_list', 'view_inside_list', 'view_multi_day_list', 'view_exited_list', 'view_expired_list'].map(list => (
                          <label key={list} className="flex items-center gap-2 cursor-pointer text-sm">
                            <input type="checkbox" checked={!!dActions[list]} onChange={(e) => handlePermissionChange(module, list, e.target.checked, true)} className="text-blue-600 w-4 h-4" />
                            {list.replace(/view_|_list/g, '').replace(/\b\w/g, l => l.toUpperCase())} Pass List
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Report & Print Category */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-700">Print & Report Features</h4>
                <label className={`flex items-center gap-1 cursor-pointer text-sm font-semibold px-3 py-1 rounded ${dataScope === "personal" ? "text-gray-400 bg-gray-100 cursor-not-allowed" : "text-blue-600 bg-blue-50"}`}>
                  <input type="checkbox" disabled={dataScope === "personal"} onChange={(e) => handleSelectAllCategory('report', e.target.checked)} className={dataScope === "personal" ? "text-gray-400" : "text-blue-600"} /> Select All Report & Print
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportModules.map(module => {
                  const p = permissions.find(x => x.module === module) || {};
                  const dActions = p.dashboardActions || {};
                  const actionsList = module === 'Report' ? ['view', 'export'] : ['print_setting', 'print'];
                  return (
                    <div key={module} className="border rounded-lg bg-gray-50 p-4">
                      <span className="font-medium text-gray-800 block mb-3">{module}</span>
                      <div className="flex gap-4 text-sm flex-wrap">
                        {actionsList.map(action => (
                          <label key={action} className={`flex items-center gap-2 cursor-pointer ${dataScope === "personal" ? "text-gray-400 cursor-not-allowed" : ""}`}>
                            <input type="checkbox" disabled={dataScope === "personal"} checked={!!dActions[action] && dataScope !== "personal"} onChange={(e) => handlePermissionChange(module, action, e.target.checked, true)} className={`w-4 h-4 ${dataScope === "personal" ? "text-gray-400" : "text-blue-600"}`} />
                            {action === 'print_setting' ? 'Print Setting' : action.replace(/^\w/, c => c.toUpperCase())}
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          <div className="mt-8 flex justify-end gap-3 border-t border-gray-200 pt-6">
            <button onClick={handleCloseForm} className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">Cancel</button>
            <button onClick={handleSubmit} className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">Save Role</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
          <p className="text-gray-500 mt-1">Create and manage roles and their access permissions.</p>
        </div>
        <button onClick={() => handleOpenForm()} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700">+ Create Role</button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12 text-gray-500">Loading roles...</div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border">{error}</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm tracking-wider uppercase text-gray-500">
                <th className="p-5 font-semibold w-1/4">Role Name</th>
                <th className="p-5 font-semibold w-2/4">Modules Accessed</th>
                <th className="p-5 font-semibold text-right w-1/4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {roles.map(role => (
                <tr key={role.id} className="hover:bg-gray-50">
                  <td className="p-5 font-medium text-gray-900">{role.name}</td>
                  <td className="p-5 text-sm flex flex-wrap gap-2">
                    {role.permissions.filter(p => p.canRead || p.canCreate || p.canUpdate || p.canDelete || Object.keys(p.dashboardActions || {}).some(k => p.dashboardActions[k])).map(p => (
                      <span key={p.id} className="inline-flex items-center bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-md text-xs font-semibold">
                        {p.module}
                      </span>
                    ))}
                  </td>
                  <td className="p-5 text-right">
                    <button onClick={() => handleOpenForm(role)} className="text-blue-600 hover:text-blue-800 font-semibold mr-4">Edit</button>
                    <button onClick={() => handleDelete(role.id)} className="text-red-600 hover:text-red-800 font-semibold">Delete</button>
                  </td>
                </tr>
              ))}
              {roles.length === 0 && (
                <tr><td colSpan="3" className="p-12 text-center text-gray-500">No roles have been created yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
