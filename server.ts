import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { db, pool } from "./src/db/index.ts";
import { sql } from "drizzle-orm";
import { departments, employees, employeeSkills, clients, clientContacts, sites, projects, tasks, hvacCatalog, vendors, clientTypeIndustryMapping } from "./src/db/schema.ts";
import { eq } from "drizzle-orm";
import { CLIENT_INDUSTRY_MAPPING } from "./src/data/clientMapping.ts";

// Mock data to seed if DB is empty
import { 
  mockDepartments, 
  mockEmployees, 
  mockEmployeeSkills, 
  mockClients, 
  mockSites, 
  mockProjects, 
  mockTasks,
  mockHvacCatalog
} from "./src/mockData.ts";

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize DB schema and seed with custom data if empty
let dbConnected = false;

// Robust fallback in-memory users list if database is offline or not configured
const inMemoryUsers: any[] = [
  {
    id: "u-admin",
    email: "aijaz523@gmail.com",
    password: "admin123",
    role: "admin",
    name: "Aijaz (Admin)",
    phone: "+91-9999999999",
    status: "ACTIVE"
  },
  {
    id: "u-tech",
    email: "tech@supercool.com",
    password: "user123",
    role: "user",
    name: "Field Technician",
    phone: "+91-8888888888",
    status: "ACTIVE"
  }
];

