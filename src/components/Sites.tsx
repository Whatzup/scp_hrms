import React, { useState } from 'react';
import { Site, Client, Employee } from '../types';
import { Search, Plus, MapPin, Building2, User, Phone, CheckCircle, Info, Calendar, X } from 'lucide-react';

interface SitesProps {
  sites: Site[];
  clients: Client[];
  employees: Employee[];
  onAddSite: (site: Site) => void;
  onUpdateSiteStatus: (id: string, status: Site['status']) => void;
  onUpdateSite: (id: string, site: Site) => void;
}

function mapIndustryToSiteType(industry?: string): Site['site_type'] {
  if (!industry) return 'OTHER';
  const ind = industry.toLowerCase().trim();
  if (ind.includes('residential')) {
    return 'RESIDENTIAL';
  }
  if (
    ind.includes('commercial') || 
    ind.includes('retail') || 
    ind.includes('hospitality') || 
    ind.includes('healthcare') || 
    ind.includes('education') || 
    ind.includes('data center') || 
    ind.includes('banking') || 
    ind.includes('finance') || 
    ind.includes('food') || 
    ind.includes('beverage') || 
    ind.includes('pharmaceutical') || 
    ind.includes('telecommunication') || 
    ind.includes('entertainment')
  ) {
    return 'COMMERCIAL';
  }
  if (
    ind.includes('industrial') || 
    ind.includes('manufacture') || 
    ind.includes('manufacturing') || 
    ind.includes('warehouse') || 
    ind.includes('logistics') || 
    ind.includes('construction') || 
    ind.includes('real estate') || 
    ind.includes('agriculture') || 
    ind.includes('oil') || 
    ind.includes('gas')
  ) {
    return 'INDUSTRIAL';
  }
  if (ind.includes('government') || ind.includes('public sector')) {
    return 'GOVERNMENT';
  }
  return 'OTHER';
}

