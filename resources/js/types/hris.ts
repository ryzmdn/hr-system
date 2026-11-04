export interface Company {
    id: number;
    code: string;
    name: string;
    tax_id: string | null;
    bpjs_ketenagakerjaan_no: string | null;
    bpjs_kesehatan_no: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    is_active: boolean;
    branches_count?: number;
    departments_count?: number;
}

export interface Branch {
    id: number;
    company_id?: number;
    code: string;
    name: string;
    latitude: number;
    longitude: number;
    radius_meters: number;
    timezone: string;
    timezone_label?: string;
    jkk_risk_grade: string;
    jkk_risk_label?: string;
    address: string | null;
    is_active: boolean;
    employees_count?: number;
}

export interface Department {
    id: number;
    company_id: number;
    parent_id: number | null;
    code: string;
    name: string;
    is_active: boolean;
    parent?: Department | null;
    positions?: JobPosition[];
    employees_count?: number;
}

export interface JobGrade {
    id: number;
    grade_level: number;
    name: string;
    min_salary: number;
    max_salary: number;
    positions_count?: number;
}

export interface JobPosition {
    id: number;
    department_id: number;
    job_grade_id: number | null;
    code: string;
    name: string;
    description: string | null;
    is_active: boolean;
    grade?: JobGrade | null;
}

export interface EmployeeListItem {
    id: number;
    nik: string;
    name: string;
    email: string;
    phone_number: string | null;
    gender: string;
    employment_status: string;
    employment_status_label: string;
    status: string;
    status_label: string;
    join_date: string;
    branch: { id: number; name: string } | null;
    department: { id: number; name: string } | null;
    position: { id: number; name: string } | null;
    manager: { id: number; name: string } | null;
    effective_salary: number | null;
    bank_name?: string | null;
    bank_account_number?: string | null;
}

export interface EmployeeDetail {
    id: number;
    nik: string;
    name: string;
    email: string;
    phone_number: string | null;
    id_card_number: string;
    tax_number: string | null;
    bank_name: string | null;
    bank_account_number: string | null;
    bank_account_holder: string | null;
    gender: string;
    birth_place: string | null;
    birth_date: string | null;
    marital_status: string;
    tax_ptkp_status: string;
    employment_status: string;
    employment_status_label: string;
    status: string;
    status_label: string;
    join_date: string;
    probation_end_date: string | null;
    contract_end_date: string | null;
    branch: { id: number; name: string } | null;
    department: { id: number; name: string } | null;
    position: { id: number; name: string } | null;
    manager: { id: number; name: string } | null;
    subordinates_count: number;
    current_salary: number | null;
}

export interface EmployeeCareerHistoryItem {
    id: number;
    change_type: string;
    change_type_label: string;
    effective_start_date: string;
    effective_end_date: string | null;
    base_salary: number | null;
    branch: string;
    department: string;
    position: string;
    manager: string | null;
    approved_by: string | null;
    reason: string | null;
}

export interface PendingApprovalItem {
    id: number;
    module: string;
    module_label: string;
    workflow_name: string;
    current_step_order: number;
    current_step_name: string;
    total_steps: number;
    status: string;
    status_label: string;
    requester: {
        name: string;
        email: string;
        department: string;
        branch: string;
    };
    notes: string | null;
    created_at: string;
}

export interface ApprovalHistoryItem {
    id: number;
    workflow_name: string;
    requester_name: string;
    status: string;
    status_label: string;
    updated_at: string;
}

export interface DelegationItem {
    id: number;
    is_outgoing: boolean;
    delegator_name: string;
    delegatee_name: string;
    start_date: string;
    end_date: string;
    reason: string | null;
    is_active: boolean;
}

export interface WorkflowItem {
    id: number;
    module: string;
    module_label: string;
    name: string;
    description: string | null;
    is_active: boolean;
    steps: {
        id: number;
        step_order: number;
        name: string;
        approver_type: string;
        approver_type_label: string;
        role_name?: string | null;
        user_name?: string | null;
    }[];
}

