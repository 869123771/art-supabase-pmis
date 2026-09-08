export type PmisPlanKind = 'inspection' | 'patrol' | 'maintenance' | 'preventive'
export type PmisPlanFrequency = 'daily' | 'weekly' | 'tenday' | 'monthly' | 'quarterly' | 'yearly'
export type PmisStatus = 'enabled' | 'disabled'
export type PmisTaskStatus =
  'pending' | 'pending_confirm' | 'completed' | 'completed_overdue' | 'exempt' | 'overdue'

export interface PmisDepartmentOption {
  id: string
  tenantId: string
  parentId?: string | null
  departmentCode: string
  departmentName: string
}

export interface PmisDepartmentTreeOption extends PmisDepartmentOption {
  children?: PmisDepartmentTreeOption[]
}

export interface PmisEmployeeReference {
  id: string
  employeeNo: string
  employeeName: string
}

export interface PmisEquipmentOption {
  id: string
  tenantId: string
  equipmentCode: string
  equipmentName: string
  productionDepartmentId?: string | null
  department?: PmisDepartmentOption | null
  operationStatus: string
  status: PmisStatus
}

export interface PmisPlanItem {
  id?: string
  itemName: string
  requirement: string
  judgmentRule?: string | null
  requirePhoto: boolean
  sort: number
}

export interface PmisPlan {
  id: string
  tenantId: string
  planKind: PmisPlanKind
  planName: string
  frequency: PmisPlanFrequency
  frequencyValue?: number | null
  advanceDays: number
  requiredDays: number
  holidayPolicy: 'advance' | 'postpone'
  notificationRules: unknown[]
  requirePhoto: boolean
  sopFiles: unknown[]
  status: PmisStatus
  remark?: string | null
  createBy?: string | null
  createTime: string
  updateBy?: string | null
  updateTime: string
  items: PmisPlanItem[]
  equipmentBindings: Array<{ equipment: PmisEquipmentOption | null }>
  responsibleBindings: Array<{
    employee: (PmisEmployeeReference & { tenantId: string }) | null
  }>
}

export interface PmisPlanInput {
  tenantId?: string
  planKind: PmisPlanKind
  planName: string
  frequency: PmisPlanFrequency
  frequencyValue?: number | null
  advanceDays: number
  requiredDays: number
  holidayPolicy: 'advance' | 'postpone'
  notificationRules: unknown[]
  requirePhoto: boolean
  sopFiles: unknown[]
  status: PmisStatus
  remark?: string
  items: PmisPlanItem[]
  equipmentIds: string[]
  responsibleEmployeeIds: string[]
}

export interface PmisTaskResult {
  id: string
  resultStatus: 'ok' | 'ng' | 'exempt'
  resultValue?: string | null
  photoFiles: unknown[]
  inspectedAt: string
  remark?: string | null
  item?: PmisPlanItem | null
  inspector?: { id: string; employeeNo: string; employeeName: string } | null
}

export interface PmisTask {
  id: string
  tenantId: string
  taskNo: string
  plannedDate: string
  shiftName?: string | null
  status: Exclude<PmisTaskStatus, 'overdue' | 'completed_overdue'>
  displayStatus: PmisTaskStatus
  completedAt?: string | null
  executionSummary?: string | null
  taskSource: 'scheduled' | 'manual' | 'abnormal'
  dueDate?: string | null
  delegatedAt?: string | null
  beforePhotoFiles: unknown[]
  afterPhotoFiles: unknown[]
  delegate?: { id: string; employeeNo: string; employeeName: string } | null
  confirmer?: { id: string; employeeNo: string; employeeName: string } | null
  confirmedAt?: string | null
  plan: Pick<PmisPlan, 'id' | 'planKind' | 'planName' | 'requiredDays' | 'requirePhoto'> & {
    items: PmisPlanItem[]
  }
  equipment: PmisEquipmentOption
  responsible?: PmisEmployeeReference | null
  results: PmisTaskResult[]
}

