<template>
  <div class="pmis-calendar art-page-view business-workspace-page art-full-height">
    <BusinessWorkspaceHeader
      eyebrow="DAILY INSPECTION"
      :title="mode === 'sheet' ? '点检表' : '点检明细表'"
      :description="
        mode === 'sheet'
          ? '按月查看每台设备每日点检状态，未检与延误在同一矩阵中清晰暴露。'
          : '按设备追溯方案项目每日完成情况，项目状态可继续下钻查看任务结果。'
      "
      :icon="mode === 'sheet' ? 'ri:file-list-3-line' : 'ri:table-view'"
      :tags="[
        { label: monthCaption, type: 'primary' },
        { label: departmentLabel, type: 'info' },
        { label: `${overview.overdue} 项延误`, type: overview.overdue ? 'danger' : 'success' }
      ]"
      :metrics="metrics"
    >
      <template #actions>
        <ArtExcelExport
          v-auth="exportPermission"
          :data="exportRows"
          :columns="exportColumns"
          :filename="mode === 'sheet' ? '设备点检表' : '点检明细表'"
          :sheet-name="monthCaption"
          button-text="导出"
          type="warning"
          :disable-when-empty="false"
          plain
          auto-index
          ><ArtSvgIcon icon="ri:file-excel-2-line" />导出</ArtExcelExport
        >
      </template>
    </BusinessWorkspaceHeader>

    <section class="pmis-calendar__body">
      <ArtWorkspaceSplitter
        primary-size="256px"
        primary-min="224px"
        primary-max="360px"
        :breakpoint="900"
        stacked-primary-size="300px"
      >
        <template #primary>
          <PmisDepartmentNavigator @change="changeDepartments" />
        </template>
        <main class="pmis-calendar__content">
          <ArtSearchBar
            v-model="query"
            :items="searchItems"
            :span="mode === 'detail' ? 6 : 8"
            :label-width="64"
            :show-expand="false"
            :is-expand="true"
            :disabled-search="state.loading"
            @search="load"
            @reset="reset"
          />
          <ArtSectionCard
            root-class="pmis-calendar__matrix-card"
            :title="mode === 'sheet' ? '设备日历矩阵' : '点检项目日历矩阵'"
            :subtitle="matrixSubtitle"
            :loading="state.loading"
            :error="state.error"
            :empty="!state.loading && !state.error && matrixRows.length === 0"
            :empty-title="
              mode === 'detail' && !query.equipmentId ? '请先选择设备' : '当前范围暂无点检任务'
            "
            :empty-description="
              mode === 'detail' && !query.equipmentId
                ? '选择一台设备后查看各点检项目的每日完成情况。'
                : '请确认已启用点检方案并绑定适用设备。'
            "
            :min-height="0"
            @retry="load"
          >
            <div class="pmis-calendar__legend" aria-label="点检状态图例">
              <span class="is-completed">已检</span><span class="is-pending">未检</span>
              <span class="is-overdue">延误</span><span class="is-exempt">免检</span
              ><span>空白：未安排</span>
            </div>
            <ArtTable
              :data="matrixRows"
              :columns="columns"
              :pagination="false"
              :show-table-header="true"
              max-height="520"
              empty-text="暂无点检任务"
            />
          </ArtSectionCard>
        </main>
      </ArtWorkspaceSplitter>
    </section>

    <ArtDrawer ref="drawerRef" title="点检任务明细" size="lg">
      <template v-if="detailTask">
        <ArtSectionCard title="任务摘要" subtitle="计划、设备与当前执行状态">
          <template #actions>
            <ElButton
              v-if="mode === 'sheet' && detailTask.status === 'pending'"
              v-auth="'PmisInspectionSheet:Execute'"
              type="primary"
              @click="openExecution(detailTask)"
            >
              <ArtSvgIcon icon="ri:play-circle-line" />执行点检
            </ElButton>
          </template>
          <ArtDescriptions :columns="2" :data="detailTask" :items="taskDescriptions" />
        </ArtSectionCard>
        <ArtSectionCard
          title="项目结果"
          :subtitle="`已记录 ${detailTask.results.length} 项`"
          :empty="detailTask.results.length === 0"
          empty-description="现场端尚未提交项目结果。"
        >
          <div class="pmis-calendar__results">
            <article v-for="result in detailTask.results" :key="result.id">
              <div
                ><strong>{{ result.item?.itemName || '检查项目' }}</strong
                ><small>{{ result.item?.requirement || '—' }}</small></div
              >
              <ArtDictDisplay
                dict-code="pmisResultStatus"
                :value="result.resultStatus"
                display="tag"
              />
            </article>
          </div>
        </ArtSectionCard>
      </template>
    </ArtDrawer>
    <PmisTaskExecutionDialog ref="executionRef" @success="handleExecutionSuccess" />
  </div>
