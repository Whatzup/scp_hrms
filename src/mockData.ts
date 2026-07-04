import { Department, Employee, EmployeeSkill, Client, Site, Project, Task, CatalogItem } from './types';

export const mockDepartments: Department[] = [
  { id: 'd1', name: 'Executive', description: 'Leadership team' },
  { id: 'd2', name: 'Operations', description: 'Operations management' },
  { id: 'd3', name: 'Field Operations', description: 'HVAC field supervisors' },
  { id: 'd4', name: 'Service', description: 'HVAC technicians' },
  { id: 'd5', name: 'Dispatch', description: 'Scheduling and customer coordination' },
];

export const mockEmployees: Employee[] = [
  {
    id: 'e1',
    employee_code: 'SPC001',
    aadhar_number: '111122223333',
    first_name: 'Priya',
    last_name: 'Raman',
    name: 'Priya Raman',
    date_of_birth: '1985-05-12',
    gender: 'FEMALE',
    email: 'priya@supercoolhvac.local',
    phone: '9000000001',
    address: 'Head Office, MG Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    postal_code: '560001',
    hire_date: '2020-01-10',
    employment_status: 'ACTIVE',
    department_id: 'd1',
    department_name: 'Executive',
    job_title: 'CEO',
    title: 'CEO',
    department: 'Executive',
    daily_wage: 9000,
    daily_incentive_earned: 1500,
    service_area: 'All zones',
    availability: 'AVAILABLE',
    status: 'ACTIVE'
  },
  {
    id: 'e7',
    employee_code: 'SPC007',
    aadhar_number: '288654659577',
    first_name: 'WAQUEEL',
    last_name: 'AHMAD',
    name: 'WAQUEEL AHMAD',
    date_of_birth: '1998-08-19',
    gender: 'MALE',
    email: 'waqueelahmad421@gmail.com',
    phone: '7988820811',
    address: 'village -Dhunela ,The-Sohna ,Distt-Gurugram',
    city: 'Gurugram',
    state: 'Haryana',
    postal_code: '122103',
    hire_date: '2024-05-08',
    employment_status: 'ACTIVE',
    department_id: 'd2',
    department_name: 'Operations',
    job_title: 'ADMIN',
    title: 'Assistant',
    department: 'Operations',
    daily_wage: 1500,
    daily_incentive_earned: 150,
    service_area: 'Gurugram',
    certifications: '{"emergency_name":"Ash mohd","emergency_relationship":"father","emergency_phone":"9813729862"}',
    availability: 'AVAILABLE',
    status: 'ACTIVE'
  },
  {
    id: 'e8',
    employee_code: 'SPC008',
    aadhar_number: '220747853398',
    first_name: 'AARTI',
    last_name: 'RAWAT',
    name: 'AARTI RAWAT',
    date_of_birth: '2000-07-03',
    gender: 'FEMALE',
    email: 'aaratisraawat036@gmail.com',
    phone: '8607979678',
    address: '2065/1 Railway colony Rohtak',
    city: 'Rohtak',
    state: 'Haryana',
    postal_code: '124001',
    hire_date: '2026-02-08',
    employment_status: 'ACTIVE',
    department_id: 'd2',
    department_name: 'Operations',
    job_title: 'ADMIN',
    title: 'Accountant',
    department: 'Operations',
    daily_wage: 2500,
    daily_incentive_earned: 300,
    service_area: 'Rohtak',
    certifications: '{"emergency_name":"Jagdev Kumar","emergency_relationship":"father","emergency_phone":"9992039413"}',
    availability: 'AVAILABLE',
    status: 'ACTIVE'
  },
  {
    id: 'e9',
    employee_code: 'SPC009',
    aadhar_number: '426220827901',
    first_name: 'TASLEEM',
    last_name: 'KHAN',
    name: 'TASLEEM KHAN',
    date_of_birth: '1996-12-10',
    gender: 'MALE',
    email: 'tasleemkhan8210@gmail.com',
    phone: '9991589090',
    address: 'Ferozepur Namak (156) , Mewat',
    city: 'Mewat',
    state: 'Haryana',
    postal_code: '122107',
    hire_date: '2025-12-29',
    employment_status: 'ACTIVE',
    department_id: 'd4',
    department_name: 'Service',
    job_title: 'TECHNICIAN',
    title: 'Technician',
    department: 'Service',
    daily_wage: 1800,
    daily_incentive_earned: 200,
    service_area: 'Mewat',
    certifications: '{"emergency_name":"Israil","emergency_relationship":"father","emergency_phone":""}',
    availability: 'AVAILABLE',
    status: 'ACTIVE'
  },
  {
    id: 'e10',
    employee_code: 'SPC010',
    aadhar_number: '827679506432',
    first_name: 'KASHIF',
    last_name: 'KHAN',
    name: 'KASHIF KHAN',
    date_of_birth: '2004-01-10',
    gender: 'MALE',
    email: 'kashifsheikh0318@gmail.com',
    phone: '9990860318',
    address: 'Saidpur katra Rahmat Khan,Kaimaganj',
    city: 'Farukhabad',
    state: 'Uttarpardesh',
    postal_code: '207502',
    hire_date: '2026-04-25',
    employment_status: 'ACTIVE',
    department_id: 'd4',
    department_name: 'Service',
    job_title: 'TECHNICIAN',
    title: 'Technician',
    department: 'Service',
    daily_wage: 1800,
    daily_incentive_earned: 200,
    service_area: 'Farukhabad',
    certifications: '{"emergency_name":"Shakeel Khan","emergency_relationship":"father","emergency_phone":"9651036178"}',
    plate_number: 'HR28H2113',
    make: 'HERO',
    model: 'HF DELUXE',
    year: 2018,
    availability: 'AVAILABLE',
    status: 'ACTIVE'
  },
  {
    id: 'e11',
    employee_code: 'SPC011',
    aadhar_number: '749335705823',
    first_name: 'MUKEEM',
    last_name: 'KHAN',
    name: 'MUKEEM KHAN',
    date_of_birth: '2008-01-01',
    gender: 'MALE',
    email: 'khanmukeem20870@gmail.com',
    phone: '9306913826',
    address: 'Gulalta (201) , Mewat',
    city: 'Mewat',
    state: 'Haryana',
    postal_code: '122508',
    hire_date: '2026-05-01',
    employment_status: 'ACTIVE',
    department_id: 'd4',
    department_name: 'Service',
    job_title: 'TECHNICIAN',
    title: 'Helper',
    department: 'Service',
    daily_wage: 1000,
    daily_incentive_earned: 100,
    service_area: 'Mewat',
    certifications: '{"emergency_name":"Sahid","emergency_relationship":"father","emergency_phone":"9050293585"}',
    availability: 'AVAILABLE',
    status: 'ACTIVE'
  },
  {
    id: 'e12',
    employee_code: 'SPC012',
    aadhar_number: '266964268333',
    first_name: 'MOHD',
    last_name: 'FAIJ',
    name: 'MOHD FAIJ',
    date_of_birth: '2005-03-03',
    gender: 'MALE',
    email: 'faij34906@gmail.com',
    phone: '9812156719',
    address: 'Moolthan (10) , Mewat',
    city: 'Mewat',
    state: 'Haryana',
    postal_code: '122108',
    hire_date: '2024-03-19',
    employment_status: 'ACTIVE',
    department_id: 'd4',
    department_name: 'Service',
    job_title: 'TECHNICIAN',
    title: 'Technician',
    department: 'Service',
    daily_wage: 1800,
    daily_incentive_earned: 200,
    service_area: 'Mewat',
    certifications: '{"emergency_name":"Rasid","emergency_relationship":"father","emergency_phone":"9813134652"}',
    availability: 'AVAILABLE',
    status: 'ACTIVE'
  },
  {
    id: 'e13',
    employee_code: 'SPC013',
    aadhar_number: '565050775148',
    first_name: 'IRFAN',
    last_name: 'KHAN',
    name: 'IRFAN KHAN',
    date_of_birth: '2002-08-16',
    gender: 'MALE',
    email: 'irfanbindas402@gmail.com',
    phone: '9813634654',
    address: 'Khanpur  Ghati (126) , Rethath, Mewat',
    city: 'Mewat',
    state: 'Haryana',
    postal_code: '122508',
    hire_date: '2024-09-01',
    employment_status: 'ACTIVE',
    department_id: 'd4',
    department_name: 'Service',
    job_title: 'TECHNICIAN',
    title: 'Electrician',
    department: 'Service',
    daily_wage: 1800,
    daily_incentive_earned: 200,
    service_area: 'Mewat',
    certifications: '{"emergency_name":"Mohd Juber","emergency_relationship":"father","emergency_phone":"9813134652"}',
    plate_number: 'HR-27M3823',
    make: 'Splender',
    model: '',
    year: 2023,
    availability: 'AVAILABLE',
    status: 'ACTIVE'
  },
  {
    id: 'e14',
    employee_code: 'SPC014',
    aadhar_number: '975758286978',
    first_name: 'ANFAS',
    last_name: 'KHAN',
    name: 'ANFAS KHAN',
    date_of_birth: '2004-03-12',
    gender: 'MALE',
    email: 'sambindaas90@gmail.com',
    phone: '7404829186',
    address: 'Khanpur  Ghati (126) , Mewat',
    city: 'Mewat',
    state: 'Haryana',
    postal_code: '122508',
    hire_date: '2024-03-12',
    employment_status: 'ACTIVE',
    department_id: 'd4',
    department_name: 'Service',
    job_title: 'TECHNICIAN',
    title: 'Helper',
    department: 'Service',
    daily_wage: 1000,
    daily_incentive_earned: 100,
    service_area: 'Mewat',
    certifications: '{"emergency_name":"Mohd Ishak","emergency_relationship":"father","emergency_phone":"9053459587"}',
    availability: 'AVAILABLE',
    status: 'ACTIVE'
  },
  {
    id: 'e15',
    employee_code: 'SPC015',
    aadhar_number: '648099561459',
    first_name: 'ANSH',
    last_name: 'IQBAL',
    name: 'ANSH IQBAL',
    date_of_birth: '2007-06-19',
    gender: 'MALE',
    email: 'anaskhan106555@gmail.com',
    phone: '7419286186',
    address: 'Hirwari Bamatheri (79), PO: Ferozepur Jhirka',
    city: 'Mewat',
    state: 'Haryana',
    postal_code: '122104',
    hire_date: '2026-06-08',
    employment_status: 'ACTIVE',
    department_id: 'd4',
    department_name: 'Service',
    job_title: 'TECHNICIAN',
    title: 'Helper',
    department: 'Service',
    daily_wage: 1000,
    daily_incentive_earned: 100,
    service_area: 'Mewat',
    certifications: '{"emergency_name":"Iqbal","emergency_relationship":"father","emergency_phone":"9812206161"}',
    availability: 'AVAILABLE',
    status: 'ACTIVE'
  },
  {
    id: 'e16',
    employee_code: 'SPC016',
    aadhar_number: '474498244819',
    first_name: 'ARHAN',
    last_name: 'KHAN',
    name: 'ARHAN KHAN',
    date_of_birth: '2010-01-01',
    gender: 'MALE',
    email: 'arhanmalik7190@gmail.com',
    phone: '9311460026',
    address: 'Raniya patti, near jama masjid, ward no. 2,',
    city: 'Mewat',
    state: 'Haryana',
    postal_code: '122104',
    hire_date: '2024-09-01',
    employment_status: 'ACTIVE',
    department_id: 'd4',
    department_name: 'Service',
    job_title: 'TECHNICIAN',
    title: 'Helper',
    department: 'Service',
    daily_wage: 1000,
    daily_incentive_earned: 100,
    service_area: 'Mewat',
    certifications: '{"emergency_name":"Mustakim","emergency_relationship":"father","emergency_phone":"9050476126"}',
    availability: 'AVAILABLE',
    status: 'ACTIVE'
  },
  {
    id: 'e17',
    employee_code: 'SPC017',
    aadhar_number: '916113116764',
    first_name: 'LALIT',
    last_name: 'TAMATO',
    name: 'LALIT TAMATO',
    date_of_birth: '1996-08-18',
    gender: 'MALE',
    email: 'lalittmt575@gmail.com',
    phone: '7349547514',
    address: '619 Sai Sukriti, 5th cross road 8th main , b',
    city: 'Bengaluru',
    state: 'Karnataka',
    postal_code: '560050',
    hire_date: '2026-03-16',
    employment_status: 'ACTIVE',
    department_id: 'd2',
    department_name: 'Operations',
    job_title: 'ADMIN',
    title: 'CHEF',
    department: 'Operations',
    daily_wage: 2000,
    daily_incentive_earned: 200,
    service_area: 'Bengaluru',
    certifications: '{"emergency_name":"Tule Ram Tamato","emergency_relationship":"father","emergency_phone":"9841121272"}',
    availability: 'AVAILABLE',
    status: 'ACTIVE'
  }
];

