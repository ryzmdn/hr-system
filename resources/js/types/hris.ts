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
