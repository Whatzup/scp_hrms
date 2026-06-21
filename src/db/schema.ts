import { pgTable, text, integer, numeric } from 'drizzle-orm/pg-core';

export const departments = pgTable('departments', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
});

export const employees = pgTable('employees', {
  id: text('id').primaryKey(),
  employeeCode: text('employee_code').notNull(),
  aadharNumber: text('aadhar_number'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  name: text('name').notNull(),
  dateOfBirth: text('date_of_birth'),
  gender: text('gender'),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  postalCode: text('postal_code'),
  hireDate: text('hire_date'),
  employmentStatus: text('employment_status'),
  departmentId: text('department_id'),
  departmentName: text('department_name'),
  managerId: text('manager_id'),
  jobTitle: text('job_title'),
  title: text('title'),
  department: text('department'),
  dailyWage: integer('daily_wage'),
  dailyIncentiveEarned: integer('daily_incentive_earned'),
  hourlyRate: integer('hourly_rate'),
  salary: integer('salary'),
  profilePhoto: text('profile_photo'),
  serviceArea: text('service_area'),
  skills: text('skills'),
  certifications: text('certifications'),
  availability: text('availability'),
  status: text('status'),
  plateNumber: text('plate_number'),
  make: text('make'),
  model: text('model'),
  year: integer('year'),
});

export const employeeSkills = pgTable('employee_skills', {
  id: text('id').primaryKey(),
  employeeId: text('employee_id').references(() => employees.id, { onDelete: 'cascade' }),
  skillName: text('skill_name').notNull(),
  skillLevel: text('skill_level'),
  certificateNumber: text('certificate_number'),
  issuingAuthority: text('issuing_authority'),
  issueDate: text('issue_date'),
});

export const clients = pgTable('clients', {
  id: text('id').primaryKey(),
  clientName: text('client_name').notNull(),
  clientType: text('client_type'),
  industry: text('industry'),
  gstNumber: text('gst_number'),
  website: text('website'),
  headOfficeAddress: text('head_office_address'),
  primaryContactName: text('primary_contact_name'),
  designation: text('designation'),
  mobile: text('mobile').notNull(),
  email: text('email'),
  decisionMaker: text('decision_maker'),
  accountsContactCol: text('accounts_contact'),
  leadSource: text('lead_source'),
  clientStatus: text('client_status'),
  notes: text('notes'),

  // Backwards compatibility columns for existing dependencies
  clientCode: text('client_code'),
  companyName: text('company_name'),
  address: text('address'),
  projectName: text('project_name'),
  location: text('location'),
  buildingType: text('building_type'),
  approxArea: text('approx_area'),
  requirement: text('requirement'),
  preferredHvacSystem: text('preferred_hvac_system'),
  currentChallenges: text('current_challenges'),
  budgetRange: text('budget_range'),
  expectedCompletionDate: text('expected_completion_date'),
});

export const clientContacts = pgTable('client_contacts', {
  id: text('id').primaryKey(),
  clientId: text('client_id').references(() => clients.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  department: text('department'),
  designation: text('designation'),
  mobile: text('mobile'),
  email: text('email'),
  decisionMaker: integer('decision_maker'), // 0 = false, 1 = true
  technicalContact: integer('technical_contact'), // 0 = false, 1 = true
  accountsContact: integer('accounts_contact'), // 0 = false, 1 = true
});

export const sites = pgTable('sites', {
  id: text('id').primaryKey(),
  siteCode: text('site_code').notNull(),
  clientId: text('client_id'),
  clientName: text('client_name'),
  siteName: text('site_name').notNull(),
  customerName: text('customer_name').notNull(),
  contactPerson: text('contact_person'),
  contactPhone: text('contact_phone'),
  contactEmail: text('contact_email'),
  address: text('address').notNull(),
  city: text('city'),
  state: text('state'),
  postalCode: text('postal_code'),
  siteType: text('site_type'),
  propertyType: text('property_type'),
  serviceZone: text('service_zone'),
  landmark: text('landmark'),
  accessInstructions: text('access_instructions'),
  preferredVisitTime: text('preferred_visit_time'),
  equipmentSummary: text('equipment_summary'),
  assignedManagerId: text('assigned_manager_id'),
  status: text('status').notNull(),

  // New SiteDetails columns
  pincode: text('pincode'),
  siteContactPerson: text('site_contact_person'),
  mobile: text('mobile'),
  email: text('email'),
  totalArea: text('total_area'),
  numberOfFloors: text('number_of_floors'),
  existingHvac: text('existing_hvac'),
  existingBrand: text('existing_brand'),
  existingCapacity: text('existing_capacity'),
  amcRequired: text('amc_required'),
});

export const projects = pgTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  customerName: text('customer_name').notNull(),
  serviceAddress: text('service_address'),
  equipmentType: text('equipment_type'),
  jobType: text('job_type'),
  description: text('description'),
  ownerId: text('owner_id'),
  startDate: text('start_date'),
  endDate: text('end_date'),
  status: text('status').notNull(),

  // New Job Details Fields
  clientId: text('client_id'),
  siteId: text('site_id'),
  leadId: text('lead_id'),
  projectCategory: text('project_category'),
  priority: text('priority'),

  // Commercial Info
  quotationNumber: text('quotation_number'),
  contractValue: text('contract_value'),
  approvedValue: text('approved_value'),
  advanceReceived: text('advance_received'),
  paymentTerms: text('payment_terms'),
  amcIncluded: text('amc_included'),
  warranty: text('warranty'),

  // Timeline
  plannedStartDate: text('planned_start_date'),
  plannedEndDate: text('planned_end_date'),
  actualStartDate: text('actual_start_date'),
  actualEndDate: text('actual_end_date'),
  progressPct: integer('progress_pct'),

  // Personnel / Team
  projectManagerId: text('project_manager_id'),
  siteEngineerId: text('site_engineer_id'),
  supervisorId: text('supervisor_id'),
  technicianCount: integer('technician_count'),
  contractor: text('contractor'),

  // Technical Details
  hvacType: text('hvac_type'),
  brand: text('brand'),
  capacity: text('capacity'),
  indoorUnits: integer('indoor_units'),
  outdoorUnits: integer('outdoor_units'),
  copperPipeLength: text('copper_pipe_length'),
  drainPipeLength: text('drain_pipe_length'),
  freshAirSystem: text('fresh_air_system'),
});

export const tasks = pgTable('tasks', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  projectId: text('project_id').notNull(),
  assigneeId: text('assignee_id'),
  dueDate: text('due_date'),
  status: text('status').notNull(),
  priority: text('priority').notNull(),

  // New Task Details fields
  notes: text('notes'),
  checklist: text('checklist'),
  toolsNeeded: text('tools_needed'),
  materialsUsed: text('materials_used'),
  startTime: text('start_time'),
  completionTime: text('completion_time'),
  weatherCondition: text('weather_condition'),
  safetyEquipmentChecked: text('safety_equipment_checked'),
});