export const mockEmployeeSkills: EmployeeSkill[] = [
  {
    id: 's1',
    employee_id: 'e1',
    skill_name: 'HVAC business operations',
    skill_level: 'EXPERT',
    certificate_number: 'CERT-OPS-0001',
    issuing_authority: 'HVAC Leadership Board',
    issue_date: '2021-01-15'
  },
  {
    id: 's8',
    employee_id: 'e7',
    skill_name: 'Assistant',
    skill_level: 'INTERMEDIATE',
    certificate_number: '',
    issuing_authority: '',
    issue_date: ''
  },
  {
    id: 's9',
    employee_id: 'e8',
    skill_name: 'account',
    skill_level: 'INTERMEDIATE',
    certificate_number: '',
    issuing_authority: '',
    issue_date: ''
  },
  {
    id: 's10',
    employee_id: 'e9',
    skill_name: 'maintance',
    skill_level: 'INTERMEDIATE',
    certificate_number: '',
    issuing_authority: '',
    issue_date: ''
  },
  {
    id: 's11',
    employee_id: 'e10',
    skill_name: 'maintance',
    skill_level: 'INTERMEDIATE',
    certificate_number: '',
    issuing_authority: '',
    issue_date: ''
  },
  {
    id: 's12',
    employee_id: 'e11',
    skill_name: 'Helper',
    skill_level: 'BEGINNER',
    certificate_number: '',
    issuing_authority: '',
    issue_date: ''
  },
  {
    id: 's13',
    employee_id: 'e12',
    skill_name: 'maintance',
    skill_level: 'INTERMEDIATE',
    certificate_number: '',
    issuing_authority: '',
    issue_date: ''
  },
  {
    id: 's14',
    employee_id: 'e13',
    skill_name: 'maintance',
    skill_level: 'INTERMEDIATE',
    certificate_number: '',
    issuing_authority: '',
    issue_date: ''
  },
  {
    id: 's15',
    employee_id: 'e14',
    skill_name: 'Helper',
    skill_level: 'BEGINNER',
    certificate_number: '',
    issuing_authority: '',
    issue_date: ''
  },
  {
    id: 's16',
    employee_id: 'e15',
    skill_name: 'Helper',
    skill_level: 'BEGINNER',
    certificate_number: '',
    issuing_authority: '',
    issue_date: ''
  },
  {
    id: 's17',
    employee_id: 'e16',
    skill_name: 'Helper',
    skill_level: 'BEGINNER',
    certificate_number: '',
    issuing_authority: '',
    issue_date: ''
  },
  {
    id: 's18',
    employee_id: 'e17',
    skill_name: 'kitchen',
    skill_level: 'INTERMEDIATE',
    certificate_number: '',
    issuing_authority: '',
    issue_date: ''
  }
];

export const mockClients: Client[] = [
  {
    id: 'c1',
    client_name: 'Ravi Shah',
    client_type: 'Corporate',
    industry: 'Real Estate Developer',
    gst_number: '29AAAAA1111A1Z1',
    website: 'https://metroplaza.local',
    head_office_address: '22 Market Road, Bengaluru, Karnataka, 560010',
    primary_contact_name: 'Ravi Shah',
    designation: 'Managing Director',
    mobile: '9888800001',
    email: 'ravi@metroplaza.local',
    decision_maker: 'Yes',
    accounts_contact: 'Finance Team (accounts@metroplaza.local)',
    lead_source: 'Referral',
    client_status: 'ACTIVE',
    notes: 'Premium commercial landlord. Owns multiple plazas.',

    // Backwards compatibility fields
    client_code: 'C001',
    company_name: 'Metro Plaza',
    address: '22 Market Road, Bengaluru',
    project_name: 'Rooftop HVAC Replacement',
    location: 'Metro Plaza Rooftop',
    building_type: 'COMMERCIAL',
    approx_area: '45,000 sq ft',
    requirement: 'NEW_INSTALLATION',
    preferred_hvac_system: 'PACKAGE_UNIT',
    current_challenges: 'Existing rooftop unit has weak cooling and frequent compressor trips.',
    budget_range: 'INR 15L - 20L',
    expected_completion_date: '2026-08-15'
  },
  {
    id: 'c2',
    client_name: 'Nisha Rao',
    client_type: 'Residential Association',
    industry: 'Real Estate Association',
    gst_number: '29BBBBB2222B2Z2',
    website: 'https://greenfield.local',
    head_office_address: '14 Lake View Street, Bengaluru, Karnataka, 560011',
    primary_contact_name: 'Nisha Rao',
    designation: 'Association President',
    mobile: '9888800002',
    email: 'nisha@greenfield.local',
    decision_maker: 'Yes',
    accounts_contact: 'Treasurer (treasurer@greenfield.local)',
    lead_source: 'Website',
    client_status: 'ACTIVE',
    notes: 'Residential society with 120+ split AC installations.',

    // Backwards compatibility fields
    client_code: 'C002',
    company_name: 'Greenfield Apartment Association',
    address: '14 Lake View Street, Bengaluru',
    project_name: 'Annual Maintenance Contract',
    location: 'Greenfield Apartments',
    building_type: 'RESIDENTIAL',
    approx_area: '120 apartments',
    requirement: 'AMC',
    preferred_hvac_system: 'SPLIT_AC',
    current_challenges: 'Common-area AC units need scheduled preventive maintenance.',
    budget_range: 'INR 3L - 5L',
    expected_completion_date: '2026-07-31'
  }
];

export const mockSites: Site[] = [
  {
    id: 's1',
    site_code: 'S001',
    client_id: 'c1',
    client_name: 'Metro Plaza',
    site_name: 'Metro Plaza Rooftop',
    customer_name: 'Metro Plaza',
    contact_person: 'Ravi Shah',
    contact_phone: '9888800001',
    contact_email: 'facilities@metroplaza.local',
    address: '22 Market Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    postal_code: '560010',
    site_type: 'COMMERCIAL',
    property_type: 'Retail complex',
    service_zone: 'Central Zone',
    landmark: 'Near City Metro Station',
    access_instructions: 'Use service lift B. Security pass required.',
    preferred_visit_time: '10 AM - 5 PM',
    equipment_summary: 'Two rooftop packaged units, lobby split AC units, AHU room on terrace.',
    assigned_manager_id: 'e7',
    status: 'ACTIVE',

    // New SiteDetails fields
    pincode: '560010',
    site_contact_person: 'Ravi Shah',
    mobile: '9888800001',
    email: 'facilities@metroplaza.local',
    total_area: '45,000 Sq.Ft',
    number_of_floors: '6',
    existing_hvac: 'VRF / Rooftop Packaged',
    existing_brand: 'Daikin / Carrier',
    existing_capacity: '120 HP / 50 TR',
    amc_required: 'Yes'
  },
  {
    id: 's2',
    site_code: 'S002',
    client_id: 'c2',
    client_name: 'Greenfield Apartment Association',
    site_name: 'Greenfield Apartments',
    customer_name: 'Greenfield Apartment Association',
    contact_person: 'Nisha Rao',
    contact_phone: '9888800002',
    contact_email: 'admin@greenfield.local',
    address: '14 Lake View Street',
    city: 'Bengaluru',
    state: 'Karnataka',
    postal_code: '560011',
    site_type: 'RESIDENTIAL',
    property_type: 'Apartment complex',
    service_zone: 'North Zone',
    landmark: 'Opposite Lake Park',
    access_instructions: 'Visitor entry at gate 2. Coordinate apartment access with security.',
    preferred_visit_time: '9 AM - 1 PM',
    equipment_summary: 'Common-area split AC systems and clubhouse ducted unit.',
    assigned_manager_id: 'e7',
    status: 'ACTIVE',

    // New SiteDetails fields
    pincode: '560011',
    site_contact_person: 'Nisha Rao',
    mobile: '9888800002',
    email: 'admin@greenfield.local',
    total_area: '180,000 Sq.Ft',
    number_of_floors: '12 (3 Towers)',
    existing_hvac: 'Multi Split / Cassette / High-wall Unit',
    existing_brand: 'Voltas / Mitsubishi',
    existing_capacity: '185 TR Cumulative',
    amc_required: 'Yes'
  }
];

