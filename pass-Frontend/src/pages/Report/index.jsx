/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { queryGet } from "@/shared/services/api";
import { Button } from '@/shared/ui/atoms/Button';
import { useEmployees } from "@/features/employee/useEmployee";
import { useVisitorArea } from "@/features/visitor_area/useVisitorArea";
import { FileText, Download, ChevronDown, FileSpreadsheet, Printer } from 'lucide-react';
import { FilterPanel } from "./components/FilterPanel";
import { ReportTable } from "./components/ReportTable";
import { ReportSummaryFooter } from "./components/ReportSummaryFooter";

export default function ReportsPage({ mode = "generate" }) {
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
  const { employees = [], isLoading: loadingEmployees } = useEmployees();
  const { visitorArea = [], isLoading: loadingAreas } = useVisitorArea();

  const [passes, setPasses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Filters State
  const [datePreset, setDatePreset] = useState(mode === 'today' ? 'Today' : 'Last Month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('All');
  const [selectedEmployee, setSelectedEmployee] = useState('All');
  const [selectedArea, setSelectedArea] = useState('All');
  const [passType, setPassType] = useState('All'); // For today's report
  const [searchId, setSearchId] = useState(''); // For today's report
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const getPresetDates = (preset) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    let start = '';
    let end = '';

    switch (preset) {
      case 'Today':
        start = today.toISOString().split('T')[0];
        end = start;
        break;
      case 'Last 7 Days': {
        const d = new Date(today);
        d.setDate(today.getDate() - 7);
        start = d.toISOString().split('T')[0];
        end = today.toISOString().split('T')[0];
        break;
      }
      case 'Last 30 Days': {
        const d = new Date(today);
        d.setDate(today.getDate() - 30);
        start = d.toISOString().split('T')[0];
        end = today.toISOString().split('T')[0];
        break;
      }
      case 'Last Month': {
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        start = startOfLastMonth.toISOString().split('T')[0];
        end = endOfLastMonth.toISOString().split('T')[0];
        break;
      }
      case 'Quarter 1':
        start = `${currentYear}-01-01`;
        end = `${currentYear}-03-31`;
        break;
      case 'Quarter 2':
        start = `${currentYear}-04-01`;
        end = `${currentYear}-06-30`;
        break;
      case 'Quarter 3':
        start = `${currentYear}-07-01`;
        end = `${currentYear}-09-30`;
        break;
      case 'Quarter 4':
        start = `${currentYear}-10-01`;
        end = `${currentYear}-12-31`;
        break;
      default:
        break;
    }
    return { start, end };
  };

  // Fetch passes by date range
  const fetchPassesData = async (start, end) => {
    setIsLoading(true);
    setError('');

    try {
      let queryParams = [];
      if (start) queryParams.push(`startDate=${start}`);
      if (end) queryParams.push(`endDate=${end}`);

      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      const response = await queryGet(`/report${queryString}`, {}, { cache: true, ttlMs: 10000 });

      if (response.data && response.data.data) {
        setPasses(response.data.data);
      } else {
        setPasses([]);
      }
    } catch (err) {
      console.error('Error fetching passes:', err);
      setError('Failed to load gate passes. Please verify database connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Set default dates and auto-fetch on mount / tab change
  useEffect(() => {
    if (mode === "generate") {
      const { start, end } = getPresetDates("Last 7 Days");
      setStartDate(start);
      setEndDate(end);
      setDatePreset("Last 7 Days");
      fetchPassesData(start, end);
    } else if (mode === "today") {
      const { start, end } = getPresetDates("Today");
      setStartDate(start);
      setEndDate(end);
      setDatePreset("Today");
      fetchPassesData(start, end);
    }
  }, [mode]);

  useEffect(() => {
    if (!showExportDropdown) return;
    const handleOutsideClick = (e) => {
      const wrapper = document.getElementById('export-dropdown-wrapper');
      if (wrapper && !wrapper.contains(e.target)) {
        setShowExportDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showExportDropdown]);

  const handlePresetChange = (preset) => {
    setDatePreset(preset);
    if (preset !== 'Custom') {
      const { start, end } = getPresetDates(preset);
      setStartDate(start);
      setEndDate(end);
      fetchPassesData(start, end);
    }
  };

  const handleStartDateChange = (val) => {
    setStartDate(val);
    setDatePreset('Custom');
  };

  const handleEndDateChange = (val) => {
    setEndDate(val);
    setDatePreset('Custom');
  };

  // Click handler to manually generate historical report
  const handleGenerateReport = () => {
    if (mode === "generate") {
      fetchPassesData(startDate, endDate);
    }
  };

  // Resolve Employee Host Name from ID
  const getEmployeeName = (id) => {
    if (!id) return "-";
    const emp = employees.find(e => e._id === id || e.id === id);
    return emp ? emp.name : id;
  };

  // Client-side filtering logic
  const filteredPasses = useMemo(() => {
    return passes.filter(pass => {
      // 1. Status Filter
      if (status !== 'All' && pass.status !== status) {
        return false;
      }

      // 2. Employee Host Filter
      if (selectedEmployee !== 'All' && pass.toMeetWith !== selectedEmployee) {
        return false;
      }

      // 3. Visiting Area Filter
      if (selectedArea !== 'All') {
        const areaName = selectedArea.toLowerCase();
        const hasArea = Array.isArray(pass.visitArea) 
          ? pass.visitArea.some(a => a.toLowerCase() === areaName)
          : typeof pass.visitArea === 'string' && pass.visitArea.toLowerCase() === areaName;
        
        if (!hasArea) return false;
      }

      // 4. Pass Type (Single / Multi) Filter - for today's report
      if (mode === "today" && passType !== 'All') {
        if (passType === 'single' && pass.gatePassType !== 'single') return false;
        if (passType === 'multi' && pass.gatePassType !== 'multi') return false;
      }

      // 5. Search by ID / Name - for today's report
      if (mode === "today" && searchId.trim() !== '') {
        const search = searchId.toLowerCase().trim();
        const matchId = pass.gatePassId && pass.gatePassId.toLowerCase().includes(search);
        const matchName = pass.name && pass.name.toLowerCase().includes(search);
        if (!matchId && !matchName) return false;
      }

      return true;
    });
  }, [passes, status, selectedEmployee, selectedArea, passType, searchId, mode]);

  // Export CSV Handler
  const handleExportCSV = () => {
    if (filteredPasses.length === 0) return;

    const headers = ['ID', 'Visitor Name', 'Mobile No', 'Email', 'Company', 'Purpose', 'Status', 'Date Created', 'Host Employee', 'Allowed Visiting Areas'];
    const csvContent = [
      headers.join(','),
      ...filteredPasses.map(p => [
        p.gatePassId || 'N/A',
        `"${p.name}"`,
        `"${p.mobileNo}"`,
        `"${p.emailId || ''}"`,
        `"${p.companyName || ''}"`,
        `"${p.purpose || ''}"`,
        p.status,
        new Date(p.createdAt).toLocaleString(),
        `"${getEmployeeName(p.toMeetWith)}"`,
        `"${Array.isArray(p.visitArea) ? p.visitArea.join(', ') : p.visitArea || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `VMS_report_${mode === 'today' ? 'today' : startDate + '_to_' + endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Excel Handler
  const handleExportExcel = () => {
    if (filteredPasses.length === 0) return;

    const headers = ['ID', 'Visitor Name', 'Mobile No', 'Email', 'Company', 'Purpose', 'Status', 'Date Created', 'Host Employee', 'Allowed Visiting Areas'];
    const content = [
      headers.join('\t'),
      ...filteredPasses.map(p => [
        p.gatePassId || 'N/A',
        p.name,
        p.mobileNo,
        p.emailId || '',
        p.companyName || '',
        p.purpose || '',
        p.status,
        new Date(p.createdAt).toLocaleString(),
        getEmployeeName(p.toMeetWith),
        Array.isArray(p.visitArea) ? p.visitArea.join(', ') : p.visitArea || ''
      ].join('\t'))
    ].join('\n');

    const blob = new Blob([content], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `VMS_report_${mode === 'today' ? 'today' : startDate + '_to_' + endDate}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print & PDF Report Summary Handler
  const handlePrintReport = () => {
    if (filteredPasses.length === 0) return;

    const printWindow = window.open('', '_blank');
    const todayStr = new Date().toLocaleDateString();

    const tableRows = filteredPasses.map(p => `
      <tr>
        <td>${p.gatePassId || 'N/A'}</td>
        <td>
          <strong>${p.name}</strong><br/>
          <small>${p.mobileNo}</small>
        </td>
        <td>${p.companyName || '-'}</td>
        <td>${p.purpose || '-'}</td>
        <td>${getEmployeeName(p.toMeetWith)}</td>
        <td>${new Date(p.createdAt).toLocaleDateString()}</td>
        <td><span class="status-badge ${p.status.toLowerCase()}">${p.status}</span></td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Visitor Management System Report - ${todayStr}</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              color: #1e293b;
              padding: 2rem;
              margin: 0;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #0f766e;
              padding-bottom: 1rem;
              margin-bottom: 2rem;
            }
            .title {
              margin: 0;
              color: #0f766e;
              font-size: 1.5rem;
              font-weight: 800;
            }
            .meta {
              font-size: 0.85rem;
              color: #64748b;
              text-align: right;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 2rem;
              font-size: 0.85rem;
            }
            th, td {
              border-bottom: 1px solid #e2e8f0;
              padding: 0.75rem 1rem;
              text-align: left;
            }
            th {
              background-color: #f8fafc;
              color: #475569;
              font-weight: 700;
              text-transform: uppercase;
              font-size: 0.75rem;
              letter-spacing: 0.05em;
            }
            .status-badge {
              padding: 0.15rem 0.5rem;
              border-radius: 9999px;
              font-size: 0.7rem;
              font-weight: 600;
              text-transform: uppercase;
            }
            .status-badge.approved { background-color: #def7ec; color: #03543f; }
            .status-badge.pending { background-color: #fef3c7; color: #92400e; }
            .status-badge.requested { background-color: #e0f2fe; color: #075985; }
            .status-badge.checked-in { background-color: #e1f5fe; color: #0288d1; }
            .status-badge.checked-out { background-color: #f3f4f6; color: #374151; }
            @media print {
              body { padding: 1rem; }
              @page { size: landscape; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">Visitor Control Center - Report Summary</h1>
              <div style="font-size: 0.85rem; color: #475569; margin-top: 0.25rem;">
                Period: ${mode === 'today' ? "Today's Live Records" : datePreset + ' (' + startDate + ' to ' + endDate + ')'}
              </div>
            </div>
            <div class="meta">
              Generated: <strong>${todayStr}</strong><br/>
              Total Records: <strong>${filteredPasses.length}</strong>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Visitor</th>
                <th>Company</th>
                <th>Purpose</th>
                <th>Host Employee</th>
                <th>Date Created</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      boxSizing: 'border-box',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header Panel */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: '800',
            color: '#0f172a',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            letterSpacing: '-0.025em'
          }}>
            <FileText className="dashboard-icon" style={{ width: '28px', height: '28px', color: '#0f766e' }} />
            {mode === "generate" ? "Generate Historical Report" : "Today's Live Report"}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.35rem 0 0 0', fontWeight: '500' }}>
            {mode === "generate" 
              ? "Query, filter, and extract VMS historical data records." 
              : "Monitor today's active gate passes and group them interactively."}
          </p>
        </div>

        <div id="export-dropdown-wrapper" style={{ position: 'relative' }}>
          <Button
            onClick={() => setShowExportDropdown(!showExportDropdown)}
            disabled={filteredPasses.length === 0 || isLoading}
            style={{
              backgroundColor: filteredPasses.length === 0 ? '#cbd5e1' : '#0f766e',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: '600',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              border: 'none',
              cursor: filteredPasses.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            <Download size={16} />
            <span>Export Data</span>
            <ChevronDown size={14} style={{
              transform: showExportDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
              marginLeft: '0.25rem'
            }} />
          </Button>

          {showExportDropdown && filteredPasses.length > 0 && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 6px)',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              zIndex: 50,
              minWidth: '200px',
              padding: '0.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}>
              <button
                onClick={() => {
                  handleExportCSV();
                  setShowExportDropdown(false);
                }}
                className="export-dropdown-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#334155',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderRadius: '0.375rem',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <Download size={16} style={{ color: '#0f766e' }} />
                <span>Export as CSV</span>
              </button>

              <button
                onClick={() => {
                  handleExportExcel();
                  setShowExportDropdown(false);
                }}
                className="export-dropdown-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#334155',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderRadius: '0.375rem',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <FileSpreadsheet size={16} style={{ color: '#16a34a' }} />
                <span>Export as Excel</span>
              </button>

              <button
                onClick={() => {
                  handlePrintReport();
                  setShowExportDropdown(false);
                }}
                className="export-dropdown-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#334155',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderRadius: '0.375rem',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <Printer size={16} style={{ color: '#2563eb' }} />
                <span>Print / Save PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter Section */}
      <FilterPanel
        mode={mode}
        startDate={startDate}
        setStartDate={handleStartDateChange}
        endDate={endDate}
        setEndDate={handleEndDateChange}
        searchId={searchId}
        setSearchId={setSearchId}
        selectedEmployee={selectedEmployee}
        setSelectedEmployee={setSelectedEmployee}
        selectedArea={selectedArea}
        setSelectedArea={setSelectedArea}
        passType={passType}
        setPassType={setPassType}
        status={status}
        setStatus={setStatus}
        employees={employees}
        visitorArea={visitorArea}
        loadingEmployees={loadingEmployees}
        loadingAreas={loadingAreas}
        isLoading={isLoading}
        handleGenerateReport={handleGenerateReport}
        datePreset={datePreset}
        handlePresetChange={handlePresetChange}
      />

      {/* Results Notification / Table */}
      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fee2e2',
          color: '#991b1b',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
          fontWeight: '500'
        }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '0.75rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden'
      }}>
        <ReportTable
          isLoading={isLoading}
          filteredPasses={filteredPasses}
          mode={mode}
          getEmployeeName={getEmployeeName}
        />

        <ReportSummaryFooter
          isLoading={isLoading}
          filteredPasses={filteredPasses}
        />
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .export-dropdown-item:hover {
          background-color: #f1f5f9 !important;
          color: #0f172a !important;
        }
      `}</style>
    </div>
  );
}
