import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { db, pool } from "./src/db/index.ts";
import { sql } from "drizzle-orm";
import { departments, employees, employeeSkills, clients, clientContacts, sites, projects, tasks } from "./src/db/schema.ts";
import { eq } from "drizzle-orm";

// Mock data to seed if DB is empty
import { 
  mockDepartments, 
  mockEmployees, 
  mockEmployeeSkills, 
  mockClients, 
  mockSites, 
  mockProjects, 
  mockTasks 
} from "./src/mockData.ts";

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize DB schema and seed with custom data if empty
let dbConnected = false;
async function initDb() {
  if (!process.env.DATABASE_URL) {
    console.warn("⚠️ DATABASE_URL is not configured. Database features will be unavailable.");
    return false;
  }

  try {
    console.log("Connecting and syncing Neon PostgreSQL database...");
    
    // Create tables if they do not exist using standard Postgres statements
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS departments (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS employees (
        id TEXT PRIMARY KEY,
        employee_code TEXT NOT NULL,
        aadhar_number TEXT,
        first_name TEXT,
        last_name TEXT,
        name TEXT NOT NULL,
        date_of_birth TEXT,
        gender TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        postal_code TEXT,
        hire_date TEXT,
        employment_status TEXT,
        department_id TEXT,
        department_name TEXT,
        manager_id TEXT,
        job_title TEXT,
        title TEXT,
        department TEXT,
        daily_wage INTEGER,
        daily_incentive_earned INTEGER,
        hourly_rate INTEGER,
        salary INTEGER,
        profile_photo TEXT,
        service_area TEXT,
        skills TEXT,
        certifications TEXT,
        availability TEXT,
        status TEXT,
        plate_number TEXT,
        make TEXT,
        model TEXT,
        year INTEGER
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS employee_skills (
        id TEXT PRIMARY KEY,
        employee_id TEXT REFERENCES employees(id) ON DELETE CASCADE,
        skill_name TEXT NOT NULL,
        skill_level TEXT,
        certificate_number TEXT,
        issuing_authority TEXT,
        issue_date TEXT
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS clients (
        id TEXT PRIMARY KEY,
        client_name TEXT NOT NULL,
        client_type TEXT,
        industry TEXT,
        gst_number TEXT,
        website TEXT,
        head_office_address TEXT,
        primary_contact_name TEXT,
        designation TEXT,
        mobile TEXT NOT NULL,
        email TEXT,
        decision_maker TEXT,
        accounts_contact TEXT,
        lead_source TEXT,
        client_status TEXT,
        notes TEXT,

        -- Backwards compatibility columns
        client_code TEXT,
        company_name TEXT,
        address TEXT,
        project_name TEXT,
        location TEXT,
        building_type TEXT,
        approx_area TEXT,
        requirement TEXT,
        preferred_hvac_system TEXT,
        current_challenges TEXT,
        budget_range TEXT,
        expected_completion_date TEXT
      );
    `);

    // Add new columns to existing clients table if they don't exist
    const newCols = [
      'client_type', 'industry', 'gst_number', 'website', 'head_office_address',
      'primary_contact_name', 'designation', 'decision_maker', 'accounts_contact',
      'lead_source', 'client_status', 'notes'
    ];
    for (const col of newCols) {
      try {
        await db.execute(sql.raw(`ALTER TABLE clients ADD COLUMN IF NOT EXISTS ${col} TEXT;`));
      } catch (err) {
        console.warn(`Column alternative notice for ${col}:`, err);
      }
    }

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS client_contacts (
        id TEXT PRIMARY KEY,
        client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        department TEXT,
        designation TEXT,
        mobile TEXT,
        email TEXT,
        decision_maker INTEGER,
        technical_contact INTEGER,
        accounts_contact INTEGER
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS sites (
        id TEXT PRIMARY KEY,
        site_code TEXT NOT NULL,
        client_id TEXT,
        client_name TEXT,
        site_name TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        contact_person TEXT,
        contact_phone TEXT,
        contact_email TEXT,
        address TEXT NOT NULL,
        city TEXT,
        state TEXT,
        postal_code TEXT,
        site_type TEXT,
        property_type TEXT,
        service_zone TEXT,
        landmark TEXT,
        access_instructions TEXT,
        preferred_visit_time TEXT,
        equipment_summary TEXT,
        assigned_manager_id TEXT,
        status TEXT NOT NULL,
        pincode TEXT,
        site_contact_person TEXT,
        mobile TEXT,
        email TEXT,
        total_area TEXT,
        number_of_floors TEXT,
        existing_hvac TEXT,
        existing_brand TEXT,
        existing_capacity TEXT,
        amc_required TEXT
      );
    `);

    // Add new columns to existing sites table if they don't exist
    const newSiteCols = [
      'pincode', 'site_contact_person', 'mobile', 'email', 'total_area',
      'number_of_floors', 'existing_hvac', 'existing_brand', 'existing_capacity', 'amc_required'
    ];
    for (const col of newSiteCols) {
      try {
        await db.execute(sql.raw(`ALTER TABLE sites ADD COLUMN IF NOT EXISTS ${col} TEXT;`));
      } catch (err) {
        console.warn(`Column alternative notice for site ${col}:`, err);
      }
    }

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        service_address TEXT,
        equipment_type TEXT,
        job_type TEXT,
        description TEXT,
        owner_id TEXT,
        start_date TEXT,
        end_date TEXT,
        status TEXT NOT NULL
      );
    `);

    // Add new columns to projects
    const newProjTextCols = [
      'client_id', 'site_id', 'lead_id', 'project_category', 'priority',
      'quotation_number', 'contract_value', 'approved_value', 'advance_received', 'payment_terms', 'amc_included', 'warranty',
      'planned_start_date', 'planned_end_date', 'actual_start_date', 'actual_end_date',
      'project_manager_id', 'site_engineer_id', 'supervisor_id', 'contractor',
      'hvac_type', 'brand', 'capacity', 'copper_pipe_length', 'drain_pipe_length', 'fresh_air_system'
    ];
    for (const col of newProjTextCols) {
      try {
        await db.execute(sql.raw(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS ${col} TEXT;`));
      } catch (err) {
        console.warn(`Column ALTER notice for project TEXT col ${col}:`, err);
      }
    }
    const newProjIntCols = ['progress_pct', 'technician_count', 'indoor_units', 'outdoor_units'];
    for (const col of newProjIntCols) {
      try {
        await db.execute(sql.raw(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS ${col} INTEGER;`));
      } catch (err) {
        console.warn(`Column ALTER notice for project INTEGER col ${col}:`, err);
      }
    }

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        project_id TEXT NOT NULL,
        assignee_id TEXT,
        dueDate TEXT, /* In old app types code this is loaded as due_date or expected-completion */
        due_date TEXT,
        status TEXT NOT NULL,
        priority TEXT NOT NULL
      );
    `);

    // Add new columns to tasks
    const newTaskTextCols = [
      'notes', 'checklist', 'tools_needed', 'materials_used', 'start_time', 'completion_time', 'weather_condition', 'safety_equipment_checked'
    ];
    for (const col of newTaskTextCols) {
      try {
        await db.execute(sql.raw(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS ${col} TEXT;`));
      } catch (err) {
        console.warn(`Column ALTER notice for task TEXT col ${col}:`, err);
      }
    }

    // New tables for Expanded Employee Module (Attendance, Leaves, Salary & Payroll)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS attendance (
        id TEXT PRIMARY KEY,
        employee_id TEXT REFERENCES employees(id) ON DELETE CASCADE,
        date TEXT,
        check_in_time TEXT,
        check_out_time TEXT,
        total_hours REAL,
        overtime_hours REAL,
        attendance_status TEXT,
        location TEXT,
        remarks TEXT,
        latitude REAL,
        longitude REAL,
        check_in_photo TEXT,
        check_out_photo TEXT
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS leave_requests (
        id TEXT PRIMARY KEY,
        employee_id TEXT REFERENCES employees(id) ON DELETE CASCADE,
        leave_type TEXT,
        start_date TEXT,
        end_date TEXT,
        number_of_days INTEGER,
        reason TEXT,
        attachment TEXT,
        applied_date TEXT,
        approval_status TEXT,
        approved_by TEXT,
        approval_date TEXT,
        remarks TEXT
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS leave_balances (
        id TEXT PRIMARY KEY,
        employee_id TEXT REFERENCES employees(id) ON DELETE CASCADE,
        year INTEGER,
        casual_leave_balance INTEGER,
        sick_leave_balance INTEGER,
        earned_leave_balance INTEGER,
        total_leave_balance INTEGER
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS salary_structures (
        id TEXT PRIMARY KEY,
        employee_id TEXT REFERENCES employees(id) ON DELETE CASCADE,
        effective_date TEXT,
        basic_salary INTEGER,
        hra INTEGER,
        conveyance_allowance INTEGER,
        medical_allowance INTEGER,
        site_allowance INTEGER,
        travel_allowance INTEGER,
        other_allowance INTEGER,
        gross_salary INTEGER
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS payroll (
        id TEXT PRIMARY KEY,
        employee_id TEXT REFERENCES employees(id) ON DELETE CASCADE,
        payroll_month TEXT,
        working_days INTEGER,
        present_days INTEGER,
        leave_days INTEGER,
        overtime_hours INTEGER,
        gross_salary INTEGER,
        pf_deduction INTEGER,
        esi_deduction INTEGER,
        tds_deduction INTEGER,
        other_deductions INTEGER,
        net_salary INTEGER,
        payment_date TEXT,
        payment_status TEXT
      );
    `);

    console.log("✅ PostgreSQL Tables successfully checked & synced.");

    // Check if empty, and seed
    const employeeCountResult = await db.execute(sql`SELECT count(*) FROM employees`);
    const count = parseInt(String(employeeCountResult.rows[0]?.count || '0'), 10);
    
    if (count === 0) {
      console.log("🌱 Database is empty! Auto-seeding initial metadata & mock records...");
      
      // Load departments
      for (const d of mockDepartments) {
        await db.insert(departments).values(d).onConflictDoNothing();
      }

      // Load employees
      for (const e of mockEmployees) {
        await db.insert(employees).values({
          id: e.id,
          employeeCode: e.employee_code,
          aadharNumber: e.aadhar_number || null,
          firstName: e.first_name || null,
          lastName: e.last_name || null,
          name: e.name,
          dateOfBirth: e.date_of_birth || null,
          gender: e.gender || null,
          email: e.email || null,
          phone: e.phone || null,
          address: e.address || null,
          city: e.city || null,
          state: e.state || null,
          postalCode: e.postal_code || null,
          hireDate: e.hire_date || null,
          employmentStatus: e.employment_status || null,
          departmentId: e.department_id || null,
          departmentName: e.department_name || null,
          managerId: e.manager_id || null,
          jobTitle: e.job_title || null,
          title: e.title || null,
          department: e.department || null,
          dailyWage: e.daily_wage || null,
          dailyIncentiveEarned: e.daily_incentive_earned || null,
          hourlyRate: e.hourly_rate || null,
          salary: e.salary || null,
          profilePhoto: e.profile_photo || null,
          serviceArea: e.service_area || '',
          skills: e.skills || null,
          certifications: e.certifications || null,
          availability: e.availability || 'AVAILABLE',
          status: e.status || 'ACTIVE',
          plateNumber: e.plate_number || null,
          make: e.make || null,
          model: e.model || null,
          year: e.year || null,
        }).onConflictDoNothing();
      }

      // Load skills
      for (const s of mockEmployeeSkills) {
        await db.insert(employeeSkills).values({
          id: s.id,
          employeeId: s.employee_id,
          skillName: s.skill_name,
          skillLevel: s.skill_level || null,
          certificateNumber: s.certificate_number || null,
          issuingAuthority: s.issuing_authority || null,
          issueDate: s.issue_date || null,
        }).onConflictDoNothing();
      }

      // Load clients
      for (const c of mockClients) {
        await db.insert(clients).values({
          id: c.id,
          clientCode: c.client_code,
          clientName: c.client_name,
          companyName: c.company_name || null,
          mobile: c.mobile,
          email: c.email || null,
          address: c.address || null,
          projectName: c.project_name,
          location: c.location || null,
          buildingType: c.building_type || null,
          approxArea: c.approx_area || null,
          requirement: c.requirement || null,
          preferredHvacSystem: c.preferred_hvac_system || null,
          currentChallenges: c.current_challenges || null,
          budgetRange: c.budget_range || null,
          expectedCompletionDate: c.expected_completion_date || null,
        }).onConflictDoNothing();
      }

      // Load sites
      for (const s of mockSites) {
        await db.insert(sites).values({
          id: s.id,
          siteCode: s.site_code,
          clientId: s.client_id || null,
          clientName: s.client_name || null,
          siteName: s.site_name,
          customerName: s.customer_name,
          contactPerson: s.contact_person || null,
          contactPhone: s.contact_phone || null,
          contactEmail: s.contact_email || null,
          address: s.address,
          city: s.city || null,
          state: s.state || null,
          postalCode: s.postal_code || null,
          siteType: s.site_type || null,
          propertyType: s.property_type || null,
          serviceZone: s.service_zone || null,
          landmark: s.landmark || null,
          accessInstructions: s.access_instructions || null,
          preferredVisitTime: s.preferred_visit_time || null,
          equipmentSummary: s.equipment_summary || null,
          assignedManagerId: s.assigned_manager_id || null,
          status: s.status,
        }).onConflictDoNothing();
      }

      // Load projects
      for (const p of mockProjects) {
        await db.insert(projects).values({
          id: p.id,
          name: p.name,
          customerName: p.customer_name,
          serviceAddress: p.service_address || null,
          equipmentType: p.equipment_type || null,
          jobType: p.job_type || null,
          description: p.description || null,
          ownerId: p.owner_id || null,
          startDate: p.start_date || null,
          endDate: p.end_date || null,
          status: p.status,
        }).onConflictDoNothing();
      }

      // Load tasks
      for (const t of mockTasks) {
        await db.insert(tasks).values({
          id: t.id,
          title: t.title,
          description: t.description || null,
          projectId: t.project_id,
          assigneeId: t.assignee_id || null,
          dueDate: t.due_date || null,
          status: t.status,
          priority: t.priority,
        }).onConflictDoNothing();
      }

      console.log("🌱 Seeding complete successfully!");
    } else {
      console.log(`📊 Database already has ${count} employees. Skipping auto-seeding.`);
    }

    return true;
  } catch (err) {
    console.error("❌ Database Initialization Error:", err);
    return false;
  }
}


// --- API ROUTES ---

// Connection status check
app.get("/api/status", async (req, res) => {
  const isEnvConfigured = !!process.env.DATABASE_URL;
  if (!isEnvConfigured) {
    return res.json({
      connected: false,
      configured: false,
      message: "DATABASE_URL environment variable is missing."
    });
  }

  try {
    // Ping DB
    await db.execute(sql`SELECT 1`);
    res.json({
      connected: true,
      configured: true,
      message: "Successfully connected to Neon PostgreSQL!"
    });
  } catch (error: any) {
    res.json({
      connected: false,
      configured: true,
      message: error.message || "Connection failed to Neon Postgres."
    });
  }
});

// Seed endpoint for manual database reset/triggering
app.post("/api/seed", async (req, res) => {
  try {
    // Clear all existing
    await db.execute(sql`DELETE FROM tasks`);
    await db.execute(sql`DELETE FROM projects`);
    await db.execute(sql`DELETE FROM sites`);
    await db.execute(sql`DELETE FROM clients`);
    await db.execute(sql`DELETE FROM employee_skills`);
    await db.execute(sql`DELETE FROM employees`);
    await db.execute(sql`DELETE FROM departments`);

    // Reset database
    const success = await initDb();
    if (success) {
      res.json({ status: "ok", message: "Database re-seeded successfully!" });
    } else {
      res.status(500).json({ error: "Failed to initialize and seed database." });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to re-seed database." });
  }
});

// Fetch all database state in a single request (highly optimal!)
app.get("/api/all", async (req, res) => {
  try {
    const rawDepts = await db.select().from(departments);
    const rawEmps = await db.select().from(employees);
    const rawSkills = await db.select().from(employeeSkills);
    const rawClients = await db.select().from(clients);
    const rawClientContacts = await db.select().from(clientContacts);
    const rawSites = await db.select().from(sites);
    const rawProjs = await db.select().from(projects);
    const rawTasks = await db.select().from(tasks);

    // Map database properties back to camelCase/expected typings nicely
    const employeesMapped = rawEmps.map(e => ({
      id: e.id,
      employee_code: e.employeeCode,
      aadhar_number: e.aadharNumber,
      first_name: e.firstName,
      last_name: e.lastName,
      name: e.name,
      date_of_birth: e.dateOfBirth,
      gender: e.gender,
      email: e.email,
      phone: e.phone,
      address: e.address,
      city: e.city,
      state: e.state,
      postal_code: e.postalCode,
      hire_date: e.hireDate,
      employment_status: e.employmentStatus,
      department_id: e.departmentId,
      department_name: e.departmentName,
      manager_id: e.managerId,
      job_title: e.jobTitle,
      title: e.title,
      department: e.department,
      daily_wage: e.dailyWage,
      daily_incentive_earned: e.dailyIncentiveEarned,
      hourly_rate: e.hourlyRate,
      salary: e.salary,
      profile_photo: e.profilePhoto,
      service_area: e.serviceArea,
      skills: e.skills,
      certifications: e.certifications,
      availability: e.availability,
      status: e.status,
      plate_number: e.plateNumber,
      make: e.make,
      model: e.model,
      year: e.year,
    }));

    const skillsMapped = rawSkills.map(s => ({
      id: s.id,
      employee_id: s.employeeId,
      skill_name: s.skillName,
      skill_level: s.skillLevel,
      certificate_number: s.certificateNumber,
      issuing_authority: s.issuingAuthority,
      issue_date: s.issueDate,
    }));

    const clientsMapped = rawClients.map(c => ({
      id: c.id,
      client_name: c.clientName,
      client_type: c.clientType || 'Corporate',
      industry: c.industry || '',
      gst_number: c.gstNumber || '',
      website: c.website || '',
      head_office_address: c.headOfficeAddress || '',
      primary_contact_name: c.primaryContactName || '',
      designation: c.designation || '',
      mobile: c.mobile,
      email: c.email || '',
      decision_maker: c.decisionMaker || 'Yes',
      accounts_contact: c.accountsContactCol || 'Yes',
      lead_source: c.leadSource || '',
      client_status: c.clientStatus || 'ACTIVE',
      notes: c.notes || '',

      // Backwards compatibility fields
      client_code: c.clientCode || 'C001',
      company_name: c.companyName || c.clientName,
      address: c.address || c.headOfficeAddress || '',
      project_name: c.projectName || 'HVAC Operation',
      location: c.location || '',
      building_type: c.buildingType || 'COMMERCIAL',
      approx_area: c.approxArea || '',
      requirement: c.requirement || 'AMC',
      preferred_hvac_system: c.preferredHvacSystem || 'NOT_SURE',
      current_challenges: c.currentChallenges || '',
      budget_range: c.budgetRange || '',
      expected_completion_date: c.expectedCompletionDate || '',
    }));

    const clientContactsMapped = rawClientContacts.map(cc => ({
      id: cc.id,
      client_id: cc.clientId,
      name: cc.name,
      department: cc.department || '',
      designation: cc.designation || '',
      mobile: cc.mobile || '',
      email: cc.email || '',
      decision_maker: cc.decisionMaker === 1,
      technical_contact: cc.technicalContact === 1,
      accounts_contact: cc.accountsContact === 1,
    }));

    const sitesMapped = rawSites.map(s => ({
      id: s.id,
      site_code: s.siteCode,
      client_id: s.clientId,
      client_name: s.clientName,
      site_name: s.siteName,
      customer_name: s.customerName,
      contact_person: s.contactPerson,
      contact_phone: s.contactPhone,
      contact_email: s.contactEmail,
      address: s.address,
      city: s.city,
      state: s.state,
      postal_code: s.postalCode,
      site_type: s.siteType,
      property_type: s.propertyType,
      service_zone: s.serviceZone,
      landmark: s.landmark,
      access_instructions: s.accessInstructions,
      preferred_visit_time: s.preferredVisitTime,
      equipment_summary: s.equipmentSummary,
      assigned_manager_id: s.assignedManagerId,
      status: s.status,
      
      // New SiteDetails mapping
      pincode: s.pincode || s.postalCode || '',
      site_contact_person: s.siteContactPerson || s.contactPerson || '',
      mobile: s.mobile || s.contactPhone || '',
      email: s.email || s.contactEmail || '',
      total_area: s.totalArea || '',
      number_of_floors: s.numberOfFloors || '',
      existing_hvac: s.existingHvac || '',
      existing_brand: s.existingBrand || '',
      existing_capacity: s.existingCapacity || '',
      amc_required: s.amcRequired || 'No',
    }));

    const projectsMapped = rawProjs.map(p => ({
      id: p.id,
      name: p.name,
      customer_name: p.customerName,
      service_address: p.serviceAddress,
      equipment_type: p.equipmentType,
      job_type: p.jobType,
      description: p.description,
      owner_id: p.ownerId,
      start_date: p.startDate,
      end_date: p.endDate,
      status: p.status,

      // New Job fields mapping
      client_id: p.clientId || '',
      site_id: p.siteId || '',
      lead_id: p.leadId || '',
      project_category: p.projectCategory || '',
      priority: p.priority || 'MEDIUM',

      // Commercial
      quotation_number: p.quotationNumber || '',
      contract_value: p.contractValue || '',
      approved_value: p.approvedValue || '',
      advance_received: p.advanceReceived || '',
      payment_terms: p.paymentTerms || '',
      amc_included: p.amcIncluded || 'No',
      warranty: p.warranty || '',

      // Timeline
      planned_start_date: p.plannedStartDate || '',
      planned_end_date: p.plannedEndDate || '',
      actual_start_date: p.actualStartDate || '',
      actual_end_date: p.actualEndDate || '',
      progress_pct: p.progressPct || 0,

      // Team
      project_manager_id: p.projectManagerId || '',
      site_engineer_id: p.siteEngineerId || '',
      supervisor_id: p.supervisorId || '',
      technician_count: p.technicianCount || 0,
      contractor: p.contractor || '',

      // Tech details
      hvac_type: p.hvacType || '',
      brand: p.brand || '',
      capacity: p.capacity || '',
      indoor_units: p.indoorUnits || 0,
      outdoor_units: p.outdoorUnits || 0,
      copper_pipe_length: p.copperPipeLength || '',
      drain_pipe_length: p.drainPipeLength || '',
      fresh_air_system: p.freshAirSystem || 'No',
    }));

    const tasksMapped = rawTasks.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      project_id: t.projectId,
      assignee_id: t.assigneeId,
      due_date: t.dueDate,
      status: t.status,
      priority: t.priority,

      // New Task fields mapping
      notes: t.notes || '',
      checklist: t.checklist || '',
      tools_needed: t.toolsNeeded || '',
      materials_used: t.materialsUsed || '',
      start_time: t.startTime || '',
      completion_time: t.completionTime || '',
      weather_condition: t.weatherCondition || '',
      safety_equipment_checked: t.safetyEquipmentChecked || '',
    }));

    let rawAttendance: any[] = [];
    let rawLeaveRequests: any[] = [];
    let rawLeaveBalances: any[] = [];
    let rawSalaryStructures: any[] = [];
    let rawPayroll: any[] = [];

    if (dbConnected) {
      try {
        const attRes = await db.execute(sql`SELECT * FROM attendance`);
        rawAttendance = attRes.rows || [];
      } catch (e) {
        console.warn("Could not query attendance:", e);
      }
      try {
        const lrRes = await db.execute(sql`SELECT * FROM leave_requests`);
        rawLeaveRequests = lrRes.rows || [];
      } catch (e) {
        console.warn("Could not query leave_requests:", e);
      }
      try {
        const lbRes = await db.execute(sql`SELECT * FROM leave_balances`);
        rawLeaveBalances = lbRes.rows || [];
      } catch (e) {
        console.warn("Could not query leave_balances:", e);
      }
      try {
        const ssRes = await db.execute(sql`SELECT * FROM salary_structures`);
        rawSalaryStructures = ssRes.rows || [];
      } catch (e) {
        console.warn("Could not query salary_structures:", e);
      }
      try {
        const payRes = await db.execute(sql`SELECT * FROM payroll`);
        rawPayroll = payRes.rows || [];
      } catch (e) {
        console.warn("Could not query payroll:", e);
      }
    }

    res.json({
      departments: rawDepts,
      employees: employeesMapped,
      skills: skillsMapped,
      clients: clientsMapped,
      clientContacts: clientContactsMapped,
      sites: sitesMapped,
      projects: projectsMapped,
      tasks: tasksMapped,
      attendance: rawAttendance.map(a => ({
        id: a.id,
        employee_id: a.employee_id,
        date: a.date,
        check_in_time: a.check_in_time,
        check_out_time: a.check_out_time,
        total_hours: Number(a.total_hours || 0),
        overtime_hours: Number(a.overtime_hours || 0),
        attendance_status: a.attendance_status,
        location: a.location,
        remarks: a.remarks,
        latitude: a.latitude ? Number(a.latitude) : undefined,
        longitude: a.longitude ? Number(a.longitude) : undefined,
        check_in_photo: a.check_in_photo,
        check_out_photo: a.check_out_photo
      })),
      leaveRequests: rawLeaveRequests.map(lr => ({
        id: lr.id,
        employee_id: lr.employee_id,
        leave_type: lr.leave_type,
        start_date: lr.start_date,
        end_date: lr.end_date,
        number_of_days: Number(lr.number_of_days || 0),
        reason: lr.reason,
        attachment: lr.attachment,
        applied_date: lr.applied_date,
        approval_status: lr.approval_status,
        approved_by: lr.approved_by,
        approval_date: lr.approval_date,
        remarks: lr.remarks
      })),
      leaveBalances: rawLeaveBalances.map(lb => ({
        id: lb.id,
        employee_id: lb.employee_id,
        year: Number(lb.year || 0),
        casual_leave_balance: Number(lb.casual_leave_balance || 0),
        sick_leave_balance: Number(lb.sick_leave_balance || 0),
        earned_leave_balance: Number(lb.earned_leave_balance || 0),
        total_leave_balance: Number(lb.total_leave_balance || 0)
      })),
      salaryStructures: rawSalaryStructures.map(ss => ({
        id: ss.id,
        employee_id: ss.employee_id,
        effective_date: ss.effective_date,
        basic_salary: Number(ss.basic_salary || 0),
        hra: Number(ss.hra || 0),
        conveyance_allowance: Number(ss.conveyance_allowance || 0),
        medical_allowance: Number(ss.medical_allowance || 0),
        site_allowance: Number(ss.site_allowance || 0),
        travel_allowance: Number(ss.travel_allowance || 0),
        other_allowance: Number(ss.other_allowance || 0),
        gross_salary: Number(ss.gross_salary || 0)
      })),
      payrolls: rawPayroll.map(p => ({
        id: p.id,
        employee_id: p.employee_id,
        payroll_month: p.payroll_month,
        working_days: Number(p.working_days || 0),
        present_days: Number(p.present_days || 0),
        leave_days: Number(p.leave_days || 0),
        overtime_hours: Number(p.overtime_hours || 0),
        gross_salary: Number(p.gross_salary || 0),
        pf_deduction: Number(p.pf_deduction || 0),
        esi_deduction: Number(p.esi_deduction || 0),
        tds_deduction: Number(p.tds_deduction || 0),
        other_deductions: Number(p.other_deductions || 0),
        net_salary: Number(p.net_salary || 0),
        payment_date: p.payment_date,
        payment_status: p.payment_status
      }))
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to load database records." });
  }
});

// Expanded Module REST Endpoints

// POST Attendance Check-In / Out Log
app.post("/api/attendance", async (req, res) => {
  try {
    const { id, employee_id, date, check_in_time, check_out_time, total_hours, overtime_hours, attendance_status, location, remarks, latitude, longitude, check_in_photo, check_out_photo } = req.body;
    await db.execute(sql`
      INSERT INTO attendance (id, employee_id, date, check_in_time, check_out_time, total_hours, overtime_hours, attendance_status, location, remarks, latitude, longitude, check_in_photo, check_out_photo)
      VALUES (${id}, ${employee_id}, ${date}, ${check_in_time}, ${check_out_time}, ${total_hours}, ${overtime_hours}, ${attendance_status}, ${location}, ${remarks}, ${latitude}, ${longitude}, ${check_in_photo}, ${check_out_photo})
      ON CONFLICT (id) DO UPDATE SET
        check_in_time = EXCLUDED.check_in_time,
        check_out_time = EXCLUDED.check_out_time,
        total_hours = EXCLUDED.total_hours,
        overtime_hours = EXCLUDED.overtime_hours,
        attendance_status = EXCLUDED.attendance_status,
        remarks = EXCLUDED.remarks,
        check_out_photo = EXCLUDED.check_out_photo
    `);
    res.status(251).json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Attendance Record
app.delete("/api/attendance/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute(sql`DELETE FROM attendance WHERE id = ${id}`);
    res.json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST Leave Request
app.post("/api/leave_requests", async (req, res) => {
  try {
    const { id, employee_id, leave_type, start_date, end_date, number_of_days, reason, attachment, applied_date, approval_status, approved_by, approval_date, remarks } = req.body;
    await db.execute(sql`
      INSERT INTO leave_requests (id, employee_id, leave_type, start_date, end_date, number_of_days, reason, attachment, applied_date, approval_status, approved_by, approval_date, remarks)
      VALUES (${id}, ${employee_id}, ${leave_type}, ${start_date}, ${end_date}, ${number_of_days}, ${reason}, ${attachment}, ${applied_date}, ${approval_status}, ${approved_by}, ${approval_date}, ${remarks})
    `);
    res.status(251).json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Approve/Reject Leave Request
app.put("/api/leave_requests/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;
    const { approval_status, approved_by, approval_date, remarks } = req.body;
    await db.execute(sql`
      UPDATE leave_requests 
      SET approval_status = ${approval_status}, approved_by = ${approved_by}, approval_date = ${approval_date}, remarks = ${remarks}
      WHERE id = ${id}
    `);
    res.json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Leave Request
app.delete("/api/leave_requests/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute(sql`DELETE FROM leave_requests WHERE id = ${id}`);
    res.json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE/POST Leave Balance
app.post("/api/leave_balances", async (req, res) => {
  try {
    const { id, employee_id, year, casual_leave_balance, sick_leave_balance, earned_leave_balance, total_leave_balance } = req.body;
    await db.execute(sql`
      INSERT INTO leave_balances (id, employee_id, year, casual_leave_balance, sick_leave_balance, earned_leave_balance, total_leave_balance)
      VALUES (${id}, ${employee_id}, ${year}, ${casual_leave_balance}, ${sick_leave_balance}, ${earned_leave_balance}, ${total_leave_balance})
      ON CONFLICT (id) DO UPDATE SET
        casual_leave_balance = EXCLUDED.casual_leave_balance,
        sick_leave_balance = EXCLUDED.sick_leave_balance,
        earned_leave_balance = EXCLUDED.earned_leave_balance,
        total_leave_balance = EXCLUDED.total_leave_balance
    `);
    res.json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST Salary Structure
app.post("/api/salary_structures", async (req, res) => {
  try {
    const { id, employee_id, effective_date, basic_salary, hra, conveyance_allowance, medical_allowance, site_allowance, travel_allowance, other_allowance, gross_salary } = req.body;
    await db.execute(sql`
      INSERT INTO salary_structures (id, employee_id, effective_date, basic_salary, hra, conveyance_allowance, medical_allowance, site_allowance, travel_allowance, other_allowance, gross_salary)
      VALUES (${id}, ${employee_id}, ${effective_date}, ${basic_salary}, ${hra}, ${conveyance_allowance}, ${medical_allowance}, ${site_allowance}, ${travel_allowance}, ${other_allowance}, ${gross_salary})
      ON CONFLICT (id) DO UPDATE SET
        effective_date = EXCLUDED.effective_date,
        basic_salary = EXCLUDED.basic_salary,
        hra = EXCLUDED.hra,
        conveyance_allowance = EXCLUDED.conveyance_allowance,
        medical_allowance = EXCLUDED.medical_allowance,
        site_allowance = EXCLUDED.site_allowance,
        travel_allowance = EXCLUDED.travel_allowance,
        other_allowance = EXCLUDED.other_allowance,
        gross_salary = EXCLUDED.gross_salary
    `);
    res.json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST Payroll
app.post("/api/payroll", async (req, res) => {
  try {
    const { id, employee_id, payroll_month, working_days, present_days, leave_days, overtime_hours, gross_salary, pf_deduction, esi_deduction, tds_deduction, other_deductions, net_salary, payment_date, payment_status } = req.body;
    await db.execute(sql`
      INSERT INTO payroll (id, employee_id, payroll_month, working_days, present_days, leave_days, overtime_hours, gross_salary, pf_deduction, esi_deduction, tds_deduction, other_deductions, net_salary, payment_date, payment_status)
      VALUES (${id}, ${employee_id}, ${payroll_month}, ${working_days}, ${present_days}, ${leave_days}, ${overtime_hours}, ${gross_salary}, ${pf_deduction}, ${esi_deduction}, ${tds_deduction}, ${other_deductions}, ${net_salary}, ${payment_date}, ${payment_status})
    `);
    res.status(251).json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Payroll payment status
app.put("/api/payroll/:id/payment", async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status, payment_date } = req.body;
    await db.execute(sql`
      UPDATE payroll
      SET payment_status = ${payment_status}, payment_date = ${payment_date}
      WHERE id = ${id}
    `);
    res.json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Payroll sheet log
app.delete("/api/payroll/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute(sql`DELETE FROM payroll WHERE id = ${id}`);
    res.json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST Employee
app.post("/api/employees", async (req, res) => {
  try {
    const { employee, skills: subSkills } = req.body;
    if (!employee || !employee.id || !employee.name) {
      return res.status(400).json({ error: "Missing required employee parameters." });
    }

    await db.insert(employees).values({
      id: employee.id,
      employeeCode: employee.employee_code,
      aadharNumber: employee.aadhar_number || null,
      firstName: employee.first_name || null,
      lastName: employee.last_name || null,
      name: employee.name,
      dateOfBirth: employee.date_of_birth || null,
      gender: employee.gender || null,
      email: employee.email || null,
      phone: employee.phone || null,
      address: employee.address || null,
      city: employee.city || null,
      state: employee.state || null,
      postalCode: employee.postal_code || null,
      hireDate: employee.hire_date || null,
      employmentStatus: employee.employment_status || null,
      departmentId: employee.department_id || null,
      departmentName: employee.department_name || null,
      managerId: employee.manager_id || null,
      jobTitle: employee.job_title || null,
      title: employee.title || null,
      department: employee.department || null,
      dailyWage: employee.daily_wage || null,
      dailyIncentiveEarned: employee.daily_incentive_earned || null,
      hourlyRate: employee.hourly_rate || null,
      salary: employee.salary || null,
      profilePhoto: employee.profile_photo || null,
      serviceArea: employee.service_area || '',
      skills: employee.skills || null,
      certifications: employee.certifications || null,
      availability: employee.availability || 'AVAILABLE',
      status: employee.status || 'ACTIVE',
      plateNumber: employee.plate_number || null,
      make: employee.make || null,
      model: employee.model || null,
      year: employee.year || null,
    });

    if (subSkills && Array.isArray(subSkills)) {
      for (const s of subSkills) {
        await db.insert(employeeSkills).values({
          id: s.id,
          employeeId: employee.id,
          skillName: s.skill_name,
          skillLevel: s.skill_level || null,
          certificateNumber: s.certificate_number || null,
          issuingAuthority: s.issuing_authority || null,
          issueDate: s.issue_date || null,
        });
      }
    }

    res.status(201).json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Employee
app.delete("/api/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(employeeSkills).where(eq(employeeSkills.employeeId, id));
    await db.delete(employees).where(eq(employees.id, id));
    res.json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT Employee Status
app.put("/api/employees/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const availability = status === 'ACTIVE' ? 'AVAILABLE' : status === 'ON_JOB' ? 'ASSIGNED' : 'OFF_DUTY';
    await db.update(employees)
      .set({ 
        status, 
        employmentStatus: status,
        availability,
      })
      .where(eq(employees.id, id));
    res.json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST Client
app.post("/api/clients", async (req, res) => {
  try {
    const payload = req.body;
    // support both { client, contacts } format or a flat client payload
    const c = payload.client || payload;
    const contacts = payload.contacts || [];

    await db.insert(clients).values({
      id: c.id,
      clientName: c.client_name,
      clientType: c.client_type || null,
      industry: c.industry || null,
      gstNumber: c.gst_number || null,
      website: c.website || null,
      headOfficeAddress: c.head_office_address || null,
      primaryContactName: c.primary_contact_name || null,
      designation: c.designation || null,
      mobile: c.mobile,
      email: c.email || null,
      decisionMaker: c.decision_maker || null,
      accountsContactCol: c.accounts_contact || null,
      leadSource: c.lead_source || null,
      clientStatus: c.client_status || 'ACTIVE',
      notes: c.notes || null,

      // Backwards compatibility columns for stability
      clientCode: c.client_code || `C${c.id.substring(c.id.length - 3)}`,
      companyName: c.company_name || c.client_name || null,
      address: c.address || c.head_office_address || null,
      projectName: c.project_name || 'HVAC Operation',
      location: c.location || null,
      buildingType: c.building_type || null,
      approxArea: c.approx_area || null,
      requirement: c.requirement || null,
      preferredHvacSystem: c.preferred_hvac_system || null,
      currentChallenges: c.current_challenges || null,
      budgetRange: c.budget_range || null,
      expectedCompletionDate: c.expected_completion_date || null,
    });

    if (contacts && Array.isArray(contacts)) {
      for (const contactsData of contacts) {
        await db.insert(clientContacts).values({
          id: contactsData.id,
          clientId: c.id,
          name: contactsData.name,
          department: contactsData.department || null,
          designation: contactsData.designation || null,
          mobile: contactsData.mobile || null,
          email: contactsData.email || null,
          decisionMaker: contactsData.decision_maker ? 1 : 0,
          technicalContact: contactsData.technical_contact ? 1 : 0,
          accountsContact: contactsData.accounts_contact ? 1 : 0,
        });
      }
    }

    res.status(201).json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST Site
app.post("/api/sites", async (req, res) => {
  try {
    const s = req.body;
    await db.insert(sites).values({
      id: s.id,
      siteCode: s.site_code,
      clientId: s.client_id || null,
      clientName: s.client_name || null,
      siteName: s.site_name,
      customerName: s.customer_name,
      contactPerson: s.contact_person || null,
      contactPhone: s.contact_phone || null,
      contactEmail: s.contact_email || null,
      address: s.address,
      city: s.city || null,
      state: s.state || null,
      postalCode: s.postal_code || null,
      siteType: s.site_type || null,
      propertyType: s.property_type || null,
      serviceZone: s.service_zone || null,
      landmark: s.landmark || null,
      accessInstructions: s.access_instructions || null,
      preferredVisitTime: s.preferred_visit_time || null,
      equipmentSummary: s.equipment_summary || null,
      assignedManagerId: s.assigned_manager_id || null,
      status: s.status,

      // New properties persistence
      pincode: s.pincode || null,
      siteContactPerson: s.site_contact_person || s.contact_person || null,
      mobile: s.mobile || s.contact_phone || null,
      email: s.email || s.contact_email || null,
      totalArea: s.total_area || null,
      numberOfFloors: s.number_of_floors || null,
      existingHvac: s.existing_hvac || null,
      existingBrand: s.existing_brand || null,
      existingCapacity: s.existing_capacity || null,
      amcRequired: s.amc_required || null,
    });
    res.status(201).json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// UT Site status
app.put("/api/sites/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await db.update(sites).set({ status }).where(eq(sites.id, id));
    res.json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST Project
app.post("/api/projects", async (req, res) => {
  try {
    const p = req.body;
    await db.insert(projects).values({
      id: p.id,
      name: p.name,
      customerName: p.customer_name,
      serviceAddress: p.service_address || null,
      equipmentType: p.equipment_type || null,
      jobType: p.job_type || null,
      description: p.description || null,
      ownerId: p.owner_id || null,
      startDate: p.start_date || null,
      endDate: p.end_date || null,
      status: p.status,

      // New properties persistence
      clientId: p.client_id || null,
      siteId: p.site_id || null,
      leadId: p.lead_id || null,
      projectCategory: p.project_category || null,
      priority: p.priority || null,

      // Commercial
      quotationNumber: p.quotation_number || null,
      contractValue: p.contract_value || null,
      approvedValue: p.approved_value || null,
      advanceReceived: p.advance_received || null,
      paymentTerms: p.payment_terms || null,
      amcIncluded: p.amc_included || null,
      warranty: p.warranty || null,

      // Timeline
      plannedStartDate: p.planned_start_date || null,
      plannedEndDate: p.planned_end_date || null,
      actualStartDate: p.actual_start_date || null,
      actualEndDate: p.actual_end_date || null,
      progressPct: p.progress_pct !== undefined ? Number(p.progress_pct) : null,

      // Team
      projectManagerId: p.project_manager_id || null,
      siteEngineerId: p.site_engineer_id || null,
      supervisorId: p.supervisor_id || null,
      technicianCount: p.technician_count !== undefined ? Number(p.technician_count) : null,
      contractor: p.contractor || null,

      // Tech details
      hvacType: p.hvac_type || null,
      brand: p.brand || null,
      capacity: p.capacity || null,
      indoorUnits: p.indoor_units !== undefined ? Number(p.indoor_units) : null,
      outdoorUnits: p.outdoor_units !== undefined ? Number(p.outdoor_units) : null,
      copperPipeLength: p.copper_pipe_length || null,
      drainPipeLength: p.drain_pipe_length || null,
      freshAirSystem: p.fresh_air_system || null,
    });
    res.status(201).json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Project
app.delete("/api/projects/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(tasks).where(eq(tasks.projectId, id));
    await db.delete(projects).where(eq(projects.id, id));
    res.json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT Project status
app.put("/api/projects/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await db.update(projects).set({ status }).where(eq(projects.id, id));
    res.json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST Task
app.post("/api/tasks", async (req, res) => {
  try {
    const t = req.body;
    await db.insert(tasks).values({
      id: t.id,
      title: t.title,
      description: t.description || null,
      projectId: t.project_id,
      assigneeId: t.assignee_id || null,
      dueDate: t.due_date || null,
      status: t.status,
      priority: t.priority,

      // New task fields persistence
      notes: t.notes || null,
      checklist: t.checklist || null,
      toolsNeeded: t.tools_needed || null,
      materialsUsed: t.materials_used || null,
      startTime: t.start_time || null,
      completionTime: t.completion_time || null,
      weatherCondition: t.weather_condition || null,
      safetyEquipmentChecked: t.safety_equipment_checked || null,
    });
    res.status(210).json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Task
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(tasks).where(eq(tasks.id, id));
    res.json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT Task status
app.put("/api/tasks/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await db.update(tasks).set({ status }).where(eq(tasks.id, id));
    res.json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT Client complete details
app.put("/api/clients/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const c = req.body;
    await db.update(clients).set({
      clientName: c.client_name,
      clientType: c.client_type || null,
      industry: c.industry || null,
      gstNumber: c.gst_number || null,
      website: c.website || null,
      headOfficeAddress: c.head_office_address || null,
      primaryContactName: c.primary_contact_name || null,
      designation: c.designation || null,
      mobile: c.mobile,
      email: c.email || null,
      decisionMaker: c.decision_maker || null,
      accountsContactCol: c.accounts_contact || null,
      leadSource: c.lead_source || null,
      clientStatus: c.client_status || 'ACTIVE',
      notes: c.notes || null,

      // compatibility
      companyName: c.company_name || c.client_name || null,
      address: c.address || c.head_office_address || null,
    }).where(eq(clients.id, id));
    res.json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT Site complete details
app.put("/api/sites/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const s = req.body;
    await db.update(sites).set({
      clientId: s.client_id || null,
      clientName: s.client_name || null,
      siteName: s.site_name,
      customerName: s.customer_name,
      contactPerson: s.contact_person || null,
      contactPhone: s.contact_phone || null,
      contactEmail: s.contact_email || null,
      address: s.address,
      city: s.city || null,
      state: s.state || null,
      postalCode: s.postal_code || null,
      siteType: s.site_type || null,
      propertyType: s.property_type || null,
      serviceZone: s.service_zone || null,
      landmark: s.landmark || null,
      accessInstructions: s.access_instructions || null,
      preferredVisitTime: s.preferred_visit_time || null,
      equipmentSummary: s.equipment_summary || null,
      assignedManagerId: s.assigned_manager_id || null,
      status: s.status,

      pincode: s.pincode || null,
      siteContactPerson: s.site_contact_person || s.contact_person || null,
      mobile: s.mobile || s.contact_phone || null,
      email: s.email || s.contact_email || null,
      totalArea: s.total_area || null,
      numberOfFloors: s.number_of_floors || null,
      existingHvac: s.existing_hvac || null,
      existingBrand: s.existing_brand || null,
      existingCapacity: s.existing_capacity || null,
      amcRequired: s.amc_required || null,
    }).where(eq(sites.id, id));
    res.json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT Project complete details
app.put("/api/projects/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const p = req.body;
    await db.update(projects).set({
      name: p.name,
      customerName: p.customer_name,
      serviceAddress: p.service_address || null,
      equipmentType: p.equipment_type || null,
      jobType: p.job_type || null,
      description: p.description || null,
      ownerId: p.owner_id || null,
      startDate: p.start_date || null,
      endDate: p.end_date || null,
      status: p.status,

      clientId: p.client_id || null,
      siteId: p.site_id || null,
      leadId: p.lead_id || null,
      projectCategory: p.project_category || null,
      priority: p.priority || null,

      quotationNumber: p.quotation_number || null,
      contractValue: p.contract_value || null,
      approvedValue: p.approved_value || null,
      advanceReceived: p.advance_received || null,
      paymentTerms: p.payment_terms || null,
      amcIncluded: p.amc_included || null,
      warranty: p.warranty || null,

      plannedStartDate: p.planned_start_date || null,
      plannedEndDate: p.planned_end_date || null,
      actualStartDate: p.actual_start_date || null,
      actualEndDate: p.actual_end_date || null,
      progressPct: p.progress_pct !== undefined ? Number(p.progress_pct) : null,

      projectManagerId: p.project_manager_id || null,
      siteEngineerId: p.site_engineer_id || null,
      supervisorId: p.supervisor_id || null,
      technicianCount: p.technician_count !== undefined ? Number(p.technician_count) : null,
      contractor: p.contractor || null,

      hvacType: p.hvac_type || null,
      brand: p.brand || null,
      capacity: p.capacity || null,
      indoorUnits: p.indoor_units !== undefined ? Number(p.indoor_units) : null,
      outdoorUnits: p.outdoor_units !== undefined ? Number(p.outdoor_units) : null,
      copperPipeLength: p.copper_pipe_length || null,
      drainPipeLength: p.drain_pipe_length || null,
      freshAirSystem: p.fresh_air_system || null,
    }).where(eq(projects.id, id));
    res.json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT Task complete details
app.put("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const t = req.body;
    await db.update(tasks).set({
      title: t.title,
      description: t.description || null,
      projectId: t.project_id,
      assigneeId: t.assignee_id || null,
      dueDate: t.due_date || null,
      status: t.status,
      priority: t.priority,

      notes: t.notes || null,
      checklist: t.checklist || null,
      toolsNeeded: t.tools_needed || null,
      materialsUsed: t.materials_used || null,
      startTime: t.start_time || null,
      completionTime: t.completion_time || null,
      weatherCondition: t.weather_condition || null,
      safetyEquipmentChecked: t.safety_equipment_checked || null,
    }).where(eq(tasks.id, id));
    res.json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT Employee complete details
app.put("/api/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const emp = req.body;
    await db.update(employees).set({
      employeeCode: emp.employee_code,
      aadharNumber: emp.aadhar_number || null,
      firstName: emp.first_name || null,
      lastName: emp.last_name || null,
      name: emp.name,
      dateOfBirth: emp.date_of_birth || null,
      gender: emp.gender || null,
      email: emp.email || null,
      phone: emp.phone || null,
      address: emp.address || null,
      city: emp.city || null,
      state: emp.state || null,
      postalCode: emp.postal_code || null,
      hireDate: emp.hire_date || null,
      employmentStatus: emp.employment_status || null,
      departmentId: emp.department_id || null,
      departmentName: emp.department_name || null,
      managerId: emp.manager_id || null,
      jobTitle: emp.job_title || null,
      title: emp.title || null,
      department: emp.department || null,
      dailyWage: emp.daily_wage || null,
      dailyIncentiveEarned: emp.daily_incentive_earned || null,
      hourlyRate: emp.hourly_rate || null,
      salary: emp.salary || null,
      profilePhoto: emp.profile_photo || null,
      serviceArea: emp.service_area || '',
      skills: emp.skills || null,
      certifications: emp.certifications || null,
      availability: emp.availability || 'AVAILABLE',
      status: emp.status || 'ACTIVE',
      plateNumber: emp.plate_number || null,
      make: emp.make || null,
      model: emp.model || null,
      year: emp.year || null,
    }).where(eq(employees.id, id));
    res.json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// Serve static assets out of /dist when compiled for production, otherwise use Vite's Dev Server middleware
async function startServer() {
  // Try connecting or seeding the DB at startup
  dbConnected = await initDb();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Express Fullstack server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Fatal server startup error:", err);
});