export const mockProjects: Project[] = [
  {
    id: 'p1',
    name: 'Rooftop Unit Repair',
    customer_name: 'Metro Plaza',
    service_address: '22 Market Road, Central Zone',
    equipment_type: 'Rooftop packaged unit',
    job_type: 'REPAIR',
    description: 'Diagnose weak cooling and unusual compressor noise on the main rooftop unit.',
    status: 'IN_PROGRESS',
    start_date: '2026-06-01',
    owner_id: 'e7'
  },
  {
    id: 'p2',
    name: 'Preventive Maintenance Visit',
    customer_name: 'Greenfield Apartments',
    service_address: '14 Lake View Street, North Zone',
    equipment_type: 'Split AC systems',
    job_type: 'MAINTENANCE',
    description: 'Quarterly preventive maintenance for lobby and common-area split AC units.',
    status: 'SCHEDULED',
    start_date: '2026-07-01',
    owner_id: 'e1'
  }
];

export const mockTasks: Task[] = [
  {
    id: 't1',
    title: 'Inspect compressor and contactor',
    description: 'Check compressor amp draw, contactor wear, and wiring condition.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    due_date: '2026-06-24',
    project_id: 'p1',
    assignee_id: 'e7'
  },
  {
    id: 't2',
    title: 'Clean condenser coil',
    description: 'Clean debris from the condenser coil and verify airflow.',
    status: 'REVIEW',
    priority: 'MEDIUM',
    due_date: '2026-06-22',
    project_id: 'p1',
    assignee_id: 'e9'
  },
  {
    id: 't3',
    title: 'Prepare refrigerant pressure report',
    description: 'Record suction and discharge pressures after the repair check.',
    status: 'TODO',
    priority: 'URGENT',
    due_date: '2026-06-21',
    project_id: 'p1',
    assignee_id: 'e1'
  },
  {
    id: 't4',
    title: 'Schedule apartment unit access',
    description: 'Coordinate access windows with building management and residents.',
    status: 'TODO',
    priority: 'LOW',
    due_date: '2026-07-08',
    project_id: 'p2',
    assignee_id: 'e10'
  }
];

const lowSideCsvStr = `Side,Category,Sub Category,Item,Unit
LOW_SIDE,Installation,Cassette AC,Cassette AC Installation,NOS
LOW_SIDE,Installation,Ductable AC,Ductable AC Installation,NOS
LOW_SIDE,Installation,Tower AC,Tower AC Installation,NOS
LOW_SIDE,Installation,Split AC,Split AC Installation,NOS
LOW_SIDE,Installation,VRV Indoor,VRV Indoor Installation,NOS
LOW_SIDE,Installation,VRV Outdoor,VRV Outdoor Installation,NOS
LOW_SIDE,Installation,AHU,AHU Installation,NOS
LOW_SIDE,Installation,FAHU,FAHU Installation,NOS
LOW_SIDE,Installation,Chiller,Chiller Installation,NOS
LOW_SIDE,Installation,Condenser,Condenser Installation,NOS
LOW_SIDE,Copper Piping,Pipe,Copper Piping 1/4 inch,RMT
LOW_SIDE,Copper Piping,Pipe,Copper Piping 3/8 inch,RMT
LOW_SIDE,Copper Piping,Pipe,Copper Piping 1/2 inch,RMT
LOW_SIDE,Copper Piping,Pipe,Copper Piping 5/8 inch,RMT
LOW_SIDE,Copper Piping,Pipe,Copper Piping 3/4 inch,RMT
LOW_SIDE,Copper Piping,Pipe,Copper Piping 7/8 inch,RMT
LOW_SIDE,Copper Piping,Pipe,Copper Piping 1-1/8 inch,RMT
LOW_SIDE,Copper Piping,Pipe,Copper Piping 1-3/8 inch,RMT
LOW_SIDE,Copper Piping,Pipe,Copper Piping 1-5/8 inch,RMT
LOW_SIDE,Copper Piping,Pipe,Copper Piping 1-7/8 inch,RMT
LOW_SIDE,Copper Piping,Pipe,Copper Piping 2-1/8 inch,RMT
LOW_SIDE,Copper Fittings,Elbow,Copper Elbow,NOS
LOW_SIDE,Copper Fittings,Tee,Copper Tee,NOS
LOW_SIDE,Copper Fittings,Reducer,Copper Reducer,NOS
LOW_SIDE,Copper Fittings,Coupler,Copper Coupler,NOS
LOW_SIDE,Copper Fittings,Union,Copper Union,NOS
LOW_SIDE,Copper Fittings,Socket,Copper Socket,NOS
LOW_SIDE,Copper Fittings,Cap,Copper Cap,NOS
LOW_SIDE,Insulation,Nitrile Rubber,9 mm Nitrile Insulation,RMT
LOW_SIDE,Insulation,Nitrile Rubber,13 mm Nitrile Insulation,RMT
LOW_SIDE,Insulation,Nitrile Rubber,19 mm Nitrile Insulation,RMT
LOW_SIDE,Insulation,Nitrile Rubber,25 mm Nitrile Insulation,RMT
LOW_SIDE,Insulation,XLPE,XLPE Insulation,RMT
LOW_SIDE,Insulation,Glass Wool,Glass Wool Insulation,SQMTR
LOW_SIDE,Insulation,Rock Wool,Rock Wool Insulation,SQMTR
LOW_SIDE,Insulation,PIR,PIR Insulation,SQMTR
LOW_SIDE,Drainage,PVC Pipe,20 mm Drainage Pipe,RMT
LOW_SIDE,Drainage,PVC Pipe,25 mm Drainage Pipe,RMT
LOW_SIDE,Drainage,PVC Pipe,32 mm Drainage Pipe,RMT
LOW_SIDE,Drainage,PVC Pipe,40 mm Drainage Pipe,RMT
LOW_SIDE,Drainage,PVC Pipe,50 mm Drainage Pipe,RMT
LOW_SIDE,Drainage,PVC Pipe,63 mm Drainage Pipe,RMT
LOW_SIDE,Drainage,Fittings,PVC Elbow,NOS
LOW_SIDE,Drainage,Fittings,PVC Tee,NOS
LOW_SIDE,Drainage,Fittings,PVC Coupler,NOS
LOW_SIDE,Drainage,Fittings,PVC Reducer,NOS
LOW_SIDE,Drainage,Fittings,Drain Trap,NOS
LOW_SIDE,Drainage,Fittings,Floor Trap,NOS
LOW_SIDE,Electrical,Power Cable,2.5 MM 4 Core Cable,RMT
LOW_SIDE,Electrical,Power Cable,4 MM 4 Core Cable,RMT
LOW_SIDE,Electrical,Power Cable,6 MM 4 Core Cable,RMT
LOW_SIDE,Electrical,Power Cable,10 MM 4 Core Cable,RMT
LOW_SIDE,Electrical,Power Cable,16 MM 4 Core Cable,RMT
LOW_SIDE,Electrical,Power Cable,25 MM 4 Core Cable,RMT
LOW_SIDE,Electrical,Power Cable,35 MM 4 Core Cable,RMT
LOW_SIDE,Electrical,Communication,Communication Cable,RMT
LOW_SIDE,Electrical,Communication,Shielded Cable,RMT
LOW_SIDE,Electrical,Communication,RS485 Cable,RMT
LOW_SIDE,Electrical,Communication,BMS Cable,RMT
LOW_SIDE,Electrical,Protection,MCB,NOS
LOW_SIDE,Electrical,Protection,MCCB,NOS
LOW_SIDE,Electrical,Protection,RCCB,NOS
LOW_SIDE,Electrical,Protection,ELCB,NOS
LOW_SIDE,Electrical,Protection,Isolator,NOS
LOW_SIDE,Electrical,Protection,Contactor,NOS
LOW_SIDE,Electrical,Protection,Overload Relay,NOS
LOW_SIDE,Ducting,GI Duct,GI Duct 24G,SQMTR
LOW_SIDE,Ducting,GI Duct,GI Duct 22G,SQMTR
LOW_SIDE,Ducting,GI Duct,GI Duct 20G,SQMTR
LOW_SIDE,Ducting,GI Duct,GI Duct 18G,SQMTR
LOW_SIDE,Ducting,PIR,PIR Ducting,SQMTR
LOW_SIDE,Ducting,Pre Insulated,Pre Insulated Ducting,SQMTR
LOW_SIDE,Ducting,Flexible,Flexible Duct,RMT
LOW_SIDE,Ducting,Connection,Canvas Connection,NOS
LOW_SIDE,Air Distribution,Grille,Supply Air Grille,NOS
LOW_SIDE,Air Distribution,Grille,Return Air Grille,NOS
LOW_SIDE,Air Distribution,Grille,Egg Crate Grille,NOS
LOW_SIDE,Air Distribution,Diffuser,Square Diffuser,NOS
LOW_SIDE,Air Distribution,Diffuser,Round Diffuser,NOS
LOW_SIDE,Air Distribution,Diffuser,Slot Diffuser,NOS
LOW_SIDE,Air Distribution,Diffuser,Jet Nozzle Diffuser,NOS
LOW_SIDE,Air Distribution,Damper,Volume Control Damper,NOS
LOW_SIDE,Air Distribution,Damper,Fire Damper,NOS
LOW_SIDE,Air Distribution,Damper,Smoke Damper,NOS
LOW_SIDE,Air Distribution,Damper,Motorized Damper,NOS
LOW_SIDE,Air Distribution,Damper,Back Draft Damper,NOS
LOW_SIDE,Supports,Outdoor Unit,Heavy Duty Bracket,NOS
LOW_SIDE,Supports,Outdoor Unit,MS Frame,NOS
LOW_SIDE,Supports,Duct Support,Threaded Rod,NOS
LOW_SIDE,Supports,Duct Support,Unistrut Channel,RMT
LOW_SIDE,Supports,Pipe Support,Pipe Clamps,NOS
LOW_SIDE,Supports,Pipe Support,Pipe Hanger,NOS
LOW_SIDE,Supports,Fasteners,Anchor Fasteners,NOS
LOW_SIDE,Commissioning,Testing,N2 Testing,NOS
LOW_SIDE,Commissioning,Testing,Pressure Testing,NOS
LOW_SIDE,Commissioning,Testing,Leak Testing,NOS
LOW_SIDE,Commissioning,Vacuuming,Vacuuming,NOS
LOW_SIDE,Commissioning,Flushing,Flushing,NOS
LOW_SIDE,Commissioning,Charging,Refrigerant Charging,NOS
LOW_SIDE,Commissioning,Final,Testing & Commissioning,NOS
LOW_SIDE,Logistics,Transportation,Transportation,LOT
LOW_SIDE,Logistics,Loading,Loading Charges,LOT
LOW_SIDE,Logistics,Unloading,Unloading Charges,LOT
LOW_SIDE,Logistics,Equipment,Crane Charges,LOT
LOW_SIDE,Logistics,Equipment,Scaffolding,LOT
LOW_SIDE,Logistics,Material Shifting,Material Shifting,LOT
LOW_SIDE,Consumables,Brazing,Silver Brazing Rod,KG
LOW_SIDE,Consumables,Brazing,Flux,KG
LOW_SIDE,Consumables,Tape,Aluminum Tape,ROLL
LOW_SIDE,Consumables,Tape,Insulation Tape,ROLL
LOW_SIDE,Consumables,Sealant,Silicone Sealant,TUBE
LOW_SIDE,Consumables,Hardware,Nut Bolt Washer,SET
LOW_SIDE,Consumables,Hardware,Self Drilling Screws,BOX
LOW_SIDE,Consumables,Hardware,Cable Tie,PKT
LOW_SIDE,Consumables,Hardware,Rawl Plug,PKT`;

