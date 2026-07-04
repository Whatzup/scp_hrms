import React, { useState } from 'react';
import { Project, Employee, Task, Client, Site } from '../types';
import { 
  Search, Plus, Calendar, MapPin, User, Trash2, ClipboardCheck,
  ChevronDown, ChevronUp, DollarSign, Shield, Info, Layers, Wrench, AlertCircle, Settings
} from 'lucide-react';

interface ProjectsProps {
  projects: Project[];
  employees: Employee[];
  tasks: Task[];
  clients: Client[];
  sites: Site[];
  onAddProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onUpdateProjectStatus: (id: string, status: Project['status']) => void;
  onUpdateProject: (id: string, project: Project) => void;
}

export default function Projects({ 
  projects, 
  employees, 
  tasks, 
  clients,
  sites,
  onAddProject,
  onDeleteProject,
  onUpdateProjectStatus,
  onUpdateProject
}: ProjectsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [formTab, setFormTab] = useState<'core' | 'commercial' | 'personnel' | 'technical'>('core');

  // Edit states
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editClientId, setEditClientId] = useState('');
  const [editSiteId, setEditSiteId] = useState('');
  const [editLeadId, setEditLeadId] = useState('');
  const [editProjectCategory, setEditProjectCategory] = useState('REPLACEMENT');
  const [editPriority, setEditPriority] = useState<Project['priority']>('MEDIUM');
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editServiceAddress, setEditServiceAddress] = useState('');
  const [editEquipmentType, setEditEquipmentType] = useState('');
  const [editJobType, setEditJobType] = useState<Project['job_type']>('REPAIR');
  const [editDescription, setDescriptionEdit] = useState('');
  const [editOwnerId, setEditOwnerId] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editActualStartDate, setEditActualStartDate] = useState('');
  const [editActualEndDate, setEditActualEndDate] = useState('');
  const [editProjectManagerId, setEditProjectManagerId] = useState('');
  const [editSiteEngineerId, setEditSiteEngineerId] = useState('');
  const [editSupervisorId, setEditSupervisorId] = useState('');
  const [editTechnicianCount, setEditTechnicianCount] = useState('1');
  const [editContractor, setEditContractor] = useState('');
  const [editStatusState, setEditStatusState] = useState<Project['status']>('SCHEDULED');

  const [editQuotationNumber, setEditQuotationNumber] = useState('');
  const [editContractValue, setEditContractValue] = useState('');
  const [editApprovedValue, setEditApprovedValue] = useState('');
  const [editAdvanceReceived, setEditAdvanceReceived] = useState('');
  const [editPaymentTerms, setEditPaymentTerms] = useState('');
  const [editAmcIncluded, setEditAmcIncluded] = useState<'Yes' | 'No'>('No');
  const [editWarranty, setEditWarranty] = useState('');

  const [editHvacType, setEditHvacType] = useState('');
  const [editBrand, setEditBrand] = useState('');
  const [editCapacity, setEditCapacity] = useState('');
  const [editIndoorUnits, setEditIndoorUnits] = useState('0');
  const [editOutdoorUnits, setEditOutdoorUnits] = useState('0');
  const [editCopperPipeLength, setEditCopperPipeLength] = useState('');
  const [editDrainPipeLength, setEditDrainPipeLength] = useState('');
  const [editFreshAirSystem, setEditFreshAirSystem] = useState<'Yes' | 'No'>('No');

  const startEditingProject = (proj: Project) => {
    setEditName(proj.name || '');
    setEditClientId(proj.client_id || '');
    setEditSiteId(proj.site_id || '');
    setEditLeadId(proj.lead_id || '');
    setEditProjectCategory(proj.project_category || 'REPLACEMENT');
    setEditPriority(proj.priority || 'MEDIUM');
    setEditCustomerName(proj.customer_name || '');
    setEditServiceAddress(proj.service_address || '');
    setEditEquipmentType(proj.equipment_type || '');
    setEditJobType(proj.job_type || 'REPAIR');
    setDescriptionEdit(proj.description || '');
    setEditOwnerId(proj.owner_id || '');
    setEditStartDate(proj.planned_start_date || proj.start_date || '');
    setEditEndDate(proj.planned_end_date || proj.end_date || '');
    setEditActualStartDate(proj.actual_start_date || '');
    setEditActualEndDate(proj.actual_end_date || '');
    setEditProjectManagerId(proj.project_manager_id || '');
    setEditSiteEngineerId(proj.site_engineer_id || '');
    setEditSupervisorId(proj.owner_id || proj.supervisor_id || '');
    setEditTechnicianCount(proj.technician_count ? String(proj.technician_count) : '1');
    setEditContractor(proj.contractor || '');
    setEditStatusState(proj.status || 'SCHEDULED');

    setEditQuotationNumber(proj.quotation_number || '');
    setEditContractValue(proj.contract_value ? String(proj.contract_value) : '');
    setEditApprovedValue(proj.approved_value ? String(proj.approved_value) : '');
    setEditAdvanceReceived(proj.advance_received ? String(proj.advance_received) : '');
    setEditPaymentTerms(proj.payment_terms || '');
    setEditAmcIncluded(proj.amc_included || 'No');
    setEditWarranty(proj.warranty || '');

    setEditHvacType(proj.hvac_type || proj.equipment_type || '');
    setEditBrand(proj.brand || '');
    setEditCapacity(proj.capacity || '');
    setEditIndoorUnits(proj.indoor_units ? String(proj.indoor_units) : '0');
    setEditOutdoorUnits(proj.outdoor_units ? String(proj.outdoor_units) : '0');
    setEditCopperPipeLength(proj.copper_pipe_length || '');
    setEditDrainPipeLength(proj.drain_pipe_length || '');
    setEditFreshAirSystem(proj.fresh_air_system || 'No');

    setEditingProjectId(proj.id);
  };

  const handleEditProjectSubmit = (projId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!editName) {
      alert("Project Name is mandatory!");
      return;
    }

    const linkedClient = clients.find(c => c.id === editClientId);
    const linkedSite = sites.find(s => s.id === editSiteId);

    const matchProj = projects.find(p => p.id === projId);
    if (!matchProj) return;

    const updatedProj: Project = {
      ...matchProj,
      name: editName,
      client_id: editClientId || null,
      site_id: editSiteId || null,
      customer_name: linkedClient ? linkedClient.client_name : (editCustomerName || 'Walk-in Client'),
      service_address: linkedSite ? linkedSite.address : (editServiceAddress || ''),
      lead_id: editLeadId || null,
      project_category: editProjectCategory,
      priority: editPriority,
      equipment_type: editEquipmentType || editHvacType || null,
      job_type: editJobType,
      description: editDescription,
      owner_id: editSupervisorId || editOwnerId || null,
      start_date: editStartDate || null,
      end_date: editEndDate || null,
      planned_start_date: editStartDate || null,
      planned_end_date: editEndDate || null,
      actual_start_date: editActualStartDate || null,
      actual_end_date: editActualEndDate || null,
      project_manager_id: editProjectManagerId || null,
      site_engineer_id: editSiteEngineerId || null,
      supervisor_id: editSupervisorId || null,
      technician_count: Number(editTechnicianCount) || 1,
      contractor: editContractor || null,
      status: editStatusState,

      quotation_number: editQuotationNumber || null,
      contract_value: editContractValue ? String(editContractValue) : null,
      approved_value: editApprovedValue ? String(editApprovedValue) : null,
      advance_received: editAdvanceReceived ? String(editAdvanceReceived) : null,
      payment_terms: editPaymentTerms || null,
      amc_included: editAmcIncluded,
      warranty: editWarranty || null,

      hvac_type: editHvacType || null,
      brand: editBrand || null,
      capacity: editCapacity || null,
      indoor_units: Number(editIndoorUnits) || null,
      outdoor_units: Number(editOutdoorUnits) || null,
      copper_pipe_length: editCopperPipeLength || null,
      drain_pipe_length: editDrainPipeLength || null,
      fresh_air_system: editFreshAirSystem,
    };

    onUpdateProject(projId, updatedProj);
    setEditingProjectId(null);
  };

  // Core Form states
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [siteId, setSiteId] = useState('');
  const [leadId, setLeadId] = useState('');
  const [projectCategory, setProjectCategory] = useState('REPLACEMENT');
  const [priority, setPriority] = useState<Project['priority']>('MEDIUM');
  const [customerName, setCustomerName] = useState('');
  const [serviceAddress, setServiceAddress] = useState('');
  const [equipmentType, setEquipmentType] = useState('');
  const [jobType, setJobType] = useState<Project['job_type']>('REPAIR');
  const [description, setDescription] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState('');

  // Commercial Form states
  const [quotationNumber, setQuotationNumber] = useState('');
  const [contractValue, setContractValue] = useState('');
  const [approvedValue, setApprovedValue] = useState('');
  const [advanceReceived, setAdvanceReceived] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [amcIncluded, setAmcIncluded] = useState<'Yes' | 'No'>('No');
  const [warranty, setWarranty] = useState('1 Year Standard');

  // Timeline Form states
  const [plannedStartDate, setPlannedStartDate] = useState('');
  const [plannedEndDate, setPlannedEndDate] = useState('');
  const [actualStartDate, setActualStartDate] = useState('');
  const [actualEndDate, setActualEndDate] = useState('');
  const [progressPct, setProgressPct] = useState<number>(0);

  // Personnel Form states
  const [projectManagerId, setProjectManagerId] = useState('');
  const [siteEngineerId, setSiteEngineerId] = useState('');
  const [supervisorId, setSupervisorId] = useState('');
  const [technicianCount, setTechnicianCount] = useState<number>(1);
  const [contractor, setContractor] = useState('');

  // Technical Form states
  const [hvacType, setHvacType] = useState('VRF System');
  const [brand, setBrand] = useState('Daikin');
  const [capacity, setCapacity] = useState('10 TR');
  const [indoorUnits, setIndoorUnits] = useState<number>(4);
  const [outdoorUnits, setOutdoorUnits] = useState<number>(1);
  const [copperPipeLength, setCopperPipeLength] = useState('45 Running Metres');
  const [drainPipeLength, setDrainPipeLength] = useState('30 Running Metres');
  const [freshAirSystem, setFreshAirSystem] = useState<'Yes' | 'No'>('No');

  const filteredProjects = projects.filter(p => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.customer_name.toLowerCase().includes(q) ||
      (p.equipment_type || '').toLowerCase().includes(q) ||
      (p.service_address || '').toLowerCase().includes(q) ||
      (p.project_category || '').toLowerCase().includes(q)
    );
  });

  const handleClientChange = (cId: string) => {
    setClientId(cId);
    setSiteId(''); // reset site assignment

    const c = clients.find(client => client.id === cId);
    if (c) {
      setCustomerName(c.client_name);
      
      // Auto-populate some related context
      const relatedSites = sites.filter(s => s.client_id === cId);
      if (relatedSites.length > 0) {
        setSiteId(relatedSites[0].id);
        setServiceAddress(`${relatedSites[0].site_name}, ${relatedSites[0].address}`);
      } else {
        setServiceAddress(c.head_office_address || '');
      }
    }
  };

  const handleSiteChange = (sId: string) => {
    setSiteId(sId);
    const s = sites.find(site => site.id === sId);
    if (s) {
      setServiceAddress(`${s.site_name} - ${s.address}, ${s.city}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !customerName) {
      alert('Job Name and Customer Name are required.');
      return;
    }

    const newProj: Project = {
      id: `p_${Date.now()}`,
      name,
      customer_name: customerName,
      service_address: serviceAddress,
      equipment_type: equipmentType || `${hvacType} - ${brand}`,
      job_type: jobType,
      description,
      owner_id: ownerId || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      status: 'SCHEDULED',

      // Core info
      client_id: clientId || undefined,
      site_id: siteId || undefined,
      lead_id: leadId || undefined,
      project_category: projectCategory || undefined,
      priority: priority || 'MEDIUM',

      // Commercial
      quotation_number: quotationNumber || undefined,
      contract_value: contractValue || undefined,
      approved_value: approvedValue || undefined,
      advance_received: advanceReceived || undefined,
      payment_terms: paymentTerms || undefined,
      amc_included: amcIncluded,
      warranty: warranty || undefined,

      // Timeline
      planned_start_date: plannedStartDate || startDate || undefined,
      planned_end_date: plannedEndDate || endDate || undefined,
      actual_start_date: actualStartDate || undefined,
      actual_end_date: actualEndDate || undefined,
      progress_pct: Number(progressPct) || 0,

      // Personnel Team
      project_manager_id: projectManagerId || undefined,
      site_engineer_id: siteEngineerId || undefined,
      supervisor_id: supervisorId || ownerId || undefined,
      technician_count: Number(technicianCount) || 1,
      contractor: contractor || undefined,

      // Technical Details
      hvac_type: hvacType || undefined,
      brand: brand || undefined,
      capacity: capacity || undefined,
      indoor_units: Number(indoorUnits) || 0,
      outdoor_units: Number(outdoorUnits) || 0,
      copper_pipe_length: copperPipeLength || undefined,
      drain_pipe_length: drainPipeLength || undefined,
      fresh_air_system: freshAirSystem,
    };

    onAddProject(newProj);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6" id="projects-feature">
      <div className="flex justify-between items-center bg-transparent">
        <div>
          <h2 className="text-xl font-bold text-gray-950">HVAC Service Jobs</h2>
          <p className="text-xs text-gray-500">Service job contracts with commercial, technical data & team deployment</p>
        </div>
        {!showAddForm && (
          <button 
            id="show-add-project-btn"
            onClick={() => {
              setName('');
              setClientId('');
              setSiteId('');
              setLeadId('');
              setCustomerName('');
              setServiceAddress('');
              setEquipmentType('');
              setJobType('REPAIR');
              setDescription('');
              setOwnerId('');
              setStartDate(new Date().toISOString().split('T')[0]);
              setEndDate('');
              
              // Commercials
              setQuotationNumber('');
              setContractValue('');
              setApprovedValue('');
              setAdvanceReceived('');
              setPaymentTerms('Net 30');
              setAmcIncluded('No');
              setWarranty('1 Year Standard');

              // Technical
              setHvacType('VRF System');
              setBrand('Daikin');
              setCapacity('10 TR');
              setIndoorUnits(4);
              setOutdoorUnits(1);
              setCopperPipeLength('45 m');
              setDrainPipeLength('30 m');
              setFreshAirSystem('No');

              setShowAddForm(true);
              setFormTab('core');
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add New Job
          </button>
        )}
      </div>

      {showAddForm ? (
        /* Create Service Job workspace with wizard tabs */
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6" id="add-project-workspace">
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-extrabold text-gray-900 text-base">Initiate Service Job (Project Order)</h3>
              <p className="text-xs text-gray-400">Fill in critical commercial parameters, technical scope, and timelines.</p>
            </div>
            <button 
              onClick={() => setShowAddForm(false)}
              className="p-1.5 px-3 text-xs bg-gray-50 border border-gray-200 hover:bg-gray-100 font-bold rounded-lg cursor-pointer text-gray-700"
            >
              Cancel
            </button>
          </div>

          {/* Wizard Tabs Navigation */}
          <div className="flex border-b border-gray-100 text-xs">
            <button 
              type="button"
              onClick={() => setFormTab('core')}
              className={`pb-2.5 px-4 font-bold border-b-2 transition-all ${formTab === 'core' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              1. Core & Customer Information
            </button>
            <button 
              type="button"
              onClick={() => setFormTab('commercial')}
              className={`pb-2.5 px-4 font-bold border-b-2 transition-all ${formTab === 'commercial' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              2. Commercials & Timelines
            </button>
            <button 
              type="button"
              onClick={() => setFormTab('personnel')}
              className={`pb-2.5 px-4 font-bold border-b-2 transition-all ${formTab === 'personnel' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              3. Assigned Team / Personnel
            </button>
            <button 
              type="button"
              onClick={() => setFormTab('technical')}
              className={`pb-2.5 px-4 font-bold border-b-2 transition-all ${formTab === 'technical' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              4. Technical HVAC Specs
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-xs text-gray-750">
            {/* TABS 1: CORE */}
            {formTab === 'core' && (
              <div className="space-y-4 animate-fade-in" id="wizard-tab-core">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="font-extrabold uppercase text-gray-400">Service Job Title *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Server Room VRF Installation, Chillers PM" 
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full text-sm p-3 border border-gray-200 rounded-xl outline-hidden focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold uppercase text-gray-400">Select Client Account</label>
                    <select 
                      value={clientId}
                      onChange={e => handleClientChange(e.target.value)}
                      className="w-full text-sm p-3 border border-gray-200 rounded-xl bg-white focus:ring-1"
                    >
                      <option value="">-- No Linked Client (Enter Manually) --</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.client_name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold uppercase text-gray-400">Select Site Facility</label>
                    <select 
                      value={siteId}
                      onChange={e => handleSiteChange(e.target.value)}
                      disabled={!clientId}
                      className="w-full text-sm p-3 border border-gray-200 rounded-xl bg-white disabled:bg-gray-50 disabled:text-gray-400"
                    >
                      <option value="">-- Select Site Facility --</option>
                      {sites.filter(s => s.client_id === clientId).map(s => (
                        <option key={s.id} value={s.id}>{s.site_name} ({s.city})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold uppercase text-gray-400">Manually Entered Customer Location *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Metro Plaza Corp, Block B" 
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full text-sm p-3 border border-gray-200 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="font-extrabold uppercase text-gray-400">Full Service Site Address</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Suite 400, 22 Market Road, Bengaluru" 
                      value={serviceAddress}
                      onChange={e => setServiceAddress(e.target.value)}
                      className="w-full text-sm p-3 border border-gray-200 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold uppercase text-gray-400">Lead Opportunity ID / Reference</label>
                    <input 
                      type="text" 
                      placeholder="e.g. LD-983" 
                      value={leadId}
                      onChange={e => setLeadId(e.target.value)}
                      className="w-full text-sm p-3 border border-gray-200 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold uppercase text-gray-400">Project Category</label>
                    <select
                      value={projectCategory}
                      onChange={e => setProjectCategory(e.target.value)}
                      className="w-full text-sm p-3 border border-gray-200 rounded-xl bg-white"
                    >
                      <option value="REPLACEMENT">Equipment Replacement</option>
                      <option value="NEW_INSTALL">New Fit-out / Install</option>
                      <option value="SERVICE_RETRIEVAL">Emergency Retrofit</option>
                      <option value="PM_COMPREHENSIVE">PM Comprehensive</option>
                      <option value="AMENDMENT">Modification & Repairs</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold uppercase text-gray-400">Job Classification Type</label>
                    <select 
                      value={jobType}
                      onChange={e => setJobType(e.target.value as Project['job_type'])}
                      className="w-full text-sm p-3 border border-gray-200 rounded-xl bg-white"
                    >
                      <option value="REPAIR">Repair Checkup</option>
                      <option value="INSTALLATION">New Installation</option>
                      <option value="MAINTENANCE">Preventive Maintenance</option>
                      <option value="INSPECTION">Safety Inspector Routine</option>
                      <option value="EMERGENCY">Emergency Response Deployment</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold uppercase text-gray-400">System Priority Level</label>
                    <select 
                      value={priority}
                      onChange={e => setPriority(e.target.value as Project['priority'])}
                      className="w-full text-sm p-3 border border-gray-200 rounded-xl bg-white font-bold"
                    >
                      <option value="LOW">Low priority</option>
                      <option value="MEDIUM">Medium priority</option>
                      <option value="HIGH">High priority</option>
                      <option value="URGENT">Critical Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <label className="font-extrabold uppercase text-gray-400">Operation Scope Summary</label>
                  <textarea 
                    rows={3}
                    placeholder="Log core HVAC troubleshooting specs, customer complaints..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full text-sm p-3 border border-gray-200 rounded-xl"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    type="button" 
                    onClick={() => setFormTab('commercial')}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold"
                  >
                    Next: Commercials & Timelines &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* TABS 2: COMMERCIALS & TIMELINE */}
            {formTab === 'commercial' && (
              <div className="space-y-4 animate-fade-in" id="wizard-tab-commercial">
                <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 flex items-start gap-2.5 mb-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-amber-800 leading-relaxed text-[11px]">
                    These are verified billing credentials used for audits, approvals, and contract performance tracking.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="font-extrabold uppercase text-gray-400">Quotation / Proposal Number</label>
                    <input 
                      type="text" 
                      placeholder="e.g. QT-2026-9902" 
                      value={quotationNumber}
                      onChange={e => setQuotationNumber(e.target.value)}
                      className="w-full text-sm p-3 border border-gray-200 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold uppercase text-gray-400">Total Contract Value (INR)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 1500000" 
                      value={contractValue}
                      onChange={e => setContractValue(e.target.value)}
                      className="w-full text-sm p-3 border border-gray-200 rounded-xl font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold uppercase text-gray-400">Client Approved Value (INR)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 1500000" 
                      value={approvedValue}
                      onChange={e => setApprovedValue(e.target.value)}
                      className="w-full text-sm p-3 border border-gray-200 rounded-xl font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold uppercase text-gray-400">Advance Payments Received (INR)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 350000" 
                      value={advanceReceived}
                      onChange={e => setAdvanceReceived(e.target.value)}
                      className="w-full text-sm p-3 border border-gray-200 rounded-xl font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold uppercase text-gray-400">Payment Milestone Terms</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 30% Advance, 50% Delivery, 20% Commissioning" 
                      value={paymentTerms}
                      onChange={e => setPaymentTerms(e.target.value)}
                      className="w-full text-sm p-3 border border-gray-200 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold uppercase text-gray-400">AMC Included?</label>
                    <select 
                      value={amcIncluded}
                      onChange={e => setAmcIncluded(e.target.value as 'Yes' | 'No')}
                      className="w-full text-sm p-3 border border-gray-200 rounded-xl bg-white"
                    >
                      <option value="No">No AMC service contract included</option>
                      <option value="Yes">Yes, Includes Annual Maintenance Contract</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold uppercase text-gray-400">Hardware Warranty details</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 1 Year comprehensive, 5 Years compressor" 
                      value={warranty}
                      onChange={e => setWarranty(e.target.value)}
                      className="w-full text-sm p-3 border border-gray-200 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold uppercase text-gray-400">Estimated job Progress (%)</label>
                    <div className="flex items-center gap-3 pt-2">
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        step="5"
                        value={progressPct}
                        onChange={e => setProgressPct(Number(e.target.value))}
                        className="w-full accent-indigo-600"
                      />
                      <span className="font-mono font-bold text-sm text-indigo-750 shrink-0">{progressPct}%</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3 mt-4">
                  <h4 className="font-bold text-gray-800 text-xs mb-3">Planned timelines</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-gray-400 text-[10px] block font-bold mb-1">PLANNED START</label>
                      <input 
                        type="date" 
                        value={plannedStartDate} 
                        onChange={e => setPlannedStartDate(e.target.value)}
                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm font-mono bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-[10px] block font-bold mb-1">PLANNED END</label>
                      <input 
                        type="date" 
                        value={plannedEndDate} 
                        onChange={e => setPlannedEndDate(e.target.value)}
                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm font-mono bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-[10px] block font-bold mb-1">ACTUAL START</label>
                      <input 
                        type="date" 
                        value={actualStartDate} 
                        onChange={e => setActualStartDate(e.target.value)}
                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm font-mono bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-[10px] block font-bold mb-1">ACTUAL END</label>
                      <input 
                        type="date" 
                        value={actualEndDate} 
                        onChange={e => setActualEndDate(e.target.value)}
                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm font-mono bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-gray-100">
                  <button 
                    type="button" 
                    onClick={() => setFormTab('core')}
                    className="px-4 py-2 border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 rounded-lg font-bold"
                  >
                    &larr; Back
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setFormTab('personnel')}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold"
                  >
                    Next: Assigned Team &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* TABS 3: PERSONNEL & TEAM */}
            {formTab === 'personnel' && (
              <div className="space-y-4 animate-fade-in" id="wizard-tab-personnel">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="font-extrabold uppercase text-gray-400">Project Manager (PM)</label>
                    <select 
                      value={projectManagerId}
                      onChange={e => setProjectManagerId(e.target.value)}
                      className="w-full text-sm p-3 border border-gray-200 rounded-xl bg-white"
                    >
                      <option value="">-- No PM Assigned --</option>
                      {employees.filter(emp => emp.status === 'ACTIVE').map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.job_title})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold uppercase text-gray-400">Site HVAC Engineer</label>
                    <select 
                      value={siteEngineerId}
                      onChange={e => setSiteEngineerId(e.target.value)}
                      className="w-full text-sm p-3 border border-gray-200 rounded-xl bg-white"
                    >
                      <option value="">-- No Site Engineer Assigned --</option>
                      {employees.filter(emp => emp.status === 'ACTIVE').map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.job_title})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold uppercase text-gray-400">Site Team Supervisor</label>
                    <select 
                      value={supervisorId}
                      onChange={e => {
                        setSupervisorId(e.target.value);
                        setOwnerId(e.target.value);
                      }}
                      className="w-full text-sm p-3 border border-gray-200 rounded-xl bg-white"
                    >
                      <option value="">-- Same as Supervisor in Charge --</option>
                      {employees.filter(emp => emp.status === 'ACTIVE').map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold uppercase text-gray-400">Assigned Technicians Count</label>
                    <input 
                      type="number" 
                      min="0"
                      value={technicianCount}
                      onChange={e => setTechnicianCount(Number(e.target.value))}
                      className="w-full text-sm p-3 border border-gray-200 rounded-xl font-mono"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="font-extrabold uppercase text-gray-400">HVAC Sub-Contractor Company Partner</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Climate Control Solutions Ltd" 
                      value={contractor}
                      onChange={e => setContractor(e.target.value)}
                      className="w-full text-sm p-3 border border-gray-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-gray-100">
                  <button 
                    type="button" 
                    onClick={() => setFormTab('commercial')}
                    className="px-4 py-2 border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 rounded-lg font-bold"
                  >
                    &larr; Back
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setFormTab('technical')}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold"
                  >
                    Next: Technical HVAC specs &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* TABS 4: TECHNICAL SPECIFICATIONS */}
            {formTab === 'technical' && (
              <div className="space-y-4 animate-fade-in" id="wizard-tab-technical">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="font-extrabold uppercase text-gray-400">HVAC System Type</label>
                    <input 
                      type="text" 
                      placeholder="e.g. VRF, Ducted Split, Water Chiller, Air Handler" 
                      value={hvacType}
                      onChange={e => setHvacType(e.target.value)}
                      className="w-full text-sm p-3 border border-gray-200 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold uppercase text-gray-400">Equipment Manufacturer / Brand</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Daikin, Toshiba, Blue Star, Carrier" 
                      value={brand}
                      onChange={e => setBrand(e.target.value)}
                      className="w-full text-sm p-3 border border-gray-200 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold uppercase text-gray-400">Cooling/Heating Output Capacity</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 10 TR, 120,000 BTU, 35 kW" 
                      value={capacity}
                      onChange={e => setCapacity(e.target.value)}
                      className="w-full text-sm p-3 border border-gray-200 rounded-xl font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold uppercase text-gray-400">Fresh Air mechanical supply systems?</label>
                    <select 
                      value={freshAirSystem}
                      onChange={e => setFreshAirSystem(e.target.value as 'Yes' | 'No')}
                      className="w-full text-sm p-3 border border-gray-200 rounded-xl bg-white"
                    >
                      <option value="No">No Fresh Air Ventilation System Integrated</option>
                      <option value="Yes">Yes, mechanical intake with filters</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold uppercase text-gray-400">Indoor Fan Coil Units Count</label>
                    <input 
                      type="number" 
                      min="0"
                      value={indoorUnits}
                      onChange={e => setIndoorUnits(Number(e.target.value))}
                      className="w-full text-sm p-3 border border-gray-200 rounded-xl font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold uppercase text-gray-400">Outdoor Condensers Count</label>
                    <input 
                      type="number" 
                      min="0"
                      value={outdoorUnits}
                      onChange={e => setOutdoorUnits(Number(e.target.value))}
                      className="w-full text-sm p-3 border border-gray-200 rounded-xl font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold uppercase text-gray-400">Total Refrigerant Copper Piping Length</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 45 Running Metres" 
                      value={copperPipeLength}
                      onChange={e => setCopperPipeLength(e.target.value)}
                      className="w-full text-sm p-3 border border-gray-200 rounded-xl font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold uppercase text-gray-400">PVC condensation Drain pipe length</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 30 m" 
                      value={drainPipeLength}
                      onChange={e => setDrainPipeLength(e.target.value)}
                      className="w-full text-sm p-3 border border-gray-200 rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-6 border-t border-gray-150">
                  <button 
                    type="button" 
                    onClick={() => setFormTab('personnel')}
                    className="px-4 py-2 border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 rounded-lg font-bold"
                  >
                    &larr; Back
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md uppercase tracking-wide cursor-pointer transition-all"
                  >
                    🚀 Save & Initiate HVAC Service Job
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      ) : (
        /* Project listings layout with interactive details display */
        <div className="space-y-5" id="projects-listings">
          <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-150 shadow-xs">
            <Search className="w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search HVAC jobs by name, customer, categories, equipment, address, PMs..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs outline-hidden text-gray-850 bg-transparent"
            />
          </div>

          <div className="grid grid-cols-1 gap-6" id="projects-grid">
            {filteredProjects.map(proj => {
              const matchesClient = clients.find(c => c.id === proj.client_id);
              const matchesSite = sites.find(s => s.id === proj.site_id);
              
              const pManager = employees.find(e => e.id === proj.project_manager_id);
              const siteEng = employees.find(e => e.id === proj.site_engineer_id);
              const supervisor = employees.find(e => e.id === proj.owner_id || e.id === proj.supervisor_id);
              
              const relatedTasks = tasks.filter(t => t.project_id === proj.id);
              const completedTasks = relatedTasks.filter(t => t.status === 'DONE').length;
              
              // Use explicit progress percentage or compute from task counts
              const derivedProgressPct = relatedTasks.length > 0 
                ? Math.round((completedTasks / relatedTasks.length) * 100) 
                : (proj.progress_pct || 0);

              const isExpanded = expandedProjectId === proj.id;

              return (
                <div 
                  key={proj.id}
                  id={`project-card-${proj.id}`}
                  className={`bg-white rounded-2xl border transition-all ${
                    isExpanded ? 'border-indigo-550 ring-2 ring-indigo-50 shadow-sm' : 'border-gray-200 hover:border-indigo-200 hover:shadow-xs'
                  }`}
                >
                  {/* Card Visible Header Summary */}
                  <div className="p-5 flex flex-col md:flex-row justify-between gap-4 cursor-pointer" onClick={() => setExpandedProjectId(isExpanded ? null : proj.id)}>
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[9px] font-black uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded tracking-wide leading-none">
                          {proj.job_type}
                        </span>
                        {proj.project_category && (
                          <span className="text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded tracking-wide leading-none">
                            {proj.project_category}
                          </span>
                        )}
                        {proj.priority && (
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wide leading-none ${
                            proj.priority === 'URGENT' ? 'bg-red-50 text-red-700 ring-1 ring-red-200' :
                            proj.priority === 'HIGH' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {proj.priority} Priority
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="font-extrabold text-gray-950 text-base md:text-lg flex items-center gap-2">
                          {proj.name}
                          <span className="text-xs font-bold text-gray-400 font-mono">ID: {proj.id}</span>
                        </h3>
                        <p className="text-xs text-gray-500 font-medium flex items-center gap-2 mt-1">
                          <span className="font-bold text-gray-800">{matchesClient ? matchesClient.client_name : proj.customer_name}</span>
                          {matchesSite && <span className="text-gray-300">|</span>}
                          {matchesSite && <span className="text-indigo-600 font-semibold">{matchesSite.site_name}</span>}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {proj.service_address || 'Unassignedaddress'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-3 shrink-0">
                      {/* Status Selector */}
                      <select 
                        id={`update-proj-status-${proj.id}`}
                        value={proj.status}
                        onClick={e => e.stopPropagation()} // Prevent card expanded collapse toggle
                        onChange={(e) => onUpdateProjectStatus(proj.id, e.target.value as Project['status'])}
                        className="text-xs font-extrabold border border-gray-250 p-1.5 px-2.5 rounded-lg bg-gray-50 text-gray-700 uppercase tracking-wide cursor-pointer focus:ring-1"
                      >
                        <option value="SCHEDULED">Scheduled</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="ON_HOLD">On Hold</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>

                      <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold bg-indigo-50/70 p-1.5 px-3 rounded-lg" onClick={() => setExpandedProjectId(isExpanded ? null : proj.id)}>
                        {isExpanded ? (
                          <>Hide Details <ChevronUp className="w-4 h-4" /></>
                        ) : (
                          <>View Details <ChevronDown className="w-4 h-4" /></>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress panel bar */}
                  <div className="px-5 pb-4 space-y-1.5 text-xs border-b border-gray-100 bg-gray-50/20">
                    <div className="flex justify-between items-center text-gray-500 font-sans">
                      <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                        <ClipboardCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                        Operation task checklist: {completedTasks}/{relatedTasks.length} Done
                      </span>
                      <span className="font-black text-gray-950 font-mono">{derivedProgressPct}% Completed</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-150 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          derivedProgressPct === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${derivedProgressPct}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* HIGHLY COMPREHENSIVE DETAIL PANEL GRID */}
                  {isExpanded && (
                    editingProjectId === proj.id ? (
                      <form onSubmit={(e) => handleEditProjectSubmit(proj.id, e)} className="p-6 bg-white border-t border-gray-150 text-xs text-gray-750 space-y-6" id={`edit-project-form-${proj.id}`}>
                        <div className="border-b border-gray-200 pb-3 flex justify-between items-center">
                          <div>
                            <h4 className="text-sm font-black text-slate-900">Change Project Details & Work Order Specs</h4>
                            <p className="text-[11px] text-gray-400 font-sans">Modify schedules, client associations, crew size, technical components, and billing details.</p>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setEditingProjectId(null)}
                            className="bg-gray-100 px-3 py-1.5 text-xs text-gray-650 font-black rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                          >
                            Cancel Edit
                          </button>
                        </div>

                        {/* SECTION 1: CORE DETAILS */}
                        <div className="space-y-4">
                          <h5 className="font-extrabold text-[11px] text-indigo-700 uppercase tracking-wider">1. Core Information & Status</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <label className="font-extrabold text-gray-400 uppercase">Project / Order Name *</label>
                              <input 
                                type="text" 
                                required
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                className="w-full text-xs p-2.5 border border-gray-250 rounded-xl focus:outline-indigo-500"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="font-extrabold text-gray-400 uppercase">Client / Customer Account</label>
                              <select 
                                value={editClientId}
                                onChange={e => setEditClientId(e.target.value)}
                                className="w-full text-xs p-2.5 border border-gray-250 rounded-xl bg-white"
                              >
                                <option value="">-- No Client Account linked --</option>
                                {clients.map(c => (
                                  <option key={c.id} value={c.id}>{c.client_name}</option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="font-extrabold text-gray-400 uppercase">Serviced Landmark Facility Site</label>
                              <select 
                                value={editSiteId}
                                onChange={e => setEditSiteId(e.target.value)}
                                className="w-full text-xs p-2.5 border border-gray-250 rounded-xl bg-white"
                              >
                                <option value="">-- No specific Site linked --</option>
                                {sites.map(s => (
                                  <option key={s.id} value={s.id}>{s.site_name} ({s.city})</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                              <label className="font-extrabold text-gray-400 uppercase">Project Category</label>
                              <select 
                                value={editProjectCategory}
                                onChange={e => setEditProjectCategory(e.target.value)}
                                className="w-full text-xs p-2.5 border border-gray-250 rounded-xl bg-white"
                              >
                                <option value="MAINTENANCE">Maintenance Call</option>
                                <option value="INSTALLATION">New Installation</option>
                                <option value="REPLACEMENT">Equipment Replacement</option>
                                <option value="RETROFIT">System Retrofitting</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="font-extrabold text-gray-400 uppercase">Job Work Type</label>
                              <select 
                                value={editJobType}
                                onChange={e => setEditJobType(e.target.value as Project['job_type'])}
                                className="w-full text-xs p-2.5 border border-gray-250 rounded-xl bg-white"
                              >
                                <option value="INSTALL">Installation</option>
                                <option value="REPAIR">Repair</option>
                                <option value="MAINTENANCE">Scheduled Maintenance</option>
                                <option value="EMERGENCY">Emergency Callout</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="font-extrabold text-gray-400 uppercase">Priority Rating</label>
                              <select 
                                value={editPriority}
                                onChange={e => setEditPriority(e.target.value as Project['priority'])}
                                className="w-full text-xs p-2.5 border border-gray-250 rounded-xl bg-white"
                              >
                                <option value="LOW">LOW</option>
                                <option value="MEDIUM">MEDIUM</option>
                                <option value="HIGH">HIGH</option>
                                <option value="URGENT">URGENT</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="font-extrabold text-gray-400 uppercase">Overall Project Status</label>
                              <select 
                                value={editStatusState}
                                onChange={e => setEditStatusState(e.target.value as Project['status'])}
                                className="w-full text-xs p-2.5 border border-gray-250 rounded-xl bg-white"
                              >
                                <option value="SCHEDULED">SCHEDULED</option>
                                <option value="IN_PROGRESS">IN_PROGRESS</option>
                                <option value="ON_HOLD">ON_HOLD</option>
                                <option value="COMPLETED">COMPLETED</option>
                                <option value="CANCELLED">CANCELLED</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="font-extrabold text-gray-400 uppercase">Work Description Scope</label>
                            <textarea 
                              rows={3}
                              value={editDescription}
                              onChange={e => setDescriptionEdit(e.target.value)}
                              className="w-full text-xs p-2.5 border border-gray-255 rounded-xl bg-white focus:outline-indigo-500 font-sans"
                            />
                          </div>
                        </div>

                        {/* SECTION 2: TIMELINES & PLANNING */}
                        <div className="border-t border-gray-150 pt-4 space-y-4">
                          <h5 className="font-extrabold text-[11px] text-indigo-700 uppercase tracking-wider">2. Project Schedules & Handover Dates</h5>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                              <label className="font-bold text-gray-500">Scheduled Release Start</label>
                              <input 
                                type="date" 
                                value={editStartDate}
                                onChange={e => setEditStartDate(e.target.value)}
                                className="w-full text-xs p-2.5 border border-gray-250 rounded-xl"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-gray-500">Scheduled Completion End</label>
                              <input 
                                type="date" 
                                value={editEndDate}
                                onChange={e => setEditEndDate(e.target.value)}
                                className="w-full text-xs p-2.5 border border-gray-250 rounded-xl"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-gray-500">Actual Joint Commencement</label>
                              <input 
                                type="date" 
                                value={editActualStartDate}
                                onChange={e => setEditActualStartDate(e.target.value)}
                                className="w-full text-xs p-2.5 border border-gray-250 rounded-xl"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-gray-500">Actual Handover Date</label>
                              <input 
                                type="date" 
                                value={editActualEndDate}
                                onChange={e => setEditActualEndDate(e.target.value)}
                                className="w-full text-xs p-2.5 border border-gray-250 rounded-xl"
                              />
                            </div>
                          </div>
                        </div>

                        {/* SECTION 3: COMMERCIAL DEALS */}
                        <div className="border-t border-gray-150 pt-4 space-y-4">
                          <h5 className="font-extrabold text-[11px] text-indigo-700 uppercase tracking-wider">3. Commercial Quote & Warranty Agreement</h5>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                              <label className="font-bold text-gray-500">Quotation ID / Ref</label>
                              <input 
                                type="text" 
                                value={editQuotationNumber}
                                onChange={e => setEditQuotationNumber(e.target.value)}
                                className="w-full text-xs p-2.5 border border-gray-250 rounded-xl font-mono focus:outline-indigo-500"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-gray-500">Total Project Value (INR)</label>
                              <input 
                                type="number" 
                                value={editContractValue}
                                onChange={e => setEditContractValue(e.target.value)}
                                className="w-full text-xs p-2.5 border border-gray-250 rounded-xl font-mono focus:outline-indigo-500"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-gray-500">Advance Escrow Deposit (INR)</label>
                              <input 
                                type="number" 
                                value={editAdvanceReceived}
                                onChange={e => setEditAdvanceReceived(e.target.value)}
                                className="w-full text-xs p-2.5 border border-gray-250 rounded-xl font-mono focus:outline-indigo-500"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-gray-500">Milestone Payment Terms</label>
                              <input 
                                type="text" 
                                value={editPaymentTerms}
                                onChange={e => setEditPaymentTerms(e.target.value)}
                                className="w-full text-xs p-2.5 border border-gray-250 rounded-xl focus:outline-indigo-500"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="font-bold text-gray-500">AMC Annual Maintenance Cover</label>
                              <select 
                                value={editAmcIncluded}
                                onChange={e => setEditAmcIncluded(e.target.value as 'Yes' | 'No')}
                                className="w-full text-xs p-2.5 border border-gray-250 rounded-xl bg-white focus:outline-indigo-500"
                              >
                                <option value="Yes">Yes, Includes Annual Maintenance Contract</option>
                                <option value="No">No, Direct One-time Implementation Work</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-gray-500">Warranty details</label>
                              <input 
                                type="text" 
                                value={editWarranty}
                                onChange={e => setEditWarranty(e.target.value)}
                                className="w-full text-xs p-2.5 border border-gray-250 rounded-xl focus:outline-indigo-500"
                              />
                            </div>
                          </div>
                        </div>

                        {/* SECTION 4: PERSONNEL ASSIGNED */}
                        <div className="border-t border-gray-150 pt-4 space-y-4">
                          <h5 className="font-extrabold text-[11px] text-indigo-700 uppercase tracking-wider">4. Managed Personnel Team</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <label className="font-bold text-gray-500">Project Manager (PM)</label>
                              <select 
                                value={editProjectManagerId}
                                onChange={e => setEditProjectManagerId(e.target.value)}
                                className="w-full text-xs p-2.5 border border-gray-255 rounded-xl bg-white focus:outline-indigo-500"
                              >
                                <option value="">-- Let any assigned Manager lead --</option>
                                {employees.filter(emp => emp.status === 'ACTIVE').map(emp => (
                                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.title})</option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="font-bold text-gray-500">Site HVAC Engineer</label>
                              <select 
                                value={editSiteEngineerId}
                                onChange={e => setEditSiteEngineerId(e.target.value)}
                                className="w-full text-xs p-2.5 border border-gray-255 rounded-xl bg-white focus:outline-indigo-500"
                              >
                                <option value="">-- Let any HVAC Engineer lead --</option>
                                {employees.filter(emp => emp.status === 'ACTIVE').map(emp => (
                                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.title})</option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="font-bold text-gray-500">Assigned Team Supervisor</label>
                              <select 
                                value={editSupervisorId}
                                onChange={e => setEditSupervisorId(e.target.value)}
                                className="w-full text-xs p-2.5 border border-gray-255 rounded-xl bg-white focus:outline-indigo-500"
                              >
                                <option value="">-- Let any Supervisor lead --</option>
                                {employees.filter(emp => emp.status === 'ACTIVE').map(emp => (
                                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.title})</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="font-bold text-gray-500">Total Assigned Technicians count</label>
                              <input 
                                type="number" 
                                value={editTechnicianCount}
                                onChange={e => setEditTechnicianCount(e.target.value)}
                                className="w-full text-xs p-2.5 border border-gray-250 rounded-xl font-mono focus:outline-indigo-500"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-gray-500">Specialist HVAC Sub-contractor</label>
                              <input 
                                type="text" 
                                placeholder="e.g. Blue Star Service Ltd., Self Team"
                                value={editContractor}
                                onChange={e => setEditContractor(e.target.value)}
                                className="w-full text-xs p-2.5 border border-gray-250 rounded-xl focus:outline-indigo-500"
                              />
                            </div>
                          </div>
                        </div>

                        {/* SECTION 5: TECHNICAL SPECIFICATIONS */}
                        <div className="border-t border-gray-150 pt-4 space-y-4">
                          <h5 className="font-extrabold text-[11px] text-indigo-700 uppercase tracking-wider">5. HVAC Hardware & Spec Details</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <label className="font-bold text-gray-500">HVAC Type Designation</label>
                              <input 
                                type="text" 
                                placeholder="e.g. Chiller, VRF, Multi Speed Split"
                                value={editHvacType}
                                onChange={e => setEditHvacType(e.target.value)}
                                className="w-full text-xs p-2.5 border border-gray-250 rounded-xl"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-gray-500">Equipment Manufacturer / Brand</label>
                              <input 
                                type="text" 
                                placeholder="e.g. Daikin, Toshiba"
                                value={editBrand}
                                onChange={e => setEditBrand(e.target.value)}
                                className="w-full text-xs p-2.5 border border-gray-250 rounded-xl"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-gray-500">Overall Cooling Output Capacity</label>
                              <input 
                                type="text" 
                                placeholder="e.g. 15 TR, 4.5 Ton"
                                value={editCapacity}
                                onChange={e => setEditCapacity(e.target.value)}
                                className="w-full text-xs p-2.5 border border-gray-250 rounded-xl font-mono"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="font-bold text-gray-500">Indoor Fan Coil Units Count</label>
                              <input 
                                type="number" 
                                value={editIndoorUnits}
                                onChange={e => setEditIndoorUnits(e.target.value)}
                                className="w-full text-xs p-2.5 border border-gray-250 rounded-xl font-mono"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-gray-500">Outdoor Condensing Units Count</label>
                              <input 
                                type="number" 
                                value={editOutdoorUnits}
                                onChange={e => setEditOutdoorUnits(e.target.value)}
                                className="w-full text-xs p-2.5 border border-gray-250 rounded-xl font-mono"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <label className="font-bold text-gray-500">Copper Piping Length (Meters)</label>
                              <input 
                                type="text" 
                                placeholder="e.g. 75 meters"
                                value={editCopperPipeLength}
                                onChange={e => setEditCopperPipeLength(e.target.value)}
                                className="w-full text-xs p-2.5 border border-gray-250 rounded-xl font-mono"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-gray-500">Drainage PVC Pipe (Meters)</label>
                              <input 
                                type="text" 
                                placeholder="e.g. 40 meters"
                                value={editDrainPipeLength}
                                onChange={e => setEditDrainPipeLength(e.target.value)}
                                className="w-full text-xs p-2.5 border border-gray-250 rounded-xl font-mono"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-gray-500">Mechanical Fresh Air Intake System</label>
                              <select 
                                value={editFreshAirSystem}
                                onChange={e => setEditFreshAirSystem(e.target.value as 'Yes' | 'No')}
                                className="w-full text-xs p-2.5 border border-gray-250 rounded-xl bg-white"
                              >
                                <option value="Yes">Yes, Integrated Mechanical Ventilation</option>
                                <option value="No">No, Standard Room Return and Supply Only</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-5 border-t border-gray-200">
                          <button 
                            type="button"
                            onClick={() => setEditingProjectId(null)}
                            className="bg-gray-100 hover:bg-gray-200 px-5 py-2.5 text-xs text-gray-700 font-bold rounded-xl cursor-pointer transition-colors"
                          >
                            Cancel Changes
                          </button>
                          <button 
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 font-black text-xs text-white px-6 py-2.5 rounded-xl shadow-xs cursor-pointer transition-all"
                          >
                            Save Spec Modifications
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="p-6 bg-gray-50 border-t border-gray-150 text-xs text-gray-750 space-y-6" id={`expanded-project-details-${proj.id}`}>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* 1. Core Info Panel */}
                        <div className="bg-white p-5 rounded-xl border border-gray-150 shadow-2xs space-y-3">
                          <h4 className="font-black text-xs text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2 uppercase tracking-wider">
                            <Layers className="w-3.5 h-3.5 text-indigo-600" />
                            1. Core / General Information
                          </h4>
                          <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-black block">Job ID</span>
                              <span className="font-mono font-bold text-gray-800">{proj.id}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-black block">Job Title</span>
                              <span className="font-bold text-gray-800 line-clamp-1">{proj.name}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-black block">Customer Client Name</span>
                              <span className="font-semibold text-gray-800">{matchesClient ? matchesClient.client_name : proj.customer_name}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-black block">Facility Complex / Site</span>
                              <span className="font-bold text-indigo-600">{matchesSite ? matchesSite.site_name : 'Unassigned site'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-black block">Lead Opp. Reference</span>
                              <span className="font-mono text-gray-700">{proj.lead_id || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-black block">Project Category</span>
                              <span className="font-bold text-emerald-800">{proj.project_category || 'MAINTENANCE'}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-[10px] text-gray-400 uppercase font-black block mb-0.5">Operation Description Scope</span>
                              <p className="bg-gray-50 p-2.5 rounded-lg text-gray-600 leading-relaxed font-sans">{proj.description}</p>
                            </div>
                          </div>
                        </div>

                        {/* 2. Commercial Information Panel */}
                        <div className="bg-white p-5 rounded-xl border border-gray-150 shadow-2xs space-y-3">
                          <h4 className="font-black text-xs text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2 uppercase tracking-wider">
                            <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
                            2. Commercial Billing Credentials
                          </h4>
                          <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-black block">Quotation ID</span>
                              <span className="font-mono font-bold text-gray-850">{proj.quotation_number || 'QT-2026-Pending'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-black block">Total Contract Value</span>
                              <span className="font-mono font-black text-emerald-700 text-sm">₹{proj.contract_value ? Number(proj.contract_value).toLocaleString('en-IN') : 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-black block">Approved PO Value</span>
                              <span className="font-mono font-bold text-gray-850">₹{proj.approved_value ? Number(proj.approved_value).toLocaleString('en-IN') : 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-black block">Advance Deposits</span>
                              <span className="font-mono font-bold text-indigo-700">₹{proj.advance_received ? Number(proj.advance_received).toLocaleString('en-IN') : '0'}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-[10px] text-gray-400 uppercase font-black block">Agreed Milestone Terms</span>
                              <span className="font-semibold text-gray-700">{proj.payment_terms || 'Net 30 Days invoice submission'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-black block">AMC Contract Included?</span>
                              <span className={`font-black uppercase text-[10px] px-2 py-0.5 rounded inline-block ${
                                proj.amc_included === 'Yes' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                              }`}>{proj.amc_included || 'No'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-black block">Equipment Warranty Period</span>
                              <span className="font-medium text-gray-700 flex items-center gap-1">
                                <Shield className="w-3.5 h-3.5 text-indigo-500" />
                                {proj.warranty || '1 Year Standard Comprehensive'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 3. Timelines Panel */}
                        <div className="bg-white p-5 rounded-xl border border-gray-150 shadow-2xs space-y-3">
                          <h4 className="font-black text-xs text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2 uppercase tracking-wider">
                            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                            3. ScheduledTimelines / Dates
                          </h4>
                          <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-black block">Planned Start Date</span>
                              <span className="font-mono font-bold text-gray-700">{proj.planned_start_date || proj.start_date || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-black block">Planned Completion Date</span>
                              <span className="font-mono font-bold text-gray-700">{proj.planned_end_date || proj.end_date || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-black block">Actual Commencement</span>
                              <span className="font-mono font-bold text-gray-800">{proj.actual_start_date || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-black block">Actual Completion</span>
                              <span className="font-mono font-bold text-emerald-600">{proj.actual_end_date || 'N/A'}</span>
                            </div>
                          </div>
                        </div>

                        {/* 4. Personnel Team Panel */}
                        <div className="bg-white p-5 rounded-xl border border-gray-150 shadow-2xs space-y-3">
                          <h4 className="font-black text-xs text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2 uppercase tracking-wider">
                            <User className="w-3.5 h-3.5 text-indigo-600" />
                            4. Field Personnel Team
                          </h4>
                          <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-black block">Project Manager (PM)</span>
                              <span className="font-bold text-gray-800">{pManager ? pManager.name : 'Unassigned'}</span>
                              {pManager && <span className="text-[9px] text-gray-400 block font-mono">{pManager.phone}</span>}
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-black block">Site HVAC Engineer</span>
                              <span className="font-bold text-indigo-750">{siteEng ? siteEng.name : 'Unassigned'}</span>
                              {siteEng && <span className="text-[9px] text-gray-400 block font-mono">{siteEng.phone}</span>}
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-black block">Assigned Supervisor In Charge</span>
                              <span className="font-bold text-gray-800">{supervisor ? supervisor.name : 'Unassigned'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-black block">Total Active Technicians</span>
                              <span className="font-mono font-bold text-gray-850">{proj.technician_count || '1'} Technicians</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-[10px] text-gray-400 uppercase font-black block">Specialist HVAC Sub-contractor</span>
                              <span className="font-semibold text-gray-650">{proj.contractor || 'Self-implemented Team'}</span>
                            </div>
                          </div>
                        </div>

                        {/* 5. Technical Specifications Panel */}
                        <div className="bg-white p-5 rounded-xl border border-gray-150 shadow-2xs space-y-3 lg:col-span-2">
                          <h4 className="font-black text-xs text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2 uppercase tracking-wider">
                            <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                            5. Technical Spec Specifications & Hardware Attributes
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-4">
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-black block">HVAC Frame Type</span>
                              <span className="font-bold text-gray-800">{proj.hvac_type || proj.equipment_type || 'VRF System'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-black block">Equipment Brand</span>
                              <span className="font-bold text-indigo-650">{proj.brand || 'Daikin'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-black block">Cooling Output Capacity</span>
                              <span className="font-mono font-bold text-gray-800">{proj.capacity || '10 TR'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-black block">Indoor Fan Coil Units</span>
                              <span className="font-mono font-black text-indigo-600">{proj.indoor_units || '0'} FCUs</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-black block">Outdoor Condensing Units</span>
                              <span className="font-mono font-black text-indigo-600">{proj.outdoor_units || '0'} Outdoor Units</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-black block">Copper Piping Length</span>
                              <span className="font-mono font-bold text-gray-700">{proj.copper_pipe_length || '45m'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-black block">Drainage PVC Pipe length</span>
                              <span className="font-mono font-bold text-gray-700">{proj.drain_pipe_length || '30m'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-black block">Mechanical Fresh Air Intake</span>
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded inline-block ${
                                proj.fresh_air_system === 'Yes' ? 'bg-sky-50 text-sky-850' : 'bg-gray-100 text-gray-500'
                              }`}>{proj.fresh_air_system || 'No'}</span>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Deletion & Toggle Action bar */}
                      <div className="flex justify-between items-center bg-transparent pt-3 border-t border-gray-150">
                        <span className="text-gray-400 text-[10px] font-bold">Press View Details to close this inspection tab.</span>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditingProject(proj);
                            }}
                            className="text-xs text-indigo-700 hover:text-indigo-850 border border-indigo-200 font-bold flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 p-1 px-3 rounded-lg cursor-pointer transition-all"
                          >
                            <Settings className="w-3.5 h-3.5" /> Edit Project Details
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Are you sure you want to permanently remove this service project and all related field tasks?')) {
                                onDeleteProject(proj.id);
                              }
                            }}
                            className="text-xs text-red-500 hover:text-red-750 font-bold flex items-center gap-1 bg-red-50 hover:bg-red-100 border border-transparent p-1 px-3 rounded-lg cursor-pointer transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove Service Job
                          </button>
                        </div>
                      </div>
                    </div>
                    )
                  )}

                </div>
              );
            })}

            {filteredProjects.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-400 italic bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                No HVAC service orders or job categories matched.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