export interface AuditLogItem {
    id: number;
    event: string;
    auditable_type: string;
    auditable_id: number;
    old_values: Record<string, unknown> | null;
    new_values: Record<string, unknown> | null;
    user_name: string;
    ip_address: string | null;
    created_at: string;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

export interface ShiftTemplateItem {
    id: number;
    code: string;
    name: string;
    start_time: string;
    end_time: string;
    is_cross_day: boolean;
    break_minutes: number;
    grace_period_minutes: number;
    is_active: boolean;
}

export interface EmployeeRosterItem {
    id: number;
    employee_id: number;
    date: string;
    shift_name: string;
    shift_code: string;
    is_off_day: boolean;
}

export interface AttendanceLiveLog {
    id: number;
    employee_name: string;
    employee_nik: string;
    branch_name: string;
    type: string;
    type_label: string;
    recorded_at: string;
    distance_meters: number;
    is_within_geofence: boolean;
    verification_status: string;
    verification_label: string;
    selfie_url: string | null;
}

export interface LeaveTypeItem {
    id: number;
    code: string;
    name: string;
    default_quota: number;
    is_paid: boolean;
    requires_attachment: boolean;
    max_consecutive_days: number | null;
    is_active: boolean;
}

export interface LeaveBalanceItem {
    id: number;
    leave_type_name: string;
    allocated_days: number;
    used_days: number;
    remaining_days: number;
}

export interface LeaveRequestItem {
    id: number;
    employee_name: string;
    employee_nik: string;
    leave_type_name: string;
    start_date: string;
    end_date: string;
    total_days: number;
    reason: string;
    status: string;
    created_at: string;
}

export interface OvertimeRequestItem {
    id: number;
    employee_name: string;
    employee_nik: string;
    branch_name: string;
    date: string;
    start_time: string;
    end_time: string;
    is_holiday: boolean;
    duration_hours: number;
    calculated_overtime_hours: number;
    estimated_pay: number;
    reason: string;
    status: string;
}

export interface SalaryComponentItem {
    id: number;
    code: string;
    name: string;
    type: string;
    is_taxable: boolean;
    is_bpjs_tk_base: boolean;
    is_bpjs_kes_base: boolean;
    default_amount: number;
    is_active: boolean;
    employee_components_count?: number;
}

export interface EmployeeSalaryComponentItem {
    id: number;
    employee_id: number;
    salary_component_id: number;
    amount: number;
    component?: SalaryComponentItem;
}

export interface PayrollPeriodItem {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    cut_off_date: string;
    status: string;
    runs?: PayrollRunItem[];
}

export interface PayrollRunItem {
    id: number;
    payroll_period_id: number;
    branch_id: number | null;
    total_gross: number;
    total_net: number;
    total_tax: number;
    total_bpjs_company: number;
    total_bpjs_employee: number;
    status: string;
    processed_at: string | null;
    branch?: { id: number; name: string } | null;
    period?: PayrollPeriodItem;
    payslips?: PayslipItem[];
}

export interface PayslipItem {
    id: number;
    payroll_run_id: number;
    employee_id: number;
    basic_salary: number;
    gross_income: number;
    total_deductions: number;
    take_home_pay: number;
    overtime_pay: number;
    tax_pph21_method: string;
    tax_pph21_ter_category: string;
    tax_pph21_rate: number;
    tax_pph21_amount: number;
    bpjs_jkk_company: number;
    bpjs_jkm_company: number;
    bpjs_jht_company: number;
    bpjs_jht_employee: number;
    bpjs_jp_company: number;
    bpjs_jp_employee: number;
    bpjs_kes_company: number;
    bpjs_kes_employee: number;
    loan_deduction: number;
    components_snapshot: {
        basic_salary: number;
        allowances: Array<{ name: string; code: string; amount: number; is_taxable: boolean }>;
        overtime: { hours: number; rate_per_hour: number; amount: number };
        bpjs_company: { jkk: number; jkm: number; jht: number; jp: number; kes: number; total: number };
        bpjs_employee: { jht: number; jp: number; kes: number; total: number };
        tax_pph21: { method: string; ptkp: string; ter_category: string; rate: number; taxable_gross: number; tax_amount: number };
        loan: { deduction: number; installment_id?: number | null; loan_id?: number | null };
        other_deductions: Array<{ name: string; code: string; amount: number }>;
        gross_income: number;
        total_deductions: number;
        take_home_pay: number;
    };
    is_published: boolean;
    downloaded_at: string | null;
    employee?: {
        id: number;
        nik: string;
        name: string;
        bank_name?: string | null;
        bank_account_number?: string | null;
        bank_account_holder?: string | null;
        tax_number?: string | null;
        tax_ptkp_status?: string | null;
        branch?: { id: number; name: string } | null;
        department?: { id: number; name: string } | null;
        position?: { id: number; name: string } | null;
    };
    run?: PayrollRunItem;
}

export interface LoanInstallmentItem {
    id: number;
    loan_id: number;
    payroll_period_id: number | null;
    installment_number: number;
    amount: number;
    is_paid: boolean;
    paid_at: string | null;
}

export interface EmployeeLoanItem {
    id: number;
    employee_id: number;
    loan_number: string;
    total_amount: number;
    installment_months: number;
    monthly_amount: number;
    remaining_amount: number;
    start_month: string;
    reason: string;
    status: string;
    employee?: {
        id: number;
        nik: string;
        name: string;
        branch?: { name: string } | null;
    };
    installments?: LoanInstallmentItem[];
}

export interface BankDisbursementBatchItem {
    id: number;
    payroll_run_id: number;
    bank_name: string;
    batch_reference: string;
    total_records: number;
    total_amount: number;
    file_path: string;
    created_at: string;
    payroll_run?: PayrollRunItem;
    exported_by?: { name: string };
}