const daikinCsvStr = `Series,Type,Technology,Mode,Star Rating,Refrigerant,Power Supply,Cooling TR,Heating TR,FCU,CU,MRP Set Base (Rs.),DBP without TAX (Rs.),Discount,Unit Price w/o Tax,NLC-GST Paid (Rs.)
FCQF,Ceiling Mounted- Cassette Type (3 by 3 panel),Non Inverter,Cooling Only,2 Star,,Single Phase,1.51,,FCQF18CV16,RGVF18CV16,79700,61300,4.00%,58848,67705
FCQF,Ceiling Mounted- Cassette Type (3 by 3 panel),Non Inverter,Cooling Only,1 Star,,Single Phase,1.51,,FCQF18ARV16,RGVF18ASV16,76200,58700,4.00%,56352,64833
FCQF,Ceiling Mounted- Cassette Type (3 by 3 panel),Non Inverter,Cooling Only,1 Star,,Single Phase,2,,FCQF24ARV16,RGVF24ASV16,85000,65400,4.00%,62784,72233
FCQF,Ceiling Mounted- Cassette Type (3 by 3 panel),Non Inverter,Cooling Only,1 Star,,Single Phase,2.5,,FCQF30ARV16,RGVF30ASV16,102300,78700,4.00%,75552,86923
FCQF,Ceiling Mounted- Cassette Type (3 by 3 panel),Non Inverter,Cooling Only,1 Star,,Single Phase,2.99,,FCQF36ARV16,RGVF36ASV16,127100,97900,4.00%,93984,108129
FCQF,Ceiling Mounted- Cassette Type (3 by 3 panel),Non Inverter,Cooling Only,1 Star,,Three Phase,3.5,,FCQF42CV16,RGVF42CY16,146000,112400,4.00%,107904,124144
FCQF,Ceiling Mounted- Cassette Type (3 by 3 panel),Non Inverter,Cooling Only,1 Star,,Three Phase,3.75,,FCQF48CRV16,RGVF48CRY16,154200,118700,4.00%,113952,131102
FCFQ,Ceiling Mounted- Cassette Type (3 by 3 panel),Inverter,Cooling Only,3 Star,,Single Phase,1.42,,FCFQ50CV16,RZCFQ50CV16,81400,60300,4.00%,57888,66600
FCFQ,Ceiling Mounted- Cassette Type (3 by 3 panel),Inverter,Cooling Only,3 Star,,Single Phase,2,,FCFQ71CV16,RZCFQ71CV16,93100,69400,4.00%,66624,76651
FCFQ,Ceiling Mounted- Cassette Type (3 by 3 panel),Inverter,Cooling Only,3 Star,,Single Phase,2.56,,FCFQ90CV16,RZCFQ90CV16,128200,96800,4.00%,92928,106914
FCFQ,Ceiling Mounted- Cassette Type (3 by 3 panel),Inverter,Cooling Only,3 Star,,Single Phase,2.99,,FCFQ100CV16,RZCFQ100CV16,133700,101200,4.00%,97152,111773
FCFQ,Ceiling Mounted- Cassette Type (3 by 3 panel),Inverter,Cooling Only,3 Star,,Three Phase,3.55,,FCFQ125CV16,RZCFQ125CY16,161000,122400,4.00%,117504,135188
FCFQ,Ceiling Mounted- Cassette Type (3 by 3 panel),Inverter,Cooling Only,3 Star,,Three Phase,3.98,,FCFQ140CV16,RZCFQ140CY16,163700,124500,4.00%,119520,137508
FCMF,Ceiling Mounted- Cassette Type (3 by 3-New Round Flow),Inverter,Cooling Only,5 Star,,Single Phase,1.51,,FCMF50CV16,RZCMF50CV16,107900,81000,4.00%,77760,89463
FCMF,Ceiling Mounted- Cassette Type (3 by 3-New Round Flow),Inverter,Cooling Only,5 Star,,Single Phase,1.95,,FCMF71CV16,RZCMF71CV16,116600,87700,4.00%,84192,96863
FCMF,Ceiling Mounted- Cassette Type (3 by 3-New Round Flow),Inverter,Cooling Only,5 Star,,Single Phase,2.99,,FCMF100CV16,RZCMF100CV16,158300,120300,4.00%,115488,132869
FCMF,Ceiling Mounted- Cassette Type (3 by 3-New Round Flow),Inverter,Cooling Only,5 Star,,Single Phase,3.55,,FCMF125CV16,RZCMF125CV16,187200,142800,4.00%,137088,157720
FCMF,Ceiling Mounted- Cassette Type (3 by 3-New Round Flow),Inverter,Cooling Only,5 Star,,Single Phase,3.98,,FCMF140CV169,RZCMF140CV169,190300,145300,4.00%,139488,160481
FCMF,Ceiling Mounted- Cassette Type (3 by 3-New Round Flow),Inverter,Cooling Only,5 Star,,Three Phase,3.55,,FCMF125CV16,RZCMF125CY16,192000,146600,4.00%,140736,161917
FCMF,Ceiling Mounted- Cassette Type (3 by 3-New Round Flow),Inverter,Cooling Only,5 Star,,Three Phase,3.98,,FCMF140CV169,RZCMF140CY169,195300,149200,4.00%,143232,164788
FFFQ,Ceiling Concealed 4 Way Compact Cassette type,Inverter,Cooling Only,3 Star,,Single Phase,1.42,,FFFQ50CV16,RZFFQ50CV16,106300,74400,4.00%,71424,82173
FFFQ,Ceiling Concealed 4 Way Compact Cassette type,Inverter,Cooling Only,3 Star,,Single Phase,1.8,,FFFQ60CV16,RZFFQ60CV16,118000,83500,4.00%,80160,92224
FKCAQ,Ceiling Concealed 1 Way Cassette type,Inverter,Cooling Only,2 Star,,Single Phase,1.42,,FKCAQ50AV16,RZVFQ50BRV16,116300,81600,4.00%,78336,90126
FKCAQ,Ceiling Concealed 1 Way Cassette type,Inverter,Cooling Only,2 Star,,Single Phase,1.99,,FKCAQ71AV16,RZVFQ71BRV16,127900,90700,4.00%,87072,100176
FKAQ,Ceiling Concealed 1 Way Cassette type,Inverter,Hot & Cold,2 Star,,Single Phase,1.42,1.42,FKAQ50AV16,RZKAQ50AV16,121500,85700,4.00%,82272,94654
FCA,Ceiling Mounted- Cassette Type (3 by 3 panel),Inverter,Heat & Cool,3 Star,,Single Phase,1.42,1.5,FCA50AV16,RZCA50AV16,106300,79800,4.00%,76608,88138
FCA,Ceiling Mounted- Cassette Type (3 by 3 panel),Inverter,Heat & Cool,3 Star,,Single Phase,2,2,FCA71AV16,RZCA71AV16,116500,87700,4.00%,84192,96863
FCA,Ceiling Mounted- Cassette Type (3 by 3 panel),Inverter,Heat & Cool,3 Star,,Single Phase,2.98,3,FCA100AV16,RZCA100AV16,178400,136000,4.00%,130560,150209
FCA,Ceiling Mounted- Cassette Type (3 by 3 panel),Inverter,Heat & Cool,3 Star,,Single Phase,3.55,3.5,FCA125AV16,RZCA125AV16,184000,140400,4.00%,134784,155069
FCA,Ceiling Mounted- Cassette Type (3 by 3 panel),Inverter,Heat & Cool,3 Star,,Single Phase,3.98,4,FCA140AV16,RZCA140AV16,200000,152900,4.00%,146784,168875
FDBF,Ductable-Low Static,Non Inverter,Cooling Only,,R-32,Single Phase,1,,FDBF12CRV16,RGF12CRV16,50500,39400,4.00%,37824,43517
FDBF,Ductable-Low Static,Non Inverter,Cooling Only,,R-32,Single Phase,1,,FDBF12DRV16,RGF12DRV16,50500,39400,4.00%,37824,43517
FDBF,Ductable-Low Static,Non Inverter,Cooling Only,,R-32,Single Phase,1.5,,FDBF18CRV16,RGF18CRV16,52800,41300,4.00%,39648,45615
FDBF,Ductable-Low Static,Non Inverter,Cooling Only,,R-32,Single Phase,2,,FDBF24CRV16,RGF24CRV16,68800,53800,4.00%,51648,59421
FDBF,Ductable-Low Static,Non Inverter,Cooling Only,,R-32,Single Phase,2.5,,FDMF30CRV16,RGF30CRV16,89600,69900,4.00%,67104,77203
FDBF,Ductable-Low Static,Non Inverter,Cooling Only,,R-32,Single Phase,3,,FDMF36CRV16,RGF36CRV16,96800,75600,4.00%,72576,83499
FDBF,Ductable-Low Static,Non Inverter,Cooling Only,,R-32,Three Phase,3.5,,FDMF42CRV16,RGF42CRY16,106600,83100,4.00%,79776,91782
FDBF,Ductable-Low Static,Non Inverter,Cooling Only,,R-32,Three Phase,4,,FDMF48CRV16,RGF48CRY16,118400,92400,4.00%,88704,102054
FDMR,Ductable-Mid Static,Non Inverter,Cooling Only,,R-410,Three Phase,3,,FDMR36ERV16,RR36ERY16,84600,66000,4.00%,63360,72896
FDMF,Ductable-Low/Mid Static,Inverter,Cooling Only,,R-32,Single Phase,1.5,,FDMF50BRV16,RZMF50BRV16,90600,69100,4.00%,66336,76320
FDMF,Ductable-Low/Mid Static,Inverter,Cooling Only,,R-32,Single Phase,2,,FDMF71BRV16,RZMF71BRV16,99600,76200,4.00%,73152,84161
FDMF,Ductable-Low/Mid Static,Inverter,Cooling Only,,R-32,Single Phase,2.5,,FDMF90BRV16,RZMF90BRV16,125900,96700,4.00%,92832,106803
FDMF,Ductable-Low/Mid Static,Inverter,Cooling Only,,R-32,Single Phase,2.8,,FDMF100BRV16,RZMF100BRV16,145000,111600,4.00%,107136,123260
FDMF,Ductable-Low/Mid Static,Inverter,Cooling Only,,R-32,Single Phase,3.5,,FDMF125BRV16,RZVF125BRV16,164000,126400,4.00%,121344,139606
FDMF,Ductable-Low/Mid Static,Inverter,Cooling Only,,R-32,Single Phase,4,,FDMF140BRV16,RZMF140BRV16,185000,142800,4.00%,137088,157720
FDMF,Ductable-Low/Mid Static,Inverter,Cooling Only,,R-32,Three Phase,3.5,,FDMF125BRV16,RZMF125BRY16,168700,130100,4.00%,124896,143693
FDMF,Ductable-Low/Mid Static,Inverter,Cooling Only,,R-32,Three Phase,4,,FDMF140BRV16,RZMF140BRY16,190000,146700,4.00%,140832,162027
FDMFQ,Ductable-Low Static,Inverter,Cooling Only,,R-32,Single Phase,1.5,,FDMFQ50CV16,RZDMFQ50CV16,85300,64900,4.00%,62304,71681
FDMFQ,Ductable-Low Static,Inverter,Cooling Only,,R-32,Single Phase,2,,FDMFQ71AV16,RZMFQ71AV16,94000,71800,4.00%,68928,79302
FDMFQ,Ductable-Low Static,Inverter,Cooling Only,,R-32,Single Phase,2.5,,FDMFQ90AV16,RZMFQ90AV16,120200,92200,4.00%,88512,101833
FDMFQ,Ductable-Low Static,Inverter,Cooling Only,,R-32,Single Phase,3,,FDMFQ100AV16,RZMFQ100AV16,138400,106400,4.00%,102144,117517
FDMFQ,Ductable-Low Static,Inverter,Cooling Only,,R-32,Three Phase,3.5,,FDMFQ125AV16,RZMFQ125AY16,156300,120300,4.00%,115488,132869
FDMFQ,Ductable-Low Static,Inverter,Cooling Only,,R-32,Three Phase,4,,FDMFQ140AV16,RZMFQ140AY16,182300,140600,4.00%,134976,155290
FDMA,Duct Connection Type,Inverter,Heat & Cool,,R-32,Single Phase,1.5,1.5,FDMA50AV16,RZA50AV16,95800,73900,4.00%,70944,81621
FDMA,Duct Connection Type,Inverter,Heat & Cool,,R-32,Single Phase,2,2,FDMA71AV16,RZA71AV16,110200,85100,4.00%,81696,93991
FDMA,Duct Connection Type,Inverter,Heat & Cool,,R-32,Single Phase,3,3,FDMA100AV16,RZA100AV16,178500,138400,4.00%,132864,152860
FDMA,Duct Connection Type,Inverter,Heat & Cool,,R-32,Single Phase,3.5,3.5,FDMA125AV16,RZA125AV16,184600,143100,4.00%,137376,158051
FDMA,Duct Connection Type,Inverter,Heat & Cool,,R-32,Single Phase,4,4,FDMA140AV16,RZA140AV16,208700,162000,4.00%,155520,178926
FVFS,Floor Standing Type (Tower),Non Inverter,Cooling Only,,R-32,Single Phase,2,,FVFS24AV16,RGFS24AV16,94800,73900,3.00%,71683,82471
FVFS,Floor Standing Type (Tower),Non Inverter,Cooling Only,,R-32,Single Phase,3,,FVFS36AV16,RGFS36AV16,133200,103900,3.00%,100783,115951
FDKR,Ductable-High Static,Inverter,Cooling Only,,R-410A,Three Phase,5.5,,FDKR200BV16,RZR200BY16,186800,150200,4.00%,144192,165893
FDKR,Ductable-High Static,Inverter,Cooling Only,,R-410A,Three Phase,8.5,,FDKR300BV16,RZR300BY16,269500,208900,4.00%,200544,230726
FDKR,Ductable-High Static,Inverter,Cooling Only,,R-410A,Three Phase,11,,FDKR400BV16,RZR400BY16,333500,268400,4.00%,257664,296442
FDKR,Ductable-High Static,Inverter,Cooling Only,,R-411A,Three Phase,5.5,,FDR65FRV16,RR65FRY16,145600,117100,4.00%,112416,129335
FDKR,Ductable-High Static,Inverter,Cooling Only,,R-412A,Three Phase,5.5,,FDR65FRV169,RR65FRV169,145600,145600,4.00%,112416,129335
FDKR,Ductable-High Static,Inverter,Cooling Only,,R-413A,Three Phase,8.5,,FDR100FRV16,RR100FRY16,199200,199200,4.00%,153888,177048
FDKR,Ductable-High Static,Inverter,Cooling Only,,R-414A,Three Phase,11,,FDR130FRV16,RR130FRY16,253000,253000,4.00%,195456,224872
FDKR,Ductable-High Static,Inverter,Cooling Only,,R-415A,Three Phase,11,,FDR130FRV162,RR65FRY16*2,276000,276000,4.00%,213216,245305
FDKR,Ductable-High Static,Inverter,Cooling Only,,R-416A,Three Phase,11,,FDR130FRV1692,RR65FRV169*2,276000,276000,4.00%,213216,245305
FDKR,Ductable-High Static,Inverter,Cooling Only,,R-417A,Three Phase,17,,FDR200FRY16,RR100FRY16*2,391100,391100,4.00%,302112,347580`;

