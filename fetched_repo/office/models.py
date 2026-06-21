import re

from django.db import models


class Department(models.Model):
    name = models.CharField(max_length=120, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Site(models.Model):
    class SiteType(models.TextChoices):
        RESIDENTIAL = 'RESIDENTIAL', 'Residential'
        COMMERCIAL = 'COMMERCIAL', 'Commercial'
        INDUSTRIAL = 'INDUSTRIAL', 'Industrial'
        GOVERNMENT = 'GOVERNMENT', 'Government'
        OTHER = 'OTHER', 'Other'

    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        ON_HOLD = 'ON_HOLD', 'On hold'
        INACTIVE = 'INACTIVE', 'Inactive'

    site_code = models.CharField(max_length=20, unique=True, blank=True, null=True)
    client = models.ForeignKey(
        'Client',
        on_delete=models.SET_NULL,
        related_name='sites',
        blank=True,
        null=True,
    )
    site_name = models.CharField(max_length=180)
    customer_name = models.CharField(max_length=180)
    contact_person = models.CharField(max_length=160, blank=True)
    contact_phone = models.CharField(max_length=30, blank=True)
    contact_email = models.EmailField(blank=True)
    address = models.TextField()
    city = models.CharField(max_length=120)
    state = models.CharField(max_length=120)
    postal_code = models.CharField(max_length=20, blank=True)
    site_type = models.CharField(max_length=30, choices=SiteType.choices, default=SiteType.COMMERCIAL)
    property_type = models.CharField(max_length=120, blank=True)
    service_zone = models.CharField(max_length=120, blank=True)
    landmark = models.CharField(max_length=180, blank=True)
    access_instructions = models.TextField(blank=True)
    preferred_visit_time = models.CharField(max_length=120, blank=True)
    equipment_summary = models.TextField(blank=True)
    assigned_manager = models.ForeignKey(
        'Employee',
        on_delete=models.SET_NULL,
        related_name='managed_sites',
        blank=True,
        null=True,
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['site_code', 'site_name']

    def __str__(self):
        return f'{self.site_code or "New"} - {self.site_name}'

    def save(self, *args, **kwargs):
        if not self.site_code:
            self.site_code = self.next_site_code()
        super().save(*args, **kwargs)

    @classmethod
    def next_site_code(cls):
        max_number = 0
        for code in cls.objects.filter(site_code__startswith='S').values_list('site_code', flat=True):
            match = re.fullmatch(r'S(\d+)', code or '')
            if match:
                max_number = max(max_number, int(match.group(1)))
        return f'S{max_number + 1:03d}'


class Client(models.Model):
    class RequirementType(models.TextChoices):
        NEW_INSTALLATION = 'NEW_INSTALLATION', 'New installation'
        AMC = 'AMC', 'AMC'
        REPAIR = 'REPAIR', 'Repair'

    class BuildingType(models.TextChoices):
        RESIDENTIAL = 'RESIDENTIAL', 'Residential'
        COMMERCIAL = 'COMMERCIAL', 'Commercial'
        INDUSTRIAL = 'INDUSTRIAL', 'Industrial'
        HOSPITALITY = 'HOSPITALITY', 'Hospitality'
        HEALTHCARE = 'HEALTHCARE', 'Healthcare'
        OTHER = 'OTHER', 'Other'

    class PreferredSystem(models.TextChoices):
        SPLIT_AC = 'SPLIT_AC', 'Split AC'
        VRF = 'VRF', 'VRF'
        CHILLER = 'CHILLER', 'Chiller'
        DUCTED = 'DUCTED', 'Ducted system'
        PACKAGE_UNIT = 'PACKAGE_UNIT', 'Package unit'
        NOT_SURE = 'NOT_SURE', 'Not sure'

    client_code = models.CharField(max_length=20, unique=True, blank=True, null=True)
    client_name = models.CharField(max_length=180)
    company_name = models.CharField(max_length=180, blank=True)
    mobile = models.CharField(max_length=30)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    project_name = models.CharField(max_length=180)
    location = models.CharField(max_length=180)
    building_type = models.CharField(max_length=30, choices=BuildingType.choices, default=BuildingType.COMMERCIAL)
    approx_area = models.CharField(max_length=80, blank=True)
    requirement = models.CharField(
        max_length=30,
        choices=RequirementType.choices,
        default=RequirementType.NEW_INSTALLATION,
    )
    preferred_hvac_system = models.CharField(
        max_length=30,
        choices=PreferredSystem.choices,
        default=PreferredSystem.NOT_SURE,
    )
    current_challenges = models.TextField(blank=True)
    budget_range = models.CharField(max_length=120, blank=True)
    expected_completion_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['client_code', 'client_name']

    def __str__(self):
        return f'{self.client_code or "New"} - {self.client_name}'

    def save(self, *args, **kwargs):
        if not self.client_code:
            self.client_code = self.next_client_code()
        super().save(*args, **kwargs)

    @classmethod
    def next_client_code(cls):
        max_number = 0
        for code in cls.objects.filter(client_code__startswith='C').values_list('client_code', flat=True):
            match = re.fullmatch(r'C(\d+)', code or '')
            if match:
                max_number = max(max_number, int(match.group(1)))
        return f'C{max_number + 1:03d}'


class Employee(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        ON_JOB = 'ON_JOB', 'On job'
        ON_LEAVE = 'ON_LEAVE', 'On leave'
        INACTIVE = 'INACTIVE', 'Inactive'

    class EmployeeType(models.TextChoices):
        TECHNICIAN = 'TECHNICIAN', 'Technician'
        SENIOR_TECHNICIAN = 'SENIOR_TECHNICIAN', 'Senior technician'
        SUPERVISOR = 'SUPERVISOR', 'Supervisor'
        MANAGER = 'MANAGER', 'Manager'
        CEO = 'CEO', 'CEO'
        DISPATCHER = 'DISPATCHER', 'Dispatcher'
        ADMIN = 'ADMIN', 'Admin'

    class Availability(models.TextChoices):
        AVAILABLE = 'AVAILABLE', 'Available'
        ASSIGNED = 'ASSIGNED', 'Assigned'
        OFF_DUTY = 'OFF_DUTY', 'Off duty'
        EMERGENCY_ONLY = 'EMERGENCY_ONLY', 'Emergency only'

    class Gender(models.TextChoices):
        FEMALE = 'FEMALE', 'Female'
        MALE = 'MALE', 'Male'
        OTHER = 'OTHER', 'Other'
        PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY', 'Prefer not to say'

    class SkillLevel(models.TextChoices):
        BEGINNER = 'BEGINNER', 'Beginner'
        INTERMEDIATE = 'INTERMEDIATE', 'Intermediate'
        ADVANCED = 'ADVANCED', 'Advanced'
        EXPERT = 'EXPERT', 'Expert'

    class JobTitle(models.TextChoices):
        TECHNICIAN = 'TECHNICIAN', 'Technician'
        SENIOR_TECHNICIAN = 'SENIOR_TECHNICIAN', 'Senior technician'
        SUPERVISOR = 'SUPERVISOR', 'Supervisor'
        MANAGER = 'MANAGER', 'Manager'
        CEO = 'CEO', 'CEO'
        DISPATCHER = 'DISPATCHER', 'Dispatcher'
        ADMIN = 'ADMIN', 'Admin'

    employee_code = models.CharField(max_length=40, unique=True, blank=True, null=True)
    aadhar_number = models.CharField(max_length=20, unique=True, blank=True, null=True)
    first_name = models.CharField(max_length=80, blank=True)
    last_name = models.CharField(max_length=80, blank=True)
    date_of_birth = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=30, choices=Gender.choices, blank=True)
    name = models.CharField(max_length=160)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=30, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=120, blank=True)
    state = models.CharField(max_length=120, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    hire_date = models.DateField(blank=True, null=True)
    employment_status = models.CharField(max_length=30, choices=Status.choices, default=Status.ACTIVE)
    department_id = models.CharField(max_length=40, blank=True)
    department_name = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        related_name='employees',
        blank=True,
        null=True,
    )
    manager = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        related_name='direct_reports',
        blank=True,
        null=True,
    )
    job_title = models.CharField(max_length=40, choices=JobTitle.choices, blank=True)
    salary = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    daily_wage = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    daily_incentive_earned = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    profile_photo = models.FileField(upload_to='employee_profiles/', blank=True)
    title = models.CharField(max_length=120)
    department = models.CharField(max_length=120)
    employee_type = models.CharField(
        max_length=30,
        choices=EmployeeType.choices,
        default=EmployeeType.TECHNICIAN,
    )
    service_area = models.CharField(max_length=160, blank=True)
    skills = models.TextField(blank=True, help_text='Example: AC repair, ducting, refrigeration')
    certifications = models.TextField(blank=True, help_text='Example: EPA 608, electrical safety')
    skill_name = models.CharField(max_length=120, blank=True)
    skill_level = models.CharField(max_length=30, choices=SkillLevel.choices, blank=True)
    experience_certificate_number = models.CharField(max_length=80, blank=True)
    issuing_authority = models.CharField(max_length=160, blank=True)
    issue_date = models.DateField(blank=True, null=True)
    plate_number = models.CharField(max_length=40, blank=True)
    make = models.CharField(max_length=80, blank=True)
    model = models.CharField(max_length=80, blank=True)
    year = models.PositiveIntegerField(blank=True, null=True)
    availability = models.CharField(
        max_length=30,
        choices=Availability.choices,
        default=Availability.AVAILABLE,
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.display_name

    def save(self, *args, **kwargs):
        if not self.employee_code:
            self.employee_code = self.next_employee_code()
        super().save(*args, **kwargs)

    @classmethod
    def next_employee_code(cls):
        max_number = 0
        for code in cls.objects.filter(employee_code__startswith='SPC').values_list('employee_code', flat=True):
            match = re.fullmatch(r'SPC(\d+)', code or '')
            if match:
                max_number = max(max_number, int(match.group(1)))
        return f'SPC{max_number + 1:03d}'

    @property
    def display_name(self):
        full_name = f'{self.first_name} {self.last_name}'.strip()
        return full_name or self.name

    def reporting_chain(self):
        chain = []
        current = self
        seen_ids = set()
        while current and current.pk not in seen_ids:
            chain.append(current)
            seen_ids.add(current.pk)
            current = current.manager
        return list(reversed(chain))


class EmployeeSkill(models.Model):
    class SkillLevel(models.TextChoices):
        BEGINNER = 'BEGINNER', 'Beginner'
        INTERMEDIATE = 'INTERMEDIATE', 'Intermediate'
        ADVANCED = 'ADVANCED', 'Advanced'
        EXPERT = 'EXPERT', 'Expert'

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='skill_records')
    skill_name = models.CharField(max_length=120)
    skill_level = models.CharField(max_length=30, choices=SkillLevel.choices)
    certificate_number = models.CharField(max_length=80, blank=True)
    issuing_authority = models.CharField(max_length=160, blank=True)
    issue_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['skill_name']

    def __str__(self):
        return f'{self.skill_name} - {self.employee.display_name}'