export default function Sites({ sites, clients, employees, onAddSite, onUpdateSiteStatus, onUpdateSite }: SitesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editSiteName, setEditSiteName] = useState('');
  const [editClientId, setEditClientId] = useState('');
  const [editContactPerson, setEditContactPerson] = useState('');
  const [editContactPhone, setEditContactPhone] = useState('');
  const [editContactEmail, setEditContactEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editPostalCode, setEditPostalCode] = useState('');
  const [editSiteType, setEditSiteType] = useState<Site['site_type']>('COMMERCIAL');
  const [editPropertyType, setEditPropertyType] = useState('');
  const [editServiceZone, setEditServiceZone] = useState('');
  const [editLandmark, setEditLandmark] = useState('');
  const [editAccessInstructions, setEditAccessInstructions] = useState('');
  const [editPreferredVisitTime, setEditPreferredVisitTime] = useState('');
  const [editEquipmentSummary, setEditEquipmentSummary] = useState('');
  const [editAssignedManagerId, setEditAssignedManagerId] = useState('');

  const [editPincode, setEditPincode] = useState('');
  const [editSiteContactPerson, setEditSiteContactPerson] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editTotalArea, setEditTotalArea] = useState('');
  const [editNumberOfFloors, setEditNumberOfFloors] = useState('');
  const [editExistingHvac, setEditExistingHvac] = useState('');
  const [editExistingBrand, setEditExistingBrand] = useState('');
  const [editExistingCapacity, setEditExistingCapacity] = useState('');
  const [editAmcRequired, setEditAmcRequired] = useState('No');
  const [editStatus, setEditStatus] = useState<Site['status']>('ACTIVE');

  const startEditingSite = (site: Site) => {
    setEditSiteName(site.site_name || '');
    setEditClientId(site.client_id || '');
    setEditContactPerson(site.site_contact_person || site.contact_person || '');
    setEditContactPhone(site.mobile || site.contact_phone || '');
    setEditContactEmail(site.email || site.contact_email || '');
    setEditAddress(site.address || '');
    setEditCity(site.city || '');
    setEditState(site.state || '');
    setEditPostalCode(site.postal_code || '');
    setEditSiteType(site.site_type || 'COMMERCIAL');
    setEditPropertyType(site.property_type || '');
    setEditServiceZone(site.service_zone || '');
    setEditLandmark(site.landmark || '');
    setEditAccessInstructions(site.access_instructions || '');
    setEditPreferredVisitTime(site.preferred_visit_time || '');
    setEditEquipmentSummary(site.equipment_summary || '');
    setEditAssignedManagerId(site.assigned_manager_id || '');

    setEditPincode(site.pincode || site.postal_code || '');
    setEditSiteContactPerson(site.site_contact_person || site.contact_person || '');
    setEditMobile(site.mobile || site.contact_phone || '');
    setEditEmail(site.email || site.contact_email || '');
    setEditTotalArea(site.total_area || '');
    setEditNumberOfFloors(site.number_of_floors ? String(site.number_of_floors) : '');
    setEditExistingHvac(site.existing_hvac || '');
    setEditExistingBrand(site.existing_brand || '');
    setEditExistingCapacity(site.existing_capacity || '');
    setEditAmcRequired(site.amc_required || 'No');
    setEditStatus(site.status || 'ACTIVE');

    setIsEditing(true);
  };

  const currentSelectedSite = selectedSite 
    ? sites.find(s => s.id === selectedSite.id) || selectedSite 
    : null;

  // Form states
  const [siteName, setSiteName] = useState('');
  const [client_id, setClientId] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [postalCode, setPostalCode] = useState('');
  const [siteType, setSiteType] = useState<Site['site_type']>('COMMERCIAL');
  const [propertyType, setPropertyType] = useState('');
  const [serviceZone, setServiceZone] = useState('Central Zone');
  const [landmark, setLandmark] = useState('');
  const [accessInstructions, setAccessInstructions] = useState('');
  const [preferredVisitTime, setPreferredVisitTime] = useState('');
  const [equipmentSummary, setEquipmentSummary] = useState('');
  const [assignedManagerId, setAssignedManagerId] = useState('');

  // New SiteDetails Form states
  const [pincode, setPincode] = useState('');
  const [siteContactPerson, setSiteContactPerson] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [totalArea, setTotalArea] = useState('');
  const [numberOfFloors, setNumberOfFloors] = useState('');
  const [existingHvac, setExistingHvac] = useState('');
  const [existingBrand, setExistingBrand] = useState('');
  const [existingCapacity, setExistingCapacity] = useState('');
  const [amcRequired, setAmcRequired] = useState('Yes');

  const filteredSites = sites.filter(s => {
    const q = searchQuery.toLowerCase();
    return (
      s.site_name.toLowerCase().includes(q) ||
      s.site_code.toLowerCase().includes(q) ||
      s.customer_name.toLowerCase().includes(q) ||
      s.service_zone.toLowerCase().includes(q) ||
      s.address.toLowerCase().includes(q) ||
      (s.pincode && s.pincode.toLowerCase().includes(q)) ||
      (s.site_contact_person && s.site_contact_person.toLowerCase().includes(q))
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName || !address) {
      alert('Site Name and Address are required.');
      return;
    }

    const linkedClient = clients.find(c => c.id === client_id);
    const site_code = `S${String(sites.length + 1).padStart(3, '0')}`;

    const finalContactPerson = siteContactPerson || contactPerson;
    const finalPhone = mobile || contactPhone;
    const finalEmail = email || contactEmail;
    const finalPincode = pincode || postalCode;

    const newSite: Site = {
      id: `s_${Date.now()}`,
      site_code,
      client_id: client_id || undefined,
      client_name: linkedClient?.company_name || 'Individual Customer',
      site_name: siteName,
      customer_name: linkedClient?.client_name || finalContactPerson || 'Individual Customer',
      contact_person: finalContactPerson,
      contact_phone: finalPhone,
      contact_email: finalEmail,
      address,
      city,
      state,
      postal_code: finalPincode,
      site_type: siteType,
      property_type: propertyType || existingHvac,
      service_zone: serviceZone,
      landmark,
      access_instructions: accessInstructions,
      preferred_visit_time: preferredVisitTime,
      equipment_summary: equipmentSummary || `Existing HVAC: ${existingHvac || 'None'}, Brand: ${existingBrand || 'None'}, Capacity: ${existingCapacity || 'None'}`,
      assigned_manager_id: assignedManagerId || undefined,
      status: 'ACTIVE',

      // New properties
      pincode: finalPincode,
      site_contact_person: finalContactPerson,
      mobile: finalPhone,
      email: finalEmail,
      total_area: totalArea,
      number_of_floors: numberOfFloors,
      existing_hvac: existingHvac,
      existing_brand: existingBrand,
      existing_capacity: existingCapacity,
      amc_required: amcRequired
    };

    onAddSite(newSite);
    setShowAddForm(false);
    setSelectedSite(newSite);
  };

  const handleEditSiteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSiteName || !editAddress) {
      alert("Name and Address are required!");
      return;
    }
    if (!currentSelectedSite) return;

    const matchedClient = clients.find(c => c.id === editClientId);
    const clientName = matchedClient ? matchedClient.client_name : '';

    const updatedSite: Site = {
      ...currentSelectedSite,
      site_name: editSiteName,
      client_id: editClientId || null,
      client_name: clientName || null,
      contact_person: editSiteContactPerson || editContactPerson || null,
      contact_phone: editMobile || editContactPhone || null,
      contact_email: editEmail || editContactEmail || null,
      address: editAddress,
      city: editCity || null,
      state: editState || null,
      postal_code: editPincode || editPostalCode || null,
      site_type: editSiteType,
      property_type: editPropertyType || null,
      service_zone: editServiceZone || null,
      landmark: editLandmark || null,
      access_instructions: editAccessInstructions || null,
      preferred_visit_time: editPreferredVisitTime || null,
      equipment_summary: editEquipmentSummary || null,
      assigned_manager_id: editAssignedManagerId || null,

      pincode: editPincode || null,
      site_contact_person: editSiteContactPerson || null,
      mobile: editMobile || null,
      email: editEmail || null,
      total_area: editTotalArea || null,
      number_of_floors: editNumberOfFloors ? Number(editNumberOfFloors) : null,
      existing_hvac: editExistingHvac || null,
      existing_brand: editExistingBrand || null,
      existing_capacity: editExistingCapacity || null,
      amc_required: editAmcRequired,
      status: editStatus,
    };

    onUpdateSite(currentSelectedSite.id, updatedSite);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6" id="sites-feature">
      {currentSelectedSite ? (
        /* Site Detail Panel */
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6" id="site-detail-panel">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded leading-none">
                {currentSelectedSite.site_code} - {currentSelectedSite.site_type}
              </span>
              <h2 className="text-xl font-bold text-gray-950">{currentSelectedSite.site_name}</h2>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {currentSelectedSite.address}, {currentSelectedSite.city}, {currentSelectedSite.state}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  if (isEditing) {
                    setIsEditing(false);
                  } else {
                    startEditingSite(currentSelectedSite);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 font-bold text-xs text-white rounded-lg transition-all cursor-pointer shadow-xs border border-transparent"
              >
                {isEditing ? 'Cancel Edit' : 'Edit Site Details'}
              </button>
              <button 
                onClick={() => {
                  setSelectedSite(null);
                  setIsEditing(false);
                }}
                className="p-1 px-3 text-xs bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors font-bold text-gray-700 rounded-lg cursor-pointer animate-fade-in"
              >
                Back to Sites List
              </button>
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleEditSiteSubmit} className="space-y-5 text-xs text-gray-700" id="edit-site-form">
              <div className="border-b border-gray-150 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900">Change Site Detailed Information</h3>
                <p className="text-[11px] text-gray-400">Edit address, type, dimensions, HVAC specifications and contact representative of this site.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="font-extrabold uppercase text-gray-400">Site Name *</label>
                  <input 
                    type="text" 
                    required
                    value={editSiteName}
                    onChange={e => setEditSiteName(e.target.value)}
                    className="w-full text-xs p-3 border border-gray-250 rounded-xl bg-white focus:outline-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold uppercase text-gray-400">Parent Client / Customer Account</label>
                  <select 
                    value={editClientId}
                    onChange={e => {
                      const cid = e.target.value;
                      setEditClientId(cid);
                      const matchedClient = clients.find(c => c.id === cid);
                      if (matchedClient) {
                        if (matchedClient.industry) {
                          setEditPropertyType(matchedClient.industry);
                        }
                        const mappedType = mapIndustryToSiteType(matchedClient.industry);
                        setEditSiteType(mappedType);
                      }
                    }}
                    className="w-full text-xs p-3 border border-gray-250 rounded-xl bg-white"
                  >
                    <option value="">-- No Client Account linked --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.client_name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold uppercase text-gray-400">Site Type</label>
                  <select 
                    value={editSiteType}
                    onChange={e => setEditSiteType(e.target.value as Site['site_type'])}
                    className="w-full text-xs p-3 border border-gray-250 rounded-xl bg-white"
                  >
                    <option value="COMMERCIAL">Commercial Building</option>
                    <option value="RESIDENTIAL">Residential Property</option>
                    <option value="INDUSTRIAL">Industrial Site / Factory</option>
                    <option value="GOVERNMENT">Government Bureaucracy</option>
                    <option value="OTHER">Other Custom</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold uppercase text-gray-400">Service Area Zone</label>
                  <select 
                    value={editServiceZone}
                    onChange={e => setEditServiceZone(e.target.value)}
                    className="w-full text-xs p-3 border border-gray-250 rounded-xl bg-white"
                  >
                    <option value="Central Zone">Central Zone</option>
                    <option value="North Zone">North Zone</option>
                    <option value="South Zone">South Zone</option>
                    <option value="East Zone">East Zone</option>
                    <option value="West Zone">West Zone</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-extrabold uppercase text-gray-400">Site Address *</label>
                <input 
                  type="text" 
                  required
                  value={editAddress}
                  onChange={e => setEditAddress(e.target.value)}
                  className="w-full text-xs p-3 border border-gray-255 rounded-xl bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">City</label>
                  <input 
                    type="text" 
                    value={editCity}
                    onChange={e => setEditCity(e.target.value)}
                    className="w-full text-xs p-3 border border-gray-250 rounded-xl bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">State</label>
                  <input 
                    type="text" 
                    value={editState}
                    onChange={e => setEditState(e.target.value)}
                    className="w-full text-xs p-3 border border-gray-250 rounded-xl bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">Pincode</label>
                  <input 
                    type="text" 
                    value={editPincode}
                    onChange={e => setEditPincode(e.target.value)}
                    className="w-full text-xs p-3 border border-gray-250 rounded-xl bg-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">Site Status</label>
                  <select 
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value as Site['status'])}
                    className="w-full text-xs p-3 border border-gray-250 rounded-xl bg-white"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="ON_HOLD">ON_HOLD</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-150 pt-4 space-y-4">
                <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Property & Building Specs</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">Property Category / Tag</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Server Room, Duplex, Mall Outlet"
                      value={editPropertyType}
                      onChange={e => setEditPropertyType(e.target.value)}
                      className="w-full text-xs p-3 border border-gray-250 rounded-xl bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">Total Built-Up Area</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 4500 Sq Ft"
                      value={editTotalArea}
                      onChange={e => setEditTotalArea(e.target.value)}
                      className="w-full text-xs p-3 border border-gray-250 rounded-xl bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">Number of Floors</label>
                    <input 
                      type="number" 
                      value={editNumberOfFloors}
                      onChange={e => setEditNumberOfFloors(e.target.value)}
                      className="w-full text-xs p-3 border border-gray-250 rounded-xl bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-150 pt-4 space-y-4">
                <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">HVAC & Installed Equipment Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-gray-500">HVAC System Type</label>
                    <input 
                      type="text" 
                      placeholder="e.g. VRF-Systems, Split-Units, Ductable-Units"
                      value={editExistingHvac}
                      onChange={e => setEditExistingHvac(e.target.value)}
                      className="w-full text-xs p-3 border border-gray-250 rounded-xl bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">Units Brand/Make</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Daikin, BlueStar"
                      value={editExistingBrand}
                      onChange={e => setEditExistingBrand(e.target.value)}
                      className="w-full text-xs p-3 border border-gray-250 rounded-xl bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">Total Cooling Capacity</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 15.5 TR, 4 Ton"
                      value={editExistingCapacity}
                      onChange={e => setEditExistingCapacity(e.target.value)}
                      className="w-full text-xs p-3 border border-gray-250 rounded-xl bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">AMC Service Required</label>
                    <select 
                      value={editAmcRequired}
                      onChange={e => setEditAmcRequired(e.target.value)}
                      className="w-full text-xs p-3 border border-gray-250 rounded-xl bg-white"
                    >
                      <option value="Yes">Yes, Active Contract Cover Needed</option>
                      <option value="No">No AMC requirement</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">Assigned Customer Site Manager</label>
                    <select 
                      value={editAssignedManagerId}
                      onChange={e => setEditAssignedManagerId(e.target.value)}
                      className="w-full text-xs p-3 border border-gray-250 rounded-xl bg-white"
                    >
                      <option value="">-- Let any assigned Manager/Engineer lead --</option>
                      {employees.filter(emp => emp.status === 'ACTIVE').map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.title || emp.job_title || 'Technologist'})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-150 pt-4 space-y-4">
                <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Site On-Site Representative / Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">Contact Person Name</label>
                    <input 
                      type="text" 
                      value={editSiteContactPerson}
                      onChange={e => setEditSiteContactPerson(e.target.value)}
                      className="w-full text-xs p-3 border border-gray-250 rounded-xl bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">Representative Mobile Phone</label>
                    <input 
                      type="text" 
                      value={editMobile}
                      onChange={e => setEditMobile(e.target.value)}
                      className="w-full text-xs p-3 border border-gray-255 rounded-xl bg-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">Representative Email Address</label>
                    <input 
                      type="email" 
                      value={editEmail}
                      onChange={e => setEditEmail(e.target.value)}
                      className="w-full text-xs p-3 border border-gray-250 rounded-xl bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-500">Landmark / Access Instructions / Notes</label>
                <textarea 
                  rows={2}
                  value={editLandmark}
                  onChange={e => setEditLandmark(e.target.value)}
                  className="w-full text-xs p-3 border border-gray-250 rounded-xl bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-150">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-650 hover:bg-indigo-705 text-white rounded-xl font-black shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2 border-t border-gray-50">
              {/* Properties info */}
              <div className="space-y-5">
                <div className="p-4 bg-gray-50/50 rounded-xl space-y-3.5 border border-gray-100">
                  <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">Site Information</h3>
                  <div className="space-y-2.5 text-xs font-sans">
                    <div>
                      <span className="text-gray-400 block">Customer / Business:</span>
                      <span className="font-semibold text-gray-800">{currentSelectedSite.customer_name}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Serviced Zone:</span>
                      <span className="font-semibold text-gray-800">{currentSelectedSite.service_zone}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Property Type Designation:</span>
                      <span className="font-semibold text-gray-800">{currentSelectedSite.property_type || 'Retail space'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Postal Code / Pincode:</span>
                      <span className="font-mono text-gray-700">{currentSelectedSite.pincode || currentSelectedSite.postal_code || '--'}</span>
                    </div>
                    {currentSelectedSite.total_area && (
                      <div>
                        <span className="text-gray-400 block">Total Area:</span>
                        <span className="font-semibold text-gray-850">{currentSelectedSite.total_area}</span>
                      </div>
                    )}
                    {currentSelectedSite.number_of_floors && (
                      <div>
                        <span className="text-gray-400 block">Number of Floors:</span>
                        <span className="font-semibold text-gray-850">{currentSelectedSite.number_of_floors}</span>
                      </div>
                    )}
                    {currentSelectedSite.landmark && (
                      <div>
                        <span className="text-gray-400 block">Landmarket Point / Landmark:</span>
                        <span className="font-semibold text-indigo-700">{currentSelectedSite.landmark}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Update */}
                <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 space-y-3">
                  <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">Operational Status</h3>
                  <div className="flex gap-2">
                    <select 
                      value={currentSelectedSite.status}
                      onChange={(e) => onUpdateSiteStatus(currentSelectedSite.id, e.target.value as Site['status'])}
                      className="flex-1 p-2 bg-white text-xs font-bold rounded-lg border border-gray-250 focus:ring-1 focus:ring-indigo-505"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="ON_HOLD">ON HOLD</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                    <span className={`text-xs p-2 rounded-lg font-black border uppercase tracking-wider block text-center ${
                      currentSelectedSite.status === 'ACTIVE' ? 'bg-emerald-50 border-emerald-250 text-emerald-800' :
                      currentSelectedSite.status === 'ON_HOLD' ? 'bg-amber-50 border-amber-250 text-amber-800' :
                      'bg-gray-100 hover:bg-gray-200 text-gray-750'
                    }`}>
                      {currentSelectedSite.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contacts & Assigned managers */}
              <div className="space-y-5">
                <div className="p-4 bg-gray-50/50 rounded-xl space-y-3 border border-gray-100">
                  <h3 className="text-xs font-black uppercase text-indigo-700 tracking-wider">Contact Details</h3>
                  <div className="space-y-3.5 text-xs font-sans">
                    <div className="flex items-center gap-2.5">
                      <User className="w-4 h-4 text-indigo-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase">Site Contact Person</span>
                        <span className="font-bold text-gray-950">{currentSelectedSite.site_contact_person || currentSelectedSite.contact_person || 'No representative recorded'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase">Mobile Number</span>
                        <span className="font-mono text-gray-900 font-bold">{currentSelectedSite.mobile || currentSelectedSite.contact_phone || '--'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase">Email Coordinate</span>
                        <span className="text-gray-700 font-mono truncate block max-w-[200px]">{currentSelectedSite.email || currentSelectedSite.contact_email || '--'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assigned Manager */}
                <div className="p-4 bg-gray-50/50 rounded-xl space-y-3.5 border border-gray-100">
                  <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">Managed By</h3>
                  {currentSelectedSite.assigned_manager_id ? (() => {
                    const manager = employees.find(e => e.id === currentSelectedSite.assigned_manager_id);
                    return manager ? (
                      <div className="space-y-1">
                        <h4 className="font-bold text-indigo-700 text-sm leading-tight">{manager.name}</h4>
                        <p className="text-[11px] text-gray-500">{manager.title}</p>
                        <p className="text-[11px] text-gray-400 mt-1">{manager.email}</p>
                      </div>
                    ) : <p className="text-xs text-gray-400 italic">No supervisor assigned currently</p>;
                  })() : (
                    <p className="text-xs text-gray-400 italic">Unassigned manager record</p>
                  )}
                </div>
              </div>

              {/* Equipment summary & instructions */}
              <div className="space-y-5">
                <div className="p-4 bg-emerald-50/30 border border-emerald-100 rounded-xl space-y-2.5">
                  <h3 className="text-xs font-black uppercase text-emerald-800 tracking-wider">HVAC Technical Status</h3>
                  <div className="space-y-2 text-xs font-sans">
                    <div>
                      <span className="text-gray-400 block text-[10px]">EXISTING HVAC:</span>
                      <span className="font-semibold text-gray-800">{currentSelectedSite.existing_hvac || '--'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">BRAND(S):</span>
                      <span className="font-semibold text-gray-800">{currentSelectedSite.existing_brand || '--'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">CAPACITY:</span>
                      <span className="font-semibold text-gray-800">{currentSelectedSite.existing_capacity || '--'}</span>
                    </div>
                    <div className="pt-2 border-t border-emerald-100/50 flex justify-between items-center">
                      <span className="text-emerald-800 block uppercase font-extrabold text-[10px]">AMC Required:</span>
                      <span className={`inline-block text-[10px] uppercase font-black px-2 py-0.5 rounded-lg ${
                        currentSelectedSite.amc_required === 'Yes'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {currentSelectedSite.amc_required || 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-indigo-50/30 border border-indigo-100 rounded-xl space-y-2">
                  <h3 className="text-xs font-black uppercase text-indigo-800 tracking-wider">Equipment Inventory & Details</h3>
                  <p className="text-xs text-gray-750 font-sans leading-relaxed">
                    {currentSelectedSite.equipment_summary || 'No pre-existing HVAC machinery logs found on files.'}
                  </p>
                </div>

                {currentSelectedSite.access_instructions && (
                  <div className="p-4 bg-amber-50/20 border border-amber-100 rounded-xl space-y-3">
                    <h3 className="text-xs font-black uppercase text-amber-800 tracking-wider">Security & Access instructions</h3>
                    <p className="text-xs text-gray-700 font-sans leading-relaxed">
                      {currentSelectedSite.access_instructions}
                    </p>
                  </div>
                )}

                {currentSelectedSite.preferred_visit_time && (
                  <div className="p-4 bg-blue-50/30 border border-blue-100 rounded-xl text-xs space-y-1">
                    <span className="text-blue-800 font-bold block uppercase tracking-wider text-[10px]">Preferred Window Range</span>
                    <span className="text-blue-900 font-semibold">{currentSelectedSite.preferred_visit_time}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : showAddForm ? (
        /* Create Site form workspace */
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6" id="add-site-form">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-950">Add Site Facility</h2>
              <p className="text-xs text-gray-500">Register serviced building landmarks, site contacts, and technical capacity details</p>
            </div>
            <button 
              onClick={() => setShowAddForm(false)}
              className="p-1.5 px-3 text-xs bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors font-bold text-gray-750 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-xs text-gray-700">
            {/* Section 1: Core Facility Details */}
            <div className="space-y-3">
              <h3 className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider border-b pb-1">1. Facility Core Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="font-extrabold uppercase text-gray-400">Site Location Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Metro Plaza Rooftop B" 
                    value={siteName}
                    onChange={e => setSiteName(e.target.value)}
                    className="w-full text-sm p-3 border border-gray-200 rounded-xl outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold uppercase text-gray-400">Belongs to Client</label>
                  <select 
                    value={client_id}
                    onChange={e => {
                      const cid = e.target.value;
                      setClientId(cid);
                      const linkedClient = clients.find(c => c.id === cid);
                      if (linkedClient) {
                        if (linkedClient.industry) {
                          setPropertyType(linkedClient.industry);
                        }
                        const mappedType = mapIndustryToSiteType(linkedClient.industry);
                        setSiteType(mappedType);
                      }
                    }}
                    className="w-full text-sm p-3 border border-gray-200 rounded-xl outline-hidden bg-white focus:ring-1"
                  >
                    <option value="">-- No Linked Client (Individual Client) --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.company_name || c.client_name} ({c.client_code})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold uppercase text-gray-400">Site Type Classification</label>
                  <select 
                    value={siteType}
                    onChange={e => setSiteType(e.target.value as Site['site_type'])}
                    className="w-full text-sm p-3 border border-gray-200 rounded-xl outline-hidden bg-white focus:ring-1"
                  >
                    <option value="COMMERCIAL">Commercial Retail</option>
                    <option value="RESIDENTIAL">Residential Apartment / Housing</option>
                    <option value="INDUSTRIAL">Industrial Factory / Complex</option>
                    <option value="GOVERNMENT">Government Bureaucracy</option>
                    <option value="OTHER">Other Custom</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold uppercase text-gray-400">Property Category / Tag (Inherited Industry)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Healthcare, Commercial, Residential, or custom" 
                    value={propertyType}
                    onChange={e => setPropertyType(e.target.value)}
                    className="w-full text-sm p-3 border border-gray-200 rounded-xl outline-hidden focus:ring-1"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold uppercase text-gray-400">Service Zone</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Central Zone, North Zone" 
                    value={serviceZone}
                    onChange={e => setServiceZone(e.target.value)}
                    className="w-full text-sm p-3 border border-gray-200 rounded-xl outline-hidden focus:ring-1"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Address Information */}
            <div className="space-y-3 pt-3 border-t border-gray-150">
              <h3 className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">2. Address & Location</h3>
              <div className="space-y-1">
                <label className="font-extrabold uppercase text-gray-400">Full Structural Address *</label>
                <textarea 
                  required
                  rows={2}
                  placeholder="Street address details..." 
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full text-sm p-3 border border-gray-200 rounded-xl outline-hidden focus:ring-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-gray-400 text-[10px]">City</label>
                  <input 
                    type="text" 
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-400 text-[10px]">State</label>
                  <input 
                    type="text" 
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-400 text-[10px]">Pincode / Postal Code *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 560001"
                    value={pincode}
                    onChange={e => {
                      setPincode(e.target.value);
                      setPostalCode(e.target.value);
                    }}
                    className="w-full p-2 border border-indigo-200 focus:border-indigo-400 bg-indigo-50/10 rounded text-sm font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-400 text-[10px]">Landmark reference point</label>
                  <input 
                    type="text" 
                    placeholder="Next to Gate 2" 
                    value={landmark}
                    onChange={e => setLandmark(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Contact Person Details */}
            <div className="space-y-3 pt-3 border-t border-gray-150">
              <h3 className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">3. Site Contact Personnel</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1">
                  <label className="font-bold text-indigo-650 text-[10px] uppercase">Site Contact Person *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Lead facility manager name" 
                    value={siteContactPerson}
                    onChange={e => {
                      setSiteContactPerson(e.target.value);
                      setContactPerson(e.target.value);
                    }}
                    className="w-full p-2.5 border border-indigo-200 focus:border-indigo-400 bg-indigo-50/10 rounded-lg text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-indigo-650 text-[10px] uppercase">Mobile *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. +91 9999988888" 
                    value={mobile}
                    onChange={e => {
                      setMobile(e.target.value);
                      setContactPhone(e.target.value);
                    }}
                    className="w-full p-2.5 border border-indigo-200 focus:border-indigo-400 bg-indigo-50/10 rounded-lg text-sm font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-indigo-650 text-[10px] uppercase">Email ID</label>
                  <input 
                    type="email" 
                    placeholder="e.g. supervisor@sitecode.com" 
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value);
                      setContactEmail(e.target.value);
                    }}
                    className="w-full p-2.5 border border-indigo-200 focus:border-indigo-400 bg-indigo-50/10 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Technical Specs & AMC */}
            <div className="space-y-3 pt-3 border-t border-gray-150 bg-gray-50/40 p-4 rounded-xl border border-gray-100">
              <h3 className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">4. Technical Specifications & Equipment Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1">
                  <label className="font-bold text-gray-400 text-[10px] uppercase">Total Area (Sq.Ft / Sq.M)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 25,000 Sq.Ft" 
                    value={totalArea}
                    onChange={e => setTotalArea(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-400 text-[10px] uppercase">Number of Floors</label>
                  <input 
                    type="text" 
                    placeholder="e.g. G + 4 Floors" 
                    value={numberOfFloors}
                    onChange={e => setNumberOfFloors(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-400 text-[10px] uppercase">AMC Required ?</label>
                  <select 
                    value={amcRequired}
                    onChange={e => setAmcRequired(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-white font-bold text-emerald-800"
                  >
                    <option value="Yes">Yes (Annual Maintenance Contract Active)</option>
                    <option value="No">No (Ad-hoc Service only)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-2">
                <div className="space-y-1">
                  <label className="font-bold text-gray-400 text-[10px] uppercase">Existing HVAC System Description</label>
                  <input 
                    type="text" 
                    placeholder="e.g. VRF, Chillers, Cassette ACs" 
                    value={existingHvac}
                    onChange={e => setExistingHvac(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-400 text-[10px] uppercase">Existing brand(S)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Daikin, Mitsubishi, Blue Star" 
                    value={existingBrand}
                    onChange={e => setExistingBrand(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-400 text-[10px] uppercase">Existing Capacity (TR / HP)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 150 TR cumulative" 
                    value={existingCapacity}
                    onChange={e => setExistingCapacity(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Operations & Assigned Supervisor */}
            <div className="space-y-3 pt-3 border-t border-gray-150">
              <h3 className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">5. Operations & Logistics Routing</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="col-span-1 space-y-1">
                  <label className="font-bold text-gray-400 text-[10px]">Assigned Operations Manager/Supervisor</label>
                  <select 
                    value={assignedManagerId}
                    onChange={e => setAssignedManagerId(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-white font-mono"
                  >
                    <option value="">-- No Direct Supervisor Assigned --</option>
                    {employees.filter(emp => emp.status === 'ACTIVE' && (emp.job_title === 'SUPERVISOR' || emp.job_title === 'MANAGER')).map(sup => (
                      <option key={sup.id} value={sup.id}>{sup.name} ({sup.title})</option>
                    ))}
                  </select>
                </div>
                
                <div className="col-span-2 space-y-1">
                  <label className="font-bold text-gray-400 text-[10px]">Preferred Timing Window Range</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 10 AM - 5 PM on Weekdays" 
                    value={preferredVisitTime}
                    onChange={e => setPreferredVisitTime(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                <div className="space-y-1">
                  <label className="font-bold text-gray-400 text-[10px]">HVAC Machinery/Equipment inventory detailed note (Optional)</label>
                  <textarea 
                    rows={2}
                    placeholder="e.g. 2 x Rooftop packaged multi-zone compressors..." 
                    value={equipmentSummary}
                    onChange={e => setEquipmentSummary(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-400 text-[10px]">Access instructions / Shift constraints</label>
                  <textarea 
                    rows={2}
                    placeholder="e.g. Security badge must be registered, service elevator is locked..." 
                    value={accessInstructions}
                    onChange={e => setAccessInstructions(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                type="submit"
                className="px-6 py-2.5 bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                Register Structural Site
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Standard Listing Display Grid */
        <div className="space-y-5">
          <div className="flex justify-between items-center bg-transparent">
            <div>
              <h2 className="text-xl font-bold text-gray-950">Serviced Facility Sites</h2>
              <p className="text-xs text-gray-500">Customer property structures and machinery assets</p>
            </div>
            <button 
              id="show-add-site-btn"
              onClick={() => {
                setSiteName('');
                setClientId('');
                setContactPerson('');
                setContactPhone('');
                setContactEmail('');
                setAddress('');
                setPostalCode('');
                setPropertyType('');
                setLandmark('');
                setAccessInstructions('');
                setPreferredVisitTime('');
                setEquipmentSummary('');
                setAssignedManagerId('');
                
                // Reset new SiteDetails states
                setPincode('');
                setSiteContactPerson('');
                setMobile('');
                setEmail('');
                setTotalArea('');
                setNumberOfFloors('');
                setExistingHvac('');
                setExistingBrand('');
                setExistingCapacity('');
                setAmcRequired('Yes');

                setShowAddForm(true);
              }}
              className="flex items-center gap-1.5 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-705 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" /> Add New Site
            </button>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100 shadow-xs">
            <Search className="w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search sites by code, name, city, customer, zone, or equipment type..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs outline-hidden text-gray-800 bg-transparent"
            />
          </div>

          {/* Site Cards Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="sites-grid">
            {filteredSites.map(site => {
              const assignedManager = employees.find(e => e.id === site.assigned_manager_id);
              return (
                <div 
                  key={site.id} 
                  id={`site-card-${site.id}`}
                  onClick={() => setSelectedSite(site)}
                  className="bg-white p-5 rounded-2xl border border-gray-150/60 hover:border-indigo-200 transition-all cursor-pointer hover:shadow-xs space-y-4 group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="truncate">
                        <span className="text-[9px] font-bold font-mono bg-indigo-50 border border-indigo-100/50 text-indigo-700 px-1.5 py-0.5 rounded leading-none">
                          {site.site_code} - {site.site_type}
                        </span>
                        <h3 className="font-extrabold text-gray-900 group-hover:text-indigo-600 transition-colors text-base truncate mt-1">{site.site_name}</h3>
                        <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-300" />
                          {site.address}, {site.city}
                        </p>
                      </div>
                      <span className={`text-[10px] font-black uppercase rounded-lg border px-2 py-1 leading-none ${
                        site.status === 'ACTIVE' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                        'bg-amber-50 border-amber-100 text-amber-700'
                      }`}>
                        {site.status}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 font-sans line-clamp-2 bg-gray-50 p-2 border border-gray-50 rounded-lg">
                      {site.equipment_summary || 'No preconfigured machine assets.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] gap-2">
                    <span className="text-gray-400">
                      Zone: <span className="text-indigo-600 font-extrabold">{site.service_zone}</span>
                    </span>
                    {assignedManager && (
                      <span className="font-bold text-gray-700 truncate max-w-[150px]">
                        Mgr: <span className="text-gray-900">{assignedManager.name}</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredSites.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-405 italic bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                No structural sites found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