function getLowSidePrice(category: string, item: string): number {
  const normItem = item.toLowerCase();
  if (category === "Installation") {
    if (normItem.includes("cassette")) return 4500;
    if (normItem.includes("ductable")) return 6500;
    if (normItem.includes("tower")) return 5000;
    if (normItem.includes("split")) return 2000;
    if (normItem.includes("vrv indoor")) return 3000;
    if (normItem.includes("vrv outdoor")) return 4000;
    if (normItem.includes("ahu")) return 8000;
    if (normItem.includes("fahu")) return 9500;
    if (normItem.includes("chiller")) return 25000;
    if (normItem.includes("condenser")) return 15000;
    return 3000;
  }
  if (category === "Copper Piping") {
    if (normItem.includes("1/4")) return 380;
    if (normItem.includes("3/8")) return 480;
    if (normItem.includes("1/2")) return 620;
    if (normItem.includes("5/8")) return 780;
    if (normItem.includes("3/4")) return 920;
    if (normItem.includes("7/8")) return 1100;
    if (normItem.includes("1-1/8")) return 1350;
    if (normItem.includes("1-3/8")) return 1650;
    if (normItem.includes("1-5/8")) return 1950;
    if (normItem.includes("1-7/8")) return 2200;
    if (normItem.includes("2-1/8")) return 2500;
    return 800;
  }
  if (category === "Copper Fittings") {
    if (normItem.includes("elbow")) return 150;
    if (normItem.includes("tee")) return 220;
    if (normItem.includes("reducer")) return 180;
    if (normItem.includes("coupler")) return 120;
    if (normItem.includes("union")) return 350;
    if (normItem.includes("socket")) return 100;
    if (normItem.includes("cap")) return 90;
    return 150;
  }
  if (category === "Insulation") {
    if (normItem.includes("9 mm")) return 140;
    if (normItem.includes("13 mm")) return 180;
    if (normItem.includes("19 mm")) return 240;
    if (normItem.includes("25 mm")) return 320;
    if (normItem.includes("xlpe")) return 350;
    if (normItem.includes("glass")) return 420;
    if (normItem.includes("rock")) return 550;
    if (normItem.includes("pir")) return 750;
    return 250;
  }
  if (category === "Drainage") {
    if (normItem.includes("pipe")) {
      if (normItem.includes("20 mm")) return 80;
      if (normItem.includes("25 mm")) return 95;
      if (normItem.includes("32 mm")) return 120;
      if (normItem.includes("40 mm")) return 150;
      if (normItem.includes("50 mm")) return 190;
      if (normItem.includes("63 mm")) return 240;
      return 100;
    }
    if (normItem.includes("elbow")) return 45;
    if (normItem.includes("tee")) return 60;
    if (normItem.includes("coupler")) return 35;
    if (normItem.includes("reducer")) return 50;
    if (normItem.includes("trap")) return 150;
    return 50;
  }
  if (category === "Electrical") {
    if (normItem.includes("cable")) {
      if (normItem.includes("2.5")) return 110;
      if (normItem.includes("4 mm")) return 185;
      if (normItem.includes("6 mm")) return 260;
      if (normItem.includes("10 mm")) return 420;
      if (normItem.includes("16 mm")) return 680;
      if (normItem.includes("25 mm")) return 950;
      if (normItem.includes("35 mm")) return 1250;
      if (normItem.includes("communication")) return 75;
      if (normItem.includes("shielded")) return 90;
      if (normItem.includes("rs485")) return 110;
      if (normItem.includes("bms")) return 150;
      return 120;
    }
    if (normItem.includes("mcb")) return 350;
    if (normItem.includes("mccb")) return 2200;
    if (normItem.includes("rccb")) return 1500;
    if (normItem.includes("elcb")) return 1800;
    if (normItem.includes("isolator")) return 1200;
    if (normItem.includes("contactor")) return 950;
    if (normItem.includes("relay")) return 850;
    return 400;
  }
  if (category === "Ducting") {
    if (normItem.includes("24g")) return 1250;
    if (normItem.includes("22g")) return 1450;
    if (normItem.includes("20g")) return 1650;
    if (normItem.includes("18g")) return 1950;
    if (normItem.includes("pir")) return 1550;
    if (normItem.includes("pre insulated")) return 1650;
    if (normItem.includes("flexible")) return 650;
    if (normItem.includes("canvas")) return 850;
    return 1200;
  }
  if (category === "Air Distribution") {
    if (normItem.includes("supply air grille")) return 1800;
    if (normItem.includes("return air grille")) return 1500;
    if (normItem.includes("egg crate")) return 1400;
    if (normItem.includes("square diffuser")) return 2400;
    if (normItem.includes("round diffuser")) return 2200;
    if (normItem.includes("slot diffuser")) return 3200;
    if (normItem.includes("jet nozzle")) return 4500;
    if (normItem.includes("volume control")) return 1800;
    if (normItem.includes("fire damper")) return 5500;
    if (normItem.includes("smoke damper")) return 6500;
    if (normItem.includes("motorized damper")) return 8500;
    if (normItem.includes("back draft")) return 2500;
    return 2000;
  }
  if (category === "Supports") {
    if (normItem.includes("heavy duty")) return 1200;
    if (normItem.includes("ms frame")) return 1800;
    if (normItem.includes("threaded")) return 280;
    if (normItem.includes("unistrut")) return 450;
    if (normItem.includes("clamps")) return 75;
    if (normItem.includes("hanger")) return 120;
    if (normItem.includes("anchor")) return 45;
    return 200;
  }
  if (category === "Commissioning") {
    if (normItem.includes("n2")) return 3500;
    if (normItem.includes("pressure")) return 2000;
    if (normItem.includes("leak")) return 1500;
    if (normItem.includes("vacuuming")) return 1500;
    if (normItem.includes("flushing")) return 2500;
    if (normItem.includes("charging")) return 2500;
    if (normItem.includes("testing &")) return 5000;
    return 2500;
  }
  if (category === "Logistics") {
    if (normItem.includes("transportation")) return 5000;
    if (normItem.includes("loading charges")) return 1500;
    if (normItem.includes("unloading")) return 1500;
    if (normItem.includes("crane")) return 12000;
    if (normItem.includes("scaffolding")) return 6000;
    if (normItem.includes("shifting")) return 2500;
    return 3000;
  }
  if (category === "Consumables") {
    if (normItem.includes("silver")) return 850;
    if (normItem.includes("flux")) return 350;
    if (normItem.includes("aluminum tape")) return 250;
    if (normItem.includes("insulation tape")) return 90;
    if (normItem.includes("silicone")) return 180;
    if (normItem.includes("nut bolt")) return 650;
    if (normItem.includes("screws")) return 450;
    if (normItem.includes("cable tie")) return 120;
    if (normItem.includes("plug")) return 80;
    return 250;
  }
  return 500;
}

