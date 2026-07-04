import React, { useState } from 'react';
import { Task, Project, Employee } from '../types';
import { 
  Search, Plus, Calendar, User, Trash2, ClipboardCheck, ChevronDown, ChevronUp,
  Wrench, FileText, Activity, Layers, CornerDownRight, CheckCircle2, Cloud
} from 'lucide-react';

interface TasksProps {
  tasks: Task[];
  projects: Project[];
  employees: Employee[];
  onAddTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTaskStatus: (id: string, status: Task['status']) => void;
  onUpdateTask?: (id: string, updated: Task) => void;
}

export default function Tasks({ 
  tasks, 
  projects, 
  employees, 
  onAddTask, 
  onDeleteTask, 
  onUpdateTaskStatus,
  onUpdateTask
}: TasksProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(() => projects[0]?.id || '');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [priority, setPriority] = useState<Task['priority']>('MEDIUM');

  // New detailed task states
  const [notes, setNotes] = useState('');
  const [checklist, setChecklist] = useState('Inspect voltage input, Measure condenser fans resistance, Log pressure readouts');
  const [toolsNeeded, setToolsNeeded] = useState('Manifold gauge set, Multimeter, Insulation tape, Nitrogen cylinder');
  const [materialsUsed, setMaterialsUsed] = useState('R-410A Brand Refrigerant - 1.2 kg, Brass flare nuts x 2');
  const [startTime, setStartTime] = useState('09:00');
  const [completionTime, setCompletionTime] = useState('11:30');
  const [weatherCondition, setWeatherCondition] = useState('Sunny, 28°C');
  const [safetyEquipmentChecked, setSafetyEquipmentChecked] = useState('Harness, Insulated Safety Shoes, Arc Flash Helmet');

  const filteredTasks = tasks.filter(t => {
    const q = searchQuery.toLowerCase();
    const proj = projects.find(p => p.id === t.project_id);
    return (
      t.title.toLowerCase().includes(q) ||
      (proj && proj.name.toLowerCase().includes(q)) ||
      t.description.toLowerCase().includes(q) ||
      (t.materials_used || '').toLowerCase().includes(q) ||
      (t.tools_needed || '').toLowerCase().includes(q)
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !projectId) {
      alert('Task Title and related Service Job are required.');
      return;
    }

    const newTask: Task = {
      id: `t_${Date.now()}`,
      title,
      description,
      project_id: projectId,
      assignee_id: assigneeId || undefined,
      due_date: dueDate || undefined,
      status: 'TODO',
      priority,

      // New properties
      notes: notes || undefined,
      checklist: checklist || undefined,
      tools_needed: toolsNeeded || undefined,
      materials_used: materialsUsed || undefined,
      start_time: startTime || undefined,
      completion_time: completionTime || undefined,
      weather_condition: weatherCondition || undefined,
      safety_equipment_checked: safetyEquipmentChecked || undefined
    };

    onAddTask(newTask);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6" id="tasks-feature">
      <div className="flex justify-between items-center bg-transparent">
        <div>
          <h2 className="text-xl font-bold text-gray-950">Field Deployments & Tasks</h2>
          <p className="text-xs text-gray-500">Operation checklist guides, tools requirement, field logs, and status audits</p>
        </div>
        {!showAddForm && (
          <button 
            id="show-add-task-btn"
            onClick={() => {
              setTitle('');
              setDescription('');
              setProjectId(projects[0]?.id || '');
              setAssigneeId('');
              setDueDate(new Date().toISOString().split('T')[0]);
              setPriority('MEDIUM');
              
              // Detail states reset/init
              setNotes('');
              setChecklist('Inspect voltage input, Measure condenser fans resistance, Log pressure readouts');
              setToolsNeeded('Manifold gauge set, Multimeter, Insulation tape');
              setMaterialsUsed('R-410A Refrigerant');
              setStartTime('09:00');
              setCompletionTime('11:30');
              setWeatherCondition('Clear sky');
              setSafetyEquipmentChecked('Safety Harness, Insulated Shoes');

              setShowAddForm(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-705 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add New Task
          </button>
        )}
      </div>

      {showAddForm ? (
        /* Create Task Assignment Workspace with Comprehensive Details Form Sections */
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6" id="add-task-workspace">
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-extrabold text-gray-900 text-sm">Draft Detailed Field Task Assignment</h3>
              <p className="text-xs text-gray-400">Specify tasks checklist guidelines, tools, safety kit audits and timings.</p>
            </div>
            <button 
              onClick={() => setShowAddForm(false)}
              className="p-1.5 px-3 text-xs bg-gray-50 border border-gray-200 hover:bg-gray-100 font-bold rounded-lg text-gray-700 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-xs text-gray-700">
            {/* Row 1: Core details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="font-extrabold uppercase text-gray-400">Task Title *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Suction pressure checks, Condenser replacement" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full text-sm p-3 border border-gray-200 rounded-xl outline-hidden focus:ring-1 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold uppercase text-gray-400">Related Service Job Order *</label>
                <select 
                  required
                  value={projectId}
                  onChange={e => setProjectId(e.target.value)}
                  className="w-full text-sm p-3 border border-gray-200 rounded-xl outline-hidden bg-white"
                >
                  <option value="">-- Choose active Service Job --</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.customer_name})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Assignment / Status details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-3 border-t border-gray-100">
              <div className="space-y-1">
                <label className="font-bold text-gray-500 text-[10px]">Assignee Field Technician</label>
                <select 
                  value={assigneeId}
                  onChange={e => setAssigneeId(e.target.value)}
                  className="w-full text-sm p-3 border border-gray-200 rounded-xl outline-hidden bg-white"
                >
                  <option value="">-- Unassigned (Dispatch ledger) --</option>
                  {employees.filter(emp => emp.status === 'ACTIVE').map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.title})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-500 text-[10px]">Priority Tier</label>
                <select 
                  value={priority}
                  onChange={e => setPriority(e.target.value as Task['priority'])}
                  className="w-full text-sm p-3 border border-gray-200 rounded-xl outline-hidden bg-white"
                >
                  <option value="LOW">Low priority</option>
                  <option value="MEDIUM">Medium priority</option>
                  <option value="HIGH">High priority</option>
                  <option value="URGENT">Urgent level</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-400 text-[10px]">Compliance Due Date</label>
                <input 
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm font-mono bg-white"
                />
              </div>
            </div>

            {/* Row 3: Timings and environment details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-3 border-t border-gray-100">
              <div>
                <label className="text-gray-400 text-[10px] block font-bold mb-1">PLANNED START TIME</label>
                <input 
                  type="text" 
                  placeholder="e.g. 09:00"
                  value={startTime} 
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm font-mono bg-white"
                />
              </div>
              <div>
                <label className="text-gray-400 text-[10px] block font-bold mb-1">PLANNED END TIME</label>
                <input 
                  type="text" 
                  placeholder="e.g. 11:30"
                  value={completionTime} 
                  onChange={e => setCompletionTime(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm font-mono bg-white"
                />
              </div>
              <div>
                <label className="text-gray-400 text-[10px] block font-bold mb-1">WEATHER CONDITION</label>
                <input 
                  type="text" 
                  placeholder="e.g. Sunny, 32°C"
                  value={weatherCondition} 
                  onChange={e => setWeatherCondition(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-white"
                />
              </div>
            </div>

            {/* Row 4: Tools, Materials, Safety specs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-gray-100">
              <div className="space-y-1">
                <label className="font-extrabold uppercase text-gray-400">Tools / Guages Required</label>
                <input 
                  type="text" 
                  placeholder="e.g. Vacuum pump, refrigerant scales, copper cutter"
                  value={toolsNeeded}
                  onChange={e => setToolsNeeded(e.target.value)}
                  className="w-full text-sm p-3 border border-gray-200 rounded-xl bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold uppercase text-gray-400">Billable Materials / Parts Used</label>
                <input 
                  type="text" 
                  placeholder="e.g. R410A gas, Flare couplings"
                  value={materialsUsed}
                  onChange={e => setMaterialsUsed(e.target.value)}
                  className="w-full text-sm p-3 border border-gray-200 rounded-xl bg-white"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="font-extrabold uppercase text-gray-400">Verifiable Safety Equipment Checked</label>
                <input 
                  type="text" 
                  placeholder="e.g. Harness safety anchor, insulated rubber gloves"
                  value={safetyEquipmentChecked}
                  onChange={e => setSafetyEquipmentChecked(e.target.value)}
                  className="w-full text-sm p-3 border border-gray-200 rounded-xl bg-white"
                />
              </div>
            </div>

            {/* Row 5: Action Steps Checklist */}
            <div className="space-y-1 pt-3 border-t border-gray-100">
              <label className="font-extrabold uppercase text-gray-400">Detailed Task Milestones Checklist (Comma Separated)</label>
              <input 
                type="text" 
                placeholder="e.g. Lockout tagout completed, Clean external panel, Measure operating compressor amps"
                value={checklist}
                onChange={e => setChecklist(e.target.value)}
                className="w-full text-sm p-3 border border-gray-200 rounded-xl bg-white"
              />
            </div>

            <div className="space-y-1 pt-2">
              <label className="font-bold text-gray-500">Operation Task Summary & Guidelines</label>
              <textarea 
                rows={3}
                placeholder="List safety constraints, warnings, reported fan speed noise details..." 
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full text-sm p-3 border border-gray-200 rounded-xl outline-hidden bg-white"
              />
            </div>

            <div className="space-y-1 pt-1">
              <label className="font-bold text-gray-500">Technician Remarks & Closing Notes</label>
              <textarea 
                rows={2}
                placeholder="Remarks on work completion, final gas pressures, voltage balance..." 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full text-sm p-3 border border-gray-200 rounded-xl outline-hidden bg-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-150 font-sans">
              <button 
                type="submit"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-xs uppercase tracking-wider cursor-pointer"
              >
                Deploy Task Assignment
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Task lists view layout with toggleable details expands */
        <div className="space-y-5" id="tasks-listings">
          <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-200 shadow-xs">
            <Search className="w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search assignments by title, service job, materials, description context..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs outline-hidden text-gray-800 bg-transparent"
            />
          </div>

          <div className="space-y-4" id="tasks-grid">
            {filteredTasks.map(task => {
              const project = projects.find(p => p.id === task.project_id);
              const assignee = employees.find(e => e.id === task.assignee_id);
              const isOverdue = task.status !== 'DONE' && task.due_date && new Date(task.due_date) < new Date('2026-06-21');
              const isExpanded = expandedTaskId === task.id;

              return (
                <div 
                  key={task.id} 
                  id={`task-row-${task.id}`}
                  className={`bg-white rounded-2xl border transition-all ${
                    isExpanded ? 'border-indigo-650 ring-2 ring-indigo-50 shadow-sm' : 'border-gray-200 hover:border-indigo-200'
                  } ${isOverdue ? 'border-red-200 bg-red-50/5' : ''}`}
                >
                  {/* Row Summary header clickable */}
                  <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer" onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}>
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded leading-none ${
                          task.priority === 'URGENT' ? 'bg-red-55 text-red-700 ring-1 ring-red-100' :
                          task.priority === 'HIGH' ? 'bg-amber-100 text-amber-700' :
                          task.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-105 text-gray-700'
                        }`}>
                          {task.priority} Priority
                        </span>
                        {project && (
                          <span className="text-[10px] font-black text-indigo-705 font-sans uppercase bg-indigo-50 px-2 py-0.5 rounded">
                            {project.name}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-gray-400 font-bold">ID: {task.id}</span>
                      </div>

                      <h3 className="font-extrabold text-gray-900 text-base leading-snug">{task.title}</h3>
                      <p className="text-xs text-gray-500 font-sans line-clamp-2 leading-relaxed">{task.description}</p>
                    </div>

                    {/* Right summary section */}
                    <div className="flex flex-wrap items-center gap-4 text-xs shrink-0 w-full md:w-auto justify-between md:justify-end md:border-t-0 border-gray-100">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <User className="w-4 h-4 text-gray-400 shrink-0" />
                        <div>
                          <span className="text-[9px] text-gray-450 block pb-0.5 leading-none">Assignee</span>
                          <span className="font-bold text-gray-800 leading-none">{assignee ? assignee.name : 'Unassigned'}</span>
                        </div>
                      </div>

                      {task.due_date && (
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                          <div>
                            <span className="text-[9px] text-gray-450 block pb-0.5 leading-none">Deadlines</span>
                            <span className={`font-bold ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
                              {task.due_date} {isOverdue && '(OVERDUE)'}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        {/* Workflow Status selector dropdown */}
                        <select 
                          value={task.status}
                          onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as Task['status'])}
                          className="p-1.5 border border-gray-250 rounded-lg bg-gray-50 font-black text-[11px] uppercase tracking-wide cursor-pointer focus:ring-1 shrink-0"
                        >
                          <option value="TODO">To do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="REVIEW">Under Review</option>
                          <option value="DONE">Completed</option>
                        </select>

                        <button 
                          onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                          className="p-1 px-2 text-xs font-semibold text-indigo-650 bg-indigo-50/50 rounded hover:bg-indigo-55"
                        >
                          {isExpanded ? 'Collapse' : 'Expand'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ADVANCED EXPANDED TASK DETAILS GRID */}
                  {isExpanded && (
                    <div className="p-6 bg-slate-50 border-t border-gray-200 text-xs text-gray-750 space-y-6" id={`expanded-task-details-${task.id}`}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        
                        {/* Task Parameters Section */}
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-3">
                          <h4 className="font-black text-xs text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2 uppercase tracking-wider">
                            <Activity className="w-3.5 h-3.5 text-indigo-600" />
                            Task Parameter Specs
                          </h4>
                          <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-black block">Time Window</span>
                              <span className="font-mono font-bold text-gray-800">{task.start_time || '09:00'} - {task.completion_time || '11:00'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-black block">Compliance Date</span>
                              <span className="font-mono font-bold text-gray-800">{task.due_date || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-black block">Weather Condition</span>
                              <span className="text-gray-750 flex items-center gap-1">
                                <Cloud className="w-3.5 h-3.5 text-indigo-400" />
                                {task.weather_condition || 'Sunny, Dry'}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-black block">Task ID Code</span>
                              <span className="font-mono text-gray-500 font-bold">{task.id}</span>
                            </div>
                          </div>
                        </div>

                        {/* Safety & Tools Requirement Section */}
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-3">
                          <h4 className="font-black text-xs text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2 uppercase tracking-wider">
                            <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                            Safety Kit & Tools Used
                          </h4>
                          <div className="space-y-2.5">
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-black block mb-0.5">Required Gauges & Tools</span>
                              <span className="font-semibold text-gray-800 bg-gray-50 p-2 rounded-lg block border border-gray-100">{task.tools_needed || 'Standard tools (Manifold gauge, screwdriver, pliers)'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-black block mb-0.5">Safety checklist audit approved</span>
                              <span className="font-medium text-emerald-800 bg-emerald-50/50 p-1.5 px-2 rounded border border-emerald-100 inline-block">
                                Checked: {task.safety_equipment_checked || 'Safety Harness, Helmet, Rubber Shoes'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Materials list & closing comments */}
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-3 md:col-span-2">
                          <h4 className="font-black text-xs text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2 uppercase tracking-wider">
                            <FileText className="w-3.5 h-3.5 text-indigo-600" />
                            Material requisitions & Technician Remarks
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-black block mb-1">Requisition Materials Consumed</span>
                              <p className="bg-slate-50 p-2.5 rounded-lg text-gray-700 font-semibold border border-slate-150">{task.materials_used || 'None (Servicing scope only)'}</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-black block mb-1">Closing Remarks / Logs</span>
                              <p className="bg-amber-50/30 p-2.5 rounded-lg text-gray-600 border border-amber-100">{task.notes || 'No closing remarks documented yet.'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Action checklist list */}
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs md:col-span-2 space-y-3">
                          <h4 className="font-black text-xs text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2 uppercase tracking-wider">
                            <ClipboardCheck className="w-3.5 h-3.5 text-indigo-600" />
                            Sequential Task Milestone Checkpoints
                          </h4>
                          <div className="space-y-2">
                            {task.checklist ? (
                              task.checklist.split(',').map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100 hover:bg-indigo-50/10">
                                  <CornerDownRight className="w-3.5 h-3.5 text-indigo-550 shrink-0" />
                                  <span className="font-medium text-gray-750">{item.trim()}</span>
                                </div>
                              ))
                            ) : (
                              <>
                                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                                  <CornerDownRight className="w-3.5 h-3.5 text-indigo-550 shrink-0" />
                                  <span className="font-medium text-gray-750">1. Pre-inspection electrical system diagnostic check</span>
                                </div>
                                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                                  <CornerDownRight className="w-3.5 h-3.5 text-indigo-550 shrink-0" />
                                  <span className="font-medium text-gray-750">2. Refrigerant pressure levels evaluation</span>
                                </div>
                                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                                  <CornerDownRight className="w-3.5 h-3.5 text-indigo-550 shrink-0" />
                                  <span className="font-medium text-gray-750">3. Operation summary data log execution</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                      </div>

                      {/* Deletion & Toggle Action bar */}
                      <div className="flex justify-between items-center bg-transparent pt-3 border-t border-gray-200">
                        <span className="text-gray-400 text-[10px] font-bold">Press Collapse to close this detailed spec.</span>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Are you sure you want to delete this field task?')) {
                                onDeleteTask(task.id);
                              }
                            }}
                            className="text-xs text-red-500 hover:text-red-750 font-bold flex items-center gap-1 bg-red-50 hover:bg-red-100 border border-transparent p-1 px-3 rounded-lg cursor-pointer transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove Task Assignment
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}

            {filteredTasks.length === 0 && (
              <div className="py-12 text-center text-gray-400 italic bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                No technician tasks matching.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
