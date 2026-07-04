export interface Department {
  id: string;
  name: string;
  description: string;
}

export interface Client {
  id: string;
  client_name: string;
  client_type: string; // e.g. Corporate, Retail, Government
  industry: string;
  gst_number: string;
  website: string;
  head_office_address: string;
  primary_contact_name: string;
  designation: string;
  mobile: string;
  email: string;
  decision_maker: string;
  accounts_contact: string;
  lead_source: string;
  client_status: 'ACTIVE' | 'INACTIVE' | 'PROSPECT' | 'ON_HOLD';
  notes: string;

  // Backwards compatibility
  client_code?: string;
  company_name?: string;
  address?: string;
  project_name?: string;
  location?: string;
  building_type?: 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL' | 'HOSPITALITY' | 'HEALTHCARE' | 'OTHER';
  approx_area?: string;
  requirement?: 'NEW_INSTALLATION' | 'AMC' | 'REPAIR';
  preferred_hvac_system?: 'SPLIT_AC' | 'VRF' | 'CHILLER' | 'DUCTED' | 'PACKAGE_UNIT' | 'NOT_SURE';
  current_challenges?: string;
  budget_range?: string;
  expected_completion_date?: string; // YYYY-MM-DD
}

export interface ClientContact {
  id: string;
  client_id: string;
  name: string;
  department: string;
  designation: string;
  mobile: string;
  email: string;
  decision_maker: boolean;
  technical_contact: boolean;
  accounts_contact: boolean;
}

export interface Site {
  id: string;
  site_code: string;
  client_id?: string;
  client_name?: string;
  site_name: string;
  customer_name: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  site_type: 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL' | 'GOVERNMENT' | 'OTHER';
  property_type: string;
  service_zone: string;
  landmark: string;
  access_instructions: string;
  preferred_visit_time: string;
  equipment_summary: string;
  assigned_manager_id?: string; // Employee ID
  status: 'ACTIVE' | 'ON_HOLD' | 'INACTIVE';
  
  // New SiteDetails fields
  pincode?: string;
  site_contact_person?: string;
  mobile?: string;
  email?: string;
  total_area?: string;
  number_of_floors?: string;
  existing_hvac?: string;
  existing_brand?: string;
  existing_capacity?: string;
  amc_required?: string;
}

export interface Employee {
  id: string;
  employee_code: string;
  aadhar_number: string;
  first_name: string;
  last_name: string;
  name: string;
  date_of_birth: string; // YYYY-MM-DD
  gender: 'FEMALE' | 'MALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  hire_date: string; // YYYY-MM-DD
  employment_status: 'ACTIVE' | 'ON_JOB' | 'ON_LEAVE' | 'INACTIVE';
  department_id?: string;
  department_name?: string; // Or relational Department name
  manager_id?: string; // self-referential
  job_title: 'TECHNICIAN' | 'SENIOR_TECHNICIAN' | 'SUPERVISOR' | 'MANAGER' | 'CEO' | 'DISPATCHER' | 'ADMIN';
  title: string;
  department: string;
  daily_wage?: number;
  daily_incentive_earned?: number;
  hourly_rate?: number;
  salary?: number;
  profile_photo?: string;
  service_area: string;
  skills?: string;
  certifications?: string;
  availability: 'AVAILABLE' | 'ASSIGNED' | 'OFF_DUTY' | 'EMERGENCY_ONLY';
  status: 'ACTIVE' | 'ON_JOB' | 'ON_LEAVE' | 'INACTIVE';
  // Vehicle details
  plate_number?: string;
  make?: string;
  model?: string;
  year?: number;
}

export interface EmployeeSkill {
  id: string;
  employee_id: string;
  skill_name: string;
  skill_level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  certificate_number: string;
  issuing_authority: string;
  issue_date: string; // YYYY-MM-DD
}

export interface Project {
  id: string;
  name: string;
  customer_name: string;
  service_address: string;
  equipment_type: string;
  job_type: 'INSTALLATION' | 'REPAIR' | 'MAINTENANCE' | 'INSPECTION' | 'EMERGENCY';
  description: string;
  owner_id?: string; // Employee ID (supervisor / owner)
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';

  // New Job Details fields
  client_id?: string;
  site_id?: string;
  lead_id?: string;
  project_category?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

  // Commercial Info
  quotation_number?: string;
  contract_value?: string;
  approved_value?: string;
  advance_received?: string;
  payment_terms?: string;
  amc_included?: 'Yes' | 'No' | string;
  warranty?: string;

  // Timeline
  planned_start_date?: string;
  planned_end_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  progress_pct?: number;

  // Personnel / Team
  project_manager_id?: string;
  site_engineer_id?: string;
  supervisor_id?: string;
  technician_count?: number;
  contractor?: string;

