export type PmisPlanKind = 'inspection' | 'patrol'
export type PmisPlanFrequency = 'daily' | 'weekly' | 'tenday' | 'monthly' | 'quarterly' | 'yearly'
export type PmisStatus = 'enabled' | 'disabled'
export type PmisTaskStatus = 'pending' | 'completed' | 'exempt' | 'overdue'

export interface PmisDepartmentOption {
  id: string
  tenantId: string
  parentId?: string | null
  departmentCode: string
  departmentName: string
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
    employee: { id: string; tenantId: string; employeeNo: string; employeeName: string } | null
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
  status: Exclude<PmisTaskStatus, 'overdue'>
  displayStatus: PmisTaskStatus
  completedAt?: string | null
  executionSummary?: string | null
  plan: Pick<PmisPlan, 'id' | 'planKind' | 'planName' | 'requiredDays'> & { items: PmisPlanItem[] }
  equipment: PmisEquipmentOption
  responsible?: { id: string; employeeNo: string; employeeName: string } | null
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
