
export const ReportSummaryFooter = ({ isLoading, filteredPasses }) => {
  if (isLoading || filteredPasses.length === 0) return null;

  const approvedCount = filteredPasses.filter(p => p.status === 'Approved').length;
  const insideCount = filteredPasses.filter(p => p.status === 'Checked-In').length;

  return (
    <div style={{
      padding: '1rem 1.5rem',
      borderTop: '1px solid #e2e8f0',
      backgroundColor: '#f8fafc',
      fontSize: '0.85rem',
      color: '#475569',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <span>
        Total records matched: <strong style={{ color: '#0f172a' }}>{filteredPasses.length}</strong>
      </span>
      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#def7ec',
            border: '1px solid #86efac'
          }}></span>
          Approved: {approvedCount}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#e1f5fe',
            border: '1px solid #0288d1'
          }}></span>
          Inside: {insideCount}
        </span>
      </div>
    </div>
  );
};
