import dayjs from 'dayjs'
import { omit } from 'lodash-es'
import { useSupabase } from '@/hooks'
import type {
  PmisAnalysisItem,
  PmisDepartmentOption,
  PmisEquipmentOption,
  PmisPageQuery,
  PmisPlan,
  PmisPlanInput,
  PmisPlanKind,
  PmisTask,
  PmisTaskOverview,
  PmisTaskStatus
} from './types'

const { supabase, keysToSnakeDeep, responseHandle } = useSupabase()

const equipmentSelect = `
  id, tenant_id, equipment_code, equipment_name, production_department_id,
  operation_status, status,
  department:mdm_production_department!mdm_equipment_production_department_fkey(
    id, tenant_id, parent_id, department_code:code, department_name:name
  )
`

const taskSelect = `
  id, tenant_id, task_no, planned_date, shift_name, status, completed_at, execution_summary,
  plan:pmis_plan!pmis_task_plan_fkey!inner(
    id, plan_kind, plan_name, required_days,
    items:pmis_plan_item(id,item_name,requirement,judgment_rule,require_photo,sort)
  ),
  equipment:mdm_equipment!pmis_task_equipment_fkey!inner(${equipmentSelect}),
  responsible:mdm_employee!pmis_task_employee_fkey(id, employee_no, employee_name),
  results:pmis_task_result(
    id, result_status, result_value, photo_files, inspected_at, remark,
    item:pmis_plan_item!pmis_task_result_item_fkey(id, item_name, requirement, judgment_rule, require_photo, sort),
    inspector:mdm_employee!pmis_task_result_employee_fkey(id, employee_no, employee_name)
  )
`

const displayStatus = (task: Pick<PmisTask, 'status' | 'plannedDate'>): PmisTaskStatus =>
  task.status === 'pending' && dayjs(task.plannedDate).isBefore(dayjs(), 'day')
    ? 'overdue'
    : task.status

const normalizeTask = (task: PmisTask): PmisTask => ({
  ...task,
  displayStatus: displayStatus(task)
})

export async function fetchPmisDepartments(): Promise<PmisDepartmentOption[]> {
  const result = await responseHandle<PmisDepartmentOption[]>(
    () =>
      supabase
        .from('mdm_production_department')
        .select('id,tenant_id,parent_id,department_code:code,department_name:name')
        .eq('enabled', true)
        .order('sort')
        .order('name'),
    { showErrorMessage: true, errorMessage: '部门与产线加载失败，请重试' }
  )
  return result.data ?? []
}

export async function fetchPmisEquipmentOptions(params: PmisPageQuery = {}) {
  const from = Math.max(((params.current ?? 1) - 1) * (params.size ?? 20), 0)
  const to = from + (params.size ?? 20) - 1
  let query = supabase
    .from('mdm_equipment')
    .select(equipmentSelect, { count: 'exact' })
    .eq('status', 'enabled')
    .order('equipment_code')
    .range(from, to)
  if (params.keyword?.trim())
    query = query.or(
      `equipment_code.ilike.%${params.keyword.trim()}%,equipment_name.ilike.%${params.keyword.trim()}%`
    )
  if (params.departmentId) query = query.eq('production_department_id', params.departmentId)
  const result = await responseHandle<PmisEquipmentOption[]>(() => query, {
    showErrorMessage: true,
    errorMessage: '设备列表加载失败，请重试'
  })
  return { data: result.data ?? [], total: result.total ?? 0 }
}

export async function fetchPmisPlans(kind: PmisPlanKind, params: PmisPageQuery = {}) {
  const from = Math.max(((params.current ?? 1) - 1) * (params.size ?? 20), 0)
  const to = from + (params.size ?? 20) - 1
  let query = supabase
    .from('pmis_plan')
    .select(
      `
        *,
        items:pmis_plan_item(id,item_name,requirement,judgment_rule,require_photo,sort),
        equipment_bindings:pmis_plan_equipment(
          equipment:mdm_equipment!pmis_plan_equipment_equipment_fkey(${equipmentSelect})
        ),
        responsible_bindings:pmis_plan_responsible(
          employee:mdm_employee!pmis_plan_responsible_employee_fkey(
            id, tenant_id, employee_no, employee_name
          )
        )
      `,
      { count: 'exact' }
    )
    .eq('plan_kind', kind)
    .order('update_time', { ascending: false })
    .range(from, to)
  if (params.keyword?.trim()) query = query.ilike('plan_name', `%${params.keyword.trim()}%`)
  if (params.status) query = query.eq('status', params.status)
  const result = await responseHandle<PmisPlan[]>(() => query, {
    showErrorMessage: true,
    errorMessage: `${kind === 'inspection' ? '点检' : '巡检'}方案加载失败，请重试`
  })
  return { data: result.data ?? [], total: result.total ?? 0 }
}

