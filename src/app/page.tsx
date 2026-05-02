'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
const supabase = createClient();
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  LogOut,
  Users,
  FolderPlus,
  Check,
  Loader2,
  Image,
  Trash2,
  UploadCloud,
  Edit2,
  FileText,
  Download,
  LayoutDashboard,
  BarChart3,
  PieChart,
  Wallet,
  Fuel,
  HardHat,
  Package,
  Briefcase,
  Layers,
  Activity,
  ArrowRight,
  Database
} from 'lucide-react';





import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';





export default function Dashboard() {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbProjects, setDbProjects] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
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


  // Helper to detect if text is Bengali
  const isBengali = (text: string) => /[৳-৿]/.test(text);

  // Dynamic Translation & Persistence Utility
  const ensureBilingual = async (text: string) => {
    if (!text || !text.trim()) return text;
    const trimmed = text.trim();
    
    // 1. Check local static dictionary
    if (DATA_TRANSLATIONS[trimmed]) return trimmed;

    // 2. Check if already in dynamic translations (state)
    const existingKey = Object.keys(dynamicTranslations).find(key => 
      key.toLowerCase() === trimmed.toLowerCase() || 
      dynamicTranslations[key].toLowerCase() === trimmed.toLowerCase()
    );
    if (existingKey) return existingKey;

    // 3. Not found, translate via API
    setIsTranslating(true);
    const sourceLang = isBengali(trimmed) ? 'bn' : 'en';
    const targetLang = sourceLang === 'bn' ? 'en' : 'bn';
    
    try {
      const translated = await translateDynamic(trimmed, sourceLang, targetLang);
      const en = sourceLang === 'en' ? trimmed : translated;
      const bn = sourceLang === 'bn' ? trimmed : translated;

      // 4. Persist to DB
      await supabase.from('translations').upsert({
        key: en,
        en: en,
        bn: bn
      });

      // 5. Update local state for immediate use
      setDynamicTranslations(prev => ({ ...prev, [en]: bn }));
      setIsTranslating(false);
      return en; // Return English as canonical key
    } catch (err) {
      console.error("Translation failed:", err);
      setIsTranslating(false);
      return trimmed;
    }
  };

  // Helper to get bilingual display name (Bidirectional)
  const getDisplayName = (val: string) => {
    if (!val) return val;
    
    // 1. Check static local dictionary first
    if (DATA_TRANSLATIONS[val]) {
      return DATA_TRANSLATIONS[val][lang];
    }

    // 2. Check dynamic translations
    if (lang === 'bn') {
      // If we want Bengali, check if val is an English key
      if (dynamicTranslations[val]) return dynamicTranslations[val];
      // If val is already Bengali, just return it
      else if (isBengali(val)) return val;
      return val;
    } else {
      // If we want English, check if val is a Bengali value in our map
      const enKey = Object.keys(dynamicTranslations).find(key => dynamicTranslations[key] === val);
      if (enKey) return enKey;
      // If val is already English, just return it
      else if (!isBengali(val)) return val;
      return val;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('');
  const [dashboardDateFilter, setDashboardDateFilter] = useState('');
  const [visibleCount, setVisibleCount] = useState(10);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [description, setDescription] = useState('');
  const [voucherFile, setVoucherFile] = useState<File | null>(null);
  const [voucherPreview, setVoucherPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'projects' | 'settings'>('dashboard');
  const [selectedReportProjectId, setSelectedReportProjectId] = useState<string | null>(null);
  const [reportDateFilter, setReportDateFilter] = useState<string>('');
  const [reportDaysLimit, setReportDaysLimit] = useState<number>(7);
  const [projectSubTab, setProjectSubTab] = useState<'running' | 'completed' | 'archived'>('running');






  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'contractor' | 'site_manager'>('contractor');
  const router = useRouter();

  // Fetch data on mount
  useEffect(() => {
    const checkUser = async () => {
      // Login verification disabled for now
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      const mockUser = authUser || { 
        id: 'f50c7397-9d6c-4a89-b63f-ec3aae3c1d07', 
        email: 'dev@contractorsbd.com',
        user_metadata: { full_name: 'Dev Admin' }
      };
      
      setUser(mockUser);
      setUserRole('contractor'); // Default to contractor for full access
      fetchInitialData();
    };


    checkUser();
  }, []);

  // Reset report filters when switching projects
  useEffect(() => {
    setReportDaysLimit(7);
    setReportDateFilter('');
  }, [selectedReportProjectId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const [showTeamModal, setShowTeamModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteProject, setInviteProject] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isEditProjectMode, setIsEditProjectMode] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [projectInvitations, setProjectInvitations] = useState<any[]>([]);
  const [isTeamLoading, setIsTeamLoading] = useState(false);

  const uploadVoucher = async (file: File) => {
    if (!user) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `vouchers/${user.id}/${Date.now()}_${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('vouchers')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('vouchers')
      .getPublicUrl(filePath);

    return publicUrl;
  };


  const generatePDF = async (tx: any) => {

    const element = document.getElementById('voucher-export-container');
    if (!element) return;

    try {
      setIsLoading(true);
      // Wait for images to load if any
      const images = element.getElementsByTagName('img');
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
      }));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Voucher_${tx.id.slice(0, 8)}.pdf`);
    } catch (error) {
      console.error('PDF Generation Error:', error);
      alert('Failed to generate PDF');
    } finally {
      setIsLoading(false);
    }
  };


  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // Fetch Projects (RLS handles filtering)
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (projectsError) throw projectsError;
      setDbProjects(projectsData || []);

      // Fetch Transactions (RLS handles filtering)
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select(`
          *,
          projects (name)
        `)
        .order('created_at', { ascending: false });

      if (txError) throw txError;
      
      const formattedTx = txData?.map(tx => ({
        ...tx,
        time: new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        project: tx.projects?.name || 'Unknown',
        projectId: tx.project_id
      }));
      
      setTransactions(formattedTx || []);


      // Fetch Vendors/Payees
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors_payees')
        .select('*, projects(name)');
      
      if (vendorError) throw vendorError;
      
      const vendorMap: { [key: string]: string[] } = {};
      const payerList: string[] = ['LGED', 'RHD', 'BWDB', 'Private Owner'];
      
      vendorData?.forEach(v => {
        const pName = v.projects?.name;
        if (v.type === 'vendor' && pName) {
          if (!vendorMap[pName]) vendorMap[pName] = [];
          vendorMap[pName].push(v.name);
        } else if (v.type === 'payer') {
          if (!payerList.includes(v.name)) payerList.push(v.name);
        }
      });
      setProjectVendors(vendorMap);
      setPayers(payerList);

      // Fetch Translations
      const { data: transData, error: transError } = await supabase
        .from('translations')
        .select('*');
      
      if (transError) throw transError;
      const transMap: Record<string, string> = {};
      
      // Load from dedicated translations table
      transData?.forEach(t => {
        if (t.bn) transMap[t.key] = t.bn;
      });

      // Solution 2: Also extract from denormalized columns for zero-latency
      projectsData?.forEach(p => {
        if (p.name_en && p.name_bn) transMap[p.name_en] = p.name_bn;
      });
      txData?.forEach(tx => {
        if (tx.nature_en && tx.nature_bn) transMap[tx.nature_en] = tx.nature_bn;
        if (tx.category_en && tx.category_bn) transMap[tx.category_en] = tx.category_bn;
      });

      setDynamicTranslations(transMap);

      // Solution 1: Non-blocking background sync for missing translations
      setTimeout(() => {
        // 1. Check Projects
        if (projectsData) {
          const missingProjects = projectsData.filter(p => !transMap[p.name] && !DATA_TRANSLATIONS[p.name]);
          missingProjects.forEach(async (p) => await ensureBilingual(p.name));
        }

        // 2. Check Transactions (Nature, Category, Subcategory)
        if (txData) {
          const uniqueNatures = Array.from(new Set(txData.map(tx => tx.nature)));
          const missingNatures = uniqueNatures.filter(n => n && !transMap[n] && !DATA_TRANSLATIONS[n]);
          missingNatures.forEach(async (n) => await ensureBilingual(n));
        }
        // 3. Check Vendors & Payees from Vendors table
        if (vendorData) {
          const uniqueVendors = Array.from(new Set(vendorData.map(v => v.name)));
          const missingVendors = uniqueVendors.filter(v => v && !transMap[v] && !DATA_TRANSLATIONS[v]);
          missingVendors.forEach(async (v) => await ensureBilingual(v));
        }

        // 4. Check Payee/Payer from Transactions (in case they were manually entered)
        if (txData) {
          const uniquePayees = Array.from(new Set(txData.map(tx => tx.payee_payer)));
          const missingPayees = uniquePayees.filter(p => p && !transMap[p] && !DATA_TRANSLATIONS[p]);
          missingPayees.forEach(async (p) => await ensureBilingual(p));
        }
      }, 0);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }

  };


  const handleDelete = async (id: string) => {
    if (!window.confirm(t('confirm_delete'))) return;
    
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error deleting: ' + error.message);
    } else {
      alert(t('delete_success'));
      setShowTransactionDetails(false);
      fetchInitialData();
    }
  };

  const handleProjectStatusChange = async (projectId: string, newStatus: string) => {
    const statusLabel = lang === 'bn' 
      ? (newStatus === 'running' ? 'চলমান' : newStatus === 'completed' ? 'সম্পন্ন' : 'আর্কাইভ')
      : newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
      
    if (!window.confirm(`${t('confirm_status_change')} ${statusLabel}?`)) return;

    const { error } = await supabase
      .from('projects')
      .update({ status: newStatus })
      .eq('id', projectId);

    if (error) {
      alert('Error updating status: ' + error.message);
    } else {
      fetchInitialData();
    }
  };

  const handleEditProjectClick = (project: any) => {
    setIsEditProjectMode(true);
    setEditingProjectId(project.id);
    setNewProjectName(project.name);
    setShowProjectModal(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    const confirmMsg = lang === 'bn' 
      ? 'আপনি কি নিশ্চিতভাবে এই প্রজেক্টটি ডিলিট করতে চান? এর সাথে সম্পর্কিত সকল লেনদেনও ডিলিট হয়ে যাবে।' 
      : 'Are you sure you want to delete this project? All associated transactions will also be deleted.';
    
    if (!window.confirm(confirmMsg)) return;

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      alert('Error deleting project: ' + error.message);
    } else {
      alert(lang === 'bn' ? 'প্রজেক্ট ডিলিট করা হয়েছে' : 'Project deleted successfully');
      setShowProjectModal(false);
      setIsEditProjectMode(false);
      setNewProjectName('');
      fetchInitialData();
    }
  };

  const fetchTeamData = async (projectId: string) => {
    setIsTeamLoading(true);
    // Fetch members with profile info
    const { data: members } = await supabase
      .from('project_members')
      .select('id, user_id, role, profiles(email, full_name)')
      .eq('project_id', projectId);
    
    // Fetch invitations
    const { data: invites } = await supabase
      .from('invitations')
      .select('*')
      .eq('project_id', projectId);
      
    setProjectMembers(members || []);
    setProjectInvitations(invites || []);
    setIsTeamLoading(false);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!window.confirm(lang === 'bn' ? 'আপনি কি এই সদস্যকে রিমুভ করতে চান?' : 'Remove this member?')) return;
    const { error } = await supabase.from('project_members').delete().eq('id', memberId);
    if (!error) fetchTeamData(inviteProject);
  };

  const handleCancelInvite = async (inviteId: string) => {
    if (!window.confirm(lang === 'bn' ? 'ইনভিটেশন বাতিল করবেন?' : 'Cancel invitation?')) return;
    const { error } = await supabase.from('invitations').delete().eq('id', inviteId);
    if (!error) fetchTeamData(inviteProject);
  };

  const handleEditClick = (tx: any) => {
    setIsEditMode(true);
    setEditingId(tx.id);
    setShowTransactionDetails(false);

    if (tx.type === 'expense') {
      setAmount(tx.amount.toString());
      setSelectedProject(tx.project);
      setMainCategory(tx.category);
      setSubCategory(tx.subcategory);
      setSelectedPayee(tx.payee_payer);
      setQuantity(tx.quantity?.toString() || '');
      setSelectedUnit(tx.unit || '');
      setDescription(tx.description || '');
      setVoucherPreview(tx.voucher_url || null);
      setShowExpenseModal(true);
    } else {
      setIncomeAmount(tx.amount.toString());
      setSelectedProject(tx.project);
      setIncomeCategory(tx.category);
      setIncomeSubCategory(tx.subcategory);
      setSelectedPayer(tx.payee_payer);
      setPaymentMethod(tx.payment_method || '');
      setRefNo(tx.ref_no || '');
      setDescription(tx.description || '');
      setVoucherPreview(tx.voucher_url || null);
      setShowIncomeModal(true);
    }
  };


  // Calculate stats per project
  const projectStats = useMemo(() => {
    return dbProjects.map(project => {
      const projectTx = transactions.filter(tx => tx.projectId === project.id);
      const income = projectTx.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
      const expense = projectTx.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
      return {
        ...project,
        income,
        expense,
        profit: income - expense
      };
    }).filter(p => p.status === 'running');
  }, [dbProjects, transactions]);


  // Reports Data Aggregation
  const reportsData = useMemo(() => {
    const categoryBreakdown: Record<string, number> = {};
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(tx => {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
      } else {
        totalExpense += tx.amount;
        const cat = tx.category || 'Others';
        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + tx.amount;
      }
    });

    const sortedCategories = Object.entries(categoryBreakdown)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({ name, value }));

    return { 
      totalIncome, 
      totalExpense, 
      netProfit: totalIncome - totalExpense, 
      categories: sortedCategories 
    };
  }, [transactions]);


  const DonutChart = ({ data, total }: { data: { name: string, value: number }[], total: number }) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    let accumulatedOffset = 0;

    const colors: Record<string, string> = {
      'Material': '#F59E0B',
      'Labor': '#10B981',
      'Vehicle & Fuel': '#3B82F6',
      'Office': '#8B5CF6',
      'Others': '#6B7280'
    };

    return (
      <div className="relative flex items-center justify-center">
        <svg width="200" height="200" viewBox="0 0 100 100" className="transform -rotate-90">
          {data.map((item, i) => {
            const percentage = (item.value / (total || 1)) * 100;
            const strokeDasharray = `${(percentage * circumference) / 100} ${circumference}`;
            const strokeDashoffset = -accumulatedOffset;
            accumulatedOffset += (percentage * circumference) / 100;

            return (
              <motion.circle
                key={item.name}
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke={colors[item.name] || colors['Others']}
                strokeWidth="12"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{ strokeDasharray }}
                transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                className="transition-all hover:stroke-[14]"
              />
            );
          })}
          {/* Base Circle if no data */}
          {total === 0 && (
            <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#333" strokeWidth="12" />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{lang === 'bn' ? 'মোট ব্যয়' : 'Total Expense'}</p>
          <p className="text-lg font-black text-white">৳{total.toLocaleString('en-US')}</p>
        </div>
      </div>
    );
  };

  const AreaChart = ({ transactions }: { transactions: any[] }) => {
    const sorted = [...transactions].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    // Aggregate by day
    const daily: Record<string, { income: number, expense: number }> = {};
    sorted.forEach(tx => {
      const d = new Date(tx.created_at).toISOString().split('T')[0];
      if (!daily[d]) daily[d] = { income: 0, expense: 0 };
      if (tx.type === 'income') daily[d].income += tx.amount;
      else daily[d].expense += tx.amount;
    });

    const days = Object.keys(daily).sort();
    let cumInc = 0;
    let cumExp = 0;
    const points = days.map(d => {
      cumInc += daily[d].income;
      cumExp += daily[d].expense;
      return { income: cumInc, expense: cumExp };
    });

    if (points.length < 2) return null;

    const maxVal = Math.max(...points.map(p => Math.max(p.income, p.expense)), 1);
    const width = 300;
    const height = 100;

    const getPath = (key: 'income' | 'expense') => {
      return points.map((p, i) => {
        const x = (i / (points.length - 1)) * width;
        const y = height - (p[key] / maxVal) * height;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      }).join(' ');
    };

    const getAreaPath = (key: 'income' | 'expense') => {
      const line = getPath(key);
      return `${line} L ${width} ${height} L 0 ${height} Z`;
    };

    return (
      <div className="w-full h-32 relative mt-4">
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
          {/* Income Area */}
          <motion.path
            d={getAreaPath('income')}
            fill="url(#incomeGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ duration: 1.5 }}
          />
          {/* Expense Area */}
          <motion.path
            d={getAreaPath('expense')}
            fill="url(#expenseGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ duration: 1.5, delay: 0.2 }}
          />
          
          {/* Income Line */}
          <motion.path
            d={getPath('income')}
            fill="transparent"
            stroke="#10B981"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2 }}
          />
          {/* Expense Line */}
          <motion.path
            d={getPath('expense')}
            fill="transparent"
            stroke="#F43F5E"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 0.3 }}
          />

          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="1" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F43F5E" stopOpacity="1" />
              <stop offset="100%" stopColor="#F43F5E" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  };

  const renderProjects = () => {
    const filtered = dbProjects.filter(p => p.status === projectSubTab);

    return (
      <div className="px-6 pb-20 animate-in fade-in duration-500">
        {/* Status Tabs */}
        <div className="flex gap-2 mb-8 bg-white/5 p-1.5 rounded-2xl border border-white/5 sticky top-0 z-20 backdrop-blur-md">
          {['running', 'completed', 'archived'].map((tab) => (
            <button
              key={tab}
              onClick={() => setProjectSubTab(tab as any)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                projectSubTab === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-white/40 hover:text-white/60'
              }`}
            >
              {t(tab)}
            </button>
          ))}
        </div>

        {/* Project Cards */}
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          {filtered.length > 0 ? filtered.map((p) => (
            <div key={p.id} className="md3-card-elevated p-4 md:p-6 border border-white/5 relative overflow-hidden group flex flex-col h-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[40px] -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-all" />
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <h3 className="text-xl font-black text-white">{getDisplayName(p.name)}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'running' ? 'bg-green-500 animate-pulse' : 'bg-white/20'}`} />
                    <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">
                      {p.status === 'running' ? t('status_running') : t('status_closed')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 relative z-10">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-[8px] text-white/30 uppercase font-bold mb-1 tracking-tighter">{t('site_manager')}</p>
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-blue-400" />
                    <span className="text-xs font-bold text-white">4 {t('members_active')}</span>
                  </div>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-[8px] text-white/30 uppercase font-bold mb-1 tracking-tighter">{t('started')}</p>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-green-400" />
                    <span className="text-xs font-bold text-white">Apr 2024</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-8 flex flex-col gap-3 relative z-10">
                <div className="flex gap-3">
                   {projectSubTab === 'running' ? (
                     <button 
                       onClick={() => handleProjectStatusChange(p.id, 'completed')}
                       className="flex-1 py-3.5 bg-green-600/10 hover:bg-green-600/20 text-green-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border border-green-600/20 flex items-center justify-center gap-2"
                     >
                       <Check size={14} /> {t('mark_completed')}
                     </button>
                   ) : projectSubTab === 'completed' ? (
                     <>
                       <button 
                         onClick={() => handleProjectStatusChange(p.id, 'archived')}
                         className="flex-1 py-3.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border border-red-600/20 flex items-center justify-center gap-2"
                       >
                         <Trash2 size={14} /> {t('mark_archived')}
                       </button>
                       <button 
                         onClick={() => handleProjectStatusChange(p.id, 'running')}
                         className="flex-1 py-3.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border border-blue-600/20 flex items-center justify-center gap-2"
                       >
                         <Activity size={14} /> {t('reopen')}
                       </button>
                     </>
                   ) : (
                     <button 
                       onClick={() => handleProjectStatusChange(p.id, 'running')}
                       className="flex-1 py-3.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border border-blue-600/20 flex items-center justify-center gap-2"
                     >
                       <Activity size={14} /> {t('reopen')}
                     </button>
                   )}
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      setInviteProject(p.id);
                      setShowTeamModal(true);
                      fetchTeamData(p.id);
                    }}
                    className="flex-1 py-3.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border border-blue-600/20 flex items-center justify-center gap-2"
                  >
                    <Users size={14} /> {t('manage_team')}
                  </button>
                  <button 
                    onClick={() => handleEditProjectClick(p)}
                    className="flex-1 py-3.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border border-blue-600/20 flex items-center justify-center gap-2"
                  >
                    <Edit2 size={14} /> {t('edit_info')}
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="py-20 text-center opacity-20">
              <Package size={48} className="mx-auto mb-4" />
              <p className="text-sm font-bold uppercase tracking-[0.2em]">{t('no_projects')}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderReports = () => {
    const getCategoryIcon = (category: string) => {
      switch (category) {
        case 'Material': return <Package size={18} />;
        case 'Labor': return <HardHat size={18} />;
        case 'Vehicle & Fuel': return <Fuel size={18} />;
        case 'Office': return <Briefcase size={18} />;
        default: return <Layers size={18} />;
      }
    };

    const getCategoryColorClass = (category: string) => {
      switch (category) {
        case 'Material': return 'bg-cat-material';
        case 'Labor': return 'bg-cat-labor';
        case 'Vehicle & Fuel': return 'bg-cat-vehicle';
        case 'Office': return 'bg-cat-office';
        default: return 'bg-cat-others';
      }
    };

    // Aggregation for selected project
    const isAllProjects = !selectedReportProjectId;
    const project = dbProjects.find(p => p.id === selectedReportProjectId);
    const relevantTx = isAllProjects 
      ? transactions 
      : transactions.filter(tx => tx.project_id === selectedReportProjectId);
    
    const income = relevantTx.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
    const expense = relevantTx.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
    const profit = income - expense;
    
    const categoryBreakdown: Record<string, number> = {};
    relevantTx.filter(tx => tx.type === 'expense').forEach(tx => {
      const cat = tx.category || 'Others';
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + tx.amount;
    });

    const categories = Object.entries(categoryBreakdown)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({ name, value }));

    const runningProjects = dbProjects.filter(p => p.status === 'running');

    return (
      <div className="px-6 pb-20 animate-in fade-in duration-500">
        {/* Modern Project Selector (Dropdown) */}
        <div className="mb-8 sticky top-0 z-30 bg-[#0F172A]/80 backdrop-blur-md py-4 -mx-6 px-6 border-b border-white/5">
          <div className="relative group">
            <select 
              value={selectedReportProjectId || ''}
              onChange={(e) => setSelectedReportProjectId(e.target.value || null)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm font-bold text-white appearance-none focus:outline-none focus:border-blue-600 transition-all cursor-pointer pr-12"
            >
              <option value="" className="bg-[#0F172A]">{t('select_project_report')}</option>
              {runningProjects.map(p => (
                <option key={p.id} value={p.id} className="bg-[#0F172A]">
                  {getDisplayName(p.name)}
                </option>
              ))}
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 group-hover:text-blue-400 transition-colors">
              <ChevronDown size={20} />
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedReportProjectId || 'all'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* Project Summary Grid - ONLY show when a project is selected */}
            {!isAllProjects && (
              <div className="grid grid-cols-1 gap-4 mb-10">
                <div className="md3-card-elevated mesh-blue p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-full bg-blue-600/5 group-hover:bg-blue-600/10 transition-colors pointer-events-none" />
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-400 mb-4">
                    <Activity size={24} />
                  </div>
                  <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/40 mb-1">
                    {t('project_profit')}
                  </label>
                  <h2 className={`text-4xl font-black ${profit >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                    ৳ {profit.toLocaleString('en-US')}
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="md3-card mesh-green p-5 border border-white/5 relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 flex items-center justify-center text-[#10B981]">
                        <TrendingUp size={16} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{t('income')}</span>
                    </div>
                    <p className="text-xl font-black text-[#10B981]">৳ {income.toLocaleString('en-US')}</p>
                  </div>
                  <div className="md3-card mesh-red p-5 border border-white/5 relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-[#F43F5E]/10 flex items-center justify-center text-[#F43F5E]">
                        <TrendingDown size={16} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{t('expense')}</span>
                    </div>
                    <p className="text-xl font-black text-[#F43F5E]">৳ {expense.toLocaleString('en-US')}</p>
                  </div>
                </div>
              </div>
            )}

            {isAllProjects ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white/60 flex items-center gap-2">
                    <PieChart size={16} />
                    {t('running_projects')}
                  </h3>
                  <span className="text-[10px] font-bold text-white/30 uppercase">{runningProjects.length} Projects</span>
                </div>

                
                {projectStats.map((p, idx) => (
                  <motion.div 
                    key={p.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => setSelectedReportProjectId(p.id)}
                    className="md3-card p-6 border border-white/5 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[40px] -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-all" />
                    
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div>
                        <h4 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors">{getDisplayName(p.name)}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">{t('status_running')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${p.profit >= 0 ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                          {p.income > 0 ? Math.round((p.profit / p.income) * 100) : 0}% {t('margin')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 relative z-10">
                      <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                        <p className="text-[8px] text-white/30 uppercase font-bold mb-1 tracking-tighter">{t('income')}</p>
                        <p className="text-xs font-black text-white">৳{p.income.toLocaleString('en-US')}</p>
                      </div>
                      <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                        <p className="text-[8px] text-white/30 uppercase font-bold mb-1 tracking-tighter">{t('expense')}</p>
                        <p className="text-xs font-black text-white">৳{p.expense.toLocaleString('en-US')}</p>
                      </div>
                      <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                        <p className="text-[8px] text-white/30 uppercase font-bold mb-1 tracking-tighter">{t('net')}</p>
                        <p className={`text-xs font-black ${p.profit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>৳{Math.abs(p.profit).toLocaleString('en-US')}</p>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-6 h-6 rounded-full border-2 border-[#0F172A] bg-white/10 flex items-center justify-center text-[8px] text-white/40 font-bold">
                            U{i}
                          </div>
                        ))}
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReportProjectId(p.id);
                        }}
                        className="px-5 py-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 border border-blue-600/20 active:scale-95"
                      >
                        {t('view_details')} <ArrowRight size={12} />
                      </button>
                    </div>
                  </motion.div>
                ))}

              </div>
            ) : (
              <div className="space-y-12">
                {/* Category Breakdown for Project */}
                <div>
                  <div className="flex items-center justify-between mb-8 px-1">
                    <h3 className="text-lg font-bold text-white flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400">
                        <PieChart size={20} />
                      </div>
                      {lang === 'bn' ? 'ব্যয়ের খাতসমূহ' : 'Spending Breakdown'}
                    </h3>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{t('total_transactions')}</p>
                      <p className="text-sm font-black text-white">{relevantTx.length}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <DonutChart data={categories} total={expense} />
                    
                    <div className="space-y-6">
                      {categories.length > 0 ? categories.map((cat, idx) => (
                        <div key={cat.name} className="relative group">
                          <div className="flex justify-between items-end mb-2 px-1">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-xl ${getCategoryColorClass(cat.name)}/10 flex items-center justify-center text-white/80`}>
                                {getCategoryIcon(cat.name)}
                              </div>
                              <span className="text-xs font-bold text-white/80">{getDisplayName(cat.name)}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-black text-white block">৳{cat.value.toLocaleString('en-US')}</span>
                            </div>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(cat.value / (expense || 1)) * 100}%` }}
                              transition={{ duration: 1, delay: idx * 0.1 }}
                              className={`h-full rounded-full ${getCategoryColorClass(cat.name)}`}
                            />
                          </div>
                        </div>
                      )) : (
                        <div className="bg-white/2 border border-dashed border-white/10 rounded-3xl p-8 text-center">
                          <p className="text-white/20 text-xs italic">{t('no_data')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cash Flow Trend Chart */}
                <div className="md3-card-elevated glass-panel p-6 border border-white/5">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">{lang === 'bn' ? 'ক্যাশ ফ্লো ট্রেন্ড' : 'Cash Flow Trend'}</h3>
                      <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">{lang === 'bn' ? 'আয় বনাম ব্যয়' : 'Income vs Expense'}</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                        <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{t('income')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#F43F5E]" />
                        <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{t('expense')}</span>
                      </div>
                    </div>
                  </div>
                  <AreaChart transactions={relevantTx} />
                </div>

                {/* Additional Insight Card */}
                <div className="md3-card-elevated glass-panel p-6 border border-white/10 relative overflow-hidden">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-blue-400">
                      <Activity size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{t('health_insights')}</h4>
                      <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">{t('realtime_analysis')}</p>
                    </div>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">
                    {t('primary_expense_is')} <span className="text-white font-bold">{getDisplayName(categories[0]?.name) || 'N/A'}</span>. 
                    {t('profit_margin_is')} <span className="text-blue-400 font-bold">{income > 0 ? Math.round((profit/income)*100) : 0}%</span> which is 
                    <span className="text-[#10B981] font-bold"> {profit >= 0 ? t('optimal') : t('needs_review')}</span>.
                  </p>
                </div>

                {/* Project Ledger Section */}
                <div className="space-y-8">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-lg font-bold text-white flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-600/20 flex items-center justify-center text-green-400">
                        <Calendar size={20} />
                      </div>
                      {lang === 'bn' ? 'লেনদেন লেজার' : 'Transaction Ledger'}
                    </h3>
                    <div className="relative group">
                      <input 
                        type="date"
                        value={reportDateFilter}
                        onChange={(e) => setReportDateFilter(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold text-white focus:outline-none focus:border-blue-500 transition-all uppercase"
                      />
                      {reportDateFilter && (
                        <button 
                          onClick={() => setReportDateFilter('')}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px] border-2 border-[#0F172A]"
                        >
                          <X size={10} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-10">
                    {(() => {
                      // Filter by selected date if exists
                      let filteredTx = relevantTx;
                      if (reportDateFilter) {
                        filteredTx = relevantTx.filter(tx => 
                          new Date(tx.created_at).toISOString().split('T')[0] === reportDateFilter
                        );
                      }

                      // Group by Date
                      const groups: Record<string, any[]> = {};
                      filteredTx.forEach(tx => {
                        const date = new Date(tx.created_at).toISOString().split('T')[0];
                        if (!groups[date]) groups[date] = [];
                        groups[date].push(tx);
                      });

                      const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));
                      const visibleDates = reportDateFilter ? sortedDates : sortedDates.slice(0, reportDaysLimit);

                      if (visibleDates.length === 0) {
                        return (
                          <div className="bg-white/2 border border-dashed border-white/10 rounded-3xl p-12 text-center">
                            <Calendar size={40} className="mx-auto mb-4 text-white/10" />
                            <p className="text-white/20 text-xs italic">{t('no_transactions_found')}</p>
                          </div>
                        );
                      }

                      return (
                        <>
                          {visibleDates.map((date) => (
                            <div key={date} className="relative pl-6 border-l border-white/5 space-y-4">
                              <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-blue-600 border-4 border-[#0F172A] shadow-lg shadow-blue-600/20" />
                              <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4">
                                {new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </h4>
                              
                              <div className="grid grid-cols-1 gap-3">
                                {groups[date].map((tx) => (
                                  <div 
                                    key={tx.id}
                                    onClick={() => {
                                      setSelectedTransaction(tx);
                                      setShowTransactionDetails(true);
                                    }}
                                    className="md3-card-elevated glass-panel p-4 flex items-center justify-between border border-white/5 active:scale-[0.98] transition-all cursor-pointer group"
                                  >
                                    <div className="flex items-center gap-4">
                                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'income' ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#F43F5E]/10 text-[#F43F5E]'}`}>
                                        {tx.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                      </div>
                                      <div>
                                        <p className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">{getDisplayName(tx.nature)}</p>
                                        <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">{getDisplayName(tx.category)}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className={`text-sm font-black ${tx.type === 'income' ? 'text-[#10B981]' : 'text-white'}`}>
                                        {tx.type === 'income' ? '+' : '-'} ৳ {tx.amount.toLocaleString('en-US')}
                                      </p>
                                      <p className="text-[8px] text-white/20 font-bold uppercase">{tx.time}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}

                          {!reportDateFilter && sortedDates.length > reportDaysLimit && (
                            <button 
                              onClick={() => setReportDaysLimit(prev => prev + 7)}
                              className="w-full py-4 bg-white/5 hover:bg-white/10 text-white/40 rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] active:scale-[0.98] transition-all border border-white/5 flex items-center justify-center gap-2"
                            >
                              <Plus size={14} /> {t('show_more_days')}
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>


                <button 
                  onClick={() => setSelectedReportProjectId(null)}
                  className="w-full py-5 bg-white/5 hover:bg-white/10 text-white/40 rounded-3xl text-[10px] font-bold uppercase tracking-[0.3em] active:scale-[0.98] transition-all border border-white/5"
                >
                  ← {t('back_to_projects')}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  };





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
      search: { bn: 'অনুসন্ধান করুন...', en: 'Search...' },
      search_button: { bn: 'খুঁজুন', en: 'Search' },
      recent_transactions: { bn: 'সাম্প্রতিক লেনদেন', en: 'Recent Transactions' },
      load_more: { bn: 'আরো লোড করুন', en: 'Load More' },
      clear_filters: { bn: 'ফিল্টার মুছুন', en: 'Clear Filters' },
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
      settings: { bn: 'সেটিংস', en: 'Settings' },
      
      // Transaction Details
      transaction_details: { bn: 'লেনদেনের বিস্তারিত', en: 'Transaction Details' },
      date_time: { bn: 'তারিখ ও সময়', en: 'Date & Time' },
      category: { bn: 'ক্যাটাগরি', en: 'Category' },
      amount_val: { bn: 'টাকার পরিমাণ', en: 'Amount' },
      method: { bn: 'মাধ্যম', en: 'Method' },
      ref: { bn: 'রেফারেন্স', en: 'Reference' },
      qty: { bn: 'পরিমাণ', en: 'Qty' },
      note: { bn: 'নোট / বিবরণ', en: 'Note / Details' },
      edit: { bn: 'এডিট', en: 'Edit' },
      delete: { bn: 'ডিলিট', en: 'Delete' },
      confirm_delete: { bn: 'আপনি কি নিশ্চিতভাবে এই লেনদেনটি ডিলিট করতে চান?', en: 'Are you sure you want to delete this transaction?' },
      export_pdf: { bn: 'ভাউচার ডাউনলোড (PDF)', en: 'Export Voucher (PDF)' },
      voucher_no: { bn: 'ভাউচার নং', en: 'Voucher No' },
      prepared_by: { bn: 'প্রস্তুতকারী', en: 'Prepared By' },
      signature: { bn: 'স্বাক্ষর', en: 'Signature' },
      authorized: { bn: 'অনুমোদিত স্বাক্ষর', en: 'Authorized Signature' },
      
      // Project Status Actions
      mark_completed: { bn: 'কাজ শেষ করুন', en: 'Mark Completed' },
      mark_archived: { bn: 'আর্কাইভ করুন', en: 'Archive' },
      reopen: { bn: 'পুনরায় খুলুন', en: 'Reopen' },
      restore: { bn: 'আগের অবস্থায় আনুন', en: 'Restore' },
      confirm_status_change: { bn: 'আপনি কি নিশ্চিতভাবে স্ট্যাটাস পরিবর্তন করতে চান:', en: 'Are you sure you want to change status to:' },

      // Missing UI Strings
      total_transactions: { bn: 'মোট লেনদেন', en: 'Total Transactions' },
      no_data: { bn: 'কোন তথ্য নেই', en: 'No data' },
      health_insights: { bn: 'প্রজেক্ট হেলথ ইনসাইটস', en: 'Project Health Insights' },
      realtime_analysis: { bn: 'রিয়েল-টাইম অ্যানালাইসিস', en: 'Real-time Analysis' },
      primary_expense_is: { bn: 'আপনার প্রধান ব্যয় হলো', en: 'your primary expense is' },
      profit_margin_is: { bn: 'প্রজেক্টটির লাভ মার্জিন হলো', en: 'The project has a profit margin of' },
      optimal: { bn: 'সঠিক', en: 'Optimal' },
      needs_review: { bn: 'পর্যালোচনা প্রয়োজন', en: 'Needs Review' },
      no_transactions_found: { bn: 'নির্বাচিত সময়ের জন্য কোন লেনদেন পাওয়া যায়নি।', en: 'No transactions found for the selected period.' },
      show_more_days: { bn: 'আরও দেখুন (পরবর্তী ৭ দিন)', en: 'Show More (Next 7 Days)' },
      back_to_projects: { bn: 'প্রজেক্ট লিস্টে ফিরে যান', en: 'Back to All Projects' },
      enter_new_name: { bn: 'নতুন নাম লিখুন...', en: 'Enter new name...' },
      new_main_cat: { bn: 'নতুন মেইন ক্যাটাগরি...', en: 'New Main Category...' },
      new_sub_cat: { bn: 'নতুন সাব ক্যাটাগরি...', en: 'New Sub Category...' },
      new_unit: { bn: 'নতুন ইউনিট...', en: 'New Unit...' },
      project_name_bilingual: { bn: 'প্রজেক্টের নাম (বাংলা/ইংরেজি)', en: 'Project Name (Bilingual supported)' },
      project_success: { bn: 'প্রজেক্ট সফলভাবে তৈরি হয়েছে!', en: 'Project created successfully!' },
      project_update_success: { bn: 'প্রজেক্ট সফলভাবে আপডেট হয়েছে!', en: 'Project updated successfully!' },
      delete_project: { bn: 'প্রজেক্ট ডিলিট করুন', en: 'Delete Project' },
      select_project: { bn: 'প্রজেক্ট সিলেক্ট করুন', en: 'Select a project' },
      select_payee: { bn: 'পাওনাদার সিলেক্ট করুন', en: 'Select or add a payee' },
      select_main_cat: { bn: 'মেইন ক্যাটাগরি সিলেক্ট করুন', en: 'Select main category' },
      select_sub_cat: { bn: 'সাব ক্যাটাগরি সিলেক্ট করুন', en: 'Select sub category' },
      enter_valid_qty: { bn: 'সঠিক পরিমাণ লিখুন', en: 'Enter valid quantity' },
      save_success: { bn: 'লেনদেন সফলভাবে সেভ হয়েছে!', en: 'Transaction saved successfully!' },
      delete_success: { bn: 'সফলভাবে ডিলিট হয়েছে!', en: 'Deleted successfully!' },
      invitation_sent: { bn: 'আমন্ত্রণ পাঠানো হয়েছে!', en: 'Invitation sent!' },
      running: { bn: 'চলমান', en: 'Running' },
      completed: { bn: 'সম্পন্ন', en: 'Completed' },
      archived: { bn: 'আর্কাইভ', en: 'Archived' },
      status_running: { bn: 'চলমান অবস্থা', en: 'Running Status' },
      status_closed: { bn: 'বন্ধ প্রজেক্ট', en: 'Closed Project' },
      site_manager: { bn: 'সাইট ম্যানেজার', en: 'Site Manager' },
      members_active: { bn: 'সদস্য', en: 'Active Members' },
      started: { bn: 'শুরু হয়েছে', en: 'Started' },
      manage_team: { bn: 'টিম ম্যানেজ', en: 'Manage Team' },
      edit_info: { bn: 'এডিট ইনফো', en: 'Edit Info' },
      no_projects: { bn: 'কোন প্রজেক্ট পাওয়া যায়নি', en: 'No Projects Found' },
      select_project_report: { bn: 'প্রজেক্ট নির্বাচন করুন', en: 'Select Project' },
      project_profit: { bn: 'প্রজেক্ট প্রফিট', en: 'Project Profit' },
      running_projects: { bn: 'চলমান প্রজেক্টসমূহ', en: 'Running Projects' },
      margin: { bn: 'মার্জিন', en: 'Margin' },
      net: { bn: 'নিট', en: 'Net' },
      view_details: { bn: 'বিস্তারিত দেখুন', en: 'View Details' },
      account: { bn: 'অ্যাকাউন্ট', en: 'Account' },
      logged_in_as: { bn: 'আপনি লগইন করেছেন', en: 'You are currently logged in as' },
      sign_out: { bn: 'লগ আউট', en: 'Sign Out' },
      current_team: { bn: 'বর্তমান টিম', en: 'Current Team' },
      pending_invite: { bn: 'পেন্ডিং ইনভাইট', en: 'Pending Invite' },
      assign_manager: { bn: 'সাইট ম্যানেজার নিযুক্ত করুন', en: 'Assign Site Manager' },
      spending_breakdown: { bn: 'ব্যয়ের খাতসমূহ', en: 'Spending Breakdown' },
      cash: { bn: 'ক্যাশ', en: 'Cash' },
      team_management: { bn: 'টিম ম্যানেজমেন্ট', en: 'Team Management' },
      manager_email: { bn: 'সাইট ম্যানেজারের ইমেইল', en: 'Site Manager Email' },
      assign_to_project: { bn: 'প্রজেক্টে যুক্ত করুন', en: 'Assign to Project' },
      select_project_option: { bn: 'প্রজেক্ট সিলেক্ট করুন', en: 'Select Project' },
      no_members: { bn: 'কোন সদস্য যুক্ত নেই', en: 'No members assigned' }
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
    'Bank Transfer': { bn: 'ব্যাংক ট্রান্সফার', en: 'Bank Transfer' },
    
    // Transaction Natures (Common)
    'Cement Purchase': { bn: 'সিমেন্ট ক্রয়', en: 'Cement Purchase' },
    'Client Advance': { bn: 'ক্লায়েন্ট অগ্রিম', en: 'Client Advance' },
    'Labor Wages': { bn: 'লেবার বিল / মজুরি', en: 'Labor Wages' },
    'Material Purchase': { bn: 'মালামাল ক্রয়', en: 'Material Purchase' },
    'Project Alpha': { bn: 'প্রজেক্ট আলফা', en: 'Project Alpha' },
    'Project Beta': { bn: 'প্রজেক্ট বিটা', en: 'Project Beta' },
    'Road Work': { bn: 'রাস্তার কাজ', en: 'Road Work' },
    
    // UI Labels
    'recent_transactions': { bn: 'সাম্প্রতিক লেনদেন', en: 'Recent Transactions' },
    'daily_transactions': { bn: 'দৈনিক লেনদেন তালিকা', en: 'Daily Transaction List' },
    'load_more': { bn: 'আরো লোড করুন', en: 'Load More' },
    'search_placeholder': { bn: 'অনুসন্ধান করুন...', en: 'Search...' },
    'clear_filters': { bn: 'ফিল্টার মুছুন', en: 'Clear Filters' }
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
    if (!amount || parseFloat(amount) <= 0) newErrors.amount = t('enter_valid_amount');
    if (!selectedProject) newErrors.project = t('select_project');
    if (!selectedPayee) newErrors.payee = t('select_payee');
    if (!mainCategory) newErrors.mainCategory = t('select_main_cat');
    if (!subCategory) newErrors.subCategory = t('select_sub_cat');
    if (!quantity || parseFloat(quantity) <= 0) newErrors.quantity = t('enter_valid_qty');
    if (!selectedUnit) newErrors.unit = t('select_unit');
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };




  return (
    <main className={`pb-24 lg:pb-8 relative transition-all duration-300 ${lang === 'bn' ? 'bn-text' : 'en-text'}`}>
      {/* Global Header */}
      <header className="px-6 pt-8 pb-4 flex justify-between items-center sticky top-0 z-[50] bg-[#0F172A]/80 backdrop-blur-md border-b border-white/5">
        <h1 className="text-2xl font-semibold tracking-tight text-white">{t('app_name')}</h1>
        <div className="flex gap-2">
          <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
            <button 
              onClick={() => setLang('en')}
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${lang === 'en' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
            >
              EN
            </button>
            <button 
              onClick={() => setLang('bn')}
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${lang === 'bn' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
            >
              বাংলা
            </button>
          </div>
          
          {userRole === 'contractor' && (
            <>
              <button 
                onClick={() => setShowProjectModal(true)}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-green-400 hover:bg-green-500/10 transition-colors"
              >
                <FolderPlus size={20} />
              </button>
              <button 
                onClick={() => setShowTeamModal(true)}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-blue-400 hover:bg-blue-500/10 transition-colors"
              >
                <Users size={20} />
              </button>
            </>
          )}
          
          <button 
            onClick={handleLogout}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {activeTab === 'dashboard' ? (
        <div className="pt-6">


      {/* Action Buttons (Sticky on Scroll) */}
      <div className="sticky top-0 z-40 bg-[#0F172A] pt-4 pb-4 -mt-2 border-b border-white/5 shadow-2xl">
        <section className="px-6 flex gap-3">

          <button 
            onClick={() => {
              setErrors({});
              setShowIncomeModal(true);
            }}
            className="flex-1 py-4 px-4 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-black font-black flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-green-900/40 uppercase tracking-tighter text-lg"
          >
            <Plus size={28} strokeWidth={4} /> {t('add_income')}
          </button>

          <button 
            onClick={() => {
              setErrors({});
              setShowExpenseModal(true);
            }}
            className="flex-1 py-4 px-4 rounded-2xl bg-[#F43F5E] hover:bg-[#E11D48] text-white font-black flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-red-900/40 uppercase tracking-tighter text-lg"
          >
            <Minus size={28} strokeWidth={4} /> {t('add_expense')}
          </button>
        </section>
      </div>





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
              className="fixed bottom-0 left-0 right-0 bg-[#0F172A] rounded-t-[32px] z-[70] max-h-[92vh] overflow-y-auto px-6 pb-10 pt-4 shadow-2xl border-t border-white/10"
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
              
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F43F5E]/20 flex items-center justify-center text-[#F43F5E]">
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
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#F43F5E] mb-2 block">{t('total_expense')}</label>
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
                      className={`w-full bg-transparent border-b-2 border-white/10 pb-2 pl-10 text-4xl font-bold text-white focus:outline-none focus:border-[#F43F5E] transition-colors ${errors.amount ? 'border-red-500 animate-pulse' : ''}`}
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
                        <option value="">{t('select_project')}</option>
                        {dbProjects.filter(p => p.status === 'running').map((p) => (
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
                        <option value="">{t('select_payee')}</option>
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
                      placeholder={t('enter_new_name')}
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
                          
                          // Persist Translation
                          await supabase.from('translations').upsert({
                            key: customPayee.trim(),
                            [lang]: customPayee.trim(),
                            [targetLang]: translated
                          });

                          setDynamicTranslations(prev => ({...prev, [customPayee.trim()]: translated}));
                          
                          // Persist Vendor
                          const project = dbProjects.find(p => p.name === selectedProject);
                          if (project) {
                            await supabase.from('vendors_payees').insert({
                              project_id: project.id,
                              name: customPayee.trim(),
                              type: 'vendor'
                            });
                          }

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
                        <option value="">{t('select_main_cat')}</option>
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
                        <option value="">{t('select_sub_cat')}</option>
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
                      placeholder={t('new_main_cat')}
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
                      placeholder={t('new_sub_cat')}
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
                    placeholder={t('enter_details')}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-red-500/50 min-h-[80px]"
                  />

                </div>

                {/* Voucher Upload */}
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2 block">{t('voucher')}</label>
                  {!voucherPreview ? (
                    <div 
                      onClick={() => document.getElementById('expense-voucher-input')?.click()}
                      className="border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                        <UploadCloud size={24} />
                      </div>
                      <span className="text-xs text-white/40">{t('upload_voucher')}</span>
                      <input 
                        id="expense-voucher-input"
                        type="file" 
                        accept="image/*" 
                        capture="environment"
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setVoucherFile(file);
                            setVoucherPreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-video group">
                      <img src={voucherPreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center gap-3">
                        <button 
                          onClick={() => {
                            setVoucherFile(null);
                            setVoucherPreview(null);
                          }}
                          className="w-12 h-12 rounded-full bg-red-500/90 flex items-center justify-center text-white shadow-2xl backdrop-blur-sm active:scale-90 transition-all"
                        >
                          <Trash2 size={24} />
                        </button>
                      </div>

                    </div>
                  )}
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
                    onClick={async () => {
                      if (validate()) {
                        setIsUploading(true);
                        let vUrl = null;
                        if (voucherFile) {
                          vUrl = await uploadVoucher(voucherFile);
                        }

                        const project = dbProjects.find(p => p.name === selectedProject);
                        
                        // Bilingual translation before saving
                        const translatedNature = await ensureBilingual(subCategory || mainCategory || 'Expense');
                        const translatedCat = await ensureBilingual(mainCategory);
                        const translatedSub = await ensureBilingual(subCategory);
                        const translatedPayee = await ensureBilingual(selectedPayee);
                        const translatedUnit = await ensureBilingual(selectedUnit);
                        const translatedDesc = await ensureBilingual(description);

                        const txData = {
                          project_id: project?.id,
                          type: 'expense',
                          nature: translatedNature,
                          nature_en: translatedNature,
                          nature_bn: dynamicTranslations[translatedNature] || (isBengali(subCategory || mainCategory) ? (subCategory || mainCategory) : ''),
                          amount: parseFloat(amount),
                          category: translatedCat,
                          category_en: translatedCat,
                          category_bn: dynamicTranslations[translatedCat] || (isBengali(mainCategory) ? mainCategory : ''),
                          subcategory: translatedSub,
                          subcategory_en: translatedSub,
                          subcategory_bn: dynamicTranslations[translatedSub] || (isBengali(subCategory) ? subCategory : ''),
                          payee_payer: translatedPayee,
                          unit: translatedUnit,
                          quantity: parseFloat(quantity),
                          description: translatedDesc,
                          voucher_url: vUrl || voucherPreview,
                          created_by: user?.id,
                          updated_by: user?.id
                        };

                        const { error } = isEditMode
                          ? await supabase.from('transactions').update(txData).eq('id', editingId)
                          : await supabase.from('transactions').insert([txData]);

                        setIsUploading(false);
                        if (error) {
                          alert('Error saving: ' + error.message);
                          return;
                        }

                        fetchInitialData();
                        alert(t('save_success'));
                        setShowExpenseModal(false);
                        setAmount('');
                        setSelectedProject('');
                        setMainCategory('');
                        setSubCategory('');
                        setDescription('');
                        setVoucherFile(null);
                        setVoucherPreview(null);
                        setIsEditMode(false);
                        setEditingId(null);
                        setErrors({});
                      }
                    }}
                    className="w-full py-5 bg-[#F43F5E] rounded-2xl text-black font-bold uppercase tracking-widest shadow-xl shadow-red-900/40 active:scale-[0.98] transition-all disabled:opacity-50"
                    disabled={isUploading}
                  >
                    {isUploading ? <Loader2 className="animate-spin mx-auto" /> : t('save')}
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setAppliedSearchQuery(searchQuery);
            }}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
          {searchQuery && (
            <button 
              onClick={() => setAppliedSearchQuery(searchQuery)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-lg hover:bg-blue-500 active:scale-95 transition-all"
            >
              {t('search_button')}
            </button>
          )}
        </div>
        <div 
          onClick={() => {
            if (dateInputRef.current) {
              try {
                (dateInputRef.current as any).showPicker();
              } catch (e) {
                dateInputRef.current.click();
              }
            }
          }}
          className={`relative flex items-center justify-center w-12 h-12 rounded-2xl border transition-all cursor-pointer ${dashboardDateFilter ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-900/40' : 'bg-white/5 border-white/10 text-white/60 hover:text-white'}`}
        >
          <Calendar size={20} className="pointer-events-none absolute" />
          <input 
            type="date" 
            ref={dateInputRef}
            value={dashboardDateFilter}
            onChange={(e) => {
              setDashboardDateFilter(e.target.value);
              setVisibleCount(10); 
            }}
            className="opacity-0 w-0 h-0 absolute pointer-events-none"
            style={{ colorScheme: 'dark' }}
          />
        </div>
      </section>

      {/* Daily Transactions */}
      <section className="px-6 pb-20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white/20">{t('recent_transactions')}</h2>
          {(appliedSearchQuery || dashboardDateFilter) && (
            <button 
              onClick={() => {
                setSearchQuery('');
                setAppliedSearchQuery('');
                setDashboardDateFilter('');
              }}
              className="text-[10px] font-bold text-blue-500 uppercase tracking-widest"
            >
              {t('clear_filters')}
            </button>
          )}
        </div>
        
        <div className="space-y-3">
          {(() => {
            const filtered = transactions.filter(tx => {
              // Date Filter
              if (dashboardDateFilter) {
                const txDate = new Date(tx.created_at).toISOString().split('T')[0];
                if (txDate !== dashboardDateFilter) return false;
              }

              // Search Filter
              if (!appliedSearchQuery) return true;
              const query = appliedSearchQuery.toLowerCase();
              return tx.nature.toLowerCase().includes(query) || 
                     tx.project.toLowerCase().includes(query) ||
                     getDisplayName(tx.nature).toLowerCase().includes(query) ||
                     getDisplayName(tx.project).toLowerCase().includes(query);
            });
            
            const sliced = filtered.slice(0, visibleCount);
            
            return (
              <>
                {sliced.map((tx) => (
                  <div 
                    key={tx.id} 
                    onClick={() => {
                      setSelectedTransaction(tx);
                      setShowTransactionDetails(true);
                    }}
                    className="md3-card-elevated flex items-center p-4 gap-4 cursor-pointer hover:bg-white/5 active:scale-[0.98] transition-all"
                  >

                    <div className={`w-2 h-12 rounded-full ${tx.type === 'income' ? 'bg-[#10B981]' : 'bg-[#F43F5E]'}`} />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-sm">{getDisplayName(tx.nature)}</div>
                          <div className="text-xs opacity-50">{tx.time}</div>
                        </div>
                        <div className={`font-bold ${tx.type === 'income' ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                          {tx.type === 'income' ? '+' : '-'} ৳ {tx.amount.toLocaleString('en-US')}
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${tx.type === 'income' ? 'border-[#10B981]/30 text-[#10B981] bg-[#10B981]/5' : 'border-[#3B82F6]/30 text-[#3B82F6] bg-[#3B82F6]/5'}`}>
                          {getDisplayName(tx.project)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filtered.length > visibleCount ? (
                  <button 
                    onClick={() => setVisibleCount(prev => prev + 10)}
                    className="w-full py-4 mt-2 bg-white/5 border border-dashed border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:bg-white/10 hover:text-white transition-all"
                  >
                    {t('load_more')}
                  </button>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-10 opacity-20 italic">
                    {lang === 'bn' ? 'কোন তথ্য পাওয়া যায়নি' : 'No transactions found'}
                  </div>
                ) : null}
              </>
            );
          })()}
        </div>
      </section>
        </div>
      ) : activeTab === 'reports' ? (
        <div className="pt-4">
          <div className="px-6 mb-4">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white/20">{t('reports')}</h2>
          </div>
          {renderReports()}
        </div>
      ) : activeTab === 'projects' ? (
        <div className="pt-4">
          <div className="px-6 mb-4">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white/20">{t('projects')}</h2>
          </div>
          {renderProjects()}
        </div>
      ) : activeTab === 'settings' ? (
        <div className="pt-4">
          <div className="px-6 mb-4">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white/20">{t('settings')}</h2>
          </div>
          
          <div className="px-6 space-y-6">
            <div className="md3-card-elevated p-6 border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[40px] -mr-16 -mt-16" />
              
              <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4 relative z-10">{t('account')}</h3>
              <p className="text-sm text-white/60 mb-6 relative z-10 leading-relaxed">
                {t('logged_in_as')} <strong>Dev Admin</strong>.
              </p>
              
              <button 
                onClick={handleLogout}
                className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-red-500 font-bold uppercase tracking-widest flex items-center justify-center gap-3 relative z-10"
              >
                <LogOut size={20} /> {t('sign_out')}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Bottom Nav (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0F172A] lg:hidden flex justify-around py-4 border-t border-white/10 z-50">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'dashboard' ? 'text-blue-400 scale-110' : 'opacity-50 text-white'}`}
        >
          <LayoutDashboard size={22} />
          <span className="text-[10px]">{t('dashboard')}</span>
        </button>
        <button 
          onClick={() => setActiveTab('projects')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'projects' ? 'text-blue-400 scale-110' : 'opacity-50 text-white'}`}
        >
          <Briefcase size={22} />
          <span className="text-[10px]">{t('projects')}</span>
        </button>
        <button 
          onClick={() => setActiveTab('reports')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'reports' ? 'text-blue-400 scale-110' : 'opacity-50 text-white'}`}
        >
          <BarChart3 size={22} />
          <span className="text-[10px]">{t('reports')}</span>
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'settings' ? 'text-blue-400 scale-110' : 'opacity-50 text-white'}`}
        >
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
              className="fixed bottom-0 left-0 right-0 bg-[#0F172A] rounded-t-[32px] z-[70] max-h-[92vh] overflow-y-auto px-6 pb-10 pt-4 shadow-2xl border-t border-white/10"
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
              
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center text-[#10B981]">
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
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#10B981] mb-2 block">{t('total_income')}</label>
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
                      className={`w-full bg-transparent border-b-2 pb-2 pl-10 text-4xl font-bold text-white focus:outline-none focus:border-[#10B981] transition-colors ${errors.incomeAmount ? 'border-red-500 shadow-[0_4px_10px_rgba(239,68,68,0.4)] animate-pulse' : 'border-white/10'}`}
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
                        <option value="">{t('select_project')}</option>
                        {dbProjects.filter(p => p.status === 'running').map((p) => (
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
                      placeholder={t('enter_new_name')}
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
                          
                          // Persist Translation
                          await supabase.from('translations').upsert({
                            key: customPayer.trim(),
                            [lang]: customPayer.trim(),
                            [targetLang]: translated
                          });

                          setDynamicTranslations(prev => ({...prev, [customPayer.trim()]: translated}));
                          
                          // Persist Payer
                          const project = dbProjects.find(p => p.name === selectedProject);
                          if (project) {
                            await supabase.from('vendors_payees').insert({
                              project_id: project.id,
                              name: customPayer.trim(),
                              type: 'payer'
                            });
                          }

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
                      className={`w-full bg-[#2D2F31] border rounded-2xl py-3 px-4 text-sm text-white focus:outline-none transition-colors ${errors.refNo ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-white/10'}`}
                    />
                  </div>
                </div>

                {/* Income Voucher Upload */}
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2 block">{t('voucher')}</label>
                  {!voucherPreview ? (
                    <div 
                      onClick={() => document.getElementById('income-voucher-input')?.click()}
                      className="border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                        <UploadCloud size={24} />
                      </div>
                      <span className="text-xs text-white/40">{lang === 'bn' ? 'ভাউচার / মেমো আপলোড করুন' : 'Upload Voucher / Memo'}</span>
                      <input 
                        id="income-voucher-input"
                        type="file" 
                        accept="image/*" 
                        capture="environment"
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setVoucherFile(file);
                            setVoucherPreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-video group">
                      <img src={voucherPreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center gap-3">
                        <button 
                          onClick={() => {
                            setVoucherFile(null);
                            setVoucherPreview(null);
                          }}
                          className="w-12 h-12 rounded-full bg-red-500/90 flex items-center justify-center text-white shadow-2xl backdrop-blur-sm active:scale-90 transition-all"
                        >
                          <Trash2 size={24} />
                        </button>
                      </div>

                    </div>
                  )}
                </div>

                {/* Income Description */}
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2 block">{t('desc')}</label>
                  <textarea 
                    placeholder={lang === 'bn' ? 'বিবরণ লিখুন...' : 'Enter details...'}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-green-500/50 min-h-[80px]"
                  />
                </div>

                <div className="pt-6">
                  <button 
                    onClick={async () => {
                      const newErrors: Record<string, string> = {};
                      if (!incomeAmount) newErrors.incomeAmount = 'error';
                      if (!selectedProject) newErrors.project = 'error';
                      if (!selectedPayer) newErrors.payer = 'error';
                      if (!incomeCategory) newErrors.incomeCategory = 'error';
                      if (!incomeSubCategory) newErrors.incomeSubCategory = 'error';
                      if (!paymentMethod) newErrors.paymentMethod = 'error';
                      if (paymentMethod && paymentMethod !== 'Cash' && !refNo) newErrors.refNo = 'error';
                      
                      setErrors(newErrors);
                      if (Object.keys(newErrors).length === 0) {
                        setIsUploading(true);
                        let vUrl = null;
                        if (voucherFile) {
                          vUrl = await uploadVoucher(voucherFile);
                        }

                        const project = dbProjects.find(p => p.name === selectedProject);
                        
                        // Bilingual translation before saving
                        const translatedNature = await ensureBilingual(incomeSubCategory || incomeCategory || 'Income');
                        const translatedCat = await ensureBilingual(incomeCategory);
                        const translatedSub = await ensureBilingual(incomeSubCategory);
                        const translatedPayer = await ensureBilingual(selectedPayer);
                        const translatedDesc = await ensureBilingual(description);

                        const txData = {
                          project_id: project?.id,
                          type: 'income',
                          nature: translatedNature,
                          nature_en: translatedNature,
                          nature_bn: dynamicTranslations[translatedNature] || (isBengali(incomeSubCategory || incomeCategory) ? (incomeSubCategory || incomeCategory) : ''),
                          amount: parseFloat(incomeAmount),
                          category: translatedCat,
                          category_en: translatedCat,
                          category_bn: dynamicTranslations[translatedCat] || (isBengali(incomeCategory) ? incomeCategory : ''),
                          subcategory: translatedSub,
                          subcategory_en: translatedSub,
                          subcategory_bn: dynamicTranslations[translatedSub] || (isBengali(incomeSubCategory) ? incomeSubCategory : ''),
                          payee_payer: translatedPayer,
                          payment_method: paymentMethod,
                          ref_no: refNo,
                          description: translatedDesc,
                          voucher_url: vUrl || voucherPreview,
                          created_by: user?.id,
                          updated_by: user?.id
                        };

                        const { error } = isEditMode
                          ? await supabase.from('transactions').update(txData).eq('id', editingId)
                          : await supabase.from('transactions').insert([txData]);

                        setIsUploading(false);
                        if (error) {
                          alert('Error saving: ' + error.message);
                          return;
                        }

                        fetchInitialData();
                        setShowIncomeModal(false);
                        setIncomeAmount('');
                        setSelectedProject('');
                        setIncomeCategory('');
                        setIncomeSubCategory('');
                        setPaymentMethod('');
                        setRefNo('');
                        setDescription('');
                        setVoucherFile(null);
                        setVoucherPreview(null);
                        setIsEditMode(false);
                        setEditingId(null);
                      }

                    }}
                    disabled={isUploading}
                    className="w-full bg-green-600 hover:bg-green-700 text-black font-bold py-4 rounded-2xl shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isUploading ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                    {t('save')}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Team Management Modal */}
      <AnimatePresence>
        {showTeamModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTeamModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80]"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed inset-x-6 top-20 bg-[#0F172A] border border-white/10 rounded-[32px] p-8 z-[90] shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400">
                    <Users size={20} />
                  </div>
                  {t('team_management')}
                </h2>
                <button onClick={() => setShowTeamModal(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2 block px-1">{t('manager_email')}</label>
                  <input 
                    type="email"
                    placeholder="manager@email.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full bg-[#2D2F31] border border-white/10 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-blue-600 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2 block px-1">{t('assign_to_project')}</label>
                  <div className="relative">
                    <select 
                      value={inviteProject}
                      onChange={(e) => setInviteProject(e.target.value)}
                      className="w-full bg-[#2D2F31] border border-white/10 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-blue-600 appearance-none"
                    >
                      <option value="" className="bg-[#0F172A]">{t('select_project_option')}</option>
                      {dbProjects.map(p => (
                        <option key={p.id} value={p.id} className="bg-[#0F172A]">{getDisplayName(p.name)}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none" size={18} />
                  </div>
                </div>

                <button 
                  onClick={async () => {
                    if (!inviteEmail || !inviteProject) return;
                    setIsInviting(true);
                    
                    const normalizedEmail = inviteEmail.trim().toLowerCase();

                    // 1. Check if user already exists in profiles
                    const { data: profile } = await supabase
                      .from('profiles')
                      .select('id')
                      .eq('email', normalizedEmail)
                      .single();

                    if (profile) {
                      // Case A: User exists -> Add directly to project_members
                      const { error: memberError } = await supabase
                        .from('project_members')
                        .insert({
                          project_id: inviteProject,
                          user_id: profile.id,
                          role: 'site_manager'
                        });

                      if (memberError) {
                        if (memberError.code === '23505') alert('This user is already a manager for this project.');
                        else alert(memberError.message);
                      } else {
                        alert(t('manager_assigned'));
                        setInviteEmail('');
                        fetchTeamData(inviteProject);
                      }
                    } else {
                      // Case B: User doesn't exist yet -> Add to invitations
                      const { error: inviteError } = await supabase
                        .from('invitations')
                        .insert({
                          project_id: inviteProject,
                          email: normalizedEmail,
                          role: 'site_manager',
                          invited_by: user.id
                        });

                      if (inviteError) {
                        if (inviteError.code === '23505') alert('An invitation is already pending for this email.');
                        else alert(inviteError.message);
                      } else {
                        alert(t('invitation_sent'));
                        setInviteEmail('');
                        fetchTeamData(inviteProject);
                      }
                    }
                    setIsInviting(false);
                  }}
                  disabled={isInviting}
                  className="w-full bg-blue-600 py-5 rounded-2xl text-white font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isInviting ? <Loader2 className="animate-spin" size={24} /> : t('assign_manager')}
                </button>

                {/* Team List */}
                <div className="pt-6 border-t border-white/10 mt-6">
                  <h3 className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-4 px-1">{t('current_team')}</h3>
                  
                  {isTeamLoading ? (
                    <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-white/20" /></div>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                      {projectMembers.map(m => (
                        <div key={m.id} className="bg-white/5 rounded-2xl p-4 flex justify-between items-center group">
                          <div>
                            <p className="text-xs font-bold text-white">{m.profiles?.full_name || 'Site Manager'}</p>
                            <p className="text-[10px] text-white/40">{m.profiles?.email}</p>
                          </div>
                          <button 
                            onClick={() => handleRemoveMember(m.id)}
                            className="w-8 h-8 rounded-full bg-red-600/10 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      {projectInvitations.map(inv => (
                        <div key={inv.id} className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-4 flex justify-between items-center group">
                          <div>
                            <p className="text-xs font-bold text-white/60">{inv.email}</p>
                            <p className="text-[8px] uppercase tracking-widest text-blue-400 font-bold">{t('pending_invite')}</p>
                          </div>
                          <button 
                            onClick={() => handleCancelInvite(inv.id)}
                            className="w-8 h-8 rounded-full bg-red-600/10 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      {projectMembers.length === 0 && projectInvitations.length === 0 && (
                        <div className="text-center py-8 text-white/20 text-[10px] uppercase font-bold tracking-widest">{t('no_members')}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Add Project Modal */}
      <AnimatePresence>
        {showProjectModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProjectModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80]"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed inset-x-6 top-40 bg-[#0F172A] border border-white/10 rounded-[32px] p-8 z-[90] shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-600/20 flex items-center justify-center text-green-400">
                    {isEditProjectMode ? <Edit2 size={20} /> : <FolderPlus size={20} />}
                  </div>
                  {isEditProjectMode ? (lang === 'bn' ? 'প্রজেক্ট এডিট' : 'Edit Project') : (lang === 'bn' ? 'নতুন প্রজেক্ট' : 'New Project')}
                </h2>
                <button 
                  onClick={() => {
                    setShowProjectModal(false);
                    setIsEditProjectMode(false);
                    setNewProjectName('');
                  }} 
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2 block px-1">{t('project_name_bilingual')}</label>
                  <input 
                    type="text"
                    placeholder="e.g. Padma Bridge / পদ্মা সেতু"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-green-500 transition-all"
                  />
                </div>

                <button 
                  onClick={async () => {
                    if (!newProjectName.trim() || !user) return;
                    setIsCreatingProject(true);
                    
                    const canonicalName = await ensureBilingual(newProjectName.trim());

                    if (isEditProjectMode && editingProjectId) {
                      const { error } = await supabase
                        .from('projects')
                        .update({ 
                          name: canonicalName,
                          name_en: canonicalName,
                          name_bn: dynamicTranslations[canonicalName] || (isBengali(newProjectName) ? newProjectName : '')
                        })
                        .eq('id', editingProjectId);

                      if (error) {
                        alert(error.message);
                      } else {
                        alert(t('project_update_success'));
                        setShowProjectModal(false);
                        setIsEditProjectMode(false);
                        setNewProjectName('');
                        fetchInitialData();
                      }
                    } else {
                      const { error } = await supabase
                        .from('projects')
                        .insert({
                          name: canonicalName,
                          name_en: canonicalName,
                          name_bn: dynamicTranslations[canonicalName] || (isBengali(newProjectName) ? newProjectName : ''),
                          owner_id: user.id,
                          status: 'running'
                        });

                      if (error) {
                        alert(error.message);
                      } else {
                        alert(t('project_success'));
                        setShowProjectModal(false);
                        setNewProjectName('');
                        fetchInitialData();
                      }
                    }
                    setIsCreatingProject(false);
                  }}
                  disabled={isCreatingProject}
                  className="w-full bg-[#10B981] py-5 rounded-2xl text-black font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isCreatingProject ? <Loader2 className="animate-spin" size={24} /> : (isEditProjectMode ? (lang === 'bn' ? 'আপডেট করুন' : 'Update Project') : (lang === 'bn' ? 'তৈরি করুন' : 'Create Project'))}
                </button>

                {isEditProjectMode && (
                  <button 
                    onClick={() => handleDeleteProject(editingProjectId!)}
                    className="w-full py-4 text-red-500/60 hover:text-red-500 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 mt-4"
                  >
                    <Trash2 size={14} /> {t('delete_project')}
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Transaction Details Modal */}
      <AnimatePresence>
        {showTransactionDetails && selectedTransaction && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTransactionDetails(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80]"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-[#0F172A] rounded-t-[32px] z-[90] max-h-[92vh] overflow-y-auto px-6 pb-12 pt-4 shadow-2xl border-t border-white/10"
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
              
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedTransaction.type === 'income' ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#F43F5E]/20 text-[#F43F5E]'}`}>
                    {selectedTransaction.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                  </div>
                  {t('transaction_details')}
                </h2>
                <button onClick={() => setShowTransactionDetails(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-8">
                {/* 1. Big Amount */}
                <div className="text-center py-4">
                  <div className={`text-4xl font-black mb-1 ${selectedTransaction.type === 'income' ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                    {selectedTransaction.type === 'income' ? '+' : '-'} ৳ {selectedTransaction.amount.toLocaleString('en-US')}
                  </div>
                  <div className="text-xs opacity-40 font-bold uppercase tracking-[0.2em]">{getDisplayName(selectedTransaction.nature)}</div>
                </div>

                <div className="grid grid-cols-2 gap-y-8 gap-x-4 bg-white/5 rounded-3xl p-6">
                  {/* Project */}
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-1 block">{t('project')}</label>
                    <div className="text-sm font-bold text-white">{getDisplayName(selectedTransaction.project)}</div>
                  </div>

                  {/* Date/Time */}
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-1 block">{t('date_time')}</label>
                    <div className="text-sm font-bold text-white">{selectedTransaction.time}</div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-1 block">{t('category')}</label>
                    <div className="text-sm font-bold text-white">
                      {getDisplayName(selectedTransaction.category)}
                      {selectedTransaction.subcategory && (
                        <span className="opacity-50 font-medium"> / {getDisplayName(selectedTransaction.subcategory)}</span>
                      )}
                    </div>
                  </div>

                  {/* Payee/Payer */}
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-1 block">{selectedTransaction.type === 'income' ? t('payer') : t('payee')}</label>
                    <div className="text-sm font-bold text-white">{getDisplayName(selectedTransaction.payee_payer) || '—'}</div>
                  </div>

                  {/* Conditional Fields: Method/Ref for Income */}
                  {selectedTransaction.type === 'income' && (
                    <>
                      <div>
                        <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-1 block">{t('method')}</label>
                        <div className="text-sm font-bold text-white">{getDisplayName(selectedTransaction.payment_method) || t('cash')}</div>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-1 block">{t('ref')}</label>
                        <div className="text-sm font-bold text-white">{selectedTransaction.ref_no || '—'}</div>
                      </div>
                    </>
                  )}

                  {/* Conditional Fields: Qty/Unit for Expense */}
                  {selectedTransaction.type === 'expense' && selectedTransaction.quantity && (
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-1 block">{t('qty')}</label>
                      <div className="text-sm font-bold text-white">
                        {selectedTransaction.quantity} <span className="opacity-50 text-[10px] uppercase ml-1">{getDisplayName(selectedTransaction.unit)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description/Notes */}
                {selectedTransaction.description && (
                  <div className="px-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2 block">{t('note')}</label>
                    <div className="text-sm text-white/80 bg-white/5 border border-white/10 rounded-2xl p-4 italic leading-relaxed">
                      "{getDisplayName(selectedTransaction.description)}"
                    </div>
                  </div>
                )}

                {/* Voucher Image */}
                {selectedTransaction.voucher_url && (
                  <div className="px-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2 block">{t('voucher')}</label>
                    <div className="rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                      <img 
                        src={selectedTransaction.voucher_url} 
                        alt="Voucher" 
                        className="w-full h-auto cursor-pointer"
                        onClick={() => window.open(selectedTransaction.voucher_url, '_blank')}
                      />
                    </div>
                  </div>
                )}


                {/* Action Buttons */}
                <div className="space-y-3">
                  <button 
                    onClick={() => generatePDF(selectedTransaction)}
                    className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 active:scale-[0.98] transition-all border border-white/5"
                  >
                    <Download size={20} />
                    {t('export_pdf')}
                  </button>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleEditClick(selectedTransaction)}
                      className="flex-1 py-4 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                    >
                      <Edit2 size={18} />
                      {t('edit')}
                    </button>
                    <button 
                      onClick={() => handleDelete(selectedTransaction.id)}
                      className="flex-1 py-4 bg-red-600/20 text-red-400 border border-red-500/30 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                    >
                      <Trash2 size={18} />
                      {t('delete')}
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => setShowTransactionDetails(false)}
                  className="w-full py-4 bg-white/5 text-white/40 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] active:scale-[0.98] transition-all"
                >
                  {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
                </button>


              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hidden PDF Template Container */}
      <div className="fixed top-[-9999px] left-[-9999px]" aria-hidden="true">
        <div id="voucher-export-container" className="w-[800px] bg-white p-12 leading-relaxed" style={{ backgroundColor: '#FFFFFF', color: '#000000', fontFamily: 'sans-serif' }}>
          {selectedTransaction && (
            <div className="p-10 bg-white" style={{ border: '12px double #F3F4F6' }}>
              {/* Header */}
              <div className="flex justify-between items-start mb-12 pb-8" style={{ borderBottom: '2px solid #F3F4F6' }}>
                <div>
                  <h1 className="text-4xl font-black uppercase tracking-tighter mb-1" style={{ color: '#111827' }}>Contractors<span style={{ color: '#2563EB' }}>BD</span></h1>
                  <p className="text-[10px] uppercase font-bold tracking-[0.3em]" style={{ color: '#9CA3AF' }}>Construction Management System</p>
                </div>
                <div className="text-right">
                  <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase mb-3" style={{ 
                    backgroundColor: selectedTransaction.type === 'income' ? '#DCFCE7' : '#FEE2E2', 
                    color: selectedTransaction.type === 'income' ? '#15803D' : '#B91C1C' 
                  }}>
                    {selectedTransaction.type.toUpperCase()} VOUCHER
                  </div>
                  <p className="text-sm font-black" style={{ color: '#111827' }}>{t('voucher_no')}: <span style={{ color: '#2563EB' }}>TX-{selectedTransaction.id.slice(0, 8).toUpperCase()}</span></p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-y-8 gap-x-16 mb-12">
                <div className="pb-2" style={{ borderBottom: '1px solid #F9FAFB' }}>
                  <label className="text-[10px] uppercase font-bold block mb-1" style={{ color: '#9CA3AF' }}>{t('project')}</label>
                  <p className="text-lg font-bold" style={{ color: '#1F2937' }}>{getDisplayName(selectedTransaction.project)}</p>
                </div>
                <div className="pb-2" style={{ borderBottom: '1px solid #F9FAFB' }}>
                  <label className="text-[10px] uppercase font-bold block mb-1" style={{ color: '#9CA3AF' }}>{t('date_time')}</label>
                  <p className="text-lg font-bold" style={{ color: '#1F2937' }}>{selectedTransaction.time}</p>
                </div>
                <div className="pb-2" style={{ borderBottom: '1px solid #F9FAFB' }}>
                  <label className="text-[10px] uppercase font-bold block mb-1" style={{ color: '#9CA3AF' }}>{selectedTransaction.type === 'income' ? t('payer') : t('payee')}</label>
                  <p className="text-lg font-bold" style={{ color: '#1F2937' }}>{getDisplayName(selectedTransaction.payee_payer) || '—'}</p>
                </div>
                <div className="pb-2" style={{ borderBottom: '1px solid #F9FAFB' }}>
                  <label className="text-[10px] uppercase font-bold block mb-1" style={{ color: '#9CA3AF' }}>{t('category')}</label>
                  <p className="text-lg font-bold" style={{ color: '#1F2937' }}>
                    {getDisplayName(selectedTransaction.category)}
                    {selectedTransaction.subcategory && <span className="text-sm ml-1" style={{ color: '#9CA3AF', fontWeight: 500 }}>/ {getDisplayName(selectedTransaction.subcategory)}</span>}
                  </p>
                </div>
              </div>

              {/* Amount Highlight */}
              <div className="p-10 rounded-[32px] mb-12 flex justify-between items-center" style={{ 
                backgroundColor: selectedTransaction.type === 'income' ? '#F0FDF4' : '#FEF2F2'
              }}>
                <div>
                  <label className="text-[10px] uppercase font-bold block mb-1" style={{ color: '#9CA3AF' }}>{t('amount_val')}</label>
                  <p className="text-xs uppercase font-medium" style={{ color: '#9CA3AF' }}>{selectedTransaction.type === 'income' ? 'Received Amount' : 'Disbursed Amount'}</p>
                </div>
                <span className="text-5xl font-black" style={{ 
                  color: selectedTransaction.type === 'income' ? '#16A34A' : '#DC2626' 
                }}>
                  ৳ {selectedTransaction.amount.toLocaleString('en-US')}
                </span>
              </div>

              {/* Notes */}
              {selectedTransaction.description && (
                <div className="mb-12">
                  <label className="text-[10px] uppercase font-bold block mb-3" style={{ color: '#9CA3AF' }}>{t('note')}</label>
                  <div className="rounded-2xl p-6 italic text-sm leading-relaxed" style={{ 
                    backgroundColor: '#F9FAFB', color: '#4B5563', border: '1px solid #F3F4F6' 
                  }}>
                    "{selectedTransaction.description}"
                  </div>
                </div>
              )}

              {/* Attached Voucher Image */}
              {selectedTransaction.voucher_url && (
                <div className="mb-12 pt-10" style={{ borderTop: '1px solid #F9FAFB' }}>
                   <label className="text-[10px] uppercase font-bold block mb-4" style={{ color: '#9CA3AF' }}>{t('voucher')} (Attached Copy)</label>
                   <div className="max-w-[350px] rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
                      <img 
                        src={selectedTransaction.voucher_url} 
                        className="w-full h-auto"
                        crossOrigin="anonymous"
                      />
                   </div>
                </div>
              )}

              {/* Signature Area */}
              <div className="flex justify-between mt-24 pt-12" style={{ borderTop: '1px solid #F3F4F6' }}>
                <div className="text-center w-56">
                  <div className="h-0.5 mb-3 mx-4" style={{ backgroundColor: '#111827' }}></div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>{t('prepared_by')}</p>
                </div>
                <div className="text-center w-56">
                  <div className="h-0.5 mb-3 mx-4" style={{ backgroundColor: '#111827' }}></div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>{t('authorized')}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-16 text-center">
                <p className="text-[8px] uppercase tracking-[0.5em] font-bold" style={{ color: '#D1D5DB' }}>Generated via ContractorsBD Mobile Application</p>
              </div>
            </div>
          )}
        </div>
      </div>

    </main>


  );
}

