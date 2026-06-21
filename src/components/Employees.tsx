import React, { useState, useEffect } from 'react';
import { Employee, EmployeeSkill, Department, Attendance, LeaveRequest, LeaveBalance, SalaryStructure, Payroll } from '../types';
import { 
  Search, Plus, ArrowLeft, Trash2, User, Phone, Mail, 
  MapPin, CreditCard, Briefcase, Calendar, ChevronRight, 
  Award, Shield, Truck, DollarSign, ListCollapse, Clock,
  CheckCircle2, XCircle, AlertCircle, HelpCircle, FileText,
  Upload, UserCheck, Wallet
} from 'lucide-react';

// --- Timesheet / Time-slot overlap validation helpers ---
export function parseTimeToMinutes(timeStr: string | null | undefined): number | null {
  if (!timeStr) return null;
  const clean = timeStr.trim().toUpperCase();
  
  // Try 12-hour AM/PM format, e.g., "09:12 AM" or "9:12PM" or "09:15 AM"
  const ampmMatch = clean.match(/^(\d{1,2})[-:](\d{2})\s*(AM|PM)?$/) || clean.match(/^(\d{1,2})\s*(AM|PM)$/);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = ampmMatch[2] ? (['AM', 'PM'].includes(ampmMatch[2]) ? 0 : parseInt(ampmMatch[2], 10)) : 0;
    const suffix = ampmMatch[3] || (['AM', 'PM'].includes(ampmMatch[2]) ? ampmMatch[2] : null);
    
    if (suffix) {
      if (suffix === 'PM' && hours < 12) hours += 12;
      if (suffix === 'AM' && hours === 12) hours = 0;
    }
    return hours * 60 + minutes;
  }
  
  // Try 24-hour style "HH:MM" e.g. "18:00" or "09:00"
  const hhmmMatch = clean.match(/^(\d{1,2})[-:](\d{2})$/);
  if (hhmmMatch) {
    const hours = parseInt(hhmmMatch[1], 10);
    const minutes = parseInt(hhmmMatch[2], 10);
    return hours * 60 + minutes;
  }

  // Fallback to searching for numeric parts
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
}

export function checkTimeOverlaps(
  attendanceList: Attendance[],
  employeeId: string,
  date: string,
  newCheckIn: string,
  newCheckOut: string,
  ignoreEntryId?: string
): { isOverlapping: boolean; errorMsg?: string } {
  const startMin = parseTimeToMinutes(newCheckIn);
  // Default end time to 23:59 (1439 mins) if empty/null
  const endMin = parseTimeToMinutes(newCheckOut) ?? 1439;

  if (startMin === null) return { isOverlapping: false };

  if (endMin < startMin) {
    return {
      isOverlapping: true,
      errorMsg: `Validation Error: Check-out time (${newCheckOut}) cannot be earlier than check-in time (${newCheckIn}).`
    };
  }

  // Filter existing logs of the same employee on the same date, excluding matching log (if updating)
  const existingLogs = attendanceList.filter(log => 
    log.employee_id === employeeId && 
    log.date === date && 
    log.id !== ignoreEntryId
  );

  for (const log of existingLogs) {
    const logStart = parseTimeToMinutes(log.check_in_time);
    const logEnd = parseTimeToMinutes(log.check_out_time) ?? 1439;

    if (logStart !== null) {
      // Logic for overlap: max of starts < min of ends
      const overlapStart = Math.max(startMin, logStart);
      const overlapEnd = Math.min(endMin, logEnd);

      if (overlapStart < overlapEnd) {
        return {
          isOverlapping: true,
          errorMsg: `Time conflict: This slot [${newCheckIn} - ${newCheckOut || 'Ongoing'}] overlaps with an existing registered timesheet entry today [${log.check_in_time} - ${log.check_out_time || 'Ongoing'}].`
        };
      }
    }
  }

  return { isOverlapping: false };
}

export function calculateTotalAndOvertime(checkIn: string, checkOut: string) {
  const inMin = parseTimeToMinutes(checkIn);
  const outMin = parseTimeToMinutes(checkOut);
  if (inMin !== null && outMin !== null && outMin >= inMin) {
    const totalMinutes = outMin - inMin;
    const hours = Math.round((totalMinutes / 60) * 10) / 10;
    const overtime = hours > 8 ? Math.round((hours - 8) * 10) / 10 : 0;
    return { total: hours, overtime: overtime };
  }
  return { total: 8, overtime: 0 };
}

interface EmployeesProps {
  employees: Employee[];
  departments: Department[];
  skills: EmployeeSkill[];
  onAddEmployee: (employee: Employee, initialSkills: Omit<EmployeeSkill, 'id' | 'employee_id'>[]) => void;
  onDeleteEmployee: (id: string) => void;
  onUpdateStatus: (id: string, status: Employee['status']) => void;
  selectedEmployeeId?: string;
  onSelectEmployee: (id: string | undefined) => void;
  onUpdateEmployee?: (id: string, updated: Employee) => void;
  activeTab?: 'employees' | 'attendance' | 'leaves' | 'payroll';

  // Extension elements
  attendance: Attendance[];
  leaveRequests: LeaveRequest[];
  leaveBalances: LeaveBalance[];
  salaryStructures: SalaryStructure[];
  payrolls: Payroll[];
  onAddAttendance: (log: Attendance) => void;
  onDeleteAttendance: (id: string) => void;
  onAddLeaveRequest: (lr: LeaveRequest) => void;
  onUpdateLeaveRequest: (id: string, update: { approval_status: LeaveRequest['approval_status'], approved_by?: string, approval_date?: string, remarks?: string }) => void;
  onDeleteLeaveRequest: (id: string) => void;
  onUpdateLeaveBalance: (lb: LeaveBalance) => void;
  onUpdateSalaryStructure: (ss: SalaryStructure) => void;
  onAddPayroll: (p: Payroll) => void;
  onUpdatePayrollState: (id: string, update: { payment_status: Payroll['payment_status'], payment_date?: string }) => void;
  onDeletePayroll: (id: string) => void;
}