class Project(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = 'SCHEDULED', 'Scheduled'
        IN_PROGRESS = 'IN_PROGRESS', 'In progress'
        ON_HOLD = 'ON_HOLD', 'On hold'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    class JobType(models.TextChoices):
        INSTALLATION = 'INSTALLATION', 'Installation'
        REPAIR = 'REPAIR', 'Repair'
        MAINTENANCE = 'MAINTENANCE', 'Maintenance'
        INSPECTION = 'INSPECTION', 'Inspection'
        EMERGENCY = 'EMERGENCY', 'Emergency'

    name = models.CharField(max_length=180)
    customer_name = models.CharField(max_length=180, blank=True)
    service_address = models.CharField(max_length=255, blank=True)
    equipment_type = models.CharField(max_length=160, blank=True)
    job_type = models.CharField(max_length=30, choices=JobType.choices, default=JobType.REPAIR)
    description = models.TextField()
    owner = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        related_name='owned_projects',
        blank=True,
        null=True,
    )
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SCHEDULED)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        verbose_name = 'service job'
        verbose_name_plural = 'service jobs'

    def __str__(self):
        return self.name


class Task(models.Model):
    class Status(models.TextChoices):
        TODO = 'TODO', 'To do'
        IN_PROGRESS = 'IN_PROGRESS', 'In progress'
        REVIEW = 'REVIEW', 'Review'
        DONE = 'DONE', 'Done'

    class Priority(models.TextChoices):
        LOW = 'LOW', 'Low'
        MEDIUM = 'MEDIUM', 'Medium'
        HIGH = 'HIGH', 'High'
        URGENT = 'URGENT', 'Urgent'

    title = models.CharField(max_length=180)
    description = models.TextField()
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    assignee = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        related_name='assigned_tasks',
        blank=True,
        null=True,
    )
    due_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.TODO)
    priority = models.CharField(max_length=20, choices=Priority.choices, default=Priority.MEDIUM)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['status', 'due_date', '-updated_at']

    def __str__(self):
        return self.title
