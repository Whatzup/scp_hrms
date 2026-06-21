import React from 'react';
import { Employee, Project, Task } from '../types';
import { Users, Wrench, ClipboardList, AlertTriangle, Calendar, MapPin, CheckCircle2, Flame, RefreshCw } from 'lucide-react';

interface DashboardProps {
  employees: Employee[];
  projects: Project[];
  tasks: Task[];
  onNavigate: (tab: string, item_id?: string) => void;
}

export default function Dashboard({ employees, projects, tasks, onNavigate }: DashboardProps) {
  const todayStr = '2026-06-21';
  const today = new Date(todayStr);

  // Calculate Metrics
  const activeEmployees = employees.filter(e => e.status === 'ACTIVE' || e.status === 'ON_JOB').length;
  const activeProjects = projects.filter(p => p.status === 'SCHEDULED' || p.status === 'IN_PROGRESS').length;
  const pendingTasks = tasks.filter(t => t.status !== 'DONE').length;
  
  const overdueTasksCount = tasks.filter(t => {
    if (t.status === 'DONE') return false;
    if (!t.due_date) return false;
    return new Date(t.due_date) < today;
  }).length;

  return (
    <div className="space-y-6" id="dashboard-container">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Active Employees */}
        <div 
          id="metric-employees-card"
          onClick={() => onNavigate('employees')}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between group"
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Active Staff</p>
            <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{activeEmployees}</p>
            <p className="text-xs text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              On Duty / Available
            </p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Active Service Jobs */}
        <div 
          id="metric-jobs-card"
          onClick={() => onNavigate('projects')}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between group"
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Active Service Jobs</p>
            <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{activeProjects}</p>
            <p className="text-xs text-blue-600">Scheduled & In progress</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Tasks */}
        <div 
          id="metric-tasks-card"
          onClick={() => onNavigate('tasks')}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between group"
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Pending Tasks</p>
            <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{pendingTasks}</p>
            <p className="text-xs text-amber-600">Awaiting field completion</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <ClipboardList className="w-6 h-6" />
          </div>
        </div>

        {/* Overdue Tasks */}
        <div 
          id="metric-overdue-card"
          onClick={() => onNavigate('tasks')}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between group"
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Overdue Tasks</p>
            <p className="text-3xl font-extrabold text-red-600 tracking-tight">{overdueTasksCount}</p>
            <p className="text-xs text-red-500 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Requires dispatcher alert
            </p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl group-hover:bg-red-600 group-hover:text-white transition-colors">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Service Jobs (Projects) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4" id="recent-jobs-section">
          <div className="flex items-center justify-between pb-2 border-b border-gray-50">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Active HVAC Service Jobs</h3>
              <p className="text-xs text-gray-400">Primary client requests currently deployed</p>
            </div>
            <button 
              onClick={() => onNavigate('projects')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              See All Jobs
            </button>
          </div>

          <div className="space-y-4">
            {projects.slice(0, 4).map(proj => {
              const supervisor = employees.find(e => e.id === proj.owner_id);
              const projTasks = tasks.filter(t => t.project_id === proj.id);
              const completedTasks = projTasks.filter(t => t.status === 'DONE').length;
              const progressPct = projTasks.length > 0 ? Math.round((completedTasks / projTasks.length) * 100) : 0;

              return (
                <div 
                  key={proj.id} 
                  id={`proj-item-${proj.id}`}
                  onClick={() => onNavigate('projects')}
                  className="p-4 rounded-xl border border-gray-50 bg-gray-50/50 hover:bg-gray-50 hover:border-indigo-100 transition-all cursor-pointer space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full tracking-wider">
                        {proj.job_type}
                      </span>
                      <h4 className="font-bold text-gray-900 text-base">{proj.name}</h4>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>{proj.service_address}</span>
                      </div>
                    </div>
                    <div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider block text-center ${
                        proj.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                        proj.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                        proj.status === 'SCHEDULED' ? 'bg-indigo-100 text-indigo-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {proj.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-gray-700">Supervisor:</span>
                      {supervisor ? (
                        <span className="text-indigo-600 font-semibold hover:underline" onClick={(e) => { e.stopPropagation(); onNavigate('employees', supervisor.id); }}>
                          {supervisor.name}
                        </span>
                      ) : 'None'}
                    </div>
                    {proj.start_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Starts: {proj.start_date}</span>
                      </div>
                    )}
                  </div>

                  {/* Task Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-medium text-gray-500">
                      <span>Job Completion ({completedTasks}/{projTasks.length} tasks)</span>
                      <span>{progressPct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          progressPct === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Job Task Assignments */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4" id="recent-tasks-section">
          <div className="flex items-center justify-between pb-2 border-b border-gray-50">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Active Tech Deployments</h3>
              <p className="text-xs text-gray-400">Pending & live assignments in Bangalore</p>
            </div>
            <button 
              onClick={() => onNavigate('tasks')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              See All Tasks
            </button>
          </div>

          <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
            {tasks.map(task => {
              const project = projects.find(p => p.id === task.project_id);
              const assignee = employees.find(e => e.id === task.assignee_id);
              const isOverdue = task.status !== 'DONE' && task.due_date && new Date(task.due_date) < today;

              return (
                <div 
                  key={task.id} 
                  id={`task-item-${task.id}`}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isOverdue 
                      ? 'border-red-100 bg-red-50/20' 
                      : 'border-gray-50 bg-gray-50/20 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-gray-900 text-sm leading-tight">{task.title}</h4>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider shrink-0 ${
                      task.priority === 'URGENT' ? 'bg-red-100 text-red-700' :
                      task.priority === 'HIGH' ? 'bg-amber-100 text-amber-700' :
                      task.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {task.priority}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{task.description}</p>

                  <div className="mt-3 pt-2.5 border-t border-gray-100/50 flex items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-1 text-gray-500">
                      <span className="font-semibold text-gray-700">Tech:</span>
                      {assignee ? (
                        <span 
                          onClick={() => onNavigate('employees', assignee.id)}
                          className="text-indigo-600 font-medium hover:underline cursor-pointer"
                        >
                          {assignee.name}
                        </span>
                      ) : (
                        <span className="text-gray-400">Unassigned</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase rounded px-1.5 py-0.5 flex items-center gap-1 ${
                        task.status === 'DONE' ? 'bg-emerald-50 text-emerald-700' :
                        task.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 animate-pulse' :
                        task.status === 'REVIEW' ? 'bg-purple-50 text-purple-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {task.status === 'DONE' && <CheckCircle2 className="w-3 h-3" />}
                        {task.status}
                      </span>

                      {task.due_date && (
                        <span className={`font-mono text-[10px] ${isOverdue ? 'text-red-600 font-bold' : 'text-gray-400'}`}>
                          Due: {task.due_date}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