export interface PmisPageQuery {
  current?: number
  size?: number
  keyword?: string
  status?: string
  departmentId?: string
  departmentIds?: string[]
  equipmentId?: string
  planId?: string
  dateFrom?: string
  dateTo?: string
  tenantId?: string
}

export interface PmisTaskExecutionResultInput {
  planItemId: string
  resultStatus: 'ok' | 'ng' | 'exempt'
  resultValue?: string | null
  photoFiles: string[]
  remark?: string | null
}

export interface PmisTaskExecutionInput {
  taskId: string
  executorEmployeeId: string
  executionSummary?: string | null
  beforePhotoFiles?: string[]
  afterPhotoFiles?: string[]
  results: PmisTaskExecutionResultInput[]
}

export interface PmisTaskInput {
  tenantId?: string
  planId: string
  equipmentId: string
  plannedDate: string
  responsibleEmployeeId?: string | null
  taskSource?: 'scheduled' | 'manual' | 'abnormal'
  executionSummary?: string | null
}

export type PmisSettingKind = 'maintenance' | 'repair'
export interface PmisDepartmentSetting {
  id: string
  tenantId: string
  settingKind: PmisSettingKind
  departmentId: string
  requireAlbumPhoto: boolean
  notificationMethods: string[]
  urgencyRules: Array<{ urgency: PmisRepairUrgency; requiredHours: number }>
  department?: PmisDepartmentOption | null
  employees: Array<{
    role: 'responsible' | 'confirmer' | 'repairer' | 'notifier'
    employee: PmisEmployeeReference | null
  }>
  escalationRules: Array<{
    id: string
    delayMinutes: number
    notificationMethods: string[]
    notifyEmployeeIds: string[]
  }>
}

export interface PmisDepartmentSettingInput {
  tenantId?: string
  settingKind: PmisSettingKind
  departmentId: string
  requireAlbumPhoto: boolean
  notificationMethods: string[]
  urgencyRules: Array<{ urgency: PmisRepairUrgency; requiredHours: number }>
  responsibleEmployeeIds: string[]
  confirmerEmployeeIds: string[]
  repairerEmployeeIds: string[]
  escalationRules: Array<{
    delayMinutes: number
    notificationMethods: string[]
    notifyEmployeeIds: string[]
  }>
}

export type PmisRepairStatus =
  'reported' | 'in_progress' | 'pending_confirm' | 'completed' | 'overdue'
export type PmisRepairUrgency = 'normal' | 'urgent' | 'expedite' | 'emergency'
export interface PmisRepairTask {
  id: string
  tenantId: string
  workOrderNo: string
  urgency: PmisRepairUrgency
  faultSymptom: string
  faultPhotoFiles: unknown[]
  faultAnalysis?: string | null
  faultCause?: string | null
  solution?: string | null
  repairPhotoFiles: unknown[]
  status: Exclude<PmisRepairStatus, 'overdue'>
  displayStatus: PmisRepairStatus
  reportedAt: string
  requiredCompleteAt?: string | null
  completedAt?: string | null
  confirmedAt?: string | null
  equipment: PmisEquipmentOption
  reporter?: PmisEmployeeReference | null
  repairer?: PmisEmployeeReference | null
  confirmer?: PmisEmployeeReference | null
}

export interface PmisRepairTaskInput {
  tenantId?: string
  equipmentId: string
  urgency: PmisRepairUrgency
  faultSymptom: string
  faultPhotoFiles: string[]
  reporterEmployeeId: string
  repairerEmployeeId?: string | null
  confirmerEmployeeId?: string | null
  faultAnalysis?: string | null
  faultCause?: string | null
  solution?: string | null
  repairPhotoFiles?: string[]
  status?: Exclude<PmisRepairStatus, 'overdue'>
}

export interface PmisTaskOverview {
  total: number
  completed: number
  pending: number
  overdue: number
  exempt: number
  completionRate: number
}

export interface PmisAnalysisItem {
  id: string
  label: string
  description?: string
  total: number
  completed: number
  pending: number
  overdue: number
  completionRate: number
}
