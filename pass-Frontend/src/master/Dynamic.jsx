import { useState, useMemo } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { Eye, EyeOff } from "lucide-react";
// ─── Default status colors ───────────────────────────────────────────────────
const DEFAULT_STATUS_COLORS = {
  active: "bg-green-50 text-green-800 border border-green-200",
  blocked: "bg-amber-50 text-amber-800 border border-amber-200",
  deleted: "bg-red-50 text-red-800 border border-red-200",
};
// ─── Helpers ─────────────────────────────────────────────────────────────────
function getNestedValue(obj, key) {
  return key.split(".").reduce((acc, part) => {
    if (acc && typeof acc === "object") {
      return acc[part];
    }
    return undefined;
  }, obj);
}
function displayValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

const SearchableSelect = ({ field, value, onChange, options }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const filtered = options.filter(o => {
    const lbl = typeof o === "object" ? o.label : o;
    return lbl.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  const selectedObj = options.find(o => {
    const v = typeof o === "object" ? o.value : o;
    return v === value;
  });
  const displayLabel = selectedObj ? (typeof selectedObj === "object" ? selectedObj.label : selectedObj) : `Select ${field.label}...`;

  return (
    <div className="relative">
      <div 
        className="dynamic-input cursor-pointer flex justify-between items-center bg-white" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate text-gray-700">{displayLabel}</span>
        <span className="text-gray-400 text-xs">▼</span>
      </div>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
            <div className="sticky top-0 bg-white p-2 border-b border-gray-100">
              <input 
                type="text" 
                className="w-full p-1.5 border border-gray-200 rounded text-sm outline-none focus:border-blue-500" 
                placeholder="Type to search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onClick={e => e.stopPropagation()}
                autoFocus
              />
            </div>
            {filtered.length === 0 ? <div className="p-3 text-sm text-gray-500 text-center">No results found</div> : null}
            {filtered.map((opt, i) => {
               const v = typeof opt === "object" ? opt.value : opt;
               const l = typeof opt === "object" ? opt.label : opt;
               return (
                 <div 
                   key={v || i}
                   className={`p-2.5 text-sm hover:bg-blue-50 cursor-pointer ${v === value ? 'bg-blue-50 font-medium text-blue-700' : 'text-gray-700'}`}
                   onClick={() => { onChange(v); setIsOpen(false); setSearchTerm(""); }}
                 >
                   {l}
                 </div>
               )
            })}
          </div>
        </>
      )}
    </div>
  )
}