  // Technical Details
  hvac_type?: string;
  brand?: string;
  capacity?: string;
  indoor_units?: number;
  outdoor_units?: number;
  copper_pipe_length?: string;
  drain_pipe_length?: string;
  fresh_air_system?: 'Yes' | 'No' | string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  project_id: string;
  assignee_id?: string; // Employee ID
  due_date?: string; // YYYY-MM-DD
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

  // New Task Details fields
  notes?: string;
  checklist?: string;
  tools_needed?: string;
  materials_used?: string;
  start_time?: string;
  completion_time?: string;
  weather_condition?: string;
  safety_equipment_checked?: string;
}

export interface Attendance {
  id: string;
  employee_id: string;
  date: string;
  check_in_time: string;
  check_out_time: string;
  total_hours: number;
  overtime_hours: number;
  attendance_status: 'Present' | 'Absent' | 'Half Day' | 'Leave' | 'Holiday' | 'Week Off';
  location: string;
  remarks: string;
  latitude?: number;
  longitude?: number;
  check_in_photo?: string;
  check_out_photo?: string;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type: 'Casual Leave' | 'Sick Leave' | 'Earned Leave' | 'Annual Leave' | 'Emergency Leave' | 'Unpaid Leave' | 'Maternity Leave' | 'Paternity Leave';
  start_date: string;
  end_date: string;
  number_of_days: number;
  reason: string;
  attachment?: string;
  applied_date: string;
  approval_status: 'Pending' | 'Approved' | 'Rejected';
  approved_by?: string;
  approval_date?: string;
  remarks?: string;
}

export interface LeaveBalance {
  id: string;
  employee_id: string;
  year: number;
  casual_leave_balance: number;
  sick_leave_balance: number;
  earned_leave_balance: number;
  total_leave_balance: number;
}

export interface SalaryStructure {
  id: string;
  employee_id: string;
  effective_date: string;
  basic_salary: number;
  hra: number;
  conveyance_allowance: number;
  medical_allowance: number;
  site_allowance: number;
  travel_allowance: number;
  other_allowance: number;
  gross_salary: number;
}

export interface Payroll {
  id: string;
  employee_id: string;
  payroll_month: string;
  working_days: number;
  present_days: number;
  leave_days: number;
  overtime_hours: number;
  gross_salary: number;
  pf_deduction: number;
  esi_deduction: number;
  tds_deduction: number;
  other_deductions: number;
  net_salary: number;
  payment_date?: string;
  payment_status: 'Pending' | 'Processed' | 'Paid';
}

export interface SalaryTransferLog {
  id: string;
  payroll_id: string | null;
  employee_id: string;
  amount: number;
  transfer_date: string;
  payroll_month: string;
  reference_number: string;
  payment_method: string;
}

export interface QuotationLineItem {
  description: string;
  unit: string;
  unit_price: number;
  quantity: number;
  total: number;
}

export interface Quotation {
  id: string;
  quotation_number: string;
  client_id?: string;
  client_name?: string;
  project_id?: string;
  project_name?: string;
  quotation_date: string;
  valid_until: string;
  status: 'Draft' | 'Sent' | 'Approved' | 'Rejected';
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  shipping_amount?: number;
  grand_total: number;
  terms_conditions?: string;
  notes?: string;
  items: QuotationLineItem[];
}

export interface PurchaseOrderLineItem {
  description: string;
  unit?: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  vendor_name: string;
  vendor_address?: string;
  vendor_gst?: string;
  client_id?: string;
  client_name?: string;
  project_id?: string;
  project_name?: string;
  po_date: string;
  delivery_date?: string;
  status: 'Draft' | 'Sent' | 'Approved' | 'Received' | 'Closed';
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  shipping_handling?: number;
  grand_total: number;
  payment_terms?: string;
  notes?: string;
  items: PurchaseOrderLineItem[];
  delivery_address?: string;
  vendor_contact_person?: string;
  quotation_id?: string;
  quotation_number?: string;
}

export interface CatalogItem {
  sku: string;
  name: string;
  department: string;
  category: string;
  unit: string;
  price: number;
  description: string;
  isFavorite?: boolean;

  // Exact CSV Columns representation
  series?: string;
  type?: string;
  technology?: string;
  mode?: string;
  starRating?: string;
  refrigerant?: string;
  powerSupply?: string;
  coolingTr?: string;
  heatingTr?: string;
  fcu?: string;
  cu?: string;
  mrpSetBase?: string;
  dbpWithoutTax?: string;
  discount?: string;
  unitPriceWoTax?: string;
  nlcGstPaid?: string;
}

export interface Vendor {
  id: string;
  name: string;
  address?: string;
  gst?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
}

export interface ClientTypeIndustryMapping {
  id: string;
  clientType: string;
  industry: string;
}

export interface User {
  id: string;
  email: string;
  password?: string;
  role: 'admin' | 'user';
  name: string;
  phone?: string;
  status?: string;
  employeeId?: string;
}



