import React, { useState, useEffect } from 'react';
import { Employee, EmployeeSkill, Client, ClientContact, Site, Project, Task, Department, Attendance, LeaveRequest, LeaveBalance, SalaryStructure, Payroll, Quotation, PurchaseOrder, SalaryTransferLog, CatalogItem, Vendor, ClientTypeIndustryMapping, User } from './types';
import { motion, AnimatePresence } from 'motion/react';

// Importing Tab Components
import Dashboard from './components/Dashboard';
import Employees from './components/Employees';
import Sites from './components/Sites';
import Clients from './components/Clients';
import Projects from './components/Projects';
import Tasks from './components/Tasks';
import Finance from './components/Finance';
import LoginScreen from './components/LoginScreen';
import UsersMgmt from './components/UsersMgmt';

// Lucide Icons
import { 
  LayoutDashboard, Users, MapPin, Building2, Wrench, 
  ClipboardList, Github, Info, Server, HardHat, Code, Database, RefreshCw, AlertTriangle, CheckCircle,
  ChevronDown, ChevronRight, Receipt, FileSpreadsheet, Bell, X, LogOut, Shield
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>(undefined);
  const [employeesHubOpen, setEmployeesHubOpen] = useState<boolean>(false);
  const [operationsHubOpen, setOperationsHubOpen] = useState<boolean>(false);
  const [financeHubOpen, setFinanceHubOpen] = useState<boolean>(false);
  const [financeSubTab, setFinanceSubTab] = useState<'quotations' | 'pos'>('quotations');

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
  const [salaryTransfers, setSalaryTransfers] = useState<SalaryTransferLog[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [hvacCatalog, setHvacCatalog] = useState<CatalogItem[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [clientTypeIndustryMapping, setClientTypeIndustryMapping] = useState<ClientTypeIndustryMapping[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('scp_current_user');
    return saved ? JSON.parse(saved) : null;
  });

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

  // Toast notifications state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

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
        setSalaryTransfers(data.salaryTransfers || []);
        setQuotations(data.quotations || []);
        setPurchaseOrders(data.purchaseOrders || []);
        setHvacCatalog(data.hvacCatalog || []);
        setVendors(data.vendors || []);
        setClientTypeIndustryMapping(data.clientTypeIndustryMapping || []);
        setUsers(data.users || []);
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
  const handleAddQuotation = async (newQuote: Quotation) => {
    try {
      await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuote)
      });
      await loadAllData();
    } catch (err) {
      console.error("Error adding quotation:", err);
    }
  };

  const handleUpdateQuotation = async (updatedQuote: Quotation) => {
    try {
      await fetch(`/api/quotations/${updatedQuote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedQuote)
      });
      await loadAllData();
    } catch (err) {
      console.error("Error updating quotation:", err);
    }
  };

  const handleDeleteQuotation = async (id: string) => {
    try {
      // 1. Instantly remove from local UI state
      setQuotations(prev => prev.filter(q => q.id !== id));
      
      // 2. Perform DB deletion in background without awaiting
      fetch(`/api/quotations/${id}`, { method: 'DELETE' })
        .then(async (res) => {
          if (!res.ok) {
            console.error("Failed to delete quotation on server");
          }
          await loadAllData();
        })
        .catch(err => {
          console.error("Error in background deletion of quotation:", err);
        });
    } catch (err) {
      console.error("Error deleting quotation:", err);
    }
  };

  const handleAddPurchaseOrder = async (newPo: PurchaseOrder) => {
    try {
      await fetch('/api/purchase_orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPo)
      });
      await loadAllData();
    } catch (err) {
      console.error("Error adding purchase order:", err);
    }
  };

  const handleUpdatePurchaseOrder = async (updatedPo: PurchaseOrder) => {
    try {
      await fetch(`/api/purchase_orders/${updatedPo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPo)
      });
      await loadAllData();
    } catch (err) {
      console.error("Error updating purchase order:", err);
    }
  };

  const handleDeletePurchaseOrder = async (id: string) => {
    try {
      // 1. Instantly remove from local UI state
      setPurchaseOrders(prev => prev.filter(p => p.id !== id));
      
      // 2. Perform DB deletion in background without awaiting
      fetch(`/api/purchase_orders/${id}`, { method: 'DELETE' })
        .then(async (res) => {
          if (!res.ok) {
            console.error("Failed to delete purchase order on server");
          }
          await loadAllData();
        })
        .catch(err => {
          console.error("Error in background deletion of purchase order:", err);
        });
    } catch (err) {
      console.error("Error deleting purchase order:", err);
    }
  };

  const handleUpdateCatalogItem = async (updatedItem: CatalogItem) => {
    try {
      await fetch(`/api/catalog/${updatedItem.sku}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem)
      });
      await loadAllData();
    } catch (err) {
      console.error("Error updating catalog item:", err);
    }
  };

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
      setAttendance(prev => {
        const filtered = prev.filter(a => a.id !== log.id);
        return [...filtered, log];
      });

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("Server failed to add attendance:", errData.error || res.statusText);
        await loadAllData();
      }
    } catch (err) {
      console.error("Error adding attendance log:", err);
      await loadAllData();
    }
  };

  const handleDeleteAttendance = async (id: string) => {
    try {
      setAttendance(prev => prev.filter(a => a.id !== id));

      const res = await fetch(`/api/attendance/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("Server failed to delete attendance:", errData.error || res.statusText);
        await loadAllData();
      }
    } catch (err) {
      console.error("Error deleting attendance log:", err);
      await loadAllData();
    }
  };

  const parseTimeToMinutes = (timeStr: string): number | null => {
    if (!timeStr) return null;
    const clean = timeStr.trim().toUpperCase();
    const ampmMatch = clean.match(/^(\d{1,2})[-:](\d{2})\s*(AM|PM)$/);
    if (ampmMatch) {
      let hours = parseInt(ampmMatch[1], 10);
      const minutes = parseInt(ampmMatch[2], 10);
      const ampm = ampmMatch[3];
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    }
    const hhmmMatch = clean.match(/^(\d{1,2})[-:](\d{2})$/);
    if (hhmmMatch) {
      const hours = parseInt(hhmmMatch[1], 10);
      const minutes = parseInt(hhmmMatch[2], 10);
      return hours * 60 + minutes;
    }
    const numbers = clean.match(/\d+/g);
    if (numbers && numbers.length >= 1) {
      let hours = parseInt(numbers[0], 10);
      const minutes = numbers[1] ? parseInt(numbers[1], 10) : 0;
      const isPm = clean.includes('PM');
      const isAm = clean.includes('AM');
      if (isPm && hours < 12) hours += 12;
      if (isAm && hours === 12) hours = 0;
      return hours * 60 + minutes;
    }
    return null;
  };

  const formatMinutesToTime = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const period = h >= 12 ? 'PM' : 'AM';
    let displayHour = h % 12;
    if (displayHour === 0) displayHour = 12;
    const displayMin = String(m).padStart(2, '0');
    return `${String(displayHour).padStart(2, '0')}:${displayMin} ${period}`;
  };

  const handleAddLeaveRequest = async (lr: LeaveRequest) => {
    try {
      // 1. Force approval_status to 'Approved'
      const updatedLr = {
        ...lr,
        approval_status: 'Approved' as const,
        approval_date: new Date().toISOString().split('T')[0],
        approved_by: 'MGR_ADMIN'
      };

      // 2. Submit the leave request to the backend
      const resLr = await fetch('/api/leave_requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedLr)
      });

      if (!resLr.ok) {
        throw new Error("Failed to save leave request");
      }

      // 3. For each day in the leave range, create an attendance log of status 'Leave'
      const start = new Date(lr.start_date);
      const end = new Date(lr.end_date);
      const currentDate = new Date(start);

      while (currentDate <= end) {
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // Find existing non-leave attendance logs on this day for this employee to prevent overlap
        const existingLogs = attendance.filter(a => a.employee_id === lr.employee_id && a.date === dateStr);
        const hasLeaveEntry = existingLogs.some(a => a.attendance_status === 'Leave');

        if (!hasLeaveEntry) {
          let checkIn = '09:00 AM';
          let checkOut = '06:00 PM';
          
          const activeLogs = existingLogs.filter(a => a.attendance_status !== 'Leave');
          if (activeLogs.length > 0) {
            // Find a non-overlapping time slot relative to existing logs
            const firstLog = activeLogs[0];
            const inMin = parseTimeToMinutes(firstLog.check_in_time) ?? 540;
            const outMin = parseTimeToMinutes(firstLog.check_out_time) ?? 1080;
            
            const spaceBefore = inMin - 480; // 08:00 AM
            const spaceAfter = 1200 - outMin; // 08:00 PM
            
            if (spaceBefore >= spaceAfter && spaceBefore >= 120) {
              const startMin = Math.max(480, inMin - 240);
              checkIn = formatMinutesToTime(startMin);
              checkOut = formatMinutesToTime(inMin);
            } else {
              const startMin = outMin;
              const endMin = Math.min(1200, outMin + 240);
              checkIn = formatMinutesToTime(startMin);
              checkOut = formatMinutesToTime(endMin);
            }
          }

          const log: Attendance = {
            id: `ATT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            employee_id: lr.employee_id,
            date: dateStr,
            check_in_time: checkIn,
            check_out_time: checkOut,
            total_hours: 8,
            overtime_hours: 0,
            attendance_status: 'Leave' as any,
            location: 'HQ Campus',
            remarks: `Leave Applied: ${lr.leave_type}. Reason: ${lr.reason}`
          };

          await fetch('/api/attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(log)
          });
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

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
      const lr = leaveRequests.find(r => r.id === id);
      if (lr) {
        // Also delete associated leave attendance entries for this employee between start_date and end_date
        const assocAttendance = attendance.filter(a => 
          a.employee_id === lr.employee_id && 
          a.attendance_status === 'Leave' &&
          a.date >= lr.start_date &&
          a.date <= lr.end_date
        );
        for (const log of assocAttendance) {
          await fetch(`/api/attendance/${log.id}`, { method: 'DELETE' });
        }
      }

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

  const handleAddSalaryTransfer = async (st: SalaryTransferLog) => {
    try {
      await fetch('/api/salary-transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(st)
      });
      await loadAllData();
    } catch (err) {
      console.error("Error creating salary transfer:", err);
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

  const handleDeleteSalaryTransfer = async (id: string) => {
    try {
      await fetch(`/api/salary-transfers/${id}`, { method: 'DELETE' });
      await loadAllData();
    } catch (err) {
      console.error("Error deleting salary transfer log:", err);
    }
  };

  const handleToggleHub = (hub: 'employees' | 'operations' | 'finance') => {
    if (hub === 'employees') {
      setEmployeesHubOpen(prev => {
        const next = !prev;
        if (next) {
          setOperationsHubOpen(false);
          setFinanceHubOpen(false);
        }
        return next;
      });
    } else if (hub === 'operations') {
      setOperationsHubOpen(prev => {
        const next = !prev;
        if (next) {
          setEmployeesHubOpen(false);
          setFinanceHubOpen(false);
        }
        return next;
      });
    } else if (hub === 'finance') {
      setFinanceHubOpen(prev => {
        const next = !prev;
        if (next) {
          setEmployeesHubOpen(false);
          setOperationsHubOpen(false);
        }
        return next;
      });
    }
  };

  const handleNavigate = (tab: string, item_id?: string) => {
    if (tab === 'finance' && item_id) {
      setActiveTab('finance');
      if (item_id === 'quotations' || item_id === 'pos') {
        setFinanceSubTab(item_id);
      }
      setFinanceHubOpen(true);
      setEmployeesHubOpen(false);
      setOperationsHubOpen(false);
    } else if (tab === 'quotations' || tab === 'pos') {
      setActiveTab('finance');
      setFinanceSubTab(tab === 'quotations' ? 'quotations' : 'pos');
      setFinanceHubOpen(true);
      setEmployeesHubOpen(false);
      setOperationsHubOpen(false);
    } else {
      setActiveTab(tab);
      if (tab === 'employees' || tab === 'attendance' || tab === 'payroll') {
        setEmployeesHubOpen(true);
        setOperationsHubOpen(false);
        setFinanceHubOpen(false);
      } else if (tab === 'sites' || tab === 'clients' || tab === 'projects' || tab === 'tasks') {
        setOperationsHubOpen(true);
        setEmployeesHubOpen(false);
        setFinanceHubOpen(false);
      }
    }
    if (tab === 'employees' && item_id) {
      setSelectedEmployeeId(item_id);
    } else {
      setSelectedEmployeeId(undefined);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-between" id="unauthenticated-root">
        <LoginScreen onLoginSuccess={setCurrentUser} onShowToast={showToast} />
        {toast && (
          <div className="fixed bottom-5 right-5 z-50">
            <div className={`p-4 rounded-xl shadow-lg border text-xs font-bold transition-all ${
              toast.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : toast.type === 'error' 
                  ? 'bg-rose-50 text-rose-800 border-rose-200' 
                  : 'bg-indigo-50 text-indigo-800 border-indigo-200'
            }`}>
              {toast.message}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-800 antialiased" id="main-app-container">
      
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

                  {/* Employees Category Tree Group (Admin only) */}
                  {currentUser.role === 'admin' && (
                    <div className="space-y-1 bg-slate-50/50 p-2 rounded-2xl border border-slate-150">
                      <button 
                        onClick={() => handleToggleHub('employees')}
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
                            Attendance & Leaves
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
                  )}

                  {/* Operations Category Tree Group */}
                  <div className="space-y-1 bg-slate-50/50 p-2 rounded-2xl border border-slate-150">
                    <button 
                      onClick={() => handleToggleHub('operations')}
                      className="w-full flex items-center justify-between p-1.5 px-2 text-[10px] font-black uppercase text-indigo-900/80 tracking-widest cursor-pointer hover:bg-slate-100/50 rounded-xl transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <HardHat className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        Operations Hub
                      </span>
                      {operationsHubOpen ? (
                        <ChevronDown className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      )}
                    </button>
                    
                    {operationsHubOpen && (
                      <div className="pl-3.5 border-l border-slate-200 ml-3.5 space-y-1 mt-1">
                        {/* Sub-item: Clients */}
                        <button 
                          id="tab-clients"
                          onClick={() => handleNavigate('clients')}
                          className={`w-full flex items-center gap-2.5 p-2 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
                            activeTab === 'clients' 
                              ? 'bg-indigo-600 text-white font-extrabold shadow-sm' 
                              : 'text-slate-600 hover:bg-slate-100/60 hover:text-slate-900'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeTab === 'clients' ? 'bg-white' : 'bg-slate-400'}`}></span>
                          Corporate Clients
                        </button>

                        {/* Sub-item: Sites */}
                        <button 
                          id="tab-sites"
                          onClick={() => handleNavigate('sites')}
                          className={`w-full flex items-center gap-2.5 p-2 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
                            activeTab === 'sites' 
                              ? 'bg-indigo-600 text-white font-extrabold shadow-sm' 
                              : 'text-slate-600 hover:bg-slate-100/60 hover:text-slate-900'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeTab === 'sites' ? 'bg-white' : 'bg-slate-400'}`}></span>
                          Serviced Facility Sites
                        </button>

                        {/* Sub-item: Projects */}
                        <button 
                          id="tab-projects"
                          onClick={() => handleNavigate('projects')}
                          className={`w-full flex items-center gap-2.5 p-2 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
                            activeTab === 'projects' 
                              ? 'bg-indigo-600 text-white font-extrabold shadow-sm' 
                              : 'text-slate-600 hover:bg-slate-100/60 hover:text-slate-900'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeTab === 'projects' ? 'bg-white' : 'bg-slate-400'}`}></span>
                          HVAC Service Jobs
                        </button>

                        {/* Sub-item: Tasks */}
                        <button 
                          id="tab-tasks"
                          onClick={() => handleNavigate('tasks')}
                          className={`w-full flex items-center gap-2.5 p-2 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
                            activeTab === 'tasks' 
                              ? 'bg-indigo-600 text-white font-extrabold shadow-sm' 
                              : 'text-slate-600 hover:bg-slate-100/60 hover:text-slate-900'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeTab === 'tasks' ? 'bg-white' : 'bg-slate-400'}`}></span>
                          Field Tasks
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Finance Category Tree Group (Admin only) */}
                  {currentUser.role === 'admin' && (
                    <div className="space-y-1 bg-slate-50/50 p-2 rounded-2xl border border-slate-150">
                      <button 
                        onClick={() => handleToggleHub('finance')}
                        className="w-full flex items-center justify-between p-1.5 px-2 text-[10px] font-black uppercase text-indigo-900/80 tracking-widest cursor-pointer hover:bg-slate-100/50 rounded-xl transition-all"
                      >
                        <span className="flex items-center gap-2">
                          <Receipt className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          Finance Hub
                        </span>
                        {financeHubOpen ? (
                          <ChevronDown className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        )}
                      </button>
                      
                      {financeHubOpen && (
                        <div className="pl-3.5 border-l border-slate-200 ml-3.5 space-y-1 mt-1">
                          {/* Sub-item: Quotes */}
                          <button 
                            id="tab-quotes"
                            onClick={() => handleNavigate('quotations')}
                            className={`w-full flex items-center gap-2.5 p-2 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
                              activeTab === 'finance' && financeSubTab === 'quotations'
                                ? 'bg-indigo-600 text-white font-extrabold shadow-sm' 
                                : 'text-slate-600 hover:bg-slate-100/60 hover:text-slate-900'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeTab === 'finance' && financeSubTab === 'quotations' ? 'bg-white' : 'bg-slate-400'}`}></span>
                            Quotes
                          </button>

                          {/* Sub-item: Purchase Orders */}
                          <button 
                            id="tab-pos"
                            onClick={() => handleNavigate('pos')}
                            className={`w-full flex items-center gap-2.5 p-2 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
                              activeTab === 'finance' && financeSubTab === 'pos'
                                ? 'bg-indigo-600 text-white font-extrabold shadow-sm' 
                                : 'text-slate-600 hover:bg-slate-100/60 hover:text-slate-900'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeTab === 'finance' && financeSubTab === 'pos' ? 'bg-white' : 'bg-slate-400'}`}></span>
                            Purchase Orders
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* User Accounts Management (Admin only) */}
                  {currentUser.role === 'admin' && (
                    <button 
                      id="tab-users-mgmt"
                      onClick={() => handleNavigate('users-mgmt')}
                      className={`w-full flex items-center gap-3 p-3 text-xs font-bold rounded-xl transition-all ${
                        activeTab === 'users-mgmt' 
                          ? 'bg-indigo-50 text-indigo-700 font-extrabold shadow-inner border-l-4 border-indigo-650 pl-2' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Shield className="w-4 h-4 text-indigo-600 shrink-0" />
                      User Accounts Mgmt
                    </button>
                  )}

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
                  {currentUser.role === 'admin' && (
                    <>
                      <p className="flex justify-between"><span>📄 Quotations:</span> <strong className="text-slate-800">{quotations.length}</strong></p>
                      <p className="flex justify-between"><span>🛒 Purchase Orders:</span> <strong className="text-slate-800">{purchaseOrders.length}</strong></p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* User session footer card */}
            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-black text-slate-800 truncate block">{currentUser.name}</span>
                  <span className={`px-1.5 py-0.5 text-[7px] font-black rounded uppercase tracking-wider ${
                    currentUser.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-650'
                  }`}>
                    {currentUser.role}
                  </span>
                </div>
                <span className="text-[9px] text-slate-500 font-medium font-mono truncate block leading-none mt-0.5">{currentUser.email}</span>
              </div>
              <button 
                onClick={() => {
                  localStorage.removeItem('scp_current_user');
                  setCurrentUser(null);
                  showToast("Logged out successfully.", "info");
                }}
                className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-650 rounded-xl transition-all cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
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

            {(activeTab === 'employees' || activeTab === 'attendance' || activeTab === 'payroll') && (
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
                salaryTransfers={salaryTransfers}
                onAddAttendance={handleAddAttendance}
                onDeleteAttendance={handleDeleteAttendance}
                onAddLeaveRequest={handleAddLeaveRequest}
                onUpdateLeaveRequest={handleUpdateLeaveRequest}
                onDeleteLeaveRequest={handleDeleteLeaveRequest}
                onUpdateLeaveBalance={handleUpdateLeaveBalance}
                onUpdateSalaryStructure={handleUpdateSalaryStructure}
                onAddPayroll={handleAddPayroll}
                onAddSalaryTransfer={handleAddSalaryTransfer}
                onUpdatePayrollState={handleUpdatePayrollState}
                onDeletePayroll={handleDeletePayroll}
                onDeleteSalaryTransfer={handleDeleteSalaryTransfer}
                onShowToast={showToast}
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
                clientTypeIndustryMapping={clientTypeIndustryMapping}
                onRefreshMappings={loadAllData}
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

            {activeTab === 'finance' && (
              <Finance
                quotations={quotations}
                purchaseOrders={purchaseOrders}
                clients={clients}
                projects={projects}
                hvacCatalog={hvacCatalog}
                vendors={vendors}
                sites={sites}
                onUpdateCatalogItem={handleUpdateCatalogItem}
                onAddQuotation={handleAddQuotation}
                onUpdateQuotation={handleUpdateQuotation}
                onDeleteQuotation={handleDeleteQuotation}
                onAddPurchaseOrder={handleAddPurchaseOrder}
                onUpdatePurchaseOrder={handleUpdatePurchaseOrder}
                onDeletePurchaseOrder={handleDeletePurchaseOrder}
                initialSubTab={financeSubTab}
              />
            )}

            {activeTab === 'users-mgmt' && currentUser.role === 'admin' && (
              <UsersMgmt 
                users={users} 
                employees={employees}
                onRefreshUsers={loadAllData} 
                onShowToast={showToast} 
                currentUser={currentUser} 
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

      {/* Modern floating toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[100] max-w-sm w-full bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800 p-4 flex items-start gap-3.5"
            style={{ pointerEvents: 'auto' }}
          >
            <div className={`p-2 rounded-xl shrink-0 ${
              toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
              toast.type === 'error' ? 'bg-rose-500/20 text-rose-400' :
              'bg-blue-500/20 text-blue-400'
            }`}>
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-black uppercase tracking-wider text-slate-400">
                System Dispatch Notification
              </h5>
              <p className="text-xs font-bold text-slate-100 leading-normal mt-0.5">
                {toast.message}
              </p>
            </div>

            <button 
              onClick={() => setToast(null)}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
