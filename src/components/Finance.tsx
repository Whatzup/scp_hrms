import React, { useState, useMemo, useEffect } from 'react';
import { Quotation, PurchaseOrder, Client, Project, QuotationLineItem, PurchaseOrderLineItem, Vendor, Site } from '../types';
import { 
  Plus, Trash2, Edit, Printer, Eye, Search, X, Calendar, 
  CheckCircle, AlertCircle, Receipt, FileSpreadsheet, Building2, 
  Wrench, ArrowRight, IndianRupee, FileText, Check, Clock, ShieldAlert, Truck,
  Calculator, Star, Mail, RefreshCw, FileCode, ChevronDown, ChevronUp
} from 'lucide-react';
import HvacEstimator from './HvacEstimator';
import { CatalogItem } from '../types';

interface FinanceProps {
  quotations: Quotation[];
  purchaseOrders: PurchaseOrder[];
  clients: Client[];
  projects: Project[];
  hvacCatalog: CatalogItem[];
  vendors?: Vendor[];
  sites?: Site[];
  onUpdateCatalogItem: (item: CatalogItem) => Promise<void>;
  onAddQuotation: (newQuote: Quotation) => Promise<void>;
  onUpdateQuotation: (updatedQuote: Quotation) => Promise<void>;
  onDeleteQuotation: (id: string) => Promise<void>;
  onAddPurchaseOrder: (newPo: PurchaseOrder) => Promise<void>;
  onUpdatePurchaseOrder: (updatedPo: PurchaseOrder) => Promise<void>;
  onDeletePurchaseOrder: (id: string) => Promise<void>;
  initialSubTab?: 'quotations' | 'pos';
}

