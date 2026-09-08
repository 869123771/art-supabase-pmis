<template>
  <div class="pmis-workbench business-workspace-page art-full-height">
    <BusinessWorkspaceHeader
      eyebrow="PHYSICAL ASSET OPERATIONS"
      title="PMIS设备管理"
      description="统一承载设备点检、巡检、保养、故障维修与预防维修，贯通标准、计划、执行、异常和分析闭环。"
      icon="ri:tools-line"
      :tags="[
        { label: '五类业务协同', type: 'primary' },
        { label: '任务全程可追溯', type: 'success' },
        { label: '租户安全隔离', type: 'info' }
      ]"
      :metrics="metrics"
    />

    <ElScrollbar class="pmis-workbench__scroll">
      <div class="pmis-workbench__grid">
        <ArtSectionCard
          title="设备运维闭环"
          subtitle="点检、巡检、保养、故障维修与预防维修共享统一的设备任务闭环。"
          preserve-content-structure
        >
          <div class="operation-flow" aria-label="设备运维业务闭环">
            <article v-for="(step, index) in flow" :key="step.title">
              <span class="operation-flow__index">{{ String(index + 1).padStart(2, '0') }}</span>
              <span class="operation-flow__icon"><ArtSvgIcon :icon="step.icon" /></span>
              <strong>{{ step.title }}</strong>
              <small>{{ step.description }}</small>
            </article>
          </div>
        </ArtSectionCard>

        <ArtSectionCard
          title="应用边界"
          subtitle="拆仓后仍复用平台登录、租户、权限与动态菜单。"
          preserve-content-structure
        >
          <ul class="boundary-list">
            <li v-for="item in boundaries" :key="item.title">
              <span><ArtSvgIcon :icon="item.icon" /></span>
              <div
                ><strong>{{ item.title }}</strong
                ><small>{{ item.description }}</small></div
              >
              <ElTag size="small" effect="plain" type="success" round>已接入</ElTag>
            </li>
          </ul>
        </ArtSectionCard>

        <ArtSectionCard
          class="pmis-workbench__capabilities"
          title="业务能力全景"
          subtitle="按业务域汇总当前可用能力，入口复用真实设备、组织与人员主数据。"
          preserve-content-structure
        >
          <div class="capability-grid">
            <article v-for="group in capabilityGroups" :key="group.title">
              <div class="capability-grid__heading">
                <span><ArtSvgIcon :icon="group.icon" /></span>
                <div
                  ><small>{{ group.eyebrow }}</small
                  ><strong>{{ group.title }}</strong></div
                >
              </div>
              <div class="capability-grid__tags">
                <ElTag v-for="item in group.items" :key="item" size="small" effect="plain">{{
                  item
                }}</ElTag>
              </div>
            </article>
          </div>
        </ArtSectionCard>
      </div>
    </ElScrollbar>
  </div>
</template>

<script setup lang="ts">
  import BusinessWorkspaceHeader, {
    type BusinessWorkspaceMetric
  } from '@/components/business/business-workspace-header/index.vue'
  import ArtSectionCard from '@/components/core/surfaces/art-section-card/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'

  defineOptions({ name: 'PmisWorkbench' })

  const metrics: BusinessWorkspaceMetric[] = [
    {
      label: '业务域',
      value: 5,
      description: '覆盖设备运维全场景',
      icon: 'ri:apps-2-line',
      tone: 'primary'
    },
    {
      label: '任务闭环',
      value: '统一',
      description: '方案、执行、结果、分析',
      icon: 'ri:loop-right-line',
      tone: 'success'
    },
    {
      label: '组织范围',
      value: '树形',
      description: '部门与产线逐级下钻',
      icon: 'ri:node-tree',
      tone: 'primary'
    },
    {
      label: '数据边界',
      value: '统一',
      description: '租户与权限隔离',
      icon: 'ri:shield-check-line',
      tone: 'success'
    }
  ]
  const flow = [
    { title: '标准', description: '点检表与方案', icon: 'ri:file-list-3-line' },
    { title: '计划', description: '任务与周期', icon: 'ri:calendar-schedule-line' },
    { title: '执行', description: '现场记录', icon: 'ri:checkbox-circle-line' },
    { title: '异常', description: '问题闭环', icon: 'ri:alarm-warning-line' },
    { title: '分析', description: '趋势与风险', icon: 'ri:bar-chart-box-line' }
  ]
  const boundaries = [
    { title: '平台运行时', description: '统一登录、导航和主题', icon: 'ri:layout-2-line' },
    { title: '动态菜单', description: 'Supabase 按角色下发', icon: 'ri:menu-search-line' },
    { title: '租户安全', description: '沿用服务端权限边界', icon: 'ri:shield-keyhole-line' }
  ]
  const capabilityGroups = [
    {
      eyebrow: 'INSPECTION',
      title: '设备点检',
      icon: 'ri:task-line',
      items: ['点检表', '点检分析', '点检方案', '点检明细表', '设备点检看板', '点检记录报表']
    },
    {
      eyebrow: 'PATROL',
      title: '设备巡检',
      icon: 'ri:route-line',
      items: ['巡检任务', '巡检分析', '巡检方案']
    },
    {
      eyebrow: 'MAINTENANCE',
      title: '设备保养',
      icon: 'ri:settings-5-line',
      items: ['保养设置', '保养方案', '保养任务', '保养分析', '保养明细表', '保养记录报表']
    },
    {
      eyebrow: 'REPAIR',
      title: '故障维修',
      icon: 'ri:hammer-line',
      items: ['设置维修人员', '维修任务', '维修分析']
    },
    {
      eyebrow: 'PREVENTIVE',
      title: '预防维修',
      icon: 'ri:shield-check-line',
      items: ['预防维修方案', '预防维修任务', '预防维修分析', '预防维修明细表']
    }
  ]