const parseHvacCatalogFromCsvs = (): CatalogItem[] => {
  const items: CatalogItem[] = [];

  // Parse Low Side Material List
  const lowSideLines = lowSideCsvStr.split("\n");
  for (const line of lowSideLines) {
    if (!line.trim() || line.startsWith("Side,Category")) continue;
    const cols = line.split(",");
    if (cols.length < 5) continue;
    const [, category, subCategory, itemName, unit] = cols;
    // Build a unique and clean SKU for each low side item
    const slug = itemName.toUpperCase().replace(/[^A-Z0-9]/g, "-").slice(0, 20);
    const sku = `LOW-${category.toUpperCase().replace(/\s+/g, "-")}-${slug}`;
    items.push({
      sku,
      name: itemName,
      department: "LOW SIDE Material & Services",
      category,
      unit,
      price: getLowSidePrice(category, itemName),
      description: `${itemName} [Unit: ${unit}]. ${category} - ${subCategory}. High-quality grade standard.`,
      isFavorite: false,
      series: "",
      type: category,
      technology: "",
      mode: "",
      starRating: "",
      refrigerant: "",
      powerSupply: "",
      coolingTr: "",
      heatingTr: "",
      fcu: sku,
      cu: "",
      mrpSetBase: "0",
      dbpWithoutTax: "0",
      discount: "",
      unitPriceWoTax: String(getLowSidePrice(category, itemName)),
      nlcGstPaid: "0"
    });
  }

  // Parse Daikin Units List
  const daikinLines = daikinCsvStr.split("\n");
  for (const line of daikinLines) {
    if (!line.trim() || line.startsWith("Series,Type")) continue;
    const cols = line.split(",");
    if (cols.length < 16) continue;
    const [series, type, technology, mode, starRating, refrigerant, powerSupply, coolingTr, heatingTr, fcu, cu, mrpSetBase, dbpWithoutTax, discount, unitPriceWoTaxStr, nlcGstPaid] = cols;
    
    // Choose a unique SKU
    const sku = fcu ? fcu.trim() : (cu ? cu.trim() : `DKN-${series.trim()}-${coolingTr.trim()}`);
    const price = Number(unitPriceWoTaxStr.replace(/[^0-9.]/g, "")) || 0;
    const starStr = starRating ? starRating.trim() : "NA";
    const refStr = refrigerant ? refrigerant.trim() : "NA";

    // Detect Category (Cassette vs Ductable vs Floor Standing) based on type
    let category = "Cassette";
    if (type.toLowerCase().includes("ductable") || type.toLowerCase().includes("concealed")) {
      category = "Ductable";
    } else if (type.toLowerCase().includes("floor") || type.toLowerCase().includes("tower")) {
      category = "Floor Standing";
    }

    const coolVal = coolingTr ? coolingTr.trim() : "";
    const heatVal = heatingTr ? heatingTr.trim() : "";
    const extraTrs = `Cooling: ${coolVal} TR${heatVal ? `, Heating: ${heatVal} TR` : ""}`;

    items.push({
      sku,
      name: `Daikin ${series.trim()} AC ${coolingTr.trim()} TR (${sku})`,
      department: "Major Components",
      category,
      unit: "set",
      price,
      description: `${type.trim()} - Series ${series.trim()}. ${technology.trim()} ${mode.trim()}, ${starStr}, Power: ${powerSupply.trim()}, Ref: ${refStr}. ${extraTrs}`,
      isFavorite: false,
      series: series.trim(),
      type: type.trim(),
      technology: technology.trim(),
      mode: mode.trim(),
      starRating: starStr,
      refrigerant: refStr,
      powerSupply: powerSupply.trim(),
      coolingTr: coolVal,
      heatingTr: heatVal,
      fcu: fcu ? fcu.trim() : "",
      cu: cu ? cu.trim() : "",
      mrpSetBase: mrpSetBase ? mrpSetBase.trim() : "0",
      dbpWithoutTax: dbpWithoutTax ? dbpWithoutTax.trim() : "0",
      discount: discount ? discount.trim() : "",
      unitPriceWoTax: unitPriceWoTaxStr ? unitPriceWoTaxStr.trim() : "0",
      nlcGstPaid: nlcGstPaid ? nlcGstPaid.trim() : "0"
    });
  }

  return items;
};

export const mockHvacCatalog: CatalogItem[] = parseHvacCatalogFromCsvs();