export default function Employees({ 
  employees, 
  departments, 
  skills, 
  onAddEmployee, 
  onDeleteEmployee,
  onUpdateStatus,
  selectedEmployeeId,
  onSelectEmployee,
  onUpdateEmployee,
  attendance,
  leaveRequests,
  leaveBalances,
  salaryStructures,
  payrolls,
  onAddAttendance,
  onDeleteAttendance,
  onAddLeaveRequest,
  onUpdateLeaveRequest,
  onDeleteLeaveRequest,
  onUpdateLeaveBalance,
  onUpdateSalaryStructure,
  onAddPayroll,
  onUpdatePayrollState,
  onDeletePayroll,
  activeTab = 'employees'
}: EmployeesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [aadharNumber, setAadharNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [postalCode, setPostalCode] = useState('');
  const [hireDate, setHireDate] = useState('2026-06-21');
  const [dob, setDob] = useState('1995-01-01');
  const [gender, setGender] = useState<Employee['gender']>('PREFER_NOT_TO_SAY');
  const [jobTitle, setJobTitle] = useState<Employee['job_title']>('TECHNICIAN');
  const [deptId, setDeptId] = useState('d4'); // Default Service
  const [managerId, setManagerId] = useState('');
  const [dailyWage, setDailyWage] = useState(2000);
  const [dailyIncentive, setDailyIncentive] = useState(300);
  const [serviceArea, setServiceArea] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [certText, setCertText] = useState('');
  const [availability, setAvailability] = useState<Employee['availability']>('AVAILABLE');

  // Vehicle Details
  const [plateNumber, setPlateNumber] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState<number | undefined>(undefined);

  // Skills set form state
  const [tempSkills, setTempSkills] = useState<{ skill_name: string; skill_level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' }[]>([
    { skill_name: 'AC Repair', skill_level: 'INTERMEDIATE' }
  ]);

  // Edit Employee States
  const [isEditing, setIsEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editStateField, setEditStateField] = useState('');
  const [editPostalCode, setEditPostalCode] = useState('');
  const [editDailyWage, setEditDailyWage] = useState(2000);
  const [editDailyIncentive, setEditDailyIncentive] = useState(300);
  const [editServiceArea, setEditServiceArea] = useState('');
  const [editJobTitle, setEditJobTitle] = useState<Employee['job_title']>('TECHNICIAN');
  const [editAvailability, setEditAvailability] = useState<Employee['availability']>('AVAILABLE');
  const [editPlateNumber, setEditPlateNumber] = useState('');
  const [editMake, setEditMake] = useState('');
  const [editModel, setEditModel] = useState('');
  const [editYear, setEditYear] = useState<number | undefined>(undefined);
  const [editDepartmentId, setEditDepartmentId] = useState('');
  const [editManagerId, setEditManagerId] = useState('');

  // Sub-Tab Navigation
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'attendance' | 'leaves' | 'payroll'>('profile');

  // Extended Profile Metadata
  const [metaMaritalStatus, setMetaMaritalStatus] = useState('Single');
  const [metaBloodGroup, setMetaBloodGroup] = useState('O+');
  const [metaNationality, setMetaNationality] = useState('Indian');
  const [metaAltPhone, setMetaAltPhone] = useState('');
  const [metaPersonalEmail, setMetaPersonalEmail] = useState('');
  const [metaOfficialEmail, setMetaOfficialEmail] = useState('');
  const [metaCurrentAddress, setMetaCurrentAddress] = useState('');
  const [metaPermanentAddress, setMetaPermanentAddress] = useState('');
  const [metaCountry, setMetaCountry] = useState('India');
  const [metaCategory, setMetaCategory] = useState('Site Engineer');
  const [metaType, setMetaType] = useState('Full-Time');
  const [metaConfirmationDate, setMetaConfirmationDate] = useState('');
  const [metaBranchOffice, setMetaBranchOffice] = useState('Head Office');

  const [metaBankHolder, setMetaBankHolder] = useState('');
  const [metaBankName, setMetaBankName] = useState('');
  const [metaBankAccount, setMetaBankAccount] = useState('');
  const [metaBankIfsc, setMetaBankIfsc] = useState('');
  const [metaBankBranch, setMetaBankBranch] = useState('');
  const [metaBankUpi, setMetaBankUpi] = useState('');

  const [metaEmergencyName, setMetaEmergencyName] = useState('');
  const [metaEmergencyRelation, setMetaEmergencyRelation] = useState('');
  const [metaEmergencyPhone, setMetaEmergencyPhone] = useState('');
  const [metaEmergencyAlt, setMetaEmergencyAlt] = useState('');

  const [showEditMetaForm, setShowEditMetaForm] = useState(false);

  // Attendance Form States
  const [attManualDate, setAttManualDate] = useState('2026-06-21');
  const [attManualCheckIn, setAttManualCheckIn] = useState('09:00');
  const [attManualCheckOut, setAttManualCheckOut] = useState('18:00');
  const [attManualStatus, setAttManualStatus] = useState('PRESENT');
  const [attManualLocation, setAttManualLocation] = useState('Office Hub 1');
  const [attManualRemarks, setAttManualRemarks] = useState('');

  // Leaves Form States
  const [lrType, setLrType] = useState('CASUAL');
  const [lrStartDate, setLrStartDate] = useState('2026-06-22');
  const [lrEndDate, setLrEndDate] = useState('2026-06-22');
  const [lrReason, setLrReason] = useState('Family occasion');
  const [lrAttachment, setLrAttachment] = useState('');

  // Leave Balances Setup Form
  const [lbCasual, setLbCasual] = useState(12);
  const [lbSick, setLbSick] = useState(8);
  const [lbEarned, setLbEarned] = useState(15);
  const [showLbSetup, setShowLbSetup] = useState(false);

  // Salary Structure Setup Form
  const [ssBasic, setSsBasic] = useState(30000);
  const [ssHra, setSsHra] = useState(12000);
  const [ssConveyance, setSsConveyance] = useState(3000);
  const [ssMedical, setSsMedical] = useState(2000);
  const [ssSite, setSsSite] = useState(5000);
  const [ssTravel, setSsTravel] = useState(4000);
  const [ssOther, setSsOther] = useState(1000);
  const [ssEffectiveDate, setSsEffectiveDate] = useState('2026-06-01');
  const [showSsSetup, setShowSsSetup] = useState(false);

  // Payroll Voucher Form States
  const [pyMonth, setPyMonth] = useState('June 2026');
  const [pyWorkingDays, setPyWorkingDays] = useState(30);
  const [pyPresentDays, setPyPresentDays] = useState(26);
  const [pyLeaveDays, setPyLeaveDays] = useState(4);
  const [pyOvertimeHours, setPyOvertimeHours] = useState(12);
  const [pyDeductions, setPyDeductions] = useState(0);
  const [showPyGenerator, setShowPyGenerator] = useState(false);

  // Global form employee selection
  const [globalEmployeeId, setGlobalEmployeeId] = useState('');

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);

  // Selected Employee change sync Hook
  useEffect(() => {
    if (selectedEmployee) {
      let p: any = {};
      try {
        if (selectedEmployee.certifications && selectedEmployee.certifications.startsWith('{')) {
          p = JSON.parse(selectedEmployee.certifications);
        }
      } catch (err) {}

      setMetaMaritalStatus(p.marital_status || 'Single');
      setMetaBloodGroup(p.blood_group || 'O+');
      setMetaNationality(p.nationality || 'Indian');
      setMetaAltPhone(p.alt_phone || '');
      setMetaPersonalEmail(p.personal_email || selectedEmployee.email || '');
      setMetaOfficialEmail(p.official_email || '');
      setMetaCurrentAddress(p.current_address || selectedEmployee.address || '');
      setMetaPermanentAddress(p.permanent_address || selectedEmployee.address || '');
      setMetaCountry(p.country || 'India');
      setMetaCategory(p.category || 'Site Engineer');
      setMetaType(p.type || 'Full-Time');
      setMetaConfirmationDate(p.confirmation_date || '2026-12-21');
      setMetaBranchOffice(p.branch_office || 'Bengaluru HQ');

      setMetaBankHolder(p.bank_holder_name || selectedEmployee.name || '');
      setMetaBankName(p.bank_name || 'HDFC Bank');
      setMetaBankAccount(p.bank_account_number || '');
      setMetaBankIfsc(p.bank_ifsc || 'HDFC0001234');
      setMetaBankBranch(p.bank_branch || 'Richmond Road Branch');
      setMetaBankUpi(p.upi_id || '');

      setMetaEmergencyName(p.emergency_name || '');
      setMetaEmergencyRelation(p.emergency_relationship || '');
      setMetaEmergencyPhone(p.emergency_phone || '');
      setMetaEmergencyAlt(p.emergency_alt_phone || '');

      // Pull current Leave balances if exist
      const lBal = leaveBalances.find(l => l.employee_id === selectedEmployee.id);
      if (lBal) {
        setLbCasual(lBal.casual_leave_balance || 0);
        setLbSick(lBal.sick_leave_balance || 0);
        setLbEarned(lBal.earned_leave_balance || 0);
      } else {
        setLbCasual(12);
        setLbSick(8);
        setLbEarned(15);
      }

      // Pull current Salary structure if exists
      const sStr = salaryStructures.find(s => s.employee_id === selectedEmployee.id);
      if (sStr) {
        setSsBasic(sStr.basic_salary || 0);
        setSsHra(sStr.hra || 0);
        setSsConveyance(sStr.conveyance_allowance || 0);
        setSsMedical(sStr.medical_allowance || 0);
        setSsSite(sStr.site_allowance || 0);
        setSsTravel(sStr.travel_allowance || 0);
        setSsOther(sStr.other_allowance || 0);
        setSsEffectiveDate(sStr.effective_date || '2026-06-01');
      } else {
        setSsBasic(25000);
        setSsHra(10000);
        setSsConveyance(2000);
        setSsMedical(1500);
        setSsSite(3000);
        setSsTravel(2500);
        setSsOther(1000);
        setSsEffectiveDate('2026-06-01');
      }
    }
  }, [selectedEmployeeId, leaveBalances, salaryStructures]);


  const startEditingEmployee = (emp: Employee) => {
    setEditFirstName(emp.first_name || '');
    setEditLastName(emp.last_name || '');
    setEditPhone(emp.phone || '');
    setEditEmail(emp.email || '');
    setEditAddress(emp.address || '');
    setEditCity(emp.city || 'Bengaluru');
    setEditStateField(emp.state || 'Karnataka');
    setEditPostalCode(emp.postal_code || '');
    setEditDailyWage(emp.daily_wage || 2000);
    setEditDailyIncentive(emp.daily_incentive_earned || 300);
    setEditServiceArea(emp.service_area || '');
    setEditJobTitle(emp.job_title || 'TECHNICIAN');
    setEditAvailability(emp.availability || 'AVAILABLE');
    setEditPlateNumber(emp.plate_number || '');
    setEditMake(emp.make || '');
    setEditModel(emp.model || '');
    setEditYear(emp.year);
    setEditDepartmentId(emp.department_id || '');
    setEditManagerId(emp.manager_id || '');
    setIsEditing(true);
  };

  const handleEditEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    const matchedDept = departments.find(d => d.id === editDepartmentId);
    const updated: Employee = {
      ...selectedEmployee,
      first_name: editFirstName,
      last_name: editLastName,
      name: `${editFirstName} ${editLastName}`,
      phone: editPhone,
      email: editEmail,
      address: editAddress,
      city: editCity,
      state: editStateField,
      postal_code: editPostalCode,
      daily_wage: Number(editDailyWage),
      daily_incentive_earned: Number(editDailyIncentive),
      service_area: editServiceArea,
      job_title: editJobTitle,
      title: editJobTitle.replace('_', ' '),
      availability: editAvailability,
      plate_number: editPlateNumber || undefined,
      make: editMake || undefined,
      model: editModel || undefined,
      year: editYear ? Number(editYear) : undefined,
      department_id: editDepartmentId || undefined,
      department_name: matchedDept ? matchedDept.name : undefined,
      manager_id: editManagerId || undefined
    };

    if (onUpdateEmployee) {
      onUpdateEmployee(selectedEmployee.id, updated);
    }
    setIsEditing(false);
  };

  // Filters
  const filteredEmployees = employees.filter(emp => {
    const q = searchQuery.toLowerCase();
    return (
      emp.name.toLowerCase().includes(q) ||
      emp.employee_code.toLowerCase().includes(q) ||
      emp.title.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q) ||
      emp.phone.toLowerCase().includes(q) ||
      emp.service_area.toLowerCase().includes(q)
    );
  });

  // Calculates the reporting chain (Technician -> Supervisor -> Manager -> CEO)
  const getReportingChain = (emp: Employee): Employee[] => {
    const chain: Employee[] = [];
    const visited = new Set<string>();
    let current: Employee | undefined = emp;

    while (current && !visited.has(current.id)) {
      chain.push(current);
      visited.add(current.id);
      current = employees.find(e => e.id === current?.manager_id);
    }
    return chain.reverse();
  };

  const getDirectReports = (emp: Employee): Employee[] => {
    return employees.filter(e => e.manager_id === emp.id);
  };

  const selectedChain = selectedEmployee ? getReportingChain(selectedEmployee) : [];
  const selectedReports = selectedEmployee ? getDirectReports(selectedEmployee) : [];
  const selectedSkills = selectedEmployee ? skills.filter(s => s.employee_id === selectedEmployee.id) : [];

  const handleAddSkillRow = () => {
    setTempSkills([...tempSkills, { skill_name: '', skill_level: 'INTERMEDIATE' }]);
  };

  const handleRemoveSkillRow = (index: number) => {
    if (tempSkills.length > 1) {
      setTempSkills(tempSkills.filter((_, i) => i !== index));
    }
  };

  const handleSkillChange = (index: number, field: string, value: string) => {
    const next = [...tempSkills];
    next[index] = { ...next[index], [field]: value };
    setTempSkills(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) {
      alert('First Name, Last Name, and Email are required.');
      return;
    }

    const employee_code = `SPC${String(employees.length + 1).padStart(3, '0')}`;
    const nameStr = `${firstName} ${lastName}`;

    const newEmp: Employee = {
      id: `e_${Date.now()}`,
      employee_code,
      aadhar_number: aadharNumber || '000000000000',
      first_name: firstName,
      last_name: lastName,
      name: nameStr,
      date_of_birth: dob,
      gender,
      email,
      phone,
      address,
      city,
      state,
      postal_code: postalCode,
      hire_date: hireDate,
      employment_status: 'ACTIVE',
      department_id: deptId,
      department_name: departments.find(d => d.id === deptId)?.name || 'Service',
      manager_id: managerId || undefined,
      job_title: jobTitle,
      title: jobTitle === 'TECHNICIAN' ? 'HVAC Technician' :
             jobTitle === 'SENIOR_TECHNICIAN' ? 'Senior HVAC Technician' :
             jobTitle === 'SUPERVISOR' ? 'HVAC Supervisor' :
             jobTitle === 'MANAGER' ? 'Operations Manager' :
             jobTitle === 'CEO' ? 'CEO' : jobTitle,
      department: departments.find(d => d.id === deptId)?.name || 'Service',
      daily_wage: Number(dailyWage),
      daily_incentive_earned: Number(dailyIncentive),
      service_area: serviceArea || 'Central Zone',
      skills: skillsText,
      certifications: certText,
      availability,
      status: 'ACTIVE',
      plate_number: plateNumber || undefined,
      make: vehicleMake || undefined,
      model: vehicleModel || undefined,
      year: vehicleYear || undefined,
    };

    const parsedSkills = tempSkills
      .filter(ts => ts.skill_name.trim().length > 0)
      .map(ts => ({
        skill_name: ts.skill_name,
        skill_level: ts.skill_level,
        certificate_number: `CERT-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        issuing_authority: 'EPA Training Partner',
        issue_date: new Date().toISOString().split('T')[0]
      }));

    onAddEmployee(newEmp, parsedSkills);
    setShowAddForm(false);
    onSelectEmployee(newEmp.id);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="employees-feature">
      {/* Detail or main view routing */}
      {selectedEmployee ? (
        <div className="lg:col-span-12 space-y-6" id="employee-detail-view">
          {/* Header Action */}
          <div className="flex justify-between items-center bg-transparent">
            <div className="flex items-center gap-3">
              <button 
                id="back-to-employees-btn"
                onClick={() => {
                  onSelectEmployee(undefined);
                  setIsEditing(false);
                }}
                className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  Employee Profile 
                  <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-bold">
                    {selectedEmployee.employee_code}
                  </span>
                </h2>
                <p className="text-xs text-gray-500">Full HVAC technical profile registry</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (isEditing) {
                  setIsEditing(false);
                } else {
                  startEditingEmployee(selectedEmployee);
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 font-extrabold text-xs text-white rounded-xl transition-all cursor-pointer shadow-xs border border-transparent"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Employee Details'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleEditEmployeeSubmit} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6 text-xs text-gray-700">
              <div className="border-b border-gray-150 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900">Change Employee Personal & Technical Details</h3>
                <p className="text-[11px] text-gray-400">Modify credentials, department assignments, contact numbers, hourly metrics and vehicle cards.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">First Name *</label>
                  <input 
                    type="text" required
                    value={editFirstName} onChange={e => setEditFirstName(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">Last Name *</label>
                  <input 
                    type="text" required
                    value={editLastName} onChange={e => setEditLastName(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">Mobile Phone *</label>
                  <input 
                    type="text" required
                    value={editPhone} onChange={e => setEditPhone(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl bg-white focus:outline-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">Email address *</label>
                  <input 
                    type="email" required
                    value={editEmail} onChange={e => setEditEmail(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl bg-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">Service Area Zone</label>
                  <input 
                    type="text"
                    value={editServiceArea} onChange={e => setEditServiceArea(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">Department</label>
                  <select 
                    value={editDepartmentId} onChange={e => setEditDepartmentId(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl bg-white"
                  >
                    <option value="">-- No Department --</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-500">Job Role Designation</label>
                  <select 
                    value={editJobTitle} onChange={e => setEditJobTitle(e.target.value as Employee['job_title'])}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl"
                  >
                    <option value="TECHNICIAN">TECHNICIAN</option>
                    <option value="SENIOR_TECHNICIAN">SENIOR TECHNICIAN</option>
                    <option value="SUPERVISOR">SUPERVISOR</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="CEO">CEO</option>
                    <option value="DISPATCHER">DISPATCHER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-500">Supervisor / Line Manager</label>
                  <select 
                    value={editManagerId} onChange={e => setEditManagerId(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl"
                  >
                    <option value="">-- No Manager --</option>
                    {employees.filter(e => e.id !== selectedEmployee.id).map(e => (
                      <option key={e.id} value={e.id}>{e.name} ({e.title})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-500">Availability State</label>
                  <select 
                    value={editAvailability} onChange={e => setEditAvailability(e.target.value as Employee['availability'])}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="ASSIGNED">ON JOB</option>
                    <option value="OFF_DUTY">OFF DUTY</option>
                    <option value="EMERGENCY_ONLY">EMERGENCY ONLY</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-500">Daily Base Wage (₹)</label>
                  <input 
                    type="number"
                    value={editDailyWage} onChange={e => setEditDailyWage(Number(e.target.value))}
                    className="w-full p-2.5 border border-gray-200 rounded-xl bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-500">Standard Incentive (₹)</label>
                  <input 
                    type="number"
                    value={editDailyIncentive} onChange={e => setEditDailyIncentive(Number(e.target.value))}
                    className="w-full p-2.5 border border-gray-200 rounded-xl bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-500">Residential Town Home Address</label>
                <input 
                  type="text"
                  value={editAddress} onChange={e => setEditAddress(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl bg-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">City</label>
                  <input 
                    type="text"
                    value={editCity} onChange={e => setEditCity(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">State</label>
                  <input 
                    type="text"
                    value={editStateField} onChange={e => setEditStateField(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">Postal Code</label>
                  <input 
                    type="text"
                    value={editPostalCode} onChange={e => setEditPostalCode(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl bg-white"
                  />
                </div>
              </div>

              <div className="border-t border-gray-150 pt-4 space-y-4">
                <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Assigned Delivery Vehicle Details</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">Plate Number</label>
                    <input 
                      type="text" placeholder="e.g. KA-02-MB-1234"
                      value={editPlateNumber} onChange={e => setEditPlateNumber(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl bg-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">Vehicle Make</label>
                    <input 
                      type="text" placeholder="e.g. Tata, Mahindra"
                      value={editMake} onChange={e => setEditMake(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">Vehicle Model</label>
                    <input 
                      type="text" placeholder="e.g. Ace, Bolero"
                      value={editModel} onChange={e => setEditModel(e.target.value)}
                      className="w-full p-2.5 border border-gray-205 rounded-xl bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">Manufacture Year</label>
                    <input 
                      type="number" placeholder="2024"
                      value={editYear || ''} onChange={e => setEditYear(Number(e.target.value) || undefined)}
                      className="w-full p-2.5 border border-gray-205 rounded-xl bg-white text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-150">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl font-black shadow-xs transition-all cursor-pointer"
                >
                  Save Spec Modifications
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Upper Section: Details Section (Left) on Top, all 4 Tab options to its Right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 1. Left side details section (Top Left) */}
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-indigo-50 border-4 border-indigo-150 rounded-full flex items-center justify-center text-indigo-650 text-xl font-black shadow-inner font-sans shrink-0">
                      {selectedEmployee.first_name[0]}{selectedEmployee.last_name[0]}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-gray-900 text-lg leading-tight truncate">{selectedEmployee.name}</h3>
                      <p className="text-xs text-indigo-600 font-bold mt-0.5 truncate">{selectedEmployee.title}</p>
                      <p className="text-[11px] text-gray-400 font-medium truncate">{selectedEmployee.department_name} Department</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                    <select 
                      id="employee-status-update"
                      value={selectedEmployee.status}
                      onChange={(e) => onUpdateStatus(selectedEmployee.id, e.target.value as Employee['status'])}
                      className="text-xs px-2 px-1 rounded-lg font-bold border border-gray-200 bg-white shadow-2xs focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="ON_JOB">ON JOB</option>
                      <option value="ON_LEAVE">ON LEAVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>

                    <span className={`text-[11px] px-2.5 py-1 rounded-lg border font-black uppercase tracking-wider ${
                      selectedEmployee.availability === 'AVAILABLE' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                      selectedEmployee.availability === 'ASSIGNED' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                      'bg-amber-50 border-amber-200 text-amber-700'
                    }`}>
                      {selectedEmployee.availability}
                    </span>
                  </div>

                  {/* Bio Details */}
                  <div className="space-y-2 pt-3 border-t border-gray-100 text-xs text-gray-650">
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                      <span className="truncate">{selectedEmployee.email}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                      <span>{selectedEmployee.phone || 'No phone'}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                      <span className="truncate">{selectedEmployee.address}, {selectedEmployee.city}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                      <span className="font-mono">Aadhaar: **** **** {selectedEmployee.aadhar_number.slice(-4)}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Right of Details: Tab Navigation with 4 Option buttons */}
                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">Control Navigation Hub</h4>
                    <p className="text-[11px] text-slate-400 font-medium">Coordinate shift logs, leave allowances and wage payroll cycles.</p>
                  </div>

                  {/* Tab Navigation Menu */}
                  <div className="bg-slate-100 p-1 rounded-xl flex flex-col sm:flex-row gap-1 shadow-inner border border-slate-200">
                    {(['profile', 'attendance', 'leaves', 'payroll'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveSubTab(tab)}
                        className={`flex-1 text-[11px] font-black py-2.5 px-3 rounded-lg transition-all cursor-pointer text-center uppercase tracking-wider flex items-center justify-center gap-1.5 ${
                          activeSubTab === tab
                            ? 'bg-indigo-600 text-white shadow-md border-b-2 border-indigo-700 font-bold'
                            : 'bg-transparent hover:bg-slate-200 text-slate-600 hover:text-indigo-600'
                        }`}
                      >
                        <span>
                          {tab === 'profile' ? '👤 Profile & Org' :
                           tab === 'attendance' ? '⏰ Attendance' :
                           tab === 'leaves' ? '🌴 Leaves Link' :
                           '💳 Salary & Pay'}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Wages Statistics Strip */}
                  <div className="bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/50 flex justify-between items-center text-xs text-indigo-900 font-bold">
                    <span>Base Remuneration rate:</span>
                    <span>₹{selectedEmployee.daily_wage || 0}/day + ₹{selectedEmployee.daily_incentive_earned || 0} tier</span>
                  </div>
                </div>
              </div>

              {/* Lower Section: Middle Forms (8/12) & History On Right (4/12) Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Middle Area: Interactive Forms for Active Subtab */}
                <div className="lg:col-span-8 space-y-6">

              {/* 1. EXTENDED PROFILE INFORMATION TAB */}
              {activeSubTab === 'profile' && (
                <div className="space-y-6">
                  {/* Additional Metadata Cards view */}
                  {!showEditMetaForm ? (
                    <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs space-y-6">
                      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                        <div>
                          <h4 className="font-extrabold text-gray-900 text-base">Extended HR Profile Dossier</h4>
                          <p className="text-xs text-gray-400">Complete personal, contact, banking and compliance metadata.</p>
                        </div>
                        <button
                          onClick={() => setShowEditMetaForm(true)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-750 hover:bg-indigo-100 text-xs font-bold rounded-xl border border-indigo-150 transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Edit dossier
                        </button>
                      </div>

                      {/* Dossier Bento Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
                        
                        {/* Box 1: Personal Demographic */}
                        <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-2.5">
                          <h5 className="font-extrabold text-slate-850 uppercase tracking-widest text-[9px] text-indigo-650 flex items-center gap-1">
                            <User className="w-3.5 h-3.5" /> Basic Demographic Info
                          </h5>
                          <div className="grid grid-cols-2 gap-3 pt-1">
                            <div>
                              <span className="text-gray-400 block text-[9.5px] uppercase">Gender</span>
                              <span className="font-semibold text-gray-800">{selectedEmployee.gender?.replace('_', ' ') || 'PREFER NOT TO SAY'}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 block text-[9.5px] uppercase">Date of Birth</span>
                              <span className="font-semibold text-gray-850 font-mono">{selectedEmployee.date_of_birth || 'Not Set'}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 block text-[9.5px] uppercase">Marital Status</span>
                              <span className="font-semibold text-gray-800">{metaMaritalStatus}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 block text-[9.5px] uppercase">Blood Group</span>
                              <span className="font-semibold text-red-600 font-mono text-sm leading-none">{metaBloodGroup}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-gray-400 block text-[9.5px] uppercase">Nationality</span>
                              <span className="font-semibold text-gray-800">{metaNationality}</span>
                            </div>
                          </div>
                        </div>

                        {/* Box 2: Contacts info */}
                        <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-2.5">
                          <h5 className="font-extrabold text-slate-850 uppercase tracking-widest text-[9px] text-indigo-650 flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" /> Contact Channels
                          </h5>
                          <div className="space-y-2.5 pt-1">
                            <div>
                              <span className="text-gray-400 block text-[9.5px]">Mobile Phone:</span>
                              <span className="font-mono font-bold text-gray-800 block text-xs">{selectedEmployee.phone || 'No Phone Connection'}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 block text-[9.5px]">Alternate Mobile:</span>
                              <span className="font-mono font-semibold text-gray-800 block">{metaAltPhone || 'None Provided'}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 block text-[9.5px]">Personal Email Address:</span>
                              <span className="font-mono text-gray-800 block">{metaPersonalEmail || selectedEmployee.email}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 block text-[9.5px]">Official Email Address:</span>
                              <span className="font-mono font-bold text-indigo-600 block">{metaOfficialEmail || 'Not Activated'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Box 3: Address Locations */}
                        <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl col-span-1 md:col-span-2 space-y-2.5">
                          <h5 className="font-extrabold text-slate-850 uppercase tracking-widest text-[9px] text-indigo-650 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> Verified Residential Addresses
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                            <div>
                              <span className="text-gray-400 block text-[9.5px]">Current Address:</span>
                              <p className="font-semibold text-gray-800 mt-0.5">{metaCurrentAddress || selectedEmployee.address}</p>
                            </div>
                            <div>
                              <span className="text-gray-400 block text-[9.5px]">Permanent Address:</span>
                              <p className="font-semibold text-gray-800 mt-0.5">{metaPermanentAddress || selectedEmployee.address}</p>
                            </div>
                            <div className="grid grid-cols-3 gap-2 col-span-1 md:col-span-2 pt-1 border-t border-slate-200">
                              <div>
                                <span className="text-gray-400 text-[9.5px]">City</span>
                                <span className="font-bold text-gray-800 block">{selectedEmployee.city || 'Bengaluru'}</span>
                              </div>
                              <div>
                                <span className="text-gray-400 text-[9.5px]">State</span>
                                <span className="font-bold text-gray-800 block">{selectedEmployee.state || 'Karnataka'}</span>
                              </div>
                              <div>
                                <span className="text-gray-400 text-[9.5px]">Country</span>
                                <span className="font-bold text-gray-800 block">{metaCountry}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Box 4: Employment Details */}
                        <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-2.5">
                          <h5 className="font-extrabold text-slate-850 uppercase tracking-widest text-[9px] text-indigo-650 flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5" /> Job & Employment Category
                          </h5>
                          <div className="grid grid-cols-2 gap-3 pt-1">
                            <div>
                              <span className="text-gray-400 block text-[9.5px] uppercase">Job Designation</span>
                              <span className="font-black text-indigo-950 block">{selectedEmployee.title}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 block text-[9.5px] uppercase">Department Unit</span>
                              <span className="font-bold text-gray-800 block text-[11px]">{selectedEmployee.department_name || 'Service Ops'}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 block text-[9.5px] uppercase">Category</span>
                              <span className="font-semibold text-gray-850 block">{metaCategory}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 block text-[9.5px] uppercase">Employment Type</span>
                              <span className="font-bold text-emerald-700 block">{metaType}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 block text-[9.5px] uppercase">Joining Date</span>
                              <span className="font-semibold text-gray-800 font-mono block">{selectedEmployee.hire_date || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 block text-[9.5px] uppercase">Confirmation Date</span>
                              <span className="font-semibold text-gray-850 font-mono block">{metaConfirmationDate || 'N/A'}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-gray-400 block text-[9.5px] uppercase">Assigned Office Branch</span>
                              <span className="font-bold text-gray-850 block">{metaBranchOffice}</span>
                            </div>
                          </div>
                        </div>

                        {/* Box 5: Emergency Contacts */}
                        <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-2.5">
                          <h5 className="font-extrabold text-slate-850 uppercase tracking-widest text-[9px] text-red-650 flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5" /> Emergency Contacts
                          </h5>
                          <div className="space-y-3 pt-1">
                            {metaEmergencyName ? (
                              <>
                                <div>
                                  <span className="text-gray-400 block text-[9.5px]">Contact Person Name:</span>
                                  <span className="font-bold text-gray-850 block text-xs">{metaEmergencyName}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <span className="text-gray-400 block text-[9.5px]">Relationship:</span>
                                    <span className="font-medium text-gray-800 block">{metaEmergencyRelation}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400 block text-[9.5px]">Primary Phone:</span>
                                    <span className="font-mono font-bold text-gray-850 block">{metaEmergencyPhone}</span>
                                  </div>
                                </div>
                                {metaEmergencyAlt && (
                                  <div>
                                    <span className="text-gray-400 block text-[9.5px]">Alternate Phone:</span>
                                    <span className="font-mono font-semibold text-gray-800 block">{metaEmergencyAlt}</span>
                                  </div>
                                )}
                              </>
                            ) : (
                              <p className="text-slate-400 italic">No emergency support contact registered for this employee profile yet.</p>
                            )}
                          </div>
                        </div>

                        {/* Box 6: Financial Bank Accounts */}
                        <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl col-span-1 md:col-span-2 space-y-2.5">
                          <h5 className="font-extrabold text-slate-850 uppercase tracking-widest text-[9px] text-emerald-700 flex items-center gap-1">
                            <Wallet className="w-3.5 h-3.5" /> Registered Salary Bank Accounts
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                            <div>
                              <span className="text-gray-400 block text-[9.5px]">Account Holder Name:</span>
                              <span className="font-bold text-gray-800">{metaBankHolder || selectedEmployee.name}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 block text-[9.5px]">Bank Name:</span>
                              <span className="font-bold text-indigo-950">{metaBankName || 'HDFC Bank'}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 block text-[9.5px]">Account Number:</span>
                              <span className="font-mono font-black text-gray-850 tracking-wider bg-white p-1 rounded border border-gray-100 text-[11px] block text-center">{metaBankAccount || 'Not Configured'}</span>
                            </div>
                            <div className="pt-2 border-t border-slate-205 md:col-span-3 grid grid-cols-3 gap-3">
                              <div>
                                <span className="text-gray-400 text-[9.5px] block">IFSC Code</span>
                                <span className="font-mono font-bold text-gray-800">{metaBankIfsc || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-gray-400 text-[9.5px] block">Branch Location</span>
                                <span className="font-bold text-gray-800 truncate block">{metaBankBranch || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-gray-400 text-[9.5px] block">Direct UPI ID</span>
                                <span className="font-mono text-emerald-800 font-bold block">{metaBankUpi || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  ) : (
                    // Edit Extended Dossier Form Inline
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const metadata = {
                          marital_status: metaMaritalStatus,
                          blood_group: metaBloodGroup,
                          nationality: metaNationality,
                          alt_phone: metaAltPhone,
                          personal_email: metaPersonalEmail,
                          official_email: metaOfficialEmail,
                          current_address: metaCurrentAddress,
                          permanent_address: metaPermanentAddress,
                          country: metaCountry,
                          category: metaCategory,
                          type: metaType,
                          confirmation_date: metaConfirmationDate,
                          branch_office: metaBranchOffice,
                          bank_holder_name: metaBankHolder,
                          bank_name: metaBankName,
                          bank_account_number: metaBankAccount,
                          bank_ifsc: metaBankIfsc,
                          bank_branch: metaBankBranch,
                          upi_id: metaBankUpi,
                          emergency_name: metaEmergencyName,
                          emergency_relationship: metaEmergencyRelation,
                          emergency_phone: metaEmergencyPhone,
                          emergency_alt_phone: metaEmergencyAlt
                        };
                        
                        if (onUpdateEmployee) {
                          onUpdateEmployee(selectedEmployee.id, {
                            ...selectedEmployee,
                            certifications: JSON.stringify(metadata)
                          });
                        }
                        setShowEditMetaForm(false);
                      }}
                      className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs space-y-6 text-xs text-gray-700"
                    >
                      <div className="border-b border-gray-150 pb-3 flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900">Manage Extended Profile Fields</h4>
                          <p className="text-[11px] text-gray-400">Overwrites compliance, bank accounts, and emergency contact dossiers.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowEditMetaForm(false)}
                          className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold"
                        >
                          Dismiss Form
                        </button>
                      </div>

                      <div className="space-y-6">
                        {/* Section A: Demographics */}
                        <div className="space-y-4">
                          <h5 className="font-black text-rose-800 uppercase tracking-widest text-[9.5px]">1. Demographics & Dossier</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <label className="font-bold text-gray-500">Marital Status</label>
                              <select 
                                value={metaMaritalStatus || 'Single'} onChange={e => setMetaMaritalStatus(e.target.value)}
                                className="w-full p-2 border border-gray-205 rounded-xl bg-white"
                              >
                                <option value="Single">Single</option>
                                <option value="Married">Married</option>
                                <option value="Widowed">Widowed</option>
                                <option value="Divorced">Divorced</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-gray-500">Blood Group</label>
                              <select 
                                value={metaBloodGroup || 'O+'} onChange={e => setMetaBloodGroup(e.target.value)}
                                className="w-full p-2 border border-gray-205 rounded-xl bg-white"
                              >
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-gray-500">Nationality</label>
                              <input 
                                type="text"
                                value={metaNationality || 'Indian'} onChange={e => setMetaNationality(e.target.value)}
                                className="w-full p-2 border border-gray-205 rounded-xl bg-white"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Section B: Contacts */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                          <h5 className="font-black text-rose-800 uppercase tracking-widest text-[9.5px]">2. Communication Addresses</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="font-bold text-gray-500">Alternate Phone Number</label>
                              <input 
                                type="text"
                                value={metaAltPhone} onChange={e => setMetaAltPhone(e.target.value)}
                                placeholder="91-0000 000"
                                className="w-full p-2 border border-gray-205 rounded-xl bg-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-gray-500">Personal Email Address</label>
                              <input 
                                type="email"
                                value={metaPersonalEmail} onChange={e => setMetaPersonalEmail(e.target.value)}
                                className="w-full p-2 border border-gray-205 rounded-xl bg-white font-mono"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-gray-500">Official Corporate Email Address</label>
                              <input 
                                type="email"
                                value={metaOfficialEmail} onChange={e => setMetaOfficialEmail(e.target.value)}
                                placeholder="name@corporation.com"
                                className="w-full p-2 border border-gray-205 rounded-xl bg-white font-mono"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-gray-500">Country of Location</label>
                              <input 
                                type="text"
                                value={metaCountry || 'India'} onChange={e => setMetaCountry(e.target.value)}
                                className="w-full p-2 border border-gray-205 rounded-xl bg-white"
                              />
                            </div>
                            <div className="space-y-1 col-span-2">
                              <label className="font-bold text-gray-500">Current Street Home Address</label>
                              <input 
                                type="text"
                                value={metaCurrentAddress} onChange={e => setMetaCurrentAddress(e.target.value)}
                                className="w-full p-2 border border-gray-205 rounded-xl bg-white"
                              />
                            </div>
                            <div className="space-y-1 col-span-2">
                              <label className="font-bold text-gray-500">Permanent Native/Record Address</label>
                              <input 
                                type="text"
                                value={metaPermanentAddress} onChange={e => setMetaPermanentAddress(e.target.value)}
                                className="w-full p-2 border border-gray-205 rounded-xl bg-white"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Section C: Employment details */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                          <h5 className="font-black text-rose-800 uppercase tracking-widest text-[9.5px]">3. Professional Compliance</h5>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-1 col-span-2">
                              <label className="font-bold text-gray-500">Assigned Branch Location Office</label>
                              <input 
                                type="text" value={metaBranchOffice} onChange={e => setMetaBranchOffice(e.target.value)}
                                className="w-full p-2 border border-gray-205 rounded-xl bg-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-gray-500">Confirmation Date</label>
                              <input 
                                type="date" value={metaConfirmationDate} onChange={e => setMetaConfirmationDate(e.target.value)}
                                className="w-full p-2 border border-gray-205 rounded-xl bg-white font-mono"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-gray-500">Employee Group Type</label>
                              <select 
                                value={metaType} onChange={e => setMetaType(e.target.value)}
                                className="w-full p-2 border border-gray-205 rounded-xl bg-white"
                              >
                                <option value="Full-Time">Full-Time</option>
                                <option value="Part-Time">Part-Time</option>
                                <option value="On-Contract">On-Contract</option>
                                <option value="Consultant">Consultant</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Section D: Banking details */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                          <h5 className="font-black text-green-800 uppercase tracking-widest text-[9.5px]">4. Remuneration Bank Accounts</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <label className="font-bold text-gray-500">Account Holder Name</label>
                              <input 
                                type="text" value={metaBankHolder} onChange={e => setMetaBankHolder(e.target.value)}
                                className="w-full p-2 border border-gray-205 rounded-xl bg-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-gray-500">Bank Name</label>
                              <input 
                                type="text" value={metaBankName} onChange={e => setMetaBankName(e.target.value)}
                                className="w-full p-2 border border-gray-205 rounded-xl bg-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-gray-500">Account Number</label>
                              <input 
                                type="text" value={metaBankAccount} onChange={e => setMetaBankAccount(e.target.value)}
                                className="w-full p-2 border border-gray-205 rounded-xl bg-white font-mono"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-gray-500">IFSC Branch Code</label>
                              <input 
                                type="text" value={metaBankIfsc} onChange={e => setMetaBankIfsc(e.target.value)}
                                className="w-full p-2 border border-gray-205 rounded-xl bg-white font-mono"
                              />
                            </div>
                            <div className="space-y-1 col-span-2">
                              <label className="font-bold text-gray-500">Bank Branch Name & Location</label>
                              <input 
                                type="text" value={metaBankBranch} onChange={e => setMetaBankBranch(e.target.value)}
                                className="w-full p-2 border border-gray-205 rounded-xl bg-white"
                              />
                            </div>
                            <div className="space-y-1 col-span-3">
                              <label className="font-bold text-emerald-700">UPI Payments ID Identifier</label>
                              <input 
                                type="text" value={metaBankUpi} onChange={e => setMetaBankUpi(e.target.value)}
                                placeholder="e.g. employee@okhdfcbank"
                                className="w-full p-2.5 border border-emerald-300 focus:border-emerald-550 rounded-xl bg-white font-mono"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Section E: Emergency Contacts */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                          <h5 className="font-black text-rose-800 uppercase tracking-widest text-[9.5px]">5. Emergency Contact</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="font-bold text-gray-500">Contact Friend/Family Name</label>
                              <input 
                                type="text" value={metaEmergencyName} onChange={e => setMetaEmergencyName(e.target.value)}
                                className="w-full p-2 border border-gray-205 rounded-xl bg-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-gray-500">Relationship Type</label>
                              <input 
                                type="text" value={metaEmergencyRelation} onChange={e => setMetaEmergencyRelation(e.target.value)}
                                className="w-full p-2 border border-gray-205 rounded-xl bg-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-gray-500">Primary Mobile Number</label>
                              <input 
                                type="text" value={metaEmergencyPhone} onChange={e => setMetaEmergencyPhone(e.target.value)}
                                className="w-full p-2 border border-gray-205 rounded-xl bg-white font-mono"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-gray-500">Alternate Support Number</label>
                              <input 
                                type="text" value={metaEmergencyAlt} onChange={e => setMetaEmergencyAlt(e.target.value)}
                                className="w-full p-2 border border-gray-205 rounded-xl bg-white font-mono"
                              />
                            </div>
                          </div>
                        </div>

                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-gray-150">
                        <button 
                          type="button" onClick={() => setShowEditMetaForm(false)}
                          className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          className="px-6 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer shadow-xs"
                        >
                          Save Dossier Record
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* 2. ATTENDANCE CLOCK IN/OUT TAB */}
              {activeSubTab === 'attendance' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Stats Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-2xs flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Present Status Rate</span>
                        <span className="font-extrabold text-slate-850 text-base">92% Average</span>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-2xs flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Log entries</span>
                        <span className="font-extrabold text-slate-850 text-base">{attendance.filter(a => a.employee_id === selectedEmployee.id).length} recorded</span>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-2xs flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Overtime Accrued</span>
                        <span className="font-extrabold text-slate-850 text-base">14 Hour Base</span>
                      </div>
                    </div>
                  </div>

                  {/* Active Simulator Check-In / Clock */}
                  <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 p-6 rounded-2xl text-white shadow-md border border-indigo-950 space-y-4">
                    <div>
                      <span className="text-[10px] font-black uppercase text-indigo-200 tracking-widest block">Simulation Office Hub Terminal</span>
                      <h4 className="font-black text-lg">Interactive Clock In / Out Simulator</h4>
                      <p className="text-xs text-indigo-200">Simulate daily geo-punch of HVAC techs working on corporate client premises.</p>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
                      <div className="space-y-1">
                        <span className="text-xs text-indigo-200 block">Daily Date: <strong className="text-white font-mono">2026-06-21 (Today)</strong></span>
                        <span className="text-xs text-indigo-200 flex items-center gap-1.5 font-mono">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          GPS: 12.9716° N, 77.5946° E (Bengaluru HQ Office)
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const overlap = checkTimeOverlaps(
                              attendance,
                              selectedEmployee.id,
                              '2026-06-21',
                              '09:12 AM',
                              ''
                            );
                            if (overlap.isOverlapping) {
                              alert(overlap.errorMsg);
                              return;
                            }
                            const new_log: Attendance = {
                              id: 'att_' + Math.random().toString(36).substr(2, 9),
                              employee_id: selectedEmployee.id,
                              date: '2026-06-21',
                              check_in_time: '09:12 AM',
                              check_out_time: null as any,
                              total_hours: 0,
                              overtime_hours: 0,
                              attendance_status: 'Present',
                              location: 'Bengaluru Tech Park Office',
                              remarks: 'Checked-in via Mobile simulator biometric client',
                              latitude: 12.9716,
                              longitude: 77.5946,
                              check_in_photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
                              check_out_photo: null as any
                            };
                            onAddAttendance(new_log);
                            alert('Success! Checked-in successfully today at Bangalore Headquarters office.');
                          }}
                          disabled={attendance.some(a => a.employee_id === selectedEmployee.id && a.date === '2026-06-21' && !a.check_out_time)}
                          className="px-5 py-3 bg-emerald-550 hover:bg-emerald-600 disabled:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-black rounded-xl shadow-md transition-all uppercase tracking-wider cursor-pointer flex items-center gap-1.5 shrink-0"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Instant Check-in
                        </button>

                        <button
                          onClick={() => {
                            const current = attendance.find(a => a.employee_id === selectedEmployee.id && a.date === '2026-06-21' && !a.check_out_time);
                            if (!current) {
                              alert('Error: You must execute Clock-In first before completing a Clock Out log.');
                              return;
                            }
                            const calced = calculateTotalAndOvertime(current.check_in_time, '06:15 PM');
                            const updated_log: Attendance = {
                              ...current,
                              check_out_time: '06:15 PM',
                              total_hours: calced.total,
                              overtime_hours: calced.overtime,
                              remarks: current.remarks + ' | Left site premises safely, checklist updated.',
                              check_out_photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
                            };
                            onAddAttendance(updated_log);
                            alert(`Success! Checked-out successfully today with ${calced.total} Total business hours calculated.`);
                          }}
                          disabled={!attendance.some(a => a.employee_id === selectedEmployee.id && a.date === '2026-06-21' && !a.check_out_time)}
                          className="px-5 py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-black rounded-xl shadow-md transition-all uppercase tracking-wider cursor-pointer flex items-center gap-1.5 shrink-0"
                        >
                          <XCircle className="w-4 h-4" /> Clock Out
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Manual Log backdate tool */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                    <div>
                      <h5 className="font-extrabold text-slate-900 text-sm">Add Historical Attendance Logs Manual Override</h5>
                      <p className="text-xs text-slate-400">Backdate attendance on behalf of employee for offline shifts.</p>
                    </div>

                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const overlap = checkTimeOverlaps(
                          attendance,
                          selectedEmployee.id,
                          attManualDate,
                          attManualCheckIn,
                          attManualCheckOut
                        );
                        if (overlap.isOverlapping) {
                          alert(overlap.errorMsg);
                          return;
                        }
                        const calced = calculateTotalAndOvertime(attManualCheckIn, attManualCheckOut);
                        const log: Attendance = {
                          id: 'att_' + Math.random().toString(36).substr(2, 9),
                          employee_id: selectedEmployee.id,
                          date: attManualDate,
                          check_in_time: attManualCheckIn,
                          check_out_time: attManualCheckOut,
                          total_hours: calced.total,
                          overtime_hours: calced.overtime,
                          attendance_status: attManualStatus as any,
                          location: attManualLocation,
                          remarks: attManualRemarks,
                          latitude: 12.9123,
                          longitude: 77.6534,
                          check_in_photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
                          check_out_photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80'
                        };
                        onAddAttendance(log);
                        setAttManualRemarks('');
                        alert('Attendance log registered successfully!');
                      }}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs"
                    >
                      <div>
                        <label className="text-gray-500 font-bold block mb-1">Service Log Date</label>
                        <input 
                          type="date" required value={attManualDate} onChange={e => setAttManualDate(e.target.value)}
                          className="w-full p-2 border rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-gray-500 font-bold block mb-1">Attendance Status</label>
                        <select 
                          value={attManualStatus} onChange={e => setAttManualStatus(e.target.value)}
                          className="w-full p-2 border rounded-lg bg-white"
                        >
                          <option value="PRESENT">PRESENT</option>
                          <option value="LATE">LATE</option>
                          <option value="HALF_DAY">HALF DAY</option>
                          <option value="ABSENT">ABSENT</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-gray-500 font-bold block mb-1">Check-In Time</label>
                        <input 
                          type="text" required value={attManualCheckIn} onChange={e => setAttManualCheckIn(e.target.value)}
                          placeholder="e.g. 09:15 AM"
                          className="w-full p-2 border rounded-lg bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-gray-500 font-bold block mb-1">Check-Out Time</label>
                        <input 
                          type="text" required value={attManualCheckOut} onChange={e => setAttManualCheckOut(e.target.value)}
                          placeholder="e.g. 06:00 PM"
                          className="w-full p-2 border rounded-lg bg-white font-mono"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-gray-500 font-bold block mb-1">Assigned Client Site Location</label>
                        <input 
                          type="text" required value={attManualLocation} onChange={e => setAttManualLocation(e.target.value)}
                          placeholder="Malleswaram Hub Complex"
                          className="w-full p-2 border rounded-lg bg-white"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="text-gray-500 font-bold block mb-1">Audit Remarks</label>
                        <input 
                          type="text" value={attManualRemarks} onChange={e => setAttManualRemarks(e.target.value)}
                          placeholder="Client project work check"
                          className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                      <div className="md:col-span-3 flex justify-end">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                        >
                          Save Manual entry log
                        </button>
                      </div>
                    </form>
                  </div>

                </div>
              )}

              {/* 3. LEAVE MANAGEMENT TAB */}
              {activeSubTab === 'leaves' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Leave balance dashboards */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                      <div>
                        <h4 className="font-extrabold text-gray-900 text-base">Annual Paid Leave Allowances</h4>
                        <p className="text-xs text-gray-400">Total credited paid leaves remaining for year {new Date().getFullYear()}.</p>
                      </div>
                      <button
                        onClick={() => setShowLbSetup(!showLbSetup)}
                        className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 text-indigo-750 font-bold rounded-xl text-xs"
                      >
                        {showLbSetup ? 'Hide setup' : '⚙ Adjust balances'}
                      </button>
                    </div>

                    {showLbSetup && (
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          const balance: LeaveBalance = {
                            id: 'lb_' + Math.random().toString(36).substr(2, 9),
                            employee_id: selectedEmployee.id,
                            year: 2026,
                            casual_leave_balance: Number(lbCasual),
                            sick_leave_balance: Number(lbSick),
                            earned_leave_balance: Number(lbEarned),
                            total_leave_balance: Number(lbCasual) + Number(lbSick) + Number(lbEarned)
                          };
                          onUpdateLeaveBalance(balance);
                          setShowLbSetup(false);
                          alert('Leave allowances updated successfully!');
                        }}
                        className="p-4 bg-slate-50 border rounded-xl grid grid-cols-3 gap-3 text-xs"
                      >
                        <div>
                          <label className="text-slate-500 font-bold block mb-1">Casual Leave Balance</label>
                          <input 
                            type="number" value={lbCasual} onChange={e => setLbCasual(Number(e.target.value))}
                            className="w-full p-2 border rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-slate-500 font-bold block mb-1">Sick Leave Balance</label>
                          <input 
                            type="number" value={lbSick} onChange={e => setLbSick(Number(e.target.value))}
                            className="w-full p-2 border rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-slate-500 font-bold block mb-1">Earned Leave Balance</label>
                          <input 
                            type="number" value={lbEarned} onChange={e => setLbEarned(Number(e.target.value))}
                            className="w-full p-2 border rounded-lg bg-white"
                          />
                        </div>
                        <div className="col-span-3 flex justify-end">
                          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold">
                            Save crediting settings
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                      <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-orange-700 font-black uppercase tracking-wider block">Casual Leave</span>
                          <span className="font-semibold text-gray-500 text-xs">Annual Entitled: 12 days</span>
                        </div>
                        <span className="font-extrabold text-orange-700 text-2xl font-mono">{lbCasual} Remaining</span>
                      </div>

                      <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-emerald-700 font-black uppercase tracking-wider block">Sick Leave</span>
                          <span className="font-semibold text-gray-500 text-xs">Annual Entitled: 8 days</span>
                        </div>
                        <span className="font-extrabold text-emerald-700 text-2xl font-mono">{lbSick} Remaining</span>
                      </div>

                      <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-indigo-700 font-black uppercase tracking-wider block">Earned Leave</span>
                          <span className="font-semibold text-gray-500 text-xs">Annual Entitled: 15 days</span>
                        </div>
                        <span className="font-extrabold text-indigo-700 text-2xl font-mono">{lbEarned} Remaining</span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Leave request form */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-205 space-y-4">
                    <div>
                      <h5 className="font-extrabold text-slate-900 text-sm">File Official Holiday/Leave Request</h5>
                      <p className="text-xs text-slate-400">File leave schedules for manager review. Approvals auto-calculate against credits.</p>
                    </div>

                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const start = new Date(lrStartDate);
                        const end = new Date(lrEndDate);
                        const diffTime = Math.abs(end.getTime() - start.getTime());
                        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

                        const lrItem: LeaveRequest = {
                          id: 'req_' + Math.random().toString(36).substr(2, 9),
                          employee_id: selectedEmployee.id,
                          leave_type: lrType,
                          start_date: lrStartDate,
                          end_date: lrEndDate,
                          number_of_days: days,
                          reason: lrReason,
                          attachment: lrAttachment || 'leave_request_cert.pdf',
                          applied_date: '2026-06-21',
                          approval_status: 'Pending',
                          approved_by: null as any,
                          approval_date: null as any,
                          remarks: null as any
                        };

                        onAddLeaveRequest(lrItem);
                        setLrReason('');
                        alert(`Leave requested successfully for ${days} days! Mode set to Pending.`);
                      }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs"
                    >
                      <div>
                        <label className="text-slate-500 font-bold block mb-1">Leave Category Type</label>
                        <select 
                          value={lrType} onChange={e => setLrType(e.target.value)}
                          className="w-full p-2 border rounded-lg bg-white font-semibold"
                        >
                          <option value="CASUAL">CASUAL LEAVE</option>
                          <option value="SICK">SICK LEAVE</option>
                          <option value="EARNED">EARNED LEAVE</option>
                          <option value="UNPAID">LOSS OF PAY (UNPAID)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-500 font-bold block mb-1">Upload Supplementary Attachment Certificate (Simulated)</label>
                        <input 
                          type="text" value={lrAttachment} onChange={e => setLrAttachment(e.target.value)}
                          placeholder="doctor_prescription.pdf"
                          className="w-full p-2 border rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-500 font-bold block mb-1">Start Date Calendar</label>
                        <input 
                          type="date" required value={lrStartDate} onChange={e => setLrStartDate(e.target.value)}
                          className="w-full p-2 border rounded-lg bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-slate-500 font-bold block mb-1">Last Date Calendar</label>
                        <input 
                          type="date" required value={lrEndDate} onChange={e => setLrEndDate(e.target.value)}
                          className="w-full p-2 border rounded-lg bg-white font-mono"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-slate-500 font-bold block mb-1">State Justification Reason</label>
                        <textarea 
                          required value={lrReason} onChange={e => setLrReason(e.target.value)}
                          rows={2}
                          placeholder="Provide descriptive justification reason context"
                          className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                      <div className="md:col-span-2 flex justify-end">
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-xs transition-colors cursor-pointer"
                        >
                          Submit Leave Proposal File
                        </button>
                      </div>
                    </form>
                  </div>

                </div>
              )}

              {/* 4. SALARY AND PAYROLL TAB */}
              {activeSubTab === 'payroll' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Remuneration structure */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                      <div>
                        <h4 className="font-extrabold text-gray-900 text-base">Monthly Salary Structure Setup</h4>
                        <p className="text-xs text-gray-400">Detailed component breakdown of gross and net corporate payouts.</p>
                      </div>
                      <button
                        onClick={() => setShowSsSetup(!showSsSetup)}
                        className="px-3.5 py-2 bg-indigo-50 border border-indigo-150 text-indigo-750 font-bold rounded-xl text-xs hover:bg-indigo-100"
                      >
                        {showSsSetup ? 'Hide builder' : '⚙ Override components'}
                      </button>
                    </div>

                    {showSsSetup && (
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          const gross = Number(ssBasic) + Number(ssHra) + Number(ssConveyance) + Number(ssMedical) + Number(ssSite) + Number(ssTravel) + Number(ssOther);
                          const structure: SalaryStructure = {
                            id: 'sal_' + Math.random().toString(36).substr(2, 9),
                            employee_id: selectedEmployee.id,
                            effective_date: ssEffectiveDate,
                            basic_salary: Number(ssBasic),
                            hra: Number(ssHra),
                            conveyance_allowance: Number(ssConveyance),
                            medical_allowance: Number(ssMedical),
                            site_allowance: Number(ssSite),
                            travel_allowance: Number(ssTravel),
                            other_allowance: Number(ssOther),
                            gross_salary: gross
                          };
                          onUpdateSalaryStructure(structure);
                          setShowSsSetup(false);
                          alert('Salary structure updated successfully!');
                        }}
                        className="p-4 bg-slate-50 border rounded-xl grid grid-cols-1 md:grid-cols-4 gap-3 text-xs"
                      >
                        <div>
                          <label className="text-slate-500 font-bold block mb-1">Basic Salary (₹)</label>
                          <input 
                            type="number" value={ssBasic} onChange={e => setSsBasic(Number(e.target.value))}
                            className="w-full p-2 border rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-slate-500 font-bold block mb-1">HRA (₹)</label>
                          <input 
                            type="number" value={ssHra} onChange={e => setSsHra(Number(e.target.value))}
                            className="w-full p-2 border rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-slate-500 font-bold block mb-1">Conveyance Allowance (₹)</label>
                          <input 
                            type="number" value={ssConveyance} onChange={e => setSsConveyance(Number(e.target.value))}
                            className="w-full p-2 border rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-slate-500 font-bold block mb-1">Medical Allowance (₹)</label>
                          <input 
                            type="number" value={ssMedical} onChange={e => setSsMedical(Number(e.target.value))}
                            className="w-full p-2 border rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-slate-500 font-bold block mb-1">Site Allowance (₹)</label>
                          <input 
                            type="number" value={ssSite} onChange={e => setSsSite(Number(e.target.value))}
                            className="w-full p-2 border rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-slate-500 font-bold block mb-1">Travel Allowance (₹)</label>
                          <input 
                            type="number" value={ssTravel} onChange={e => setSsTravel(Number(e.target.value))}
                            className="w-full p-2 border rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-slate-500 font-bold block mb-1">Other Allowance (₹)</label>
                          <input 
                            type="number" value={ssOther} onChange={e => setSsOther(Number(e.target.value))}
                            className="w-full p-2 border rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-slate-500 font-bold block mb-1">Effective Date</label>
                          <input 
                            type="date" value={ssEffectiveDate} onChange={e => setSsEffectiveDate(e.target.value)}
                            className="w-full p-2 border rounded-lg bg-white"
                          />
                        </div>
                        <div className="md:col-span-4 flex justify-end">
                          <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-bold">
                            Determine Salary Components
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
                      <div className="p-3 bg-slate-50 border rounded-lg">
                        <span className="text-slate-400 font-bold text-[9.5px] uppercase tracking-wider block">Basic Salary</span>
                        <span className="font-black text-slate-850 text-sm leading-tight">₹{ssBasic}/mo</span>
                      </div>
                      <div className="p-3 bg-slate-50 border rounded-lg">
                        <span className="text-slate-400 font-semibold text-[9.5px] uppercase tracking-wider block">House Rent (HRA)</span>
                        <span className="font-bold text-slate-800 text-sm">₹{ssHra}</span>
                      </div>
                      <div className="p-3 bg-slate-50 border rounded-lg">
                        <span className="text-slate-400 font-semibold text-[9.5px] uppercase tracking-wider block">Site & Travel Allowance</span>
                        <span className="font-bold text-slate-800 text-sm">₹{ssSite + ssTravel}</span>
                      </div>
                      <div className="p-3 bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg">
                        <span className="text-indigo-850 font-black text-[9.5px] uppercase tracking-wider block">Gross Wage Earnings</span>
                        <span className="font-black text-indigo-700 text-base">₹{ssBasic + ssHra + ssConveyance + ssMedical + ssSite + ssTravel + ssOther}</span>
                      </div>
                    </div>
                  </div>

                  {/* Monthly payroll generator */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-150 space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <h5 className="font-extrabold text-slate-900 text-sm">Process Monthly Salary Voucher Slip</h5>
                        <p className="text-xs text-slate-400">Calculate auto deductions and net payouts for active work cycle months.</p>
                      </div>
                      <button
                        onClick={() => setShowPyGenerator(!showPyGenerator)}
                        className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-750 font-bold rounded-lg"
                      >
                        {showPyGenerator ? 'Collapse Voucher tool' : '⚡ Generate pay slip'}
                      </button>
                    </div>

                    {showPyGenerator && (
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          const gross = ssBasic + ssHra + ssConveyance + ssMedical + ssSite + ssTravel + ssOther;
                          const pf = Math.round(ssBasic * 0.12);
                          const esi = Math.round(gross * 0.0075);
                          const tds = Math.round(gross * 0.10);
                          const totalDeds = pf + esi + tds + Number(pyDeductions);
                          const net = gross - totalDeds;

                          const voucher: Payroll = {
                            id: 'pay_' + Math.random().toString(36).substr(2, 9),
                            employee_id: selectedEmployee.id,
                            payroll_month: pyMonth,
                            working_days: Number(pyWorkingDays),
                            present_days: Number(pyPresentDays),
                            leave_days: Number(pyLeaveDays),
                            overtime_hours: Number(pyOvertimeHours),
                            gross_salary: gross,
                            pf_deduction: pf,
                            esi_deduction: esi,
                            tds_deduction: tds,
                            other_deductions: Number(pyDeductions),
                            net_salary: net,
                            payment_date: '',
                            payment_status: 'Pending'
                          };

                          onAddPayroll(voucher);
                          setShowPyGenerator(false);
                          alert('Payroll processed successfully today! Marked as Pending for disbursement.');
                        }}
                        className="p-4 bg-slate-50 border rounded-xl grid grid-cols-2 md:grid-cols-4 gap-4 text-xs"
                      >
                        <div>
                          <label className="text-slate-500 font-bold block mb-1">Payroll Cycle Month</label>
                          <input 
                            type="text" required value={pyMonth} onChange={e => setPyMonth(e.target.value)}
                            placeholder="June 2026"
                            className="w-full p-2 border rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-slate-500 font-bold block mb-1">Cycle Business Working Days</label>
                          <input 
                            type="number" required value={pyWorkingDays} onChange={e => setPyWorkingDays(Number(e.target.value))}
                            className="w-full p-2 border rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-slate-500 font-bold block mb-1">Total Days Present</label>
                          <input 
                            type="number" required value={pyPresentDays} onChange={e => setPyPresentDays(Number(e.target.value))}
                            className="w-full p-2 border rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-slate-500 font-bold block mb-1">Cycle Taken Leaves</label>
                          <input 
                            type="number" required value={pyLeaveDays} onChange={e => setPyLeaveDays(Number(e.target.value))}
                            className="w-full p-2 border rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-slate-500 font-bold block mb-1">Accrued Overtime Hours</label>
                          <input 
                            type="number" required value={pyOvertimeHours} onChange={e => setPyOvertimeHours(Number(e.target.value))}
                            className="w-full p-2 border rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-slate-500 font-bold block mb-1">Additional Miscellaneous Deductions (₹)</label>
                          <input 
                            type="number" required value={pyDeductions} onChange={e => setPyDeductions(Number(e.target.value))}
                            className="w-full p-2 border rounded-lg bg-white"
                          />
                        </div>
                        <div className="md:col-span-2 flex flex-col justify-end">
                          <span className="text-[10px] text-gray-400 italic block leading-tight pb-1">
                            Employer calculations: Gross basic base PF (12%) and medical ESI (0.75%) auto-calculate.
                          </span>
                        </div>
                        <div className="md:col-span-4 flex justify-end">
                          <button
                            type="submit"
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-lg text-xs tracking-wider font-bold cursor-pointer"
                          >
                            Generate corporate voucher slip
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                </div>
              )}

              {/* Danger Zone */}
              <div className="p-4 bg-red-50 border border-red-150 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-red-900 text-sm">Remove Employee Record</h4>
                  <p className="text-xs text-red-600">This action breaks any direct assignment networks</p>
                </div>
                <button 
                  id="delete-employee-btn"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this employee?')) {
                      onDeleteEmployee(selectedEmployee.id);
                      onSelectEmployee(undefined);
                    }
                  }}
                  className="p-3 bg-red-650 hover:bg-red-700 text-white rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Area: Dynamic Histories, Ledgers & Hierarchy (lg:col-span-4) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Profile subtab history elements: Line Reporting chain & technical skills */}
              {activeSubTab === 'profile' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Reporting chain */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs space-y-4">
                    <div>
                      <h4 className="font-extrabold text-gray-950 text-sm flex items-center gap-2">
                        <ListCollapse className="w-4.5 h-4.5 text-indigo-600" />
                        Line Reporting
                      </h4>
                      <p className="text-[11px] text-gray-400">Click any direct report/leader node to navigate.</p>
                    </div>

                    <div className="relative pl-5 space-y-4 pt-1 font-sans">
                      <div className="absolute left-[7px] top-2 bottom-3 w-[1.5px] bg-slate-100"></div>
                      {selectedChain.map((member) => {
                        const isCurrent = member.id === selectedEmployee.id;
                        const initials = `${member.name?.[0] || '?'}`;
                        return (
                          <div key={member.id} className="relative flex items-start gap-3 group">
                            <div className={`absolute -left-[20px] top-2 w-2 h-2 rounded-full border transition-all ${
                              isCurrent 
                                ? 'bg-indigo-600 border-white scale-125 ring-2 ring-indigo-100' 
                                : 'bg-white border-slate-300'
                            }`}></div>
                            
                            <div 
                              onClick={() => member.id !== selectedEmployee.id && onSelectEmployee(member.id)}
                              className={`flex-1 p-2.5 rounded-xl border text-xs transition-all ${
                                isCurrent 
                                  ? 'bg-indigo-50/50 border-indigo-150' 
                                  : 'bg-white border-slate-100 hover:border-indigo-150 hover:bg-slate-50/50 cursor-pointer'
                              }`}
                            >
                              <div className="flex justify-between items-center gap-2">
                                <div className="flex items-center gap-2">
                                  <div className={`w-5 h-5 rounded-full font-bold flex items-center justify-center text-[9px] shrink-0 ${
                                    isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                                  }`}>
                                    {initials}
                                  </div>
                                  <div>
                                    <span className={`font-extrabold tracking-tight ${isCurrent ? 'text-indigo-950' : 'text-slate-800'}`}>
                                      {member.name}
                                    </span>
                                    <p className={`text-[10px] font-semibold leading-tight ${isCurrent ? 'text-indigo-600' : 'text-gray-500'}`}>{member.title}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs space-y-4">
                    <h4 className="font-extrabold text-gray-950 text-sm flex items-center gap-2">
                      <Award className="w-4.5 h-4.5 text-indigo-600" />
                      Technical Skills
                    </h4>
                    {selectedSkills.length > 0 ? (
                      <div className="space-y-3.5">
                        {selectedSkills.map(skill => (
                          <div key={skill.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100/80 space-y-1">
                            <div className="flex justify-between items-center gap-2">
                              <span className="font-bold text-slate-800 text-xs leading-tight">{skill.skill_name}</span>
                              <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full ${
                                skill.skill_level === 'EXPERT' ? 'bg-red-50 text-red-700 font-bold border border-red-150' :
                                skill.skill_level === 'ADVANCED' ? 'bg-amber-50 text-amber-700 font-bold border border-amber-150' :
                                skill.skill_level === 'INTERMEDIATE' ? 'bg-blue-50 text-blue-700 font-bold border border-blue-150' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {skill.skill_level}
                              </span>
                            </div>
                            <div className="text-[10px] text-gray-400 space-y-0.5 font-mono leading-tight">
                              <p>Cert: {skill.certificate_number || 'N/A'}</p>
                              <p>Issued by {skill.issuing_authority || 'N/A'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No skills registered for this employee yet.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Attendance dynamic sidebar ledger */}
              {activeSubTab === 'attendance' && (
                <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-xs animate-fadeIn">
                  <div className="p-4 bg-slate-50 border-b border-indigo-50">
                    <h5 className="font-extrabold text-slate-900 text-sm">Attendance Ledger</h5>
                    <p className="text-[11px] text-slate-400 font-medium font-sans">Punch clock timeline (all entries deletable).</p>
                  </div>

                  <div className="p-4 divide-y divide-slate-100 max-h-[520px] overflow-y-auto space-y-3.5">
                    {attendance.filter(a => a.employee_id === selectedEmployee.id).length > 0 ? (
                      attendance
                        .filter(a => a.employee_id === selectedEmployee.id)
                        .sort((a,b) => b.date.localeCompare(a.date))
                        .map(log => (
                          <div key={log.id} className="pt-3.5 first:pt-0 pb-1 last:pb-0 space-y-2">
                            <div className="flex justify-between items-start gap-1">
                              <div>
                                <span className="font-extrabold text-indigo-950 font-mono text-xs">{log.date}</span>
                                <div className="flex gap-2 items-center mt-0.5 text-[10.5px] font-semibold text-slate-500 font-mono">
                                  <span>In: <strong className="text-slate-800 font-bold">{log.check_in_time}</strong></span>
                                  <span>•</span>
                                  <span>Out: <strong className="text-slate-800 font-bold">{log.check_out_time || 'Working'}</strong></span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className={`px-2 py-0.5 text-[9px] font-black rounded-md border ${
                                  log.attendance_status === 'Present' ? 'bg-emerald-50 border-emerald-250 text-emerald-700' :
                                  log.attendance_status === 'Half Day' ? 'bg-blue-50 border-blue-250 text-blue-700' :
                                  log.attendance_status === 'Leave' ? 'bg-amber-50 border-amber-250 text-amber-700' :
                                  'bg-rose-50 border-rose-250 text-rose-700'
                                }`}>
                                  {log.attendance_status}
                                </span>
                                <button
                                  onClick={() => {
                                    if (confirm('Delete attendance punch card record?')) {
                                      onDeleteAttendance(log.id);
                                    }
                                  }}
                                  className="p-1 text-slate-400 hover:text-red-650 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <p className="text-[11px] text-gray-500 italic leading-tight pl-1.5 border-l-2 border-indigo-200 font-sans">
                              "{log.remarks || 'No punch annotations.'}"
                            </p>
                            {log.latitude && (
                              <span className="text-[9.5px] text-gray-400 font-mono block">📌 GPS: {log.latitude}, {log.longitude}</span>
                            )}
                          </div>
                        ))
                    ) : (
                      <p className="text-xs text-slate-400 italic text-center py-6">No punch card records logged.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Leaves control dynamic sidebar list */}
              {activeSubTab === 'leaves' && (
                <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-xs animate-fadeIn">
                  <div className="p-4 bg-slate-50 border-b border-indigo-50">
                    <h5 className="font-extrabold text-slate-900 text-sm">Leave Tracker</h5>
                    <p className="text-[11px] text-slate-400 font-medium font-sans">Track leaves & supervisor overrides.</p>
                  </div>

                  <div className="p-4 divide-y divide-slate-100 max-h-[520px] overflow-y-auto space-y-3.5">
                    {leaveRequests.filter(l => l.employee_id === selectedEmployee.id).length > 0 ? (
                      leaveRequests
                        .filter(l => l.employee_id === selectedEmployee.id)
                        .map(req => (
                          <div key={req.id} className="pt-3.5 first:pt-0 pb-1 last:pb-0 space-y-2">
                            <div className="flex justify-between items-start gap-1">
                              <div>
                                <span className="font-extrabold text-indigo-950 text-[10px] py-0.5 px-1.5 bg-indigo-50 rounded border border-indigo-100 uppercase tracking-widest">{req.leave_type}</span>
                                <p className="text-[10.5px] text-slate-400 mt-1 font-bold">
                                  <strong className="font-mono text-slate-600">{req.start_date}</strong> to <strong className="font-mono text-slate-600">{req.end_date}</strong> ({req.number_of_days} days)
                                </p>
                              </div>
                              <span className={`px-2 py-0.5 text-[9px] font-black rounded-lg border uppercase tracking-wider ${
                                req.approval_status === 'Approved' ? 'bg-emerald-50 border-emerald-250 text-emerald-700' :
                                req.approval_status === 'Rejected' ? 'bg-rose-50 border-rose-250 text-rose-700' :
                                'bg-amber-50 border-amber-250 text-amber-700'
                              }`}>
                                {req.approval_status}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-700 bg-slate-50 p-1.5 rounded border border-slate-150 italic leading-tight">
                              Reason: "{req.reason}"
                            </p>

                            {req.approval_status === 'Pending' ? (
                              <div className="p-2 bg-indigo-50/40 border border-indigo-100 rounded-lg space-y-1.5">
                                <span className="text-[10px] text-indigo-850 font-extrabold block">Supervisor Action:</span>
                                <input 
                                  type="text" 
                                  id={`remarks-sidebar-${req.id}`} 
                                  placeholder="Opinion commentary..." 
                                  className="w-full p-1 text-[11px] bg-white border border-slate-200 rounded focus:outline-indigo-550 focus:ring-1 focus:ring-indigo-500"
                                />
                                <div className="flex gap-1.5 pt-0.5">
                                  <button
                                    onClick={() => {
                                      const remEl = document.getElementById(`remarks-sidebar-${req.id}`) as HTMLInputElement;
                                      onUpdateLeaveRequest(req.id, {
                                        approval_status: 'Approved',
                                        approved_by: 'MGR_ADMIN',
                                        approval_date: '2026-06-21',
                                        remarks: remEl?.value || 'Approved'
                                      });
                                      alert('Leave proposal APPROVED successfully!');
                                    }}
                                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-750 text-white rounded text-[10px] font-black uppercase tracking-wider cursor-pointer text-center"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => {
                                      const remEl = document.getElementById(`remarks-sidebar-${req.id}`) as HTMLInputElement;
                                      onUpdateLeaveRequest(req.id, {
                                        approval_status: 'Rejected',
                                        approved_by: 'MGR_ADMIN',
                                        approval_date: '2026-06-21',
                                        remarks: remEl?.value || 'Rejected'
                                      });
                                      alert('Leave proposal REJECTED.');
                                    }}
                                    className="flex-1 py-1.5 bg-rose-650 hover:bg-rose-750 text-white rounded text-[10px] font-black uppercase tracking-wider cursor-pointer text-center"
                                  >
                                    Reject
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-[10px] text-slate-400 italic">
                                Note: "{req.remarks || 'No notes.'}" by {req.approved_by || 'System'} on {req.approval_date}
                              </p>
                            )}
                          </div>
                        ))
                    ) : (
                      <p className="text-xs text-slate-400 italic text-center py-6">No leave proposals filed.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Monthly payroll payslip history sidebar */}
              {activeSubTab === 'payroll' && (
                <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-xs animate-fadeIn">
                  <div className="p-4 bg-slate-50 border-b border-indigo-50">
                    <h5 className="font-extrabold text-slate-900 text-sm">Monthly pay slips</h5>
                    <p className="text-[11px] text-slate-400 font-medium">Credited slips history registers.</p>
                  </div>

                  <div className="p-4 divide-y divide-slate-100 max-h-[520px] overflow-y-auto space-y-4 text-xs">
                    {payrolls.filter(p => p.employee_id === selectedEmployee.id).length > 0 ? (
                      payrolls
                        .filter(p => p.employee_id === selectedEmployee.id)
                        .map(pay => {
                          const pf = pay.pf_deduction || 0;
                          const esi = pay.esi_deduction || 0;
                          const tds = pay.tds_deduction || 0;
                          const misc = pay.other_deductions || 0;
                          return (
                            <div key={pay.id} className="pt-3.5 first:pt-0 pb-1.5 last:pb-0 space-y-2.5">
                              <div className="flex justify-between items-center gap-2">
                                <div>
                                  <span className="font-extrabold text-indigo-950 font-sans text-xs">{pay.payroll_month} cycle</span>
                                  <p className="text-[10px] text-slate-400 font-bold font-mono">Days: {pay.present_days}/{pay.working_days} | OT: {pay.overtime_hours}h</p>
                                </div>
                                <div className="text-right">
                                  <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-bold">Net Payout</span>
                                  <span className="font-black text-sm font-mono text-indigo-900">₹{pay.net_salary}</span>
                                </div>
                              </div>

                              <div className="bg-slate-50 border border-slate-100 p-2 rounded text-[10px] font-mono grid grid-cols-2 gap-1 text-slate-500">
                                <div>Gross: <strong className="text-slate-800 font-bold">₹{pay.gross_salary}</strong></div>
                                <div className="text-rose-600 font-bold">PF: -₹{pf}</div>
                                <div className="text-rose-650 font-bold">TDS: -₹{tds}</div>
                                <div className="text-rose-650 font-bold">Misc: -₹{esi+misc}</div>
                              </div>

                              <div className="flex items-center justify-between gap-2 pt-0.5">
                                <span className={`px-2 py-0.5 text-[9px] font-black rounded-lg border uppercase tracking-wider ${
                                  pay.payment_status === 'Paid' ? 'bg-emerald-50 border-emerald-250 text-emerald-700' :
                                  'bg-rose-50 border-rose-250 text-rose-700 animate-pulse'
                                }`}>
                                  {pay.payment_status}
                                </span>

                                {pay.payment_status === 'Pending' ? (
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => {
                                        onUpdatePayrollState(pay.id, {
                                          payment_status: 'Paid',
                                          payment_date: '2026-06-21'
                                        });
                                        alert('Salary payout disbursed successfully. Corporate ledger HDFC bank record updated.');
                                      }}
                                      className="px-2.5 py-1 bg-emerald-650 hover:bg-emerald-750 text-white rounded text-[10px] font-black uppercase tracking-wider cursor-pointer"
                                    >
                                      Disburse
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (confirm('Delete processed voucher draft?')) {
                                          onDeletePayroll(pay.id);
                                        }
                                      }}
                                      className="p-1 bg-white text-slate-400 border border-slate-150 hover:text-red-700 hover:bg-slate-50 rounded cursor-pointer"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-gray-400 font-mono font-bold">Paid on {pay.payment_date}</span>
                                )}
                              </div>
                            </div>
                          );
                        })
                    ) : (
                      <p className="text-xs text-slate-400 italic text-center py-4">No payroll slips registered.</p>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
          </div>
        </div>
      ) : showAddForm ? (
        /* Create Employee Form Workspace */
        <div className="lg:col-span-12 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6" id="add-employee-form">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowAddForm(false)}
              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add HVAC Employee Profile</h2>
              <p className="text-xs text-gray-500">Register employee record alongside custom skills and vehicle profiles</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* First Name */}
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-500 uppercase tracking-wider">First Name *</label>
                <input 
                  type="text" 
                  required
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="e.g. Priyesh" 
                  className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-hidden"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-500 uppercase tracking-wider">Last Name *</label>
                <input 
                  type="text" 
                  required
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="e.g. Patel" 
                  className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-hidden"
                />
              </div>

              {/* Aadhaar */}
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-500 uppercase tracking-wider">Aadhaar Number (12 digits)</label>
                <input 
                  type="text" 
                  maxLength={12}
                  value={aadharNumber}
                  onChange={e => setAadharNumber(e.target.value.replace(/\D/g,''))}
                  placeholder="e.g. 111122223333" 
                  className="w-full text-sm p-3 border border-gray-200 rounded-xl font-mono focus:ring-1 focus:ring-indigo-500 outline-hidden"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-500 uppercase tracking-wider">Email Address *</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. user@domain.com" 
                  className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-hidden"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-500 uppercase tracking-wider">Contact Phone</label>
                <input 
                  type="text" 
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210" 
                  className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-hidden"
                />
              </div>

              {/* Date of hire */}
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-500 uppercase tracking-wider">Hire Date</label>
                <input 
                  type="date" 
                  value={hireDate}
                  onChange={e => setHireDate(e.target.value)}
                  className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-hidden"
                />
              </div>
            </div>

            {/* Department and Manager links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-3 border-t border-gray-100">
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-500 uppercase tracking-wider">Job Title Level</label>
                <select 
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value as Employee['job_title'])}
                  className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-hidden bg-white"
                >
                  <option value="TECHNICIAN">Technician</option>
                  <option value="SENIOR_TECHNICIAN">Senior Technician</option>
                  <option value="SUPERVISOR">Supervisor</option>
                  <option value="MANAGER">Manager</option>
                  <option value="CEO">CEO</option>
                  <option value="DISPATCHER">Dispatcher</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-gray-500 uppercase tracking-wider">Department Allocation</label>
                <select 
                  value={deptId}
                  onChange={e => setDeptId(e.target.value)}
                  className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-hidden bg-white"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-gray-500 uppercase tracking-wider">Reporting Manager</label>
                <select 
                  value={managerId}
                  onChange={e => setManagerId(e.target.value)}
                  className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-hidden bg-white"
                >
                  <option value="">-- No Direct Line Manager --</option>
                  {employees.filter(emp => emp.job_title !== 'TECHNICIAN').map(mgr => (
                    <option key={mgr.id} value={mgr.id}>{mgr.name} ({mgr.job_title})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Wages & Zone */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-3 border-t border-gray-100">
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-500 uppercase tracking-wider">Daily Base Wage (₹)</label>
                <input 
                  type="number" 
                  value={dailyWage}
                  onChange={e => setDailyWage(Number(e.target.value))}
                  className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-gray-500 uppercase tracking-wider">Daily Shift Incentive (₹)</label>
                <input 
                  type="number" 
                  value={dailyIncentive}
                  onChange={e => setDailyIncentive(Number(e.target.value))}
                  className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-gray-500 uppercase tracking-wider">Assigned Service Zone</label>
                <input 
                  type="text" 
                  value={serviceArea}
                  onChange={e => setServiceArea(e.target.value)}
                  placeholder="e.g. North Zone, South Zone" 
                  className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-hidden"
                />
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="p-4 bg-indigo-50/30 rounded-xl border border-indigo-100/50 space-y-3">
              <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-1.5">
                <Truck className="w-5 h-5 text-indigo-600" />
                Company vehicle deployment (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">Plate Number</label>
                  <input 
                    type="text"
                    value={plateNumber}
                    onChange={e => setPlateNumber(e.target.value)}
                    placeholder="e.g. KA-01-HV-1111"
                    className="w-full p-2 border border-blue-200 rounded focus:ring-1 bg-white text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">Vehicle Make</label>
                  <input 
                    type="text"
                    value={vehicleMake}
                    onChange={e => setVehicleMake(e.target.value)}
                    placeholder="e.g. Tata, Mahindra"
                    className="w-full p-2 border border-blue-200 rounded focus:ring-1 bg-white text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">Model Name</label>
                  <input 
                    type="text"
                    value={vehicleModel}
                    onChange={e => setVehicleModel(e.target.value)}
                    placeholder="e.g. Ace, Bolero"
                    className="w-full p-2 border border-blue-200 rounded focus:ring-1 bg-white text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">Year</label>
                  <input 
                    type="number"
                    value={vehicleYear || ''}
                    onChange={e => setVehicleYear(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="2024"
                    className="w-full p-2 border border-blue-200 rounded focus:ring-1 bg-white text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Skills allocation */}
            <div className="p-5 border border-amber-100 bg-amber-50/20 rounded-xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-amber-950 text-sm flex items-center gap-1.5">
                  <Award className="w-5 h-5 text-amber-600" />
                  Skill Credentials Registry (Multiple allowed)
                </h3>
                <button 
                  type="button"
                  onClick={handleAddSkillRow}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Skill
                </button>
              </div>

              <div className="space-y-3">
                {tempSkills.map((sk, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. HVAC Safety, Pipe Welding"
                      value={sk.skill_name}
                      onChange={e => handleSkillChange(idx, 'skill_name', e.target.value)}
                      className="flex-1 p-2.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                    <select 
                      value={sk.skill_level}
                      onChange={e => handleSkillChange(idx, 'skill_level', e.target.value)}
                      className="p-2.5 bg-white border border-gray-200 rounded-lg text-xs"
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                      <option value="EXPERT">Expert</option>
                    </select>
                    {tempSkills.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => handleRemoveSkillRow(idx)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-750 hover:bg-gray-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                Save Employee & Skills
              </button>
            </div>
          </form>
        </div>
      ) : activeTab === 'attendance' ? (
        /* Render Company-wide Attendance Register */
        <div className="lg:col-span-12 space-y-6 animate-fadeIn" id="global-attendance-view">
          {/* Header section */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Corporate Attendance Register</h2>
              <p className="text-xs text-slate-500">Track punch-in compliance, hours worked, and biometric locations for active teams</p>
            </div>
            <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-3.5 py-1.5 rounded-full font-black">
              Date Workspace: 2026-06-21
            </span>
          </div>

          {/* Attendance company stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4.5 rounded-2xl border border-gray-150 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Checked-in Today</span>
                <span className="font-extrabold text-slate-800 text-base">
                  {attendance.filter(a => a.date === '2026-06-21' && a.attendance_status === 'Present').length} Active
                </span>
              </div>
            </div>

            <div className="bg-white p-4.5 rounded-2xl border border-gray-150 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Late Punches Today</span>
                <span className="font-extrabold text-slate-800 text-base">
                  {attendance.filter(a => a.date === '2026-06-21' && a.remarks.toLowerCase().includes('late')).length} Entries
                </span>
              </div>
            </div>

            <div className="bg-white p-4.5 rounded-2xl border border-gray-150 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Average Shift Hours</span>
                <span className="font-extrabold text-slate-800 text-base">8.4 Hours</span>
              </div>
            </div>

            <div className="bg-white p-4.5 rounded-2xl border border-gray-150 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-650 shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Leave / Absences Today</span>
                <span className="font-extrabold text-slate-800 text-base">
                  {attendance.filter(a => a.date === '2026-06-21' && (a.attendance_status === 'Absent' || a.attendance_status === 'Leave')).length} Count
                </span>
              </div>
            </div>
          </div>

          {/* Attendance Bio override control */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Form card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs space-y-4 h-fit">
              <div>
                <h4 className="font-black text-slate-900 text-sm">Register Single Attendance Override</h4>
                <p className="text-[11px] text-slate-400">Direct register terminal punch-in/out for field site technicians.</p>
              </div>

              <div className="space-y-3.5 text-xs text-slate-700">
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">Pick Employee *</label>
                  <select 
                    value={globalEmployeeId}
                    onChange={e => setGlobalEmployeeId(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl bg-white focus:outline-indigo-500"
                  >
                    <option value="">-- Choose Employee Recipient --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.employee_code} - {emp.name} ({emp.title})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">Punch Date</label>
                    <input 
                      type="date"
                      value={attManualDate}
                      onChange={e => setAttManualDate(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">Status</label>
                    <select 
                      value={attManualStatus}
                      onChange={e => setAttManualStatus(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl bg-white"
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Half Day">Half Day</option>
                      <option value="Leave">Leave</option>
                      <option value="Holiday">Holiday</option>
                      <option value="Week Off">Week Off</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">Check-In Time</label>
                    <input 
                      type="text"
                      placeholder="09:00"
                      value={attManualCheckIn}
                      onChange={e => setAttManualCheckIn(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl bg-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">Check-Out Time</label>
                    <input 
                      type="text"
                      placeholder="18:00"
                      value={attManualCheckOut}
                      onChange={e => setAttManualCheckOut(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-500">Site Premise Premises</label>
                  <input 
                    type="text"
                    placeholder="Tech Park Site"
                    value={attManualLocation}
                    onChange={e => setAttManualLocation(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-500">Remarks / Log Audit Note</label>
                  <input 
                    type="text"
                    placeholder="Manual punch-in requested by team lead coverage..."
                    value={attManualRemarks}
                    onChange={e => setAttManualRemarks(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl bg-white"
                  />
                </div>

                <button
                  onClick={() => {
                    if (!globalEmployeeId) {
                      alert('Error: Please select an employee from the roster registry first.');
                      return;
                    }
                    const empObj = employees.find(e => e.id === globalEmployeeId);
                    if (!empObj) return;

                    const overlap = checkTimeOverlaps(
                      attendance,
                      globalEmployeeId,
                      attManualDate,
                      attManualCheckIn,
                      attManualCheckOut
                    );
                    if (overlap.isOverlapping) {
                      alert(overlap.errorMsg);
                      return;
                    }

                    const calced = calculateTotalAndOvertime(attManualCheckIn, attManualCheckOut);
                    const log: Attendance = {
                      id: `ATT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                      employee_id: globalEmployeeId,
                      date: attManualDate,
                      check_in_time: attManualCheckIn,
                      check_out_time: attManualCheckOut,
                      total_hours: calced.total,
                      overtime_hours: calced.overtime,
                      attendance_status: attManualStatus as any,
                      location: attManualLocation || 'Office Corporate HQ',
                      remarks: attManualRemarks || 'Bio override override'
                    };

                    onAddAttendance(log);
                    alert(`Successfully recorded manual override attendance log for ${empObj.name}!`);
                    setAttManualRemarks('');
                  }}
                  className="w-full py-2.5 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs transition-colors shadow-xs cursor-pointer"
                >
                  Submit Attendance Override
                </button>
              </div>
            </div>

            {/* Table ledger column view */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-150 shadow-xs p-6 space-y-4">
              <div>
                <h4 className="font-black text-slate-900 text-sm">Company Attendance Log History</h4>
                <p className="text-xs text-slate-400">Complete corporate history of checked field biometric signals and manual override punches.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-[10px] font-black uppercase text-gray-400">
                      <th className="p-3">Employee</th>
                      <th className="p-3">Date Workspace</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3">Punch Span</th>
                      <th className="p-3">Premises</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-[11px] text-slate-600">
                    {attendance.length > 0 ? (
                      [...attendance].reverse().map(log => {
                        const logEmp = employees.find(e => e.id === log.employee_id);
                        return (
                          <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-3">
                              <div className="font-bold text-slate-800">{logEmp?.name || 'Deleted Employee'}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{logEmp?.employee_code || log.employee_id}</div>
                            </td>
                            <td className="p-3 font-mono text-slate-700 font-semibold">{log.date}</td>
                            <td className="p-3 text-center">
                              <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-lg border ${
                                log.attendance_status === 'Present' ? 'bg-emerald-50 border-emerald-250 text-emerald-700' :
                                log.attendance_status === 'Half Day' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                log.attendance_status === 'Leave' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                'bg-rose-50 border-rose-250 text-rose-700'
                              }`}>
                                {log.attendance_status}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-slate-500">
                              {log.check_in_time || '--'} to {log.check_out_time || '--'}
                            </td>
                            <td className="p-3 text-slate-500 truncate max-w-[150px]">{log.location}</td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => {
                                  if (confirm('Delete this attendance entry from registry?')) {
                                    onDeleteAttendance(log.id);
                                  }
                                }}
                                className="text-red-500 hover:text-red-750 p-1 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                                title="Delete check-in ticket"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-xs italic text-slate-400 bg-slate-50 rounded-xl">
                          No biometric punches or attendance overrides registered.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'leaves' ? (
        /* Render Company-wide Leave Control Dashboard */
        <div className="lg:col-span-12 space-y-6 animate-fadeIn" id="global-leaves-view">
          {/* Header section */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Corporate Leave Control Terminal</h2>
              <p className="text-xs text-slate-500">Audit annual vacation requests, medical absences, and live leave ledger pools.</p>
            </div>
            <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-3.5 py-1.5 rounded-full font-black">
              Company Leaves Vault
            </span>
          </div>

          {/* Leave company stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4.5 rounded-2xl border border-gray-150 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <AlertCircle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pending Supervisor Audits</span>
                <span className="font-extrabold text-slate-800 text-base">
                  {leaveRequests.filter(l => l.approval_status === 'Pending').length} Applications
                </span>
              </div>
            </div>

            <div className="bg-white p-4.5 rounded-2xl border border-gray-150 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Approved Leaves Total</span>
                <span className="font-extrabold text-slate-800 text-base">
                  {leaveRequests.filter(l => l.approval_status === 'Approved').length} Requests
                </span>
              </div>
            </div>

            <div className="bg-white p-4.5 rounded-2xl border border-gray-150 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-650 shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Rejected Applications</span>
                <span className="font-extrabold text-slate-800 text-base">
                  {leaveRequests.filter(l => l.approval_status === 'Rejected').length} Requests
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Form card: Request Leave */}
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs space-y-4 h-fit">
              <div>
                <h4 className="font-black text-slate-900 text-sm">Issue New Custom Leave Application</h4>
                <p className="text-[11px] text-slate-400">Logs leave direct voucher on behalf of a technician or back-office agent.</p>
              </div>

              <div className="space-y-3.5 text-xs text-slate-700">
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">Pick Employee Registry *</label>
                  <select 
                    value={globalEmployeeId}
                    onChange={e => setGlobalEmployeeId(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl bg-white focus:outline-indigo-500"
                  >
                    <option value="">-- Choose Employee-Recipient --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.employee_code} - {emp.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-500">Leave Category</label>
                  <select 
                    value={lrType}
                    onChange={e => setLrType(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl bg-white focus:outline-indigo-500"
                  >
                    <option value="Casual Leave">Casual Vacation Leave</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Earned Leave">Earned Leaves</option>
                    <option value="Annual Leave">Annual Leave</option>
                    <option value="Unpaid Leave">Unpaid Leaves LOP</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">Commencement Date</label>
                    <input 
                      type="date"
                      value={lrStartDate}
                      onChange={e => setLrStartDate(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">Termination Date</label>
                    <input 
                      type="date"
                      value={lrEndDate}
                      onChange={e => setLrEndDate(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-500">Audit Justification Reason</label>
                  <textarea 
                    rows={2}
                    placeholder="Enter details of leave coverage justification..."
                    value={lrReason}
                    onChange={e => setLrReason(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl bg-white resize-none text-xs"
                  />
                </div>

                <button
                  onClick={() => {
                    if (!globalEmployeeId) {
                      alert('Error: Please select an employee from the roster registry first.');
                      return;
                    }
                    const empObj = employees.find(e => e.id === globalEmployeeId);
                    if (!empObj) return;

                    const diffTime = Math.abs(new Date(lrEndDate).getTime() - new Date(lrStartDate).getTime());
                    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

                    const req: LeaveRequest = {
                      id: `LRQ-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                      employee_id: globalEmployeeId,
                      leave_type: lrType as any,
                      start_date: lrStartDate,
                      end_date: lrEndDate,
                      number_of_days: days,
                      reason: lrReason || 'Unspecified reasons',
                      applied_date: '2026-06-21',
                      approval_status: 'Pending'
                    };

                    onAddLeaveRequest(req);
                    alert(`Successfully requested ${days} days leave for ${empObj.name}!`);
                    setLrReason('');
                  }}
                  className="w-full py-2.5 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs transition-colors shadow-xs cursor-pointer"
                >
                  Submit Leave Request
                </button>
              </div>
            </div>

            {/* Leave Applications Table */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* 1. Request List and Action Audit Desk */}
              <div className="bg-white rounded-2xl border border-gray-150 shadow-xs p-6 space-y-4">
                <div>
                  <h4 className="font-black text-slate-900 text-sm">Enterprise Leave Applications Audit Desk</h4>
                  <p className="text-xs text-slate-400">Review pending vacation slips and process immediate action approvals.</p>
                </div>

                <div className="space-y-4">
                  {leaveRequests.length > 0 ? (
                    [...leaveRequests].reverse().map(req => {
                      const reqEmp = employees.find(e => e.id === req.employee_id);
                      return (
                        <div key={req.id} className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-3 text-xs">
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                                {reqEmp?.name || 'Deleted Employee'}
                                <span className="text-[10px] font-mono text-gray-400">({reqEmp?.employee_code || 'N/A'})</span>
                              </span>
                              <div className="text-[10px] text-indigo-700 font-extrabold uppercase bg-indigo-50 border border-indigo-100 rounded-md px-2 py-0.5 inline-block">{req.leave_type}</div>
                            </div>
                            <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg border ${
                              req.approval_status === 'Approved' ? 'bg-emerald-50 border-emerald-250 text-emerald-700' :
                              req.approval_status === 'Rejected' ? 'bg-rose-50 border-rose-250 text-rose-700' :
                              'bg-amber-50 border-amber-250 text-amber-700 animate-pulse'
                            }`}>
                              {req.approval_status}
                            </span>
                          </div>

                          <div className="space-y-1 text-slate-650">
                            <div className="text-[11px]">
                              <strong className="text-slate-800">Dates:</strong> {req.start_date} to {req.end_date} 
                              <span className="text-slate-400 ml-1">({req.number_of_days} Days)</span>
                            </div>
                            <div className="text-[11px] italic bg-white p-2 rounded-xl border border-gray-100">
                              "{req.reason}"
                            </div>
                            {req.remarks && (
                              <div className="text-[10px] text-gray-500 block pt-1 bg-indigo-50/20 p-2 rounded-xl border border-dotted border-indigo-100">
                                <strong>Remarks:</strong> {req.remarks} (Auditor: {req.approved_by || 'ADMIN'})
                              </div>
                            )}
                          </div>

                          {/* Supervisor action button desk */}
                          {req.approval_status === 'Pending' && (
                            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                              <span className="text-[10px] font-bold text-indigo-900">Direct Supervisor Decision Panel:</span>
                              <input 
                                type="text" 
                                id={`remarks-global-${req.id}`} 
                                placeholder="Type audit assessment comment here..." 
                                className="w-full p-2 text-xs bg-slate-50 border border-slate-205 rounded-lg focus:outline-indigo-500"
                              />
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => {
                                    const remEl = document.getElementById(`remarks-global-${req.id}`) as HTMLInputElement;
                                    onUpdateLeaveRequest(req.id, {
                                      approval_status: 'Approved',
                                      approved_by: 'MGR_ADMIN',
                                      approval_date: '2026-06-21',
                                      remarks: remEl?.value || 'Coverage matched today.'
                                    });
                                  }}
                                  className="p-1.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    const remEl = document.getElementById(`remarks-global-${req.id}`) as HTMLInputElement;
                                    onUpdateLeaveRequest(req.id, {
                                      approval_status: 'Rejected',
                                      approved_by: 'MGR_ADMIN',
                                      approval_date: '2026-06-21',
                                      remarks: remEl?.value || 'Critical facility support assignments conflict.'
                                    });
                                  }}
                                  className="p-1.5 px-3.5 bg-red-650 hover:bg-red-700 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Delete entry */}
                          <div className="flex justify-between items-center text-[10px] text-gray-400">
                            <span>Applied: {req.applied_date}</span>
                            <button
                              onClick={() => {
                                      if (confirm('Delete this leave application slip?')) {
                                        onDeleteLeaveRequest(req.id);
                                      }
                              }}
                              className="text-red-500 hover:text-red-750 flex items-center gap-1 font-bold cursor-pointer"
                            >
                              Delete slipped log
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-xs italic text-slate-400 bg-slate-50 rounded-xl border border-dashed text-center">
                      No corporate leave applications logs registered.
                    </div>
                  )}
                </div>
              </div>

              {/* Leave Balance Directory list for all employees */}
              <div className="bg-white rounded-2xl border border-gray-150 shadow-xs p-6 space-y-4">
                <div>
                  <h4 className="font-black text-slate-900 text-sm">Corporate Team Leave Balances</h4>
                  <p className="text-xs text-slate-400">Review remaining casual vacation and medical leave pools without opening profiles.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="border-b border-gray-100 text-[10px] font-black uppercase text-gray-400">
                        <th className="p-2.5">Employee</th>
                        <th className="p-2.5 text-center">Casual</th>
                        <th className="p-2.5 text-center">Sick</th>
                        <th className="p-2.5 text-center">Earned</th>
                        <th className="p-2.5 text-center">Total Balance</th>
                        <th className="p-2.5 text-right">Adjust Pool</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-slate-655">
                      {employees.map(emp => {
                        const bal = leaveBalances.find(b => b.employee_id === emp.id) || { id: '', employee_id: emp.id, year: 2026, casual_leave_balance: 12, sick_leave_balance: 8, earned_leave_balance: 15, total_leave_balance: 35 };
                        return (
                          <tr key={emp.id} className="hover:bg-slate-50/50">
                            <td className="p-2.5 font-bold text-slate-800">{emp.name}</td>
                            <td className="p-2.5 text-center font-mono text-slate-700">{bal.casual_leave_balance}</td>
                            <td className="p-2.5 text-center font-mono text-slate-700">{bal.sick_leave_balance}</td>
                            <td className="p-2.5 text-center font-mono text-slate-700">{bal.earned_leave_balance}</td>
                            <td className="p-2.5 text-center font-mono font-black text-indigo-700 bg-indigo-50/50">{bal.casual_leave_balance + bal.sick_leave_balance + bal.earned_leave_balance} Days</td>
                            <td className="p-2.5 text-right">
                              <button
                                onClick={() => {
                                  const c = prompt(`Modify Casual Leave balance for ${emp.name} (Current: ${bal.casual_leave_balance}):`, String(bal.casual_leave_balance));
                                  const s = prompt(`Modify Sick Leave balance for ${emp.name} (Current: ${bal.sick_leave_balance}):`, String(bal.sick_leave_balance));
                                  const e = prompt(`Modify Earned Leave balance for ${emp.name} (Current: ${bal.earned_leave_balance}):`, String(bal.earned_leave_balance));
                                  if (c !== null && s !== null && e !== null) {
                                    const updatedBal: LeaveBalance = {
                                      id: bal.id || `LB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                                      employee_id: emp.id,
                                      year: 2026,
                                      casual_leave_balance: Number(c),
                                      sick_leave_balance: Number(s),
                                      earned_leave_balance: Number(e),
                                      total_leave_balance: Number(c) + Number(s) + Number(e)
                                    };
                                    onUpdateLeaveBalance(updatedBal);
                                    alert(`Success: Standard pools adjusted successfully for ${emp.name}.`);
                                  }
                                }}
                                className="text-[10px] text-indigo-650 hover:text-indigo-850 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded font-bold cursor-pointer"
                              >
                                Modify
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>
        </div>
      ) : activeTab === 'payroll' ? (
        /* Render Company-wide Payroll & Compensation Hub */
        <div className="lg:col-span-12 space-y-6 animate-fadeIn" id="global-payroll-view">
          {/* Header section */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Enterprise Compensation & Payroll Control</h2>
              <p className="text-xs text-slate-500">Generate team payroll disbursement vouchers and authorize direct corporate bank releases.</p>
            </div>
            <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-3.5 py-1.5 rounded-full font-black">
              Wages & Payout Ledger
            </span>
          </div>

          {/* Payroll stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4.5 rounded-2xl border border-gray-150 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Completed Payouts Today</span>
                <span className="font-extrabold text-slate-800 text-base">
                  ₹{payrolls.filter(p => p.payment_status === 'Paid').reduce((sum, p) => sum + p.net_salary, 0).toLocaleString()} <span className="text-xs text-slate-400 font-medium">({payrolls.filter(p => p.payment_status === 'Paid').length} Vouchers)</span>
                </span>
              </div>
            </div>

            <div className="bg-white p-4.5 rounded-2xl border border-gray-150 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pending Bank Clearance</span>
                <span className="font-extrabold text-slate-800 text-base">
                  ₹{payrolls.filter(p => p.payment_status === 'Pending').reduce((sum, p) => sum + p.net_salary, 0).toLocaleString()} <span className="text-xs text-slate-400 font-medium font-bold">({payrolls.filter(p => p.payment_status === 'Pending').length} Vouchers)</span>
                </span>
              </div>
            </div>

            <div className="bg-white p-4.5 rounded-2xl border border-gray-150 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650 shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Monthly Committal</span>
                <span className="font-extrabold text-slate-800 text-base">
                  ₹{employees.reduce((sum, e) => sum + (e.daily_wage || 0) * 30, 0).toLocaleString()} Total Estim.
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Form card: Generate Employee Payroll */}
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs space-y-4 h-fit">
              <div>
                <h4 className="font-black text-slate-900 text-sm">Interactive Bulk Payroll Dispatcher</h4>
                <p className="text-[11px] text-slate-400">Calculate days worked to generate instant salary disbursement ledger vouchers.</p>
              </div>

              <div className="space-y-3.5 text-xs text-slate-700">
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">Pick Target Employee *</label>
                  <select 
                    value={globalEmployeeId}
                    onChange={e => {
                      setGlobalEmployeeId(e.target.value);
                    }}
                    className="w-full p-2.5 border border-gray-200 rounded-xl bg-white focus:outline-indigo-500"
                  >
                    <option value="">-- Choose Employee-Recipient --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.employee_code} - {emp.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">Salary Month Cycle</label>
                    <input 
                      type="text"
                      value={pyMonth}
                      onChange={e => setPyMonth(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl bg-white font-semibold text-slate-800"
                      placeholder="June 2026"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">Working Days Cycle</label>
                    <input 
                      type="number"
                      value={pyWorkingDays}
                      onChange={e => setPyWorkingDays(Number(e.target.value))}
                      className="w-full p-2.5 border border-gray-200 rounded-xl bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">Present (Punches) Days</label>
                    <input 
                      type="number"
                      value={pyPresentDays}
                      onChange={e => setPyPresentDays(Number(e.target.value))}
                      className="w-full p-2.5 border border-gray-200 rounded-xl bg-white font-bold text-emerald-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">Absence days (Unpaid)</label>
                    <input 
                      type="number"
                      value={pyLeaveDays}
                      onChange={e => setPyLeaveDays(Number(e.target.value))}
                      className="w-full p-2.5 border border-gray-200 rounded-xl bg-white text-red-650"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">Incentive Overtime Hours</label>
                    <input 
                      type="number"
                      value={pyOvertimeHours}
                      onChange={e => setPyOvertimeHours(Number(e.target.value))}
                      className="w-full p-2.5 border border-gray-200 rounded-xl bg-white font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">Other Tax/Loss Deductions</label>
                    <input 
                      type="number"
                      value={pyDeductions}
                      onChange={e => setPyDeductions(Number(e.target.value))}
                      className="w-full p-2.5 border border-gray-200 rounded-xl bg-white font-bold text-red-700"
                    />
                  </div>
                </div>

                {/* Calculations Review banner */}
                {globalEmployeeId && (
                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-[11px] text-indigo-950 space-y-1 font-mono">
                    <div className="font-extrabold text-indigo-900 border-b border-indigo-150 pb-1 mb-1 font-sans">Voucher Estimate Engine:</div>
                    {(() => {
                      const sel = employees.find(e => e.id === globalEmployeeId);
                      if (!sel) return <div>No employee matching found</div>;
                      const baseWage = sel.daily_wage || 1200;
                      const overtimeRate = 150; // default overtime incentives
                      const grossEarned = (baseWage * pyPresentDays) + (pyOvertimeHours * overtimeRate);
                      const netPay = grossEarned - pyDeductions;
                      return (
                        <>
                          <div className="flex justify-between"><span>Base Daily Salary:</span> <strong>₹{baseWage}</strong></div>
                          <div className="flex justify-between"><span>Worked Days Gross:</span> <strong>₹{baseWage * pyPresentDays}</strong></div>
                          <div className="flex justify-between"><span>Overtime @ ₹150:</span> <strong>+₹{pyOvertimeHours * overtimeRate}</strong></div>
                          <div className="flex justify-between"><span>Deductions Loss:</span> <strong className="text-red-500">-₹{pyDeductions}</strong></div>
                          <div className="flex justify-between border-t border-indigo-150 pt-1 mt-1 font-bold text-indigo-700 font-sans text-xs"><span>Net Voucher Payout:</span> <span>₹{netPay}</span></div>
                        </>
                      );
                    })()}
                  </div>
                )}

                <button
                  onClick={() => {
                    if (!globalEmployeeId) {
                      alert('Error: Please select an employee from the roster registry first.');
                      return;
                    }
                    const empObj = employees.find(e => e.id === globalEmployeeId);
                    if (!empObj) return;

                    const baseWage = empObj.daily_wage || 1200;
                    const overtimeRate = 150;
                    const grossEarned = (baseWage * pyPresentDays) + (pyOvertimeHours * overtimeRate);
                    const net = grossEarned - pyDeductions;

                    const voucher: Payroll = {
                      id: `PAY-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                      employee_id: globalEmployeeId,
                      payroll_month: pyMonth || 'June 2026',
                      working_days: pyWorkingDays,
                      present_days: pyPresentDays,
                      leave_days: pyLeaveDays,
                      overtime_hours: pyOvertimeHours,
                      gross_salary: grossEarned,
                      pf_deduction: Math.round(grossEarned * 0.12),
                      esi_deduction: Math.round(grossEarned * 0.0175),
                      tds_deduction: 0,
                      other_deductions: Number(pyDeductions),
                      net_salary: net,
                      payment_date: '',
                      payment_status: 'Pending'
                    };

                    onAddPayroll(voucher);
                    alert(`Successfully generated salary voucher of ₹${net.toLocaleString()} today for ${empObj.name}! Marked as Pending for bank disbursement.`);
                    setPyDeductions(0);
                  }}
                  className="w-full py-2.5 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs transition-colors shadow-xs cursor-pointer"
                >
                  Generate & Authorize Voucher
                </button>
              </div>
            </div>

            {/* Company Payroll Slips Ledger and Custom Wage Structures */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* 1. Payroll Slips table */}
              <div className="bg-white rounded-2xl border border-gray-150 shadow-xs p-6 space-y-4">
                <div>
                  <h4 className="font-black text-slate-900 text-sm">Disbursement Slips & Bank Vouchers Journal</h4>
                  <p className="text-xs text-slate-400">Complete listing of issued pay structures. Authorize direct bank clearance through corporate pipelines.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="border-b border-gray-100 text-[10px] font-black uppercase text-gray-400">
                        <th className="p-2.5">Voucher / Employee</th>
                        <th className="p-2.5">Cycle Month</th>
                        <th className="p-2.5 text-center">Duty Metrics</th>
                        <th className="p-2.5">Net Payout</th>
                        <th className="p-4 text-center">Disbursal Status</th>
                        <th className="p-2.5 text-right">Clearance Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-slate-650">
                      {payrolls.length > 0 ? (
                        [...payrolls].reverse().map(pay => {
                          const pEmp = employees.find(e => e.id === pay.employee_id);
                          return (
                            <tr key={pay.id} className="hover:bg-slate-50/50">
                              <td className="p-2.5">
                                <div className="font-bold text-slate-800">{pEmp?.name || 'Deleted Employee'}</div>
                                <div className="text-[10px] text-gray-400 font-mono">{pay.id}</div>
                              </td>
                              <td className="p-2.5 font-semibold text-slate-700">{pay.payroll_month}</td>
                              <td className="p-2.5 text-center text-slate-500">
                                <div>Worked: <strong className="text-slate-700 font-mono">{pay.present_days} / {pay.working_days}</strong> Days</div>
                                <div>OT hrs: <strong className="text-slate-700 font-mono">{pay.overtime_hours}</strong></div>
                              </td>
                              <td className="p-2.5 font-bold font-mono text-slate-800">₹{pay.net_salary.toLocaleString()}</td>
                              <td className="p-4 text-center">
                                <span className={`inline-block px-2.5 py-0.5 text-[9.5px] font-black rounded-lg border uppercase tracking-wider ${
                                  pay.payment_status === 'Paid' ? 'bg-emerald-50 border-emerald-250 text-emerald-700' :
                                  'bg-rose-50 border-rose-250 text-rose-700 animate-pulse'
                                }`}>
                                  {pay.payment_status}
                                </span>
                                {pay.payment_date && (
                                  <div className="text-[9px] text-gray-400 font-mono block pt-0.5">Cleared: {pay.payment_date}</div>
                                )}
                              </td>
                              <td className="p-2.5 text-right">
                                <div className="flex items-center gap-2.5 justify-end">
                                  {pay.payment_status === 'Pending' && (
                                    <button
                                      onClick={() => {
                                        onUpdatePayrollState(pay.id, {
                                          payment_status: 'Paid',
                                          payment_date: '2026-06-21'
                                        });
                                        alert(`Cleared pay slip ${pay.id}! Direct clearance dispatched successfully through the HDFC bank server node.`);
                                      }}
                                      className="text-[10px] text-white hover:bg-emerald-700 bg-emerald-600 px-2 py-1 rounded font-extrabold uppercase shadow-sm cursor-pointer"
                                      title="Clear transfer voucher"
                                    >
                                      Disburse Money
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      if (confirm('Delete and reject salary voucher ledger line?')) {
                                        onDeletePayroll(pay.id);
                                      }
                                    }}
                                    className="text-red-500 hover:text-red-750 p-1 bg-red-50 rounded"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-xs italic text-slate-400 bg-slate-50 rounded-xl border border-dashed">
                            No salary vouchers or payroll ledger lines generated.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 2. Salary Structures list */}
              <div className="bg-white rounded-2xl border border-gray-150 shadow-xs p-6 space-y-4">
                <div>
                  <h4 className="font-black text-slate-900 text-sm">Monthly Compensation Structures</h4>
                  <p className="text-xs text-slate-400">Manage base monthly packages, allowances & basic CTC configurations directly.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="border-b border-gray-100 text-[10px] font-black uppercase text-gray-400">
                        <th className="p-2.5">Employee</th>
                        <th className="p-2.5 font-bold">Base Daily Wage</th>
                        <th className="p-2.5">Indirect Allowances</th>
                        <th className="p-2.5">Aggregated Monthly Salary Base</th>
                        <th className="p-2.5 text-right">Modify</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-slate-655">
                      {employees.map(emp => {
                        const struct = salaryStructures.find(s => s.employee_id === emp.id) || { id: '', employee_id: emp.id, effective_date: '2026-06-01', basic_salary: 30000, hra: 12000, conveyance_allowance: 3000, medical_allowance: 2000, site_allowance: 5000, travel_allowance: 4000, other_allowance: 1000, gross_salary: 57000 };
                        const totalAllow = (struct.hra || 0) + (struct.conveyance_allowance || 0) + (struct.medical_allowance || 0) + (struct.site_allowance || 0) + (struct.travel_allowance || 0) + (struct.other_allowance || 0);
                        return (
                          <tr key={emp.id} className="hover:bg-slate-50/50">
                            <td className="p-2.5 font-bold text-slate-800">{emp.name}</td>
                            <td className="p-2.5 font-mono text-slate-700">₹{(emp.daily_wage || 1200)} / day</td>
                            <td className="p-2.5 font-mono text-slate-500">₹{totalAllow.toLocaleString()}</td>
                            <td className="p-2.5 font-mono font-black text-emerald-700 bg-emerald-50/50">₹{((emp.daily_wage || 1200) * 30 + totalAllow).toLocaleString()}</td>
                            <td className="p-2.5 text-right">
                              <button
                                onClick={() => {
                                  const w = prompt(`Configure standard daily wage for ${emp.name} (Current: ₹${emp.daily_wage || 1200}):`, String(emp.daily_wage || 1200));
                                  const bSalary = prompt(`Configure monthly Basic CTC base (Basic salary) for ${emp.name}:`, String(struct.basic_salary));
                                  if (w !== null && bSalary !== null) {
                                    onUpdateEmployee?.(emp.id, {
                                      ...emp,
                                      daily_wage: Number(w)
                                    });
                                    const updatedStr: SalaryStructure = {
                                      id: struct.id || `SS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                                      employee_id: emp.id,
                                      effective_date: '2026-06-01',
                                      basic_salary: Number(bSalary),
                                      hra: struct.hra || 12000,
                                      conveyance_allowance: struct.conveyance_allowance || 3000,
                                      medical_allowance: struct.conveyance_allowance || 2026,
                                      site_allowance: struct.site_allowance || 5000,
                                      travel_allowance: struct.travel_allowance || 4000,
                                      other_allowance: struct.other_allowance || 1000,
                                      gross_salary: Number(bSalary) + totalAllow
                                    };
                                    onUpdateSalaryStructure(updatedStr);
                                    alert(`Success: Standard CTC and wage rates adjusted perfectly for ${emp.name}.`);
                                  }
                                }}
                                className="text-[10px] text-emerald-700 hover:text-emerald-850 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded font-bold cursor-pointer"
                              >
                                Modify Wage
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>
        </div>
      ) : (
        /* Standard listings table dashboard screen */
        <div className="lg:col-span-12 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">HVAC Employee Directory</h2>
              <p className="text-xs text-slate-500">Manage expert technicians, dispatchers, supervisors, and administrative personnel</p>
            </div>
            <button 
              id="show-add-employee-btn"
              onClick={() => {
                setFirstName('');
                setLastName('');
                setAadharNumber('');
                setEmail('');
                setPhone('');
                setAddress('');
                setPlateNumber('');
                setVehicleMake('');
                setVehicleModel('');
                setSkillsText('');
                setCertText('');
                setTempSkills([{ skill_name: '', skill_level: 'INTERMEDIATE' }]);
                setShowAddForm(true);
              }}
              className="flex items-center gap-1.5 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Employee
            </button>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-gray-150 shadow-xs">
            <Search className="w-4 h-4 text-slate-400 ml-1.5" />
            <input 
              type="text" 
              placeholder="Search by name, employee code, service zone, email, or job role..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs outline-hidden text-slate-800 bg-transparent py-1"
            />
          </div>

          {/* Employee profiles rounded-cell table */}
          {filteredEmployees.length > 0 ? (
            <div className="overflow-x-auto -mx-4 sm:mx-0 pb-4" id="employees-table-wrapper">
              <div className="inline-block min-w-full align-middle p-1">
                <table className="min-w-full border-separate" style={{ borderSpacing: '0 10px' }} id="employees-table">
                  <thead>
                    <tr className="text-left text-xs font-black uppercase text-slate-400 tracking-wider">
                      <th className="px-5 pb-1 select-none">Employee Profile</th>
                      <th className="px-5 pb-1 select-none">Contact Details</th>
                      <th className="px-5 pb-1 select-none">Service Area</th>
                      <th className="px-5 pb-1 select-none">Line Manager</th>
                      <th className="px-5 pb-1 text-center select-none">Status / Access</th>
                      <th className="px-5 pb-1 text-right select-none">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map(emp => {
                      const reportingManager = employees.find(e => e.id === emp.manager_id);
                      const initials = `${emp.first_name?.[0] || emp.name?.[0] || '?'}${emp.last_name?.[0] || ''}`;

                      return (
                        <tr 
                          key={emp.id}
                          id={`emp-row-${emp.id}`}
                          onClick={() => onSelectEmployee(emp.id)}
                          className="group cursor-pointer"
                        >
                          {/* Cell 1: Info (Rounded Left) */}
                          <td className="px-5 py-4 bg-white border-y border-l border-slate-100 rounded-l-2xl shadow-2xs group-hover:border-indigo-200 transition-all">
                            <div className="flex items-center gap-3 min-w-[220px]">
                              <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-xs shrink-0 group-hover:scale-105 transition-transform">
                                {initials}
                              </div>
                              <div className="truncate">
                                <span className="text-[9px] font-bold font-mono bg-indigo-55/10 text-indigo-700 px-1.5 py-0.5 rounded leading-none inline-block mb-1">
                                  {emp.employee_code}
                                </span>
                                <h3 className="font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors text-sm truncate leading-tight">{emp.name}</h3>
                                <p className="text-[11px] text-slate-500 font-semibold truncate mt-0.5">{emp.title}</p>
                              </div>
                            </div>
                          </td>

                          {/* Cell 2: Contact Details (No horizontal outer rounding) */}
                          <td className="px-5 py-4 bg-white border-y border-slate-100 shadow-2xs group-hover:border-indigo-200 transition-all">
                            <div className="space-y-1 text-xs min-w-[180px]">
                              <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                {emp.phone || 'No direct phone'}
                              </p>
                              <p className="text-slate-500 truncate flex items-center gap-1.5" title={emp.email}>
                                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                {emp.email}
                              </p>
                            </div>
                          </td>

                          {/* Cell 3: Service Area */}
                          <td className="px-5 py-4 bg-white border-y border-slate-100 shadow-2xs group-hover:border-indigo-200 transition-all">
                            <div className="text-xs min-w-[120px]">
                              <p className="font-extrabold text-slate-800 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                {emp.service_area || 'Central Bengaluru'}
                              </p>
                              <p className="text-[10px] text-slate-400 font-medium pl-5">{emp.city || 'Bengaluru'}</p>
                            </div>
                          </td>

                          {/* Cell 4: Manager Reference */}
                          <td className="px-5 py-4 bg-white border-y border-slate-100 shadow-2xs group-hover:border-indigo-200 transition-all">
                            <div className="text-xs truncate min-w-[130px]">
                              {reportingManager ? (
                                <>
                                  <p className="font-bold text-slate-800 truncate">{reportingManager.name}</p>
                                  <p className="text-[10px] font-mono text-slate-405 leading-none mt-0.5">{reportingManager.title}</p>
                                </>
                              ) : (
                                <p className="text-slate-400 font-medium italic">None (CEO)</p>
                              )}
                            </div>
                          </td>

                          {/* Cell 5: Status Indicators */}
                          <td className="px-5 py-4 bg-white border-y border-slate-100 shadow-2xs group-hover:border-indigo-200 transition-all text-center">
                            <div className="flex flex-col items-center justify-center gap-1 min-w-[90px]">
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                                emp.status === 'ACTIVE' 
                                  ? 'bg-emerald-50 border-emerald-150 text-emerald-700' 
                                  : emp.status === 'ON_JOB' 
                                  ? 'bg-blue-50 border-blue-150 text-blue-700 animate-pulse' 
                                  : 'bg-slate-100 border-slate-205 text-slate-600'
                              }`}>
                                {emp.status}
                              </span>
                              <span className="text-[9px] text-slate-400 font-semibold font-mono uppercase">{emp.availability}</span>
                            </div>
                          </td>

                          {/* Cell 6: Action Button (Rounded Right) */}
                          <td className="px-5 py-4 bg-white border-y border-r border-slate-100 rounded-r-2xl shadow-2xs group-hover:border-indigo-200 transition-all text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectEmployee(emp.id);
                              }}
                              className="inline-flex items-center gap-1 py-1.5 px-3.5 bg-slate-50 hover:bg-indigo-55/10 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-650 transition-all text-xs font-bold rounded-xl cursor-pointer"
                            >
                              Profile <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="col-span-full py-16 text-center text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-gray-200">
              No employee profile registered matches your search criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