</script>

<style scoped lang="scss">
  .pmis-workbench__scroll {
    flex: 1;
    min-height: 0;
  }

  .pmis-workbench__grid {
    display: grid;
    grid-template-columns: minmax(0, 1.55fr) minmax(300px, 0.75fr);
    gap: 16px;
    align-content: start;
    min-height: 0;
    padding-bottom: 4px;
  }

  .pmis-workbench__grid > :deep(.art-section-card) {
    padding: 18px;
  }

  .pmis-workbench__capabilities {
    grid-column: 1 / -1;
  }

  .operation-flow {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    padding: 16px 0 4px;
  }

  .operation-flow article {
    position: relative;
    display: grid;
    justify-items: center;
    min-width: 0;
    text-align: center;
  }

  .operation-flow article:not(:last-child)::after {
    position: absolute;
    top: 28px;
    left: calc(50% + 30px);
    width: calc(100% - 60px);
    height: 1px;
    content: '';
    background: var(--el-border-color);
  }

  .operation-flow__index {
    position: absolute;
    top: -8px;
    font-size: 9px;
    font-weight: 700;
    color: var(--el-text-color-placeholder);
    letter-spacing: 0.08em;
  }

  .operation-flow__icon {
    z-index: 1;
    display: grid;
    place-items: center;
    width: 54px;
    height: 54px;
    margin-bottom: 10px;
    font-size: 22px;
    color: var(--el-color-primary);
    background: color-mix(in srgb, var(--theme-color) 10%, var(--el-bg-color));
    border: 1px solid color-mix(in srgb, var(--theme-color) 24%, var(--el-border-color-lighter));
    border-radius: var(--custom-radius);
  }

  .operation-flow strong,
  .operation-flow small {
    display: block;
  }

  .operation-flow strong {
    font-size: 13px;
  }

  .operation-flow small {
    margin-top: 3px;
    font-size: 11px;
    color: var(--el-text-color-secondary);
  }

  .boundary-list {
    display: grid;
    gap: 2px;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .boundary-list li {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 10px;
    align-items: center;
    padding: 11px 0;
  }

  .boundary-list li + li {
    border-top: 1px solid var(--el-border-color-lighter);
  }

  .boundary-list li > span {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    color: var(--el-color-success);
    background: var(--el-color-success-light-9);
    border-radius: var(--el-border-radius-base);
  }

  .boundary-list strong,
  .boundary-list small {
    display: block;
  }

  .boundary-list strong {
    font-size: 13px;
  }

  .boundary-list small {
    margin-top: 2px;
    font-size: 11px;
    color: var(--el-text-color-secondary);
  }

  .capability-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 12px;
  }

  .capability-grid article {
    min-width: 0;
    padding: 16px;
    background: color-mix(in srgb, var(--art-gray-100) 62%, var(--default-box-color));
    border: 1px solid var(--el-border-color-lighter);
    border-radius: var(--el-border-radius-base);
    transition:
      border-color var(--art-motion-duration-fast) ease,
      transform var(--art-motion-duration-fast) ease;
  }

  .capability-grid article:hover {
    border-color: color-mix(in srgb, var(--theme-color) 32%, var(--el-border-color-lighter));
    transform: translateY(-1px);
  }

  .capability-grid__heading {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .capability-grid__heading > span {
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    font-size: 18px;
    color: var(--el-color-primary);
    background: color-mix(in srgb, var(--theme-color) 9%, var(--el-bg-color));
    border-radius: var(--el-border-radius-base);
  }

  .capability-grid__heading small,
  .capability-grid__heading strong {
    display: block;
  }

  .capability-grid__heading small {
    font-size: 9px;
    color: var(--el-text-color-placeholder);
    letter-spacing: 0.1em;
  }

  .capability-grid__heading strong {
    margin-top: 2px;
    font-size: 15px;
  }

  .capability-grid__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    margin-top: 14px;
  }

  @media (width <= 960px) {
    .pmis-workbench__grid {
      grid-template-columns: 1fr;
    }

    .pmis-workbench__capabilities {
      grid-column: auto;
    }
  }

  @media (width <= 680px) {
    .operation-flow {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px 8px;
    }

    .operation-flow article::after {
      display: none;
    }

    .capability-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