</template>

<script setup lang="tsx">
  import dayjs from 'dayjs'
  import ArtDescriptions from '@/components/core/base/art-descriptions/index.vue'
  import ArtDictDisplay from '@/components/core/base/art-dict-display/index.vue'
  import ArtDrawer from '@/components/core/drawers/art-drawer/index.vue'
  import type { ArtDrawerExpose } from '@/components/core/drawers/art-drawer/types'
  import ArtExcelExport from '@/components/core/forms/art-excel-export/index.vue'
  import ArtSearchBar, {
    type SearchFormItem
  } from '@/components/core/forms/art-search-bar/index.vue'
  import ArtSectionCard from '@/components/core/surfaces/art-section-card/index.vue'
  import ArtWorkspaceSplitter from '@/components/core/layouts/art-workspace-splitter/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import ArtTable from '@/components/core/tables/art-table/index.vue'
  import BusinessWorkspaceHeader, {
    type BusinessWorkspaceMetric
  } from '@/components/business/business-workspace-header/index.vue'
  import type { ColumnOption } from '@/types'
  import { useAuth } from '@/hooks/core/useAuth'
  import { useUserStore } from '@/store/modules/user'
  import {
    fetchPmisEquipmentOptions,
    fetchPmisTaskSnapshot,
    summarizePmisTasks,
    type PmisEquipmentOption,
    type PmisPlanItem,
    type PmisTask,
    type PmisTaskStatus
  } from '@pmis/api'
  import PmisDepartmentNavigator from './department-navigator.vue'
  import PmisTaskExecutionDialog, {
    type PmisTaskExecutionDialogOpenData
  } from './task-execution-dialog.vue'

  const props = defineProps<{ mode: 'sheet' | 'detail' }>()
  const { hasAuth } = useAuth()
  interface CalendarQuery {
    month: string
    equipmentId: string
    shiftName: string
  }
  interface MatrixRow {
    id: string
    identity: string
    secondary: string
    tasksByDate: Record<string, PmisTask | undefined>
    item?: PmisPlanItem
  }
  const initialQuery = (): CalendarQuery => ({
    month: dayjs().format('YYYY-MM'),
    equipmentId: '',
    shiftName: ''
  })
  const query = reactive<CalendarQuery>(initialQuery())
  const state = reactive<{ loading: boolean; error: string; tasks: PmisTask[] }>({
    loading: false,
    error: '',
    tasks: []
  })
  const equipmentOptions = shallowRef<PmisEquipmentOption[]>([])
  const departmentIds = ref<string[]>([])
  const departmentLabel = ref('全部产线')
  const drawerRef = ref<ArtDrawerExpose<PmisTask>>()
  const executionRef = ref<{
    handleOpen: (data: PmisTaskExecutionDialogOpenData) => Promise<void>
  }>()
  const detailTask = shallowRef<PmisTask>()
  const exportPermission = computed(() =>
    props.mode === 'sheet' ? 'PmisInspectionSheet:Export' : 'PmisInspectionDetail:Export'
  )
  const viewPermission = computed(() =>
    props.mode === 'sheet' ? 'PmisInspectionSheet:ViewDetail' : 'PmisInspectionDetail:ViewDetail'
  )
  const monthCaption = computed(() => dayjs(`${query.month}-01`).format('YYYY年MM月'))
  const monthStart = computed(() => dayjs(`${query.month}-01`).startOf('month'))
  const monthEnd = computed(() => monthStart.value.endOf('month'))
  const days = computed(() =>
    Array.from({ length: monthEnd.value.date() }, (_, index) =>
      monthStart.value.date(index + 1).format('YYYY-MM-DD')
    )
  )
  const overview = computed(() => summarizePmisTasks(state.tasks))
  const metrics = computed<BusinessWorkspaceMetric[]>(() => [
    {
      label: '计划任务',
      value: overview.value.total,
      description: monthCaption.value,
      icon: 'ri:calendar-line'
    },
    {
      label: '已检',
      value: overview.value.completed,
      description: `完成率 ${overview.value.completionRate}%`,
      icon: 'ri:checkbox-circle-line',
      tone: 'success'
    },
    {
      label: '未检',
      value: overview.value.pending,
      description: '尚未到期',
      icon: 'ri:time-line',
      tone: 'warning'
    },
    {
      label: '延误',
      value: overview.value.overdue,
      description: '需优先补检',
      icon: 'ri:alarm-warning-line',
      tone: overview.value.overdue ? 'danger' : 'info'
    }
  ])
  const searchItems = computed<SearchFormItem[]>(() => [
    {
      label: '月份',
      key: 'month',
      type: 'date',
      props: { type: 'month', valueFormat: 'YYYY-MM', clearable: false, placeholder: '选择月份' }
    },
    ...(props.mode === 'detail'
      ? [
          {
            label: '设备',
            key: 'equipmentId',
            type: 'select',
            props: {
              filterable: true,
              clearable: true,
              placeholder: '选择设备',
              options: equipmentOptions.value.map((item) => ({
                label: `${item.equipmentName} · ${item.equipmentCode}`,
                value: item.id
              }))
            }
          } as SearchFormItem
        ]
      : []),
    {
      label: '班次',
      key: 'shiftName',
      type: 'input',
      props: { clearable: true, placeholder: '全部班次' }
    }
  ])
  const statusWeight: Record<PmisTaskStatus, number> = {
    overdue: 4,
    pending: 3,
    completed: 2,
    exempt: 1
  }
  const pickTask = (tasks: PmisTask[]): PmisTask | undefined =>
    [...tasks].sort(
      (left, right) => statusWeight[right.displayStatus] - statusWeight[left.displayStatus]
    )[0]
  const matrixRows = computed<MatrixRow[]>(() => {
    const filtered = query.equipmentId
      ? state.tasks.filter((task) => task.equipment.id === query.equipmentId)
      : state.tasks
    if (props.mode === 'sheet') {
      const equipment = new Map<string, PmisTask[]>()
      filtered.forEach((task) =>
        equipment.set(task.equipment.id, [...(equipment.get(task.equipment.id) ?? []), task])
      )
      return [...equipment.entries()].map(([id, tasks]) => ({
        id,
        identity: tasks[0].equipment.equipmentName,
        secondary: tasks[0].equipment.equipmentCode,
        tasksByDate: Object.fromEntries(
          days.value.map((date) => [
            date,
            pickTask(tasks.filter((task) => task.plannedDate === date))
          ])
        )
      }))
    }
    if (!query.equipmentId) return []
    const items = new Map<string, { item: PmisPlanItem; tasks: PmisTask[] }>()
    filtered.forEach((task) =>
      task.plan.items.forEach((item) => {
        const key = item.id || `${task.plan.id}-${item.sort}`
        const current = items.get(key) ?? { item, tasks: [] }
        current.tasks.push(task)
        items.set(key, current)
      })
    )
    return [...items.entries()].map(([id, value]) => ({
      id,
      item: value.item,
      identity: value.item.itemName,
      secondary: `${value.item.requirement}（${filtered.find((task) => task.plan.items.some((item) => item.id === value.item.id))?.plan.planName || '点检方案'}）`,
      tasksByDate: Object.fromEntries(
        days.value.map((date) => [
          date,
          pickTask(value.tasks.filter((task) => task.plannedDate === date))
        ])
      )
    }))
  })
  const showTask = async (task?: PmisTask): Promise<void> => {
    if (!task || !hasAuth(viewPermission.value)) return
    detailTask.value = task
    await nextTick()
    await drawerRef.value?.handleOpen(task, {
      showFooter: false,
      contentHeight: 'calc(100vh - 90px)'
    })
  }
  const openExecution = (value: PmisTask): void =>
    void executionRef.value?.handleOpen({ task: value })
  const handleExecutionSuccess = (): void => {
    drawerRef.value?.handleClose()
    void load()
  }
  const cell = (task?: PmisTask) =>
    task && hasAuth(viewPermission.value) ? (
      <button
        type="button"
        class={['pmis-calendar__status', `is-${task.displayStatus}`]}
        title={`${task.plannedDate} · 查看任务明细`}
        aria-label={`${task.plannedDate} ${task.displayStatus}，查看明细`}
        onClick={() => void showTask(task)}
      >
        {task.displayStatus === 'completed' ? '✓' : task.displayStatus === 'exempt' ? '免' : '•'}
      </button>
    ) : task ? (
      <span class={['pmis-calendar__status', 'is-readonly', `is-${task.displayStatus}`]}>
        {task.displayStatus === 'completed' ? '✓' : task.displayStatus === 'exempt' ? '免' : '•'}
      </span>
    ) : (
      <span class="pmis-calendar__empty-cell">—</span>
    )
  const columns = computed<ColumnOption<MatrixRow>[]>(() => [
    { type: 'globalIndex', label: '序号', width: 66, fixed: 'left' },
    {
      prop: 'identity',
      label: props.mode === 'sheet' ? '设备' : '点检项目',
      minWidth: props.mode === 'sheet' ? 190 : 260,
      fixed: 'left',
      formatter: (row) => (
        <div class="pmis-calendar__identity">
          <strong>{row.identity}</strong>
          <small title={row.secondary}>{row.secondary}</small>
        </div>
      )
    },
    ...days.value.map((date): ColumnOption<MatrixRow> => ({
      prop: date,
      label: dayjs(date).format('DD'),
      width: 48,
      align: 'center',
      formatter: (row) => cell(row.tasksByDate[date])
    }))
  ])
  const matrixSubtitle = computed(
    () => `${monthCaption.value} · ${departmentLabel.value} · 单击状态单元格查看任务明细`
  )
  const load = async (): Promise<void> => {
    state.loading = true
    state.error = ''
    try {
      state.tasks = await fetchPmisTaskSnapshot('inspection', {
        dateFrom: monthStart.value.format('YYYY-MM-DD'),
        dateTo: monthEnd.value.format('YYYY-MM-DD'),
        departmentIds: departmentIds.value,
        equipmentId: query.equipmentId || undefined
      })
      if (query.shiftName)
        state.tasks = state.tasks.filter((task) => task.shiftName === query.shiftName)
    } catch {
      state.error = '点检日历加载失败，请重试。'
    } finally {
      state.loading = false
    }
  }
  const changeDepartments = (ids: string[], label: string): void => {
    departmentIds.value = ids
    departmentLabel.value = label
    void load()
  }
  const reset = (): void => {
    Object.assign(query, initialQuery())
    void load()
  }
  const exportRows = computed(() =>
    matrixRows.value.map((row) => ({
      identity: row.identity,
      secondary: row.secondary,
      ...Object.fromEntries(
        days.value.map((date) => [
          dayjs(date).format('MM-DD'),
          row.tasksByDate[date]?.displayStatus || '未安排'
        ])
      )
    }))
  )
  const exportColumns = computed(() => ({
    identity: { title: props.mode === 'sheet' ? '设备名称' : '点检项目', width: 24 },
    secondary: { title: props.mode === 'sheet' ? '设备编号' : '点检要求', width: 32 },
    ...Object.fromEntries(
      days.value.map((date) => [
        dayjs(date).format('MM-DD'),
        { title: dayjs(date).format('MM-DD') }
      ])
    )
  }))
  const taskDescriptions = computed(() =>
    detailTask.value
      ? [
          { key: 'taskNo', label: '任务单号', value: detailTask.value.taskNo },
          { key: 'status', label: '点检状态', value: detailTask.value.displayStatus },
          {
            key: 'equipment',
            label: '设备',
            value: `${detailTask.value.equipment.equipmentName} · ${detailTask.value.equipment.equipmentCode}`
          },
          {
            key: 'department',
            label: '部门 / 产线',
            value: detailTask.value.equipment.department?.departmentName || '待分配'
          },
          { key: 'plan', label: '点检方案', value: detailTask.value.plan.planName },
          { key: 'date', label: '计划日期', value: detailTask.value.plannedDate }
        ]
      : []
  )
  void Promise.all([
    useUserStore().ensureDictLoaded('pmisResultStatus'),
    fetchPmisEquipmentOptions({ current: 1, size: 500 }).then((result) => {
      equipmentOptions.value = result.data
    })
  ]).finally(() => void load())