/*
export const mockHvacCatalogOld: CatalogItem[] = [
  // --- QUICK ADD ITEMS ---
  {
    sku: "FILT-001",
    name: "AC Filter 1 Ton",
    department: "Spare Parts",
    category: "Filters",
    unit: "piece",
    price: 450,
    description: "High-efficiency primary air filter for 1.0 Ton Split units.",
    isFavorite: true
  },
  {
    sku: "FILT-002",
    name: "AC Filter 1.5 Ton",
    department: "Spare Parts",
    category: "Filters",
    unit: "piece",
    price: 550,
    description: "Standard primary air filter replacement for 1.5 Ton units.",
    isFavorite: true
  },
  {
    sku: "FILT-003",
    name: "AC Filter 2 Ton",
    department: "Spare Parts",
    category: "Filters",
    unit: "piece",
    price: 650,
    description: "Heavy-duty air filter replacement for 2.0 Ton split/cassette systems.",
    isFavorite: true
  },
  {
    sku: "REMOTE-001",
    name: "AC Remote Universal",
    department: "Controls & Electrical",
    category: "Controls",
    unit: "piece",
    price: 450,
    description: "Universal multi-brand digital LCD AC remote controller.",
    isFavorite: true
  },
  {
    sku: "CTRL-002",
    name: "Capacitor 2.5 MFD",
    department: "Controls & Electrical",
    category: "Electrical",
    unit: "piece",
    price: 180,
    description: "Dual run motor starting capacitor 2.5 MFD, 440V AC."
  },
  {
    sku: "CTRL-003",
    name: "Capacitor 4.0 MFD",
    department: "Controls & Electrical",
    category: "Electrical",
    unit: "piece",
    price: 240,
    description: "Heavy duty compressor starting capacitor 4.0 MFD."
  },
  {
    sku: "PUMP-003",
    name: "Condensate Pump",
    department: "Major Components",
    category: "Pumps",
    unit: "piece",
    price: 2800,
    description: "Automated low-noise drain condensate water removal pump.",
    isFavorite: true
  },
  {
    sku: "ACC-001",
    name: "Condenser Coil Cleaner",
    department: "Tools & Consumables",
    category: "Accessories",
    unit: "piece",
    price: 350,
    description: "Alkaline foam chemical liquid spray for coil cleaning.",
    isFavorite: true
  },
  {
    sku: "PIPE-003",
    name: "Copper Pipe 1/2 inch",
    department: "Installation",
    category: "Pipes",
    unit: "meter",
    price: 620,
    description: "Seamless soft drawn HVAC copper piping, 1/2'' outer diameter."
  },
  {
    sku: "PIPE-001",
    name: "Copper Pipe 1/4 inch",
    department: "Installation",
    category: "Pipes",
    unit: "meter",
    price: 380,
    description: "Seamless HVAC Grade copper tube coil, 1/4'' OD."
  },
  {
    sku: "PIPE-002",
    name: "Copper Pipe 3/8 inch",
    department: "Installation",
    category: "Pipes",
    unit: "meter",
    price: 480,
    description: "Seamless soft copper piping coil, 3/8'' OD."
  },
  {
    sku: "THERM-001",
    name: "Digital Thermostat",
    department: "Controls & Electrical",
    category: "Controls",
    unit: "piece",
    price: 1500,
    description: "Wall-mount programmable LCD digital thermostat controller.",
    isFavorite: true
  },
  {
    sku: "SEAL-003",
    name: "Duct Tape HVAC",
    department: "Tools & Consumables",
    category: "Accessories",
    unit: "piece",
    price: 180,
    description: "Industrial strength silver duct adhesive wrapping tape."
  },
  {
    sku: "VALV-006",
    name: "Filter Drier 3/8",
    department: "Spare Parts",
    category: "Valves",
    unit: "piece",
    price: 320,
    description: "Liquid line flare filter drier, 3/8'' size."
  },

  // --- RECENTLY ADDED ITEMS ---
  {
    sku: "GAS-001",
    name: "R32 Refrigerant Gas",
    department: "Spare Parts",
    category: "Refrigerants",
    unit: "kg",
    price: 850,
    description: "Eco-friendly high cooling efficiency R-32 refrigerant gas cylinder."
  },
  {
    sku: "INS-001",
    name: "Insulation Tape Roll",
    department: "Installation",
    category: "Insulation",
    unit: "piece",
    price: 120,
    description: "Self-adhesive black nitrile rubber insulation foam tape."
  },
  {
    sku: "SEAL-001",
    name: "Gasket Seal Kit",
    department: "Tools & Consumables",
    category: "Accessories",
    unit: "set",
    price: 250,
    description: "Assorted neoprene compressor mounting gasket rings."
  },
  {
    sku: "WIRE-001",
    name: "Copper Cable 2.5 sqmm",
    department: "Controls & Electrical",
    category: "Electrical",
    unit: "meter",
    price: 95,
    description: "3-core flexible copper multi-strand power connection cable."
  },
  {
    sku: "COMP-001",
    name: "Compressor 1 Ton",
    department: "Major Components",
    category: "Compressors",
    unit: "set",
    price: 12500,
    description: "Rotary hermetic compressor replacement for 1.0 TR AC systems."
  },
  {
    sku: "BRKT-001",
    name: "Outdoor Unit Bracket",
    department: "Installation",
    category: "Mounting",
    unit: "set",
    price: 850,
    description: "Heavy gauge powder-coated MS outdoor condenser wall bracket set."
  },

  // --- DAIKIN UNITS ---
  {
    sku: "DKN-FCQF18",
    name: "Daikin Cassette 1.51 TR (FCQF18CV16)",
    department: "Major Components",
    category: "Compressors",
    unit: "set",
    price: 58848,
    description: "Daikin Ceiling Mounted Cassette (3x3 panel) Non-Inverter, 1 Star, single phase."
  },
  {
    sku: "DKN-FCQF24",
    name: "Daikin Cassette 2.0 TR (FCQF24ARV16)",
    department: "Major Components",
    category: "Compressors",
    unit: "set",
    price: 62784,
    description: "Daikin Ceiling Mounted Cassette Non-Inverter, 1 Star, single phase, R-22 model."
  },
  {
    sku: "DKN-FCQF30",
    name: "Daikin Cassette 2.5 TR (FCQF30ARV16)",
    department: "Major Components",
    category: "Compressors",
    unit: "set",
    price: 75552,
    description: "Daikin Ceiling Mounted Cassette Non-Inverter, 1 Star, single phase."
  },
  {
    sku: "DKN-FCFQ50",
    name: "Daikin Cassette Inverter 1.42 TR (FCFQ50CV16)",
    department: "Major Components",
    category: "Compressors",
    unit: "set",
    price: 57888,
    description: "Daikin 3 Star Inverter Ceiling Cassette (FCFQ50CV16 / RZCFQ50CV16) Cordless."
  },
  {
    sku: "DKN-FCFQ71",
    name: "Daikin Cassette Inverter 2.0 TR (FCFQ71CV16)",
    department: "Major Components",
    category: "Compressors",
    unit: "set",
    price: 66624,
    description: "Daikin 3 Star Inverter Ceiling Cassette (FCFQ71CV16 / RZCFQ71CV16) Cordless."
  },
  {
    sku: "DKN-FCMF50",
    name: "Daikin Cassette 1.51 TR 5 Star (FCMF50CV16)",
    department: "Major Components",
    category: "Compressors",
    unit: "set",
    price: 77760,
    description: "Daikin 5 Star Inverter Ceiling Mounted Cassette (FCMF50CV16 / RZCMF50CV16)."
  },
  {
    sku: "DKN-FDBF12",
    name: "Daikin Ductable Low Static 1 TR (FDBF12CRV16)",
    department: "Major Components",
    category: "Compressors",
    unit: "set",
    price: 37824,
    description: "Daikin Non-Inverter low-noise documentation / ductable AC (FDBF12CRV16 / RGF12CRV16)."
  },
  {
    sku: "DKN-FDBF18",
    name: "Daikin Ductable Low Static 1.5 TR (FDBF18CRV16)",
    department: "Major Components",
    category: "Compressors",
    unit: "set",
    price: 39648,
    description: "Daikin Non-Inverter low static ductable unit, single phase."
  },
  {
    sku: "DKN-FDBF24",
    name: "Daikin Ductable Low Static 2 TR (FDBF24CRV16)",
    department: "Major Components",
    category: "Compressors",
    unit: "set",
    price: 51648,
    description: "Daikin Ceiling Ductable Low Static Non-Inverter, single phase."
  },
  {
    sku: "DKN-FDBF36",
    name: "Daikin Ductable Low Static 3 TR (FDBF36CRV16)",
    department: "Major Components",
    category: "Compressors",
    unit: "set",
    price: 72576,
    description: "Daikin Ceiling Ductable Low Static Non-Inverter, three phase, R-32."
  },
  {
    sku: "DKN-FDMF50",
    name: "Daikin Ductable 1.5 TR Inverter (FDMF50BRV16)",
    department: "Major Components",
    category: "Compressors",
    unit: "set",
    price: 66336,
    description: "Daikin Inverter Low/Mid Static ductable AC with wireless remote."
  },
  {
    sku: "DKN-FDMF71",
    name: "Daikin Ductable 2.0 TR Inverter (FDMF71BRV16)",
    department: "Major Components",
    category: "Compressors",
    unit: "set",
    price: 73152,
    description: "Daikin Inverter Low/Mid Static ductable unit (FDMF71BRV16 / RZMF71BRV16)."
  },
  {
    sku: "DKN-FVFS24",
    name: "Daikin Floor Standing 2 TR (FVFS24AV16)",
    department: "Major Components",
    category: "Compressors",
    unit: "set",
    price: 71683,
    description: "Daikin Floor Standing Type (Tower) AC, Non Inverter, R-32 refrigerant."
  },
  {
    sku: "DKN-FDKR200",
    name: "Daikin Ductable High Static 5.5 TR (FDKR200BV16)",
    department: "Major Components",
    category: "Compressors",
    unit: "set",
    price: 144192,
    description: "Daikin High Static Ductable system, Wired remote, R-410A refrigerant."
  },

  // --- LOW SIDE MATERIALS & SERVICES ---
  {
    sku: "LOW-INSTALL-CASSETTE",
    name: "Cassette AC Installation Service",
    department: "Installation",
    category: "Mounting",
    unit: "piece",
    price: 4500,
    description: "Standard Ceiling Cassette AC Indoor + Outdoor unit mounting & gas purging."
  },
  {
    sku: "LOW-INSTALL-DUCTABLE",
    name: "Ductable AC Installation & Commissioning",
    department: "Installation",
    category: "Mounting",
    unit: "piece",
    price: 6500,
    description: "Ductable indoor layout anchoring, vibration isolation, and test commissioning."
  },
  {
    sku: "LOW-INSTALL-TOWER",
    name: "Tower AC (Floor Standing) Installation",
    department: "Installation",
    category: "Mounting",
    unit: "piece",
    price: 5000,
    description: "Floor standing tower indoor unit alignment and outdoor unit rigging/brackets."
  },
  {
    sku: "LOW-INSTALL-SPLIT",
    name: "Split AC Standard Installation",
    department: "Installation",
    category: "Mounting",
    unit: "piece",
    price: 2000,
    description: "Standard wall-mount split AC installation including indoor plate & 3m pipe wrapping."
  },
  {
    sku: "LOW-PIPE-14",
    name: "Copper Pipe 1/4 inch with Sleeve",
    department: "Installation",
    category: "Pipes",
    unit: "meter",
    price: 380,
    description: "Seamless 1/4'' copper tube wrapped in 9mm Nitrile rubber sleeve."
  },
  {
    sku: "LOW-PIPE-38",
    name: "Copper Pipe 3/8 inch with Sleeve",
    department: "Installation",
    category: "Pipes",
    unit: "meter",
    price: 480,
    description: "Seamless 3/8'' copper tube wrapped in 9mm insulation."
  },
  {
    sku: "LOW-PIPE-12",
    name: "Copper Pipe 1/2 inch with Sleeve",
    department: "Installation",
    category: "Pipes",
    unit: "meter",
    price: 620,
    description: "Seamless 1/2'' copper liquid/suction tube with insulation sleeve."
  },
  {
    sku: "LOW-PIPE-58",
    name: "Copper Pipe 5/8 inch with Sleeve",
    department: "Installation",
    category: "Pipes",
    unit: "meter",
    price: 780,
    description: "Seamless 5/8'' copper refrigerant pipe with heavy insulation."
  },
  {
    sku: "LOW-PIPE-34",
    name: "Copper Pipe 3/4 inch with Sleeve",
    department: "Installation",
    category: "Pipes",
    unit: "meter",
    price: 920,
    description: "Seamless 3/4'' heavy duty suction line copper pipe."
  },
  {
    sku: "LOW-FIT-ELBOW",
    name: "Copper Elbow Fitting",
    department: "Installation",
    category: "Fittings",
    unit: "piece",
    price: 150,
    description: "Standard 90-degree copper elbow for brazing refrigerant lines."
  },
  {
    sku: "LOW-FIT-TEE",
    name: "Copper Tee Equal Fitting",
    department: "Installation",
    category: "Fittings",
    unit: "piece",
    price: 220,
    description: "Brazing equal-port copper T-joint fitting."
  },
  {
    sku: "LOW-INS-NITRILE-9",
    name: "9 mm Nitrile Rubber Insulation",
    department: "Installation",
    category: "Insulation",
    unit: "meter",
    price: 140,
    description: "Flexible elastomeric closed-cell foam insulation sleeve 9mm wall thickness."
  },
  {
    sku: "LOW-INS-NITRILE-13",
    name: "13 mm Nitrile Rubber Insulation",
    department: "Installation",
    category: "Insulation",
    unit: "meter",
    price: 180,
    description: "Thick elastomeric thermal insulation sleeve 13mm wall thickness."
  },
  {
    sku: "LOW-INS-XLPE",
    name: "XLPE Duct Insulation Sheet",
    department: "Installation",
    category: "Insulation",
    unit: "meter",
    price: 350,
    description: "Cross-linked polyethylene closed-cell sheet insulation for air ducts."
  },
  {
    sku: "LOW-DRAIN-PVC-25",
    name: "PVC Drainage Pipe 25 mm",
    department: "Installation",
    category: "Drainage",
    unit: "meter",
    price: 95,
    description: "Heavy duty rigid PVC drainage pipe, 25mm diameter."
  },
  {
    sku: "LOW-DRAIN-PVC-32",
    name: "PVC Drainage Pipe 32 mm",
    department: "Installation",
    category: "Drainage",
    unit: "meter",
    price: 120,
    description: "Heavy duty rigid PVC condensate drain pipe, 32mm diameter."
  },
  {
    sku: "LOW-ELEC-CAB-25",
    name: "Power Cable 2.5 MM 4 Core",
    department: "Controls & Electrical",
    category: "Electrical",
    unit: "meter",
    price: 110,
    description: "Multi-core copper flexible cable for indoor-to-outdoor power linkage."
  },
  {
    sku: "LOW-ELEC-CAB-40",
    name: "Power Cable 4.0 MM 4 Core",
    department: "Controls & Electrical",
    category: "Electrical",
    unit: "meter",
    price: 185,
    description: "High capacity copper power cable for 2.0/2.5 TR AC units."
  },
  {
    sku: "LOW-ELEC-COMM-15",
    name: "Communication Cable 1.5 SQMM",
    department: "Controls & Electrical",
    category: "Electrical",
    unit: "meter",
    price: 75,
    description: "Shielded communication wire for VRV/VRF internal transmission lines."
  },
  {
    sku: "LOW-DUCT-24G",
    name: "GI Ducting 24G",
    department: "Installation",
    category: "Installation",
    unit: "set",
    price: 1250,
    description: "Galvanized Iron sheet metal ducting fabrication, 24-gauge rating."
  },
  {
    sku: "LOW-DUCT-FLEX",
    name: "Flexible Duct 200mm Dia",
    department: "Installation",
    category: "Installation",
    unit: "meter",
    price: 650,
    description: "Double layer aluminum flexible round duct for diffusers linkage."
  },
  {
    sku: "LOW-DIST-GRILLE-S",
    name: "Supply Air Grille",
    department: "Tools & Consumables",
    category: "Accessories",
    unit: "piece",
    price: 1800,
    description: "Extruded aluminum powder-coated supply air grille with volume control damper."
  },
  {
    sku: "LOW-DIST-GRILLE-R",
    name: "Return Air Grille",
    department: "Tools & Consumables",
    category: "Accessories",
    unit: "piece",
    price: 1500,
    description: "Powder-coated aluminum return air grille without damper."
  },
  {
    sku: "LOW-DIST-DIFFUSER",
    name: "Square Ceiling Diffuser 2x2",
    department: "Tools & Consumables",
    category: "Accessories",
    unit: "piece",
    price: 2400,
    description: "4-way throw ceiling diffusers size 600mm x 600mm."
  },
  {
    sku: "LOW-SUPP-FRAME",
    name: "MS Structural Mounting Frame",
    department: "Installation",
    category: "Mounting",
    unit: "piece",
    price: 1800,
    description: "Rigid mild steel hot-dip galvanized frame for safe roof/floor installation."
  },
  {
    sku: "LOW-SUPP-THREAD",
    name: "Threaded Support Rod 8mm",
    department: "Installation",
    category: "Mounting",
    unit: "piece",
    price: 280,
    description: "Galvanized steel threaded support hangers for indoor unit suspending."
  },
  {
    sku: "LOW-TEST-N2",
    name: "Nitrogen Leak Testing Service",
    department: "Spare Parts",
    category: "Accessories",
    unit: "lot",
    price: 3500,
    description: "Dry Nitrogen pressurization up to 350 PSI for 24 hours leak hold check."
  },
  {
    sku: "LOW-TEST-VAC",
    name: "System Vacuuming & Dehydration",
    department: "Spare Parts",
    category: "Accessories",
    unit: "lot",
    price: 1500,
    description: "Deep vacuuming down to 500 microns with digital vacuum gauge record."
  },
  {
    sku: "LOW-TEST-CHARG",
    name: "Refrigerant Gas Charging R32",
    department: "Spare Parts",
    category: "Refrigerants",
    unit: "lot",
    price: 2500,
    description: "Additional refrigerant top-up charging beyond standard pre-charged piping lengths."
  },
  {
    sku: "LOW-LOG-TRANS",
    name: "Transportation & Logistics Charges",
    department: "Tools & Consumables",
    category: "Accessories",
    unit: "lot",
    price: 5000,
    description: "Truck rental, fuel, and municipal toll fees for standard urban site transit."
  },
  {
    sku: "LOW-LOG-LIFT",
    name: "Material Loading & Rigging Lift",
    department: "Tools & Consumables",
    category: "Accessories",
    unit: "lot",
    price: 2000,
    description: "Manual material shifting, high-floor staircase hoisting, and positioning."
  },
  {
    sku: "LOW-CONS-BRAZING",
    name: "Silver Brazing Consumables",
    department: "Tools & Consumables",
    category: "Accessories",
    unit: "kg",
    price: 850,
    description: "Silver brazing alloy solder sticks (2% to 5%) and active borax flux."
  },
  {
    sku: "LOW-CONS-TAPE",
    name: "Aluminum & Insulation Wrapping Tape",
    department: "Tools & Consumables",
    category: "Accessories",
    unit: "piece",
    price: 220,
    description: "UV-resistant protective outer vinyl pipe wrapping tapes."
  },
  {
    sku: "LOW-CONS-HARDWARE",
    name: "Fasteners & Clamps Assembly Set",
    department: "Tools & Consumables",
    category: "Accessories",
    unit: "set",
    price: 1500,
    description: "M8/M10 anchor expander fasteners, vibration isolator rubber pads, and copper pipe clamps."
  }
];
*/