const FullPageForm = ({ title, fields, initialValues = {}, onSubmit, onClose, listTitle }) => {
  const [values, setValues] = useState(() => {
    const defaults = {};
    fields.forEach((f) => {
      defaults[f.key] = initialValues[f.key] ?? f.defaultValue ?? "";
    });
    return defaults;
  });
  
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const togglePasswordVisibility = (key) => {
    setVisiblePasswords(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(values);
  };
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-600 hover:text-gray-900 font-medium"
        >
          &larr; Back to {listTitle}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((field) => (
              <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                  {
                    <label className="dynamic-label" htmlFor={field.key}>
                      {field.label}
                      {field.required && (
                        <span className="dynamic-label-req">*</span>
                      )}
                    </label>
                  }
                  {field.type === "searchable-select" && field.options ? (
                    <SearchableSelect
                      field={field}
                      value={values[field.key]}
                      options={field.options}
                      onChange={(v) => setValues(prev => ({ ...prev, [field.key]: v }))}
                    />
                  ) : field.type === "select" && field.options ? (
                    <select
                      id={field.key}
                      name={field.key}
                      value={values[field.key]}
                      onChange={(e) =>
                        setValues((v) => ({
                          ...v,
                          [field.key]: e.target.value,
                        }))
                      }
                      required={field.required}
                      className="dynamic-input"
                    >
                      <option value="">Select {field.label}...</option>
                      {field.options.map((opt, optIdx) => {
                        const isObject = typeof opt === "object" && opt !== null;
                        const val = isObject ? opt.value : opt;
                        const label = isObject ? opt.label : opt;
                        return (
                          <option key={val || optIdx} value={val}>{label}</option>
                        );
                      })}
                    </select>
                  ) : field.type === "password" ? (
                    <div className="relative flex items-center">
                      <input
                        type={visiblePasswords[field.key] ? "text" : "password"}
                        id={field.key}
                        name={field.key}
                        value={values[field.key]}
                        onChange={(e) =>
                          setValues((v) => ({
                            ...v,
                            [field.key]: e.target.value,
                          }))
                        }
                        placeholder={
                          field.placeholder ??
                          `Enter ${field.label.toLowerCase()}...`
                        }
                        required={field.required}
                        className="dynamic-input pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(field.key)}
                        className="absolute right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                        tabIndex="-1"
                      >
                        {visiblePasswords[field.key] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <input
                      type={field.type ?? "text"}
                      id={field.key}
                      name={field.key}
                      value={values[field.key]}
                      onChange={(e) =>
                        setValues((v) => ({
                          ...v,
                          [field.key]: e.target.value,
                        }))
                      }
                      placeholder={
                        field.placeholder ??
                        `Enter ${field.label.toLowerCase()}...`
                      }
                      required={field.required}
                      className="dynamic-input"
                    />
                  )}
                </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            >
              Save {title.replace(/Edit |Add New /, "")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
const Cell = ({ col, row, statusColors }) => {
  const value = getNestedValue(row, col.key);
  if (col.render) {
    return <>{col.render(value, row)}</>;
  }
  switch (col.type) {
    case "status": {
      const str = displayValue(value).toLowerCase();
      const cls =
        statusColors[str] ?? "dynamic-status-default";
      return (
        <span
          className={`dynamic-status-badge ${cls}`}
        >
          {str}
        </span>
      );
    }
    case "badge": {
      return (
        <span className="dynamic-badge">
          {displayValue(value)}
        </span>
      );
    }
    case "mono": {
      return (
        <span className="dynamic-mono">
          {displayValue(value)}
        </span>
      );
    }
    case "email": {
      const str = displayValue(value);
      return str === "—" ? (
        <span className="dynamic-empty">—</span>
      ) : (
        <a
          href={`mailto:${str}`}
          className="dynamic-email"
        >
          {str}
        </a>
      );
    }
    case "phone": {
      const str = displayValue(value);
      return str === "—" ? (
        <span className="dynamic-empty">—</span>
      ) : (
        <a
          href={`tel:${str}`}
          className="dynamic-phone"
        >
          {str}
        </a>
      );
    }
    default: {
      const str = displayValue(value);
      return str === "—" ? (
        <span className="dynamic-empty">—</span>
      ) : (
        <span className="dynamic-text">{str}</span>
      );
    }
  }
};
// ─── Main Component ───────────────────────────────────────────────────────────
export const DynamicDataPage = ({
  title,
  subtitle,
  data = [],
  idKey = "_id",
  columns,
  statusColors = DEFAULT_STATUS_COLORS,
  isLoading = false,
  error = null,
  onCreate,
  onEdit,
  onDelete,
  formFields = [],
  moduleName,
}) => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [modalMode, setModalMode] = useState(null);
  const [editRow, setEditRow] = useState(null);

  // ── Determine permissions ──
  const resolvedModule = moduleName || title.replace(/s$/, "").replace(/\s+/g, "");
  const perm = user?.role === "Super Admin" ? { canRead: true, canCreate: true, canUpdate: true, canDelete: true } : 
               user?.roleRef?.permissions?.find(p => p.module === resolvedModule) || {};
  
  const canCreateAction = perm.canCreate ? onCreate : undefined;
  const canEditAction = perm.canUpdate ? onEdit : undefined;
  const canDeleteAction = perm.canDelete ? onDelete : undefined;
  // ── Merge status colors ──
  const mergedStatusColors = { ...DEFAULT_STATUS_COLORS, ...statusColors };
  // ── Searchable columns ──
  const searchableCols = columns.filter((c) => c.searchable !== false);
  // ── Filter + sort ──
  const processedData = useMemo(() => {
    let result = Array.isArray(data) ? [...data] : [];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((row) =>
        searchableCols.some((col) => {
          const v = getNestedValue(row, col.key);
          return displayValue(v).toLowerCase().includes(q);
        }),
      );
    }
    if (sortKey) {
      result.sort((a, b) => {
        const av = displayValue(getNestedValue(a, sortKey));
        const bv = displayValue(getNestedValue(b, sortKey));
        const cmp = av.localeCompare(bv, undefined, { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, search, sortKey, sortDir]);
  // ── Sort toggle ──
  const handleSort = (key) => {
    if (!columns.find((c) => c.key === key)?.sortable) return;
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };
  // ── CRUD ──
  const handleCreate = async (values) => {
    const success = await canCreateAction?.(values);
    if (success !== false) {
      setModalMode(null);
    }
  };
  const handleEdit = async (values) => {
    if (!editRow) return;
    const id = String(editRow[idKey] ?? "");
    const success = await canEditAction?.(id, values);
    if (success !== false) {
      setModalMode(null);
      setEditRow(null);
    }
  };
  const handleDelete = (row) => {
    const id = String(row[idKey] ?? "");
    const label = formFields[0]
      ? String(getNestedValue(row, formFields[0].key) ?? id)
      : id;
    if (window.confirm(`Delete "${label}"? This cannot be undone.`)) {
      canDeleteAction?.(id);
    }
  };
  const openEdit = (row) => {
    setEditRow(row);
    setModalMode("edit");
  };
  // ── Sort icon ──
  const SortIcon = ({ col }) => {
    if (!col.sortable) return null;
    const active = sortKey === col.key;
    return (
      <span
        className={`ml-1 inline-block text-xs ${active ? "text-blue-600" : "text-gray-300"}`}
      >
        {active ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
      </span>
    );
  };
  const hasActions = canCreateAction || canEditAction || canDeleteAction;
  const initialEditValues = editRow
    ? Object.fromEntries(
        formFields.map((f) => [
          f.key,
          displayValue(getNestedValue(editRow, f.key)) === "—"
            ? ""
            : displayValue(getNestedValue(editRow, f.key)),
        ]),
      )
    : {};

  if (modalMode === "add" && formFields.length > 0) {
    return (
      <FullPageForm
        title={`Add New ${title.replace(/s$/, "")}`}
        listTitle={title}
        fields={formFields}
        onSubmit={handleCreate}
        onClose={() => setModalMode(null)}
      />
    );
  }

  if (modalMode === "edit" && formFields.length > 0 && editRow) {
    return (
      <FullPageForm
        title={`Edit ${title.replace(/s$/, "")}`}
        listTitle={title}
        fields={formFields}
        initialValues={initialEditValues}
        onSubmit={handleEdit}
        onClose={() => {
          setModalMode(null);
          setEditRow(null);
        }}
      />
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-gray-100">
          {
            <div>
              {
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {title}
                </h1>
              }
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
          }
          {canCreateAction && formFields.length > 0 && (
            <button
              onClick={() => setModalMode("add")}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-sm transition-colors"
            >
              {<span className="text-lg leading-none">+</span>}Add{" "}
              {title.replace(/s$/, "")}
            </button>
          )}
        </div>
      }
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}
      {
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-3">
          {<span className="text-gray-400 text-base">🔍</span>}
          {
            <input
              type="text"
              id="table-search"
              name="tableSearch"
              aria-label={`Search ${title.toLowerCase()}`}
              placeholder={`Search ${title.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
            />
          }
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Clear
            </button>
          )}
          {
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {processedData.length} of {Array.isArray(data) ? data.length : 0}
            </span>
          }
        </div>
      }
      {
        <div className="border border-gray-200 rounded-xl bg-white shadow-sm flex flex-col" style={{ maxHeight: "calc(100vh - 220px)", minHeight: "400px" }}>
          {
            <div className="overflow-auto flex-1 relative custom-scrollbar">
              {
                <table className="w-full text-sm text-left border-collapse">
                  {
                    <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                      {
                        <tr>
                          {columns.map((col) => (
                            <th
                              key={col.key}
                              style={
                                col.width ? { width: col.width } : undefined
                              }
                              onClick={() => handleSort(col.key)}
                              className={`px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap ${col.sortable ? "cursor-pointer select-none hover:text-gray-900 transition-colors" : ""}`}
                            >
                              {col.label}
                              {<SortIcon col={col} />}
                            </th>
                          ))}
                          {hasActions && (
                            <th className="px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wide text-right">
                              Actions
                            </th>
                          )}
                        </tr>
                      }
                    </thead>
                  }
                  {
                    <tbody className="divide-y divide-gray-50">
                      {isLoading ? (
                        <tr>
                          {
                            <td
                              colSpan={columns.length + (hasActions ? 1 : 0)}
                              className="text-center py-14 text-sm text-gray-400"
                            >
                              {
                                <span className="animate-pulse">
                                  Loading...
                                </span>
                              }
                            </td>
                          }
                        </tr>
                      ) : processedData.length === 0 ? (
                        <tr>
                          {
                            <td
                              colSpan={columns.length + (hasActions ? 1 : 0)}
                              className="text-center py-14 text-sm text-gray-400"
                            >
                              {search
                                ? `No results for "${search}"`
                                : "No records found."}
                            </td>
                          }
                        </tr>
                      ) : (
                        // eslint-disable-next-line no-unused-vars
                        processedData.map((row, rowIdx) => (
                          <tr key={row[idKey] ?? rowIdx} className="hover:bg-blue-50/30 transition-colors">
                            {columns.map((col) => (
                              <td key={col.key} className="px-5 py-3.5 whitespace-nowrap">
                                {
                                  <Cell
                                    col={col}
                                    row={row}
                                    statusColors={mergedStatusColors}
                                  />
                                }
                              </td>
                            ))}
                            {hasActions && (
                              <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                {
                                  <div className="flex items-center justify-end gap-3">
                                    {canEditAction && formFields.length > 0 && (
                                      <button
                                        onClick={() => openEdit(row)}
                                        className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                                      >
                                        Edit
                                      </button>
                                    )}
                                    {canDeleteAction && (
                                      <button
                                        onClick={() => handleDelete(row)}
                                        className="text-xs font-medium text-red-600 hover:text-red-700 transition-colors"
                                      >
                                        Delete
                                      </button>
                                    )}
                                  </div>
                                }
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  }
                </table>
              }
            </div>
          }
          {!isLoading && processedData.length > 0 && (
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 flex items-center justify-between">
              {
                <span>
                  Showing {processedData.length}{" "}
                  {processedData.length === 1 ? "record" : "records"}
                  {search && ` matching "${search}"`}
                </span>
              }
              {<span>Total: {Array.isArray(data) ? data.length : 0}</span>}
            </div>
          )}
        </div>
      }
    </div>
  );
};
export default DynamicDataPage;
