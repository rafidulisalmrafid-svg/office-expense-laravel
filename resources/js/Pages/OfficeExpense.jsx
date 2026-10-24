import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

// Components
import Header from '../Components/Header';
import DesktopNav from '../Components/DesktopNav';
import BottomNav from '../Components/BottomNav';

// Tabs
import OverviewTab from '../Components/Tabs/OverviewTab';
import ProjectsTab from '../Components/Tabs/ProjectsTab';
import RequestsTab from '../Components/Tabs/RequestsTab';
import ExpensesTab from '../Components/Tabs/ExpensesTab';
import CategoriesTab from '../Components/Tabs/CategoriesTab';
import ReturnsTab from '../Components/Tabs/ReturnsTab';
import EmployeesTab from '../Components/Tabs/EmployeesTab';
import ReportsTab from '../Components/Tabs/ReportsTab';
import AuditTab from '../Components/Tabs/AuditTab';

// Modals
import RequestFundModal from '../Components/Modals/RequestFundModal';
import ReviewRequestModal from '../Components/Modals/ReviewRequestModal';
import DisburseFundModal from '../Components/Modals/DisburseFundModal';
import AddExpenseModal from '../Components/Modals/AddExpenseModal';
import EditExpenseModal from '../Components/Modals/EditExpenseModal';
import PayExpenseModal from '../Components/Modals/PayExpenseModal';
import CategoryFormModal from '../Components/Modals/CategoryFormModal';
import VerifyExpenseModal from '../Components/Modals/VerifyExpenseModal';
import FundReturnModal from '../Components/Modals/FundReturnModal';
import ReceiptModal from '../Components/Modals/ReceiptModal';
import AddEmployeeModal from '../Components/Modals/AddEmployeeModal';
import DailyClosingModal from '../Components/Modals/DailyClosingModal';
import EmailSetupModal from '../Components/Modals/EmailSetupModal';
import CreateProjectModal from '../Components/Modals/CreateProjectModal';
import AllocateProjectModal from '../Components/Modals/AllocateProjectModal';
import FinishProjectModal from '../Components/Modals/FinishProjectModal';
import RequestDocumentModal from '../Components/Modals/RequestDocumentModal';
import UploadProjectDocumentModal from '../Components/Modals/UploadProjectDocumentModal';
import ReviewSettlementModal from '../Components/Modals/ReviewSettlementModal';
import ManageProjectTeamModal from '../Components/Modals/ManageProjectTeamModal';

