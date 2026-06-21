import React, { useState, useEffect } from 'react';
import { Employee, EmployeeSkill, Client, ClientContact, Site, Project, Task, Department, Attendance, LeaveRequest, LeaveBalance, SalaryStructure, Payroll } from './types';

// Importing Tab Components
import Dashboard from './components/Dashboard';
import Employees from './components/Employees';
import Sites from './components/Sites';
import Clients from './components/Clients';
import Projects from './components/Projects';
import Tasks from './components/Tasks';

// Lucide Icons
import { 
  LayoutDashboard, Users, MapPin, Building2, Wrench, 
  ClipboardList, Github, Info, Server, HardHat, Code, Database, RefreshCw, AlertTriangle, CheckCircle,
  ChevronDown, ChevronRight
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>(undefined);
  const [employeesHubOpen, setEmployeesHubOpen] = useState<boolean>(true);

  // Dynamic state stores (fetched dynamically from database only!)
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [skills, setSkills] = useState<EmployeeSkill[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientContacts, setClientContacts] = useState<ClientContact[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Expanded Module states for Employees
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [salaryStructures, setSalaryStructures] = useState<SalaryStructure[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);

  // DB Connection Metadata / Diagnostics State
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    configured: boolean;
    message: string;
  }>({
    connected: false,
    configured: false,
    message: 'Checking database connection...'
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [seeding, setSeeding] = useState<boolean>(false);

  // Drawer / Explanatory modal
  const [showStackDrawer, setShowStackDrawer] = useState<boolean>(false);

  // Load all records from the full-stack database endpoints
  const loadAllData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/all');
      if (res.ok) {
        const data = await res.json();
        setEmployees(data.employees || []);
        setSkills(data.skills || []);
        setClients(data.clients || []);
        setClientContacts(data.clientContacts || []);
        setSites(data.sites || []);
        setProjects(data.projects || []);
        setTasks(data.tasks || []);
        setDepartments(data.departments || []);
        setAttendance(data.attendance || []);
        setLeaveRequests(data.leaveRequests || []);
        setLeaveBalances(data.leaveBalances || []);
        setSalaryStructures(data.salaryStructures || []);
        setPayrolls(data.payrolls || []);
      } else {
        console.error("Failed to load backend records:", res.statusText);
      }
    } catch (err) {
      console.error("Failed to fetch database data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Check the Database status endpoint
  const checkDbStatus = async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setDbStatus({
          connected: data.connected,
          configured: data.configured,
          message: data.message
        });
      }
    } catch (err) {
      setDbStatus({
        connected: false,
        configured: false,
        message: 'Could not communicate with the API server.'
      });
    }
  };

  // Handle manual database seeding
  const handleSeedDatabase = async () => {
    if (seeding) return;
    try {
      setSeeding(true);
      const res = await fetch('/api/seed', { method: 'POST' });
      if (res.ok) {
        await checkDbStatus();
        await loadAllData();
      } else {
        alert("Seeding failed. Please ensure your database is configured and reachable.");
      }
    } catch (err) {
      console.error("Error trigger seeding:", err);
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    checkDbStatus();
    loadAllData();
  }, []);

  // Action Handlers (Proxying edits/creations straight to SQL backend API)
  const handleAddEmployee = async (newEmp: Employee, initialSkills: Omit<EmployeeSkill, 'id' | 'employee_id'>[]) => {
    try {
      const parsedSkills = initialSkills.map((sk, idx) => ({
        id: `sk_new_${Date.now()}_${idx}`,
        employee_id: newEmp.id,
        skill_name: sk.skill_name,
        skill_level: sk.skill_level,
        certificate_number: sk.certificate_number,
        issuing_authority: sk.issuing_authority,
        issue_date: sk.issue_date
      }));

      await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee: newEmp, skills: parsedSkills })
      });
      await loadAllData();
    } catch (err) {
      console.error("Error adding employee:", err);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      await loadAllData();
    } catch (err) {
      console.error("Error deleting employee:", err);
    }
  };

  const handleUpdateEmployeeStatus = async (id: string, status: Employee['status']) => {
    try {
      await fetch(`/api/employees/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      await loadAllData();
    } catch (err) {
      console.error("Error updating employee status:", err);
    }
  };

  const handleAddSite = async (newSite: Site) => {
    try {
      await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSite)
      });
      await loadAllData();
    } catch (err) {
      console.error("Error adding site:", err);
    }
  };

  const handleUpdateSiteStatus = async (id: string, status: Site['status']) => {
    try {
      await fetch(`/api/sites/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      await loadAllData();
    } catch (err) {
      console.error("Error updating site status:", err);
    }
  };

  const handleAddClient = async (newClient: Client, contacts?: ClientContact[]) => {
    try {
      await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client: newClient, contacts: contacts || [] })
      });
      await loadAllData();
    } catch (err) {
      console.error("Error adding client:", err);
    }
  };

  const handleAddProject = async (newProj: Project) => {
    try {
      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProj)
      });
      await loadAllData();
    } catch (err) {
      console.error("Error adding project:", err);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      await loadAllData();
    } catch (err) {
      console.error("Error deleting project:", err);
    }
  };

  const handleUpdateProjectStatus = async (id: string, status: Project['status']) => {
    try {
      await fetch(`/api/projects/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      await loadAllData();
    } catch (err) {
      console.error("Error updating project status:", err);
    }
  };

  const handleAddTask = async (newTask: Task) => {
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
      await loadAllData();
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      await loadAllData();
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const handleUpdateTaskStatus = async (id: string, status: Task['status']) => {
    try {
      await fetch(`/api/tasks/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      await loadAllData();
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  const handleUpdateClient = async (id: string, updated: Client) => {
    try {
      await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      await loadAllData();
    } catch (err) {
      console.error("Error updating client:", err);
    }
  };

  const handleUpdateSite = async (id: string, updated: Site) => {
    try {
      await fetch(`/api/sites/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      await loadAllData();
    } catch (err) {
      console.error("Error updating site:", err);
    }
  };

  const handleUpdateProject = async (id: string, updated: Project) => {
    try {
      await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      await loadAllData();
    } catch (err) {
      console.error("Error updating project:", err);
    }
  };

  const handleUpdateTask = async (id: string, updated: Task) => {
    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      await loadAllData();
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const handleUpdateEmployee = async (id: string, updated: Employee) => {
    try {
      await fetch(`/api/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      await loadAllData();
    } catch (err) {
      console.error("Error updating employee:", err);
    }
  };

  // Expanded Module Operations Handlers
  const handleAddAttendance = async (log: Attendance) => {
    try {
      await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log)
      });
      await loadAllData();
    } catch (err) {
      console.error("Error adding attendance log:", err);
    }
  };

  const handleDeleteAttendance = async (id: string) => {
    try {
      await fetch(`/api/attendance/${id}`, { method: 'DELETE' });
      await loadAllData();
    } catch (err) {
      console.error("Error deleting attendance log:", err);
    }
  };

  const handleAddLeaveRequest = async (lr: LeaveRequest) => {
    try {
      await fetch('/api/leave_requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lr)
      });
      await loadAllData();
    } catch (err) {
      console.error("Error creating leave request:", err);
    }
  };

  const handleUpdateLeaveRequest = async (id: string, update: { approval_status: LeaveRequest['approval_status'], approved_by?: string, approval_date?: string, remarks?: string }) => {
    try {
      await fetch(`/api/leave_requests/${id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update)
      });
      await loadAllData();
    } catch (err) {
      console.error("Error updating/approving leave request:", err);
    }
  };

  const handleDeleteLeaveRequest = async (id: string) => {
    try {
      await fetch(`/api/leave_requests/${id}`, { method: 'DELETE' });
      await loadAllData();
    } catch (err) {
      console.error("Error deleting leave request:", err);
    }
  };

  const handleUpdateLeaveBalance = async (lb: LeaveBalance) => {
    try {
      await fetch('/api/leave_balances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lb)
      });
      await loadAllData();
    } catch (err) {
      console.error("Error setting/updating leave balance:", err);
    }
  };

  const handleUpdateSalaryStructure = async (ss: SalaryStructure) => {
    try {
      await fetch('/api/salary_structures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ss)
      });
      await loadAllData();
    } catch (err) {
      console.error("Error setting/updating salary structure:", err);
    }
  };

  const handleAddPayroll = async (p: Payroll) => {
    try {
      await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p)
      });
      await loadAllData();
    } catch (err) {
      console.error("Error creating payroll voucher:", err);
    }
  };

  const handleUpdatePayrollState = async (id: string, update: { payment_status: Payroll['payment_status'], payment_date?: string }) => {
    try {
      await fetch(`/api/payroll/${id}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update)
      });
      await loadAllData();
    } catch (err) {
      console.error("Error updating payroll voucher payment state:", err);
    }
  };

  const handleDeletePayroll = async (id: string) => {
    try {
      await fetch(`/api/payroll/${id}`, { method: 'DELETE' });
      await loadAllData();
    } catch (err) {
      console.error("Error deleting payroll voucher:", err);
    }
  };

  const handleNavigate = (tab: string, item_id?: string) => {
    setActiveTab(tab);
    if (tab === 'employees' && item_id) {
      setSelectedEmployeeId(item_id);
    } else {
      setSelectedEmployeeId(undefined);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-800 antialiased" id="main-app-container">
      
      {/* Upper Navigation banner explaining clone context */}
      <div className="bg-indigo-950 text-slate-100 p-4 shrink-0 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-indigo-900" id="clone-explanation-banner">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-emerald-500 text-slate-950 text-[10px] uppercase font-black px-2 pb-0.5 rounded leading-none shrink-0 tracking-widest shadow-xs">
              Live Relational SQL Mode
            </span>
            <span className="text-slate-550 text-xs">|</span>
            <span className="text-slate-300 text-xs font-mono font-bold flex items-center gap-1 leading-none">
              <Github className="w-3.5 h-3.5 text-slate-400" /> Whatzup / scp_int_hrms.git
            </span>
          </div>
          <h1 className="text-xl font-black tracking-tight flex items-center gap-2 font-mono">
            <HardHat className="w-5.5 h-5.5 text-emerald-400 shrink-0" />
            Super Cool Projects (SCP) — Neon DB Integration
          </h1>
          <p className="text-xs text-indigo-200/90 font-medium max-w-2xl">
            Connected to <strong>Neon PostgreSQL kd-ac-scp</strong>. Storing, querying, and updating human resources, facilities sites, tasks, and technicians dynamically on Postgres tables.
          </p>
        </div>

        {/* Database Status and Seeder Diagnostics bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-2 md:mt-0" id="db-status-bar">
          <div className={`p-2 px-3.5 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
            dbStatus.connected 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}>
            <Database className="w-4 h-4 shrink-0" />
            <div className="text-left leading-tight">
              <p className="font-extrabold flex items-center gap-1">
                {dbStatus.connected ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    Neon DB Connected
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    SQL Unconfigured
                  </>
                )}
              </p>
              <p className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]" title={dbStatus.message}>
                {dbStatus.connected ? 'kd-ac-scp schema active' : 'Using backup demo state'}
              </p>
            </div>
          </div>

          <button 
            id="seed-database-btn"
            onClick={handleSeedDatabase}
            disabled={seeding}
            className={`flex items-center justify-center gap-1.5 p-2.5 px-3.5 rounded-xl text-xs font-black tracking-wider transition-all cursor-pointer border shadow-sm ${
              seeding 
                ? 'bg-indigo-900 border-indigo-800 text-slate-400 cursor-not-allowed animate-pulse' 
                : 'bg-indigo-800 hover:bg-slate-800 text-slate-100 border-indigo-700 hover:border-slate-700'
            }`}
            title="Wipes target database tables and seeds base schema"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
            {seeding ? 'Seeding...' : 'Reset & Seed DB'}
          </button>
          
          <button 
            id="toggle-repo-details-btn"
            onClick={() => setShowStackDrawer(!showStackDrawer)}
            className="flex items-center justify-center gap-1.5 p-2.5 px-3.5 bg-slate-900 hover:bg-slate-800 text-slate-100 rounded-xl text-xs font-black tracking-wider transition-colors cursor-pointer border border-slate-850 shadow-sm"
          >
            <Info className="w-3.5 h-3.5 text-emerald-400" />
            Explain SQL Repo
          </button>
        </div>
      </div>

      {loading && employees.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-center space-y-1">
            <h3 className="font-bold text-slate-900 text-base">Loading live SQL rows...</h3>
            <p className="text-xs text-slate-500 max-w-sm">Synchronizing schemas with Postgres databases hosted in your kd-ac-scp Neon workspace.</p>
          </div>
        </div>
      ) : (
        /* Main Container Layout */
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          
          {/* Sidebar navigation */}
          <aside className="w-full md:w-64 bg-white border-r border-slate-150 p-5 shrink-0 flex flex-col justify-between" id="app-sidebar">
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Office Navigation</p>
                <nav className="mt-3.5 space-y-1" id="sidebar-navigation">
                  
                  {/* Dashboard */}
                  <button 
                    id="tab-dashboard"
                    onClick={() => handleNavigate('dashboard')}
                    className={`w-full flex items-center gap-3 p-3 text-xs font-bold rounded-xl transition-all ${
                      activeTab === 'dashboard' 
                        ? 'bg-indigo-50 text-indigo-700 font-extrabold shadow-inner border-l-4 border-indigo-650 pl-2' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 shrink-0" />
                    Dashboard Metrics
                  </button>

                  {/* Employees Category Tree Group */}
                  <div className="space-y-1 bg-slate-50/50 p-2 rounded-2xl border border-slate-150">
                    <button 
                      onClick={() => setEmployeesHubOpen(!employeesHubOpen)}
                      className="w-full flex items-center justify-between p-1.5 px-2 text-[10px] font-black uppercase text-indigo-900/80 tracking-widest cursor-pointer hover:bg-slate-100/50 rounded-xl transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        Employees Hub
                      </span>
                      {employeesHubOpen ? (
                        <ChevronDown className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      )}
                    </button>
                    
                    {employeesHubOpen && (
                      <div className="pl-3.5 border-l border-slate-200 ml-3.5 space-y-1 mt-1">
                        {/* Sub-item: Employees Directory */}
                        <button 
                          id="tab-employees"
                          onClick={() => handleNavigate('employees')}
                          className={`w-full flex items-center gap-2.5 p-2 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
                            activeTab === 'employees' 
                              ? 'bg-indigo-600 text-white font-extrabold shadow-sm' 
                              : 'text-slate-600 hover:bg-slate-100/60 hover:text-slate-900'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeTab === 'employees' ? 'bg-white' : 'bg-slate-400'}`}></span>
                          Employees List
                        </button>

                        {/* Sub-item: Attendance */}
                        <button 
                          id="tab-attendance"
                          onClick={() => handleNavigate('attendance')}
                          className={`w-full flex items-center gap-2.5 p-2 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
                            activeTab === 'attendance' 
                              ? 'bg-indigo-600 text-white font-extrabold shadow-sm' 
                              : 'text-slate-600 hover:bg-slate-100/60 hover:text-slate-900'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeTab === 'attendance' ? 'bg-white' : 'bg-slate-400'}`}></span>
                          Attendance Register
                        </button>

                        {/* Sub-item: Leave Management */}
                        <button 
                          id="tab-leaves"
                          onClick={() => handleNavigate('leaves')}
                          className={`w-full flex items-center gap-2.5 p-2 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
                            activeTab === 'leaves' 
                              ? 'bg-indigo-600 text-white font-extrabold shadow-sm' 
                              : 'text-slate-600 hover:bg-slate-100/60 hover:text-slate-900'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeTab === 'leaves' ? 'bg-white' : 'bg-slate-400'}`}></span>
                          Leave Management
                        </button>

                        {/* Sub-item: Payroll */}
                        <button 
                          id="tab-payroll"
                          onClick={() => handleNavigate('payroll')}
                          className={`w-full flex items-center gap-2.5 p-2 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
                            activeTab === 'payroll' 
                              ? 'bg-indigo-600 text-white font-extrabold shadow-sm' 
                              : 'text-slate-600 hover:bg-slate-100/60 hover:text-slate-900'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeTab === 'payroll' ? 'bg-white' : 'bg-slate-400'}`}></span>
                          Payroll & Wages
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Sites */}
                  <button 
                    id="tab-sites"
                    onClick={() => handleNavigate('sites')}
                    className={`w-full flex items-center gap-3 p-3 text-xs font-bold rounded-xl transition-all ${
                      activeTab === 'sites' 
                        ? 'bg-indigo-50 text-indigo-700 font-extrabold shadow-inner border-l-4 border-indigo-650 pl-2' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <MapPin className="w-4 h-4 shrink-0" />
                    Serviced Facility Sites
                  </button>

                  {/* Clients */}
                  <button 
                    id="tab-clients"
                    onClick={() => handleNavigate('clients')}
                    className={`w-full flex items-center gap-3 p-3 text-xs font-bold rounded-xl transition-all ${
                      activeTab === 'clients' 
                        ? 'bg-indigo-50 text-indigo-700 font-extrabold shadow-inner border-l-4 border-indigo-650 pl-2' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Building2 className="w-4 h-4 shrink-0" />
                    Corporate Clients
                  </button>

                  {/* Projects */}
                  <button 
                    id="tab-projects"
                    onClick={() => handleNavigate('projects')}
                    className={`w-full flex items-center gap-3 p-3 text-xs font-bold rounded-xl transition-all ${
                      activeTab === 'projects' 
                        ? 'bg-indigo-50 text-indigo-700 font-extrabold shadow-inner border-l-4 border-indigo-650 pl-2' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Wrench className="w-4 h-4 shrink-0" />
                    HVAC Service Jobs
                  </button>

                  {/* Tasks */}
                  <button 
                    id="tab-tasks"
                    onClick={() => handleNavigate('tasks')}
                    className={`w-full flex items-center gap-3 p-3 text-xs font-bold rounded-xl transition-all ${
                      activeTab === 'tasks' 
                        ? 'bg-indigo-50 text-indigo-700 font-extrabold shadow-inner border-l-4 border-indigo-650 pl-2' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <ClipboardList className="w-4 h-4 shrink-0" />
                    Field Tasks
                  </button>

                </nav>
              </div>

              {/* General Repo Blueprint indicators */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <span className="text-[10px] font-black uppercase text-slate-405 tracking-wider font-mono">Live SQL Tables</span>
                <div className="space-y-1.5 font-mono text-[11px] text-slate-500">
                  <p className="flex justify-between"><span>👷 Employees:</span> <strong className="text-slate-800">{employees.length}</strong></p>
                  <p className="flex justify-between"><span>🏢 Clients:</span> <strong className="text-slate-800">{clients.length}</strong></p>
                  <p className="flex justify-between"><span>📍 Facility Sites:</span> <strong className="text-slate-800">{sites.length}</strong></p>
                  <p className="flex justify-between"><span>🛠️ Service Jobs:</span> <strong className="text-slate-800">{projects.length}</strong></p>
                  <p className="flex justify-between"><span>📋 Tasks Deployed:</span> <strong className="text-slate-800">{tasks.length}</strong></p>
                </div>
              </div>
            </div>

            <div className="text-center pt-4 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 font-semibold tracking-tight">Super Cool Projects © 2026</span>
            </div>
          </aside>

          {/* Outer Workspace Shell */}
          <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-slate-100/30" id="workspace-viewport">
            
            {/* Unconfigured Alert banner */}
            {!dbStatus.connected && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs shadow-xs" id="db-config-alert">
                <div className="space-y-1">
                  <h4 className="font-black text-amber-950 flex items-center gap-1.5">
                    <AlertTriangle className="w-4.5 h-4.5 text-amber-600" />
                    Database Connection Pending
                  </h4>
                  <p className="text-amber-800 max-w-xl">
                    No active SQL host was detected in the environment. Configure the <code>DATABASE_URL</code> variable first to sync directly with your <strong>Neon Postgres kd-ac-scp project</strong>. The app will use an in-memory backup state until configured.
                  </p>
                </div>
                <button 
                  onClick={handleSeedDatabase}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold p-2 px-4 rounded-xl shadow-sm transition-colors shrink-0"
                >
                  Load Demo Datastore
                </button>
              </div>
            )}

            {/* Active Workspaces Render routing */}
            {activeTab === 'dashboard' && (
              <Dashboard 
                employees={employees} 
                projects={projects} 
                tasks={tasks} 
                onNavigate={handleNavigate} 
              />
            )}

            {(activeTab === 'employees' || activeTab === 'attendance' || activeTab === 'leaves' || activeTab === 'payroll') && (
              <Employees 
                employees={employees}
                departments={departments}
                skills={skills}
                onAddEmployee={handleAddEmployee}
                onDeleteEmployee={handleDeleteEmployee}
                onUpdateStatus={handleUpdateEmployeeStatus}
                selectedEmployeeId={selectedEmployeeId}
                onSelectEmployee={setSelectedEmployeeId}
                onUpdateEmployee={handleUpdateEmployee}

                attendance={attendance}
                leaveRequests={leaveRequests}
                leaveBalances={leaveBalances}
                salaryStructures={salaryStructures}
                payrolls={payrolls}
                onAddAttendance={handleAddAttendance}
                onDeleteAttendance={handleDeleteAttendance}
                onAddLeaveRequest={handleAddLeaveRequest}
                onUpdateLeaveRequest={handleUpdateLeaveRequest}
                onDeleteLeaveRequest={handleDeleteLeaveRequest}
                onUpdateLeaveBalance={handleUpdateLeaveBalance}
                onUpdateSalaryStructure={handleUpdateSalaryStructure}
                onAddPayroll={handleAddPayroll}
                onUpdatePayrollState={handleUpdatePayrollState}
                onDeletePayroll={handleDeletePayroll}
                activeTab={activeTab as any}
              />
            )}

            {activeTab === 'sites' && (
              <Sites 
                sites={sites} 
                clients={clients} 
                employees={employees} 
                onAddSite={handleAddSite} 
                onUpdateSiteStatus={handleUpdateSiteStatus} 
                onUpdateSite={handleUpdateSite}
              />
            )}

            {activeTab === 'clients' && (
              <Clients 
                clients={clients} 
                clientContacts={clientContacts}
                onAddClient={handleAddClient} 
                sites={sites}
                onUpdateClient={handleUpdateClient}
              />
            )}

            {activeTab === 'projects' && (
              <Projects 
                projects={projects} 
                employees={employees} 
                tasks={tasks} 
                clients={clients}
                sites={sites}
                onAddProject={handleAddProject} 
                onDeleteProject={handleDeleteProject} 
                onUpdateProjectStatus={handleUpdateProjectStatus} 
                onUpdateProject={handleUpdateProject}
              />
            )}

            {activeTab === 'tasks' && (
              <Tasks 
                tasks={tasks} 
                projects={projects} 
                employees={employees} 
                onAddTask={handleAddTask} 
                onDeleteTask={handleDeleteTask} 
                onUpdateTaskStatus={handleUpdateTaskStatus} 
                onUpdateTask={handleUpdateTask}
              />
            )}

          </main>

          {/* Repository Explanatory Sidebar Drawer overlay */}
          {showStackDrawer && (
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs flex justify-end z-50 animate-fade-in" id="repo-explanatory-drawer">
              <div className="w-full max-w-xl bg-white h-full p-6 md:p-8 overflow-y-auto space-y-6 shadow-2xl border-l border-slate-200">
                <div className="flex justify-between items-center pb-4 border-b border-slate-150">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                      <Code className="w-5 h-5 text-indigo-600" />
                      PostgreSQL Relational Code Explanation
                    </h3>
                    <p className="text-xs text-slate-500">How Whatzup/scp_int_hrms functions with Neon DB</p>
                  </div>
                  <button 
                    onClick={() => setShowStackDrawer(false)}
                    className="p-1 px-3 text-xs bg-slate-100 hover:bg-slate-200 font-bold rounded-lg cursor-pointer text-slate-700"
                  >
                    Close Panel
                  </button>
                </div>

                {/* Models Breakdown */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 pt-1">
                    <Database className="w-4 h-4 text-indigo-600" />
                    1. Database Schema (`src/db/schema.ts`)
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    The backend schemas maps physical assets to live relational PostgreSQL tables on Neon:
                  </p>
                  <div className="space-y-3.5 text-xs">
                    <div className="p-3 bg-indigo-50/50 border border-indigo-105 rounded-xl space-y-1">
                      <strong className="text-indigo-950 block">Department & Employee Structure</strong>
                      <p className="text-slate-600 leading-normal font-mono text-[10px]">
                        Table: `employees`, Foreign Key relationships, and fields detailing salary, shift daily wage, title, birth date, phone, and skills.
                      </p>
                    </div>

                    <div className="p-3 bg-indigo-50/50 border border-indigo-110 rounded-xl space-y-1">
                      <strong className="text-indigo-950 block">Sites, Clients, and Zones</strong>
                      <p className="text-slate-600 leading-normal font-mono text-[10px]">
                        Tables: `clients`, `sites` mapping location metadata, building characteristics, and access instructions.
                      </p>
                    </div>

                    <div className="p-3 bg-indigo-50/50 border border-indigo-115 rounded-xl space-y-1">
                      <strong className="text-indigo-950 block">Service Jobs & Task Assignments</strong>
                      <p className="text-slate-600 leading-normal font-mono text-[10px]">
                        Tables: `projects` and `tasks` for active worker dispatch and status updates.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Views Breakdown */}
                <div className="space-y-4 pt-4 border-t border-slate-150">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-indigo-600" />
                    2. Express Backend API Routes
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Drizzle ORM executes type-safe queries on Neon PostgreSQL:
                  </p>
                  <ul className="list-disc pl-4 space-y-2 text-xs text-slate-600 leading-relaxed font-mono">
                    <li>
                      <strong>GET /api/all</strong>: Loads consolidated dataset using multiple async select queries.
                    </li>
                    <li>
                      <strong>POST /api/employees</strong>: Saves technicians to database with cascade skills transactions.
                    </li>
                    <li>
                      <strong>PUT /api/tasks/:id/status</strong>: Updates tasks statuses immediately.
                    </li>
                  </ul>
                </div>

                {/* Seed Description */}
                <div className="p-4 bg-emerald-50 border border-emerald-150 rounded-2xl space-y-2">
                  <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-1">
                    🌱 Neon DB Syncing
                  </h4>
                  <p className="text-xs text-emerald-850 leading-normal">
                    Setting the <code>DATABASE_URL</code> variable connects the application to the Neon DB. The database triggers automatic creation of all 7 PostgreSQL tables, and populates baseline datasets immediately!
                  </p>
                </div>

              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
