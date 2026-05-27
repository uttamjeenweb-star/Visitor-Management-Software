
import { useNavigate } from 'react-router-dom';
import { User, Building, MapPin, Eye, Search } from 'lucide-react';

const thStyle = {
  padding: '0.875rem 1.25rem',
  fontSize: '0.75rem',
  fontWeight: '700',
  color: '#475569',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const tdStyle = {
  padding: '0.875rem 1.25rem',
  verticalAlign: 'middle',
};

const getStatusBadgeColors = (status) => {
  switch (status) {
    case 'Approved':
      return { bg: '#def7ec', text: '#03543f' };
    case 'Pending':
      return { bg: '#fef3c7', text: '#92400e' };
    case 'Requested':
      return { bg: '#e0f2fe', text: '#075985' };
    case 'Checked-In':
      return { bg: '#e1f5fe', text: '#0288d1' };
    case 'Checked-Out':
      return { bg: '#f3f4f6', text: '#374151' };
    default:
      return { bg: '#fee2e2', text: '#9b1c1c' };
  }
};

export const ReportTable = ({
  isLoading,
  filteredPasses,
  mode,
  getEmployeeName,
}) => {
  const navigate = useNavigate();

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table style={{
        width: '100%',
        fontSize: '0.875rem',
        textAlign: 'left',
        borderCollapse: 'collapse',
        whiteSpace: 'nowrap'
      }}>
        <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <tr>
            <th style={thStyle}>ID / Type</th>
            <th style={thStyle}>Visitor Info</th>
            <th style={thStyle}>Company & Purpose</th>
            <th style={thStyle}>Host / Areas</th>
            <th style={thStyle}>Date of Create</th>
            <th style={thStyle}>Status</th>
            <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', padding: '4rem 0' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '2rem',
                    height: '2rem',
                    border: '3px solid #cbd5e1',
                    borderTopColor: '#0f766e',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <span style={{ color: '#64748b', fontWeight: '500' }}>Loading passes...</span>
                </div>
              </td>
            </tr>
          ) : filteredPasses.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', padding: '4rem 1.5rem', color: '#94a3b8' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <Search size={32} style={{ color: '#cbd5e1' }} />
                  <span style={{ fontSize: '1rem', fontWeight: '700', color: '#64748b' }}>No gate passes found</span>
                  <span style={{ fontSize: '0.8rem' }}>
                    {mode === "generate" 
                      ? "Make sure you generated the report for dates containing records."
                      : "No passes match current filter specifications."}
                  </span>
                </div>
              </td>
            </tr>
          ) : (
            filteredPasses.map((pass) => {
              const isMulti = pass.gatePassType === 'multi';
              const statusColors = getStatusBadgeColors(pass.status);
              
              return (
                <tr 
                  key={pass.id} 
                  style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {/* ID & Type */}
                  <td style={tdStyle}>
                    <div style={{ fontWeight: '700', color: '#0f766e' }}>
                      {pass.gatePassId || ''}
                    </div>
                    <div style={{ marginTop: '0.25rem' }}>
                      <span style={{
                        padding: '0.15rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        backgroundColor: isMulti ? '#ede9fe' : '#e0f2fe',
                        color: isMulti ? '#5b21b6' : '#0369a1'
                      }}>
                        {isMulti ? "Multi Day" : "Single Day"}
                      </span>
                    </div>
                  </td>

                  {/* Visitor Info */}
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <User size={14} style={{ color: '#64748b' }} />
                      <strong style={{ color: '#1e293b' }}>{pass.name}</strong>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                      📞 {pass.mobileNo}
                    </div>
                    {pass.emailId && (
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.1rem' }}>
                        ✉️ {pass.emailId}
                      </div>
                    )}
                  </td>

                  {/* Company & Purpose */}
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Building size={14} style={{ color: '#64748b' }} />
                      <span style={{ color: '#334155', fontWeight: '500' }}>{pass.companyName || "-"}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', whiteSpace: 'normal', maxWidth: '200px' }}>
                      {pass.purpose || "-"}
                    </div>
                  </td>

                  {/* Host / Visiting Areas */}
                  <td style={tdStyle}>
                    <div>
                      Host: <strong style={{ color: '#0f172a' }}>{getEmployeeName(pass.toMeetWith)}</strong>
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: '#0d9488', 
                      marginTop: '0.25rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.25rem',
                      whiteSpace: 'normal',
                      maxWidth: '220px'
                    }}>
                      <MapPin size={12} />
                      <span>
                        {Array.isArray(pass.visitArea) 
                          ? pass.visitArea.join(', ') 
                          : pass.visitArea || 'No areas set'}
                      </span>
                    </div>
                  </td>

                  {/* Date of Create */}
                  <td style={tdStyle}>
                    <div style={{ fontWeight: '500', color: '#334155' }}>
                      {pass.createdAt ? new Date(pass.createdAt).toLocaleDateString() : ''}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                      {pass.createdAt ? new Date(pass.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                  </td>

                  {/* Status */}
                  <td style={tdStyle}>
                    <span style={{
                      padding: '0.25rem 0.625rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      backgroundColor: statusColors.bg,
                      color: statusColors.text,
                      textTransform: 'uppercase'
                    }}>
                      {pass.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <button
                      onClick={() => navigate(`/pass/${pass.id}/action?mode=view`)}
                      style={{
                        backgroundColor: '#0f766e',
                        color: '#ffffff',
                        borderRadius: '0.375rem',
                        padding: '0 0.85rem',
                        height: '2rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                        transition: 'opacity 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                      onMouseLeave={(e) => e.target.style.opacity = '1'}
                    >
                      <Eye size={12} /> View
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
