from datetime import date

from django.core.management.base import BaseCommand

from office.models import Client, Department, Employee, EmployeeSkill, Project, Site, Task


class Command(BaseCommand):
    help = 'Seed sample HVAC employees, service jobs, and job tasks.'

    def handle(self, *args, **options):
        Task.objects.all().delete()
        Project.objects.all().delete()
        Client.objects.all().delete()
        Site.objects.all().delete()
        EmployeeSkill.objects.all().delete()
        Employee.objects.all().delete()
        Department.objects.all().delete()

        executive = Department.objects.create(name='Executive', description='Leadership team')
        operations = Department.objects.create(name='Operations', description='Operations management')
        field_operations = Department.objects.create(name='Field Operations', description='HVAC field supervisors')
        service = Department.objects.create(name='Service', description='HVAC technicians')
        dispatch = Department.objects.create(name='Dispatch', description='Scheduling and customer coordination')

        ceo = Employee.objects.create(
            aadhar_number='111122223333',
            first_name='Priya',
            last_name='Raman',
            name='Priya Raman',
            email='priya@supercoolhvac.local',
            phone='9000000001',
            address='Head Office, MG Road',
            city='Bengaluru',
            state='Karnataka',
            postal_code='560001',
            hire_date=date(2020, 1, 10),
            employment_status=Employee.Status.ACTIVE,
            department_name=executive,
            job_title=Employee.JobTitle.CEO,
            title='CEO',
            daily_wage=9000,
            daily_incentive_earned=1500,
            service_area='All zones',
            availability=Employee.Availability.AVAILABLE,
        )
        manager = Employee.objects.create(
            aadhar_number='222233334444',
            first_name='Omar',
            last_name='Khan',
            name='Omar Khan',
            email='omar@supercoolhvac.local',
            phone='9000000002',
            address='Operations Office',
            city='Bengaluru',
            state='Karnataka',
            postal_code='560002',
            hire_date=date(2021, 3, 15),
            employment_status=Employee.Status.ACTIVE,
            department_name=operations,
            manager=ceo,
            job_title=Employee.JobTitle.MANAGER,
            title='Operations Manager',
            daily_wage=5500,
            daily_incentive_earned=900,
            service_area='All zones',
            availability=Employee.Availability.AVAILABLE,
        )
        maya = Employee.objects.create(
            aadhar_number='333344445555',
            first_name='Maya',
            last_name='Kapoor',
            name='Maya Kapoor',
            email='maya@supercoolhvac.local',
            phone='9000000003',
            address='North Zone Office',
            city='Bengaluru',
            state='Karnataka',
            postal_code='560003',
            hire_date=date(2022, 4, 12),
            employment_status=Employee.Status.ACTIVE,
            department_name=field_operations,
            manager=manager,
            job_title=Employee.JobTitle.SUPERVISOR,
            title='HVAC Supervisor',
            department='Field Operations',
            service_area='North Zone',
            daily_wage=3500,
            daily_incentive_earned=500,
        )
        arjun = Employee.objects.create(
            aadhar_number='444455556666',
            first_name='Arjun',
            last_name='Mehta',
            name='Arjun Mehta',
            email='arjun@supercoolhvac.local',
            phone='9000000004',
            address='Central Zone Depot',
            city='Bengaluru',
            state='Karnataka',
            postal_code='560004',
            hire_date=date(2023, 2, 1),
            employment_status=Employee.Status.ACTIVE,
            department_name=service,
            manager=maya,
            job_title=Employee.JobTitle.SENIOR_TECHNICIAN,
            title='Senior HVAC Technician',
            department='Service',
            service_area='Central Zone',
            daily_wage=2800,
            daily_incentive_earned=400,
            plate_number='KA-01-HV-1201',
            make='Tata',
            model='Ace',
            year=2024,
        )
        lina = Employee.objects.create(
            aadhar_number='555566667777',
            first_name='Lina',
            last_name='Fernandes',
            name='Lina Fernandes',
            email='lina@supercoolhvac.local',
            phone='9000000005',
            address='Dispatch Center',
            city='Bengaluru',
            state='Karnataka',
            postal_code='560005',
            hire_date=date(2023, 8, 7),
            employment_status=Employee.Status.ACTIVE,
            department_name=dispatch,
            manager=manager,
            job_title=Employee.JobTitle.DISPATCHER,
            title='Dispatcher',
            department='Dispatch',
            service_area='All zones',
            daily_wage=1800,
            daily_incentive_earned=250,
        )
        dev = Employee.objects.create(
            aadhar_number='666677778888',
            first_name='Dev',
            last_name='Iyer',
            name='Dev Iyer',
            email='dev@supercoolhvac.local',
            phone='9000000006',
            address='South Zone Depot',
            city='Bengaluru',
            state='Karnataka',
            postal_code='560006',
            hire_date=date(2024, 1, 20),
            employment_status=Employee.Status.ACTIVE,
            department_name=service,
            manager=maya,
            job_title=Employee.JobTitle.TECHNICIAN,
            title='HVAC Technician',
            department='Service',
            service_area='South Zone',
            daily_wage=2200,
            daily_incentive_earned=300,
            plate_number='KA-01-HV-1202',
            make='Mahindra',
            model='Bolero Pickup',
            year=2023,
        )

        EmployeeSkill.objects.bulk_create(
            [
                EmployeeSkill(
                    employee=ceo,
                    skill_name='HVAC business operations',
                    skill_level=EmployeeSkill.SkillLevel.EXPERT,
                    certificate_number='CERT-OPS-0001',
                    issuing_authority='HVAC Leadership Board',
                    issue_date=date(2021, 1, 15),
                ),
                EmployeeSkill(
                    employee=manager,
                    skill_name='Field operations planning',
                    skill_level=EmployeeSkill.SkillLevel.EXPERT,
                    certificate_number='CERT-OPS-1001',
                    issuing_authority='HVAC Safety Board',
                    issue_date=date(2021, 6, 10),
                ),
                EmployeeSkill(
                    employee=maya,
                    skill_name='Commercial HVAC',
                    skill_level=EmployeeSkill.SkillLevel.EXPERT,
                    certificate_number='CERT-HVAC-1001',
                    issuing_authority='HVAC Safety Board',
                    issue_date=date(2022, 5, 20),
                ),
                EmployeeSkill(
                    employee=arjun,
                    skill_name='AC repair',
                    skill_level=EmployeeSkill.SkillLevel.EXPERT,
                    certificate_number='CERT-HVAC-2001',
                    issuing_authority='EPA Training Partner',
                    issue_date=date(2023, 2, 18),
                ),
                EmployeeSkill(
                    employee=arjun,
                    skill_name='Electrical diagnostics',
                    skill_level=EmployeeSkill.SkillLevel.ADVANCED,
                    certificate_number='CERT-ELEC-2002',
                    issuing_authority='Electrical Safety Board',
                    issue_date=date(2023, 4, 9),
                ),
                EmployeeSkill(
                    employee=lina,
                    skill_name='Dispatch coordination',
                    skill_level=EmployeeSkill.SkillLevel.ADVANCED,
                    certificate_number='CERT-DISP-3001',
                    issuing_authority='Customer Operations Academy',
                    issue_date=date(2023, 9, 5),
                ),
                EmployeeSkill(
                    employee=dev,
                    skill_name='Preventive maintenance',
                    skill_level=EmployeeSkill.SkillLevel.INTERMEDIATE,
                    certificate_number='CERT-HVAC-4001',
                    issuing_authority='EPA Training Partner',
                    issue_date=date(2024, 2, 12),
                ),
            ]
        )

        metro_client = Client.objects.create(
            client_name='Ravi Shah',
            company_name='Metro Plaza',
            mobile='9888800001',
            email='ravi@metroplaza.local',
            address='22 Market Road, Bengaluru',
            project_name='Rooftop HVAC Replacement',
            location='Metro Plaza Rooftop',
            building_type=Client.BuildingType.COMMERCIAL,
            approx_area='45,000 sq ft',
            requirement=Client.RequirementType.NEW_INSTALLATION,
            preferred_hvac_system=Client.PreferredSystem.PACKAGE_UNIT,
            current_challenges='Existing rooftop unit has weak cooling and frequent compressor trips.',
            budget_range='INR 15L - 20L',
            expected_completion_date=date(2026, 8, 15),
        )
        greenfield_client = Client.objects.create(
            client_name='Nisha Rao',
            company_name='Greenfield Apartment Association',
            mobile='9888800002',
            email='nisha@greenfield.local',
            address='14 Lake View Street, Bengaluru',
            project_name='Annual Maintenance Contract',
            location='Greenfield Apartments',
            building_type=Client.BuildingType.RESIDENTIAL,
            approx_area='120 apartments',
            requirement=Client.RequirementType.AMC,
            preferred_hvac_system=Client.PreferredSystem.SPLIT_AC,
            current_challenges='Common-area AC units need scheduled preventive maintenance.',
            budget_range='INR 3L - 5L',
            expected_completion_date=date(2026, 7, 31),
        )

        Site.objects.create(
            client=metro_client,
            site_name='Metro Plaza Rooftop',
            customer_name='Metro Plaza',
            contact_person='Ravi Shah',
            contact_phone='9888800001',
            contact_email='facilities@metroplaza.local',
            address='22 Market Road',
            city='Bengaluru',
            state='Karnataka',
            postal_code='560010',
            site_type=Site.SiteType.COMMERCIAL,
            property_type='Retail complex',
            service_zone='Central Zone',
            landmark='Near City Metro Station',
            access_instructions='Use service lift B. Security pass required.',
            preferred_visit_time='10 AM - 5 PM',
            equipment_summary='Two rooftop packaged units, lobby split AC units, AHU room on terrace.',
            assigned_manager=maya,
            status=Site.Status.ACTIVE,
        )
        Site.objects.create(
            client=greenfield_client,
            site_name='Greenfield Apartments',
            customer_name='Greenfield Apartment Association',
            contact_person='Nisha Rao',
            contact_phone='9888800002',
            contact_email='admin@greenfield.local',
            address='14 Lake View Street',
            city='Bengaluru',
            state='Karnataka',
            postal_code='560011',
            site_type=Site.SiteType.RESIDENTIAL,
            property_type='Apartment complex',
            service_zone='North Zone',
            landmark='Opposite Lake Park',
            access_instructions='Visitor entry at gate 2. Coordinate apartment access with security.',
            preferred_visit_time='9 AM - 1 PM',
            equipment_summary='Common-area split AC systems and clubhouse ducted unit.',
            assigned_manager=maya,
            status=Site.Status.ACTIVE,
        )

        internal_tool = Project.objects.create(
            name='Rooftop Unit Repair',
            customer_name='Metro Plaza',
            service_address='22 Market Road, Central Zone',
            equipment_type='Rooftop packaged unit',
            job_type=Project.JobType.REPAIR,
            description='Diagnose weak cooling and unusual compressor noise on the main rooftop unit.',
            status=Project.Status.IN_PROGRESS,
            start_date=date(2026, 6, 1),
            owner=arjun,
        )
        website_refresh = Project.objects.create(
            name='Preventive Maintenance Visit',
            customer_name='Greenfield Apartments',
            service_address='14 Lake View Street, North Zone',
            equipment_type='Split AC systems',
            job_type=Project.JobType.MAINTENANCE,
            description='Quarterly preventive maintenance for lobby and common-area split AC units.',
            status=Project.Status.SCHEDULED,
            start_date=date(2026, 7, 1),
            owner=maya,
        )

        Task.objects.bulk_create(
            [
                Task(
                    title='Inspect compressor and contactor',
                    description='Check compressor amp draw, contactor wear, and wiring condition.',
                    status=Task.Status.IN_PROGRESS,
                    priority=Task.Priority.HIGH,
                    due_date=date(2026, 6, 24),
                    project=internal_tool,
                    assignee=arjun,
                ),
                Task(
                    title='Clean condenser coil',
                    description='Clean debris from the condenser coil and verify airflow.',
                    status=Task.Status.REVIEW,
                    priority=Task.Priority.MEDIUM,
                    due_date=date(2026, 6, 22),
                    project=internal_tool,
                    assignee=dev,
                ),
                Task(
                    title='Prepare refrigerant pressure report',
                    description='Record suction and discharge pressures after the repair check.',
                    status=Task.Status.TODO,
                    priority=Task.Priority.URGENT,
                    due_date=date(2026, 6, 21),
                    project=internal_tool,
                    assignee=maya,
                ),
                Task(
                    title='Schedule apartment unit access',
                    description='Coordinate access windows with building management and residents.',
                    status=Task.Status.TODO,
                    priority=Task.Priority.LOW,
                    due_date=date(2026, 7, 8),
                    project=website_refresh,
                    assignee=lina,
                ),
            ]
        )

        self.stdout.write(self.style.SUCCESS('Seeded HVAC sample data.'))
