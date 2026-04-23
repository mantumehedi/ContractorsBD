'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Minus, 
  Search, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownLeft,
  Filter,
  MoreVertical,
  X,
  Camera,
  ChevronDown,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


// Mock Data
const MOCK_PROJECT_STATS = [
  { id: 1, name: 'Jamuna Bridge', income: 485500, expense: 310250, status: 'running' },
  { id: 2, name: 'Delta Tower', income: 1200000, expense: 850000, status: 'running' },
  { id: 3, name: 'Old Bridge', income: 200000, expense: 150000, status: 'completed' },
];


const MOCK_TRANSACTIONS = [
  { id: 1, time: '11:30 AM', nature: 'Cement Purchase', amount: 95000, type: 'expense', project: 'Project Alpha' },
  { id: 2, time: '10:45 AM', nature: 'Client Advance', amount: 150000, type: 'income', project: 'Delta Tower' },
  { id: 3, time: '09:15 AM', nature: 'Labor Wages', amount: 70000, type: 'expense', project: 'Road Work' },
  { id: 4, time: '08:30 AM', nature: 'Material Purchase', amount: 45000, type: 'expense', project: 'Project Beta' },
];

export default function Dashboard() {
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState(['Labor', 'Material', 'Fuel', 'Food', 'Rent', 'Other']);
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);

  
  // Payee/Vendor Logic (Project Scoped)
  const [projectVendors, setProjectVendors] = useState<{ [key: string]: string[] }>({
    'Jamuna Bridge': ['Rakib', 'Sultan Mistri', 'Jasim'],
    'Delta Tower': ['Tousif', 'Vaigna'],
    'Sector 7 Road': ['Arif', 'Rubel']
  });
  const [selectedPayee, setSelectedPayee] = useState('');
  const [customPayee, setCustomPayee] = useState('');
  const [showPayeeInput, setShowPayeeInput] = useState(false);

  // Categories & Subcategories (Now Global & Expandable)
  const [categoryMap, setCategoryMap] = useState<{ [key: string]: { subs: string[], unit: string } }>({
    'Material': { subs: ['Rod', 'Cement', 'Brick', 'Sand', 'Stone', 'Bitumen', 'Kerosene'], unit: 'Unit' },
    'Labor': { subs: ['General Labor', 'Mistri', 'Earth Cutting', 'Drain Cutting', 'Layout'], unit: 'Person' },
    'Vehicle & Fuel': { subs: ['Fuel (Diesel)', 'Lorry Rent', 'Van Rent', 'CNG Fare', 'Roller Rent'], unit: 'Qty/Days' },
    'Office': { subs: ['Official Expense', 'MB Writing', 'Stationery'], unit: 'Lump Sum' },
    'Others': { subs: ['Charity', 'Media', 'Misc'], unit: 'Lump Sum' }
  });

  const [showCustomMain, setShowCustomMain] = useState(false);
  const [customMain, setCustomMain] = useState('');
  const [showCustomSub, setShowCustomSub] = useState(false);
  const [customSub, setCustomSub] = useState('');

  const [isTranslating, setIsTranslating] = useState(false);
  const [dynamicTranslations, setDynamicTranslations] = useState<Record<string, string>>({});


  // Helper to get bilingual display name
  const getDisplayName = (val: string) => {
    // 1. Check static local dictionary first
    if (DATA_TRANSLATIONS[val]) {
      return DATA_TRANSLATIONS[val][lang];
    }

    // 2. Check dynamic translations from API
    if (lang === 'bn') {
      return dynamicTranslations[val] || val;
    } else {
      const enKey = Object.keys(dynamicTranslations).find(key => dynamicTranslations[key] === val);
      return enKey || val;
    }
  };




  const unitMap: { [key: string]: string } = {
    'Rod': 'KG', 'Bitumen': 'Drum', 'Cement': 'Bag', 'Brick': 'Thousand', 
    'Sand': 'CFT', 'Stone': 'CFT', 'Fuel (Diesel)': 'Litre', 'Kerosene': 'Litre',
    'General Labor': 'Person', 'Mistri': 'Person', 'Earth Cutting': 'Job',
    'Lorry Rent': 'Day', 'Roller Rent': 'Day'
  };

  const [mainCategory, setMainCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');

  const [units, setUnits] = useState(['KG', 'Bag', 'Thousand', 'CFT', 'Litre', 'Person', 'Day', 'Drum', 'Lump Sum']);
  const [showUnitInput, setShowUnitInput] = useState(false);
  const [customUnit, setCustomUnit] = useState('');
  
  // Income States
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [incomeAmount, setIncomeAmount] = useState('');
  const [selectedPayer, setSelectedPayer] = useState('');
  const [incomeCategory, setIncomeCategory] = useState('');
  const [incomeSubCategory, setIncomeSubCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [refNo, setRefNo] = useState('');
  
  const incomeCategoryMap: Record<string, string[]> = {
    'Bill': ['1st R.A. Bill', '2nd R.A. Bill', 'Final Bill', 'Extra Work Bill'],
    'Advance': ['Mobilization Fund', 'Site Advance'],
    'Refund': ['Security Money', 'Performance Security'],
    'Sale': ['Empty Bags', 'Scrap Iron', 'Surplus Materials'],
    'Rental': ['Equipment Rental', 'Vehicle Rental']
  };
  
  const [payers, setPayers] = useState(['LGED', 'RHD', 'BWDB', 'Private Owner']);
  const [showPayerInput, setShowPayerInput] = useState(false);
  const [customPayer, setCustomPayer] = useState('');


  // Validation State
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Bilingual Logic
  const [lang, setLang] = useState<'bn' | 'en'>('bn');

  const t = (key: string) => {
    const translations: { [key: string]: { bn: string, en: string } } = {
      app_name: { bn: 'কন্ট্রাক্টরসবিডি', en: 'ContractorsBD' },
      income: { bn: 'আয়', en: 'Income' },
      expense: { bn: 'ব্যয়', en: 'Expense' },
      profit: { bn: 'লাভ/ক্ষতি', en: 'Profit/Loss' },
      add_income: { bn: 'আয়', en: 'Income' },
      add_expense: { bn: 'ব্যয়', en: 'Expense' },
      daily_tx: { bn: 'দৈনিক লেনদেন', en: 'Daily Transactions' },
      today: { bn: 'আজ', en: 'Today' },
      search: { bn: 'লেনদেন খুঁজুন...', en: 'Search transactions...' },
      total_expense: { bn: 'মোট ব্যয় (৳)', en: 'Total Expense (৳)' },
      project: { bn: 'প্রজেক্ট', en: 'Project' },

      payee: { bn: 'পাওনাদার / ভেন্ডর', en: 'Payee / Vendor' },
      main_cat: { bn: 'প্রধান ক্যাটাগরি', en: 'Main Category' },
      sub_cat: { bn: 'সাব ক্যাটাগরি', en: 'Sub Category' },
      quantity: { bn: 'পরিমাণ', en: 'Quantity' },
      unit: { bn: 'ইউনিট', en: 'Unit' },
      desc: { bn: 'বিবরণ / নোট', en: 'Description / Notes' },
      voucher: { bn: 'ভাউচার / মেমো আপলোড', en: 'Attach Voucher / Memo' },
      save: { bn: 'সেভ করুন', en: 'Save' },
      add_new: { bn: '+ নতুন যোগ করুন', en: '+ Add New' },
      validation_error: { bn: 'সবগুলো লাল চিহ্নিত ঘর পূরণ করুন', en: 'Please fill all highlighted fields' },
      
      // Income Specific
      payer: { bn: 'পেয়ার / দাতা', en: 'Payer / Client' },
      income_cat: { bn: 'আয়ের ক্যাটাগরি', en: 'Income Category' },
      pay_method: { bn: 'পেমেন্ট মাধ্যম', en: 'Payment Method' },
      ref_no: { bn: 'চেক / রেফারেন্স নং', en: 'Ref / Cheque No' },
      total_income: { bn: 'মোট আয় (৳)', en: 'Total Income (৳)' },
      
      dashboard: { bn: 'ড্যাশবোর্ড', en: 'Dashboard' },

      projects: { bn: 'প্রজেক্টসমূহ', en: 'Projects' },
      reports: { bn: 'রিপোর্ট', en: 'Reports' },
      settings: { bn: 'সেটিংস', en: 'Settings' }
    };

    return translations[key]?.[lang] || key;
  };

  // Local Dictionary for Data Values (Projects, Categories, Units)
  const DATA_TRANSLATIONS: Record<string, { bn: string, en: string }> = {
    // Projects
    'Jamuna Bridge': { bn: 'যমুনা সেতু', en: 'Jamuna Bridge' },
    'Delta Tower': { bn: 'ডেল্টা টাওয়ার', en: 'Delta Tower' },
    'Sector 7 Road': { bn: 'সেক্টর ৭ রোড', en: 'Sector 7 Road' },
    
    // Categories
    'Material': { bn: 'মালামাল', en: 'Material' },
    'Labor': { bn: 'লেবার / শ্রমিক', en: 'Labor' },
    'Vehicle & Fuel': { bn: 'যানবাহন ও জ্বালানি', en: 'Vehicle & Fuel' },
    'Office': { bn: 'অফিস', en: 'Office' },
    'Others': { bn: 'অন্যান্য', en: 'Others' },
    
    // Sub-Categories (Materials)
    'Rod': { bn: 'রড', en: 'Rod' },
    'Cement': { bn: 'সিমেন্ট', en: 'Cement' },
    'Brick': { bn: 'ইট', en: 'Brick' },
    'Sand': { bn: 'বালু', en: 'Sand' },
    'Stone': { bn: 'পাথর', en: 'Stone' },
    'Bitumen': { bn: 'বিটুমিন', en: 'Bitumen' },
    'Kerosene': { bn: 'কেরোসিন', en: 'Kerosene' },
    
    // Sub-Categories (Labor)
    'General Labor': { bn: 'সাধারণ লেবার', en: 'General Labor' },
    'Mistri': { bn: 'মিস্ত্রি', en: 'Mistri' },
    'Earth Cutting': { bn: 'মাটি কাটা', en: 'Earth Cutting' },
    'Drain Cutting': { bn: 'ড্রেন কাটা', en: 'Drain Cutting' },
    'Layout': { bn: 'লে-আউট', en: 'Layout' },
    
    // Sub-Categories (Vehicle/Fuel)
    'Fuel (Diesel)': { bn: 'ডিজেল', en: 'Fuel (Diesel)' },
    'Lorry Rent': { bn: 'লরি ভাড়া', en: 'Lorry Rent' },
    'Van Rent': { bn: 'ভ্যান ভাড়া', en: 'Van Rent' },
    'CNG Fare': { bn: 'সিএনজি ভাড়া', en: 'CNG Fare' },
    'Roller Rent': { bn: 'রোলার ভাড়া', en: 'Roller Rent' },
    
    // Sub-Categories (Office)
    'Official Expense': { bn: 'অফিস খরচ', en: 'Official Expense' },
    'MB Writing': { bn: 'এমবি রাইটিং', en: 'MB Writing' },
    'Stationery': { bn: 'স্টেশনারি', en: 'Stationery' },
    
    // Sub-Categories (Others)
    'Charity': { bn: 'দান', en: 'Charity' },
    'Media': { bn: 'মিডিয়া', en: 'Media' },
    'Misc': { bn: 'বিবিধ', en: 'Misc' },
    
    // Units
    'KG': { bn: 'কেজি', en: 'KG' },

    'Bag': { bn: 'ব্যাগ', en: 'Bag' },
    'Thousand': { bn: 'হাজার', en: 'Thousand' },
    'CFT': { bn: 'সিএফটি', en: 'CFT' },
    'Litre': { bn: 'লিটার', en: 'Litre' },
    'Person': { bn: 'জন', en: 'Person' },
    'Day': { bn: 'দিন', en: 'Day' },
    'Drum': { bn: 'ড্রাম', en: 'Drum' },
    'Lump Sum': { bn: 'এককালীন', en: 'Lump Sum' },
    
    // Income Categories
    'Bill': { bn: 'বিল', en: 'Bill' },
    'Advance': { bn: 'অগ্রিম', en: 'Advance' },
    'Refund': { bn: 'ফেরত', en: 'Refund' },
    'Sale': { bn: 'বিক্রয়', en: 'Sale' },
    'Rental': { bn: 'ভাড়া', en: 'Rental' },
    
    // Income Sub-Categories
    '1st R.A. Bill': { bn: '১ম রানিং বিল', en: '1st R.A. Bill' },
    '2nd R.A. Bill': { bn: '২য় রানিং বিল', en: '2nd R.A. Bill' },
    'Final Bill': { bn: 'ফাইনাল বিল', en: 'Final Bill' },
    'Extra Work Bill': { bn: 'অতিরিক্ত কাজের বিল', en: 'Extra Work Bill' },
    'Mobilization Fund': { bn: 'মোবিলাইজেশন ফান্ড', en: 'Mobilization Fund' },
    'Security Money': { bn: 'সিকিউরিটি মানি', en: 'Security Money' },
    'Empty Bags': { bn: 'খালি বস্তা', en: 'Empty Bags' },
    'Scrap Iron': { bn: 'স্ক্র্যাপ রড', en: 'Scrap Iron' },
    
    // Payers
    'LGED': { bn: 'এলজিইডি', en: 'LGED' },
    'RHD': { bn: 'সড়ক ও জনপথ', en: 'RHD' },
    'BWDB': { bn: 'পানি উন্নয়ন বোর্ড', en: 'BWDB' },
    'Private Owner': { bn: 'ব্যক্তিগত মালিক', en: 'Private Owner' },
    
    // Payment Methods
    'Cash': { bn: 'নগদ', en: 'Cash' },
    'Cheque': { bn: 'চেক', en: 'Cheque' },
    'Bank Transfer': { bn: 'ব্যাংক ট্রান্সফার', en: 'Bank Transfer' }
  };


  
  // Dynamic Translation Utility
  const translateDynamic = async (text: string, from: string, to: string) => {
    try {
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`);
      const data = await res.json();
      if (data.responseData?.translatedText) {
        return data.responseData.translatedText;
      }
      return text;
    } catch (error) {
      console.error("Translation Error:", error);
      return text;
    }
  };


  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!amount || parseFloat(amount) <= 0) newErrors.amount = 'Enter valid amount';
    if (!selectedProject) newErrors.project = 'Select a project';
    if (!selectedPayee) newErrors.payee = 'Select or add a payee';
    if (!mainCategory) newErrors.mainCategory = 'Select main category';
    if (!subCategory) newErrors.subCategory = 'Select sub category';
    if (!quantity || parseFloat(quantity) <= 0) newErrors.quantity = 'Enter valid quantity';
    if (!selectedUnit) newErrors.unit = 'Select a unit';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };




  return (
    <main className={`flex-1 overflow-y-auto pb-24 lg:pb-8 relative transition-all duration-300 ${lang === 'bn' ? 'bn-text' : ''}`}>

      {/* Header */}
      <header className="px-6 pt-8 pb-4 flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-tight text-white">{t('app_name')}</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
            className="px-3 py-1 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white/20 transition-colors"
          >
            {lang === 'bn' ? 'English' : 'বাংলা'}
          </button>
          <button className="p-2 rounded-full hover:bg-white/5 transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      {/* Quick Stats Cards */}
      <section className="px-6 mb-8 flex overflow-x-auto gap-3 no-scrollbar snap-x snap-mandatory">

        {/* Income Card */}
        <div className="flex-none w-[calc(50%-6px)] md:w-1/3 md3-card bg-income-container snap-center p-2 border-0">
          <div className="flex justify-between items-center mb-1 pb-1 border-b border-black/10">
            <span className="text-sm font-bold uppercase tracking-wider text-black">{t('income')}</span>
            <TrendingUp size={18} className="text-black/60" />
          </div>

          <ul className="space-y-1 text-sm font-bold">

            <li className="flex flex-col">
              <span className="opacity-90 text-base leading-tight text-black font-black break-words">{getDisplayName('Jamuna Bridge')}</span> 
              <span className="text-black text-lg leading-none font-medium opacity-80">৳ 1.2M</span>
            </li>
            <li className="flex flex-col">
              <span className="opacity-90 text-base leading-tight text-black font-black break-words">{getDisplayName('Delta Tower')}</span> 
              <span className="text-black text-lg leading-none font-medium opacity-80">৳ 850k</span>
            </li>



          </ul>
        </div>





        {/* Expense Card */}
        <div className="flex-none w-[calc(50%-6px)] md:w-1/3 md3-card bg-expense-container snap-center p-2 border-0">
          <div className="flex justify-between items-center mb-1 pb-1 border-b border-white/10">
            <span className="text-sm font-bold uppercase tracking-wider text-white">{t('expense')}</span>
            <TrendingDown size={18} className="text-white/60" />
          </div>

          <ul className="space-y-1 text-sm font-bold">

            <li className="flex flex-col">
              <span className="opacity-90 text-base leading-tight text-white font-black break-words">{getDisplayName('Jamuna Bridge')}</span> 
              <span className="text-white text-lg leading-none font-medium opacity-80">৳ 120k</span>
            </li>
            <li className="flex flex-col">
              <span className="opacity-90 text-base leading-tight text-white font-black break-words">{getDisplayName('Delta Tower')}</span> 
              <span className="text-white text-lg leading-none font-medium opacity-80">৳ 95k</span>
            </li>



          </ul>
        </div>





        {/* Profit Card */}
        <div className="flex-none w-[calc(50%-6px)] md:w-1/3 md3-card bg-profit-container snap-center p-2 border-0">
          <div className="flex justify-between items-center mb-1 pb-1 border-b border-white/10">
            <span className="text-sm font-bold uppercase tracking-wider text-white">{t('profit')}</span>
            <ArrowUpRight size={18} className="text-white/60" />
          </div>

          <ul className="space-y-1 text-sm font-bold">

            <li className="flex flex-col">
              <span className="opacity-90 text-base leading-tight text-white font-black break-words">{getDisplayName('Jamuna Bridge')}</span> 
              <span className="text-white text-lg leading-none font-medium opacity-80">+৳ 1.08M</span>
            </li>
            <li className="flex flex-col">
              <span className="opacity-90 text-base leading-tight text-white font-black break-words">{getDisplayName('Delta Tower')}</span> 
              <span className="text-white text-lg leading-none font-medium opacity-80">+৳ 755k</span>
            </li>



          </ul>
        </div>




      </section>


      {/* Action Buttons */}
      <section className="px-6 mb-6 flex gap-3">

        <button 
          onClick={() => {
            setErrors({});
            setShowIncomeModal(true);
          }}
          className="flex-1 py-4 px-4 rounded-2xl bg-[#00FF41] hover:bg-[#00e63a] text-black font-black flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-green-900/40 uppercase tracking-tighter text-lg"
        >
          <Plus size={28} strokeWidth={4} /> {t('add_income')}
        </button>

        <button 
          onClick={() => {
            setErrors({});
            setShowExpenseModal(true);
          }}
          className="flex-1 py-4 px-4 rounded-2xl bg-[#E23636] hover:bg-[#d12f2f] text-white font-black flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-red-900/40 uppercase tracking-tighter text-lg"
        >
          <Minus size={28} strokeWidth={4} /> {t('add_expense')}
        </button>
      </section>





      {/* Expense Modal (Bottom Sheet) */}
      <AnimatePresence>
        {showExpenseModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExpenseModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-[#1A1C1E] rounded-t-[32px] z-[70] max-h-[92vh] overflow-y-auto px-6 pb-10 pt-4 shadow-2xl border-t border-white/10"
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
              
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E23636]/20 flex items-center justify-center text-[#E23636]">
                    <TrendingDown size={20} />
                  </div>
                  {t('add_expense')}
                </h2>
                <button onClick={() => setShowExpenseModal(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {/* 1. Main Money Amount (Top Priority) */}
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#E23636] mb-2 block">{t('total_expense')}</label>
                  <div className="relative">
                    <span className="absolute left-0 bottom-2 text-4xl font-bold text-white/20">৳</span>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        if (errors.amount) setErrors({...errors, amount: ''});
                      }}
                      className={`w-full bg-transparent border-b-2 border-white/10 pb-2 pl-10 text-4xl font-bold text-white focus:outline-none focus:border-[#E23636] transition-colors ${errors.amount ? 'border-red-500 animate-pulse' : ''}`}
                      autoFocus
                    />
                  </div>
                </div>


                {/* 2. Project & Payee Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2 block">{t('project')}</label>
                    <div className="relative">
                      <select 
                        value={selectedProject}
                        onChange={(e) => {
                          setSelectedProject(e.target.value);
                          setSelectedPayee('');
                          if (errors.project) setErrors({...errors, project: ''});
                        }}
                        className={`w-full bg-[#2D2F31] border rounded-2xl py-3 px-4 text-sm text-white appearance-none ${errors.project ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-white/10'}`}
                      >
                        <option value="">{t('project')}</option>
                        {MOCK_PROJECT_STATS.filter(p => p.status === 'running').map((p) => (
                          <option key={p.id} value={p.name}>{getDisplayName(p.name)}</option>
                        ))}
                      </select>

                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none" size={16} />
                    </div>

                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2 block">{t('payee')}</label>
                    <div className="relative">
                      <select 
                        value={showPayeeInput ? 'custom' : selectedPayee}
                        onChange={(e) => {
                          if (e.target.value === 'custom') setShowPayeeInput(true);
                          else {
                            setSelectedPayee(e.target.value);
                            setShowPayeeInput(false);
                            if (errors.payee) setErrors({...errors, payee: ''});
                          }
                        }}
                        className={`w-full bg-[#2D2F31] border rounded-2xl py-3 px-4 text-sm text-white appearance-none ${errors.payee ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-white/10'}`}
                      >
                        <option value="">{t('payee')}</option>
                        {projectVendors[selectedProject]?.map((v) => (
                          <option key={v} value={v}>{getDisplayName(v)}</option>
                        ))}
                        <option value="custom" className="text-red-400">{t('add_new')}</option>

                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none" size={16} />
                    </div>
                  </div>
                </div>


                {showPayeeInput && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder={lang === 'bn' ? 'নতুন নাম লিখুন...' : 'Enter new name...'}
                      value={customPayee}
                      onChange={(e) => setCustomPayee(e.target.value)}
                      className="flex-1 bg-white/5 border border-red-500/30 rounded-xl py-2 px-4 text-sm"
                    />
                    <button 
                      onClick={async () => {
                        if (customPayee.trim()) {
                          setIsTranslating(true);
                          const targetLang = lang === 'bn' ? 'en' : 'bn';
                          const translated = await translateDynamic(customPayee.trim(), lang, targetLang);
                          
                          setDynamicTranslations(prev => ({...prev, [customPayee.trim()]: translated}));
                          
                          const newVendors = { ...projectVendors };
                          newVendors[selectedProject] = [...(newVendors[selectedProject] || []), customPayee.trim()];
                          setProjectVendors(newVendors);
                          setSelectedPayee(customPayee.trim());
                          setCustomPayee('');
                          setShowPayeeInput(false);
                          setIsTranslating(false);
                        }
                      }}
                      disabled={isTranslating}
                      className="bg-red-600 px-3 rounded-xl text-black font-bold disabled:opacity-50"
                    >
                      {isTranslating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={18} />}
                    </button>

                  </motion.div>
                )}


                {/* 3. Categories & Subcategories */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2 block">{t('main_cat')}</label>
                    <div className="relative">
                      <select 
                        value={showCustomMain ? 'custom' : mainCategory}
                        onChange={(e) => {
                          if (e.target.value === 'custom') setShowCustomMain(true);
                          else {
                            setMainCategory(e.target.value);
                            const firstSub = categoryMap[e.target.value]?.subs[0] || '';
                            setSubCategory(firstSub);
                            setSelectedUnit(unitMap[firstSub] || '');
                            setShowCustomMain(false);
                            if (errors.mainCategory) setErrors({...errors, mainCategory: ''});
                          }
                        }}
                        className={`w-full bg-[#2D2F31] border rounded-2xl py-3 px-4 text-sm text-white appearance-none ${errors.mainCategory ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-white/10'}`}
                      >
                        <option value="">{t('main_cat')}</option>
                        {Object.keys(categoryMap).map(cat => <option key={cat} value={cat}>{getDisplayName(cat)}</option>)}
                        <option value="custom" className="text-red-400">{t('add_new')}</option>

                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none" size={16} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2 block">{t('sub_cat')}</label>
                    <div className="relative">
                      <select 
                        value={showCustomSub ? 'custom' : subCategory}
                        onChange={(e) => {
                          if (e.target.value === 'custom') setShowCustomSub(true);
                          else {
                            setSubCategory(e.target.value);
                            setSelectedUnit(unitMap[e.target.value] || '');
                            setShowCustomSub(false);
                            if (errors.subCategory) setErrors({...errors, subCategory: ''});
                          }
                        }}
                        className={`w-full bg-[#2D2F31] border rounded-2xl py-3 px-4 text-sm text-white appearance-none ${errors.subCategory ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-white/10'}`}
                      >
                        <option value="">{t('sub_cat')}</option>
                        {categoryMap[mainCategory]?.subs.map(sub => <option key={sub} value={sub}>{getDisplayName(sub)}</option>)}
                        <option value="custom" className="text-red-400">{t('add_new')}</option>

                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none" size={16} />
                    </div>
                  </div>
                </div>

                {/* Custom Category Inputs */}
                {showCustomMain && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder={lang === 'bn' ? 'নতুন মেইন ক্যাটাগরি...' : 'New Main Category...'}
                      value={customMain}
                      onChange={(e) => setCustomMain(e.target.value)}
                      className="flex-1 bg-white/5 border border-red-500/30 rounded-xl py-2 px-4 text-sm"
                    />
                    <button 
                      onClick={async () => {
                        if (customMain.trim()) {
                          setIsTranslating(true);
                          const targetLang = lang === 'bn' ? 'en' : 'bn';
                          const translated = await translateDynamic(customMain.trim(), lang, targetLang);
                          
                          setDynamicTranslations(prev => ({...prev, [customMain.trim()]: translated}));
                          
                          setCategoryMap({...categoryMap, [customMain.trim()]: { subs: ['Misc'], unit: 'Unit' }});
                          setMainCategory(customMain.trim());
                          setSubCategory('Misc');
                          setCustomMain('');
                          setShowCustomMain(false);
                          setIsTranslating(false);
                        }
                      }}
                      disabled={isTranslating}
                      className="bg-red-600 px-3 rounded-xl text-black font-bold disabled:opacity-50"
                    >
                      {isTranslating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={18} />}
                    </button>

                  </motion.div>
                )}

                {showCustomSub && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder={lang === 'bn' ? 'নতুন সাব ক্যাটাগরি...' : 'New Sub Category...'}
                      value={customSub}
                      onChange={(e) => setCustomSub(e.target.value)}
                      className="flex-1 bg-white/5 border border-red-500/30 rounded-xl py-2 px-4 text-sm"
                    />
                    <button 
                      onClick={async () => {
                        if (customSub.trim()) {
                          setIsTranslating(true);
                          const targetLang = lang === 'bn' ? 'en' : 'bn';
                          const translated = await translateDynamic(customSub.trim(), lang, targetLang);
                          
                          setDynamicTranslations(prev => ({...prev, [customSub.trim()]: translated}));
                          
                          const updated = {...categoryMap};
                          updated[mainCategory].subs = [...updated[mainCategory].subs, customSub.trim()];
                          setCategoryMap(updated);
                          setSubCategory(customSub.trim());
                          setCustomSub('');
                          setShowCustomSub(false);
                          setIsTranslating(false);
                        }
                      }}
                      disabled={isTranslating}
                      className="bg-red-600 px-3 rounded-xl text-black font-bold disabled:opacity-50"
                    >
                      {isTranslating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={18} />}
                    </button>

                  </motion.div>
                )}


                {/* 4. Quantity and Unit Dropdown */}
                <div className="grid grid-cols-2 gap-4">
                  <div>

                    <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2 block">{t('quantity')}</label>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      value={quantity}
                      onChange={(e) => {
                        setQuantity(e.target.value);
                        if (errors.quantity) setErrors({...errors, quantity: ''});
                      }}
                      className={`w-full bg-white/5 border rounded-2xl py-3 px-4 text-sm text-white focus:outline-none ${errors.quantity ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-white/10'}`}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2 block">{t('unit')}</label>
                    <div className="relative">
                      <select 
                        value={showUnitInput ? 'custom' : selectedUnit}
                        onChange={(e) => {
                          if (e.target.value === 'custom') setShowUnitInput(true);
                          else {
                            setSelectedUnit(e.target.value);
                            setShowUnitInput(false);
                            if (errors.unit) setErrors({...errors, unit: ''});
                          }
                        }}
                        className={`w-full bg-[#2D2F31] border rounded-2xl py-3 px-4 text-sm text-white appearance-none ${errors.unit ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-white/10'}`}
                      >
                        <option value="">{t('unit')}</option>
                        {units.map(u => <option key={u} value={u}>{getDisplayName(u)}</option>)}
                        <option value="custom" className="text-red-400">{t('add_new')}</option>

                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none" size={16} />
                    </div>
                  </div>
                </div>



                {showUnitInput && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder={lang === 'bn' ? 'ইউনিটের নাম...' : 'Unit name...'}
                      value={customUnit}
                      onChange={(e) => setCustomUnit(e.target.value)}
                      className="flex-1 bg-white/5 border border-red-500/30 rounded-xl py-2 px-4 text-sm"
                    />
                    <button 
                      onClick={async () => {
                        if (customUnit.trim()) {
                          setIsTranslating(true);
                          const targetLang = lang === 'bn' ? 'en' : 'bn';
                          const translated = await translateDynamic(customUnit.trim(), lang, targetLang);
                          
                          setDynamicTranslations(prev => ({...prev, [customUnit.trim()]: translated}));
                          
                          setUnits([...units, customUnit.trim()]);
                          setSelectedUnit(customUnit.trim());
                          setCustomUnit('');
                          setShowUnitInput(false);
                          setIsTranslating(false);
                        }
                      }}
                      disabled={isTranslating}
                      className="bg-red-600 px-3 rounded-xl text-black font-bold disabled:opacity-50"
                    >
                      {isTranslating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={18} />}
                    </button>
                  </motion.div>
                )}



                </div>


                {/* Description */}
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2 block">{t('desc')}</label>
                  <textarea 
                    placeholder={lang === 'bn' ? 'বিবরণ লিখুন...' : 'Enter details...'}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-red-500/50 min-h-[80px]"
                  />
                </div>

                {/* Voucher Upload */}
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2 block">{t('voucher')}</label>
                  <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-colors cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                      <Plus size={24} />
                    </div>
                    <span className="text-xs text-white/40">{lang === 'bn' ? 'ভাউচার / মেমো আপলোড করুন' : 'Upload Voucher / Memo'}</span>
                  </div>
                </div>


                {/* Submit Button */}
                <div className="pt-4">
                  {Object.keys(errors).length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold flex items-center gap-2"
                    >
                      <X size={16} /> {t('validation_error')}
                    </motion.div>
                  )}
                  <button 
                    onClick={() => {
                      if (validate()) {
                        setShowExpenseModal(false);
                        setErrors({});
                      }
                    }}
                    className="w-full py-5 bg-[#E23636] rounded-2xl text-black font-bold uppercase tracking-widest shadow-xl shadow-red-900/40 active:scale-[0.98] transition-all"
                  >
                    {t('save')}
                  </button>
                </div>


            </motion.div>
          </>
        )}
      </AnimatePresence>


      {/* Search & Filter */}
      <section className="px-6 mb-6 flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          <input 
            type="text" 
            placeholder={t('search')}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
        <button className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white/60 hover:text-white transition-colors">
          <Calendar size={20} />
        </button>
      </section>

      {/* Daily Transactions */}
      <section className="px-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">{t('daily_tx')}</h2>
          <span className="text-xs opacity-50 uppercase tracking-widest font-bold">{t('today')}</span>
        </div>

        
        <div className="space-y-3">
          {MOCK_TRANSACTIONS.map((tx) => (
            <div key={tx.id} className="md3-card-elevated flex items-center p-4 gap-4">
              <div className={`w-2 h-12 rounded-full ${tx.type === 'income' ? 'bg-[#00FF41]' : 'bg-[#E23636]'}`} />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-sm">{tx.nature}</div>
                    <div className="text-xs opacity-50">{tx.time}</div>
                  </div>
                  <div className={`font-bold ${tx.type === 'income' ? 'text-[#00FF41]' : 'text-[#E23636]'}`}>
                    {tx.type === 'income' ? '+' : '-'} ৳ {tx.amount.toLocaleString()}
                  </div>
                </div>
                <div className="mt-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${tx.type === 'income' ? 'border-[#00FF41]/30 text-[#00FF41] bg-[#00FF41]/5' : 'border-[#4169E1]/30 text-[#4169E1] bg-[#4169E1]/5'}`}>
                    {tx.project}
                  </span>
                </div>

              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Nav (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 right-0 glass lg:hidden flex justify-around py-4 border-t border-white/10">
        <button className="flex flex-col items-center gap-1 text-blue-400">
          <TrendingUp size={22} />
          <span className="text-[10px]">{t('dashboard')}</span>
        </button>
        <button className="flex flex-col items-center gap-1 opacity-50">
          <ArrowUpRight size={22} />
          <span className="text-[10px]">{t('projects')}</span>
        </button>
        <button className="flex flex-col items-center gap-1 opacity-50">
          <ArrowDownLeft size={22} />
          <span className="text-[10px]">{t('reports')}</span>
        </button>
        <button className="flex flex-col items-center gap-1 opacity-50">
          <MoreVertical size={22} />
          <span className="text-[10px]">{t('settings')}</span>
        </button>
      </nav>

      {/* Add Income Modal */}
      <AnimatePresence>
        {showIncomeModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowIncomeModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-[#1A1C1E] rounded-t-[32px] z-[70] max-h-[92vh] overflow-y-auto px-6 pb-10 pt-4 shadow-2xl border-t border-white/10"
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
              
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00FF41]/20 flex items-center justify-center text-[#00FF41]">
                    <TrendingUp size={20} />
                  </div>
                  {t('add_income')}
                </h2>
                <button onClick={() => setShowIncomeModal(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                  <X size={20} />
                </button>
              </div>


              <div className="space-y-6">
                {/* 1. Amount Display */}
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#00FF41] mb-2 block">{t('total_income')}</label>
                  <div className="relative">
                    <span className="absolute left-0 bottom-2 text-4xl font-bold text-white/20">৳</span>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      value={incomeAmount}
                      onChange={(e) => {
                        setIncomeAmount(e.target.value);
                        if (errors.incomeAmount) setErrors({...errors, incomeAmount: ''});
                      }}
                      className={`w-full bg-transparent border-b-2 border-white/10 pb-2 pl-10 text-4xl font-bold text-white focus:outline-none focus:border-[#00FF41] transition-colors ${errors.incomeAmount ? 'border-red-500 animate-pulse' : ''}`}
                      autoFocus
                    />
                  </div>
                </div>



                {/* 2. Project & Payer */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2 block">{t('project')}</label>
                    <div className="relative">
                      <select 
                        value={selectedProject}
                        onChange={(e) => {
                          setSelectedProject(e.target.value);
                          if (errors.project) setErrors({...errors, project: ''});
                        }}
                        className={`w-full bg-[#2D2F31] border rounded-2xl py-3 px-4 text-sm text-white appearance-none ${errors.project ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-white/10'}`}
                      >
                        <option value="">{t('project')}</option>
                        {MOCK_PROJECT_STATS.filter(p => p.status === 'running').map((p) => (
                          <option key={p.id} value={p.name}>{getDisplayName(p.name)}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none" size={16} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2 block">{t('payer')}</label>
                    <div className="relative">
                      <select 
                        value={showPayerInput ? 'custom' : selectedPayer}
                        onChange={(e) => {
                          if (e.target.value === 'custom') setShowPayerInput(true);
                          else {
                            setSelectedPayer(e.target.value);
                            setShowPayerInput(false);
                            if (errors.payer) setErrors({...errors, payer: ''});
                          }
                        }}
                        className={`w-full bg-[#2D2F31] border rounded-2xl py-3 px-4 text-sm text-white appearance-none ${errors.payer ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-white/10'}`}
                      >
                        <option value="">{t('payer')}</option>
                        {payers.map((p) => (
                          <option key={p} value={p}>{getDisplayName(p)}</option>
                        ))}
                        <option value="custom" className="text-red-400">{t('add_new')}</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none" size={16} />
                    </div>
                  </div>
                </div>

                {showPayerInput && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder={lang === 'bn' ? 'দাতার নাম লিখুন...' : 'Enter payer name...'}
                      value={customPayer}
                      onChange={(e) => setCustomPayer(e.target.value)}
                      className="flex-1 bg-white/5 border border-red-500/30 rounded-xl py-2 px-4 text-sm"
                    />
                    <button 
                      onClick={async () => {
                        if (customPayer.trim()) {
                          setIsTranslating(true);
                          const targetLang = lang === 'bn' ? 'en' : 'bn';
                          const translated = await translateDynamic(customPayer.trim(), lang, targetLang);
                          setDynamicTranslations(prev => ({...prev, [customPayer.trim()]: translated}));
                          setPayers([...payers, customPayer.trim()]);
                          setSelectedPayer(customPayer.trim());
                          setCustomPayer('');
                          setShowPayerInput(false);
                          setIsTranslating(false);
                        }
                      }}
                      disabled={isTranslating}
                      className="bg-red-600 px-3 rounded-xl text-black font-bold disabled:opacity-50"
                    >
                      {isTranslating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={18} />}
                    </button>
                  </motion.div>
                )}

                {/* 3. Category & Sub Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2 block">{t('income_cat')}</label>
                    <div className="relative">
                      <select 
                        value={incomeCategory}
                        onChange={(e) => {
                          setIncomeCategory(e.target.value);
                          setIncomeSubCategory('');
                          if (errors.incomeCategory) setErrors({...errors, incomeCategory: ''});
                        }}
                        className={`w-full bg-[#2D2F31] border rounded-2xl py-3 px-4 text-sm text-white appearance-none ${errors.incomeCategory ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-white/10'}`}
                      >
                        <option value="">{t('income_cat')}</option>
                        {Object.keys(incomeCategoryMap).map(cat => <option key={cat} value={cat}>{getDisplayName(cat)}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none" size={16} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2 block">{t('sub_cat')}</label>
                    <div className="relative">
                      <select 
                        value={incomeSubCategory}
                        onChange={(e) => {
                          setIncomeSubCategory(e.target.value);
                          if (errors.incomeSubCategory) setErrors({...errors, incomeSubCategory: ''});
                        }}
                        className={`w-full bg-[#2D2F31] border rounded-2xl py-3 px-4 text-sm text-white appearance-none ${errors.incomeSubCategory ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-white/10'}`}
                      >
                        <option value="">{t('sub_cat')}</option>
                        {incomeCategoryMap[incomeCategory]?.map(sub => <option key={sub} value={sub}>{getDisplayName(sub)}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none" size={16} />
                    </div>
                  </div>
                </div>

                {/* 4. Payment Method & Ref No */}
                <div className="grid grid-cols-2 gap-4">
                  <div>

                    <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2 block">{t('pay_method')}</label>
                    <div className="relative">
                      <select 
                        value={paymentMethod}
                        onChange={(e) => {
                          setPaymentMethod(e.target.value);
                          if (errors.paymentMethod) setErrors({...errors, paymentMethod: ''});
                        }}
                        className={`w-full bg-[#2D2F31] border rounded-2xl py-3 px-4 text-sm text-white appearance-none ${errors.paymentMethod ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-white/10'}`}
                      >
                        <option value="">{t('pay_method')}</option>
                        {['Cash', 'Cheque', 'Bank Transfer'].map(m => <option key={m} value={m}>{getDisplayName(m)}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none" size={16} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2 block">{t('ref_no')}</label>
                    <input 
                      type="text" 
                      placeholder={lang === 'bn' ? 'চেক নং / টিটি নং' : 'Cheque / TT No'}
                      value={refNo}
                      onChange={(e) => setRefNo(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* 5. Attachments */}
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2 block">{t('voucher')}</label>
                  <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-colors cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                      <Plus size={24} />
                    </div>
                    <span className="text-xs text-white/40">{lang === 'bn' ? 'ভাউচার / মেমো আপলোড করুন' : 'Upload Voucher / Memo'}</span>
                  </div>
                </div>


                <div className="pt-6">

                  <button 
                    onClick={() => {
                      const newErrors: Record<string, string> = {};
                      if (!incomeAmount) newErrors.incomeAmount = 'error';
                      if (!selectedProject) newErrors.project = 'error';
                      if (!selectedPayer) newErrors.payer = 'error';
                      if (!incomeCategory) newErrors.incomeCategory = 'error';
                      if (!incomeSubCategory) newErrors.incomeSubCategory = 'error';
                      if (!paymentMethod) newErrors.paymentMethod = 'error';
                      
                      setErrors(newErrors);
                      if (Object.keys(newErrors).length === 0) {
                        setShowIncomeModal(false);
                        // Save logic here
                      }
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-black font-bold py-4 rounded-2xl shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Check size={20} />
                    {t('save')}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}