export default function Finance({
  quotations,
  purchaseOrders,
  clients,
  projects,
  hvacCatalog,
  vendors = [],
  sites = [],
  onUpdateCatalogItem,
  onAddQuotation,
  onUpdateQuotation,
  onDeleteQuotation,
  onAddPurchaseOrder,
  onUpdatePurchaseOrder,
  onDeletePurchaseOrder,
  initialSubTab = 'quotations'
}: FinanceProps) {
  const [activeSubTab, setActiveSubTab] = useState<'quotations' | 'pos'>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);
  
  // Search and Filter States
  const [quoteSearch, setQuoteSearch] = useState('');
  const [quoteStatusFilter, setQuoteStatusFilter] = useState<string>('All');
  
  const [poSearch, setPoSearch] = useState('');
  const [poStatusFilter, setPoStatusFilter] = useState<string>('All');
  
  const [poQuoteSearch, setPoQuoteSearch] = useState('');
  const [poQuoteStatusFilter, setPoQuoteStatusFilter] = useState<string>('All');
  
  // Modals / View States
  const [activeQuoteForm, setActiveQuoteForm] = useState<{ mode: 'create' | 'edit'; data?: Quotation } | null>(null);
  const [activePoForm, setActivePoForm] = useState<{ mode: 'create' | 'edit'; data?: PurchaseOrder } | null>(null);
  
  const [previewQuote, setPreviewQuote] = useState<Quotation | null>(null);
  const [previewPo, setPreviewPo] = useState<PurchaseOrder | null>(null);
  const [showEstimatorTool, setShowEstimatorTool] = useState(false);
  const [composerKey, setComposerKey] = useState(0);

  // --- STATISTICS CALCULATIONS ---
  const stats = useMemo(() => {
    const totalQuoteAmt = quotations.reduce((acc, q) => acc + q.grand_total, 0);
    const approvedQuoteAmt = quotations
      .filter(q => q.status === 'Approved')
      .reduce((acc, q) => acc + q.grand_total, 0);
    const totalPoAmt = purchaseOrders.reduce((acc, p) => acc + p.grand_total, 0);
    const activePos = purchaseOrders.filter(p => p.status !== 'Closed').length;

    return {
      totalQuotes: quotations.length,
      totalQuoteAmt,
      approvedQuoteAmt,
      totalPos: purchaseOrders.length,
      totalPoAmt,
      activePos
    };
  }, [quotations, purchaseOrders]);

  // --- FILTERS & SEARCH PROCESS ---
  const filteredQuotations = useMemo(() => {
    return quotations.filter(q => {
      const matchesSearch = 
        q.quotation_number.toLowerCase().includes(quoteSearch.toLowerCase()) ||
        (q.client_name || '').toLowerCase().includes(quoteSearch.toLowerCase()) ||
        (q.project_name || '').toLowerCase().includes(quoteSearch.toLowerCase());
      
      const matchesStatus = quoteStatusFilter === 'All' || q.status === quoteStatusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [quotations, quoteSearch, quoteStatusFilter]);

  const filteredPurchaseOrders = useMemo(() => {
    return purchaseOrders.filter(po => {
      const matchesSearch = 
        po.po_number.toLowerCase().includes(poSearch.toLowerCase()) ||
        po.vendor_name.toLowerCase().includes(poSearch.toLowerCase()) ||
        (po.project_name || '').toLowerCase().includes(poSearch.toLowerCase());
      
      const matchesStatus = poStatusFilter === 'All' || po.status === poStatusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [purchaseOrders, poSearch, poStatusFilter]);

  const filteredPoQuotations = useMemo(() => {
    return quotations.filter(q => {
      const matchesSearch = 
        q.quotation_number.toLowerCase().includes(poQuoteSearch.toLowerCase()) ||
        (q.client_name || '').toLowerCase().includes(poQuoteSearch.toLowerCase()) ||
        (q.project_name || '').toLowerCase().includes(poQuoteSearch.toLowerCase());
      
      const matchesStatus = poQuoteStatusFilter === 'All' || q.status === poQuoteStatusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [quotations, poQuoteSearch, poQuoteStatusFilter]);


  // Helper: format money to Rupees nicely
  const formatRupees = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Trigger Creation of PO from an approved Quotation
  const handleCreatePoFromQuote = (q: Quotation) => {
    const mappedItems: PurchaseOrderLineItem[] = q.items.map(item => ({
      description: item.description,
      unit: item.unit || 'NOS',
      quantity: item.quantity,
      unit_price: item.unit_price, // pre-populate with quotation rates, which are adjustable in the form
      total: item.total
    }));

    const defaultVendor = (vendors || []).find(v => (v.name || '').toLowerCase().includes('voltas')) || (vendors || [])[0];
    const initialVendorName = defaultVendor ? defaultVendor.name : 'M/S VOLTAS LIMITED';
    const initialVendorAddress = defaultVendor ? defaultVendor.address : 'A-43, NH-19 BLOCK B, MOHAN COOPERATIVE BADARPUR DELHI';
    const initialVendorGst = defaultVendor ? defaultVendor.gst : '07AAAAA1111A1Z1';
    const initialVendorContact = defaultVendor ? defaultVendor.contact_person : 'MR SIDDHARTH';

    const clientSites = (sites || []).filter(s => s.client_id === q.client_id);
    const defaultSite = clientSites[0];
    const initialDeliveryAddress = defaultSite ? `${defaultSite.site_name} - ${defaultSite.address}` : '8/24 EAST PUNJABI BAGH NEW DELHI 110026';

    const partialPo: PurchaseOrder = {
      id: `po_from_quote_${q.id}_${Date.now()}`,
      po_number: `PO-SCP-${Math.floor(1000 + Math.random() * 9000)}`,
      vendor_name: initialVendorName,
      vendor_address: initialVendorAddress,
      vendor_gst: initialVendorGst,
      client_id: q.client_id,
      client_name: q.client_name,
      project_id: q.project_id,
      project_name: q.project_name,
      po_date: new Date().toISOString().split('T')[0],
      delivery_date: q.valid_until || '',
      status: 'Draft',
      subtotal: q.subtotal,
      tax_rate: q.tax_rate,
      tax_amount: q.tax_amount,
      shipping_handling: q.shipping_amount || 0,
      grand_total: q.grand_total,
      payment_terms: 'Net 30',
      notes: `Purchase order created from Approved Quotation ${q.quotation_number}.`,
      items: mappedItems,
      delivery_address: initialDeliveryAddress,
      vendor_contact_person: initialVendorContact,
      quotation_id: q.id,
      quotation_number: q.quotation_number
    };

    // Open active PO form in create mode with pre-populated quotation data
    setActivePoForm({ mode: 'create', data: partialPo });
    // Switch sub-tab to purchase orders
    setActiveSubTab('pos');
    setTimeout(() => {
      document.getElementById('purchase-orders-view-panel')?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  return (
    <div className="space-y-6" id="finance-hub-viewport">
      {/* 1. Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          {activeSubTab === 'quotations' ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <FileCode className="w-5 h-5" />
                </span>
                <div>
                  <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2 animate-fadeIn">
                    SCP Quotation Composer
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full border border-emerald-200 font-bold tracking-normal font-mono animate-pulse">
                      LIVE
                    </span>
                  </h1>
                  <p className="text-[11px] text-slate-500 font-medium">Minimum-click quote composer</p>
                </div>
              </div>

              {/* New Quote Button */}
              <button
                onClick={() => {
                  setActiveQuoteForm(null);
                  setComposerKey(prev => prev + 1);
                }}
                className="text-xs font-black p-2 px-4 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 cursor-pointer transition-colors shadow-sm self-start sm:self-center"
              >
                🔄 New Quote
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 animate-fadeIn">
              <span className="p-2 bg-purple-50 text-purple-650 rounded-xl">
                <Receipt className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-lg font-black text-slate-900 tracking-tight">
                  Purchase Orders Ledger
                </h1>
                <p className="text-[11px] text-slate-500 font-medium">Oversee supplier and material purchase commitments</p>
              </div>
            </div>
          )}
        </div>

        {/* Right side stats for Quotations */}
        {activeSubTab === 'quotations' && (
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto ml-auto">
            {/* Widget 1 */}
            <div className="bg-white p-3 px-4 rounded-xl border border-slate-150 shadow-xs flex items-center gap-3 shrink-0">
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">Drafted Quotes</span>
                <strong className="text-sm font-black text-slate-800 block leading-tight">{stats.totalQuotes} Quotes</strong>
                <span className="text-[10px] text-slate-500 font-semibold">{formatRupees(stats.totalQuoteAmt)} total value</span>
              </div>
            </div>

            {/* Widget 2 */}
            <div className="bg-white p-3 px-4 rounded-xl border border-slate-150 shadow-xs flex items-center gap-3 shrink-0">
              <div className="p-1.5 bg-emerald-50 text-emerald-650 rounded-lg">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">Approved Revenue</span>
                <strong className="text-sm font-black text-slate-800 block leading-tight">{formatRupees(stats.approvedQuoteAmt)}</strong>
                <span className="text-[10px] text-slate-500 font-semibold">
                  {quotations.filter(q => q.status === 'Approved').length} approved proposals
                </span>
              </div>
            </div>
          </div>
        )}

        {/* stats for POs if active */}
        {activeSubTab === 'pos' && (
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto ml-auto">
            {/* Widget 3 */}
            <div className="bg-white p-3 px-4 rounded-xl border border-slate-150 shadow-xs flex items-center gap-3 shrink-0">
              <div className="p-1.5 bg-purple-50 text-purple-650 rounded-lg">
                <Receipt className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">Purchase Orders</span>
                <strong className="text-sm font-black text-slate-800 block leading-tight">{stats.totalPos} Issued</strong>
                <span className="text-[10px] text-slate-500 font-semibold">{formatRupees(stats.totalPoAmt)} commitments</span>
              </div>
            </div>

            {/* Widget 4 */}
            <div className="bg-white p-3 px-4 rounded-xl border border-slate-150 shadow-xs flex items-center gap-3 shrink-0">
              <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">Pending POs</span>
                <strong className="text-sm font-black text-slate-800 block leading-tight">{stats.activePos} Outstanding</strong>
                <span className="text-[10px] text-slate-500 font-semibold">Awaiting complete fulfillment</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- SUBTAB VIEW : CLIENT QUOTATIONS --- */}
      {activeSubTab === 'quotations' && (
        <div className="space-y-6 animate-fadeIn" id="quotations-view-panel">
          
          {/* HVC Quotation Tool - Inline Composer */}
          <QuotationFormModal
            key={activeQuoteForm?.data?.id ? `edit-${activeQuoteForm.data.id}` : `new-${composerKey}`}
            mode={activeQuoteForm?.mode || 'create'}
            initialData={activeQuoteForm?.data}
            clients={clients}
            projects={projects}
            quotations={quotations}
            hvacCatalog={hvacCatalog}
            onUpdateCatalogItem={onUpdateCatalogItem}
            onClose={() => setActiveQuoteForm(null)}
            onAdd={async (q) => {
              await onAddQuotation(q);
              setActiveQuoteForm(null);
            }}
            onUpdate={async (q) => {
              await onUpdateQuotation(q);
              setActiveQuoteForm(null);
            }}
            formatRupees={formatRupees}
            isInline={true}
          />

          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-xs flex flex-col md:flex-row gap-3 justify-between items-center">
            <div className="flex flex-1 flex-col sm:flex-row gap-2.5 w-full">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by quote number, corporate client or job description..."
                  value={quoteSearch}
                  onChange={(e) => setQuoteSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 hover:border-slate-300"
                />
              </div>

              {/* Status Filter */}
              <select
                value={quoteStatusFilter}
                onChange={(e) => setQuoteStatusFilter(e.target.value)}
                className="border border-slate-200 p-2 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white font-bold text-slate-700 min-w-[140px]"
              >
                <option value="All">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Quotations List */}
          <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                    <th className="p-4 pl-6">Quote Reference</th>
                    <th className="p-4">Corporate Client / Site Job</th>
                    <th className="p-4">Dated</th>
                    <th className="p-4">Valid Until</th>
                    <th className="p-4 text-right">Grand Total</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredQuotations.length > 0 ? (
                    filteredQuotations.map((q) => (
                      <tr key={q.id} className="hover:bg-slate-50/55 transition-colors">
                        <td className="p-4 pl-6">
                          <span className="font-extrabold text-indigo-950 font-mono tracking-tight block">
                            {q.quotation_number}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {q.items.length} materials/service lines
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-extrabold text-slate-800">{q.client_name || 'Generic Prospect'}</span>
                          </div>
                          {q.project_name && (
                            <div className="flex items-center gap-1 mt-0.5 text-[10.5px] text-slate-500 font-medium">
                              <Wrench className="w-3 h-3 text-slate-450" />
                              <span>Job: {q.project_name}</span>
                            </div>
                          )}
                        </td>
                        <td className="p-4 font-mono text-slate-600 font-medium">{q.quotation_date}</td>
                        <td className="p-4 font-mono text-slate-600 font-medium">{q.valid_until || 'N/A'}</td>
                        <td className="p-4 text-right font-black text-indigo-950 font-mono">
                          {formatRupees(q.grand_total)}
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center">
                            <span className={`px-2.5 py-1 text-[10px] font-black rounded-full border ${
                              q.status === 'Approved' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                              q.status === 'Sent' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' :
                              q.status === 'Draft' ? 'bg-slate-100 border-slate-300 text-slate-600' :
                              'bg-rose-50 border-rose-200 text-rose-700'
                            }`}>
                              {q.status}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <div className="flex justify-end items-center gap-1.5">
                            {q.status === 'Approved' && (
                              <button
                                title="Generate Purchase Order from this quotation"
                                onClick={() => handleCreatePoFromQuote(q)}
                                className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-lg transition-all cursor-pointer shadow-xs flex items-center gap-1 shrink-0"
                              >
                                <Receipt className="w-3.5 h-3.5 text-white inline" />
                                <span>Create PO</span>
                              </button>
                            )}
                            <button
                              title="Print/Preview Document"
                              onClick={() => setPreviewQuote(q)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              title="Modify Quotation Details"
                              onClick={() => {
                                setActiveQuoteForm({ mode: 'edit', data: q });
                                setTimeout(() => {
                                  document.getElementById('quotations-view-panel')?.scrollIntoView({ behavior: 'smooth' });
                                }, 100);
                              }}
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              title="Delete Quotation"
                              onClick={async () => {
                                if (confirm(`Remove quotation ${q.quotation_number} from system records?`)) {
                                  await onDeleteQuotation(q.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 italic font-medium font-sans">
                        No clients quotation proposals matching active search guidelines.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- SUBTAB VIEW : PURCHASE ORDERS --- */}
      {activeSubTab === 'pos' && (
        <div className="space-y-6 animate-fadeIn" id="purchase-orders-view-panel">
          {/* Centered Purchase Order Action Panel */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-xs gap-4 select-none">
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                <Receipt className="w-4.5 h-4.5 text-indigo-600" />
                Purchase Order Desk
              </h3>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Convert approved quotations into binding commercial purchase orders, or issue standalone POs to suppliers.
              </p>
            </div>
            
            <button
              onClick={() => {
                setActivePoForm({ mode: 'create' });
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs p-2.5 px-5 rounded-xl flex items-center gap-2 shadow-xs transition-all hover:shadow-md cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              Create PO without Quotation
            </button>
          </div>

          {/* DUAL PANE LAYOUT */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: SOURCE QUOTATIONS */}
            <div className="xl:col-span-5 space-y-4">
              <div className="bg-slate-50/75 p-4 rounded-2xl border border-slate-200/80 space-y-3.5">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black text-slate-900 tracking-tight uppercase">
                      1. Quotations Pipeline
                    </h4>
                    <p className="text-[10px] text-slate-450 font-bold">
                      Match &amp; convert active customer proposals
                    </p>
                  </div>
                  <span className="bg-indigo-100 text-indigo-800 text-[10px] font-black p-1 px-2.5 rounded-full border border-indigo-200">
                    {filteredPoQuotations.length} items
                  </span>
                </div>

                {/* Left side filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search proposal..."
                      value={poQuoteSearch}
                      onChange={(e) => setPoQuoteSearch(e.target.value)}
                      className="pl-8 pr-2 py-1.5 border border-slate-200 rounded-lg text-[10.5px] w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 hover:border-slate-300 bg-white"
                    />
                  </div>
                  <select
                    value={poQuoteStatusFilter}
                    onChange={(e) => setPoQuoteStatusFilter(e.target.value)}
                    className="border border-slate-200 p-1.5 text-[10.5px] rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white font-bold text-slate-700"
                  >
                    <option value="All">All Quotations</option>
                    <option value="Approved">Approved Only</option>
                    <option value="Sent">Sent Only</option>
                    <option value="Draft">Draft Only</option>
                  </select>
                </div>
              </div>

              {/* Quotations List Card Frame */}
              <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
                {filteredPoQuotations.length > 0 ? (
                  filteredPoQuotations.map((q) => {
                    // Check if a PO has been generated for this quotation
                    const linkedPo = purchaseOrders.find(
                      (p) => p.quotation_id === q.id || p.quotation_number === q.quotation_number
                    );

                    return (
                      <div 
                        key={q.id} 
                        className={`p-4 rounded-xl border transition-all ${
                          linkedPo 
                            ? 'bg-emerald-50/30 border-emerald-150/70 hover:border-emerald-300' 
                            : 'bg-white border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-extrabold text-indigo-950 font-mono tracking-tight text-xs">
                                {q.quotation_number}
                              </span>
                              <span className={`p-0.5 px-2 text-[9px] font-black rounded-md border ${
                                q.status === 'Approved' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                q.status === 'Sent' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                'bg-amber-50 border-amber-200 text-amber-700'
                              }`}>
                                {q.status}
                              </span>
                            </div>
                            
                            <div className="text-[10px] text-slate-500 font-semibold uppercase">
                              Client: {q.client_name || 'Direct walk-in'}
                            </div>
                            
                            {q.project_name && (
                              <div className="flex items-center gap-1 text-[9.5px] text-slate-400 font-medium">
                                <Wrench className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate max-w-[180px]">{q.project_name}</span>
                              </div>
                            )}
                          </div>

                          <div className="text-right space-y-1 shrink-0">
                            <div className="font-mono font-black text-slate-900 text-xs">
                              {formatRupees(q.grand_total)}
                            </div>
                            <div className="text-[9px] font-medium text-slate-400">
                              Issued: {q.quotation_date}
                            </div>
                          </div>
                        </div>

                        {/* PO STATUS CORNER */}
                        <div className="mt-3.5 pt-3 border-t border-slate-100 flex justify-between items-center">
                          {linkedPo ? (
                            <button
                              onClick={() => setPreviewPo(linkedPo)}
                              className="bg-emerald-100/80 hover:bg-emerald-200/80 text-emerald-800 text-[9.5px] font-bold p-1 px-2 rounded-lg border border-emerald-200/60 flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <CheckCircle className="w-3 h-3 text-emerald-600 inline" />
                              <span>Sent for PO ({linkedPo.po_number})</span>
                            </button>
                          ) : (
                            <span className="text-amber-700 bg-amber-50 border border-amber-100 text-[9.5px] font-bold p-1 px-2 rounded-lg flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-500 inline" />
                              <span>Pending PO Conversion</span>
                            </span>
                          )}

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              title="View Quotation Details"
                              onClick={() => setPreviewQuote(q)}
                              className="p-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] font-bold rounded-lg border border-slate-200 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3 h-3 inline mr-0.5" />
                              View
                            </button>
                            <button
                              title="Modify Quotation"
                              onClick={() => {
                                setActiveQuoteForm({ mode: 'edit', data: q });
                                setTimeout(() => {
                                  document.getElementById('quotations-view-panel')?.scrollIntoView({ behavior: 'smooth' });
                                }, 100);
                              }}
                              className="p-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] font-bold rounded-lg border border-slate-200 transition-colors cursor-pointer"
                            >
                              <Edit className="w-3 h-3 inline mr-0.5" />
                              Edit
                            </button>
                            <button
                              title="Convert to Purchase Order"
                              onClick={() => handleCreatePoFromQuote(q)}
                              className="p-1 px-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-extrabold rounded-lg transition-colors cursor-pointer flex items-center gap-0.5 shadow-2xs"
                            >
                              <Receipt className="w-3 h-3 text-white" />
                              <span>Create PO</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-slate-400 italic bg-white border border-slate-150 rounded-xl font-medium font-sans text-xs">
                    No quotations matching active searches.
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: ISSUED PURCHASE ORDERS */}
            <div className="xl:col-span-7 space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-3xs space-y-3.5">
                <div className="flex flex-col sm:flex-row gap-2.5 justify-between items-start sm:items-center">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black text-slate-900 tracking-tight uppercase">
                      2. Commercial Purchase Orders (Issued)
                    </h4>
                    <p className="text-[10px] text-slate-450 font-bold">
                      Official commercial bindings issued to suppliers
                    </p>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search POs by supplier, PO number, or project reference..."
                      value={poSearch}
                      onChange={(e) => setPoSearch(e.target.value)}
                      className="pl-9 pr-4 py-1.5 border border-slate-200 rounded-xl text-xs w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 hover:border-slate-300 bg-white"
                    />
                  </div>
                  <select
                    value={poStatusFilter}
                    onChange={(e) => setPoStatusFilter(e.target.value)}
                    className="border border-slate-200 p-1.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white font-bold text-slate-700 min-w-[130px]"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent</option>
                    <option value="Approved">Approved</option>
                    <option value="Received">Received</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Purchase Orders Table */}
              <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                        <th className="p-3 pl-4">PO Reference</th>
                        <th className="p-3">Vendor Details</th>
                        <th className="p-3">Source Quote</th>
                        <th className="p-3 text-right">Grand Total</th>
                        <th className="p-3 text-center">Status</th>
                        <th className="p-3 pr-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredPurchaseOrders.length > 0 ? (
                        filteredPurchaseOrders.map((po) => (
                          <tr key={po.id} className="hover:bg-slate-50/55 transition-colors">
                            <td className="p-3 pl-4">
                              <span className="font-extrabold text-indigo-950 font-mono tracking-tight block">
                                {po.po_number}
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold block leading-none mt-0.5">
                                {po.po_date} • {po.items.length} items
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="font-extrabold text-slate-800 leading-tight">{po.vendor_name}</div>
                              {po.project_name && (
                                <div className="text-[10px] text-slate-500 font-medium truncate max-w-[150px]">
                                  {po.project_name}
                                </div>
                              )}
                            </td>
                            <td className="p-3">
                              {po.quotation_number ? (
                                <span className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-150 text-indigo-800 text-[10px] font-mono font-bold p-0.5 px-1.5 rounded-md">
                                  <FileText className="w-3 h-3 text-indigo-500 inline" />
                                  {po.quotation_number}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[10px] italic">Direct PO</span>
                              )}
                            </td>
                            <td className="p-3 text-right font-black text-indigo-950 font-mono">
                              {formatRupees(po.grand_total)}
                            </td>
                            <td className="p-3">
                              <div className="flex justify-center">
                                <span className={`px-2 py-0.5 text-[9px] font-black rounded-full border ${
                                  po.status === 'Closed' ? 'bg-slate-100 border-slate-300 text-slate-600' :
                                  po.status === 'Received' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                  po.status === 'Approved' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                  po.status === 'Sent' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' :
                                  'bg-amber-50 border-amber-200 text-amber-700'
                                }`}>
                                  {po.status}
                                </span>
                              </div>
                            </td>
                            <td className="p-3 pr-4 text-right">
                              <div className="flex justify-end gap-1 shrink-0">
                                <button
                                  title="Print/Preview Document"
                                  onClick={() => setPreviewPo(po)}
                                  className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  title="Modify Purchase Order"
                                  onClick={() => {
                                    setActivePoForm({ mode: 'edit', data: po });
                                  }}
                                  className="p-1 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  title="Delete PO Record"
                                  onClick={async () => {
                                    if (confirm(`Delete the purchase order record ${po.po_number} from database state?`)) {
                                      await onDeletePurchaseOrder(po.id);
                                    }
                                  }}
                                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400 italic font-medium font-sans">
                            No purchase order records matching search criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}



      {/* --- FORM MODAL: CREATE / EDIT PURCHASE ORDER --- */}
      {activePoForm && (
        <PurchaseOrderFormModal
          mode={activePoForm.mode}
          initialData={activePoForm.data}
          clients={clients}
          projects={projects}
          vendors={vendors}
          sites={sites}
          quotations={quotations}
          onClose={() => setActivePoForm(null)}
          onAdd={onAddPurchaseOrder}
          onUpdate={onUpdatePurchaseOrder}
          formatRupees={formatRupees}
        />
      )}

      {/* --- DOCUMENT PRINT PREVIEW MODAL: QUOTATION --- */}
      {previewQuote && (
        <QuotationPreviewModal
          quote={previewQuote}
          clients={clients}
          onClose={() => setPreviewQuote(null)}
          formatRupees={formatRupees}
          onCreatePo={handleCreatePoFromQuote}
        />
      )}

      {/* --- DOCUMENT PRINT PREVIEW MODAL: PURCHASE ORDER --- */}
      {previewPo && (
        <PurchaseOrderPreviewModal
          po={previewPo}
          onClose={() => setPreviewPo(null)}
          formatRupees={formatRupees}
        />
      )}

    </div>
  );
}

// ==========================================================
// SUB-COMPONENT: ADVANCED HVC QUOTATION TOOL (FORM MODAL)
// ==========================================================
interface QuotationFormModalProps {
  key?: string;
  mode: 'create' | 'edit';
  initialData?: Quotation;
  clients: Client[];
  projects: Project[];
  quotations: Quotation[];
  hvacCatalog: CatalogItem[];
  onUpdateCatalogItem: (item: CatalogItem) => Promise<void>;
  onClose: () => void;
  onAdd: (q: Quotation) => Promise<void>;
  onUpdate: (q: Quotation) => Promise<void>;
  formatRupees: (val: number) => string;
  isInline?: boolean;
}

function QuotationFormModal({
  mode,
  initialData,
  clients,
  projects,
  quotations,
  hvacCatalog,
  onUpdateCatalogItem,
  onClose,
  onAdd,
  onUpdate,
  formatRupees,
  isInline = false
}: QuotationFormModalProps) {
  const [quotationNumber, setQuotationNumber] = useState(
    initialData?.quotation_number || `QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [clientId, setClientId] = useState(initialData?.client_id || '');
  const [projectId, setProjectId] = useState(initialData?.project_id || '');
  const [quotationDate, setQuotationDate] = useState(initialData?.quotation_date || new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState(
    initialData?.valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [status, setStatus] = useState<Quotation['status']>(initialData?.status || 'Draft');
  const [taxRate, setTaxRate] = useState<number>(initialData?.tax_rate !== undefined ? initialData.tax_rate : 18);
  const [discountAmount, setDiscountAmount] = useState<number>(initialData?.discount_amount || 0);
  const [shippingAmount, setShippingAmount] = useState<number>(initialData?.shipping_amount || 0);
  const [terms, setTerms] = useState(initialData?.terms_conditions || '1. Terms: 50% advance check payment with remaining 50% paid immediately upon successful installation / system commissioning.\n2. Rate valid for 30 business days.');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const [items, setItems] = useState<QuotationLineItem[]>(
    initialData?.items || []
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [composerPreviewQuote, setComposerPreviewQuote] = useState<Quotation | null>(null);

  // Advanced search & UX states
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [skuSearch, setSkuSearch] = useState('');
  const [cloneQuoteId, setCloneQuoteId] = useState('');
  const [showPasteSkus, setShowPasteSkus] = useState(false);
  const [pastedSkusText, setPastedSkusText] = useState('');

  // Collapsible sections
  const [isKitsExpanded, setIsKitsExpanded] = useState(true);
  const [isQuickAddExpanded, setIsQuickAddExpanded] = useState(true);
  const [isRecentlyAddedExpanded, setIsRecentlyAddedExpanded] = useState(true);
  const [isCatalogExpanded, setIsCatalogExpanded] = useState(true);

  // Catalog filtering states
  const [activeDepartment, setActiveDepartment] = useState('All');
  const [activeCategory, setActiveCategory] = useState('All');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [expandedSku, setExpandedSku] = useState<string | null>(null);

  useEffect(() => {
    if (hvacCatalog) {
      setFavorites(hvacCatalog.filter(it => it.isFavorite).map(it => it.sku));
    }
  }, [hvacCatalog]);

  // Hotkey focus refs
  const catalogSearchRef = React.useRef<HTMLInputElement>(null);
  const customerSearchRef = React.useRef<HTMLInputElement>(null);

  // Synchronize client picker search box
  useEffect(() => {
    if (clientId) {
      const selected = clients.find(c => c.id === clientId);
      if (selected) {
        setCustomerSearch(selected.client_name);
      }
    } else {
      setCustomerSearch('');
    }
  }, [clientId, clients]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + S (Save Draft)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveQuotationDocument('Draft');
      }
      // Ctrl + P (Preview PDF)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        triggerPreviewPdf();
      }
      // Focus Catalog Search with '/'
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        catalogSearchRef.current?.focus();
      }
      // Focus Customer search with '@'
      if (e.key === '@' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        customerSearchRef.current?.focus();
        setShowCustomerDropdown(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, clientId, quotationNumber, quotationDate, validUntil, status, taxRate, discountAmount, shippingAmount, terms, notes]);

  // Core Add to Items function
  const addItemToQuotation = (item: CatalogItem, qty: number = 1) => {
    setItems(prevItems => {
      const fullDesc = item.description || item.name;
      const existingIndex = prevItems.findIndex(p => p.description.toLowerCase() === fullDesc.toLowerCase());
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + qty,
          total: (updated[existingIndex].quantity + qty) * updated[existingIndex].unit_price
        };
        return updated;
      } else {
        return [
          ...prevItems,
          {
            description: fullDesc,
            unit: item.unit,
            unit_price: item.price,
            quantity: qty,
            total: item.price * qty
          }
        ];
      }
    });
  };

  // Helper lists resolved from the data catalog
  const QUICK_ADD_SKUS = [
    "LOW-COPPER-PIPING-COPPER-PIPING-1-4-IN",
    "LOW-COPPER-PIPING-COPPER-PIPING-3-8-IN",
    "LOW-COPPER-PIPING-COPPER-PIPING-1-2-IN",
    "LOW-COPPER-PIPING-COPPER-PIPING-5-8-IN",
    "LOW-INSULATION-9-MM-NITRILE-INSULA",
    "LOW-INSULATION-13-MM-NITRILE-INSUL",
    "LOW-DRAINAGE-25-MM-DRAINAGE-PIPE",
    "LOW-INSTALLATION-CASSETTE-AC-INSTALL",
    "LOW-INSTALLATION-SPLIT-AC-INSTALL"
  ];

  const RECENTLY_ADDED_SKUS = [
    "FCQF18CV16",
    "FCQF24ARV16",
    "FCFQ50CV16",
    "FCFQ71CV16",
    "FCMF50CV16",
    "FCMF71CV16"
  ];

  const quickAddItems = useMemo(() => {
    return QUICK_ADD_SKUS.map(sku => hvacCatalog.find(it => it.sku === sku)).filter(Boolean) as CatalogItem[];
  }, [hvacCatalog]);

  const recentlyAddedItems = useMemo(() => {
    return RECENTLY_ADDED_SKUS.map(sku => hvacCatalog.find(it => it.sku === sku)).filter(Boolean) as CatalogItem[];
  }, [hvacCatalog]);

  const DEFAULT_KITS = [
    {
      name: "Daikin Cassette 1.5TR Install Kit",
      description: "Complete setup for 1.5 TR Cassette (Unit + Install + Pipes + Drainage)",
      itemsCount: 5,
      items: [
        { sku: "FCQF18CV16", quantity: 1 },
        { sku: "LOW-INSTALLATION-CASSETTE-AC-INSTALL", quantity: 1 },
        { sku: "LOW-COPPER-PIPING-COPPER-PIPING-1-2-IN", quantity: 10 },
        { sku: "LOW-INSULATION-9-MM-NITRILE-INSULA", quantity: 10 },
        { sku: "LOW-DRAINAGE-25-MM-DRAINAGE-PIPE", quantity: 5 }
      ]
    },
    {
      name: "Daikin Inverter 2.0TR Install Kit",
      description: "Premium setup for 2.0 TR Inverter (FCFQ71CV16 Unit + Install + Materials)",
      itemsCount: 5,
      items: [
        { sku: "FCFQ71CV16", quantity: 1 },
        { sku: "LOW-INSTALLATION-CASSETTE-AC-INSTALL", quantity: 1 },
        { sku: "LOW-COPPER-PIPING-COPPER-PIPING-5-8-IN", quantity: 12 },
        { sku: "LOW-INSULATION-13-MM-NITRILE-INSUL", quantity: 12 },
        { sku: "LOW-DRAINAGE-32-MM-DRAINAGE-PIPE", quantity: 6 }
      ]
    },
    {
      name: "Basic Split AC Installation Package",
      description: "Essential installation work for split AC units (excluding machine)",
      itemsCount: 4,
      items: [
        { sku: "LOW-INSTALLATION-SPLIT-AC-INSTALL", quantity: 1 },
        { sku: "LOW-COPPER-PIPING-COPPER-PIPING-3-8-IN", quantity: 5 },
        { sku: "LOW-INSULATION-9-MM-NITRILE-INSULA", quantity: 5 },
        { sku: "LOW-DRAINAGE-20-MM-DRAINAGE-PIPE", quantity: 5 }
      ]
    }
  ];

  // Custom One-Click Kits states
  const [customKits, setCustomKits] = useState<{ name: string; description: string; itemsCount: number; items: any[] }[]>(() => {
    try {
      const stored = localStorage.getItem('hvac_custom_kits');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [showSaveKitInline, setShowSaveKitInline] = useState(false);
  const [newKitName, setNewKitName] = useState('');
  const [newKitDescription, setNewKitDescription] = useState('');

  const handleSaveCurrentAsKit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKitName.trim()) {
      alert("Please enter a name for your custom kit.");
      return;
    }
    if (items.length === 0) {
      alert("Cannot save an empty kit. Please add items to your quotation first.");
      return;
    }
    const newKit = {
      name: newKitName.trim(),
      description: newKitDescription.trim() || "User defined custom collection",
      itemsCount: items.length,
      items: items.map(it => ({ ...it }))
    };

    const updated = [newKit, ...customKits];
    setCustomKits(updated);
    localStorage.setItem('hvac_custom_kits', JSON.stringify(updated));
    setNewKitName('');
    setNewKitDescription('');
    setShowSaveKitInline(false);
    alert(`Successfully saved custom kit "${newKit.name}"! You can now use it in ONE-CLICK KITS.`);
  };

  const handleDeleteCustomKit = (idxToDelete: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering kit add
    if (confirm("Are you sure you want to delete this custom kit?")) {
      const updated = customKits.filter((_, idx) => idx !== idxToDelete);
      setCustomKits(updated);
      localStorage.setItem('hvac_custom_kits', JSON.stringify(updated));
    }
  };

  const ONE_CLICK_KITS = useMemo(() => {
    const sysKits = DEFAULT_KITS.map(k => ({ ...k, isCustom: false }));
    const usrKits = customKits.map((k, idx) => ({ ...k, isCustom: true, customIndex: idx }));
    return [...usrKits, ...sysKits];
  }, [customKits]);

  const handleAddKit = (kit: any) => {
    if (kit.items && kit.items[0] && 'sku' in kit.items[0]) {
      // Default kit with SKUs
      kit.items.forEach((kitItem: { sku: string; quantity: number }) => {
        const catItem = hvacCatalog.find(it => it.sku === kitItem.sku);
        if (catItem) {
          addItemToQuotation(catItem, kitItem.quantity);
        }
      });
    } else if (kit.items) {
      // Custom kit with direct items
      setItems(prev => {
        const updated = [...prev];
        kit.items.forEach((kitItem: QuotationLineItem) => {
          const existingIndex = updated.findIndex(p => p.description.toLowerCase() === kitItem.description.toLowerCase());
          if (existingIndex > -1) {
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: updated[existingIndex].quantity + kitItem.quantity,
              total: (updated[existingIndex].quantity + kitItem.quantity) * updated[existingIndex].unit_price
            };
          } else {
            updated.push({
              description: kitItem.description,
              unit: kitItem.unit,
              unit_price: kitItem.unit_price,
              quantity: kitItem.quantity,
              total: kitItem.unit_price * kitItem.quantity
            });
          }
        });
        return updated;
      });
    }
  };

  // Live parsing search bar e.g. "FILT-001 x5"
  const handleSkuSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skuSearch.trim()) return;

    const match = skuSearch.trim().match(/^([A-Za-z0-9_-]+)(?:\s+x\s*(\d+))?$/i);
    if (match) {
      const skuCode = match[1].toUpperCase();
      const qty = match[2] ? parseInt(match[2], 10) : 1;

      const catalogItem = hvacCatalog.find(item => item.sku.toUpperCase() === skuCode);
      if (catalogItem) {
        addItemToQuotation(catalogItem, qty);
        setSkuSearch('');
      } else {
        // Fallback to substring matching
        const substringMatch = hvacCatalog.find(item => item.name.toLowerCase().includes(skuSearch.toLowerCase()) || item.sku.toLowerCase().includes(skuSearch.toLowerCase()));
        if (substringMatch) {
          addItemToQuotation(substringMatch, 1);
          setSkuSearch('');
        } else {
          alert(`Product matching SKU/Name "${skuSearch}" not found.`);
        }
      }
    } else {
      const found = hvacCatalog.find(item => item.name.toLowerCase().includes(skuSearch.toLowerCase()));
      if (found) {
        addItemToQuotation(found, 1);
        setSkuSearch('');
      } else {
        alert(`No product matching "${skuSearch}" was found.`);
      }
    }
  };

  // Mass SKU pasting handler
  const handlePasteSkusSubmit = () => {
    if (!pastedSkusText.trim()) return;
    const parts = pastedSkusText.split(/[\n,]+/);
    let addedCount = 0;
    let missedList: string[] = [];

    parts.forEach(part => {
      const trimmed = part.trim();
      if (!trimmed) return;
      const match = trimmed.match(/^([A-Za-z0-9_-]+)(?:\s+x\s*(\d+))?$/i);
      if (match) {
        const skuCode = match[1].toUpperCase();
        const qty = match[2] ? parseInt(match[2], 10) : 1;
        const catalogItem = hvacCatalog.find(item => item.sku.toUpperCase() === skuCode);
        if (catalogItem) {
          addItemToQuotation(catalogItem, qty);
          addedCount++;
        } else {
          missedList.push(skuCode);
        }
      } else {
        const catalogItem = hvacCatalog.find(item => item.sku.toUpperCase() === trimmed.toUpperCase());
        if (catalogItem) {
          addItemToQuotation(catalogItem, 1);
          addedCount++;
        } else {
          missedList.push(trimmed);
        }
      }
    });

    setPastedSkusText('');
    setShowPasteSkus(false);
    if (missedList.length > 0) {
      alert(`Successfully added ${addedCount} items. The following inputs were skipped or not resolved: ${missedList.join(', ')}`);
    }
  };

  // Clone previous quotation document properties
  const handleCloneQuoteChange = (quoteId: string) => {
    if (!quoteId) return;
    const quoteToClone = quotations.find(q => q.id === quoteId);
    if (quoteToClone) {
      setItems(quoteToClone.items.map(item => ({ ...item })));
      setTaxRate(quoteToClone.tax_rate);
      setDiscountAmount(quoteToClone.discount_amount);
      setShippingAmount(quoteToClone.shipping_amount || 0);
      setTerms(quoteToClone.terms_conditions || '');
      setNotes(quoteToClone.notes || '');
      if (quoteToClone.client_id) {
        setClientId(quoteToClone.client_id);
      }
      alert(`Cloned all lines and settings from quote: ${quoteToClone.quotation_number}`);
    }
    setCloneQuoteId('');
  };

  // Favorite toggle
  const toggleFavorite = async (sku: string) => {
    const item = hvacCatalog.find(it => it.sku === sku);
    if (!item) return;
    const updated = { ...item, isFavorite: !item.isFavorite };
    await onUpdateCatalogItem(updated);
  };

  // Department metadata
  const DEPARTMENTS = [
    { name: 'All', icon: '📋', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    { name: 'Favorites', icon: '⭐', color: 'bg-amber-100 text-amber-850 border-amber-200 font-black' },
    { name: 'Major Components', icon: '🏗️', color: 'bg-blue-100 text-blue-900 border-blue-200' },
    { name: 'LOW SIDE Material & Services', icon: '🛠️', color: 'bg-orange-100 text-orange-900 border-orange-200' }
  ];

  // Category list dynamically computed from current department catalog
  const CATEGORIES = useMemo(() => {
    const cats = new Set<string>();
    hvacCatalog.forEach(item => {
      if (activeDepartment === 'All' || 
          (activeDepartment === 'Favorites' && favorites.includes(item.sku)) ||
          item.department === activeDepartment) {
        if (item.category) {
          cats.add(item.category);
        }
      }
    });
    return ['All', ...Array.from(cats).sort()];
  }, [hvacCatalog, activeDepartment, favorites]);

  // Filtered Catalog calculation
  const filteredCatalog = useMemo(() => {
    return hvacCatalog.filter(item => {
      // Search query filter
      const matchesSearch = catalogSearch === '' || 
        item.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        item.sku.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        item.category.toLowerCase().includes(catalogSearch.toLowerCase());

      if (!matchesSearch) return false;

      // Department filter
      if (activeDepartment !== 'All') {
        if (activeDepartment === 'Favorites') {
          if (!favorites.includes(item.sku)) return false;
        } else if (item.department !== activeDepartment) {
          return false;
        }
      }

      // Category filter
      if (activeCategory !== 'All' && item.category !== activeCategory) {
        return false;
      }

      return true;
    });
  }, [catalogSearch, activeDepartment, activeCategory, favorites, hvacCatalog]);

  // Client search filter list
  const filteredClients = useMemo(() => {
    if (!customerSearch) return clients;
    return clients.filter(c => c.client_name.toLowerCase().includes(customerSearch.toLowerCase()));
  }, [customerSearch, clients]);

  // Line item manual changes
  const handleItemFieldChange = (index: number, field: keyof QuotationLineItem, value: any) => {
    const updatedItems = [...items];
    const item = { ...updatedItems[index] };

    if (field === 'description') {
      item.description = value;
    } else if (field === 'unit') {
      item.unit = value;
    } else {
      const numVal = Math.max(0, Number(value) || 0);
      if (field === 'quantity') {
        item.quantity = numVal;
      } else if (field === 'unit_price') {
        item.unit_price = numVal;
      }
    }
    item.total = item.quantity * item.unit_price;
    updatedItems[index] = item;
    setItems(updatedItems);
  };

  const handleAddItemRow = () => {
    setItems([...items, { description: '', unit: 'piece', unit_price: 0, quantity: 1, total: 0 }]);
  };

  const handleRemoveItemRow = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  // Reset form completely (New Quote action)
  const handleResetForm = () => {
    if (window.confirm("Are you sure you want to reset this composer and start a new quote draft?")) {
      setItems([]);
      setClientId('');
      setProjectId('');
      setCustomerSearch('');
      setQuotationNumber(`QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
      setQuotationDate(new Date().toISOString().split('T')[0]);
      setValidUntil(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setTaxRate(18);
      setDiscountAmount(0);
      setShippingAmount(0);
      setNotes('');
      if (isInline) {
        onClose();
      }
    }
  };

  // Math Computations
  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.total, 0);
  }, [items]);

  const taxAmount = useMemo(() => {
    return Math.round(subtotal * (taxRate / 100));
  }, [subtotal, taxRate]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal + taxAmount - discountAmount + shippingAmount);
  }, [subtotal, taxAmount, discountAmount, shippingAmount]);

  // Handle Submit document
  const saveQuotationDocument = async (customStatus?: Quotation['status']) => {
    if (!clientId) {
      alert("Please select a customer first.");
      customerSearchRef.current?.focus();
      setShowCustomerDropdown(true);
      return;
    }
    if (items.length === 0) {
      alert("Quotation ledger cannot be empty. Add at least one item.");
      return;
    }
    setIsSubmitting(true);

    const clientObj = clients.find(c => c.id === clientId);
    const projObj = projects.find(p => p.id === projectId);

    const packedQuotation: Quotation = {
      id: initialData?.id || `qt_${Date.now()}`,
      quotation_number: quotationNumber,
      client_id: clientId,
      client_name: clientObj ? clientObj.client_name : '',
      project_id: projectId || undefined,
      project_name: projObj ? projObj.name : undefined,
      quotation_date: quotationDate,
      valid_until: validUntil,
      status: customStatus || status,
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      discount_amount: discountAmount,
      shipping_amount: shippingAmount,
      grand_total: grandTotal,
      terms_conditions: terms,
      notes,
      items
    };

    try {
      if (mode === 'create') {
        await onAdd(packedQuotation);
      } else {
        await onUpdate(packedQuotation);
      }
      if (!isInline) {
        onClose();
      }
    } catch (_) {
      alert("Failed to submit quotation. Trace server log stream.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerPreviewPdf = () => {
    // Generate mock object for previewing
    const clientObj = clients.find(c => c.id === clientId);
    const mockQuote: Quotation = {
      id: initialData?.id || 'preview',
      quotation_number: quotationNumber,
      client_id: clientId,
      client_name: clientObj ? clientObj.client_name : (customerSearch || 'Valued Customer'),
      quotation_date: quotationDate,
      valid_until: validUntil,
      status,
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      discount_amount: discountAmount,
      shipping_amount: shippingAmount,
      grand_total: grandTotal,
      terms_conditions: terms,
      notes,
      items
    };
    setComposerPreviewQuote(mockQuote);
  };

  const renderFormContent = () => (
    <div className={`bg-[#f8fafc] rounded-3xl border border-slate-200 w-full overflow-hidden flex flex-col relative font-sans ${isInline ? 'h-[85vh] shadow-xs' : 'max-w-[95%] h-[92vh] shadow-2xl'}`}>
        
        {/* --- HEADER --- */}
        {!isInline && (
          <div className="bg-white p-4 px-6 border-b border-slate-150 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <FileCode className="w-5 h-5" />
                </span>
                <div>
                  <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    SCP Quotation Composer
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full border border-emerald-200 font-bold tracking-normal font-mono">
                      LIVE COMPOSER
                    </span>
                  </h1>
                  <p className="text-[11px] text-slate-500 font-medium">Minimum-click quote composer</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-start">
              <button
                onClick={handleResetForm}
                className="text-xs font-black p-2 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer transition-colors"
              >
                🔄 New Quote
              </button>
            </div>
          </div>
        )}

        {/* --- MAIN COMPOSER WORKSPACE --- */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">

          {/* --- TWO-COLUMN WORKSPACE: CONFIG & CATALOG vs LEDGER --- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1.5">
            
            {/* LEFT COLUMN: SETTINGS, SELECTABLE OPTIONS & PRODUCT CATALOG */}
            <div className="lg:col-span-6 h-[830px] overflow-y-auto space-y-4 pr-1.5 scrollbar-thin">

              {/* --- CARD 1: QUOTE SETTINGS & METADATA --- */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex justify-between items-center select-none border-b border-slate-100 pb-2.5">
                  <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest font-mono">
                    ⚙️ QUOTE SETTINGS
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono font-bold bg-slate-150 px-2 py-0.5 rounded-md">
                    Required
                  </span>
                </div>

                {/* Customer Search Link */}
                <div className="space-y-1 relative">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Customer</label>
                  <div className="flex items-center border border-slate-250 rounded-xl overflow-hidden p-1 px-3 focus-within:border-indigo-400 bg-slate-50/30">
                    <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                    <input
                      ref={customerSearchRef}
                      type="text"
                      placeholder="Click to see customers or type to search..."
                      className="w-full text-xs font-bold p-1.5 outline-none bg-transparent"
                      value={customerSearch}
                      onFocus={() => setShowCustomerDropdown(true)}
                      onChange={(e) => {
                        setCustomerSearch(e.target.value);
                        setShowCustomerDropdown(true);
                      }}
                    />
                    {customerSearch && (
                      <button 
                        onClick={() => {
                          setClientId('');
                          setCustomerSearch('');
                        }}
                        className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-full"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Client pick list dropdown */}
                  {showCustomerDropdown && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto divide-y divide-slate-100 p-1">
                      {filteredClients.length > 0 ? (
                        filteredClients.map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setClientId(c.id);
                              setCustomerSearch(c.client_name);
                              setShowCustomerDropdown(false);
                            }}
                            className="w-full text-left p-2.5 hover:bg-indigo-50/65 rounded-lg text-xs flex justify-between items-center transition-colors"
                          >
                            <div>
                              <p className="font-extrabold text-slate-900">{c.client_name}</p>
                              <p className="text-[10px] text-slate-500 font-mono mt-0.5">{c.contact_email} • {c.client_type}</p>
                            </div>
                            <span className="text-[10px] bg-slate-100 text-slate-600 p-0.5 px-2 rounded-full font-bold">Link</span>
                          </button>
                        ))
                      ) : (
                        <div className="p-3 text-center text-xs text-slate-400 italic">No corporate clients found.</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Clone / Import Dropdown */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Clone / Import Template</label>
                  <div className="flex items-center border border-slate-250 bg-slate-50/30 rounded-xl overflow-hidden p-1 px-3">
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-500 mr-2 shrink-0" />
                    <select
                      value={cloneQuoteId}
                      onChange={(e) => handleCloneQuoteChange(e.target.value)}
                      className="w-full text-xs font-bold bg-transparent outline-none cursor-pointer text-slate-755"
                    >
                      <option value="">Clone quote ... (Load from history)</option>
                      {quotations.map(q => (
                        <option key={q.id} value={q.id}>
                          {q.quotation_number} - {q.client_name} ({formatRupees(q.grand_total)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date valid metadata row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Reference Number */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Quote #</label>
                    <input
                      type="text"
                      required
                      className="w-full text-xs font-bold border border-slate-250 p-2 rounded-xl font-mono focus:ring-1 focus:ring-indigo-500 outline-none bg-slate-50/30"
                      value={quotationNumber}
                      onChange={(e) => setQuotationNumber(e.target.value)}
                    />
                  </div>

                  {/* Quotation Date */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Date</label>
                    <input
                      type="date"
                      required
                      className="w-full text-xs font-bold border border-slate-250 p-2 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none bg-slate-50/30"
                      value={quotationDate}
                      onChange={(e) => setQuotationDate(e.target.value)}
                    />
                  </div>

                  {/* Valid Until */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Valid Until</label>
                    <input
                      type="date"
                      required
                      className="w-full text-xs font-bold border border-slate-250 p-2 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none bg-slate-50/30"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                    />
                  </div>
                </div>

                {/* Paste SKUs utility */}
                <div className="pt-1.5">
                  <button
                    type="button"
                    onClick={() => setShowPasteSkus(true)}
                    className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-extrabold text-[10.5px] p-2 rounded-xl shrink-0 cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    📋 Paste Multiple SKUs
                  </button>
                </div>
              </div>

              {/* --- ONE-CLICK KITS --- */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsKitsExpanded(!isKitsExpanded)}
                  className="w-full flex justify-between items-center p-4 select-none hover:bg-slate-50 transition-colors"
                >
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono flex items-center gap-1.5">
                    {isKitsExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                    📦 ONE-CLICK KITS
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono font-bold bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {ONE_CLICK_KITS.length} kits
                  </span>
                </button>
                
                {isKitsExpanded && (
                  <div className="p-4 pt-0 border-t border-slate-50 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      {ONE_CLICK_KITS.map((kit, index) => (
                        <div
                          key={index}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleAddKit(kit)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleAddKit(kit);
                            }
                          }}
                          className={`bg-white hover:bg-indigo-50/35 border p-3 rounded-xl shadow-xs text-left transition-all hover:shadow-sm cursor-pointer flex gap-2.5 select-none relative group/kit ${
                            kit.isCustom ? 'border-amber-200 bg-amber-50/10 hover:border-amber-300' : 'border-slate-200/90'
                          }`}
                        >
                          <div className={`p-2 rounded-lg h-8 w-8 flex items-center justify-center shrink-0 ${
                            kit.isCustom ? 'bg-amber-50 text-amber-750 font-extrabold' : 'bg-indigo-50 text-indigo-750'
                          }`}>
                            {kit.isCustom ? '⭐' : '📦'}
                          </div>
                          <div className="flex-1 pr-4 min-w-0">
                            <h4 className="text-[11px] font-black text-slate-950 truncate">{kit.name}</h4>
                            <p className="text-[10px] text-slate-500 font-semibold leading-normal line-clamp-1 mt-0.5">{kit.description}</p>
                            <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded-md mt-1 inline-block ${
                              kit.isCustom ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                            }`}>
                              {kit.isCustom ? 'Custom' : 'System'} • {kit.itemsCount} items
                            </span>
                          </div>
                          {kit.isCustom && (
                            <button
                              type="button"
                              onClick={(e) => handleDeleteCustomKit(kit.customIndex, e)}
                              title="Delete Custom Kit"
                              className="absolute top-2 right-2 p-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition-all opacity-0 group-hover/kit:opacity-100 text-[10px]"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* --- QUICK ADD GRID --- */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsQuickAddExpanded(!isQuickAddExpanded)}
                  className="w-full flex justify-between items-center p-4 select-none hover:bg-slate-50 transition-colors"
                >
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono flex items-center gap-1.5">
                    {isQuickAddExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                    ⭐ QUICK ADD
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono font-bold bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {quickAddItems.length} items
                  </span>
                </button>
                
                {isQuickAddExpanded && (
                  <div className="p-4 pt-0 border-t border-slate-50">
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {quickAddItems.map(item => (
                        <button
                          key={item.sku}
                          onClick={() => addItemToQuotation(item, 1)}
                          title={item.description}
                          className="bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-[10px] font-extrabold p-1 px-2.5 rounded-lg flex items-center gap-1 transition-all text-slate-700 hover:text-indigo-900 cursor-pointer select-none"
                        >
                          <span className="text-amber-500">★</span>
                          <span className="font-mono text-slate-450 text-[9px] font-bold">{item.sku}</span>
                          <span>{item.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* --- RECENTLY ADDED GRID --- */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsRecentlyAddedExpanded(!isRecentlyAddedExpanded)}
                  className="w-full flex justify-between items-center p-4 select-none hover:bg-slate-50 transition-colors"
                >
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono flex items-center gap-1.5">
                    {isRecentlyAddedExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                    🕒 RECENTLY ADDED
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono font-bold bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {recentlyAddedItems.length} items
                  </span>
                </button>
                
                {isRecentlyAddedExpanded && (
                  <div className="p-4 pt-0 border-t border-slate-50">
                    {recentlyAddedItems.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {recentlyAddedItems.map((item, idx) => (
                          <button
                            key={`${item.sku}-${idx}`}
                            onClick={() => addItemToQuotation(item, 1)}
                            title={item.description}
                            className="bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-[10px] font-extrabold p-1 px-2.5 rounded-lg flex items-center gap-1 transition-all text-slate-700 hover:text-emerald-900 cursor-pointer select-none"
                          >
                            <span className="font-mono text-slate-450 text-[9px] font-bold">{item.sku}</span>
                            <span>{item.name}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 mt-3 italic text-center">No recently added items yet.</p>
                    )}
                  </div>
                )}
              </div>

              {/* --- PRODUCT CATALOG --- */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col overflow-hidden shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCatalogExpanded(!isCatalogExpanded)}
                  className="w-full flex justify-between items-center p-4 select-none hover:bg-slate-50 transition-colors"
                >
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono flex items-center gap-1.5">
                    {isCatalogExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                    📖 PRODUCT CATALOG
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold bg-indigo-50 text-indigo-750 px-2.5 py-0.5 rounded-full">
                    Catalog Browser
                  </span>
                </button>

                {isCatalogExpanded && (
                  <div className="flex flex-col h-[520px] border-t border-slate-100">
                    {/* Header search */}
                    <div className="p-4 border-b border-slate-100 space-y-3 shrink-0">
                      <div className="flex justify-between items-center select-none">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Product Catalog</h3>
                        <span className="text-[10px] text-slate-400 font-bold">Pick department → click to add</span>
                      </div>
                      <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden p-1 px-2.5 bg-slate-50/50">
                        <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
                        <input
                          ref={catalogSearchRef}
                          type="text"
                          placeholder="Filter catalog... (Press / to focus)"
                          className="w-full text-xs font-medium p-1 outline-none bg-transparent"
                          value={catalogSearch}
                          onChange={(e) => setCatalogSearch(e.target.value)}
                        />
                        {catalogSearch && (
                          <button onClick={() => setCatalogSearch('')} className="p-1 hover:bg-slate-200 rounded-full">
                            <X className="w-3 h-3 text-slate-400" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Department pills scrollable */}
                    <div className="px-4 py-2 border-b border-slate-100 shrink-0">
                      <div className="flex flex-wrap gap-1.5 select-none">
                        {DEPARTMENTS.map(dept => (
                          <button
                            key={dept.name}
                            type="button"
                            onClick={() => {
                              setActiveDepartment(dept.name);
                              setActiveCategory('All');
                            }}
                            className={`text-[10.5px] font-bold p-1 px-2.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                              activeDepartment === dept.name
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs font-extrabold scale-102'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            <span>{dept.icon}</span>
                            <span>{dept.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Category pills scrollable */}
                    <div className="px-4 py-2 border-b border-slate-100 shrink-0 bg-slate-50/30 select-none">
                      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                        {CATEGORIES.map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setActiveCategory(cat)}
                            className={`text-[10px] font-bold p-1 px-2.5 rounded-full border shrink-0 transition-colors cursor-pointer ${
                              activeCategory === cat
                                ? 'bg-slate-800 text-white border-slate-800'
                                : 'bg-white text-slate-500 hover:text-slate-800 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Scrollable list of products */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/20">
                      {filteredCatalog.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {filteredCatalog.map(item => {
                            const isFav = favorites.includes(item.sku);
                            return (
                              <div 
                                key={item.sku} 
                                className="bg-white border border-slate-200 rounded-2xl p-3.5 hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between group"
                              >
                                <div>
                                  <div className="flex justify-between items-start gap-1 select-none">
                                    <span className="text-[9.5px] font-mono font-bold text-slate-400 bg-slate-100 p-0.5 px-1.5 rounded">
                                      {item.sku}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => toggleFavorite(item.sku)}
                                      className={`p-1 rounded-md transition-colors ${
                                        isFav ? 'text-amber-500 bg-amber-50/50' : 'text-slate-300 hover:text-amber-500 hover:bg-slate-50'
                                      }`}
                                    >
                                      <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-500' : ''}`} />
                                    </button>
                                  </div>

                                  <h4 className="text-xs font-black text-slate-900 mt-2 tracking-tight group-hover:text-indigo-700 transition-colors">
                                    {item.name}
                                  </h4>
                                  <p className="text-[9px] text-slate-400 font-bold mt-0.5">{item.category} • {item.department}</p>
                                  <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed font-medium line-clamp-2">
                                    {item.description}
                                  </p>

                                  {item.series && (
                                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-col gap-1">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setExpandedSku(expandedSku === item.sku ? null : item.sku);
                                        }}
                                        className="text-[9px] font-black text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-wider flex items-center gap-1 select-none py-1 align-middle"
                                      >
                                        <span>{expandedSku === item.sku ? '▼ Hide Specs' : '▶ Show Specs'}</span>
                                      </button>
                                      
                                      {expandedSku === item.sku && (
                                        <div className="bg-slate-50 p-2 rounded-xl text-[9.5px] space-y-1.5 font-mono border border-slate-200/60 mt-1 select-all">
                                          <div className="grid grid-cols-1 gap-y-1">
                                            <div className="flex justify-between border-b border-slate-150/40 pb-0.5">
                                              <span className="text-slate-400 font-sans">Series:</span>
                                              <span className="text-slate-800 font-extrabold">{item.series}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-150/40 pb-0.5">
                                              <span className="text-slate-400 font-sans">Type:</span>
                                              <span className="text-slate-800 font-extrabold text-right truncate max-w-[120px]">{item.type}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-150/40 pb-0.5">
                                              <span className="text-slate-400 font-sans">Technology:</span>
                                              <span className="text-slate-800 font-extrabold">{item.technology}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-150/40 pb-0.5">
                                              <span className="text-slate-400 font-sans">Mode:</span>
                                              <span className="text-slate-800 font-extrabold">{item.mode}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-150/40 pb-0.5">
                                              <span className="text-slate-400 font-sans">Star Rating:</span>
                                              <span className="text-slate-800 font-extrabold">{item.starRating}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-150/40 pb-0.5">
                                              <span className="text-slate-400 font-sans">Refrigerant:</span>
                                              <span className="text-slate-800 font-extrabold">{item.refrigerant || 'NA'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-150/40 pb-0.5">
                                              <span className="text-slate-400 font-sans">Power Supply:</span>
                                              <span className="text-slate-800 font-extrabold text-right truncate max-w-[100px]">{item.powerSupply}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-150/40 pb-0.5">
                                              <span className="text-slate-400 font-sans">Cooling TR:</span>
                                              <span className="text-slate-800 font-extrabold">{item.coolingTr}</span>
                                            </div>
                                            {item.heatingTr && (
                                              <div className="flex justify-between border-b border-slate-150/40 pb-0.5">
                                                <span className="text-slate-400 font-sans">Heating TR:</span>
                                                <span className="text-slate-800 font-extrabold">{item.heatingTr}</span>
                                              </div>
                                            )}
                                            <div className="flex justify-between border-b border-slate-150/40 pb-0.5">
                                              <span className="text-slate-400 font-sans">FCU (Indoor):</span>
                                              <span className="text-indigo-950 font-extrabold select-all">{item.fcu}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-150/40 pb-0.5">
                                              <span className="text-slate-400 font-sans">CU (Outdoor):</span>
                                              <span className="text-indigo-950 font-extrabold select-all">{item.cu}</span>
                                            </div>
                                          </div>
                                          <div className="pt-1 border-t border-slate-200 space-y-1 bg-white p-1.5 rounded-lg border border-slate-150 shadow-3xs">
                                            <div className="flex justify-between">
                                              <span className="text-slate-500 font-sans font-medium">MRP Set Base:</span>
                                              <span className="text-slate-800 font-bold">₹{Number(item.mrpSetBase).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-slate-500 font-sans font-medium">DBP w/o Tax:</span>
                                              <span className="text-slate-800 font-bold">₹{Number(item.dbpWithoutTax).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-slate-500 font-sans font-medium">Discount:</span>
                                              <span className="text-emerald-600 font-bold">{item.discount}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-slate-500 font-sans font-medium">Unit Price w/o Tax:</span>
                                              <span className="text-slate-900 font-extrabold">₹{Number(item.unitPriceWoTax).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between bg-indigo-50/50 p-1 rounded text-indigo-900 font-black mt-1">
                                              <span className="font-sans font-medium text-[9px] text-indigo-700">NLC-GST Paid:</span>
                                              <span>₹{Number(item.nlcGstPaid).toLocaleString()}</span>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>

                                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center select-none">
                                  <span className="text-xs font-extrabold text-slate-950 font-mono">
                                    {formatRupees(item.price)}
                                    <span className="text-[10px] text-slate-400 font-medium font-sans"> / {item.unit}</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => addItemToQuotation(item, 1)}
                                    className="bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white text-[10.5px] font-black p-1 px-3 rounded-lg border border-indigo-150 hover:border-indigo-600 transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                                  >
                                    + Add
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center select-none">
                          <span className="text-2xl mb-2">🔍</span>
                          <p className="text-xs font-bold font-sans">No matching catalog items found.</p>
                          <p className="text-[10px] text-slate-400 mt-1">Try resetting the department/category filter.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT COLUMN: WORKSPACE BILLING / LEDGER EDITOR */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col h-[830px]">
              
              {/* Header title */}
              <div className="p-4 border-b border-slate-100 flex justify-between items-center select-none shrink-0">
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Quote Document Items</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Add notes or edit parameters directly inside ledger cells</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowSaveKitInline(!showSaveKitInline)}
                    className={`text-[10.5px] font-extrabold p-1.5 px-3 rounded-lg flex items-center gap-1 transition-all cursor-pointer border ${
                      showSaveKitInline
                        ? 'bg-slate-800 text-white border-slate-800 hover:bg-slate-900'
                        : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                    }`}
                  >
                    💾 Save as Kit
                  </button>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10.5px] font-extrabold p-1.5 px-3 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                  >
                    + Custom Row
                  </button>
                </div>
              </div>

              {/* Inline Custom Kit Creator Form */}
              {showSaveKitInline && (
                <form onSubmit={handleSaveCurrentAsKit} className="bg-amber-50/40 p-4 border-b border-amber-100 space-y-3 shrink-0 animate-fadeIn">
                  <div className="flex justify-between items-center select-none">
                    <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                      ⭐ CREATE CUSTOM ONE-CLICK KIT
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSaveKitInline(false)}
                      className="text-[10px] text-slate-400 hover:text-slate-600 font-bold"
                    >
                      ✕ Close
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    This will save all {items.length} current quotation item lines (including quantities, customized descriptions, and custom-entered rows) as a reusable kit.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-black text-slate-500 uppercase tracking-wide block">Kit Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Daikin Cassette Premium Lowside"
                        value={newKitName}
                        onChange={(e) => setNewKitName(e.target.value)}
                        className="w-full p-2 text-xs border border-slate-200 focus:border-amber-450 rounded-lg outline-none font-semibold text-slate-800 bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-black text-slate-500 uppercase tracking-wide block">Kit Description</label>
                      <input
                        type="text"
                        placeholder="e.g., Standard installation pipes, valves, wiring"
                        value={newKitDescription}
                        onChange={(e) => setNewKitDescription(e.target.value)}
                        className="w-full p-2 text-xs border border-slate-200 focus:border-amber-450 rounded-lg outline-none font-semibold text-slate-800 bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowSaveKitInline(false);
                        setNewKitName('');
                        setNewKitDescription('');
                      }}
                      className="p-1.5 px-3 bg-white hover:bg-slate-150 text-[10px] text-slate-650 font-bold rounded-lg border border-slate-200 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="p-1.5 px-4 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black rounded-lg transition-colors cursor-pointer shadow-xs border border-amber-600"
                    >
                      Save Kit
                    </button>
                  </div>
                </form>
              )}

              {/* Ledger workspace scrollable */}
              <div className="flex-1 overflow-y-auto p-4 bg-slate-50/15">
                {items.length > 0 ? (
                  <div className="border border-slate-150 rounded-2xl bg-white overflow-hidden shadow-xs">
                    <table className="w-full text-left font-sans text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-550 border-b border-slate-150 text-[9.5px] font-black text-slate-450 uppercase font-mono select-none">
                          <th className="p-3 pl-4">Item Description</th>
                          <th className="p-3 w-16">Unit</th>
                          <th className="p-3 w-24">Price (₹)</th>
                          <th className="p-3 w-16 text-center">Qty</th>
                          <th className="p-3 w-24 text-right">Net Total</th>
                          <th className="p-3 w-10 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {items.map((item, index) => (
                          <tr key={index} className="hover:bg-slate-50/40">
                            <td className="p-2 pl-3">
                              <input
                                type="text"
                                required
                                value={item.description}
                                onChange={(e) => handleItemFieldChange(index, 'description', e.target.value)}
                                className="w-full p-2 text-xs border border-transparent hover:border-slate-200 focus:border-indigo-400 rounded-lg outline-none font-bold text-slate-900 transition-colors"
                                placeholder="Enter item detail..."
                              />
                            </td>
                            <td className="p-2">
                              <select
                                value={item.unit}
                                onChange={(e) => handleItemFieldChange(index, 'unit', e.target.value)}
                                className="w-full p-1.5 text-xs border border-transparent hover:border-slate-200 rounded-lg bg-transparent outline-none cursor-pointer"
                              >
                                <option value="set">set</option>
                                <option value="piece">piece</option>
                                <option value="meter">meter</option>
                                <option value="hours">hours</option>
                                <option value="lot">lot</option>
                                <option value="kg">kg</option>
                              </select>
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                required
                                min="0"
                                value={item.unit_price}
                                onChange={(e) => handleItemFieldChange(index, 'unit_price', e.target.value)}
                                className="w-full p-1.5 text-xs border border-transparent hover:border-slate-200 text-slate-700 rounded-lg outline-none text-right font-mono font-bold"
                              />
                            </td>
                            <td className="p-2">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleItemFieldChange(index, 'quantity', Math.max(1, item.quantity - 1))}
                                  className="w-5 h-5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded flex items-center justify-center font-bold"
                                >
                                  -
                                </button>
                                <span className="font-mono font-extrabold text-xs w-6 text-center select-none">{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => handleItemFieldChange(index, 'quantity', item.quantity + 1)}
                                  className="w-5 h-5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded flex items-center justify-center font-bold"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="p-2 text-right font-extrabold text-slate-950 font-mono pr-4 select-none">
                              {formatRupees(item.total)}
                            </td>
                            <td className="p-2 text-center shrink-0">
                              <button
                                type="button"
                                onClick={() => handleRemoveItemRow(index)}
                                className="p-1 hover:bg-rose-50 text-slate-350 hover:text-rose-650 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center select-none">
                    <span className="text-3xl mb-2">📑</span>
                    <p className="text-xs font-bold font-sans">No line items yet.</p>
                    <p className="text-[10px] text-slate-400 mt-1">Search a product or click a favorite item to load into this ledger.</p>
                  </div>
                )}
              </div>

              {/* Lower Section Notes & Financial Box */}
              <div className="p-4 border-t border-slate-100 bg-[#fbfcfd] grid grid-cols-1 sm:grid-cols-12 gap-4.5 shrink-0">
                
                {/* Internal notes */}
                <div className="sm:col-span-6 flex flex-col justify-between">
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider font-mono">Remarks / Client Notes</label>
                    <textarea
                      rows={4}
                      className="w-full text-xs text-slate-700 border border-slate-250 p-2 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none bg-white font-medium"
                      placeholder="Add notes..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5 mt-2 select-none">
                    <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider font-mono">Related Project Link</label>
                    <select
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      className="w-full text-[10.5px] font-semibold border border-slate-200 p-1.5 px-2.5 rounded-lg bg-white focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer"
                    >
                      <option value="">-- Optional Project Link --</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.job_type})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Totals panel */}
                <div className="sm:col-span-6 bg-[#f1f5f9]/70 rounded-2xl p-4 border border-slate-150 space-y-2 text-xs">
                  
                  {/* Subtotal */}
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="font-semibold">Subtotal:</span>
                    <span className="font-mono font-bold text-slate-800">{formatRupees(subtotal)}</span>
                  </div>

                  {/* Discount input */}
                  <div className="flex justify-between items-center text-slate-500 gap-2">
                    <span className="font-semibold">Discount:</span>
                    <div className="flex items-center gap-1 font-mono text-slate-700">
                      <span>- ₹</span>
                      <input
                        type="number"
                        min="0"
                        className="w-20 text-right text-xs p-0.5 px-1 border border-slate-250 rounded bg-white font-bold"
                        value={discountAmount}
                        onChange={(e) => setDiscountAmount(Math.max(0, parseInt(e.target.value) || 0))}
                      />
                    </div>
                  </div>

                  {/* Tax percentage input */}
                  <div className="flex justify-between items-center text-slate-500 gap-2">
                    <span className="font-semibold flex items-center gap-1">
                      Tax GST %:
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="w-10 text-center text-xs p-0.5 border border-slate-250 rounded bg-white font-bold"
                        value={taxRate}
                        onChange={(e) => setTaxRate(Math.max(0, parseInt(e.target.value) || 0))}
                      />
                    </span>
                    <span className="font-mono font-bold text-slate-700">{formatRupees(taxAmount)}</span>
                  </div>

                  {/* Shipping amount input */}
                  <div className="flex justify-between items-center text-slate-500 gap-2">
                    <span className="font-semibold">Shipping:</span>
                    <div className="flex items-center gap-1 font-mono text-slate-700">
                      <span>₹</span>
                      <input
                        type="number"
                        min="0"
                        className="w-20 text-right text-xs p-0.5 px-1 border border-slate-250 rounded bg-white font-bold"
                        value={shippingAmount}
                        onChange={(e) => setShippingAmount(Math.max(0, parseInt(e.target.value) || 0))}
                      />
                    </div>
                  </div>

                  {/* Grand total */}
                  <div className="flex justify-between items-center border-t border-slate-250 pt-2.5 mt-1.5">
                    <span className="font-black text-slate-900">Grand Total:</span>
                    <span className="text-sm font-black font-mono text-indigo-700">{formatRupees(grandTotal)}</span>
                  </div>

                </div>

              </div>

              {/* Actions Footer inside right column */}
              <div className="bg-slate-50 border-t border-slate-150 p-4 px-6 flex justify-end items-center gap-2 rounded-b-3xl shrink-0 select-none">
                <button
                  type="button"
                  onClick={() => saveQuotationDocument('Draft')}
                  disabled={isSubmitting}
                  className="p-2.5 px-5 text-xs font-black text-slate-700 border border-slate-200 hover:border-slate-300 rounded-xl bg-white hover:bg-slate-50 cursor-pointer transition-colors active:scale-97 shrink-0"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={triggerPreviewPdf}
                  className="p-2.5 px-5 text-xs font-black text-slate-700 border border-slate-200 hover:border-slate-300 rounded-xl bg-white hover:bg-slate-50 cursor-pointer transition-colors active:scale-97 shrink-0"
                >
                  Preview PDF
                </button>
                <button
                  type="button"
                  onClick={() => saveQuotationDocument('Sent')}
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-xs p-2.5 px-6 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 active:scale-97 shrink-0"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Syncing...' : mode === 'create' ? 'Send Quote' : 'Update & Send'}
                </button>
              </div>

            </div>

          </div>

        </div>

        {/* --- DIALOG MODAL: PASTE MULTIPLE SKUS --- */}
        {showPasteSkus && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md shadow-xl overflow-hidden p-5 space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-900">Mass SKU Paste Console</h3>
                <p className="text-[11px] text-slate-500 font-medium">Paste multiple SKUs separated by newlines or commas. Supports counts e.g., "FILT-001 x5".</p>
              </div>
              <textarea
                rows={5}
                className="w-full text-xs font-mono border border-slate-250 p-2.5 rounded-xl outline-none focus:border-indigo-400 bg-slate-50/50"
                placeholder="e.g.&#10;FILT-001 x5&#10;PIPE-002 x10&#10;REMOTE-001"
                value={pastedSkusText}
                onChange={(e) => setPastedSkusText(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowPasteSkus(false);
                    setPastedSkusText('');
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasteSkusSubmit}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-4 py-2 rounded-xl"
                >
                  Parse & Insert
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
  );

  if (isInline) {
    return (
      <>
        {renderFormContent()}
        {composerPreviewQuote && (
          <QuotationPreviewModal
            quote={composerPreviewQuote}
            clients={clients}
            onClose={() => setComposerPreviewQuote(null)}
            formatRupees={formatRupees}
          />
        )}
      </>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in">
      {renderFormContent()}
      {composerPreviewQuote && (
        <QuotationPreviewModal
          quote={composerPreviewQuote}
          clients={clients}
          onClose={() => setComposerPreviewQuote(null)}
          formatRupees={formatRupees}
        />
      )}
    </div>
  );
}

// ==========================================================
// SUB-COMPONENT: PURCHASE ORDER FORM MODAL
// ==========================================================
interface PurchaseOrderFormModalProps {
  mode: 'create' | 'edit';
  initialData?: PurchaseOrder;
  clients: Client[];
  projects: Project[];
  vendors: Vendor[];
  sites: Site[];
  quotations: Quotation[];
  onClose: () => void;
  onAdd: (po: PurchaseOrder) => Promise<void>;
  onUpdate: (po: PurchaseOrder) => Promise<void>;
  formatRupees: (val: number) => string;
}

function PurchaseOrderFormModal({
  mode,
  initialData,
  clients,
  projects,
  vendors = [],
  sites = [],
  quotations = [],
  onClose,
  onAdd,
  onUpdate,
  formatRupees
}: PurchaseOrderFormModalProps) {
  const [poNumber, setPoNumber] = useState(
    initialData?.po_number || `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  
  const [quotationIdRef, setQuotationIdRef] = useState(initialData?.quotation_id || '');
  const [quotationNumberRef, setQuotationNumberRef] = useState(initialData?.quotation_number || '');
  
  // Vendor Info
  const [vendorName, setVendorName] = useState(initialData?.vendor_name || '');
  const [vendorAddress, setVendorAddress] = useState(initialData?.vendor_address || 'Delhi HVAC Supply Warehouse, Okhla Phase III, New Delhi');
  const [vendorGst, setVendorGst] = useState(initialData?.vendor_gst || '07AAAAA1111A1Z1');
  const [vendorContactPerson, setVendorContactPerson] = useState(initialData?.vendor_contact_person || 'MR SIDDHARTH');
  
  // Clients/Projects details (linked)
  const [clientId, setClientId] = useState(initialData?.client_id || '');
  const [projectId, setProjectId] = useState(initialData?.project_id || '');
  const [deliveryAddress, setDeliveryAddress] = useState(initialData?.delivery_address || '8/24 EAST PUNJABI BAGH NEW DELHI 110026');
  
  const [poDate, setPoDate] = useState(initialData?.po_date || new Date().toISOString().split('T')[0]);
  const [deliveryDate, setDeliveryDate] = useState(initialData?.delivery_date || '');
  const [status, setStatus] = useState<PurchaseOrder['status']>(initialData?.status || 'Draft');
  
  const [taxRate, setTaxRate] = useState<number>(initialData?.tax_rate !== undefined ? initialData.tax_rate : 18);
  const [shippingCost, setShippingCost] = useState<number>(initialData?.shipping_handling || 0);
  const [paymentTerms, setPaymentTerms] = useState(initialData?.payment_terms || 'Net 30');
  const [notes, setNotes] = useState(initialData?.notes || 'Further to your confirmation / purchase order,');

  const [items, setItems] = useState<PurchaseOrderLineItem[]>(
    initialData?.items || [
      { description: 'Premium grade insulated copper tubing (1/4" & 1/2" dia, 15m rolls)', unit: 'NOS', quantity: 5, unit_price: 3800, total: 19000 },
      { description: 'R-410A Refrigerant Cylinders (Net weight 10kg canister)', unit: 'NOS', quantity: 3, unit_price: 6500, total: 19500 }
    ]
  );
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);

  const clientSites = useMemo(() => {
    if (!clientId) return sites;
    return sites.filter(s => s.client_id === clientId);
  }, [clientId, sites]);

  const filteredVendors = useMemo(() => {
    if (!vendorName) return vendors;
    const exactMatch = vendors.find(v => (v.name || '').trim().toLowerCase() === vendorName.trim().toLowerCase());
    if (exactMatch) return vendors;
    return vendors.filter(v => (v.name || '').toLowerCase().includes(vendorName.toLowerCase()));
  }, [vendorName, vendors]);

  const handleItemFieldChange = (index: number, field: keyof PurchaseOrderLineItem, value: any) => {
    const updatedItems = [...items];
    const item = { ...updatedItems[index] };

    if (field === 'description') {
      item.description = value;
    } else if (field === 'unit') {
      item.unit = value;
    } else {
      const numVal = Math.max(0, Number(value) || 0);
      if (field === 'quantity') {
        item.quantity = numVal;
      } else if (field === 'unit_price') {
        item.unit_price = numVal;
      }
    }
    // Calculate total on change
    item.total = item.quantity * item.unit_price;
    updatedItems[index] = item;
    setItems(updatedItems);
  };

  const handleAddItemRow = () => {
    setItems([...items, { description: '', unit: 'NOS', quantity: 1, unit_price: 0, total: 0 }]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.total, 0);
  }, [items]);

  const taxAmount = useMemo(() => {
    return Math.round(subtotal * (taxRate / 100));
  }, [subtotal, taxRate]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal + taxAmount + shippingCost);
  }, [subtotal, taxAmount, shippingCost]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName) {
      alert("Please provide the Vendor/Supplier Name.");
      return;
    }
    setIsSubmitting(true);

    const clientObj = clients.find(c => c.id === clientId);
    const projObj = projects.find(p => p.id === projectId);

    const packedPo: PurchaseOrder = {
      id: initialData?.id || `po_${Date.now()}`,
      po_number: poNumber,
      vendor_name: vendorName,
      vendor_address: vendorAddress,
      vendor_gst: vendorGst,
      client_id: clientId || undefined,
      client_name: clientObj ? clientObj.client_name : undefined,
      project_id: projectId || undefined,
      project_name: projObj ? projObj.name : undefined,
      po_date: poDate,
      delivery_date: deliveryDate,
      status,
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      shipping_handling: shippingCost,
      grand_total: grandTotal,
      payment_terms: paymentTerms,
      notes,
      items,
      delivery_address: deliveryAddress,
      vendor_contact_person: vendorContactPerson,
      quotation_id: quotationIdRef || undefined,
      quotation_number: quotationNumberRef || undefined
    };

    try {
      if (mode === 'create') {
        await onAdd(packedPo);
      } else {
        await onUpdate(packedPo);
      }
      onClose();
    } catch (_) {
      alert("Failed to submit purchase order. Trace server logs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-4xl shadow-2xl overflow-hidden mt-10 mb-10 flex flex-col max-h-[90vh]">
        
        {/* Header decoration */}
        <div className="p-5 bg-slate-50 border-b border-slate-150 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              <Receipt className="w-5 h-5 text-indigo-600" />
              {mode === 'create' ? 'Issue New Commercial Purchase Order' : `Modify Purchase Order: ${poNumber}`}
            </h3>
            <p className="text-[11px] text-slate-500 font-sans font-medium mt-0.5">
              Set details for supplier materials, linked job sights, freight values, and save to Neon Postgres live tables.
            </p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1 px-3 bg-slate-150 hover:bg-slate-200 text-xs font-black rounded-lg cursor-pointer text-slate-800 transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Modal Form body scrollable */}
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {mode === 'create' && (
            <div className="bg-indigo-50/75 border border-indigo-150 p-4 rounded-2xl space-y-2">
              <label className="text-[10px] font-black text-indigo-950 uppercase font-mono tracking-wider flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                Refer to Quotes Section (Import Selectable Listing)
              </label>
              <p className="text-[10.5px] text-slate-500 font-sans font-medium">
                Choose an existing quotation from the Quotes section below to instantly pre-populate vendor, client, project, line items, and delivery address details directly.
              </p>
              <select
                onChange={(e) => {
                  const qId = e.target.value;
                  const q = quotations.find(item => item.id === qId);
                  if (q) {
                    setClientId(q.client_id || '');
                    setProjectId(q.project_id || '');
                    
                    const mappedItems = q.items.map(item => ({
                      description: item.description,
                      unit: item.unit || 'NOS',
                      quantity: item.quantity,
                      unit_price: item.unit_price,
                      total: item.total
                    }));
                    setItems(mappedItems);
                    
                    setTaxRate(q.tax_rate !== undefined ? q.tax_rate : 18);
                    setShippingCost(q.shipping_amount || 0);
                    setDeliveryDate(q.valid_until || '');
                    
                    const defaultVendor = (vendors || []).find(v => (v.name || '').toLowerCase().includes('voltas')) || (vendors || [])[0];
                    if (defaultVendor) {
                      setVendorName(defaultVendor.name);
                      setVendorAddress(defaultVendor.address || '');
                      setVendorGst(defaultVendor.gst || '');
                      setVendorContactPerson(defaultVendor.contact_person || '');
                    }
                    
                    const clientSites = (sites || []).filter(s => s.client_id === q.client_id);
                    const defaultSite = clientSites[0];
                    if (defaultSite) {
                      setDeliveryAddress(`${defaultSite.site_name} - ${defaultSite.address}`);
                    } else {
                      setDeliveryAddress('8/24 EAST PUNJABI BAGH NEW DELHI 110026');
                    }
                    
                    setNotes(`Purchase order created from Quotation ${q.quotation_number}.`);
                    setQuotationIdRef(q.id);
                    setQuotationNumberRef(q.quotation_number);
                  } else {
                    setQuotationIdRef('');
                    setQuotationNumberRef('');
                  }
                }}
                className="w-full text-xs font-bold border border-indigo-200 p-2.5 rounded-xl bg-white focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer"
              >
                <option value="">-- Click to choose from Quotes Section --</option>
                {quotations.map(q => (
                  <option key={q.id} value={q.id}>
                    {q.quotation_number} - {q.client_name} - {q.project_name} ({formatRupees(q.grand_total)}) [{q.status}]
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
            {/* Col 1 */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase font-mono tracking-wider">Purchase Order No.*</label>
              <input
                type="text"
                required
                className="w-full text-xs font-bold border border-slate-250 p-2.5 rounded-xl font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
              />
            </div>

            {/* Col 2 */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase font-mono tracking-wider">PO Date*</label>
              <input
                type="date"
                required
                className="w-full text-xs font-semibold border border-slate-250 p-2.5 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none"
                value={poDate}
                onChange={(e) => setPoDate(e.target.value)}
              />
            </div>

            {/* Col 3 */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase font-mono tracking-wider">Expected Delivery Date</label>
              <input
                type="date"
                className="w-full text-xs font-semibold border border-slate-250 p-2.5 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
              />
            </div>
          </div>

          {/* VENDOR INFORMATION ROW */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
            <h4 className="text-[10.5px] font-black text-indigo-950 uppercase tracking-wide">Supplier / Material Vendor Metadata</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4.5">
              <div className="space-y-1.5 relative" id="vendor-picker-container">
                <label className="text-[10px] font-bold text-slate-500 uppercase font-sans">Vendor Business Name*</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Voltas Distributing Inc"
                    className="w-full text-xs font-semibold border border-slate-250 p-2.5 pr-8 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
                    value={vendorName}
                    onChange={(e) => {
                      setVendorName(e.target.value);
                      setShowVendorDropdown(true);
                    }}
                    onFocus={() => setShowVendorDropdown(true)}
                    onBlur={() => {
                      // Hide dropdown shortly after focus loss so other events can execute
                      setTimeout(() => setShowVendorDropdown(false), 200);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowVendorDropdown(!showVendorDropdown)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {showVendorDropdown && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto z-50 divide-y divide-slate-100">
                    {filteredVendors.map(v => (
                      <button
                        key={v.id}
                        type="button"
                        className="w-full text-left p-2.5 px-3 hover:bg-indigo-50 text-xs transition-colors flex flex-col gap-0.5 cursor-pointer"
                        onMouseDown={() => {
                          setVendorName(v.name);
                          setVendorAddress(v.address || '');
                          setVendorGst(v.gst || '');
                          setVendorContactPerson(v.contact_person || '');
                          setShowVendorDropdown(false);
                        }}
                      >
                        <span className="font-extrabold text-slate-800">{v.name}</span>
                        {v.gst && <span className="text-[10px] text-slate-400 font-mono">GST: {v.gst}</span>}
                      </button>
                    ))}
                    {filteredVendors.length === 0 && (
                      <div className="p-2.5 text-xs text-slate-400 italic">No matching vendors found</div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase font-sans">Vendor Address Location</label>
                <input
                  type="text"
                  placeholder="Street and warehouse point"
                  className="w-full text-xs font-semibold border border-slate-250 p-2.5 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
                  value={vendorAddress}
                  onChange={(e) => setVendorAddress(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase font-sans">Vendor GST Registrations</label>
                <input
                  type="text"
                  placeholder="e.g. 07AAABBB1234A1Z1"
                  className="w-full text-xs font-semibold border border-slate-250 p-2.5 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none font-mono bg-white"
                  value={vendorGst}
                  onChange={(e) => setVendorGst(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase font-sans">Contact Person</label>
                <input
                  type="text"
                  placeholder="e.g. MR SIDDHARTH"
                  className="w-full text-xs font-semibold border border-slate-250 p-2.5 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
                  value={vendorContactPerson}
                  onChange={(e) => setVendorContactPerson(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
            {/* Client Picker */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase font-mono tracking-wider">Associated Corporate Client Link</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full text-xs font-semibold border border-slate-250 p-2.5 rounded-xl bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                <option value="">-- Choose Corporate Client (Optional) --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.client_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Picker */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase font-mono tracking-wider">Linked HVAC Job (Project)</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full text-xs font-semibold border border-slate-250 p-2.5 rounded-xl bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                <option value="">-- Choose HVAC Project (Optional) --</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.job_type})
                  </option>
                ))}
              </select>
            </div>

            {/* Status Picker */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase font-mono tracking-wider">Operational Status*</label>
              <select
                required
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full text-xs font-bold border border-slate-250 p-2.5 rounded-xl bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                <option value="Draft">Draft</option>
                <option value="Sent">Sent to Vendor</option>
                <option value="Approved">Approved / Procured</option>
                <option value="Received">Inventory Received</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <label className="text-[10px] font-black text-indigo-950 uppercase font-mono tracking-wider">Fulfillment Delivery Address*</label>
              
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">Select Site:</span>
                <select
                  value={sites.find(s => `${s.site_name} - ${s.address}` === deliveryAddress || s.address === deliveryAddress)?.id || ''}
                  onChange={(e) => {
                    const selectedSite = sites.find(s => s.id === e.target.value);
                    if (selectedSite) {
                      setDeliveryAddress(`${selectedSite.site_name} - ${selectedSite.address}`);
                    }
                  }}
                  className="text-[11px] font-semibold border border-slate-200 p-1 px-2 rounded-lg bg-white focus:ring-1 focus:ring-indigo-500 outline-none max-w-[250px] cursor-pointer"
                >
                  <option value="">-- Choose from client's sites --</option>
                  {clientSites.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.site_name} ({s.address})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <input
              type="text"
              required
              placeholder="e.g. 8/24 EAST PUNJABI BAGH NEW DELHI 110026"
              className="w-full text-xs font-semibold border border-slate-250 p-2.5 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
            />
          </div>

          {/* DYNAMIC LINE ITEMS */}
          <div className="space-y-3.5 pt-2">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-black text-slate-750 uppercase tracking-wide">Inventory Materials & Tool Supply Lines</h4>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[10.5px] p-1.5 px-3 rounded-lg border border-indigo-200 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item Line
              </button>
            </div>

            {/* Ledger table editable */}
            <div className="border border-slate-150 rounded-xl overflow-hidden bg-slate-50/50">
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/85 border-b border-slate-200 text-[10.5px] font-bold text-slate-500 uppercase font-mono">
                    <th className="p-3 pl-4">Material / Product Description*</th>
                    <th className="p-3 w-24 text-center">Unit</th>
                    <th className="p-3 w-28 text-right">Unit Net Price (₹)*</th>
                    <th className="p-3 w-24 text-center">Quantity*</th>
                    <th className="p-3 w-32 text-right border-l border-slate-150">Aggregate Code Net</th>
                    <th className="p-3 w-12 pr-4 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {items.map((item, index) => (
                    <tr key={index} className="bg-white hover:bg-slate-50/40">
                      <td className="p-2 pl-4">
                        <input
                          type="text"
                          required
                          placeholder="e.g. Copper wire rolls, HVAC tools, gas filters, thermostat modules..."
                          value={item.description}
                          onChange={(e) => handleItemFieldChange(index, 'description', e.target.value)}
                          className="w-full p-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-indigo-400 font-semibold"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="text"
                          required
                          placeholder="NOS"
                          value={item.unit || 'NOS'}
                          onChange={(e) => handleItemFieldChange(index, 'unit', e.target.value)}
                          className="w-16 p-2 text-xs border border-slate-200 rounded-lg text-center font-semibold inline-block uppercase"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          required
                          min="0"
                          value={item.unit_price}
                          onChange={(e) => handleItemFieldChange(index, 'unit_price', e.target.value)}
                          className="w-full p-2 text-xs border border-slate-200 rounded-lg text-right font-mono"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          required
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemFieldChange(index, 'quantity', e.target.value)}
                          className="w-16 p-2 text-xs border border-slate-200 rounded-lg text-center font-mono inline-block"
                        />
                      </td>
                      <td className="p-2 text-right font-bold text-slate-800 font-mono pr-4 select-none border-l border-slate-150 bg-slate-50/25">
                        {formatRupees(item.total)}
                      </td>
                      <td className="p-2 pr-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(index)}
                          disabled={items.length <= 1}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* LOWER SECTION: PAYMENT DETAILS & ESTIMATOR BOX */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* Left side parameters */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase font-mono tracking-wider">Contractual Payment Terms</label>
                <input
                  type="text"
                  placeholder="e.g. Net 30, COD, 30% advance with 70% immediate verification"
                  className="w-full text-xs font-semibold border border-slate-250 p-2.5 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase font-mono tracking-wider">Fulfillment & Operations Notes</label>
                <textarea
                  rows={3}
                  className="w-full text-slate-700 text-xs border border-slate-250 p-2.5 rounded-xl font-sans focus:ring-1 focus:ring-indigo-500 outline-none leading-relaxed"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Right side aggregations summary card */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <span className="text-[10px] font-black text-indigo-950 uppercase tracking-wider font-mono border-b border-indigo-100 pb-2 mb-2 block">
                Purchase Order Aggregate Commitments
              </span>

              <div className="space-y-3 font-sans text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Items Subtotal:</span>
                  <span className="font-semibold font-mono text-slate-800">{formatRupees(subtotal)}</span>
                </div>

                <div className="flex justify-between items-center text-slate-600 gap-4">
                  <span className="flex items-center gap-1.5">
                    Central/State GST %:
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="w-12 text-center text-xs p-1 border border-slate-350 focus:border-indigo-400 rounded bg-white font-semibold font-mono"
                      value={taxRate}
                      onChange={(e) => setTaxRate(Math.max(0, parseInt(e.target.value) || 0))}
                    />
                  </span>
                  <span className="font-semibold font-mono text-slate-800">{formatRupees(taxAmount)}</span>
                </div>

                <div className="flex justify-between items-center text-slate-600 gap-4">
                  <span className="flex items-center gap-1.5">
                    Shipping & Handling Cost (₹):
                    <input
                      type="number"
                      min="0"
                      className="w-24 text-right text-xs p-1 border border-slate-350 focus:border-indigo-400 rounded bg-white font-semibold font-mono"
                      value={shippingCost}
                      onChange={(e) => setShippingCost(Math.max(0, parseInt(e.target.value) || 0))}
                    />
                  </span>
                  <span className="font-semibold font-mono text-slate-800">+{formatRupees(shippingCost)}</span>
                </div>

                <div className="flex justify-between items-center text-slate-900 border-t border-slate-200 pt-3.5 mt-2">
                  <strong className="text-slate-900 text-sm tracking-tight font-black">Contract total amount:</strong>
                  <span className="text-base font-black font-mono text-indigo-700">{formatRupees(grandTotal)}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 border-t border-slate-150 pt-5 mt-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              {isSubmitting ? 'Syncing...' : mode === 'create' ? 'Issue Purchase Order' : 'Update PO Record'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

// ==========================================================
// SUB-COMPONENT: QUOTATION DOCUMENT PRINT PREVIEW MODAL
// ==========================================================
interface QuotationPreviewModalProps {
  quote: Quotation;
  clients?: Client[];
  onClose: () => void;
  formatRupees: (value: number) => string;
  onCreatePo?: (quote: Quotation) => void;
}

function QuotationPreviewModal({ quote, clients = [], onClose, formatRupees, onCreatePo }: QuotationPreviewModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const client = clients.find(c => c.id === quote.client_id || c.client_name === quote.client_name);
  const clientAddress = client ? (client.head_office_address || client.address || '') : '';
  const clientGst = client?.gst_number || '';

  // Core classification for High Side (Daikin Machine Supply) vs Low Side (Auxiliary & Labor)
  const isHighSide = (desc: string) => {
    const d = desc.toLowerCase();
    if (d.includes('daikin') && !d.includes('installation') && !d.includes('stand') && !d.includes('pipe') && !d.includes('piping') && !d.includes('wire') && !d.includes('wiring') && !d.includes('drain') && !d.includes('drainage') && !d.includes('ducting') && !d.includes('insulation') && !d.includes('canvas') && !d.includes('grill') && !d.includes('grills') && !d.includes('commissioning') && !d.includes('flushing') && !d.includes('loading') && !d.includes('unloading') && !d.includes('transportation') && !d.includes('civil') && !d.includes('electrical')) return true;
    if (d.includes('equipment') || d.includes('compressor') || d.includes('outdoor unit') || d.includes('indoor unit') || d.includes('condensing unit')) {
      if (!d.includes('installation') && !d.includes('piping') && !d.includes('wiring')) {
        return true;
      }
    }
    if (d.includes('tr') && d.includes('model') && !d.includes('installation')) return true;
    return false;
  };

  const highSideItems = quote.items.filter(item => isHighSide(item.description));
  const lowSideItems = quote.items.filter(item => !isHighSide(item.description));

  const highSideTotal = highSideItems.reduce((acc, item) => acc + item.total, 0);
  const lowSideSubtotal = lowSideItems.reduce((acc, item) => acc + item.total, 0);

  // Math synchronization with database quote object
  const lowSideTax = highSideTotal > 0
    ? Math.round(lowSideSubtotal * (quote.tax_rate / 100))
    : quote.tax_amount;

  const lowSideTotalWithGst = lowSideSubtotal + lowSideTax;
  const discount = quote.discount_amount || 0;
  const shipping = quote.shipping_amount || 0;

  // Helper: Roman Numerals for items
  const getRoman = (num: number) => {
    const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'];
    return roman[num - 1] || num.toString();
  };

  // Helper: Clean formatting without ₹ prefix for table columns
  const formatCleanVal = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in unique-invoice-viewer">
      <div className="bg-[#1e293b] rounded-2xl border border-slate-700 w-full max-w-4xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[95vh] print:max-h-none print:my-0 print:rounded-none print:border-none">
        
        {/* Print Stylesheet injection */}
        <style>{`
          @media print {
            /* Hide the screen-only controls and overlays */
            .print\\:hidden {
              display: none !important;
            }
            body {
              background-color: white !important;
              color: black !important;
            }
            #invoice-printable-frame {
              padding: 0 !important;
              background-color: white !important;
            }
            #invoice-printable-zone {
              box-shadow: none !important;
              border: none !important;
              padding: 0 !important;
              margin: 0 !important;
              width: 100% !important;
              max-width: none !important;
            }
            /* Force background colors to print, like yellow grand total highlights and table headers */
            .print-exact {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            /* Explicit page break after page 1 */
            .page-break {
              page-break-before: always !important;
              break-before: page !important;
              padding-top: 30px !important;
            }
            /* A4 setup */
            @page {
              size: A4 portrait;
              margin: 12mm 15mm 12mm 15mm;
            }
          }
        `}</style>

        {/* Controls block (Hidden when printing) */}
        <div className="p-4 bg-slate-850 border-b border-slate-800 flex justify-between items-center print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-wider p-1 px-2.5 rounded-full border border-emerald-500/20">
              PDF-PREVIEW GENERATOR
            </span>
            <span className="text-xs text-slate-300 font-mono font-bold">{quote.quotation_number}</span>
          </div>
          <div className="flex items-center gap-2">
            {quote.status === 'Approved' && onCreatePo && (
              <button
                type="button"
                onClick={() => {
                  onCreatePo(quote);
                  onClose();
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs p-2 px-4 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Receipt className="w-4 h-4 text-white inline" />
                Create PO
              </button>
            )}
            <button
              type="button"
              onClick={handlePrint}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs p-2 px-4 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 px-3 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-bold rounded-xl transition-colors cursor-pointer border border-slate-700"
            >
              Exit View
            </button>
          </div>
        </div>

        {/* Printable Paper Form Frame */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-10 bg-slate-900 print:bg-white print:p-0" id="invoice-printable-frame">
          
          <div className="bg-white w-full max-w-[800px] mx-auto p-6 sm:p-10 shadow-2xl border border-slate-200 text-black font-sans print:shadow-none print:border-none print:p-0" id="invoice-printable-zone">
            
            {/* PAGE 1 CONTENT */}
            <div>
              {/* BRAND HEADER */}
              <div className="flex justify-between items-start gap-4 pb-4">
                {/* Brand Logo & GSTIN info */}
                <div className="flex items-start gap-3">
                  {/* Styled Daikin brand waves */}
                  <div className="relative w-11 h-9 overflow-hidden shrink-0 mt-1 select-none flex items-center">
                    <div className="w-9 h-7 bg-[#0092d0] rounded-br-2xl rotate-[30deg] transform -translate-x-1"></div>
                  </div>
                  <div className="flex flex-col justify-start">
                    <span className="text-[10px] font-black text-slate-800 tracking-tight block leading-none font-sans">GSTIN : 06AVSPJ3528R1ZR</span>
                    <span className="text-2xl font-black italic tracking-widest text-[#0092d0] block leading-none font-sans mt-1">DAIKIN</span>
                    <span className="text-[8.5px] font-extrabold text-slate-650 block mt-1 leading-none font-sans border-t border-slate-200 pt-1">Authorised Dealer</span>
                  </div>
                </div>

                {/* Right side phones */}
                <div className="text-right text-[10px] font-bold text-slate-800 font-sans leading-snug">
                  Office : 9718145302<br />
                  <span className="pl-9">8006105045</span>
                </div>
              </div>

              {/* SUPER COOL PROJECT CENTRAL BRAND */}
              <div className="text-center space-y-1 py-1 border-b border-slate-250 pb-4 select-all">
                <h1 className="text-2xl font-black tracking-tight text-[#1b3d6c] font-sans">SUPER COOL PROJECT</h1>
                <p className="text-[10px] font-extrabold text-slate-700">
                  Plot No. 1, Near Panel Factory, Wazirabad, Gurugram, Haryana-122001
                </p>
                <p className="text-[10.5px] font-black text-slate-800 font-mono">
                  E-mail : <span className="underline">Supercoolproject03@gmail.com</span>
                </p>
              </div>

              {/* TWO-CELL GRID FOR TO & DOC REF */}
              <div className="border-2 border-black mt-4 text-xs font-sans">
                <div className="bg-[#f1f5f9] text-center font-black py-1 border-b-2 border-black tracking-wider text-[10px] uppercase select-none print-exact" style={{ backgroundColor: '#f1f5f9', WebkitPrintColorAdjust: 'exact' }}>
                  QUOTATION
                </div>
                <div className="grid grid-cols-12 divide-x-2 divide-black">
                  <div className="col-span-7 p-3 min-h-[90px] flex flex-col justify-start">
                    <span className="text-[10px] text-slate-500 font-bold block mb-0.5 select-none">To,</span>
                    <span className="font-extrabold text-black text-[11.5px] uppercase block">{quote.client_name || 'MR IMRAN'}</span>
                    <div className="text-[10px] text-slate-800 font-bold uppercase leading-normal mt-0.5 whitespace-pre-wrap">
                      {clientAddress || 'CHAND RESTAURANT BADKALI MEWAT'}
                    </div>
                    {clientGst && <div className="text-[9.5px] text-slate-700 font-mono mt-1">GSTIN: {clientGst}</div>}
                  </div>
                  <div className="col-span-5 p-3 flex flex-col justify-between min-h-[90px]">
                    <div>
                      <span className="text-slate-500 font-bold text-[9px] uppercase tracking-wider block mb-0.5 select-none">Doc Ref.</span>
                      <span className="font-mono font-extrabold text-black text-xs">{quote.quotation_number}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-1.5 mt-1.5">
                      <span className="text-slate-500 font-bold text-[9px] uppercase tracking-wider block mb-0.5 select-none">Doc Date:</span>
                      <span className="font-mono font-extrabold text-black text-xs">{quote.quotation_date}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* TABLE 1: HIGH SIDE (HVAC EQUIPMENT SUPPLY BOQ) */}
              {highSideItems.length > 0 && (
                <div className="border-2 border-black mt-5 font-sans overflow-hidden">
                  <div className="bg-[#f1f5f9] text-center font-black py-1 border-b-2 border-black tracking-wider text-[10.5px] uppercase print-exact" style={{ backgroundColor: '#f1f5f9', WebkitPrintColorAdjust: 'exact' }}>
                    HVAC – EQUIPMENT SUPPLY BOQ
                  </div>
                  <div className="bg-[#f8fafc] text-center font-black py-0.5 border-b-2 border-black text-[9.5px] uppercase tracking-widest text-[#0092d0] print-exact" style={{ backgroundColor: '#f8fafc', WebkitPrintColorAdjust: 'exact' }}>
                    MAKE –DAIKIN
                  </div>
                  <table className="w-full text-[10.5px] border-collapse">
                    <thead>
                      <tr className="border-b-2 border-black bg-slate-50 text-[9.5px] font-black text-slate-800 uppercase tracking-wider print-exact" style={{ backgroundColor: '#f8fafc', WebkitPrintColorAdjust: 'exact' }}>
                        <th className="p-1.5 text-center w-12 border-r border-black">S.No.</th>
                        <th className="p-1.5 text-left border-r border-black">Description</th>
                        <th className="p-1.5 text-center w-14 border-r border-black">Unit</th>
                        <th className="p-1.5 text-center w-14 border-r border-black">QT (M)</th>
                        <th className="p-1.5 text-right w-24 border-r border-black">Rate</th>
                        <th className="p-1.5 text-right w-24">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black font-semibold text-slate-900">
                      {highSideItems.map((item, idx) => (
                        <tr key={idx} className="border-b border-black">
                          <td className="p-1.5 text-center border-r border-black font-mono">{getRoman(idx + 1)}</td>
                          <td className="p-1.5 border-r border-black font-extrabold text-black leading-tight uppercase select-all">{item.description}</td>
                          <td className="p-1.5 text-center border-r border-black uppercase">{item.unit || 'NOS'}</td>
                          <td className="p-1.5 text-center border-r border-black font-mono">{item.quantity}</td>
                          <td className="p-1.5 text-right border-r border-black font-mono">{formatCleanVal(item.unit_price)}</td>
                          <td className="p-1.5 text-right font-black text-black font-mono">{formatCleanVal(item.total)}</td>
                        </tr>
                      ))}
                      {/* High side total row */}
                      <tr className="font-bold border-t-2 border-black bg-slate-50/60 print-exact" style={{ backgroundColor: '#fdfdfd', WebkitPrintColorAdjust: 'exact' }}>
                        <td className="border-r border-black p-1.5 text-center"></td>
                        <td className="border-r border-black p-1.5 font-black text-slate-800 uppercase text-[9.5px] tracking-wider">INCLUSIVE OF GST</td>
                        <td className="border-r border-black p-1.5 text-center"></td>
                        <td className="border-r border-black p-1.5 text-center"></td>
                        <td className="border-r border-black p-1.5 text-center font-black text-slate-800 uppercase text-[9.5px]">TOTAL</td>
                        <td className="p-1.5 text-right font-black text-black font-mono">{formatCleanVal(highSideTotal)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* TABLE 2: LOW SIDE INSTALLATION WORK */}
              {lowSideItems.length > 0 && (
                <div className="border-2 border-black mt-5 font-sans overflow-hidden">
                  <div className="bg-[#f1f5f9] text-center font-black py-1 border-b-2 border-black tracking-wider text-[10.5px] uppercase print-exact" style={{ backgroundColor: '#f1f5f9', WebkitPrintColorAdjust: 'exact' }}>
                    LOW SIDE
                  </div>
                  <table className="w-full text-[10.5px] border-collapse">
                    <thead>
                      <tr className="border-b-2 border-black bg-slate-50 text-[9.5px] font-black text-slate-800 uppercase tracking-wider print-exact" style={{ backgroundColor: '#f8fafc', WebkitPrintColorAdjust: 'exact' }}>
                        <th className="p-1.5 text-center w-12 border-r border-black">S.No.</th>
                        <th className="p-1.5 text-left border-r border-black">Description</th>
                        <th className="p-1.5 text-center w-14 border-r border-black">Unit</th>
                        <th className="p-1.5 text-center w-14 border-r border-black">QT (M)</th>
                        <th className="p-1.5 text-right w-24 border-r border-black">Rate</th>
                        <th className="p-1.5 text-right w-24">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black font-semibold text-slate-900">
                      {lowSideItems.map((item, idx) => (
                        <tr key={idx} className="border-b border-black">
                          <td className="p-1.5 text-center border-r border-black font-mono">{getRoman(idx + 1)}</td>
                          <td className="p-1.5 border-r border-black font-extrabold text-black leading-tight uppercase select-all">{item.description}</td>
                          <td className="p-1.5 text-center border-r border-black uppercase">{item.unit || 'NOS'}</td>
                          <td className="p-1.5 text-center border-r border-black font-mono">{item.quantity}</td>
                          <td className="p-1.5 text-right border-r border-black font-mono">{formatCleanVal(item.unit_price)}</td>
                          <td className="p-1.5 text-right font-black text-black font-mono">{formatCleanVal(item.total)}</td>
                        </tr>
                      ))}
                      
                      {/* Low side Subtotal */}
                      <tr className="font-bold border-t border-black">
                        <td className="border-r border-black p-1.5 text-center"></td>
                        <td className="border-r border-black p-1.5 font-black text-slate-800 uppercase text-[9px]">GST EXTRA APPLICABLE</td>
                        <td className="border-r border-black p-1.5 text-center"></td>
                        <td className="border-r border-black p-1.5 text-center"></td>
                        <td className="border-r border-black p-1.5 text-center font-black text-slate-800 uppercase text-[9.5px]">TOTAL</td>
                        <td className="p-1.5 text-right font-bold text-black font-mono">{formatCleanVal(lowSideSubtotal)}</td>
                      </tr>

                      {/* Low side Tax (GST) */}
                      <tr className="font-bold border-t border-black">
                        <td className="border-r border-black p-1.5 text-center"></td>
                        <td className="border-r border-black p-1.5"></td>
                        <td className="border-r border-black p-1.5 text-center"></td>
                        <td className="border-r border-black p-1.5 text-center"></td>
                        <td className="border-r border-black p-1.5 text-center font-black text-slate-800 uppercase text-[9.5px]">GST {quote.tax_rate}%</td>
                        <td className="p-1.5 text-right font-bold text-black font-mono">{formatCleanVal(lowSideTax)}</td>
                      </tr>

                      {/* Total with Tax (Low Side Total) */}
                      <tr className="font-bold border-t border-black bg-slate-50/40 print-exact" style={{ backgroundColor: '#fcfcfc', WebkitPrintColorAdjust: 'exact' }}>
                        <td className="border-r border-black p-1.5 text-center"></td>
                        <td className="border-r border-black p-1.5"></td>
                        <td className="border-r border-black p-1.5 text-center"></td>
                        <td className="border-r border-black p-1.5 text-center"></td>
                        <td className="border-r border-black p-1.5 text-center font-black text-slate-900 uppercase text-[9.5px]">TOTAL</td>
                        <td className="p-1.5 text-right font-black text-black font-mono">{formatCleanVal(lowSideTotalWithGst)}</td>
                      </tr>

                      {/* Optional extra discount row */}
                      {discount > 0 && (
                        <tr className="font-bold border-t border-black bg-emerald-50/10 text-emerald-800 print-exact" style={{ WebkitPrintColorAdjust: 'exact' }}>
                          <td className="border-r border-black p-1.5 text-center"></td>
                          <td className="border-r border-black p-1.5 uppercase font-bold text-[9px]">DEDUCTIBLE SAVINGS SPECIAL DISCOUNT</td>
                          <td className="border-r border-black p-1.5 text-center"></td>
                          <td className="border-r border-black p-1.5 text-center"></td>
                          <td className="border-r border-black p-1.5 text-center font-black uppercase text-[9.5px]">DISCOUNT</td>
                          <td className="p-1.5 text-right font-black font-mono">-{formatCleanVal(discount)}</td>
                        </tr>
                      )}

                      {/* Optional extra shipping row */}
                      {shipping > 0 && (
                        <tr className="font-bold border-t border-black bg-indigo-50/10 text-indigo-850 print-exact" style={{ WebkitPrintColorAdjust: 'exact' }}>
                          <td className="border-r border-black p-1.5 text-center"></td>
                          <td className="border-r border-black p-1.5 uppercase font-bold text-[9px]">SHIPPING / CARRIAGE HANDLING CHARGES</td>
                          <td className="border-r border-black p-1.5 text-center"></td>
                          <td className="border-r border-black p-1.5 text-center"></td>
                          <td className="border-r border-black p-1.5 text-center font-black uppercase text-[9.5px]">SHIPPING</td>
                          <td className="p-1.5 text-right font-black font-mono">+{formatCleanVal(shipping)}</td>
                        </tr>
                      )}

                      {/* COMPREHENSIVE SPECIAL MEASUREMENTS NOTE */}
                      <tr className="font-bold border-t-2 border-black bg-slate-50 text-[9px] print-exact" style={{ backgroundColor: '#fafafa', WebkitPrintColorAdjust: 'exact' }}>
                        <td className="border-r border-black p-2 text-center font-black text-slate-800 font-sans uppercase">NOTE</td>
                        <td className="p-2 font-black text-slate-850 font-sans uppercase leading-relaxed tracking-wide" colSpan={5}>
                          COPPER PIPE ,DRAIN PIPE AND WIRE AS PER MEASUREMENT
                        </td>
                      </tr>

                      {/* CONSOLIDATED GRAND TOTAL HERO BOX (Bright Yellow Background) */}
                      <tr 
                        className="font-extrabold border-t-2 border-black bg-[#ffff00] text-black text-xs font-sans print-exact" 
                        style={{ backgroundColor: '#ffff00', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
                      >
                        <td className="border-r border-black p-2.5 text-center"></td>
                        <td className="border-r border-black p-2.5 font-black uppercase text-[10.5px] tracking-wide" colSpan={4}>
                          GRAND TOTAL HIGH SIDE & LOW SIDE
                        </td>
                        <td className="p-2.5 text-right font-black text-[13px] font-mono">
                          {formatCleanVal(quote.grand_total)}
                        </td>
                      </tr>

                    </tbody>
                  </table>
                </div>
              )}

              {/* STATUTORY TERMS AND WORK DETAILS AT BOTTOM OF PAGE 1 */}
              <div className="mt-6 text-[10px] leading-relaxed text-slate-800 space-y-1 bg-slate-50/50 p-3 rounded-lg border border-slate-150 select-all font-semibold">
                <p>• Actual Bill will be raised on actual quantity installed at site.</p>
                <p>• Civil & electrical work is in client scope as per drawing and architect position Services.</p>
                <p>• Payment 100% advance against supply of equipments.</p>
                <p>• Delivery of equipment will take 2 to 3 weeks after advance received.</p>
                <p>• Items which not included it will cost extra.</p>
              </div>
            </div>

            {/* PAGE 2 CONTENT (BANK DETAILS & AUTHORIZED SIGNATURE) */}
            <div className="page-break border-t border-dashed border-slate-250 pt-10 mt-10" style={{ pageBreakBefore: 'always', breakBefore: 'page' }}>
              
              <div className="grid grid-cols-12 gap-8 text-[11px] font-sans leading-relaxed select-all">
                {/* Bank account details left */}
                <div className="col-span-7 space-y-1.5">
                  <h3 className="font-extrabold text-black uppercase tracking-wider text-[11px] select-none">Company Bank Details.</h3>
                  <div className="border-l-2 border-[#1e3a8a] pl-2.5 space-y-1">
                    <p className="font-black text-[#1e3a8a] text-xs">SUPER COOL PROJECT</p>
                    <p className="font-bold text-slate-700">AXIS BANK LTD SEC 57 GURGAON. Branch-122001.</p>
                    <p className="font-black text-slate-900 font-mono text-[11.5px]">Account No:- 920020055098592.</p>
                    <p className="font-black text-slate-900 font-mono text-[11.5px]">IFSC – UTIB0001366</p>
                  </div>
                </div>

                {/* Signature box right */}
                <div className="col-span-5 text-right flex flex-col justify-between min-h-[120px] pr-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-450 block font-bold select-none">Issued On Behalf Of:</span>
                    <strong className="font-black text-[#1b3d6c] text-xs uppercase block">For Super Cool Project</strong>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="w-44 border-b border-slate-300 ml-auto"></div>
                    <strong className="font-extrabold text-slate-800 text-[10px] uppercase tracking-wider block">Authorized Signatory</strong>
                  </div>
                </div>
              </div>

              {/* STATIC WARNING SIGNATURE NOT MANDATORY */}
              <div className="mt-14 border border-black p-2 text-center text-[9px] font-black uppercase text-slate-700 tracking-wider font-sans select-all">
                NOTE :- System generated document signature are not mandatory.
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

// ==========================================================
// SUB-COMPONENT: PURCHASE ORDER PRINT PREVIEW MODAL
// ==========================================================
interface PurchaseOrderPreviewModalProps {
  po: PurchaseOrder;
  onClose: () => void;
  formatRupees: (value: number) => string;
}

function PurchaseOrderPreviewModal({ po, onClose, formatRupees }: PurchaseOrderPreviewModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const getRoman = (num: number) => {
    const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'];
    return roman[num - 1] || num.toString();
  };

  const formatCleanVal = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in unique-po-viewer">
      <div className="bg-[#1e293b] rounded-2xl border border-slate-700 w-full max-w-4xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[95vh] print:max-h-none print:my-0 print:rounded-none print:border-none">
        
        {/* Print Stylesheet injection */}
        <style>{`
          @media print {
            /* Hide the screen-only controls and overlays */
            .print\\:hidden {
              display: none !important;
            }
            body {
              background-color: white !important;
              color: black !important;
            }
            #po-printable-frame {
              padding: 0 !important;
              background-color: white !important;
            }
            #po-printable-zone {
              box-shadow: none !important;
              border: none !important;
              padding: 0 !important;
              margin: 0 !important;
              width: 100% !important;
              max-width: none !important;
            }
            .print-exact {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            @page {
              size: A4 portrait;
              margin: 10mm 12mm 10mm 12mm;
            }
          }
        `}</style>

        {/* Controls block (Hidden when printing!) */}
        <div className="p-4 bg-slate-850 border-b border-slate-800 flex justify-between items-center print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <span className="bg-purple-500/15 text-purple-400 text-[10px] font-black uppercase tracking-wider p-1 px-2.5 rounded-full border border-purple-500/20">
              COMMERCIAL PURCHASE ORDER
            </span>
            <span className="text-xs text-slate-300 font-mono font-bold">{po.po_number}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs p-2 px-4 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 px-3 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-bold rounded-xl transition-colors cursor-pointer border border-slate-700"
            >
              Exit View
            </button>
          </div>
        </div>

        {/* Printable Paper Form Frame */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-10 bg-slate-900 print:bg-white print:p-0" id="po-printable-frame">
          
          <div className="bg-white w-full max-w-[800px] mx-auto p-6 sm:p-10 shadow-2xl border border-slate-200 text-black font-sans print:shadow-none print:border-none print:p-0" id="po-printable-zone">
            
            {/* BRAND HEADER */}
            <div className="flex justify-between items-start gap-4 pb-4 select-all">
              <div>
                <span className="text-[10.5px] font-black text-slate-800 tracking-tight block leading-none font-sans uppercase">
                  GSTIN : 06AVSPJ3528R1ZR
                </span>
                <span className="text-2xl font-black italic tracking-widest text-[#0092d0] block leading-none font-sans mt-1.5">
                  SUPER COOL PROJECT
                </span>
                <span className="text-[8.5px] font-bold text-slate-600 tracking-tight block leading-relaxed max-w-sm mt-1 uppercase font-sans">
                  PLOT NO 1, NEAR PANEL FACTORY, WAZIRABAD, GURUGRAM HARYANA-122001<br />
                  EMAIL - supercoolproject03@gmail.com
                </span>
              </div>
              <div className="text-right text-[10px] font-bold text-slate-650 space-y-0.5 uppercase font-sans">
                <p>MOB NO - 9718145302</p>
                <p>8006105045</p>
              </div>
            </div>

            {/* SOLID YELLOW BANNER FOR DOCUMENT TITLE */}
            <div 
              className="bg-yellow-400 border border-black py-1.5 text-center font-black text-sm tracking-widest text-black uppercase print-exact my-3.5"
              style={{ backgroundColor: '#facc15', color: '#000000', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
            >
              PURCHASE ORDER
            </div>

            {/* TWO-COLUMN DETAILS BLOCKS WITHIN THIN BLACK BORDERS */}
            <div className="border border-black grid grid-cols-12 text-[11px] leading-normal font-sans mb-4 select-all">
              {/* Left Vendor block */}
              <div className="col-span-6 p-3 border-r border-black space-y-1">
                <span className="text-xs font-black text-slate-850 block">To,</span>
                <strong className="text-xs font-black text-black block uppercase">{po.vendor_name}</strong>
                <p className="text-slate-700 text-[10px] leading-relaxed max-w-xs font-medium uppercase">
                  {po.vendor_address || 'Delhi HVAC Supply Warehouse, Okhla Phase III, New Delhi'}
                </p>
                <div className="text-[10px] font-bold text-slate-800 pt-1 space-y-0.5">
                  <p>Ph. No:- +91-</p>
                  <p>GSTIN/UIN: <span className="font-mono text-[10.5px]">{po.vendor_gst || '07AAAAA1111A1Z1'}</span></p>
                </div>
              </div>

              {/* Right Document details & Fulfillment address block */}
              <div className="col-span-6 p-3 flex flex-col justify-between space-y-2">
                <div className="space-y-1 text-[10px] font-bold text-slate-800">
                  <div className="flex justify-between">
                    <span>Doc Ref No.</span>
                    <strong className="font-black text-black font-mono text-xs">{po.po_number}</strong>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1">
                    <span>Doc Date :</span>
                    <strong className="font-black text-black">{po.po_date}</strong>
                  </div>
                  {po.vendor_contact_person && (
                    <div className="flex justify-between border-t border-slate-200 pt-1">
                      <span>Contact Person :</span>
                      <strong className="font-bold text-black uppercase">{po.vendor_contact_person}</strong>
                    </div>
                  )}
                </div>

                <div className="border-t border-black pt-2 text-[10px] leading-relaxed select-all">
                  <strong className="font-black text-slate-900 block uppercase tracking-tight">DELIVERY ADDRESS-</strong>
                  <p className="font-semibold text-slate-700 uppercase">
                    {po.delivery_address || '8/24 EAST PUNJABI BAGH NEW DELHI 110026'}
                  </p>
                </div>
              </div>
            </div>

            {/* GREETINGS NOTE */}
            <div className="text-[11px] font-semibold text-slate-800 pb-3 leading-relaxed uppercase">
              Dear Sir/Madam,<br />
              {po.notes || 'Further to your confirmation / purchase order,'}
            </div>

            {/* TABLE OF INVENTORY MATERIALS AND SUPPLIES */}
            <div className="border border-black overflow-hidden select-all mb-6">
              <table className="w-full text-left text-[11px] border-collapse font-sans text-black">
                <thead>
                  <tr className="bg-slate-100 border-b border-black text-[10px] font-black text-black uppercase print-exact text-center">
                    <th className="border-r border-black p-2 w-12 shrink-0">S.No.</th>
                    <th className="border-r border-black p-2 text-left">Description</th>
                    <th className="border-r border-black p-2 w-16">Unit</th>
                    <th className="border-r border-black p-2 w-16">Qty</th>
                    <th className="border-r border-black p-2 w-28 text-right">RATE</th>
                    <th className="p-2 w-32 text-right">AMOUNT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/80 font-medium">
                  {po.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/10 text-center leading-relaxed">
                      <td className="border-r border-black p-2 font-bold text-[10px]">{getRoman(idx + 1)}</td>
                      <td className="border-r border-black p-2 text-left font-semibold uppercase">{item.description}</td>
                      <td className="border-r border-black p-2 uppercase font-semibold">{item.unit || 'NOS'}</td>
                      <td className="border-r border-black p-2 font-bold font-mono">{item.quantity}</td>
                      <td className="border-r border-black p-2 text-right font-mono font-semibold">{formatCleanVal(item.unit_price)}</td>
                      <td className="p-2 text-right font-bold font-mono text-slate-900">{formatCleanVal(item.total)}</td>
                    </tr>
                  ))}

                  {/* Empty Spacer Rows to match the classic document feel (only in screen view to avoid page overflows) */}
                  {po.items.length < 3 && Array.from({ length: 3 - po.items.length }).map((_, idx) => (
                    <tr key={`empty-${idx}`} className="h-8 print:hidden">
                      <td className="border-r border-black p-2"></td>
                      <td className="border-r border-black p-2"></td>
                      <td className="border-r border-black p-2"></td>
                      <td className="border-r border-black p-2"></td>
                      <td className="border-r border-black p-2"></td>
                      <td className="p-2"></td>
                    </tr>
                  ))}

                  {/* SUB-TOTAL VALUE */}
                  <tr className="font-extrabold border-t border-black bg-slate-50 text-[11px] print-exact" style={{ backgroundColor: '#fafafa', WebkitPrintColorAdjust: 'exact' }}>
                    <td className="border-r border-black p-2"></td>
                    <td className="border-r border-black p-2 text-left font-black" colSpan={4}>TOTAL</td>
                    <td className="p-2 text-right font-black font-mono text-xs">{formatCleanVal(po.subtotal)}</td>
                  </tr>

                  {/* TAX COMPLIANCE: SGST/CGST */}
                  <tr className="font-bold border-t border-black text-[10px]">
                    <td className="border-r border-black p-2"></td>
                    <td className="border-r border-black p-2 text-left uppercase" colSpan={4}>
                      Central/State GST ({po.tax_rate}%)
                    </td>
                    <td className="p-2 text-right font-bold font-mono">
                      {formatCleanVal(po.tax_amount)}
                    </td>
                  </tr>

                  {/* OPTIONAL SHIPPING FREIGHT */}
                  {po.shipping_handling !== undefined && po.shipping_handling > 0 && (
                    <tr className="font-bold border-t border-black text-[10px]">
                      <td className="border-r border-black p-2"></td>
                      <td className="border-r border-black p-2 text-left uppercase" colSpan={4}>Shipping / Freight Handling Charges</td>
                      <td className="p-2 text-right font-bold font-mono">+{formatCleanVal(po.shipping_handling)}</td>
                    </tr>
                  )}

                  {/* SOLID YELLOW HERO BOX FOR GRAND TOTAL */}
                  <tr 
                    className="font-black border-t border-black bg-yellow-400 text-black text-xs print-exact" 
                    style={{ backgroundColor: '#facc15', color: '#000000', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
                  >
                    <td className="border-r border-black p-2.5"></td>
                    <td className="border-r border-black p-2.5 text-left font-black uppercase tracking-wider" colSpan={4}>
                      GRAND TOTAL (WITH GST)
                    </td>
                    <td className="p-2.5 text-right font-black text-sm font-mono">
                      {formatCleanVal(po.grand_total)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* AUTHORIZED SIGNATORY BLOCK */}
            <div className="grid grid-cols-12 gap-6 pt-10 text-[11px] leading-relaxed select-all">
              <div className="col-span-7 font-semibold text-slate-505 italic text-[10px] flex items-end">
                * This is a commercially binding official Purchase Order issued under mutual trade terms. System generated documentation does not mandate ink signatures.
              </div>
              <div className="col-span-5 text-right flex flex-col justify-between min-h-[110px] pr-2">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-500 block font-bold select-none">Issued On Behalf Of:</span>
                  <strong className="font-black text-[#1b3d6c] text-xs uppercase block">For super cool project</strong>
                </div>
                
                <div className="space-y-1 mt-6">
                  <div className="w-44 border-b border-black ml-auto"></div>
                  <strong className="font-extrabold text-slate-800 text-[10px] uppercase tracking-wider block">Authorized Signatory</strong>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