</script>

<style scoped lang="scss">
  .pmis-calendar {
    &__body {
      display: flex;
      flex: 1;
      min-width: 0;
      min-height: 0;
    }

    &__content {
      display: flex;
      flex: 1 1 0;
      flex-direction: column;
      gap: var(--art-space-3);
      width: 100%;
      min-width: 0;
      max-width: 100%;
      min-height: 0;
      overflow: hidden;
    }

    &__matrix-card {
      display: flex;
      flex: 1 1 0;
      flex-direction: column;
      min-width: 0;
      min-height: 300px;
      overflow: hidden;

      :deep(.art-section-card__body) {
        display: flex;
        flex: 1 1 0;
        min-height: 0 !important;
      }

      :deep(.art-async-state__empty) {
        flex: 1 1 auto;
        align-content: center;
        min-height: 0;
        padding-top: clamp(28px, 5vh, 56px);
        padding-bottom: clamp(56px, 10vh, 112px);
      }
    }

    &__legend {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 14px;
      align-items: center;
      margin-bottom: 12px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    &__legend span {
      display: inline-flex;
      gap: 5px;
      align-items: center;
    }

    &__legend span::before {
      width: 9px;
      height: 9px;
      content: '';
      background: var(--art-gray-200);
      border-radius: 50%;
    }

    &__legend .is-completed::before {
      background: var(--el-color-success);
    }

    &__legend .is-pending::before {
      background: var(--el-color-warning);
    }

    &__legend .is-overdue::before {
      background: var(--el-color-danger);
    }

    &__legend .is-exempt::before {
      background: var(--el-text-color-placeholder);
    }

    &__identity strong,
    &__identity small {
      display: block;
    }

    &__identity small {
      max-width: 220px;
      margin-top: 3px;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 11px;
      color: var(--el-text-color-secondary);
      white-space: nowrap;
    }

    &__status {
      display: inline-grid;
      place-items: center;
      width: 28px;
      height: 28px;
      padding: 0;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
      border: 1px solid transparent;
      border-radius: 50%;
    }

    &__status.is-completed {
      color: var(--el-color-success);
      background: var(--el-color-success-light-9);
      border-color: var(--el-color-success-light-7);
    }

    &__status.is-pending {
      color: var(--el-color-warning);
      background: var(--el-color-warning-light-9);
      border-color: var(--el-color-warning-light-7);
    }

    &__status.is-overdue {
      color: var(--el-color-danger);
      background: var(--el-color-danger-light-9);
      border-color: var(--el-color-danger-light-7);
    }

    &__status.is-exempt {
      color: var(--el-text-color-secondary);
      background: var(--art-gray-100);
      border-color: var(--el-border-color);
    }

    &__status:focus-visible {
      outline: 2px solid color-mix(in srgb, var(--theme-color) 55%, transparent);
      outline-offset: 2px;
    }

    &__status.is-readonly {
      cursor: default;
    }

    &__empty-cell {
      color: var(--el-text-color-placeholder);
    }

    &__results {
      display: grid;
    }

    &__results article {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 12px;
      align-items: center;
      padding: 12px 0;
    }

    &__results article + article {
      border-top: 1px solid var(--el-border-color-lighter);
    }

    &__results strong,
    &__results small {
      display: block;
    }

    &__results small {
      margin-top: 3px;
      color: var(--el-text-color-secondary);
    }
  }
</style>