export default function OfficeExpense({
    is_employee = false,
    users = [],
    active_user = null,
    active_role = 'admin',
    office_summary = {},
    projects = [],
    fund_requests = [],
    fund_allocations = [],
    expenses = [],
    fund_returns = [],
    categories = [],
    audit_logs = [],
    daily_closings = [],
    active_user_pending_allocations = [],
    chart_data = {},
    mail_settings = {},
    flash = {},
}) {
    const isEmployeeUser = is_employee || (active_user && active_user.role === 'employee');

    // Current Active Role & User
    const [role, setRole] = useState(() => {
        if (isEmployeeUser) {
            return 'employee';
        }
        return active_role || 'admin';
    });
    const [currentUser, setCurrentUser] = useState(() => active_user || users.find(u => u.role === 'employee') || users[0]);

    // Active Tab: overview, requests, expenses, returns, employees, reports, audit
    const [activeTab, setActiveTab] = useState('overview');

    // Ensure employee cannot navigate to admin-only tabs
    useEffect(() => {
        if (isEmployeeUser && (activeTab === 'employees' || activeTab === 'reports' || activeTab === 'categories')) {
            setActiveTab('overview');
        }
    }, [activeTab, isEmployeeUser]);

    // Language & Number format preferences
    const [useBanglaDigits, setUseBanglaDigits] = useState(() => {
        const saved = localStorage.getItem('office_use_bangla_digits');
        return saved !== null ? saved === 'true' : true;
    });

    // Dark Mode
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('office_dark_mode') === 'true';
    });

    // Modals state
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [reviewRequest, setReviewRequest] = useState(null); // request object for ReviewRequestModal
    const [disburseRequest, setDisburseRequest] = useState(null); // request object for DisburseFundModal
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [verifyExpense, setVerifyExpense] = useState(null); // expense object for VerifyExpenseModal
    const [payExpenseItem, setPayExpenseItem] = useState(null); // expense object for PayExpenseModal
    const [editExpenseItem, setEditExpenseItem] = useState(null); // expense object for EditExpenseModal
    const [categoryModalData, setCategoryModalData] = useState(null); // category object for CategoryFormModal (or {} for new)
    const [returnUser, setReturnUser] = useState(null); // employee for FundReturnModal
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [receiptData, setReceiptData] = useState(null); // { src, title }
    const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
    const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);
    const [isEmailSetupModalOpen, setIsEmailSetupModalOpen] = useState(false);

    // Project Modals state
    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
    const [allocateProject, setAllocateProject] = useState(null);
    const [finishProjectItem, setFinishProjectItem] = useState(null);
    const [requestDocProject, setRequestDocProject] = useState(null);
    const [uploadDocProjectData, setUploadDocProjectData] = useState(null); // { project, documentRequest }
    const [reviewSettlementItem, setReviewSettlementItem] = useState(null);
    const [manageTeamProject, setManageTeamProject] = useState(null);
    const [selectedExpenseProjectId, setSelectedExpenseProjectId] = useState(null);
    const [selectedExpenseDate, setSelectedExpenseDate] = useState(null);

    const handleOpenExpenseModal = (date = null, projId = null) => {
        setSelectedExpenseDate(typeof date === 'string' ? date : null);
        setSelectedExpenseProjectId(projId || null);
        setIsExpenseModalOpen(true);
    };

    const handleOpenAddExpenseForProject = (proj, date = null) => {
        setSelectedExpenseProjectId(proj ? proj.id : null);
        setSelectedExpenseDate(typeof date === 'string' ? date : null);
        setIsExpenseModalOpen(true);
    };

    // Flash Toast state
    const [toastMessage, setToastMessage] = useState(null);

    // Synchronize role and user when active_user prop updates
    useEffect(() => {
        if (active_user) {
            setCurrentUser(active_user);
            if (active_user.role === 'employee' || is_employee) {
                setRole('employee');
            } else if (active_role) {
                setRole(active_role);
            }
        }
    }, [active_user, active_role, is_employee]);

    // Save preferences
    useEffect(() => {
        if (role && !isEmployeeUser) {
            localStorage.setItem('office_active_role', role);
        }
    }, [role, isEmployeeUser]);

    useEffect(() => {
        localStorage.setItem('office_use_bangla_digits', String(useBanglaDigits));
    }, [useBanglaDigits]);

    useEffect(() => {
        localStorage.setItem('office_dark_mode', String(darkMode));
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    useEffect(() => {
        if (flash.success) {
            setToastMessage({ type: 'success', text: flash.success });
            const timer = setTimeout(() => setToastMessage(null), 5000);
            return () => clearTimeout(timer);
        } else if (flash.error) {
            setToastMessage({ type: 'error', text: flash.error });
            const timer = setTimeout(() => setToastMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    // Role switcher (Locked for employees)
    const handleRoleChange = (newRole) => {
        if (isEmployeeUser) return;
        setRole(newRole);
        if (newRole === 'admin') {
            const adminUser = users.find(u => u.role === 'admin') || users[0];
            setCurrentUser(adminUser);
        } else {
            const employeeUser = users.find(u => u.role === 'employee' && u.status === 'approved') || users[0];
            setCurrentUser(employeeUser);
        }
    };

    // Employee switch handler (Locked for employees)
    const handleUserChange = (selectedUser) => {
        if (isEmployeeUser) return;
        setCurrentUser(selectedUser);
        if (selectedUser.role === 'admin') {
            setRole('admin');
        } else {
            setRole('employee');
        }
    };

    // Employee Handshake: Confirm receipt of allocated cash
    const handleConfirmAllocation = (allocation) => {
        router.post(`/fund-allocations/${allocation.id}/confirm`, {}, {
            preserveScroll: true,
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200 pb-28 lg:pb-12">
            <Head title="অফিস ফান্ড ও খরচ ব্যবস্থাপনা - Office Expense Manager" />

            {/* Header */}
            <Header
                activeRole={role}
                onRoleChange={handleRoleChange}
                users={users}
                activeUser={currentUser}
                onUserChange={handleUserChange}
                useBanglaDigits={useBanglaDigits}
                onToggleDigits={() => setUseBanglaDigits(!useBanglaDigits)}
                darkMode={darkMode}
                onToggleDarkMode={() => setDarkMode(!darkMode)}
                officeSummary={office_summary}
                activeUserPendingAllocations={active_user_pending_allocations}
            />

            {/* Desktop Navigation */}
            <DesktopNav
                activeTab={activeTab}
                onTabChange={setActiveTab}
                officeSummary={office_summary}
                activeRole={role}
                activeUserPendingAllocations={active_user_pending_allocations}
            />

            {/* Floating Toast Notification */}
            {toastMessage && (
                <div className="fixed top-20 right-4 sm:right-8 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                    <div className={`p-4 rounded-2xl shadow-xl border flex items-center gap-3 text-xs sm:text-sm font-bold ${
                        toastMessage.type === 'success'
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/20'
                            : 'bg-rose-600 text-white border-rose-500 shadow-rose-500/20'
                    }`}>
                        {toastMessage.type === 'success' ? (
                            <CheckCircle2 className="w-5 h-5 shrink-0" />
                        ) : (
                            <AlertCircle className="w-5 h-5 shrink-0" />
                        )}
                        <span>{toastMessage.text}</span>
                        <button
                            type="button"
                            onClick={() => setToastMessage(null)}
                            className="p-1 hover:bg-white/20 rounded-lg transition-colors ml-2"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
                {activeTab === 'overview' && (
                    <OverviewTab
                        activeRole={role}
                        activeUser={currentUser}
                        officeSummary={office_summary}
                        chartData={chart_data}
                        activeUserPendingAllocations={active_user_pending_allocations}
                        onOpenRequestModal={() => setIsRequestModalOpen(true)}
                        onOpenExpenseModal={() => setIsExpenseModalOpen(true)}
                        onOpenDisburseModal={() => setDisburseRequest({})}
                        onOpenReturnModal={(emp) => {
                            setReturnUser(emp);
                            setIsReturnModalOpen(true);
                        }}
                        onOpenClosingModal={() => setIsClosingModalOpen(true)}
                        onOpenEmailSetupModal={() => setIsEmailSetupModalOpen(true)}
                        onConfirmAllocation={handleConfirmAllocation}
                        onNavigateTab={setActiveTab}
                        projects={projects}
                        onOpenAddExpenseForProject={handleOpenAddExpenseForProject}
                        useBanglaDigits={useBanglaDigits}
                    />
                )}

                {activeTab === 'projects' && (
                    <ProjectsTab
                        projects={projects}
                        activeUser={currentUser}
                        activeRole={role}
                        users={users}
                        useBanglaDigits={useBanglaDigits}
                        onOpenCreateProject={() => setIsCreateProjectModalOpen(true)}
                        onOpenAllocateFund={(proj) => setAllocateProject(proj)}
                        onOpenAddExpenseForProject={handleOpenAddExpenseForProject}
                        onOpenFinishProject={(proj) => setFinishProjectItem(proj)}
                        onOpenRequestDocument={(proj) => setRequestDocProject(proj)}
                        onOpenUploadDocument={(proj, req) => setUploadDocProjectData({ project: proj, documentRequest: req })}
                        onOpenReviewSettlement={(settlement) => setReviewSettlementItem(settlement)}
                        onOpenManageTeam={(proj) => setManageTeamProject(proj)}
                        onViewReceipt={(data) => setReceiptData(data)}
                    />
                )}

                {activeTab === 'requests' && (
                    <RequestsTab
                        activeRole={role}
                        activeUser={currentUser}
                        fundRequests={fund_requests}
                        onOpenRequestModal={() => setIsRequestModalOpen(true)}
                        onOpenReviewModal={(req) => setReviewRequest(req)}
                        onOpenDisburseModal={(req) => setDisburseRequest(req)}
                        onConfirmAllocation={handleConfirmAllocation}
                        useBanglaDigits={useBanglaDigits}
                    />
                )}

                {activeTab === 'expenses' && (
                    <ExpensesTab
                        activeRole={role}
                        activeUser={currentUser}
                        expenses={expenses}
                        categories={categories}
                        fundAllocations={fund_allocations}
                        users={users}
                        onOpenExpenseModal={handleOpenExpenseModal}
                        onOpenVerifyModal={(exp) => setVerifyExpense(exp)}
                        onOpenPayModal={(exp) => setPayExpenseItem(exp)}
                        onOpenEditModal={(exp) => setEditExpenseItem(exp)}
                        onViewReceipt={(src, title) => setReceiptData({ src, title })}
                        useBanglaDigits={useBanglaDigits}
                    />
                )}

                {activeTab === 'returns' && (
                    <ReturnsTab
                        activeRole={role}
                        activeUser={currentUser}
                        fundReturns={fund_returns}
                        users={users}
                        onOpenReturnModal={(emp) => {
                            setReturnUser(emp);
                            setIsReturnModalOpen(true);
                        }}
                        useBanglaDigits={useBanglaDigits}
                    />
                )}

                {activeTab === 'categories' && (
                    <CategoriesTab
                        categories={categories}
                        activeRole={role}
                        onOpenCreateCategory={() => setCategoryModalData({})}
                        onOpenEditCategory={(cat) => setCategoryModalData(cat)}
                        useBanglaDigits={useBanglaDigits}
                    />
                )}

                {activeTab === 'employees' && (
                    <EmployeesTab
                        activeRole={role}
                        users={users}
                        expenses={expenses}
                        fundAllocations={fund_allocations}
                        projects={projects}
                        onOpenAddEmployeeModal={() => setIsAddEmployeeModalOpen(true)}
                        onOpenEmailSetupModal={() => setIsEmailSetupModalOpen(true)}
                        onSelectUserForSimulation={handleUserChange}
                        onViewReceipt={(data) => setReceiptData(data)}
                        useBanglaDigits={useBanglaDigits}
                    />
                )}

                {activeTab === 'reports' && (
                    <ReportsTab
                        activeRole={role}
                        users={users}
                        fundAllocations={fund_allocations}
                        expenses={expenses}
                        fundReturns={fund_returns}
                        dailyClosings={daily_closings}
                        officeSummary={office_summary}
                        onOpenClosingModal={() => setIsClosingModalOpen(true)}
                        useBanglaDigits={useBanglaDigits}
                    />
                )}

                {activeTab === 'audit' && (
                    <AuditTab
                        activeRole={role}
                        auditLogs={audit_logs}
                        useBanglaDigits={useBanglaDigits}
                    />
                )}
            </main>

            {/* Mobile Bottom Navigation Bar */}
            <BottomNav
                activeTab={activeTab}
                onTabChange={setActiveTab}
                officeSummary={office_summary}
                activeRole={role}
                activeUserPendingAllocations={active_user_pending_allocations}
            />

            {/* Modals */}
            <RequestFundModal
                isOpen={isRequestModalOpen}
                onClose={() => setIsRequestModalOpen(false)}
                activeUser={currentUser}
                useBanglaDigits={useBanglaDigits}
            />

            <ReviewRequestModal
                isOpen={!!reviewRequest}
                onClose={() => setReviewRequest(null)}
                request={reviewRequest}
                useBanglaDigits={useBanglaDigits}
            />

            <DisburseFundModal
                isOpen={!!disburseRequest}
                onClose={() => setDisburseRequest(null)}
                request={disburseRequest?.id ? disburseRequest : null}
                users={users}
                projects={projects}
                useBanglaDigits={useBanglaDigits}
            />

            <AddExpenseModal
                isOpen={isExpenseModalOpen}
                onClose={() => {
                    setIsExpenseModalOpen(false);
                    setSelectedExpenseProjectId(null);
                    setSelectedExpenseDate(null);
                }}
                activeUser={currentUser}
                categories={categories}
                projects={projects}
                initialProjectId={selectedExpenseProjectId}
                initialDate={selectedExpenseDate}
                useBanglaDigits={useBanglaDigits}
            />

            <VerifyExpenseModal
                isOpen={!!verifyExpense}
                onClose={() => setVerifyExpense(null)}
                expense={verifyExpense}
                onViewReceipt={(src, title) => setReceiptData({ src, title })}
                useBanglaDigits={useBanglaDigits}
            />

            <PayExpenseModal
                isOpen={!!payExpenseItem}
                onClose={() => setPayExpenseItem(null)}
                expense={payExpenseItem}
                useBanglaDigits={useBanglaDigits}
            />

            <EditExpenseModal
                isOpen={!!editExpenseItem}
                onClose={() => setEditExpenseItem(null)}
                expense={editExpenseItem}
                categories={categories}
                useBanglaDigits={useBanglaDigits}
            />

            <CategoryFormModal
                isOpen={!!categoryModalData}
                onClose={() => setCategoryModalData(null)}
                category={categoryModalData?.id ? categoryModalData : null}
            />

            <FundReturnModal
                isOpen={isReturnModalOpen}
                onClose={() => {
                    setIsReturnModalOpen(false);
                    setReturnUser(null);
                }}
                users={users}
                preSelectedUser={returnUser}
                useBanglaDigits={useBanglaDigits}
            />

            <ReceiptModal
                isOpen={!!receiptData}
                onClose={() => setReceiptData(null)}
                receiptSrc={receiptData?.src}
                title={receiptData?.title}
            />

            <AddEmployeeModal
                isOpen={isAddEmployeeModalOpen}
                onClose={() => setIsAddEmployeeModalOpen(false)}
            />

            <DailyClosingModal
                isOpen={isClosingModalOpen}
                onClose={() => setIsClosingModalOpen(false)}
                officeSummary={office_summary}
                useBanglaDigits={useBanglaDigits}
            />

            <EmailSetupModal
                isOpen={isEmailSetupModalOpen}
                onClose={() => setIsEmailSetupModalOpen(false)}
                senderEmail="rafidul.labar.bd@gmail.com"
                isConfigured={mail_settings?.is_configured}
                statusText={mail_settings?.status_text}
            />

            {/* Project Management Modals */}
            <CreateProjectModal
                isOpen={isCreateProjectModalOpen}
                onClose={() => setIsCreateProjectModalOpen(false)}
                users={users}
                useBanglaDigits={useBanglaDigits}
            />

            <AllocateProjectModal
                isOpen={!!allocateProject}
                onClose={() => setAllocateProject(null)}
                project={allocateProject}
                users={users}
                useBanglaDigits={useBanglaDigits}
            />

            <FinishProjectModal
                isOpen={!!finishProjectItem}
                onClose={() => setFinishProjectItem(null)}
                project={finishProjectItem}
                activeUser={currentUser}
                useBanglaDigits={useBanglaDigits}
            />

            <RequestDocumentModal
                isOpen={!!requestDocProject}
                onClose={() => setRequestDocProject(null)}
                project={requestDocProject}
                users={users}
                useBanglaDigits={useBanglaDigits}
            />

            <UploadProjectDocumentModal
                isOpen={!!uploadDocProjectData}
                onClose={() => setUploadDocProjectData(null)}
                project={uploadDocProjectData?.project}
                documentRequest={uploadDocProjectData?.documentRequest}
                useBanglaDigits={useBanglaDigits}
            />

            <ReviewSettlementModal
                isOpen={!!reviewSettlementItem}
                onClose={() => setReviewSettlementItem(null)}
                settlement={reviewSettlementItem}
                onRequestMoreDocs={(proj) => setRequestDocProject(proj)}
                onViewReceipt={(data) => setReceiptData(data)}
                useBanglaDigits={useBanglaDigits}
            />

            <ManageProjectTeamModal
                isOpen={!!manageTeamProject}
                onClose={() => setManageTeamProject(null)}
                project={manageTeamProject}
                users={users}
                useBanglaDigits={useBanglaDigits}
            />

        </div>
    );
}