async function initDb() {
  const hasDbUrl = !!(
    process.env.NEON_DATABASE_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.PGHOST
  );
  if (!hasDbUrl) {
    console.warn("⚠️ Database connection environment variable is not configured. Database features will be unavailable.");
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

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS salary_transfer_logs (
        id TEXT PRIMARY KEY,
        payroll_id TEXT REFERENCES payroll(id) ON DELETE CASCADE,
        employee_id TEXT REFERENCES employees(id) ON DELETE CASCADE,
        amount INTEGER,
        transfer_date TEXT,
        payroll_month TEXT,
        reference_number TEXT,
        payment_method TEXT
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS quotations (
        id TEXT PRIMARY KEY,
        quotation_number TEXT NOT NULL,
        client_id TEXT,
        client_name TEXT,
        project_id TEXT,
        project_name TEXT,
        quotation_date TEXT,
        valid_until TEXT,
        status TEXT,
        subtotal REAL,
        tax_rate REAL,
        tax_amount REAL,
        discount_amount REAL,
        grand_total REAL,
        terms_conditions TEXT,
        notes TEXT,
        items TEXT
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id TEXT PRIMARY KEY,
        po_number TEXT NOT NULL,
        vendor_name TEXT NOT NULL,
        vendor_address TEXT,
        vendor_gst TEXT,
        client_id TEXT,
        client_name TEXT,
        project_id TEXT,
        project_name TEXT,
        po_date TEXT,
        delivery_date TEXT,
        status TEXT,
        subtotal REAL,
        tax_rate REAL,
        tax_amount REAL,
        shipping_handling REAL,
        grand_total REAL,
        payment_terms TEXT,
        notes TEXT,
        items TEXT,
        delivery_address TEXT,
        vendor_contact_person TEXT,
        quotation_id TEXT,
        quotation_number TEXT
      );
    `);

    // Ensure columns exist on already created tables
    await db.execute(sql`
      ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS delivery_address TEXT;
      ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS vendor_contact_person TEXT;
      ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS quotation_id TEXT;
      ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS quotation_number TEXT;
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS vendors (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT,
        gst TEXT,
        contact_person TEXT,
        phone TEXT,
        email TEXT
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS client_type_industry_mapping (
        id TEXT PRIMARY KEY,
        client_type TEXT NOT NULL,
        industry TEXT NOT NULL
      );
    `);

    await db.execute(sql`
      DROP TABLE IF EXISTS users CASCADE;
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        status TEXT,
        employee_id TEXT REFERENCES employees(id) ON DELETE CASCADE
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS login_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        email TEXT,
        action TEXT,
        ip_address TEXT,
        user_agent TEXT,
        timestamp TEXT
      );
    `);

    await db.execute(sql`
      DROP TABLE IF EXISTS hvac_catalog CASCADE;
      CREATE TABLE hvac_catalog (
        fcu TEXT PRIMARY KEY,
        description TEXT NOT NULL,
        is_favorite INTEGER DEFAULT 0,
        series TEXT,
        type TEXT,
        technology TEXT,
        mode TEXT,
        star_rating TEXT,
        refrigerant TEXT,
        power_supply TEXT,
        cooling_tr TEXT,
        heating_tr TEXT,
        cu TEXT,
        mrp_set_base TEXT,
        dbp_without_tax TEXT,
        discount TEXT,
        unit_price_wo_tax TEXT,
        nlc_gst_paid TEXT
      );
    `);

    console.log("✅ PostgreSQL Tables successfully checked & synced.");

    // Permanently remove SPC002, SPC003, SPC004, SPC005, SPC006 and associated data if they exist
    const targetCodes = ['SPC002', 'SPC003', 'SPC004', 'SPC005', 'SPC006'];
    for (const code of targetCodes) {
      try {
        const res = await db.execute(sql`SELECT id FROM employees WHERE employee_code = ${code}`);
        if (res.rows && res.rows.length > 0) {
          const empId = String(res.rows[0].id);
          console.log(`Permanently deleting employee ${code} (ID: ${empId}) and associated rows...`);
          // Clear foreign key references in tasks and projects to allow safe deletion
          await db.execute(sql`UPDATE tasks SET assignee_id = NULL WHERE assignee_id = ${empId}`);
          await db.execute(sql`UPDATE projects SET project_manager_id = NULL WHERE project_manager_id = ${empId}`);
          await db.execute(sql`UPDATE projects SET site_engineer_id = NULL WHERE site_engineer_id = ${empId}`);
          await db.execute(sql`UPDATE projects SET supervisor_id = NULL WHERE supervisor_id = ${empId}`);
          
          // Delete referencing records
          await db.execute(sql`DELETE FROM employee_skills WHERE employee_id = ${empId}`);
          await db.execute(sql`DELETE FROM attendance WHERE employee_id = ${empId}`);
          await db.execute(sql`DELETE FROM leave_requests WHERE employee_id = ${empId}`);
          await db.execute(sql`DELETE FROM leave_balances WHERE employee_id = ${empId}`);
          await db.execute(sql`DELETE FROM salary_structures WHERE employee_id = ${empId}`);
          await db.execute(sql`DELETE FROM payroll WHERE employee_id = ${empId}`);
          await db.execute(sql`DELETE FROM salary_transfer_logs WHERE employee_id = ${empId}`);
          
          // Delete the employee record itself
          await db.execute(sql`DELETE FROM employees WHERE id = ${empId}`);
        }
      } catch (delErr: any) {
        console.warn(`Could not delete employee with code ${code}:`, delErr.message);
      }
    }

    // Seed default users (Admin and a regular user)
    try {
      const adminCheck = await db.execute(sql`SELECT id FROM users WHERE email = 'aijaz523@gmail.com'`);
      if (!adminCheck.rows || adminCheck.rows.length === 0) {
        console.log("Seeding default admin user (aijaz523@gmail.com)...");
        await db.execute(sql`
          INSERT INTO users (id, email, password, role, name, phone, status)
          VALUES ('u-admin', 'aijaz523@gmail.com', 'admin123', 'admin', 'Aijaz (Admin)', '+91-9999999999', 'ACTIVE')
        `);
      }

      const userCheck = await db.execute(sql`SELECT id FROM users WHERE email = 'tech@supercool.com'`);
      if (!userCheck.rows || userCheck.rows.length === 0) {
        console.log("Seeding default standard user (tech@supercool.com)...");
        await db.execute(sql`
          INSERT INTO users (id, email, password, role, name, phone, status)
          VALUES ('u-tech', 'tech@supercool.com', 'user123', 'user', 'Field Technician', '+91-8888888888', 'ACTIVE')
        `);
      }
    } catch (userSeedErr: any) {
      console.warn("Could not seed default users:", userSeedErr.message);
    }

    // Always synchronize departments, employees, and skills (using onConflictDoNothing)
    console.log("🌱 Syncing departments, employees, and skills...");
    
    // Load departments
    for (const d of mockDepartments) {
      await db.insert(departments).values(d).onConflictDoNothing();
    }

    // Load vendors
    const initialVendors = [
      {
        id: "v-daikin",
        name: "M/S DAIKIN AIRCONDITIONING INDIA PVT LTD",
        address: "12th Floor, Building No. 9, Tower A, DLF Cyber City, Phase III, Gurgaon, Haryana 122002",
        gst: "06AADCD1234F1Z9",
        contactPerson: "MR ANKIT SHARMA",
        phone: "+91-9876543210",
        email: "sales.delhi@daikinindia.com"
      },
      {
        id: "v-voltas",
        name: "M/S VOLTAS LIMITED",
        address: "A-43, NH-19 BLOCK B, MOHAN COOPERATIVE BADARPUR DELHI 110044",
        gst: "07AAAAA1111A1Z1",
        contactPerson: "MR SIDDHARTH",
        phone: "+91-9988776655",
        email: "siddharth.delhi@voltas.com"
      }
    ];
    for (const v of initialVendors) {
      await db.insert(vendors).values(v).onConflictDoNothing();
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

    // Auto-create user accounts for all employees
    console.log("👤 Creating user accounts for all employees with password 'user123'...");
    let allEmpsToUserSync: any[] = [...mockEmployees];
    try {
      const dbEmps = await db.execute(sql`SELECT * FROM employees`);
      if (dbEmps.rows && dbEmps.rows.length > 0) {
        allEmpsToUserSync = dbEmps.rows.map((row: any) => ({
          id: row.id,
          employee_code: row.employee_code || row.employeeCode,
          email: row.email,
          name: row.name,
          phone: row.phone
        }));
      }
    } catch (e: any) {
      console.warn("Could not retrieve existing employees for user sync, using mock list:", e.message);
    }

    for (const e of allEmpsToUserSync) {
      const email = (e.email && e.email.trim()) 
        ? e.email.trim().toLowerCase() 
        : `${(e.employee_code || e.id).toLowerCase()}@supercool.com`;
      const userId = `u-emp-${e.id}`;
      const name = e.name;
      const phone = e.phone || null;
      
      const exists = inMemoryUsers.some(u => u.email.toLowerCase() === email);
      if (!exists) {
        const newUser = {
          id: userId,
          email,
          password: "user123",
          role: "user",
          name,
          phone,
          status: "ACTIVE",
          employeeId: e.id
        };
        inMemoryUsers.push(newUser);
      }

      // Insert into database since we are in initDb
      try {
        const check = await db.execute(sql`SELECT id FROM users WHERE LOWER(email) = ${email}`);
        if (!check.rows || check.rows.length === 0) {
          await db.execute(sql`
            INSERT INTO users (id, email, password, role, name, phone, status, employee_id)
            VALUES (${userId}, ${email}, 'user123', 'user', ${name}, ${phone}, 'ACTIVE', ${e.id})
          `);
        } else {
          // update employee_id on existing users if not set
          await db.execute(sql`
            UPDATE users SET employee_id = ${e.id} WHERE LOWER(email) = ${email} AND employee_id IS NULL
          `);
        }
      } catch (dbErr: any) {
        console.warn(`Failed to auto-create user for employee ${e.name}:`, dbErr.message);
      }
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

    // Load HVAC Catalog
    console.log("🌱 Syncing HVAC Catalog items...");
    try {
      await db.execute(sql`DELETE FROM hvac_catalog`);
      console.log("Cleared old hvac_catalog items successfully.");
    } catch (clearErr) {
      console.warn("Could not clear hvac_catalog (it may be empty or not created yet):", clearErr);
    }
    for (const item of mockHvacCatalog) {
      await db.insert(hvacCatalog).values({
        fcu: item.fcu || item.sku || "",
        description: item.description,
        isFavorite: item.isFavorite ? 1 : 0,
        series: item.series || "",
        type: item.type || "",
        technology: item.technology || "",
        mode: item.mode || "",
        starRating: item.starRating || "",
        refrigerant: item.refrigerant || "",
        powerSupply: item.powerSupply || "",
        coolingTr: item.coolingTr || "",
        heatingTr: item.heatingTr || "",
        cu: item.cu || "",
        mrpSetBase: item.mrpSetBase || "0",
        dbpWithoutTax: item.dbpWithoutTax || "0",
        discount: item.discount || "",
        unitPriceWoTax: item.unitPriceWoTax || "0",
        nlcGstPaid: item.nlcGstPaid || "0"
      }).onConflictDoNothing();
    }

    // Load Client Type & Industry reference mappings
    console.log("🌱 Syncing Client Type & Industry reference mappings...");
    try {
      await db.execute(sql`DELETE FROM client_type_industry_mapping`);
      console.log("Cleared old client_type_industry_mapping items.");
    } catch (clearErr) {
      console.warn("Could not clear client_type_industry_mapping:", clearErr);
    }
    let mapId = 1;
    for (const item of CLIENT_INDUSTRY_MAPPING) {
      await db.insert(clientTypeIndustryMapping).values({
        id: `m-${mapId++}`,
        clientType: item.clientType,
        industry: item.industry
      }).onConflictDoNothing();
    }

    // Load default leave balances
    for (const e of mockEmployees) {
      const lbId = `lb-${e.id}`;
      await db.execute(sql`
        INSERT INTO leave_balances (id, employee_id, year, casual_leave_balance, sick_leave_balance, earned_leave_balance, total_leave_balance)
        VALUES (${lbId}, ${e.id}, 2026, 12, 8, 15, 35)
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    // Check if empty, and seed remaining tables
    const employeeCountResult = await db.execute(sql`SELECT count(*) FROM employees`);
    const count = parseInt(String(employeeCountResult.rows[0]?.count || '0'), 10);
    
    // Since we just loaded employees, count will be at least the number of mockEmployees.
    // Let's check client count to determine if we need to seed transactional tables.
    const clientCountResult = await db.execute(sql`SELECT count(*) FROM clients`);
    const clientCount = parseInt(String(clientCountResult.rows[0]?.count || '0'), 10);

    if (clientCount === 0) {
      console.log("🌱 Database transactional tables are empty! Auto-seeding remaining mock records...");

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
  const isEnvConfigured = !!(
    process.env.NEON_DATABASE_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.PGHOST
  );
  if (!isEnvConfigured) {
    return res.json({
      connected: false,
      configured: false,
      message: "Database environment variable (e.g. DATABASE_URL) is missing."
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
    await db.execute(sql`DELETE FROM hvac_catalog`);

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
    const rawCatalogItems = await db.select().from(hvacCatalog);
    const rawVendors = await db.select().from(vendors);

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
    let rawSalaryTransfers: any[] = [];
    let rawQuotations: any[] = [];
    let rawPurchaseOrders: any[] = [];
    let rawClientMappings: any[] = CLIENT_INDUSTRY_MAPPING.map((m, i) => ({ id: `m-${i+1}`, clientType: m.clientType, industry: m.industry }));
    let rawUsers: any[] = [];

    if (dbConnected) {
      try {
        const usersRes = await db.execute(sql`SELECT * FROM users`);
        rawUsers = usersRes.rows || [];
      } catch (e) {
        console.warn("Could not query users:", e);
      }
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
      try {
        const transferRes = await db.execute(sql`SELECT * FROM salary_transfer_logs`);
        rawSalaryTransfers = transferRes.rows || [];
      } catch (e) {
        console.warn("Could not query salary_transfer_logs:", e);
      }
      try {
        const qRes = await db.execute(sql`SELECT * FROM quotations`);
        rawQuotations = qRes.rows || [];
      } catch (e) {
        console.warn("Could not query quotations:", e);
      }
      try {
        const poRes = await db.execute(sql`SELECT * FROM purchase_orders`);
        rawPurchaseOrders = poRes.rows || [];
      } catch (e) {
        console.warn("Could not query purchase_orders:", e);
      }
      try {
        const mappingRes = await db.select().from(clientTypeIndustryMapping);
        if (mappingRes && mappingRes.length > 0) {
          rawClientMappings = mappingRes;
        }
      } catch (e) {
        console.warn("Could not query client_type_industry_mapping:", e);
      }
    }

    if (!rawUsers || rawUsers.length === 0) {
      rawUsers = inMemoryUsers;
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
      })),
      quotations: rawQuotations.map(q => ({
        id: q.id,
        quotation_number: q.quotation_number,
        client_id: q.client_id,
        client_name: q.client_name,
        project_id: q.project_id,
        project_name: q.project_name,
        quotation_date: q.quotation_date,
        valid_until: q.valid_until,
        status: q.status,
        subtotal: Number(q.subtotal || 0),
        tax_rate: Number(q.tax_rate || 0),
        tax_amount: Number(q.tax_amount || 0),
        discount_amount: Number(q.discount_amount || 0),
        grand_total: Number(q.grand_total || 0),
        terms_conditions: q.terms_conditions,
        notes: q.notes,
        items: typeof q.items === 'string' ? JSON.parse(q.items) : (q.items || [])
      })),
      purchaseOrders: rawPurchaseOrders.map(po => ({
        id: po.id,
        po_number: po.po_number,
        vendor_name: po.vendor_name,
        vendor_address: po.vendor_address,
        vendor_gst: po.vendor_gst,
        client_id: po.client_id,
        client_name: po.client_name,
        project_id: po.project_id,
        project_name: po.project_name,
        po_date: po.po_date,
        delivery_date: po.delivery_date,
        status: po.status,
        subtotal: Number(po.subtotal || 0),
        tax_rate: Number(po.tax_rate || 0),
        tax_amount: Number(po.tax_amount || 0),
        shipping_handling: Number(po.shipping_handling || 0),
        grand_total: Number(po.grand_total || 0),
        payment_terms: po.payment_terms,
        notes: po.notes,
        items: typeof po.items === 'string' ? JSON.parse(po.items) : (po.items || []),
        delivery_address: po.delivery_address,
        vendor_contact_person: po.vendor_contact_person,
        quotation_id: po.quotation_id,
        quotation_number: po.quotation_number
      })),
      vendors: rawVendors.map(v => ({
        id: v.id,
        name: v.name,
        address: v.address || '',
        gst: v.gst || '',
        contact_person: v.contactPerson || '',
        phone: v.phone || '',
        email: v.email || ''
      })),
      salaryTransfers: rawSalaryTransfers.map(st => ({
        id: st.id,
        payroll_id: st.payroll_id,
        employee_id: st.employee_id,
        amount: Number(st.amount || 0),
        transfer_date: st.transfer_date,
        payroll_month: st.payroll_month,
        reference_number: st.reference_number,
        payment_method: st.payment_method
      })),
      hvacCatalog: rawCatalogItems.map(mapDbToCatalogItem),
      clientTypeIndustryMapping: rawClientMappings.map(m => ({
        id: m.id,
        clientType: m.clientType,
        industry: m.industry
      })),
      users: rawUsers.map(u => ({
        id: u.id,
        email: u.email,
        password: u.password, // Include password for admin fetching/editing
        role: u.role,
        name: u.name,
        phone: u.phone,
        status: u.status
      }))
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to load database records." });
  }
});

// --- AUTH & USER ENDPOINTS ---

// Login Endpoint
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user: any = null;

    if (dbConnected) {
      try {
        const result = await db.execute(sql`SELECT * FROM users WHERE LOWER(email) = ${cleanEmail}`);
        if (result.rows && result.rows.length > 0) {
          user = result.rows[0];
        }
      } catch (err) {
        console.warn("Could not login via database, falling back to memory:", err);
      }
    }

    // Fallback to check inMemoryUsers
    if (!user) {
      user = inMemoryUsers.find(u => u.email.toLowerCase() === cleanEmail);
    }

    const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "");
    const ua = String(req.headers["user-agent"] || "");
    const ts = new Date().toISOString();

    if (!user) {
      if (dbConnected) {
        try {
          const logId = `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          await db.execute(sql`
            INSERT INTO login_logs (id, user_id, email, action, ip_address, user_agent, timestamp)
            VALUES (${logId}, NULL, ${cleanEmail}, 'LOGIN_FAILURE_NOT_FOUND', ${ip}, ${ua}, ${ts})
          `);
        } catch (logErr) {
          console.warn("Failed to write login log:", logErr);
        }
      }
      return res.status(401).json({ error: "Invalid email or password." });
    }

    if (user.password !== password) {
      if (dbConnected) {
        try {
          const logId = `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          await db.execute(sql`
            INSERT INTO login_logs (id, user_id, email, action, ip_address, user_agent, timestamp)
            VALUES (${logId}, ${user.id}, ${cleanEmail}, 'LOGIN_FAILURE_WRONG_PASSWORD', ${ip}, ${ua}, ${ts})
          `);
        } catch (logErr) {
          console.warn("Failed to write login log:", logErr);
        }
      }
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Write login success log
    if (dbConnected) {
      try {
        const logId = `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        await db.execute(sql`
          INSERT INTO login_logs (id, user_id, email, action, ip_address, user_agent, timestamp)
          VALUES (${logId}, ${user.id}, ${cleanEmail}, 'LOGIN_SUCCESS', ${ip}, ${ua}, ${ts})
        `);
      } catch (logErr) {
        console.warn("Failed to write login log:", logErr);
      }
    }

    res.json({
      status: "success",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        phone: user.phone,
        status: user.status
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Login failed." });
  }
});

// Register Endpoint
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password, and name are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    let exists = false;

    // 1. Check if user exists in database
    if (dbConnected) {
      try {
        const existsRes = await db.execute(sql`SELECT id FROM users WHERE LOWER(email) = ${cleanEmail}`);
        if (existsRes.rows && existsRes.rows.length > 0) {
          exists = true;
        }
      } catch (err) {
        console.warn("Database check for existing user failed, checking memory:", err);
      }
    }

    // 2. Check in memory
    if (!exists) {
      exists = inMemoryUsers.some(u => u.email.toLowerCase() === cleanEmail);
    }

    if (exists) {
      return res.status(400).json({ error: "A user with this email already exists." });
    }

    // Role promotion if admin email matching
    const role = cleanEmail === 'aijaz523@gmail.com' ? 'admin' : 'user';
    const userId = `u-${Date.now()}`;
    const newUser = {
      id: userId,
      email: cleanEmail,
      password,
      role,
      name,
      phone: phone || null,
      status: 'ACTIVE'
    };

    // Save to memory cache
    inMemoryUsers.push(newUser);

    // Save to database if connected
    if (dbConnected) {
      try {
        await db.execute(sql`
          INSERT INTO users (id, email, password, role, name, phone, status)
          VALUES (${userId}, ${cleanEmail}, ${password}, ${role}, ${name}, ${phone || null}, 'ACTIVE')
        `);

        // Log registration log
        const logId = `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "");
        const ua = String(req.headers["user-agent"] || "");
        const ts = new Date().toISOString();
        await db.execute(sql`
          INSERT INTO login_logs (id, user_id, email, action, ip_address, user_agent, timestamp)
          VALUES (${logId}, ${userId}, ${cleanEmail}, 'REGISTER_SUCCESS', ${ip}, ${ua}, ${ts})
        `);
      } catch (dbErr: any) {
        console.error("Failed to insert registered user into database:", dbErr);
      }
    }

    res.json({
      status: "success",
      user: {
        id: userId,
        email: cleanEmail,
        role,
        name,
        phone,
        status: 'ACTIVE'
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Registration failed." });
  }
});

// List Users (Including password for admin configuration view)
app.get("/api/users", async (req, res) => {
  try {
    let dbUsers: any[] = [];
    if (dbConnected) {
      try {
        const result = await db.execute(sql`SELECT id, email, password, role, name, phone, status, employee_id FROM users`);
        dbUsers = result.rows || [];
      } catch (err) {
        console.warn("Failed to fetch users from database, using memory cache:", err);
      }
    }

    if (dbUsers.length === 0) {
      dbUsers = inMemoryUsers;
    }

    res.json(dbUsers.map(u => ({
      id: u.id,
      email: u.email,
      password: u.password, // Return password so admin can view/verify it
      role: u.role,
      name: u.name,
      phone: u.phone,
      status: u.status,
      employeeId: u.employeeId || u.employee_id || null
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch users." });
  }
});

// Delete User
app.delete("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Delete from memory
    const memIdx = inMemoryUsers.findIndex(u => u.id === id);
    if (memIdx !== -1) {
      inMemoryUsers.splice(memIdx, 1);
    }

    // Delete from database
    if (dbConnected) {
      await db.execute(sql`DELETE FROM users WHERE id = ${id}`);
    }

    res.json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to delete user." });
  }
});

// Update User
app.put("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { role, name, phone, status, password } = req.body;

    // Update in-memory user
    const memUser = inMemoryUsers.find(u => u.id === id);
    if (memUser) {
      if (role !== undefined) memUser.role = role;
      if (name !== undefined) memUser.name = name;
      if (phone !== undefined) memUser.phone = phone;
      if (status !== undefined) memUser.status = status;
      if (password !== undefined) memUser.password = password;
    }

    // Update in database
    if (dbConnected) {
      if (password) {
        await db.execute(sql`
          UPDATE users 
          SET role = COALESCE(${role}, role), 
              name = COALESCE(${name}, name), 
              phone = COALESCE(${phone}, phone), 
              status = COALESCE(${status}, status),
              password = ${password}
          WHERE id = ${id}
        `);
      } else {
        await db.execute(sql`
          UPDATE users 
          SET role = COALESCE(${role}, role), 
              name = COALESCE(${name}, name), 
              phone = COALESCE(${phone}, phone), 
              status = COALESCE(${status}, status)
          WHERE id = ${id}
        `);
      }
    }

    res.json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update user." });
  }
});

// Client Type & Industry Mapping Reference Table Endpoints
app.get("/api/client-mappings", async (req, res) => {
  try {
    const rawMappings = await db.select().from(clientTypeIndustryMapping);
    res.json(rawMappings.map(m => ({
      id: m.id,
      clientType: m.clientType,
      industry: m.industry
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch client mappings." });
  }
});

app.post("/api/client-mappings", async (req, res) => {
  try {
    const { id, clientType, industry } = req.body;
    if (!clientType || !industry) {
      return res.status(400).json({ error: "clientType and industry are required." });
    }
    const mappingId = id || `m-${Date.now()}`;
    await db.insert(clientTypeIndustryMapping).values({
      id: mappingId,
      clientType,
      industry
    }).onConflictDoNothing();
    res.status(251).json({ status: "ok", id: mappingId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/client-mappings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(clientTypeIndustryMapping).where(eq(clientTypeIndustryMapping.id, id));
    res.json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
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
    await pool.query('DELETE FROM attendance WHERE id = $1', [id]);
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
    await pool.query('DELETE FROM leave_requests WHERE id = $1', [id]);
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

    if (payment_status === 'Paid') {
      // Fetch the payroll details
      const payRes = await db.execute(sql`SELECT * FROM payroll WHERE id = ${id}`);
      if (payRes.rows && payRes.rows.length > 0) {
        const pay = payRes.rows[0] as any;
        
        // Check if a transfer log for this payroll already exists to avoid duplicates
        const logCheck = await db.execute(sql`SELECT * FROM salary_transfer_logs WHERE payroll_id = ${id}`);
        if (!logCheck.rows || logCheck.rows.length === 0) {
          const logId = 'TFR-' + Math.random().toString(36).substring(2, 8).toUpperCase();
          const refNum = 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase();
          const pDate = payment_date || new Date().toISOString().split('T')[0];
          
          await db.execute(sql`
            INSERT INTO salary_transfer_logs (id, payroll_id, employee_id, amount, transfer_date, payroll_month, reference_number, payment_method)
            VALUES (${logId}, ${pay.id}, ${pay.employee_id}, ${pay.net_salary}, ${pDate}, ${pay.payroll_month}, ${refNum}, 'Bank Transfer')
          `);
        }
      }
    }

    res.json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Payroll sheet log
app.delete("/api/payroll/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM payroll WHERE id = $1', [id]);
    res.json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET Salary Transfer Logs
app.get("/api/salary-transfers", async (req, res) => {
  try {
    const tRes = await db.execute(sql`SELECT * FROM salary_transfer_logs`);
    const logs = tRes.rows || [];
    res.json(logs.map((st: any) => ({
      id: st.id,
      payroll_id: st.payroll_id,
      employee_id: st.employee_id,
      amount: Number(st.amount || 0),
      transfer_date: st.transfer_date,
      payroll_month: st.payroll_month,
      reference_number: st.reference_number,
      payment_method: st.payment_method
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST Salary Transfer Log
app.post("/api/salary-transfers", async (req, res) => {
  try {
    const { id, payroll_id, employee_id, amount, transfer_date, payroll_month, reference_number, payment_method } = req.body;
    const resolvedPayrollId = payroll_id && payroll_id.trim() !== '' ? payroll_id : null;
    await db.execute(sql`
      INSERT INTO salary_transfer_logs (id, payroll_id, employee_id, amount, transfer_date, payroll_month, reference_number, payment_method)
      VALUES (${id}, ${resolvedPayrollId}, ${employee_id}, ${amount}, ${transfer_date}, ${payroll_month}, ${reference_number}, ${payment_method})
    `);
    res.status(251).json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Salary Transfer Log
app.delete("/api/salary-transfers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute(sql`DELETE FROM salary_transfer_logs WHERE id = ${id}`);
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

    // Default leave balances for the new employee
    const lbId = `lb-${employee.id}`;
    await db.execute(sql`
      INSERT INTO leave_balances (id, employee_id, year, casual_leave_balance, sick_leave_balance, earned_leave_balance, total_leave_balance)
      VALUES (${lbId}, ${employee.id}, 2026, 12, 8, 15, 35)
      ON CONFLICT (id) DO NOTHING;
    `);

    // Auto-create user account for this new employee
    const email = (employee.email && employee.email.trim())
      ? employee.email.trim().toLowerCase()
      : `${(employee.employee_code || employee.id).toLowerCase()}@supercool.com`;
    const userId = `u-emp-${employee.id}`;
    const name = employee.name;
    const phone = employee.phone || null;

    const exists = inMemoryUsers.some(u => u.email.toLowerCase() === email);
    if (!exists) {
      inMemoryUsers.push({
        id: userId,
        email,
        password: "user123",
        role: "user",
        name,
        phone,
        status: "ACTIVE",
        employeeId: employee.id
      });
    }

    if (dbConnected) {
      try {
        const check = await db.execute(sql`SELECT id FROM users WHERE LOWER(email) = ${email}`);
        if (!check.rows || check.rows.length === 0) {
          await db.execute(sql`
            INSERT INTO users (id, email, password, role, name, phone, status, employee_id)
            VALUES (${userId}, ${email}, 'user123', 'user', ${name}, ${phone}, 'ACTIVE', ${employee.id})
          `);
        }
      } catch (dbErr: any) {
        console.warn(`Failed to auto-create user for newly added employee ${name}:`, dbErr.message);
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
    
    // Clear foreign key references in tasks and projects to allow safe deletion
    await pool.query('UPDATE tasks SET assignee_id = NULL WHERE assignee_id = $1', [id]);
    await pool.query('UPDATE projects SET project_manager_id = NULL WHERE project_manager_id = $1', [id]);
    await pool.query('UPDATE projects SET site_engineer_id = NULL WHERE site_engineer_id = $1', [id]);
    await pool.query('UPDATE projects SET supervisor_id = NULL WHERE supervisor_id = $1', [id]);
    
    // Safe sequential deletion across all referencing sub-records
    await pool.query('DELETE FROM employee_skills WHERE employee_id = $1', [id]);
    await pool.query('DELETE FROM attendance WHERE employee_id = $1', [id]);
    await pool.query('DELETE FROM leave_requests WHERE employee_id = $1', [id]);
    await pool.query('DELETE FROM leave_balances WHERE employee_id = $1', [id]);
    await pool.query('DELETE FROM salary_structures WHERE employee_id = $1', [id]);
    await pool.query('DELETE FROM payroll WHERE employee_id = $1', [id]);
    
    // Delete the final employee record itself
    await pool.query('DELETE FROM employees WHERE id = $1', [id]);
    
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

// Quotation REST Routes
app.post("/api/quotations", async (req, res) => {
  try {
    const { id, quotation_number, client_id, client_name, project_id, project_name, quotation_date, valid_until, status, subtotal, tax_rate, tax_amount, discount_amount, grand_total, terms_conditions, notes, items } = req.body;
    
    await pool.query(`
      INSERT INTO quotations (id, quotation_number, client_id, client_name, project_id, project_name, quotation_date, valid_until, status, subtotal, tax_rate, tax_amount, discount_amount, grand_total, terms_conditions, notes, items)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      ON CONFLICT (id) DO UPDATE SET
        quotation_number = EXCLUDED.quotation_number,
        client_id = EXCLUDED.client_id,
        client_name = EXCLUDED.client_name,
        project_id = EXCLUDED.project_id,
        project_name = EXCLUDED.project_name,
        quotation_date = EXCLUDED.quotation_date,
        valid_until = EXCLUDED.valid_until,
        status = EXCLUDED.status,
        subtotal = EXCLUDED.subtotal,
        tax_rate = EXCLUDED.tax_rate,
        tax_amount = EXCLUDED.tax_amount,
        discount_amount = EXCLUDED.discount_amount,
        grand_total = EXCLUDED.grand_total,
        terms_conditions = EXCLUDED.terms_conditions,
        notes = EXCLUDED.notes,
        items = EXCLUDED.items
    `, [id, quotation_number, client_id, client_name, project_id, project_name, quotation_date, valid_until, status, subtotal, tax_rate, tax_amount, discount_amount, grand_total, terms_conditions, notes, typeof items === 'string' ? items : JSON.stringify(items)]);
    
    res.json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/quotations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { quotation_number, client_id, client_name, project_id, project_name, quotation_date, valid_until, status, subtotal, tax_rate, tax_amount, discount_amount, grand_total, terms_conditions, notes, items } = req.body;
    
    await pool.query(`
      UPDATE quotations SET
        quotation_number = $1,
        client_id = $2,
        client_name = $3,
        project_id = $4,
        project_name = $5,
        quotation_date = $6,
        valid_until = $7,
        status = $8,
        subtotal = $9,
        tax_rate = $10,
        tax_amount = $11,
        discount_amount = $12,
        grand_total = $13,
        terms_conditions = $14,
        notes = $15,
        items = $16
      WHERE id = $17
    `, [quotation_number, client_id, client_name, project_id, project_name, quotation_date, valid_until, status, subtotal, tax_rate, tax_amount, discount_amount, grand_total, terms_conditions, notes, typeof items === 'string' ? items : JSON.stringify(items), id]);
    
    res.json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/quotations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM quotations WHERE id = $1', [id]);
    res.json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Purchase Order REST Routes
app.post("/api/purchase_orders", async (req, res) => {
  try {
    const { id, po_number, vendor_name, vendor_address, vendor_gst, client_id, client_name, project_id, project_name, po_date, delivery_date, status, subtotal, tax_rate, tax_amount, shipping_handling, grand_total, payment_terms, notes, items, delivery_address, vendor_contact_person, quotation_id, quotation_number } = req.body;
    
    await pool.query(`
      INSERT INTO purchase_orders (id, po_number, vendor_name, vendor_address, vendor_gst, client_id, client_name, project_id, project_name, po_date, delivery_date, status, subtotal, tax_rate, tax_amount, shipping_handling, grand_total, payment_terms, notes, items, delivery_address, vendor_contact_person, quotation_id, quotation_number)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
      ON CONFLICT (id) DO UPDATE SET
        po_number = EXCLUDED.po_number,
        vendor_name = EXCLUDED.vendor_name,
        vendor_address = EXCLUDED.vendor_address,
        vendor_gst = EXCLUDED.vendor_gst,
        client_id = EXCLUDED.client_id,
        client_name = EXCLUDED.client_name,
        project_id = EXCLUDED.project_id,
        project_name = EXCLUDED.project_name,
        po_date = EXCLUDED.po_date,
        delivery_date = EXCLUDED.delivery_date,
        status = EXCLUDED.status,
        subtotal = EXCLUDED.subtotal,
        tax_rate = EXCLUDED.tax_rate,
        tax_amount = EXCLUDED.tax_amount,
        shipping_handling = EXCLUDED.shipping_handling,
        grand_total = EXCLUDED.grand_total,
        payment_terms = EXCLUDED.payment_terms,
        notes = EXCLUDED.notes,
        items = EXCLUDED.items,
        delivery_address = EXCLUDED.delivery_address,
        vendor_contact_person = EXCLUDED.vendor_contact_person,
        quotation_id = EXCLUDED.quotation_id,
        quotation_number = EXCLUDED.quotation_number
    `, [id, po_number, vendor_name, vendor_address, vendor_gst, client_id, client_name, project_id, project_name, po_date, delivery_date, status, subtotal, tax_rate, tax_amount, shipping_handling, grand_total, payment_terms, notes, typeof items === 'string' ? items : JSON.stringify(items), delivery_address, vendor_contact_person, quotation_id, quotation_number]);
    
    res.json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/purchase_orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { po_number, vendor_name, vendor_address, vendor_gst, client_id, client_name, project_id, project_name, po_date, delivery_date, status, subtotal, tax_rate, tax_amount, shipping_handling, grand_total, payment_terms, notes, items, delivery_address, vendor_contact_person, quotation_id, quotation_number } = req.body;
    
    await pool.query(`
      UPDATE purchase_orders SET
        po_number = $1,
        vendor_name = $2,
        vendor_address = $3,
        vendor_gst = $4,
        client_id = $5,
        client_name = $6,
        project_id = $7,
        project_name = $8,
        po_date = $9,
        delivery_date = $10,
        status = $11,
        subtotal = $12,
        tax_rate = $13,
        tax_amount = $14,
        shipping_handling = $15,
        grand_total = $16,
        payment_terms = $17,
        notes = $18,
        items = $19,
        delivery_address = $20,
        vendor_contact_person = $21,
        quotation_id = $22,
        quotation_number = $23
      WHERE id = $24
    `, [po_number, vendor_name, vendor_address, vendor_gst, client_id, client_name, project_id, project_name, po_date, delivery_date, status, subtotal, tax_rate, tax_amount, shipping_handling, grand_total, payment_terms, notes, typeof items === 'string' ? items : JSON.stringify(items), delivery_address, vendor_contact_person, quotation_id, quotation_number, id]);
    
    res.json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/purchase_orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM purchase_orders WHERE id = $1', [id]);
    res.json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- HVAC CATALOG API ENDPOINTS ---

// Helper function to map database hvac_catalog row back to CatalogItem format for the client
function mapDbToCatalogItem(item: any) {
  const isDaikin = !!item.series;
  
  // Extract Name
  let name = "";
  if (isDaikin) {
    name = `Daikin ${item.series || ""} AC ${item.coolingTr || ""} TR (${item.fcu})`;
  } else {
    // For low-side, we stored "itemName [Unit: unit]. category - subCategory..." in description
    const firstDotIdx = item.description ? item.description.indexOf(". ") : -1;
    const namePart = firstDotIdx > -1 ? item.description.slice(0, firstDotIdx) : (item.description || "");
    const cleanName = namePart.replace(/\s*\[Unit:\s*[^\]]+\]/, "");
    name = cleanName || item.fcu || "Low Side Item";
  }

  // Extract Unit
  let unit = "set";
  if (!isDaikin && item.description) {
    const unitMatch = item.description.match(/\[Unit:\s*([^\]]+)\]/);
    if (unitMatch) {
      unit = unitMatch[1];
    }
  }

  // Extract Category
  let category = "Cassette";
  if (isDaikin) {
    const lowerType = (item.type || "").toLowerCase();
    if (lowerType.includes("ductable") || lowerType.includes("concealed")) {
      category = "Ductable";
    } else if (lowerType.includes("floor") || lowerType.includes("tower")) {
      category = "Floor Standing";
    }
  } else if (item.description) {
    const parts = item.description.split(". ");
    if (parts.length > 1) {
      const catSubcat = parts[1].split(" - ");
      if (catSubcat.length > 0) {
        category = catSubcat[0].trim();
      }
    }
  }

  // Extract Department
  const department = isDaikin ? "Major Components" : "LOW SIDE Material & Services";

  // Price
  const price = Number(item.unitPriceWoTax || 0);

  return {
    sku: item.fcu, // Map fcu as sku for frontend compatibility
    name,
    department,
    category,
    unit,
    price,
    description: item.description,
    isFavorite: item.isFavorite === 1,
    series: item.series || "",
    type: item.type || "",
    technology: item.technology || "",
    mode: item.mode || "",
    starRating: item.starRating || "",
    refrigerant: item.refrigerant || "",
    powerSupply: item.powerSupply || "",
    coolingTr: item.coolingTr || "",
    heatingTr: item.heatingTr || "",
    fcu: item.fcu || "",
    cu: item.cu || "",
    mrpSetBase: item.mrpSetBase || "0",
    dbpWithoutTax: item.dbpWithoutTax || "0",
    discount: item.discount || "",
    unitPriceWoTax: item.unitPriceWoTax || "0",
    nlcGstPaid: item.nlcGstPaid || "0"
  };
}

// GET /api/catalog
app.get("/api/catalog", async (req, res) => {
  try {
    const rawCatalog = await db.select().from(hvacCatalog);
    res.json(rawCatalog.map(mapDbToCatalogItem));
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to load catalog." });
  }
});

// POST /api/catalog
app.post("/api/catalog", async (req, res) => {
  try {
    const item = req.body;
    const fcu = item.fcu || item.sku || "";
    await db.insert(hvacCatalog).values({
      fcu,
      description: item.description,
      isFavorite: item.isFavorite ? 1 : 0,
      series: item.series || "",
      type: item.type || "",
      technology: item.technology || "",
      mode: item.mode || "",
      starRating: item.starRating || "",
      refrigerant: item.refrigerant || "",
      powerSupply: item.powerSupply || "",
      coolingTr: item.coolingTr || "",
      heatingTr: item.heatingTr || "",
      cu: item.cu || "",
      mrpSetBase: item.mrpSetBase || "0",
      dbpWithoutTax: item.dbpWithoutTax || "0",
      discount: item.discount || "",
      unitPriceWoTax: item.unitPriceWoTax || String(item.price || "0"),
      nlcGstPaid: item.nlcGstPaid || "0"
    });
    res.json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to create catalog item." });
  }
});

// PUT /api/catalog/:sku
app.put("/api/catalog/:sku", async (req, res) => {
  try {
    const sku = req.params.sku;
    const item = req.body;
    await db.update(hvacCatalog).set({
      description: item.description,
      isFavorite: item.isFavorite ? 1 : 0,
      series: item.series || "",
      type: item.type || "",
      technology: item.technology || "",
      mode: item.mode || "",
      starRating: item.starRating || "",
      refrigerant: item.refrigerant || "",
      powerSupply: item.powerSupply || "",
      coolingTr: item.coolingTr || "",
      heatingTr: item.heatingTr || "",
      cu: item.cu || "",
      mrpSetBase: item.mrpSetBase || "0",
      dbpWithoutTax: item.dbpWithoutTax || "0",
      discount: item.discount || "",
      unitPriceWoTax: item.unitPriceWoTax || String(item.price || "0"),
      nlcGstPaid: item.nlcGstPaid || "0"
    }).where(eq(hvacCatalog.fcu, sku));
    res.json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update catalog item." });
  }
});

// DELETE /api/catalog/:sku
app.delete("/api/catalog/:sku", async (req, res) => {
  try {
    const sku = req.params.sku;
    await db.delete(hvacCatalog).where(eq(hvacCatalog.fcu, sku));
    res.json({ status: "ok" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to delete catalog item." });
  }
});

// Serve static assets out of /dist when compiled for production, otherwise use Vite's Dev Server middleware
async function startServer() {
  // Try connecting or seeding the DB at startup
  dbConnected = await initDb();

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
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

// Export app for serverless deployment platforms like Vercel
export default app;

if (!process.env.VERCEL) {
  startServer().catch(err => {
    console.error("Fatal server startup error:", err);
  });
} else {
  // On Vercel, we still want to trigger the async database connection and schema sync once at cold start
  initDb().then(success => {
    dbConnected = success;
    console.log(`[Vercel Serverless] Database connected and synced: ${success}`);
  }).catch(err => {
    console.error("[Vercel Serverless] Failed to initialize DB:", err);
  });
}


