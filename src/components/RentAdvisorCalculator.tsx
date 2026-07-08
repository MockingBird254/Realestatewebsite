/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Calculator, Wallet, Building, TrendingUp, AlertCircle, 
  CheckCircle2, Coins, Percent, FileText, HelpCircle, ArrowRight
} from 'lucide-react';

interface RentAdvisorCalculatorProps {
  initialPrice?: number;
  initialRent?: number;
}

export default function RentAdvisorCalculator({ initialPrice = 6500000, initialRent = 25000 }: RentAdvisorCalculatorProps) {
  const [activeTab, setActiveTab] = useState<'tenant' | 'landlord'>('tenant');

  // --- Tenant Calculator State ---
  const [monthlyIncome, setMonthlyIncome] = useState<number>(80000);
  const [targetRent, setTargetRent] = useState<number>(initialRent);
  const [depositMonths, setDepositMonths] = useState<number>(1); // Usually 1 month in Kenya
  const [utilityDeposit, setUtilityDeposit] = useState<boolean>(true); // Water & electricity tokens (usually ~KES 5,000 total)
  const [leaseFee, setLeaseFee] = useState<boolean>(true); // Standard KES 2,000 agency legal agreement fee

  // Tenant Outputs
  const [rentToIncomeRatio, setRentToIncomeRatio] = useState<number>(0);
  const [upfrontTotal, setUpfrontTotal] = useState<number>(0);
  const [securityDepositCost, setSecurityDepositCost] = useState<number>(0);
  const [utilityCost, setUtilityCost] = useState<number>(0);
  const [leaseAgreementCost, setLeaseAgreementCost] = useState<number>(0);

  // --- Landlord Calculator State ---
  const [propertyCost, setPropertyCost] = useState<number>(initialPrice);
  const [expectedRent, setExpectedRent] = useState<number>(initialRent);
  const [monthlyMaintenance, setMonthlyMaintenance] = useState<number>(3000); // Service charge, garbage, security

  // Landlord Outputs
  const [grossYield, setGrossYield] = useState<number>(0);
  const [netYield, setNetYield] = useState<number>(0);
  const [paybackPeriod, setPaybackPeriod] = useState<number>(0);

  // Sync state if initial rent changes (e.g. user selected a property)
  useEffect(() => {
    if (initialRent) {
      setTargetRent(initialRent);
      setExpectedRent(initialRent);
    }
    if (initialPrice) {
      setPropertyCost(initialPrice);
    }
  }, [initialRent, initialPrice]);

  // Tenant Calculations
  useEffect(() => {
    const ratio = monthlyIncome > 0 ? (targetRent / monthlyIncome) * 100 : 0;
    setRentToIncomeRatio(ratio);

    const secDeposit = targetRent * depositMonths;
    setSecurityDepositCost(secDeposit);

    const utilCost = utilityDeposit ? 1000 : 0;
    setUtilityCost(utilCost);

    const lFeeCost = leaseFee ? 500 : 0;
    setLeaseAgreementCost(lFeeCost);

    setUpfrontTotal(targetRent + secDeposit + utilCost + lFeeCost);
  }, [monthlyIncome, targetRent, depositMonths, utilityDeposit, leaseFee]);

  // Landlord Calculations
  useEffect(() => {
    if (propertyCost > 0) {
      const annualGrossRent = expectedRent * 12;
      const gYield = (annualGrossRent / propertyCost) * 100;
      setGrossYield(gYield);

      const annualExpenses = (monthlyMaintenance * 12);
      const annualNetRent = Math.max(0, annualGrossRent - annualExpenses);
      const nYield = (annualNetRent / propertyCost) * 100;
      setNetYield(nYield);

      const years = annualGrossRent > 0 ? propertyCost / annualGrossRent : 0;
      setPaybackPeriod(years);
    } else {
      setGrossYield(0);
      setNetYield(0);
      setPaybackPeriod(0);
    }
  }, [propertyCost, expectedRent, monthlyMaintenance]);

  // Tenant Affordability Advice
  const getAffordabilityTier = () => {
    if (rentToIncomeRatio <= 30) {
      return {
        label: "Budget Safe ✅",
        color: "bg-emerald-50 text-emerald-800 border-emerald-200",
        barColor: "bg-emerald-500",
        advice: "Healthy allocation! This rental matches ideal financial guidelines leaving enough room for savings and utilities."
      };
    } else if (rentToIncomeRatio <= 45) {
      return {
        label: "Moderate Strain ⚠️",
        color: "bg-amber-50 text-amber-800 border-amber-200",
        barColor: "bg-amber-500",
        advice: "Slightly tight. Over 30% of your income is allocated to rent. We advise reviewing non-essential expenses."
      };
    } else {
      return {
        label: "Overstretched 🚨",
        color: "bg-red-50 text-red-800 border-red-200",
        barColor: "bg-red-500",
        advice: "High risk! Spending over 45% of income on rent leaves you vulnerable to financial emergencies. Consider a co-tenant or more affordable options."
      };
    }
  };

  const affordabilityTier = getAffordabilityTier();

  // Landlord Yield rating
  const getYieldRating = () => {
    if (netYield >= 8) {
      return {
        label: "Premium Yield ⭐⭐⭐",
        color: "bg-emerald-50 text-emerald-800 border-emerald-200",
        advice: "Excellent return on investment! Benchmark net yields in Kenya average 5.5% - 7%. This property is highly profitable."
      };
    } else if (netYield >= 5) {
      return {
        label: "Strong Performance ⭐⭐",
        color: "bg-blue-50 text-blue-800 border-blue-200",
        advice: "Solid and reliable investment. Matches or exceeds standard inflation-beating urban letting yields."
      };
    } else {
      return {
        label: "Low Return ⭐",
        color: "bg-gray-100 text-gray-700 border-gray-200",
        advice: "Moderate yield. Consider negotiating property purchase price or re-verifying rental market demand to optimize rent."
      };
    }
  };

  const yieldRating = getYieldRating();

  return (
    <div id="rent-advisor-calculator" className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden p-6 md:p-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-gray-100 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-emerald-900/10 rounded-xl flex items-center justify-center text-emerald-900">
            <Calculator className="w-5 h-5 text-gold-500" />
          </div>
          <div>
            <h3 className="font-display font-black text-lg text-emerald-900 uppercase tracking-tight">Rent & Yield Advisor</h3>
            <p className="text-xs text-gray-500">Dual-engine budgeting advisor for Kenyan letting tenants & real estate landlords</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('tenant')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
              activeTab === 'tenant' 
                ? 'bg-emerald-900 text-white shadow-md' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" /> Tenant Advisor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('landlord')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
              activeTab === 'landlord' 
                ? 'bg-emerald-900 text-white shadow-md' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Building className="w-3.5 h-3.5" /> Landlord Yield
          </button>
        </div>
      </div>

      {activeTab === 'tenant' ? (
        /* ================= TENANT AFFORDABILITY CALCULATOR ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-200">
          
          {/* Inputs Panel */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Income Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Your Monthly Net Income (KES)</label>
                <span className="text-sm font-extrabold text-emerald-950">KES {monthlyIncome.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min={15000} 
                max={500000} 
                step={5000}
                value={monthlyIncome} 
                onChange={(e) => setMonthlyIncome(parseInt(e.target.value))}
                className="w-full accent-emerald-900 cursor-pointer h-1.5 bg-gray-100 rounded-lg"
              />
              <div className="flex justify-between text-[9px] text-gray-400 mt-1 uppercase font-bold">
                <span>KES 15K</span>
                <span>KES 500K+</span>
              </div>
            </div>

            {/* Target Rent Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Target Monthly Rent (KES)</label>
                <span className="text-sm font-extrabold text-emerald-900">KES {targetRent.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min={5000} 
                max={150000} 
                step={2500}
                value={targetRent} 
                onChange={(e) => setTargetRent(parseInt(e.target.value))}
                className="w-full accent-emerald-900 cursor-pointer h-1.5 bg-gray-100 rounded-lg"
              />
              <div className="flex justify-between text-[9px] text-gray-400 mt-1 uppercase font-bold">
                <span>KES 5K (Single Room)</span>
                <span>KES 150K (Premium Penthouse)</span>
              </div>
            </div>

            {/* Deposits Customizer */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-gold-500" /> Upfront Kenyan Letting Terms
              </h4>
              
              {/* Deposit Months Select */}
              <div className="flex items-center justify-between mb-4 border-b border-gray-200/60 pb-3">
                <div>
                  <span className="block text-xs font-bold text-gray-700">Security Deposit Months</span>
                  <span className="text-[9px] text-gray-400">Standard letting rules require refundable deposits</span>
                </div>
                <div className="flex gap-1 bg-white p-1 rounded-lg border border-gray-200">
                  {[1, 2].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setDepositMonths(m)}
                      className={`px-3 py-1 text-xs font-extrabold rounded-md cursor-pointer ${depositMonths === m ? 'bg-emerald-900 text-white' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                      {m} Mon
                    </button>
                  ))}
                </div>
              </div>

              {/* Utility & Lease Fees Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-start gap-2.5 bg-white p-3 rounded-lg border border-gray-200/60 cursor-pointer hover:border-gray-300">
                  <input 
                    type="checkbox" 
                    checked={utilityDeposit} 
                    onChange={(e) => setUtilityDeposit(e.target.checked)}
                    className="mt-0.5 rounded border-gray-300 accent-emerald-900"
                  />
                  <div>
                    <span className="block text-xs font-bold text-gray-700">Utility Deposits</span>
                    <span className="text-[9px] text-gray-400">KES 1,000 (Water/Tokens)</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 bg-white p-3 rounded-lg border border-gray-200/60 cursor-pointer hover:border-gray-300">
                  <input 
                    type="checkbox" 
                    checked={leaseFee} 
                    onChange={(e) => setLeaseFee(e.target.checked)}
                    className="mt-0.5 rounded border-gray-300 accent-emerald-900"
                  />
                  <div>
                    <span className="block text-xs font-bold text-gray-700">Legal Agreement Fee</span>
                    <span className="text-[9px] text-gray-400">KES 500 (Lease stamp)</span>
                  </div>
                </label>
              </div>
            </div>

          </div>

          {/* Outputs / Advice Panel */}
          <div className="lg:col-span-5 bg-emerald-950/5 rounded-2xl border border-emerald-900/5 p-6 flex flex-col justify-between">
            
            {/* Income ratio dial */}
            <div className="text-center pb-5 border-b border-gray-200/60">
              <span className="text-[10px] uppercase font-black tracking-widest text-emerald-800 bg-emerald-900/10 px-3 py-1 rounded-full mb-2 inline-block">
                Income Allocation Ratio
              </span>
              <h2 className="text-3xl font-display font-black text-emerald-900">
                {rentToIncomeRatio.toFixed(1)}%
              </h2>
              
              {/* Progress bar visual indicator */}
              <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden mt-3 max-w-xs mx-auto border border-white">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${affordabilityTier.barColor}`} 
                  style={{ width: `${Math.min(100, rentToIncomeRatio)}%` }}
                />
              </div>

              {/* Status Badge */}
              <div className={`mt-3 py-1 px-3 text-[10px] font-extrabold uppercase rounded-lg border inline-block ${affordabilityTier.color}`}>
                {affordabilityTier.label}
              </div>

              <p className="text-[11px] text-gray-600 mt-2 leading-relaxed italic max-w-xs mx-auto">
                "{affordabilityTier.advice}"
              </p>
            </div>

            {/* Cost breakdown */}
            <div className="py-5 flex flex-col gap-3 text-xs border-b border-gray-200/60">
              <h4 className="font-display font-black text-emerald-900 text-[10px] uppercase tracking-wider">Letting Upfront Budget Required</h4>
              
              <div className="flex justify-between items-center text-gray-600">
                <span>First Month's Rent</span>
                <span className="font-extrabold text-gray-900">KES {targetRent.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center text-gray-600">
                <span>Refundable Security Deposit ({depositMonths} Month)</span>
                <span className="font-extrabold text-gray-900">KES {securityDepositCost.toLocaleString()}</span>
              </div>

              {utilityDeposit && (
                <div className="flex justify-between items-center text-gray-600">
                  <span>Water & Power Tokens Deposits</span>
                  <span className="font-extrabold text-gray-900">KES {utilityCost.toLocaleString()}</span>
                </div>
              )}

              {leaseFee && (
                <div className="flex justify-between items-center text-gray-600">
                  <span>Lease Agreement Filing & Stamp</span>
                  <span className="font-extrabold text-gray-900">KES {leaseAgreementCost.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Total Budget Needed */}
            <div className="bg-emerald-900 text-white p-4 rounded-xl border border-emerald-950 shadow mt-5 flex justify-between items-center">
              <div>
                <p className="text-[9px] text-gold-400 uppercase tracking-widest font-black">Estimated Upfront Capital</p>
                <p className="text-[11px] text-gray-300">Required prior to keys handover</p>
              </div>
              <h3 className="font-display font-black text-base text-gold-500">
                KES {upfrontTotal.toLocaleString()}
              </h3>
            </div>

          </div>

        </div>
      ) : (
        /* ================= LANDLORD INVESTMENT YIELD CALCULATOR ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-200">
          
          {/* Inputs Panel */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Property Cost Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Property Acquisition / Building Cost (KES)</label>
                <span className="text-sm font-extrabold text-emerald-950">KES {propertyCost.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min={500000} 
                max={100000000} 
                step={500000}
                value={propertyCost} 
                onChange={(e) => setPropertyCost(parseInt(e.target.value))}
                className="w-full accent-emerald-900 cursor-pointer h-1.5 bg-gray-100 rounded-lg"
              />
              <div className="flex justify-between text-[9px] text-gray-400 mt-1 uppercase font-bold">
                <span>KES 500K (Cheap Shell)</span>
                <span>KES 100M (Commercial / Estate)</span>
              </div>
            </div>

            {/* Rent Rate Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Expected Monthly Rent Income (KES)</label>
                <span className="text-sm font-extrabold text-emerald-950">KES {expectedRent.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min={3000} 
                max={5000000} 
                step={10000}
                value={expectedRent} 
                onChange={(e) => setExpectedRent(parseInt(e.target.value))}
                className="w-full accent-emerald-900 cursor-pointer h-1.5 bg-gray-100 rounded-lg"
              />
              <div className="flex justify-between text-[9px] text-gray-400 mt-1 uppercase font-bold">
                <span>KES 3K</span>
                <span>KES 5M</span>
              </div>
            </div>

            {/* Monthly Operating Expenses (Service Charge, Garbage, Guard, Repairs) */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Est. Monthly Service, Repairs & Maintenance (KES)</label>
                <span className="text-xs font-bold text-gray-700">KES {monthlyMaintenance.toLocaleString()} / month</span>
              </div>
              <input 
                type="range" 
                min={0} 
                max={1000000} 
                step={5000}
                value={monthlyMaintenance} 
                onChange={(e) => setMonthlyMaintenance(parseInt(e.target.value))}
                className="w-full accent-emerald-900 cursor-pointer h-1.5 bg-gray-100 rounded-lg"
              />
              <div className="flex justify-between text-[9px] text-gray-400 mt-1 uppercase font-bold">
                <span>KES 0 (Self-managed)</span>
                <span>KES 1M (High-scale Repairs / Services)</span>
              </div>
            </div>

            {/* Kenya letting statistics advice box */}
            <div className="bg-emerald-900/5 border border-emerald-900/10 p-4 rounded-xl flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-gold-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-1">Kenyan Property Yield Standards</h4>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Residential letting yields in fast-developing Murang'a and Kenol Town typically range from <strong>5.8% to 7.2%</strong>. 
                  Commercial workspaces can yield higher returns up to <strong>9.5%</strong>.
                </p>
              </div>
            </div>

          </div>

          {/* Outputs / Yield Panel */}
          <div className="lg:col-span-5 bg-emerald-950/5 rounded-2xl border border-emerald-900/5 p-6 flex flex-col justify-between">
            
            {/* Rent Yields Dual Row */}
            <div className="grid grid-cols-2 gap-4 pb-5 border-b border-gray-200/60">
              
              <div className="text-center p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                <span className="text-[9px] uppercase font-extrabold text-gray-400 tracking-wider flex items-center justify-center gap-1">
                  <Percent className="w-3 h-3 text-gold-500" /> Gross Yield
                </span>
                <h3 className="text-xl font-display font-black text-emerald-900 mt-1">
                  {grossYield.toFixed(2)}%
                </h3>
                <span className="text-[8px] text-gray-400">Excludes maintenance expenses</span>
              </div>

              <div className="text-center p-3 bg-white rounded-xl border border-emerald-100 shadow-sm">
                <span className="text-[9px] uppercase font-extrabold text-emerald-800 tracking-wider flex items-center justify-center gap-1">
                  <TrendingUp className="w-3 h-3 text-gold-500" /> Net Yield
                </span>
                <h3 className="text-xl font-display font-black text-emerald-950 mt-1">
                  {netYield.toFixed(2)}%
                </h3>
                <span className="text-[8px] text-emerald-800 font-semibold">With service costs accounted</span>
              </div>

            </div>

            {/* Rating Box */}
            <div className="py-5 border-b border-gray-200/60 text-center">
              <span className="text-[9px] uppercase font-bold text-gray-400 tracking-widest block mb-1">Unique Merchants Rating</span>
              <div className={`py-1 px-3 text-[10px] font-extrabold uppercase rounded-lg border inline-block ${yieldRating.color}`}>
                {yieldRating.label}
              </div>
              <p className="text-[11px] text-gray-600 mt-2 leading-relaxed italic max-w-xs mx-auto">
                "{yieldRating.advice}"
              </p>
            </div>

            {/* Financial indicators breakdown */}
            <div className="py-5 flex flex-col gap-3 text-xs">
              <div className="flex justify-between items-center text-gray-600">
                <span>Annualized Gross Rent Income</span>
                <span className="font-extrabold text-gray-900">KES {(expectedRent * 12).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Annualized Maintenance Deductions</span>
                <span className="font-extrabold text-gray-900">KES {(monthlyMaintenance * 12).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Est. Payback Break-Even Period</span>
                <span className="font-extrabold text-emerald-900">{paybackPeriod.toFixed(1)} Years</span>
              </div>
            </div>

            {/* Contact Advice CTA */}
            <div className="bg-emerald-900 text-white p-3.5 rounded-xl border border-emerald-950 shadow mt-3 flex justify-between items-center">
              <div>
                <p className="text-[9px] text-gold-400 uppercase tracking-widest font-black">Want to Maximize Yield?</p>
                <p className="text-[10px] text-gray-300">Request a structural rent review</p>
              </div>
              <a 
                href="#rent-advisor-calculator" 
                onClick={(e) => {
                  e.preventDefault();
                  const btn = document.getElementById('describe-plot-sourcing-floater') || document.querySelector('[onClick*="setIsRequestModalOpen"]');
                  if (btn) (btn as HTMLElement).click();
                }}
                className="bg-gold-500 hover:bg-gold-600 text-emerald-950 font-black px-3 py-1.5 text-[10px] rounded-lg uppercase tracking-wider transition-all flex items-center gap-1 shrink-0 cursor-pointer"
              >
                Let Agent Help <ArrowRight className="w-3 h-3" />
              </a>
            </div>

          </div>

        </div>
      )}

      {/* Legal disclaimer */}
      <div className="text-[9px] text-gray-400 text-center leading-relaxed mt-5 border-t border-gray-100 pt-4 flex items-center gap-1.5 justify-center">
        <AlertCircle className="w-3.5 h-3.5 text-gold-500" />
        <span>Calculations are optimized for central Kenya property frameworks. Values are estimates, not guaranteed legal binding contracts.</span>
      </div>

    </div>
  );
}
