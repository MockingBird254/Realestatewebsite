/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Calculator, DollarSign, Percent, Calendar, 
  TrendingUp, Award, ShieldAlert, FileText, Info
} from 'lucide-react';

interface MortgageCalculatorProps {
  initialPrice?: number;
  initialType?: 'buy' | 'rent' | 'commercial' | 'land';
}

export default function MortgageCalculator({ initialPrice = 12000000, initialType = 'buy' }: MortgageCalculatorProps) {
  const [propertyPrice, setPropertyPrice] = useState<number>(initialPrice);
  const [deposit, setDeposit] = useState<number>(initialPrice * 0.2); // 20% default
  const [interestRate, setInterestRate] = useState<number>(13.5); // Average commercial mortgage rate in Kenya
  const [loanPeriod, setLoanPeriod] = useState<number>(15); // Average years
  const [isUrban, setIsUrban] = useState<boolean>(true); // For Stamp Duty: 4% urban vs 2% rural agricultural

  // Outputs
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  const [stampDuty, setStampDuty] = useState<number>(0);
  const [legalFees, setLegalFees] = useState<number>(0);
  const [transferFees, setTransferFees] = useState<number>(0);
  const [totalAcquisition, setTotalAcquisition] = useState<number>(0);
  const [loanAmount, setLoanAmount] = useState<number>(0);

  useEffect(() => {
    // 1. Calculate Loan details
    const principal = propertyPrice - deposit;
    setLoanAmount(principal > 0 ? principal : 0);

    const monthlyRate = (interestRate / 100) / 12;
    const numberOfPayments = loanPeriod * 12;

    if (principal > 0 && monthlyRate > 0) {
      const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
      setMonthlyPayment(isNaN(payment) ? 0 : payment);
    } else {
      setMonthlyPayment(0);
    }

    // 2. Kenyan Land Acquisition Fees
    // Stamp Duty: 4% for urban municipalities (Kenol Town, Thika, Juja), 2% for agricultural rural properties (Makuyu farmland)
    const stamp = propertyPrice * (isUrban ? 0.04 : 0.02);
    setStampDuty(stamp);

    // Legal Fees: 1.5% standard legal agreement drafting (minimum KES 30,000)
    const legal = Math.max(30000, propertyPrice * 0.015);
    setLegalFees(legal);

    // Government Transfer Registration & Valuation costs: ~1% of value
    const transfer = propertyPrice * 0.01;
    setTransferFees(transfer);

    // 3. Total cost of acquiring
    setTotalAcquisition(propertyPrice + stamp + legal + transfer);

  }, [propertyPrice, deposit, interestRate, loanPeriod, isUrban]);

  // Adjust deposit slider limits when property price changes
  const handlePriceChange = (val: number) => {
    setPropertyPrice(val);
    if (deposit > val) {
      setDeposit(val);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden p-6 md:p-8">
      
      {/* Title */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 bg-emerald-900/10 rounded-xl flex items-center justify-center text-emerald-900">
          <Calculator className="w-5 h-5 text-gold-500" />
        </div>
        <div>
          <h3 className="font-display font-extrabold text-lg text-emerald-900 uppercase tracking-tight">Mortgage & Acquisition Calculator</h3>
          <p className="text-xs text-gray-500">Calculate monthly repayment & verified statutory transaction costs in Kenya</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Inputs */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Property Price */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Property Price (KES)</label>
              <span className="text-sm font-extrabold text-emerald-900">KES {propertyPrice.toLocaleString()}</span>
            </div>
            <input 
              type="range" 
              min={100000} 
              max={50000000} 
              step={100000}
              value={propertyPrice} 
              onChange={(e) => handlePriceChange(parseInt(e.target.value))}
              className="w-full accent-emerald-900 cursor-pointer h-1.5 bg-gray-100 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>KES 100K (Plots)</span>
              <span>KES 50M (Premium Residential)</span>
            </div>
          </div>

          {/* Cash Deposit */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Cash Deposit (KES)</label>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] bg-gold-500/10 text-gold-600 px-2 py-0.5 rounded font-extrabold">
                  {((deposit / propertyPrice) * 100).toFixed(0)}% Deposit
                </span>
                <span className="text-xs font-extrabold text-emerald-900">KES {deposit.toLocaleString()}</span>
              </div>
            </div>
            <input 
              type="range" 
              min={0} 
              max={propertyPrice} 
              step={50000}
              value={deposit} 
              onChange={(e) => setDeposit(parseInt(e.target.value))}
              className="w-full accent-emerald-900 cursor-pointer h-1.5 bg-gray-100 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>0% (Full Loan)</span>
              <span>100% (Cash Buyer)</span>
            </div>
          </div>

          {/* Interest Rate & Period row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Interest Rate */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Percent className="w-3 h-3 text-gold-500" /> Annual Interest
                </label>
                <span className="text-xs font-extrabold text-emerald-900">{interestRate}% p.a.</span>
              </div>
              <input 
                type="range" 
                min={8} 
                max={20} 
                step={0.5}
                value={interestRate} 
                onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                className="w-full accent-emerald-900 cursor-pointer h-1 bg-gray-200 rounded-lg"
              />
              <div className="flex justify-between text-[8px] text-gray-400 mt-1">
                <span>8% (Sacco/Govt)</span>
                <span>20% (Commercial Bank)</span>
              </div>
            </div>

            {/* Loan Period */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gold-500" /> Repayment Term
                </label>
                <span className="text-xs font-extrabold text-emerald-900">{loanPeriod} Years</span>
              </div>
              <input 
                type="range" 
                min={1} 
                max={25} 
                step={1}
                value={loanPeriod} 
                onChange={(e) => setLoanPeriod(parseInt(e.target.value))}
                className="w-full accent-emerald-900 cursor-pointer h-1 bg-gray-200 rounded-lg"
              />
              <div className="flex justify-between text-[8px] text-gray-400 mt-1">
                <span>1 Year</span>
                <span>25 Years</span>
              </div>
            </div>

          </div>

          {/* Property Category Location (Urban vs Agricultural) */}
          <div className="bg-emerald-900/5 border border-emerald-900/10 p-4 rounded-xl">
            <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-gold-500" /> Location-Based Stamp Duty Classification
            </h4>
            <p className="text-[11px] text-gray-600 mb-3 leading-relaxed">
              Kenyan land law dictates stamp duties based on property location. 
              Municipal centers incur <strong>4% Stamp Duty</strong>, while rural/agricultural plots incur <strong>2% Stamp Duty</strong>.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsUrban(true)}
                className={`py-2 px-3 text-xs rounded-lg font-bold border transition-all ${isUrban ? 'bg-emerald-900 text-white border-emerald-900' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'}`}
              >
                🏢 Urban Municipality (4%)
              </button>
              <button
                type="button"
                onClick={() => setIsUrban(false)}
                className={`py-2 px-3 text-xs rounded-lg font-bold border transition-all ${!isUrban ? 'bg-emerald-900 text-white border-emerald-900' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'}`}
              >
                🌳 Rural / Agricultural (2%)
              </button>
            </div>
          </div>

        </div>

        {/* Right Side: Repayments & Closing costs Breakdown */}
        <div className="lg:col-span-5 bg-gray-50 rounded-2xl border border-gray-100 p-6 flex flex-col justify-between shadow-inner">
          
          {/* Monthly Repayments Block */}
          <div className="text-center pb-6 border-b border-gray-200">
            <span className="text-[10px] bg-emerald-900 text-white font-extrabold uppercase px-3 py-1 rounded-full tracking-widest inline-block mb-2">
              Monthly Repayment Estimate
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-emerald-900 leading-none">
              KES {Math.round(monthlyPayment).toLocaleString()}
            </h2>
            <p className="text-[10px] text-gray-400 mt-1">Based on loan balance of KES {loanAmount.toLocaleString()}</p>
          </div>

          {/* Acquisition Cost Breakdown */}
          <div className="py-6 flex flex-col gap-3.5 text-xs">
            <h4 className="font-display font-bold text-gray-700 uppercase tracking-wider text-[10px] mb-1">One-Off Statutory Acquisition Costs</h4>
            
            <div className="flex justify-between items-center text-gray-600">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-800" /> Property Base Cost
              </span>
              <span className="font-bold text-gray-800">KES {propertyPrice.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center text-gray-600">
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-800" /> Stamp Duty ({isUrban ? '4%' : '2%'})
              </span>
              <span className="font-bold text-gray-800">KES {stampDuty.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center text-gray-600">
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-800" /> Legal Fees (1.5%)
              </span>
              <span className="font-bold text-gray-800">KES {legalFees.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center text-gray-600">
              <span className="flex items-center gap-1.5">
                <Info className="w-4 h-4 text-emerald-800" /> Registration & Valuation (1%)
              </span>
              <span className="font-bold text-gray-800">KES {transferFees.toLocaleString()}</span>
            </div>
          </div>

          {/* Total Sum Block */}
          <div className="bg-emerald-900 text-white p-4 rounded-xl border border-emerald-950 shadow mt-auto flex justify-between items-center">
            <div>
              <p className="text-[10px] text-gold-400 uppercase tracking-widest font-extrabold">Total Acquisition Cost</p>
              <p className="text-xs text-gray-300">Principal + Closing Duties</p>
            </div>
            <h3 className="font-display font-extrabold text-sm sm:text-base text-gold-500">
              KES {Math.round(totalAcquisition).toLocaleString()}
            </h3>
          </div>

          {/* Legal disclaimer guard */}
          <div className="text-[9px] text-gray-400 text-center leading-relaxed mt-4 flex items-center gap-1 justify-center">
            <ShieldAlert className="w-3.5 h-3.5 text-gold-500" />
            <span>Figures are indicative. Consult our legal department before transaction execution.</span>
          </div>

        </div>

      </div>

    </div>
  );
}
