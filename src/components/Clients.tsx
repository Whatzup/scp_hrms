import React, { useState } from 'react';
import { Client, ClientContact, Site } from '../types';
import { 
  Search, Plus, User, Users, Phone, Mail, MapPin, Building, Globe, 
  Sparkles, Check, X, ArrowLeft, Bookmark, CreditCard, 
  Briefcase, FileText, CheckCircle2, UserCheck, Shield, HelpCircle 
} from 'lucide-react';

interface ClientsProps {
  clients: Client[];
  clientContacts?: ClientContact[];
  onAddClient: (client: Client, contacts?: ClientContact[]) => void;
  sites: Site[];
  onUpdateClient: (id: string, client: Client) => void;
  clientTypeIndustryMapping?: any[];
  onRefreshMappings?: () => void;
}

import { 
  CLIENT_INDUSTRY_MAPPING, 
  clientTypeToIndustries, 
  mapLegacyClientType 
} from '../data/clientMapping';

export default function Clients({ clients, clientContacts = [], onAddClient, sites = [], onUpdateClient, clientTypeIndustryMapping = [], onRefreshMappings }: ClientsProps) {
  const dynamicMappings = clientTypeIndustryMapping.length > 0 
    ? clientTypeIndustryMapping 
    : CLIENT_INDUSTRY_MAPPING;

  const dynamicClientTypeToIndustries: Record<string, string[]> = dynamicMappings.reduce((acc, current) => {
    if (!acc[current.clientType]) {
      acc[current.clientType] = [];
    }
    if (!acc[current.clientType].includes(current.industry)) {
      acc[current.clientType].push(current.industry);
    }
    return acc;
  }, {} as Record<string, string[]>);

  const [newMapType, setNewMapType] = useState('');
  const [newMapIndustry, setNewMapIndustry] = useState('');
  const [addingMap, setAddingMap] = useState(false);

  const handleAddMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMapType.trim() || !newMapIndustry.trim()) return;
    try {
      setAddingMap(true);
      const response = await fetch('/api/client-mappings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientType: newMapType.trim(),
          industry: newMapIndustry.trim()
        })
      });
      if (response.ok) {
        onRefreshMappings?.();
        setNewMapType('');
        setNewMapIndustry('');
      }
    } catch (err) {
      console.error("Failed to add mapping:", err);
    } finally {
      setAddingMap(false);
    }
  };

  const handleDeleteMapping = async (id: string) => {
    try {
      const response = await fetch(`/api/client-mappings/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        onRefreshMappings?.();
      }
    } catch (err) {
      console.error("Failed to delete mapping:", err);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [mappingSearch, setMappingSearch] = useState('');

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('Corporate');
  const [editIndustry, setEditIndustry] = useState('');
  const [editGst, setEditGst] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editDesig, setEditDesig] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDM, setEditDM] = useState('Yes');
  const [editAccounts, setEditAccounts] = useState('');
  const [editLeadSource, setEditLeadSource] = useState('Referral');
  const [editStatus, setEditStatus] = useState<Client['client_status']>('ACTIVE');
  const [editNotes, setEditNotes] = useState('');

  const startEditing = (client: Client) => {
    setEditName(client.client_name || '');
    const mappedType = mapLegacyClientType(client.client_type);
    setEditType(mappedType);
    setEditIndustry(client.industry || (dynamicClientTypeToIndustries[mappedType]?.[0] || ''));
    setEditGst(client.gst_number || '');
    setEditWebsite(client.website || '');
    setEditAddress(client.head_office_address || '');
    setEditContact(client.primary_contact_name || '');
    setEditDesig(client.designation || '');
    setEditMobile(client.mobile || '');
    setEditEmail(client.email || '');
    setEditDM(client.decision_maker || 'Yes');
    setEditAccounts(client.accounts_contact || '');
    setEditLeadSource(client.lead_source || 'Referral');
    setEditStatus(client.client_status || 'ACTIVE');
    setEditNotes(client.notes || '');
    setIsEditing(true);
  };

  const currentSelectedClient = selectedClient 
    ? clients.find(c => c.id === selectedClient.id) || selectedClient 
    : null;

  // Client Form states
  const [clientName, setClientName] = useState('');
  const [clientType, setClientType] = useState('Business');
  const [industry, setIndustry] = useState('Commercial');
  const [gstNumber, setGstNumber] = useState('');
  const [website, setWebsite] = useState('');
  const [headOfficeAddress, setHeadOfficeAddress] = useState('');
  const [primaryContactName, setPrimaryContactName] = useState('');
  const [designation, setDesignation] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [decisionMaker, setDecisionMaker] = useState('Yes');
  const [accountsContact, setAccountsContact] = useState('');
  const [leadSource, setLeadSource] = useState('Referral');
  const [clientStatus, setClientStatus] = useState<Client['client_status']>('ACTIVE');
  const [notes, setNotes] = useState('');

  // Contacts to add in the onboarding form
  const [formContacts, setFormContacts] = useState<Omit<ClientContact, 'id' | 'client_id'>[]>([]);
  
  // Temporary Contact Form state inside the onboarding form
  const [tempContactName, setTempContactName] = useState('');
  const [tempContactDept, setTempContactDept] = useState('');
  const [tempContactDesig, setTempContactDesig] = useState('');
  const [tempContactMobile, setTempContactMobile] = useState('');
  const [tempContactEmail, setTempContactEmail] = useState('');
  const [tempContactIsDM, setTempContactIsDM] = useState(false);
  const [tempContactIsTech, setTempContactIsTech] = useState(false);
  const [tempContactIsAcct, setTempContactIsAcct] = useState(false);

  // Filter lists
  const filteredClients = clients.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.client_name?.toLowerCase().includes(q) ||
      c.client_type?.toLowerCase().includes(q) ||
      (c.industry && c.industry.toLowerCase().includes(q)) ||
      (c.gst_number && c.gst_number.toLowerCase().includes(q)) ||
      (c.primary_contact_name && c.primary_contact_name.toLowerCase().includes(q))
    );
  });

  const handleAddTempContact = () => {
    if (!tempContactName) {
      alert('Contact Name is required.');
      return;
    }
    setFormContacts(prev => [
      ...prev,
      {
        name: tempContactName,
        department: tempContactDept,
        designation: tempContactDesig,
        mobile: tempContactMobile,
        email: tempContactEmail,
        decision_maker: tempContactIsDM,
        technical_contact: tempContactIsTech,
        accounts_contact: tempContactIsAcct,
      }
    ]);
    // reset temp form
    setTempContactName('');
    setTempContactDept('');
    setTempContactDesig('');
    setTempContactMobile('');
    setTempContactEmail('');
    setTempContactIsDM(false);
    setTempContactIsTech(false);
    setTempContactIsAcct(false);
  };

  const handleRemoveTempContact = (index: number) => {
    setFormContacts(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !mobile) {
      alert('Client Name and Mobile contact are required.');
      return;
    }

    const clientId = `c_${Date.now()}`;
    const client_code = `C${String(clients.length + 1).padStart(3, '0')}`;

    const newClient: Client = {
      id: clientId,
      client_name: clientName,
      client_type: clientType,
      industry,
      gst_number: gstNumber,
      website,
      head_office_address: headOfficeAddress,
      primary_contact_name: primaryContactName,
      designation,
      mobile,
      email,
      decision_maker: decisionMaker,
      accounts_contact: accountsContact,
      lead_source: leadSource,
      client_status: clientStatus,
      notes,

      // compatibility defaults
      client_code,
      company_name: clientName,
      address: headOfficeAddress,
      project_name: 'HVAC Mechanical Works',
      location: 'Main Head Office',
      building_type: 'COMMERCIAL',
      approx_area: 'N/A',
      requirement: 'AMC',
      preferred_hvac_system: 'NOT_SURE',
      current_challenges: notes || 'None logged',
      budget_range: 'Est Budget TBD',
      expected_completion_date: '2026-12-31'
    };

    // Format final nested child contacts to insert
    const contactsToInsert: ClientContact[] = formContacts.map((fc, index) => ({
      ...fc,
      id: `cc_${Date.now()}_${index}`,
      client_id: clientId
    }));

    onAddClient(newClient, contactsToInsert);
    setShowAddForm(false);
    
    // Clear state
    setClientName('');
    setClientType('Corporate');
    setIndustry('');
    setGstNumber('');
    setWebsite('');
    setHeadOfficeAddress('');
    setPrimaryContactName('');
    setDesignation('');
    setMobile('');
    setEmail('');
    setDecisionMaker('Yes');
    setAccountsContact('');
    setLeadSource('Referral');
    setClientStatus('ACTIVE');
    setNotes('');
    setFormContacts([]);

    setSelectedClient(newClient);
  };

  // Filter contacts belonging to the selected client
  const activeContacts = currentSelectedClient 
    ? clientContacts.filter(cc => cc.client_id === currentSelectedClient.id) 
    : [];

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName || !editMobile) {
      alert('Client Name and Mobile contact are required.');
      return;
    }
    if (!currentSelectedClient) return;

    const updatedClient: Client = {
      ...currentSelectedClient,
      client_name: editName,
      client_type: editType,
      industry: editIndustry,
      gst_number: editGst,
      website: editWebsite,
      head_office_address: editAddress,
      primary_contact_name: editContact,
      designation: editDesig,
      mobile: editMobile,
      email: editEmail,
      decision_maker: editDM,
      accounts_contact: editAccounts,
      lead_source: editLeadSource,
      client_status: editStatus,
      notes: editNotes,
      
      // compatibility fields
      company_name: editName,
      address: editAddress,
    };

    onUpdateClient(currentSelectedClient.id, updatedClient);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6" id="clients-feature-section">
      {currentSelectedClient ? (
        /* ================= SELECTED CLIENT DETAILS PAGE ================= */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden" id="client-detail-pane">
          {/* Top Banner Profile / Actions */}
          <div className="bg-slate-900 border-b border-slate-800 p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded uppercase">
                  Client ID: {currentSelectedClient.id?.substring(0, 8)}
                </span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                  currentSelectedClient.client_status === 'ACTIVE' ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/30' :
                  currentSelectedClient.client_status === 'PROSPECT' ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-400/30' :
                  currentSelectedClient.client_status === 'ON_HOLD' ? 'bg-amber-500/25 text-amber-300 border border-amber-400/30' :
                  'bg-red-500/25 text-red-300 border border-red-500/30'
                }`}>
                  {currentSelectedClient.client_status}
                </span>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight">{currentSelectedClient.client_name}</h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {currentSelectedClient.client_type}</span>
                {currentSelectedClient.industry && (
                  <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5" /> {currentSelectedClient.industry}</span>
                )}
                {currentSelectedClient.website && (
                  <a href={currentSelectedClient.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-400 hover:underline">
                    <Globe className="w-3.5 h-3.5" /> {currentSelectedClient.website.replace(/^https?:\/\//,'')}
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button 
                onClick={() => {
                  if (isEditing) {
                    setIsEditing(false);
                  } else {
                    startEditing(currentSelectedClient);
                  }
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 font-extrabold text-xs text-white rounded-xl transition-all cursor-pointer border border-transparent shadow-xs"
              >
                {isEditing ? 'Cancel Edit' : 'Edit Client Details'}
              </button>
              <button 
                onClick={() => {
                  setSelectedClient(null);
                  setIsEditing(false);
                }}
                className="flex items-center gap-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 font-bold text-xs text-white rounded-xl transition-all cursor-pointer border border-slate-700 shadow-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Client List
              </button>
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="p-6 space-y-6 text-xs text-gray-700" id="edit-client-form">
              <div className="border-b border-gray-150 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900">Change Client Detailed Information</h3>
                <p className="text-[11px] text-gray-400">Edit business, compliance IDs, contacts and notes of the client account.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="font-extrabold uppercase text-gray-400">Client / Company Name *</label>
                  <input 
                    type="text" 
                    required
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full text-xs p-3 border border-gray-250 rounded-xl bg-white focus:outline-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold uppercase text-gray-400">Client Type</label>
                  <select 
                    value={editType}
                    onChange={e => {
                      const newType = e.target.value;
                      setEditType(newType);
                      const matchedIndustries = dynamicClientTypeToIndustries[newType] || [];
                      setEditIndustry(matchedIndustries[0] || 'Other');
                    }}
                    className="w-full text-xs p-3 border border-gray-250 rounded-xl bg-white focus:outline-indigo-500 font-semibold"
                  >
                    {Object.keys(dynamicClientTypeToIndustries).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold uppercase text-gray-400">Industry</label>
                  <select 
                    value={editIndustry}
                    onChange={e => setEditIndustry(e.target.value)}
                    className="w-full text-xs p-3 border border-gray-250 rounded-xl bg-white focus:outline-indigo-500 font-semibold"
                  >
                    {(dynamicClientTypeToIndustries[editType] || ['Other']).map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold uppercase text-gray-400">GST Registration Number</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 29AAAAA1111A1Z1"
                    value={editGst}
                    onChange={e => setEditGst(e.target.value)}
                    className="w-full text-xs p-3 border border-gray-250 rounded-xl bg-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold uppercase text-gray-400">Website Address</label>
                  <input 
                    type="text" 
                    placeholder="e.g. https://domain.com"
                    value={editWebsite}
                    onChange={e => setEditWebsite(e.target.value)}
                    className="w-full text-xs p-3 border border-gray-250 rounded-xl bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold uppercase text-gray-400">Client Status</label>
                  <select 
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value as Client['client_status'])}
                    className="w-full text-xs p-3 border border-gray-255 rounded-xl bg-white"
                  >
                    <option value="ACTIVE">ACTIVE Account</option>
                    <option value="PROSPECT">PROSPECT (Onboarding)</option>
                    <option value="ON_HOLD">ON_HOLD / INACTIVE</option>
                    <option value="BLACKLISTED">BLACKLISTED / SUSPENDED</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-extrabold uppercase text-gray-400">Head Office Physical Address</label>
                <textarea 
                  rows={2}
                  value={editAddress}
                  onChange={e => setEditAddress(e.target.value)}
                  className="w-full text-xs p-3 border border-gray-250 rounded-xl bg-white"
                />
              </div>

              <div className="border-t border-gray-150 pt-4 space-y-4">
                <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Primary Contact Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">Contact Person Name</label>
                    <input 
                      type="text" 
                      value={editContact}
                      onChange={e => setEditContact(e.target.value)}
                      className="w-full text-xs p-3 border border-gray-250 rounded-xl bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">Designation</label>
                    <input 
                      type="text" 
                      value={editDesig}
                      onChange={e => setEditDesig(e.target.value)}
                      className="w-full text-xs p-3 border border-gray-250 rounded-xl bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">Mobile Phone *</label>
                    <input 
                      type="text" 
                      required
                      value={editMobile}
                      onChange={e => setEditMobile(e.target.value)}
                      className="w-full text-xs p-3 border border-gray-250 rounded-xl bg-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">Email Address</label>
                    <input 
                      type="email" 
                      value={editEmail}
                      onChange={e => setEditEmail(e.target.value)}
                      className="w-full text-xs p-3 border border-gray-250 rounded-xl bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-gray-150 pt-4">
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">Accounts Contact Person info</label>
                  <input 
                    type="text" 
                    value={editAccounts}
                    onChange={e => setEditAccounts(e.target.value)}
                    className="w-full text-xs p-3 border border-gray-250 rounded-xl bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-500">Lead Source Channel</label>
                  <input 
                    type="text" 
                    value={editLeadSource}
                    onChange={e => setEditLeadSource(e.target.value)}
                    className="w-full text-xs p-3 border border-gray-250 rounded-xl bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-500">Historical / Onboarding Notes</label>
                <textarea 
                  rows={3}
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  className="w-full text-xs p-3 border border-gray-250 rounded-xl bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-150">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-650 hover:bg-indigo-705 text-white rounded-xl font-black shadow-xs transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div id="selected-client-view-pane">
              <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column - Core Client Details (Cols 1-5) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-slate-50/50 rounded-xl border border-gray-150/60 p-5 space-y-4">
                  <h3 className="text-xs font-black uppercase text-gray-500 tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
                    <FileText className="w-4 h-4 text-indigo-600" /> Client Details
                  </h3>

                  <div className="grid grid-cols-1 gap-4 text-xs text-gray-700">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">GST Number</span>
                      <span className="font-mono font-bold text-gray-900 bg-white px-2 py-1.5 rounded border border-gray-100 block">
                        {currentSelectedClient.gst_number || <span className="text-gray-400 italic">Not Filed</span>}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">Head Office Address</span>
                      <span className="font-medium text-gray-800 block bg-white px-2.5 py-2 rounded border border-gray-100 whitespace-pre-wrap leading-relaxed">
                        {currentSelectedClient.head_office_address || 'Not Provided'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">Lead Source</span>
                        <span className="font-bold text-gray-800 block bg-white px-2.5 py-1.5 rounded border border-gray-100">
                          {currentSelectedClient.lead_source || 'N/A'}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">Primary Decision Maker</span>
                        <span className="font-bold text-indigo-700 block bg-indigo-50/60 px-2.5 py-1.5 rounded border border-indigo-100/50">
                          {currentSelectedClient.decision_maker || 'Yes'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">Primary Contact Person</span>
                      <div className="bg-white p-3 rounded-lg border border-gray-100 space-y-2">
                        <p className="font-bold text-gray-950 flex items-center gap-1 text-sm">
                          <User className="w-4 h-4 text-gray-400" /> {currentSelectedClient.primary_contact_name || currentSelectedClient.client_name}
                        </p>
                        {currentSelectedClient.designation && (
                          <p className="text-gray-500 font-medium">Designation: <span className="text-gray-800 font-semibold">{currentSelectedClient.designation}</span></p>
                        )}
                        <p className="flex items-center gap-1.5 font-mono text-gray-700 text-xs">
                          <Phone className="w-3.5 h-3.5 text-gray-400" /> {currentSelectedClient.mobile}
                        </p>
                        {currentSelectedClient.email && (
                          <p className="flex items-center gap-1.5 font-mono text-indigo-650 text-xs truncate">
                            <Mail className="w-3.5 h-3.5 text-indigo-400" /> {currentSelectedClient.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">Accounts Contact Person</span>
                      <span className="font-semibold text-gray-800 font-mono block bg-white px-2.5 py-2 rounded border border-gray-100 italic">
                        {currentSelectedClient.accounts_contact || 'None declared'}
                      </span>
                    </div>
                  </div>
                </div>

                {currentSelectedClient.notes && (
                  <div className="bg-amber-50/15 border border-amber-200/60 rounded-xl p-4 space-y-2 text-xs">
                    <h4 className="font-black uppercase text-amber-800 tracking-wider flex items-center gap-1">
                      <Bookmark className="w-4 h-4 text-amber-700" /> Notes & History
                    </h4>
                    <p className="text-gray-700 leading-relaxed font-normal whitespace-pre-wrap">
                      {currentSelectedClient.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column - Client Contacts Table (Cols 6-12) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white rounded-xl border border-gray-150 p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <h4 className="text-xs font-black uppercase text-gray-500 tracking-wider flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-600" /> Client Contacts Table
                    </h4>
                    <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                      {activeContacts.length} Contact Persons
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase text-[9px] tracking-wider bg-gray-50/50">
                          <th className="p-2">Name</th>
                          <th className="p-2">Department / Desig</th>
                          <th className="p-2">Contact Info</th>
                          <th className="p-2 text-center">Attributes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                      {activeContacts.map(cc => (
                        <tr key={cc.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="p-2.5">
                            <span className="font-black text-gray-950 block">{cc.name}</span>
                            <span className="text-[10px] text-gray-400 block font-mono">ID: {cc.id.substring(cc.id.length - 4)}</span>
                          </td>
                          <td className="p-2.5 text-gray-700">
                            <span className="font-semibold text-gray-800 block">{cc.designation || 'Specialist'}</span>
                            <span className="text-[10px] text-slate-400 block uppercase font-bold">{cc.department || 'Operations'}</span>
                          </td>
                          <td className="p-2.5 font-mono text-[11px] text-gray-700 space-y-0.5">
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-gray-400" /> {cc.mobile || 'N/A'}</span>
                            <span className="flex items-center gap-1 text-indigo-600"><Mail className="w-3 h-3 text-gray-300" /> {cc.email || 'N/A'}</span>
                          </td>
                          <td className="p-2.5">
                            <div className="flex flex-col gap-1 items-center justify-center">
                              {cc.decision_maker && (
                                <span className="text-[9px] bg-indigo-50 text-indigo-700 font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 uppercase tracking-wide border border-indigo-100">
                                  <UserCheck className="w-2.5 h-2.5" /> Decision Maker
                                </span>
                              )}
                              {cc.technical_contact && (
                                <span className="text-[9px] bg-amber-50 text-amber-700 font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 uppercase tracking-wide border border-amber-100">
                                  <Shield className="w-2.5 h-2.5" /> Technical
                                </span>
                              )}
                              {cc.accounts_contact && (
                                <span className="text-[9px] bg-emerald-50 text-emerald-700 font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 uppercase tracking-wide border border-emerald-100">
                                  <CreditCard className="w-2.5 h-2.5" /> Accounts
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {activeContacts.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-gray-400 italic">
                            No secondary contact persons added to this company card.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Related Sites Section */}
          <div className="border-t border-gray-100 bg-slate-50/30 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-black uppercase text-indigo-700 tracking-wider flex items-center gap-2">
                  <Building className="w-4 h-4 text-indigo-650" /> Related Site Facilities ({sites.filter(s => s.client_id === currentSelectedClient.id).length})
                </h3>
                <p className="text-[11px] text-gray-500">Service locations, technical HVAC specifications, and facility management contacts registered for this client</p>
              </div>
            </div>

            {sites.filter(s => s.client_id === currentSelectedClient.id).length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-gray-200 p-8 text-center text-gray-400 italic text-xs">
                No site facilities registered for this corporate client yet. Go to the "Sites" tab to register a new facility.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-gray-750">
                {sites.filter(s => s.client_id === currentSelectedClient.id).map(site => (
                  <div key={site.id} className="bg-white rounded-xl border border-gray-150 p-4 space-y-3.5 hover:shadow-xs transition-all">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-2 border-b border-gray-50 pb-2">
                      <div>
                        <span className="text-[9px] font-mono font-bold tracking-wider bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded uppercase block w-fit mb-1">
                          {site.site_code}
                        </span>
                        <h4 className="font-extrabold text-sm text-gray-950">{site.site_name}</h4>
                      </div>
                      <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-lg ${
                        site.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                        site.status === 'ON_HOLD' ? 'bg-amber-100 text-amber-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {site.status}
                      </span>
                    </div>

                    {/* Content Section: Site details & contacts */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Left: Contact Person & Location */}
                      <div className="space-y-2">
                        <div>
                          <span className="text-[9px] text-gray-400 font-extrabold uppercase">Contact Person</span>
                          <span className="font-bold text-gray-900 block mt-0.5">{site.site_contact_person || site.contact_person || 'No representative recorded'}</span>
                          {(site.mobile || site.contact_phone) && (
                            <span className="font-mono text-gray-650 block mt-0.5 text-[11px] font-semibold">{site.mobile || site.contact_phone}</span>
                          )}
                          {(site.email || site.contact_email) && (
                            <span className="font-mono text-indigo-600 block mt-0.5 text-[11px] truncate">{site.email || site.contact_email}</span>
                          )}
                        </div>

                        <div>
                          <span className="text-[9px] text-gray-400 font-extrabold uppercase">Location Address</span>
                          <span className="font-medium text-gray-800 block mt-0.5 leading-relaxed">
                            {site.address}, {site.city}, {site.state} - <span className="font-mono font-semibold">{site.pincode || site.postal_code || '--'}</span>
                          </span>
                          {site.landmark && (
                            <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded block w-fit mt-1">
                              Landmark: {site.landmark}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: HVAC specs & AMC info */}
                      <div className="space-y-2 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                        <div>
                          <span className="text-[9px] text-gray-450 font-extrabold uppercase tracking-wide block mb-1">HVAC Tech Specs</span>
                          <div className="space-y-1 text-[11px] text-gray-700">
                            <p className="flex justify-between">
                              <span className="text-gray-400">System:</span>
                              <strong className="text-gray-800 font-semibold">{site.existing_hvac || '--'}</strong>
                            </p>
                            <p className="flex justify-between">
                              <span className="text-gray-400">Brand(s):</span>
                              <strong className="text-gray-800 font-semibold">{site.existing_brand || '--'}</strong>
                            </p>
                            <p className="flex justify-between">
                              <span className="text-gray-400">Capacity:</span>
                              <strong className="text-gray-800 font-semibold">{site.existing_capacity || '--'}</strong>
                            </p>
                            <p className="flex justify-between">
                              <span className="text-gray-400">Area / Floors:</span>
                              <strong className="text-gray-800 font-semibold">{[site.total_area, site.number_of_floors ? `${site.number_of_floors} flr` : ''].filter(Boolean).join(' / ') || '--'}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-gray-200/50 flex justify-between items-center">
                          <span className="text-gray-455 text-[10px] uppercase font-bold">AMC Status:</span>
                          <span className={`inline-block text-[9px] uppercase font-black px-1.5 py-0.5 rounded ${
                            site.amc_required === 'Yes'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-250/20'
                              : 'bg-amber-50 text-amber-800 border border-amber-250/20'
                          }`}>
                            {site.amc_required === 'Yes' ? 'Active AMC' : 'Ad-Hoc Service Only'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Operational Time Window Range / Access Instructions */}
                    {(site.preferred_visit_time || site.access_instructions) && (
                      <div className="bg-indigo-50/30 p-2.5 rounded-lg border border-indigo-100/30 text-[11px] space-y-1">
                        {site.preferred_visit_time && (
                          <p className="text-indigo-900"><span className="font-extrabold text-indigo-500 uppercase text-[9px] mr-1">Visit Time Window:</span> {site.preferred_visit_time}</p>
                        )}
                        {site.access_instructions && (
                          <p className="text-gray-600 line-clamp-2"><span className="font-extrabold text-gray-400 uppercase text-[9px] mr-1">Access Notes:</span> {site.access_instructions}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
      ) : showAddForm ? (
        /* ================= ADD NEW CLIENT ONBOARDING FORM ================= */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden" id="add-client-form">
          <div className="bg-indigo-650 p-6 text-white flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Add Corporate Client Details</h2>
              <p className="text-xs text-indigo-150">Create a comprehensive client card with associated contacts</p>
            </div>
            <button 
              onClick={() => setShowAddForm(false)}
              className="p-1 px-3 text-xs bg-indigo-700 border border-indigo-600 hover:bg-slate-800 text-white font-bold rounded-lg cursor-pointer transition-colors"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6 text-xs text-gray-750">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Client Name */}
              <div className="space-y-1">
                <label className="font-extrabold uppercase text-gray-450">Client / Company Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Reliance Retail Ltd" 
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  className="w-full text-sm p-3 border border-gray-200 rounded-xl outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Client Type */}
              <div className="space-y-1">
                <label className="font-extrabold uppercase text-gray-450">Client Type</label>
                <select 
                  value={clientType}
                  onChange={e => {
                    const newType = e.target.value;
                    setClientType(newType);
                    const matchedIndustries = dynamicClientTypeToIndustries[newType] || [];
                    setIndustry(matchedIndustries[0] || 'Other');
                  }}
                  className="w-full text-sm p-3 bg-white border border-gray-200 rounded-xl outline-hidden focus:ring-1 focus:ring-indigo-500 font-semibold"
                >
                  {Object.keys(dynamicClientTypeToIndustries).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Industry */}
              <div className="space-y-1">
                <label className="font-extrabold uppercase text-gray-450">Industry</label>
                <select 
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  className="w-full text-sm p-3 bg-white border border-gray-200 rounded-xl outline-hidden focus:ring-1 focus:ring-indigo-500 font-semibold"
                >
                  {(dynamicClientTypeToIndustries[clientType] || ['Other']).map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>

              {/* GST Number */}
              <div className="space-y-1">
                <label className="font-extrabold uppercase text-gray-450">GST Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. 29AAAAA1111A1Z1" 
                  value={gstNumber}
                  onChange={e => setGstNumber(e.target.value)}
                  className="w-full text-sm p-3 border border-gray-200 rounded-xl outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>

              {/* Website */}
              <div className="space-y-1">
                <label className="font-extrabold uppercase text-gray-450">Website URL</label>
                <input 
                  type="url" 
                  placeholder="e.g. https://www.co.com" 
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  className="w-full text-sm p-3 border border-gray-200 rounded-xl outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Lead Source */}
              <div className="space-y-1">
                <label className="font-extrabold uppercase text-gray-450">Lead Source</label>
                <select 
                  value={leadSource}
                  onChange={e => setLeadSource(e.target.value)}
                  className="w-full text-sm p-3 bg-white border border-gray-200 rounded-xl outline-hidden"
                >
                  <option value="Referral">Client Referral</option>
                  <option value="Google Search">Google Organic</option>
                  <option value="Inbound Inquiry">Direct Inbound Email</option>
                  <option value="Sales Campaign">Sales Campaign</option>
                  <option value="Cold Outreach">Cold Outreach</option>
                  <option value="Partner Network">Partner Network</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1">
              <label className="font-extrabold uppercase text-gray-450">Head Office Address</label>
              <textarea 
                rows={2}
                placeholder="Complete registered physical address..." 
                value={headOfficeAddress}
                onChange={e => setHeadOfficeAddress(e.target.value)}
                className="w-full text-sm p-3 border border-gray-200 rounded-xl outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Main Contact Metadata Card */}
            <div className="bg-indigo-50/35 border border-indigo-100 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-extrabold text-indigo-950 flex items-center gap-1.5 border-b border-indigo-100 pb-2">
                <UserCheck className="w-5 h-5 text-indigo-650" />
                Primary Contact & Account Billing
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">Contact Person Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Priyesh Dev" 
                    value={primaryContactName}
                    onChange={e => setPrimaryContactName(e.target.value)}
                    className="w-full text-sm p-2.5 bg-white border border-gray-200 rounded-lg outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-500">Designation</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Chief Operations Officer" 
                    value={designation}
                    onChange={e => setDesignation(e.target.value)}
                    className="w-full text-sm p-2.5 bg-white border border-gray-200 rounded-lg outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-500">Mobile Number *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 9888800001" 
                    value={mobile}
                    onChange={e => setMobile(e.target.value.replace(/\D/g,''))}
                    className="w-full text-sm p-2.5 bg-white border border-gray-200 rounded-lg outline-hidden font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-500">Invoicing / Email Address</label>
                  <input 
                    type="email" 
                    placeholder="e.g. billing@reliance.co" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full text-sm p-2.5 bg-white border border-gray-200 rounded-lg outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">Primary Decision Maker Status</label>
                  <select 
                    value={decisionMaker}
                    onChange={e => setDecisionMaker(e.target.value)}
                    className="w-full text-sm p-2.5 bg-white border border-gray-200 rounded-lg outline-hidden"
                  >
                    <option value="Yes">Yes (Primary authority)</option>
                    <option value="No">No (Requires supervisor signoff)</option>
                    <option value="Escalates to Board">Escalates to CEO / Board</option>
                  </select>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="font-bold text-gray-500">Accounts Contact Details</label>
                  <input 
                    type="text" 
                    placeholder="e.g. accounts-team@company.com or Finance Office ext 402" 
                    value={accountsContact}
                    onChange={e => setAccountsContact(e.target.value)}
                    className="w-full text-sm p-2.5 bg-white border border-gray-200 rounded-lg outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* ClientContacts Multiple Persons Sub-Form section */}
            <div className="bg-slate-50/60 border border-gray-200 rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-gray-150 pb-2">
                <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Users className="w-5 h-5 text-indigo-650" /> Add Secondary Contacts (ClientContacts Table)
                </h3>
                <span className="text-[10px] text-gray-500 font-bold uppercase">Optional auxiliary contact list</span>
              </div>

              {/* Sub-inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-gray-400">FullName</label>
                  <input 
                    type="text" 
                    placeholder="Name of contact" 
                    value={tempContactName}
                    onChange={e => setTempContactName(e.target.value)}
                    className="w-full text-sm p-2.5 bg-white border border-gray-200 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-400">Department</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Maintenance, Engineering" 
                    value={tempContactDept}
                    onChange={e => setTempContactDept(e.target.value)}
                    className="w-full text-sm p-2.5 bg-white border border-gray-200 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-400">Designation</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Technical Lead" 
                    value={tempContactDesig}
                    onChange={e => setTempContactDesig(e.target.value)}
                    className="w-full text-sm p-2.5 bg-white border border-gray-200 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-400">Mobile Phone</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 9111122222" 
                    value={tempContactMobile}
                    onChange={e => setTempContactMobile(e.target.value)}
                    className="w-full text-sm p-2.5 bg-white border border-gray-200 rounded-lg font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-400">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="e.g. contact@email.com" 
                    value={tempContactEmail}
                    onChange={e => setTempContactEmail(e.target.value)}
                    className="w-full text-sm p-2.5 bg-white border border-gray-200 rounded-lg"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-start gap-4 pt-4 sm:col-span-3 bg-white p-3 rounded-lg border border-gray-150/60">
                  <span className="font-bold text-gray-500 mr-2 text-[10px] uppercase">Roles & Checks:</span>
                  
                  <label className="flex items-center gap-1.5 cursor-pointer text-gray-800 font-medium">
                    <input 
                      type="checkbox" 
                      checked={tempContactIsDM}
                      onChange={e => setTempContactIsDM(e.target.checked)}
                      className="w-3.5 h-3.5 accent-indigo-600 rounded"
                    />
                    Decision Maker
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-gray-800 font-medium border-l border-gray-200 pl-4">
                    <input 
                      type="checkbox" 
                      checked={tempContactIsTech}
                      onChange={e => setTempContactIsTech(e.target.checked)}
                      className="w-3.5 h-3.5 accent-indigo-600 rounded"
                    />
                    Technical Contact
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-gray-800 font-medium border-l border-gray-200 pl-4">
                    <input 
                      type="checkbox" 
                      checked={tempContactIsAcct}
                      onChange={e => setTempContactIsAcct(e.target.checked)}
                      className="w-3.5 h-3.5 accent-indigo-600 rounded"
                    />
                    Accounts Contact
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  type="button" 
                  onClick={handleAddTempContact}
                  className="flex items-center gap-1 px-4.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-750 font-bold rounded-lg leading-none cursor-pointer border border-indigo-150/40"
                >
                  <Plus className="w-3.5 h-3.5" /> Stage auxiliary contact
                </button>
              </div>

              {/* Staged contacts display table */}
              {formContacts.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-3 mt-3">
                  <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block border-b border-gray-100 pb-1.5 mb-2">Staged Contacts To Be Onboarded:</span>
                  <div className="space-y-1.5">
                    {formContacts.map((c, i) => (
                      <div key={i} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 text-xs">
                        <div>
                          <strong className="text-gray-950 text-xs">{c.name}</strong> 
                          <span className="text-gray-500 ml-2">({c.designation || 'Specialist'} - {c.department || 'Operations'})</span>
                          <span className="text-slate-400 ml-2 font-mono">{c.mobile} / {c.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold text-gray-400">
                            {[
                              c.decision_maker ? 'DM' : null,
                              c.technical_contact ? 'Tech' : null,
                              c.accounts_contact ? 'Acct' : null
                            ].filter(Boolean).join(', ') || 'General'}
                          </span>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveTempContact(i)}
                            className="p-1 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Note & Setup details */}
            <div className="space-y-2">
              <label className="font-extrabold uppercase text-gray-450 block">Audit Logs / Client Notes</label>
              <textarea 
                rows={2}
                placeholder="Write any custom remarks, special rules, billing cycles..." 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full text-sm p-3 border border-gray-200 rounded-xl outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex shrink-0 justify-end gap-3 pt-5 border-t border-gray-100">
              <button 
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-705 text-white rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Save Client Record
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ================= MASTER CLIENT LIST TAB VIEW ================= */
        <div className="space-y-5" id="clients-list-container">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-950">Clients Registered Records</h2>
              <p className="text-xs text-gray-500">Track company designations, GST codes, and full personnel client contacts</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                id="show-add-client-btn"
                onClick={() => {
                  setShowAddForm(true);
                }}
                className="flex items-center gap-1.5 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-705 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" /> Add New Client
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100 shadow-xs">
            <Search className="w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search clients by name, category, primary contact person, GST number, or industry..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs outline-hidden text-gray-800 bg-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="clients-grid">
            {filteredClients.map(client => {
              const contactsNum = clientContacts.filter(cc => cc.client_id === client.id).length;

              return (
                <div 
                  key={client.id}
                  id={`client-card-${client.id}`}
                  onClick={() => setSelectedClient(client)}
                  className="bg-white p-5 rounded-2xl border border-gray-150/60 hover:border-indigo-200 transition-all cursor-pointer hover:shadow-xs space-y-4 group flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-1">
                      <span className="text-[9px] font-bold font-mono bg-indigo-50 border border-indigo-100/50 text-indigo-700 px-1.5 py-0.5 rounded leading-none">
                        {client.client_code || 'C-NEW'}
                      </span>
                      <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded leading-none ${
                        client.client_status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        client.client_status === 'PROSPECT' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                        client.client_status === 'ON_HOLD' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                        {client.client_status || 'ACTIVE'}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-gray-950 group-hover:text-indigo-600 transition-colors text-base truncate mt-1">
                      {client.client_name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-gray-400 font-bold uppercase">
                      <span>{client.client_type || 'Corporate'}</span>
                      {client.industry && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span>{client.industry}</span>
                        </>
                      )}
                    </div>

                    <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100/50 space-y-2 text-[11px] text-gray-700">
                      <p className="flex items-center gap-1.5 font-semibold text-gray-800">
                        <User className="w-3.5 h-3.5 text-gray-400 shrink-0" /> {client.primary_contact_name || client.client_name}
                      </p>
                      <p className="flex items-center gap-1.5 font-mono text-gray-600 text-[10px]">
                        <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" /> {client.mobile}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] gap-2">
                    <span className="text-slate-400 flex items-center gap-1 font-bold">
                      <Users className="w-3.5 h-3.5 text-indigo-400" /> {contactsNum} Contact Personnel
                    </span>
                    {client.gst_number && (
                      <span className="font-mono text-[9px] text-gray-400 font-semibold bg-gray-50 border border-gray-100 px-1 py-0.5 rounded leading-none">
                        GST: {client.gst_number}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredClients.length === 0 && (
              <div className="col-span-full py-16 text-center text-gray-400 italic bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                No corporate clientele cards matched search terms. Click "Add New Client" to append a record.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Client Type & Industry Mapping Reference Modal */}
      {showMappingModal && (
        <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-xs flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-150 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-scale-up">
            <div className="bg-slate-900 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                  <Shield className="w-5 h-5 text-indigo-400" />
                  Client Type &amp; Industry Reference Mapping
                </h3>
                <p className="text-xs text-slate-300">Valid combinations automatically enforced during client onboarding and updates</p>
              </div>
              <button 
                onClick={() => setShowMappingModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 bg-indigo-50/55 border-b border-indigo-100/60 flex items-center gap-3">
              <Search className="w-4 h-4 text-indigo-500 shrink-0" />
              <input 
                type="text"
                placeholder="Search mapping table by client type or industry..."
                value={mappingSearch}
                onChange={e => setMappingSearch(e.target.value)}
                className="w-full text-xs font-semibold bg-transparent focus:outline-none text-slate-800"
              />
            </div>

            {/* Live creation form for custom mappings */}
            <form onSubmit={handleAddMapping} className="p-4 bg-slate-50 border-b border-slate-150 flex gap-2 items-center">
              <input 
                type="text"
                placeholder="Client Type (e.g. Enterprise)"
                value={newMapType}
                onChange={e => setNewMapType(e.target.value)}
                className="flex-1 p-2 bg-white text-xs font-semibold border border-slate-200 rounded-lg focus:outline-indigo-500"
                required
              />
              <input 
                type="text"
                placeholder="Industry (e.g. Energy)"
                value={newMapIndustry}
                onChange={e => setNewMapIndustry(e.target.value)}
                className="flex-1 p-2 bg-white text-xs font-semibold border border-slate-200 rounded-lg focus:outline-indigo-500"
                required
              />
              <button
                type="submit"
                disabled={addingMap}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-lg cursor-pointer transition-colors shrink-0 text-xs"
              >
                {addingMap ? 'Adding...' : 'Add Rule'}
              </button>
            </form>

            <div className="flex-1 overflow-y-auto p-5">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Client Type</th>
                    <th className="py-2.5 px-3">Enforced Industry Mapping</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dynamicMappings.filter(item => 
                    item.clientType.toLowerCase().includes(mappingSearch.toLowerCase()) ||
                    item.industry.toLowerCase().includes(mappingSearch.toLowerCase())
                  ).map((item, index) => (
                    <tr key={item.id || index} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2 px-3 font-semibold text-slate-900">{item.clientType}</td>
                      <td className="py-2 px-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-mono text-[10.5px] bg-indigo-50 text-indigo-700 border border-indigo-100/40">
                          {item.industry}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button 
                          type="button"
                          onClick={() => handleDeleteMapping(item.id)}
                          title="Delete mapping rule"
                          className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-[10.5px] text-slate-500 font-medium flex justify-between items-center">
              <span>Total Rules: {dynamicMappings.length} mappings</span>
              <button 
                onClick={() => setShowMappingModal(false)}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer"
              >
                Close Reference Table
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
