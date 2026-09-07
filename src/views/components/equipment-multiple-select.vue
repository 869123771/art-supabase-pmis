<template>
  <ArtTableMultipleSelect
    :model-value="modelValue"
    :selected-data="selectedData"
    :api-fn="fetchOptions"
    :columns="columns"
    title="选择适用设备"
    subtitle="数据来自生产设备主档，仅显示当前租户已启用设备"
    placeholder="选择一台或多台生产设备"
    search-placeholder="搜索设备编号或设备名称"
    row-key="id"
    :label-key="equipmentLabel"
    :description-key="equipmentDescription"
    empty-text="暂无可选设备"
    empty-description="请先在 MDM 生产设备中维护已启用设备及部门/产线归属。"
    show-pagination
    :page-size="10"
    :disabled="!tenantId"
    @update:model-value="emit('update:modelValue', normalizeIds($event))"
    @update:selected-data="emit('update:selectedData', normalizeRows($event))"
  />
</template>

<script setup lang="ts">
  import ArtTableMultipleSelect from '@/components/core/forms/art-data-select/table-multiple.vue'
  import type {
    DataSelectColumn,
    DataSelectFetchParams,
    DataSelectKey,
    DataSelectRecord
  } from '@/components/core/forms/art-data-select/types'
  import { fetchPmisEquipmentOptions, type PmisEquipmentOption } from '@pmis/api'

  defineOptions({ name: 'PmisEquipmentMultipleSelect' })
  const props = withDefaults(
    defineProps<{
      modelValue?: string[]
      selectedData?: PmisEquipmentOption[]
      tenantId?: string | null
    }>(),
    {
      modelValue: () => [],
      selectedData: () => [],
      tenantId: null
    }
  )
  const emit = defineEmits<{
    'update:modelValue': [value: string[]]
    'update:selectedData': [rows: PmisEquipmentOption[]]
  }>()
  const equipment = (row: DataSelectRecord) => row as PmisEquipmentOption
  const equipmentLabel = (row: DataSelectRecord) => equipment(row).equipmentName
  const equipmentDescription = (row: DataSelectRecord) =>
    [equipment(row).equipmentCode, equipment(row).department?.departmentName]
      .filter(Boolean)
      .join(' · ')
  const columns: DataSelectColumn[] = [
    { prop: 'equipmentCode', label: '设备编号', minWidth: 150 },
    { prop: 'equipmentName', label: '设备名称', minWidth: 190 },
    {
      prop: 'department',
      label: '部门 / 产线',
      minWidth: 180,
      formatter: (row) => equipment(row).department?.departmentName || '待分配'
    },
    { prop: 'operationStatus', label: '运行状态', width: 110 }
  ]
  const fetchOptions = async (params: DataSelectFetchParams) =>
    fetchPmisEquipmentOptions({
      current: params.page,
      size: params.pageSize,
      keyword: params.keyword,
      tenantId: props.tenantId || undefined
    })
  const normalizeIds = (value: DataSelectKey | DataSelectKey[] | undefined): string[] =>
    (Array.isArray(value) ? value : value == null ? [] : [value]).map(String)
  const normalizeRows = (rows: DataSelectRecord[]): PmisEquipmentOption[] => rows.map(equipment)
</script>
