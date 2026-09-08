import type { PmisPlanKind, PmisSettingKind } from '@pmis/api'

export interface PmisPlanPermissionSet {
  view: string
  add: string
  edit: string
  delete: string
  import: string
  export: string
  copy: string
}

export interface PmisTaskPermissionSet {
  view: string
  export: string
  add?: string
  edit?: string
  delete?: string
  copy?: string
  execute?: string
  confirm?: string
}

export interface PmisCalendarPermissionSet {
  view: string
  export: string
  execute?: string
}

export interface PmisSettingPermissionSet {
  view: string
  add: string
  edit: string
  delete: string
  export: string
}

export const pmisPlanPermissions: Record<PmisPlanKind, PmisPlanPermissionSet> = {
  inspection: {
    view: 'PmisInspectionPlan:View',
    add: 'PmisInspectionPlan:Add',
    edit: 'PmisInspectionPlan:Edit',
    delete: 'PmisInspectionPlan:Delete',
    import: 'PmisInspectionPlan:Import',
    export: 'PmisInspectionPlan:Export',
    copy: 'PmisInspectionPlan:Copy'
  },
  patrol: {
    view: 'PmisPatrolPlan:View',
    add: 'PmisPatrolPlan:Add',
    edit: 'PmisPatrolPlan:Edit',
    delete: 'PmisPatrolPlan:Delete',
    import: 'PmisPatrolPlan:Import',
    export: 'PmisPatrolPlan:Export',
    copy: 'PmisPatrolPlan:Copy'
  },
  maintenance: {
    view: 'PmisMaintenancePlan:View',
    add: 'PmisMaintenancePlan:Add',
    edit: 'PmisMaintenancePlan:Edit',
    delete: 'PmisMaintenancePlan:Delete',
    import: 'PmisMaintenancePlan:Import',
    export: 'PmisMaintenancePlan:Export',
    copy: 'PmisMaintenancePlan:Copy'
  },
  preventive: {
    view: 'PmisPreventivePlan:View',
    add: 'PmisPreventivePlan:Add',
    edit: 'PmisPreventivePlan:Edit',
    delete: 'PmisPreventivePlan:Delete',
    import: 'PmisPreventivePlan:Import',
    export: 'PmisPreventivePlan:Export',
    copy: 'PmisPreventivePlan:Copy'
  }
}

export const pmisAnalysisPermissions: Record<PmisPlanKind, string> = {
  inspection: 'PmisInspectionAnalysis:Export',
  patrol: 'PmisPatrolAnalysis:Export',
  maintenance: 'PmisMaintenanceAnalysis:Export',
  preventive: 'PmisPreventiveAnalysis:Export'
}

export const pmisCalendarPermissions = {
  inspectionSheet: {
    view: 'PmisInspectionSheet:ViewDetail',
    export: 'PmisInspectionSheet:Export',
    execute: 'PmisInspectionSheet:Execute'
  },
  inspectionDetail: {
    view: 'PmisInspectionDetail:ViewDetail',
    export: 'PmisInspectionDetail:Export'
  },
  patrolDetail: {
    view: 'PmisPatrolDetail:View',
    export: 'PmisPatrolDetail:Export'
  },
  maintenanceDetail: {
    view: 'PmisMaintenanceDetail:View',
    export: 'PmisMaintenanceDetail:Export'
  },
  preventiveDetail: {
    view: 'PmisPreventiveDetail:View',
    export: 'PmisPreventiveDetail:Export'
  }
} satisfies Record<string, PmisCalendarPermissionSet>

export const pmisTaskPermissions = {
  inspectionReport: {
    view: 'PmisInspectionReport:ViewDetail',
    export: 'PmisInspectionReport:Export'
  },
  patrolTask: {
    view: 'PmisPatrolTask:View',
    export: 'PmisPatrolTask:Export',
    execute: 'PmisPatrolTask:Execute'
  },
  patrolReport: {
    view: 'PmisPatrolReport:View',
    export: 'PmisPatrolReport:Export'
  },
  maintenanceTask: {
    view: 'PmisMaintenanceTask:View',
    add: 'PmisMaintenanceTask:Add',
    edit: 'PmisMaintenanceTask:Edit',
    delete: 'PmisMaintenanceTask:Delete',
    export: 'PmisMaintenanceTask:Export',
    copy: 'PmisMaintenanceTask:Copy',
    execute: 'PmisMaintenanceTask:Execute',
    confirm: 'PmisMaintenanceTask:Confirm'
  },
  maintenanceReport: {
    view: 'PmisMaintenanceReport:View',
    export: 'PmisMaintenanceReport:Export'
  },
  preventiveTask: {
    view: 'PmisPreventiveTask:View',
    add: 'PmisPreventiveTask:Add',
    edit: 'PmisPreventiveTask:Edit',
    delete: 'PmisPreventiveTask:Delete',
    export: 'PmisPreventiveTask:Export',
    copy: 'PmisPreventiveTask:Copy',
    execute: 'PmisPreventiveTask:Execute'
  }
} satisfies Record<string, PmisTaskPermissionSet>

export const pmisSettingPermissions: Record<PmisSettingKind, PmisSettingPermissionSet> = {
  maintenance: {
    view: 'PmisMaintenanceSetting:View',
    add: 'PmisMaintenanceSetting:Add',
    edit: 'PmisMaintenanceSetting:Edit',
    delete: 'PmisMaintenanceSetting:Delete',
    export: 'PmisMaintenanceSetting:Export'
  },
  repair: {
    view: 'PmisRepairSetting:View',
    add: 'PmisRepairSetting:Add',
    edit: 'PmisRepairSetting:Edit',
    delete: 'PmisRepairSetting:Delete',
    export: 'PmisRepairSetting:Export'
  }
}

export const pmisRepairTaskPermissions = {
  view: 'PmisRepairTask:View',
  add: 'PmisRepairTask:Add',
  edit: 'PmisRepairTask:Edit',
  delete: 'PmisRepairTask:Delete',
  export: 'PmisRepairTask:Export',
  copy: 'PmisRepairTask:Copy'
} as const

export const pmisRepairAnalysisPermission = 'PmisRepairAnalysis:Export'
export const pmisInspectionDashboardPermission = 'PmisInspectionDashboard:ViewDetail'

export function resolvePmisCalendarPermissions(
  kind: PmisPlanKind,
  mode: 'sheet' | 'detail'
): PmisCalendarPermissionSet {
  if (kind === 'inspection')
    return mode === 'sheet'
      ? pmisCalendarPermissions.inspectionSheet
      : pmisCalendarPermissions.inspectionDetail
  if (kind === 'patrol') return pmisCalendarPermissions.patrolDetail
  if (kind === 'maintenance') return pmisCalendarPermissions.maintenanceDetail
  return pmisCalendarPermissions.preventiveDetail
}

export function resolvePmisTaskPermissions(
  kind: PmisPlanKind,
  mode: 'task' | 'report'
): PmisTaskPermissionSet {
  if (kind === 'inspection') return pmisTaskPermissions.inspectionReport
  if (kind === 'patrol')
    return mode === 'task' ? pmisTaskPermissions.patrolTask : pmisTaskPermissions.patrolReport
  if (kind === 'maintenance')
    return mode === 'task'
      ? pmisTaskPermissions.maintenanceTask
      : pmisTaskPermissions.maintenanceReport
  return pmisTaskPermissions.preventiveTask
}
