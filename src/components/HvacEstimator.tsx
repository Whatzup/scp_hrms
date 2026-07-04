import React, { useState, useMemo } from 'react';
import { QuotationLineItem } from '../types';
import { 
  Calculator, Wrench, Thermometer, Sun, Users, Cpu, 
  Home, Check, Plus, RotateCcw, Layers, IndianRupee,
  FileSpreadsheet, Info, Bolt, Compass, Settings, Sparkles
} from 'lucide-react';

interface HvacEstimatorProps {
  onApply: (data: {
    items: QuotationLineItem[];
    taxRate: number;
    notes: string;
    discountAmount: number;
  }) => void;
  applyLabel?: string;
  onCancel?: () => void;
}

export default function HvacEstimator({ onApply, applyLabel = "Apply to Quotation", onCancel }: HvacEstimatorProps) {
  // --- STATE FOR HEAT LOAD ---
  const [length, setLength] = useState<number>(15);
  const [width, setWidth] = useState<number>(12);
  const [height, setHeight] = useState<number>(10);
  const [occupants, setOccupants] = useState<number>(2);
  const [appliances, setAppliances] = useState<number>(1);
  const [sunExposure, setSunExposure] = useState<'low' | 'medium' | 'high'>('medium');
  const [isKitchen, setIsKitchen] = useState<boolean>(false);
  const [systemQuantity, setSystemQuantity] = useState<number>(1);

  // --- STATE FOR EQUIPMENT SELECTION ---
  const [acType, setAcType] = useState<string>('Split AC (High-Wall)');
  const [efficiency, setEfficiency] = useState<string>('3-Star Inverter');
  const [brand, setBrand] = useState<string>('Voltas');

  // --- STATE FOR ACCESSORIES & MATERIALS ---
  const [copperPiping, setCopperPiping] = useState<number>(5); // meters
  const [drainPiping, setDrainPiping] = useState<number>(5); // meters
  const [wiringCable, setWiringCable] = useState<number>(5); // meters
  const [hasBracket, setHasBracket] = useState<boolean>(true);
  const [hasStabilizer, setHasStabilizer] = useState<boolean>(true);
  const [hasLabor, setHasLabor] = useState<boolean>(true);
  const [taxRate, setTaxRate] = useState<number>(18);
  const [customDiscount, setCustomDiscount] = useState<number>(0);

  // --- THERMODYNAMIC HEAT LOAD LOGIC ---
  const area = useMemo(() => length * width, [length, width]);
  const volume = useMemo(() => area * height, [area, height]);

  const heatLoadBreakdown = useMemo(() => {
    // 1. Base BTU (Area * 20)
    const baseBtu = area * 20;

    // 2. Height Adjustment (Ceiling > 8ft adds 1,000 BTU per additional foot)
    const heightBtu = height > 8 ? (height - 8) * 1000 : 0;

    // 3. Occupants (Each person over 2 adds 600 BTU)
    const occupantBtu = occupants > 2 ? (occupants - 2) * 600 : 0;

    // 4. Electronic appliances (Each adds 400 BTU)
    const applianceBtu = appliances * 400;

    // 5. Kitchen heat factor (+4000 BTU)
    const kitchenBtu = isKitchen ? 4000 : 0;

    // 6. Subtotal before sun exposure
    const subtotalBtu = baseBtu + heightBtu + occupantBtu + applianceBtu + kitchenBtu;

    // 7. Sun exposure adjustment
    let sunModifier = 0;
    if (sunExposure === 'low') sunModifier = -0.10; // Shaded/low heat
    if (sunExposure === 'high') sunModifier = 0.20;  // High heat / Roof exposed

    const sunAdjustmentBtu = Math.round(subtotalBtu * sunModifier);
    const totalBtu = Math.max(5000, subtotalBtu + sunAdjustmentBtu);

    // 8. Tonnage calculation
    const calculatedTonnage = totalBtu / 12000;

    // 9. Recommended standard capacity
    let recommendedTonnage = 1.5;
    if (calculatedTonnage <= 0.85) recommendedTonnage = 0.8;
    else if (calculatedTonnage <= 1.1) recommendedTonnage = 1.0;
    else if (calculatedTonnage <= 1.35) recommendedTonnage = 1.2;
    else if (calculatedTonnage <= 1.6) recommendedTonnage = 1.5;
    else if (calculatedTonnage <= 2.1) recommendedTonnage = 2.0;
    else if (calculatedTonnage <= 2.6) recommendedTonnage = 2.5;
    else recommendedTonnage = 3.0;

    return {
      baseBtu,
      heightBtu,
      occupantBtu,
      applianceBtu,
      kitchenBtu,
      sunAdjustmentBtu,
      totalBtu,
      calculatedTonnage,
      recommendedTonnage
    };
  }, [area, height, occupants, appliances, isKitchen, sunExposure]);

  // --- PRICING LOOKUP LOGIC ---
  const acUnitPrice = useMemo(() => {
    const recTon = heatLoadBreakdown.recommendedTonnage;
    
    // Base prices for Voltas 3-Star Inverter Split AC
    let basePrice = 42000;
    if (recTon <= 0.8) basePrice = 28000;
    else if (recTon <= 1.0) basePrice = 33000;
    else if (recTon <= 1.2) basePrice = 38000;
    else if (recTon <= 1.5) basePrice = 44000;
    else if (recTon <= 2.0) basePrice = 56000;
    else if (recTon <= 2.5) basePrice = 72000;
    else basePrice = 88000; // 3.0 Ton / Heavy Commercial

    // Efficiency Modifier
    let efficiencyFactor = 1.0;
    if (efficiency === '5-Star Inverter') efficiencyFactor = 1.16; // +16%
    if (efficiency === 'Non-Inverter') efficiencyFactor = 0.85;   // -15%

    // System Type Modifier
    let typeFactor = 1.0;
    if (acType === 'Window AC') typeFactor = 0.78;         // -22%
    if (acType === 'Cassette AC') typeFactor = 1.40;       // +40% (ceiling cassette premium)
    if (acType === 'Ducted Split') typeFactor = 1.55;      // +55% (ducted system premium)
    if (acType === 'Tower AC') typeFactor = 1.30;          // +30%

    // Brand Premium Modifier
    let brandFactor = 1.0;
    if (brand === 'Daikin') brandFactor = 1.12;          // +12%
    if (brand === 'Blue Star') brandFactor = 1.06;       // +6%
    if (brand === 'Carrier') brandFactor = 1.08;         // +8%
    if (brand === 'O General') brandFactor = 1.25;       // +25%

    return Math.round(basePrice * efficiencyFactor * typeFactor * brandFactor);
  }, [heatLoadBreakdown.recommendedTonnage, efficiency, acType, brand]);

  // --- BILL OF MATERIALS GENERATOR ---
  const billOfMaterials = useMemo(() => {
    const itemsList: QuotationLineItem[] = [];
    const tonStr = heatLoadBreakdown.recommendedTonnage.toFixed(1);

    // 1. AC Unit Line
    itemsList.push({
      description: `[${brand.toUpperCase()}] ${tonStr} Ton ${efficiency} ${acType} Unit (Inverter Copper Condenser)`,
      unit: 'set',
      unit_price: acUnitPrice,
      quantity: systemQuantity,
      total: acUnitPrice * systemQuantity
    });

    // 2. Extra Copper Piping (3 meters are generally free/included)
    const extraPipeLength = Math.max(0, copperPiping - 3);
    if (extraPipeLength > 0) {
      const pricePerMeter = 950;
      const totalPipeQty = extraPipeLength * systemQuantity;
      itemsList.push({
        description: `Premium insulated copper refrigerant piping with nitrile sleeves (Extra length: ${extraPipeLength}m per unit)`,
        unit: 'meter',
        unit_price: pricePerMeter,
        quantity: totalPipeQty,
        total: pricePerMeter * totalPipeQty
      });
    }

    // 3. Wall mounting bracket
    if (hasBracket && acType !== 'Window AC') {
      const bracketPrice = 1500;
      itemsList.push({
        description: 'Heavy-duty powder-coated outdoor condenser mounting bracket with anti-vibration rubber pads',
        unit: 'piece',
        unit_price: bracketPrice,
        quantity: systemQuantity,
        total: bracketPrice * systemQuantity
      });
    }

    // 4. Voltage Stabilizer
    if (hasStabilizer) {
      const stabilizerPrice = 2800;
      itemsList.push({
        description: `Automatic Digital Voltage Stabilizer with High/Low Voltage Cut-off & Time Delay (4KVA/5KVA range)`,
        unit: 'set',
        unit_price: stabilizerPrice,
        quantity: systemQuantity,
        total: stabilizerPrice * systemQuantity
      });
    }

    // 5. Professional installation labor
    if (hasLabor) {
      const laborPrice = 2200;
      itemsList.push({
        description: `Professional HVAC installation, nitrogen testing, vacuuming, and system commissioning labor`,
        unit: 'lot',
        unit_price: laborPrice,
        quantity: systemQuantity,
        total: laborPrice * systemQuantity
      });
    }

    // 6. Drain piping layout (PVC)
    if (drainPiping > 0) {
      const drainPrice = 150;
      const totalDrainQty = drainPiping * systemQuantity;
      itemsList.push({
        description: `Heavy-duty PVC condensate drain pipe layout with necessary bends and U-traps`,
        unit: 'meter',
        unit_price: drainPrice,
        quantity: totalDrainQty,
        total: drainPrice * totalDrainQty
      });
    }

    // 7. Electrical main cable wiring
    if (wiringCable > 0) {
      const wiringPrice = 180;
      const totalWiringQty = wiringCable * systemQuantity;
      itemsList.push({
        description: `Standard 3-core copper electrical power cable layout with PVC conduit shielding`,
        unit: 'meter',
        unit_price: wiringPrice,
        quantity: totalWiringQty,
        total: wiringPrice * totalWiringQty
      });
    }

    // Calculate aggregations
    const subtotal = itemsList.reduce((acc, item) => acc + item.total, 0);
    const taxAmount = Math.round(subtotal * (taxRate / 100));
    const grandTotal = Math.max(0, subtotal + taxAmount - customDiscount);

    return {
      itemsList,
      subtotal,
      taxAmount,
      grandTotal
    };
  }, [
    brand,
    efficiency,
    acType,
    acUnitPrice,
    systemQuantity,
    copperPiping,
    hasBracket,
    hasStabilizer,
    hasLabor,
    drainPiping,
    wiringCable,
    taxRate,
    customDiscount,
    heatLoadBreakdown
  ]);

  // --- RESET ALL INPUTS ---
  const handleReset = () => {
    setLength(15);
    setWidth(12);
    setHeight(10);
    setOccupants(2);
    setAppliances(1);
    setSunExposure('medium');
    setIsKitchen(false);
    setSystemQuantity(1);
    setAcType('Split AC (High-Wall)');
    setEfficiency('3-Star Inverter');
    setBrand('Voltas');
    setCopperPiping(5);
    setDrainPiping(5);
    setWiringCable(5);
    setHasBracket(true);
    setHasStabilizer(true);
    setHasLabor(true);
    setTaxRate(18);
    setCustomDiscount(0);
  };

  // --- SUBMIT EXPORT CALLBACK ---
  const handleExport = () => {
    const notesStr = `Estimated via Thermodynamic Heat Load Calculator:
- Room Space Dimensions: ${length}ft x ${width}ft x ${height}ft (${area} sq ft, ${volume} cu ft)
- Thermal Sources: ${occupants} occupants, ${appliances} electrical appliance(s)${isKitchen ? ', kitchen area active' : ''}
- Sun Exposure Level: ${sunExposure.toUpperCase()}
- Recommended cooling capacity: ${heatLoadBreakdown.calculatedTonnage.toFixed(2)} Tons (Recommended AC Unit: ${heatLoadBreakdown.recommendedTonnage.toFixed(1)} Ton)`;

    onApply({
      items: billOfMaterials.itemsList,
      taxRate: taxRate,
      notes: notesStr,
      discountAmount: customDiscount
    });
  };

  // Helper: Format Rupee nicely
  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 md:p-6 space-y-6 animate-fadeIn" id="hvac-estimator-panel-root">
      {/* Panel title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-indigo-600" />
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight">Thermodynamic HVAC Load & Pricing Calculator</h3>
            <p className="text-[11px] text-slate-500 font-medium">Configure room parameters, lookup brand price catalogues, and auto-compile official quotations.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="p-1.5 px-3 bg-white border border-slate-200 text-[10.5px] font-bold rounded-lg hover:bg-slate-50 text-slate-600 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Inputs
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              className="p-1.5 px-3 bg-slate-200 text-[10.5px] font-bold rounded-lg hover:bg-slate-300 text-slate-700 cursor-pointer transition-colors"
            >
              Close Estimator
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: CONTROLS (8-cols on lg) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Section 1: Thermodynamic Space Inputs */}
          <div className="bg-white p-4.5 rounded-xl border border-slate-150 shadow-2xs space-y-4">
            <h4 className="text-[11px] font-black uppercase text-indigo-950 tracking-wider flex items-center gap-1.5 font-mono">
              <Home className="w-4 h-4 text-indigo-500" />
              1. Space & Thermodynamic Variables
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Length */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-600">
                  <span>Room Length</span>
                  <span className="font-mono text-indigo-700 font-extrabold">{length} ft</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="1"
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  className="w-full accent-indigo-650 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                />
              </div>

              {/* Width */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-600">
                  <span>Room Width</span>
                  <span className="font-mono text-indigo-700 font-extrabold">{width} ft</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="1"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full accent-indigo-650 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                />
              </div>

              {/* Ceiling Height */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 block uppercase font-sans">Ceiling Height</label>
                <select
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full text-xs font-semibold border border-slate-200 p-2 rounded-lg bg-white outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="8">8 ft (Standard Compact)</option>
                  <option value="10">10 ft (Normal Corporate)</option>
                  <option value="12">12 ft (High Ceilings)</option>
                  <option value="14">14 ft (Loft/Warehouse)</option>
                </select>
              </div>
            </div>

            {/* Sub thermodynamic sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
              {/* Occupants */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                  <span>Occupants</span>
                  <span className="font-mono font-bold text-slate-700">{occupants} Pax</span>
                </div>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={occupants}
                  onChange={(e) => setOccupants(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full text-xs font-semibold border border-slate-200 p-2 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Appliances */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                  <span>Appliances (PCs/TVs)</span>
                  <span className="font-mono font-bold text-slate-700">{appliances} pcs</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={appliances}
                  onChange={(e) => setAppliances(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full text-xs font-semibold border border-slate-200 p-2 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Sun Exposure */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 block uppercase">Sun Exposure</label>
                <select
                  value={sunExposure}
                  onChange={(e) => setSunExposure(e.target.value as any)}
                  className="w-full text-xs font-semibold border border-slate-200 p-2 rounded-lg bg-white outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="low">Shaded / Low Sun</option>
                  <option value="medium">Normal / East-West</option>
                  <option value="high">Direct South / Top Floor</option>
                </select>
              </div>

              {/* Kitchen active */}
              <div className="space-y-1 flex flex-col justify-between">
                <label className="text-[10px] font-bold text-slate-500 uppercase block select-none">Kitchen / Pantry?</label>
                <div className="flex items-center h-10">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isKitchen}
                      onChange={(e) => setIsKitchen(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-indigo-650"></div>
                    <span className="ml-2 text-xs font-bold text-slate-700">{isKitchen ? 'Yes (+4K BTU)' : 'No'}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Room Quantity multiplier */}
            <div className="pt-2 border-t border-slate-100 flex justify-between items-center bg-slate-50/50 -mx-4.5 -mb-4.5 p-3 rounded-b-xl px-4.5">
              <span className="text-[10.5px] font-bold text-slate-500 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                Planning identical installation configurations? Increase quantity multiplier:
              </span>
              <div className="flex items-center gap-2">
                <label className="text-xs font-black text-slate-700">Multiplier Qty:</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={systemQuantity}
                  onChange={(e) => setSystemQuantity(Math.max(1, Number(e.target.value) || 1))}
                  className="w-16 text-center font-black text-xs border border-slate-250 p-1.5 rounded-lg bg-white"
                />
              </div>
            </div>

          </div>

          {/* Section 2: Equipment Selector */}
          <div className="bg-white p-4.5 rounded-xl border border-slate-150 shadow-2xs space-y-4">
            <h4 className="text-[11px] font-black uppercase text-indigo-950 tracking-wider flex items-center gap-1.5 font-mono">
              <Layers className="w-4 h-4 text-indigo-500" />
              2. HVAC Brand Catalogue & Unit Type Lookup
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Unit Type */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">System Architectural Type</label>
                <select
                  value={acType}
                  onChange={(e) => setAcType(e.target.value)}
                  className="w-full text-xs font-bold border border-slate-200 p-2.5 rounded-lg bg-white outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Split AC (High-Wall)">Split AC (Standard High-Wall)</option>
                  <option value="Window AC">Window AC (Compact/Budget)</option>
                  <option value="Cassette AC">Cassette AC (Ceiling Mounted)</option>
                  <option value="Ducted Split">Ducted Split (Central Layout)</option>
                  <option value="Tower AC">Tower AC (Floor-Standing)</option>
                </select>
              </div>

              {/* Efficiency */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Energy Efficiency Model</label>
                <select
                  value={efficiency}
                  onChange={(e) => setEfficiency(e.target.value)}
                  className="w-full text-xs font-bold border border-slate-200 p-2.5 rounded-lg bg-white outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="3-Star Inverter">3-Star Smart Inverter (Balanced)</option>
                  <option value="5-Star Inverter">5-Star High-Efficiency Inverter (+18%)</option>
                  <option value="Non-Inverter">Non-Inverter Standard Model (-15%)</option>
                </select>
              </div>

              {/* Brand Catalogue */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Preferred Brand Catalogue</label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full text-xs font-bold border border-slate-200 p-2.5 rounded-lg bg-white outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Voltas">Voltas (Base - Tata Enterprise)</option>
                  <option value="Daikin">Daikin (Premium Japanese - +12%)</option>
                  <option value="Blue Star">Blue Star (Reliable Commercial - +6%)</option>
                  <option value="Carrier">Carrier (Heavy-Duty US Standard - +8%)</option>
                  <option value="O General">O General (Super Premium Import - +25%)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Accessory Options */}
          <div className="bg-white p-4.5 rounded-xl border border-slate-150 shadow-2xs space-y-4">
            <h4 className="text-[11px] font-black uppercase text-indigo-950 tracking-wider flex items-center gap-1.5 font-mono">
              <Wrench className="w-4 h-4 text-indigo-500" />
              3. Custom Bill-of-Materials (BOM) & Installation Parameters
            </h4>

            {/* Sliders for cables & pipes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Copper piping slider */}
              <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="flex justify-between text-[11px] font-bold text-slate-600">
                  <span>Refrigerant Copper Piping</span>
                  <span className="font-mono text-indigo-700 font-extrabold">{copperPiping}m</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="30"
                  step="1"
                  value={copperPiping}
                  onChange={(e) => setCopperPiping(Number(e.target.value))}
                  className="w-full accent-indigo-650 h-1 bg-slate-200 rounded-lg cursor-pointer"
                />
                <span className="text-[9.5px] text-slate-400 block mt-0.5">3m included in base. Extra: ₹950/m</span>
              </div>

              {/* Drain piping slider */}
              <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="flex justify-between text-[11px] font-bold text-slate-600">
                  <span>PVC Drain Piping</span>
                  <span className="font-mono text-indigo-700 font-extrabold">{drainPiping}m</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={drainPiping}
                  onChange={(e) => setDrainPiping(Number(e.target.value))}
                  className="w-full accent-indigo-650 h-1 bg-slate-200 rounded-lg cursor-pointer"
                />
                <span className="text-[9.5px] text-slate-400 block mt-0.5">Professional grade PVC: ₹150/m</span>
              </div>

              {/* Wiring cable slider */}
              <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="flex justify-between text-[11px] font-bold text-slate-600">
                  <span>3-Core Power Wiring</span>
                  <span className="font-mono text-indigo-700 font-extrabold">{wiringCable}m</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="1"
                  value={wiringCable}
                  onChange={(e) => setWiringCable(Number(e.target.value))}
                  className="w-full accent-indigo-650 h-1 bg-slate-200 rounded-lg cursor-pointer"
                />
                <span className="text-[9.5px] text-slate-400 block mt-0.5">PVC conduit wiring layout: ₹180/m</span>
              </div>
            </div>

            {/* Checkboxes for bracket, stabilizer, labor */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              {/* Bracket */}
              <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50/50 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasBracket}
                  disabled={acType === 'Window AC'}
                  onChange={(e) => setHasBracket(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 disabled:opacity-40"
                />
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-800 block">Condenser Wall Bracket</span>
                  <span className="text-[10px] text-slate-400 block">₹1,500 standard cost</span>
                </div>
              </label>

              {/* Stabilizer */}
              <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50/50 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasStabilizer}
                  onChange={(e) => setHasStabilizer(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                />
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-800 block">Voltage Stabilizer</span>
                  <span className="text-[10px] text-slate-400 block">₹2,800 unit stabilizer</span>
                </div>
              </label>

              {/* Installation Labor */}
              <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50/50 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasLabor}
                  onChange={(e) => setHasLabor(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                />
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-800 block">Installation Labor</span>
                  <span className="text-[10px] text-slate-400 block">₹2,200 testing & labor</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: READOUTS & LIVE BOM (4-cols on lg) */}
        <div className="lg:col-span-4 space-y-5 flex flex-col">
          {/* Section 4: Live Thermodynamic Diagnostic Ring */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md border border-slate-800 relative overflow-hidden flex-1 flex flex-col justify-between">
            <div className="absolute right-0 top-0 -mr-6 -mt-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none"></div>
            
            <div className="space-y-3.5">
              <span className="text-[9.5px] uppercase font-black font-mono tracking-wider text-indigo-400 block flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Live Thermodynamic Diagnostic
              </span>

              {/* Tonnage & BTU Display */}
              <div className="bg-slate-800/65 p-4 rounded-xl border border-slate-700/80 text-center space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block">Required Capacity</span>
                <strong className="text-3xl font-black font-mono text-indigo-400 tracking-tight block">
                  {heatLoadBreakdown.recommendedTonnage.toFixed(1)} <span className="text-base font-medium">Ton</span>
                </strong>
                <div className="flex justify-center gap-3 text-[10.5px] font-mono text-slate-400 font-semibold pt-1 border-t border-slate-700 mt-1">
                  <span>Heat Load: {heatLoadBreakdown.totalBtu.toLocaleString()} BTU/hr</span>
                  <span>Calculated: {heatLoadBreakdown.calculatedTonnage.toFixed(2)} TR</span>
                </div>
              </div>

              {/* Thermal breakdown percentages list */}
              <div className="text-[11px] font-medium space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Thermal Source Contributions:</span>
                
                {/* Base Area Contribution */}
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                    Base Area ({area} sq ft)
                  </span>
                  <span className="font-mono text-slate-400">{heatLoadBreakdown.baseBtu.toLocaleString()} BTU</span>
                </div>

                {/* Height Contribution */}
                {heatLoadBreakdown.heightBtu > 0 && (
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                      Ceiling Height ({height}ft)
                    </span>
                    <span className="font-mono text-slate-400">+{heatLoadBreakdown.heightBtu.toLocaleString()} BTU</span>
                  </div>
                )}

                {/* Occupants Contribution */}
                {heatLoadBreakdown.occupantBtu > 0 && (
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                      Occupants ({occupants} Pax)
                    </span>
                    <span className="font-mono text-slate-400">+{heatLoadBreakdown.occupantBtu.toLocaleString()} BTU</span>
                  </div>
                )}

                {/* Appliances Contribution */}
                {heatLoadBreakdown.applianceBtu > 0 && (
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                      Electronic Devices
                    </span>
                    <span className="font-mono text-slate-400">+{heatLoadBreakdown.applianceBtu.toLocaleString()} BTU</span>
                  </div>
                )}

                {/* Kitchen Contribution */}
                {heatLoadBreakdown.kitchenBtu > 0 && (
                  <div className="flex justify-between items-center text-rose-300">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                      Pantry/Kitchen Heat
                    </span>
                    <span className="font-mono">+{heatLoadBreakdown.kitchenBtu.toLocaleString()} BTU</span>
                  </div>
                )}

                {/* Sun Exposure Modifier */}
                {heatLoadBreakdown.sunAdjustmentBtu !== 0 && (
                  <div className={`flex justify-between items-center ${heatLoadBreakdown.sunAdjustmentBtu > 0 ? 'text-amber-300' : 'text-teal-300'}`}>
                    <span className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${heatLoadBreakdown.sunAdjustmentBtu > 0 ? 'bg-amber-400' : 'bg-teal-400'}`}></span>
                      Sun Adjustment ({sunExposure === 'high' ? '+20%' : '-10%'})
                    </span>
                    <span className="font-mono">{heatLoadBreakdown.sunAdjustmentBtu > 0 ? '+' : ''}{heatLoadBreakdown.sunAdjustmentBtu.toLocaleString()} BTU</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bill of Materials Live Aggregation Box */}
            <div className="border-t border-slate-800 pt-4 mt-4 space-y-3.5">
              <span className="text-[9.5px] uppercase font-black font-mono tracking-wider text-indigo-400 block">
                Commercial Pricing Estimate
              </span>

              {/* Items Summary list */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs font-sans">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span className="font-mono text-slate-200 font-bold">{formatINR(billOfMaterials.subtotal)}</span>
                </div>

                {/* GST Selector inside summary card */}
                <div className="flex justify-between items-center text-slate-400 gap-2 text-[11px]">
                  <span className="flex items-center gap-1">
                    GST Rate:
                    <select
                      value={taxRate}
                      onChange={(e) => setTaxRate(Number(e.target.value))}
                      className="text-[10px] bg-slate-800 text-slate-200 border border-slate-700 p-1 rounded font-bold"
                    >
                      <option value="18">18% GST (Corp)</option>
                      <option value="28">28% GST (Luxury)</option>
                      <option value="0">0% GST (Exempt)</option>
                    </select>
                  </span>
                  <span className="font-mono text-slate-200 font-bold">{formatINR(billOfMaterials.taxAmount)}</span>
                </div>

                {/* Custom discount picker */}
                <div className="flex justify-between items-center text-slate-400 gap-2 text-[11px] pt-1">
                  <span className="flex items-center gap-1">
                    Discount (₹):
                    <input
                      type="number"
                      min="0"
                      value={customDiscount}
                      onChange={(e) => setCustomDiscount(Math.max(0, Number(e.target.value) || 0))}
                      className="w-16 text-center text-[10px] bg-slate-800 text-slate-200 border border-slate-700 p-1 rounded font-bold font-mono"
                    />
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">-{formatINR(customDiscount)}</span>
                </div>

                <div className="flex justify-between items-center text-white border-t border-slate-800 pt-2.5 mt-1.5">
                  <strong className="text-slate-300 font-extrabold tracking-tight">Estimated Total:</strong>
                  <span className="text-md font-black font-mono text-indigo-400">{formatINR(billOfMaterials.grandTotal)}</span>
                </div>
              </div>

              {/* Core export button */}
              <button
                onClick={handleExport}
                className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-black text-xs p-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer border border-indigo-550"
              >
                <FileSpreadsheet className="w-4 h-4" />
                {applyLabel}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* FOOTER: Itemized Ledger Preview */}
      <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-3xs space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[10.5px] font-black uppercase text-indigo-950 tracking-wider flex items-center gap-1.5 font-mono">
            <Compass className="w-4 h-4 text-indigo-500" />
            Generated Bill of Materials (BOM) Itemization Preview
          </span>
          <span className="text-[10px] text-slate-400 font-bold">({billOfMaterials.itemsList.length} items to export)</span>
        </div>

        <div className="overflow-x-auto border border-slate-150 rounded-lg">
          <table className="w-full text-left font-sans text-[11px] border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-bold text-slate-500 uppercase font-mono">
                <th className="p-2.5 pl-3">Itemized Product / Service Line description</th>
                <th className="p-2.5 w-16 text-center">Unit</th>
                <th className="p-2.5 w-20 text-right">Unit Price</th>
                <th className="p-2.5 w-14 text-center">Qty</th>
                <th className="p-2.5 w-24 text-right pr-3">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {billOfMaterials.itemsList.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="p-2 pl-3 text-slate-750 font-semibold">{item.description}</td>
                  <td className="p-2 text-center text-slate-400 uppercase font-mono text-[9.5px]">{item.unit}</td>
                  <td className="p-2 text-right text-slate-600 font-mono">{formatINR(item.unit_price)}</td>
                  <td className="p-2 text-center text-slate-700 font-mono font-bold">{item.quantity}</td>
                  <td className="p-2 text-right text-indigo-950 font-mono font-black pr-3">{formatINR(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