export async function savePmisPlan(input: PmisPlanInput, id?: string) {
  await responseHandle<string>(
    () =>
      supabase.rpc('pmis_save_plan_secure', {
        p_id: id ?? null,
        p_payload: keysToSnakeDeep(omit(input, ['id']))
      }),
    {
      breakReturn: true,
      showMessage: true,
      showErrorMessage: true,
      message: id ? '方案已更新' : '方案已创建',
      errorMessage: '方案保存失败，请检查名称、项目和适用设备'
    }
  )
}

export async function deletePmisPlans(ids: string[], kind: PmisPlanKind) {
  await responseHandle<number>(
    () => supabase.rpc('pmis_delete_plans_secure', { p_ids: ids, p_kind: kind }),
    {
      breakReturn: true,
      showMessage: true,
      showErrorMessage: true,
      message: '方案已删除',
      errorMessage: '方案删除失败，请先解除适用设备或保留已有执行记录'
    }
  )
}

export async function fetchPmisTasks(kind: PmisPlanKind, params: PmisPageQuery = {}) {
  const from = Math.max(((params.current ?? 1) - 1) * (params.size ?? 20), 0)
  const to = from + (params.size ?? 20) - 1
  let query = supabase
    .from('pmis_task')
    .select(taskSelect, { count: 'exact' })
    .eq('plan.plan_kind', kind)
    .order('planned_date', { ascending: false })
    .order('task_no')
    .range(from, to)
  if (params.keyword?.trim()) query = query.ilike('task_no', `%${params.keyword.trim()}%`)
  if (params.equipmentId) query = query.eq('equipment_id', params.equipmentId)
  if (params.departmentIds?.length)
    query = query.in('equipment.production_department_id', params.departmentIds)
  if (params.planId) query = query.eq('plan_id', params.planId)
  if (params.dateFrom) query = query.gte('planned_date', params.dateFrom)
  if (params.dateTo) query = query.lte('planned_date', params.dateTo)
  if (params.status && params.status !== 'overdue') query = query.eq('status', params.status)
  const result = await responseHandle<PmisTask[]>(() => query, {
    showErrorMessage: true,
    errorMessage: `${kind === 'inspection' ? '点检' : '巡检'}任务加载失败，请重试`
  })
  let rows = (result.data ?? []).map(normalizeTask)
  if (params.departmentId)
    rows = rows.filter((row) => row.equipment?.productionDepartmentId === params.departmentId)
  if (params.status === 'overdue') rows = rows.filter((row) => row.displayStatus === 'overdue')
  return {
    data: rows,
    total: params.departmentId || params.status === 'overdue' ? rows.length : (result.total ?? 0)
  }
}

export async function fetchPmisTaskSnapshot(kind: PmisPlanKind, params: PmisPageQuery = {}) {
  const result = await fetchPmisTasks(kind, { ...params, current: 1, size: 5000 })
  return result.data
}

export function summarizePmisTasks(tasks: PmisTask[]): PmisTaskOverview {
  const completed = tasks.filter((item) => item.displayStatus === 'completed').length
  const pending = tasks.filter((item) => item.displayStatus === 'pending').length
  const overdue = tasks.filter((item) => item.displayStatus === 'overdue').length
  const exempt = tasks.filter((item) => item.displayStatus === 'exempt').length
  const denominator = Math.max(tasks.length - exempt, 0)
  return {
    total: tasks.length,
    completed,
    pending,
    overdue,
    exempt,
    completionRate: denominator ? Math.round((completed / denominator) * 1000) / 10 : 0
  }
}

export function analyzePmisTasks(tasks: PmisTask[], dimension: 'department' | 'equipment') {
  const groups = new Map<string, PmisTask[]>()
  tasks.forEach((task) => {
    const key =
      dimension === 'department' ? task.equipment.department?.id || 'unassigned' : task.equipment.id
    groups.set(key, [...(groups.get(key) ?? []), task])
  })
  return [...groups.entries()]
    .map(([id, rows]): PmisAnalysisItem => {
      const overview = summarizePmisTasks(rows)
      const equipment = rows[0]?.equipment
      return {
        id,
        label:
          dimension === 'department'
            ? equipment?.department?.departmentName || '未分配产线'
            : equipment?.equipmentName || '未知设备',
        description:
          dimension === 'department'
            ? `${new Set(rows.map((row) => row.equipment.id)).size} 台设备`
            : equipment?.equipmentCode,
        ...overview
      }
    })
    .sort(
      (left, right) => right.overdue - left.overdue || left.completionRate - right.completionRate
    )
}
