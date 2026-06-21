from django.contrib import messages
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.views.decorators.http import require_POST

from .forms import ClientForm, EmployeeForm, EmployeeSkillFormSet, ProjectForm, SiteForm, TaskForm
from .models import Client, Employee, Project, Site, Task


def dashboard(request):
    today = timezone.localdate()
    context = {
        'active_tab': 'dashboard',
        'metrics': {
            'active_employees': Employee.objects.filter(status=Employee.Status.ACTIVE).count(),
            'active_projects': Project.objects.filter(
                status__in=[Project.Status.SCHEDULED, Project.Status.IN_PROGRESS],
            ).count(),
            'pending_tasks': Task.objects.exclude(status=Task.Status.DONE).count(),
            'overdue_tasks': Task.objects.exclude(status=Task.Status.DONE)
            .filter(due_date__lt=today)
            .count(),
        },
        'recent_tasks': Task.objects.select_related('project', 'assignee')[:6],
        'projects': Project.objects.select_related('owner')
        .annotate(task_count=Count('tasks'))
        .order_by('-updated_at')[:4],
    }
    return render(request, 'office/dashboard.html', context)


def employees(request):
    search_query = request.GET.get('q', '').strip()
    employees_queryset = Employee.objects.annotate(
        assigned_task_count=Count('assigned_tasks'),
        owned_project_count=Count('owned_projects'),
    ).select_related('manager', 'department_name')

    if search_query:
        employees_queryset = employees_queryset.filter(
            Q(first_name__icontains=search_query)
            | Q(last_name__icontains=search_query)
            | Q(name__icontains=search_query)
            | Q(employee_code__icontains=search_query)
            | Q(job_title__icontains=search_query)
            | Q(email__icontains=search_query)
            | Q(phone__icontains=search_query)
        )

    context = {
        'active_tab': 'employees',
        'employees': employees_queryset,
        'search_query': search_query,
    }
    return render(request, 'office/employees.html', context)


def add_employee(request):
    form = EmployeeForm(request.POST or None, request.FILES or None)
    employee = Employee()
    skill_formset = EmployeeSkillFormSet(request.POST or None, instance=employee)

    if request.method == 'POST' and form.is_valid():
        employee = form.save(commit=False)
        skill_formset = EmployeeSkillFormSet(request.POST, instance=employee)
        if skill_formset.is_valid():
            employee.save()
            skill_formset.save()
            messages.success(request, f'Employee added with code {employee.employee_code}.')
            return redirect('employee_detail', pk=employee.pk)

    context = {
        'active_tab': 'employees',
        'form': form,
        'skill_formset': skill_formset,
    }
    return render(request, 'office/add_employee.html', context)


def employee_detail(request, pk):
    employee = get_object_or_404(
        Employee.objects.select_related('manager', 'department_name').prefetch_related(
            'direct_reports',
            'skill_records',
        ),
        pk=pk,
    )
    context = {
        'active_tab': 'employees',
        'employee': employee,
        'reporting_chain': employee.reporting_chain(),
        'direct_reports': employee.direct_reports.all(),
    }
    return render(request, 'office/employee_detail.html', context)


def sites(request):
    search_query = request.GET.get('q', '').strip()
    sites_queryset = Site.objects.select_related('assigned_manager', 'client')

    if search_query:
        sites_queryset = sites_queryset.filter(
            Q(site_code__icontains=search_query)
            | Q(site_name__icontains=search_query)
            | Q(customer_name__icontains=search_query)
            | Q(client__client_code__icontains=search_query)
            | Q(client__client_name__icontains=search_query)
            | Q(client__company_name__icontains=search_query)
            | Q(contact_person__icontains=search_query)
            | Q(contact_phone__icontains=search_query)
            | Q(city__icontains=search_query)
            | Q(service_zone__icontains=search_query)
        )

    context = {
        'active_tab': 'sites',
        'sites': sites_queryset,
        'search_query': search_query,
    }
    return render(request, 'office/sites.html', context)


def add_site(request):
    form = SiteForm(request.POST or None)
    if request.method == 'POST' and form.is_valid():
        site = form.save()
        messages.success(request, f'Site added with ID {site.site_code}.')
        return redirect('site_detail', pk=site.pk)

    context = {
        'active_tab': 'sites',
        'form': form,
    }
    return render(request, 'office/add_site.html', context)


def site_detail(request, pk):
    site = get_object_or_404(Site.objects.select_related('assigned_manager', 'client'), pk=pk)
    context = {
        'active_tab': 'sites',
        'site': site,
    }
    return render(request, 'office/site_detail.html', context)


def clients(request):
    search_query = request.GET.get('q', '').strip()
    clients_queryset = Client.objects.all()

    if search_query:
        clients_queryset = clients_queryset.filter(
            Q(client_code__icontains=search_query)
            | Q(client_name__icontains=search_query)
            | Q(company_name__icontains=search_query)
            | Q(mobile__icontains=search_query)
            | Q(email__icontains=search_query)
            | Q(project_name__icontains=search_query)
            | Q(location__icontains=search_query)
        )

    context = {
        'active_tab': 'clients',
        'clients': clients_queryset,
        'search_query': search_query,
    }
    return render(request, 'office/clients.html', context)


def add_client(request):
    form = ClientForm(request.POST or None)
    if request.method == 'POST' and form.is_valid():
        client = form.save()
        messages.success(request, f'Client added with ID {client.client_code}.')
        return redirect('client_detail', pk=client.pk)

    context = {
        'active_tab': 'clients',
        'form': form,
    }
    return render(request, 'office/add_client.html', context)


def client_detail(request, pk):
    client = get_object_or_404(Client, pk=pk)
    context = {
        'active_tab': 'clients',
        'client': client,
    }
    return render(request, 'office/client_detail.html', context)


def projects(request):
    form = ProjectForm(request.POST or None)
    if request.method == 'POST' and form.is_valid():
        form.save()
        messages.success(request, 'Service job added.')
        return redirect('projects')

    context = {
        'active_tab': 'projects',
        'form': form,
        'projects': Project.objects.select_related('owner').annotate(task_count=Count('tasks')),
    }
    return render(request, 'office/projects.html', context)


def tasks(request):
    form = TaskForm(request.POST or None)
    if request.method == 'POST' and form.is_valid():
        form.save()
        messages.success(request, 'Job task assigned.')
        return redirect('tasks')

    context = {
        'active_tab': 'tasks',
        'form': form,
        'tasks': Task.objects.select_related('project', 'assignee'),
    }
    return render(request, 'office/tasks.html', context)


@require_POST
def update_status(request, model_name, pk):
    model_map = {
        'employees': Employee,
        'projects': Project,
        'tasks': Task,
    }
    model = model_map.get(model_name)
    if model is None:
        return redirect('dashboard')

    record = get_object_or_404(model, pk=pk)
    status = request.POST.get('status')
    valid_statuses = {choice[0] for choice in record.Status.choices}
    if status in valid_statuses:
        record.status = status
        record.save(update_fields=['status', 'updated_at'])
        messages.success(request, 'Status updated.')

    return redirect(model_name)


@require_POST
def delete_record(request, model_name, pk):
    model_map = {
        'employees': Employee,
        'projects': Project,
        'tasks': Task,
    }
    model = model_map.get(model_name)
    if model is None:
        return redirect('dashboard')

    get_object_or_404(model, pk=pk).delete()
    messages.success(request, 'Record deleted.')
    return redirect(model_name)
