from django.contrib import admin

from .models import Client, Department, Employee, EmployeeSkill, Project, Site, Task


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name', 'description')


class EmployeeSkillInline(admin.TabularInline):
    model = EmployeeSkill
    extra = 1


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    inlines = [EmployeeSkillInline]
    list_display = (
        'employee_code',
        'name',
        'job_title',
        'department_name',
        'manager',
        'service_area',
        'availability',
        'employment_status',
        'email',
        'phone',
    )
    list_filter = ('job_title', 'department_name', 'availability', 'employment_status', 'status', 'service_area')
    search_fields = (
        'employee_code',
        'aadhar_number',
        'first_name',
        'last_name',
        'name',
        'email',
        'phone',
        'job_title',
        'title',
        'department_name__name',
        'service_area',
        'plate_number',
    )
    readonly_fields = ('employee_code',)
    fieldsets = (
        ('Identity', {
            'fields': (
                'employee_code',
                'aadhar_number',
                'first_name',
                'last_name',
                'name',
                'date_of_birth',
                'gender',
                'profile_photo',
            )
        }),
        ('Contact', {
            'fields': ('email', 'phone', 'address', 'city', 'state', 'postal_code')
        }),
        ('Employment And Reporting', {
            'fields': (
                'hire_date',
                'employment_status',
                'department_name',
                'manager',
                'job_title',
                'daily_wage',
                'daily_incentive_earned',
                'availability',
                'status',
            )
        }),
        ('HVAC Skills And Certificates', {
            'fields': (
                'service_area',
            )
        }),
        ('Vehicle', {
            'fields': ('plate_number', 'make', 'model', 'year')
        }),
    )


@admin.register(Site)
class SiteAdmin(admin.ModelAdmin):
    list_display = ('site_code', 'site_name', 'client', 'customer_name', 'city', 'service_zone', 'status')
    list_filter = ('site_type', 'status', 'city', 'service_zone')
    search_fields = (
        'site_code',
        'site_name',
        'customer_name',
        'client__client_code',
        'client__client_name',
        'client__company_name',
        'contact_person',
        'contact_phone',
        'city',
        'service_zone',
    )
    readonly_fields = ('site_code',)


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = (
        'client_code',
        'client_name',
        'company_name',
        'mobile',
        'project_name',
        'requirement',
        'budget_range',
    )
    list_filter = ('requirement', 'building_type', 'preferred_hvac_system')
    search_fields = (
        'client_code',
        'client_name',
        'company_name',
        'mobile',
        'email',
        'project_name',
        'location',
    )
    readonly_fields = ('client_code',)


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'customer_name', 'equipment_type', 'job_type', 'owner', 'status', 'start_date')
    list_filter = ('job_type', 'status', 'equipment_type')
    search_fields = ('name', 'customer_name', 'service_address', 'equipment_type', 'description', 'owner__name')


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'assignee', 'priority', 'status', 'due_date')
    list_filter = ('status', 'priority', 'project')
    search_fields = ('title', 'description', 'project__name', 'assignee__name')
