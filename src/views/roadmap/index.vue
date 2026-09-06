<template>
  <div class="pmis-roadmap business-workspace-page art-full-height">
    <BusinessWorkspaceHeader
      eyebrow="PMIS CAPABILITY"
      :title="page.title"
      :description="page.description"
      :icon="page.icon"
      :tags="[
        { label: page.group, type: 'primary' },
        { label: '菜单已接入', type: 'success' }
      ]"
      :metrics="metrics"
    />
    <ArtSectionCard
      title="能力建设说明"
      subtitle="页面入口、应用边界和权限链路已准备，业务实现将在当前菜单内继续完成。"
      preserve-content-structure
    >
      <div class="pmis-roadmap__content">
        <span class="pmis-roadmap__icon"><ArtSvgIcon :icon="page.icon" /></span>
        <div
          ><small>DELIVERY ROADMAP</small><h2>{{ page.title }}</h2
          ><p>{{ page.description }}</p></div
        >
        <ElTag effect="light" type="warning" size="small" round>待业务实现</ElTag>
      </div>
    </ArtSectionCard>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'
  import BusinessWorkspaceHeader, {
    type BusinessWorkspaceMetric
  } from '@/components/business/business-workspace-header/index.vue'
  import ArtSectionCard from '@/components/core/surfaces/art-section-card/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'

  defineOptions({ name: 'PmisRoadmap' })
  const route = useRoute()
  const pages: Record<string, { title: string; description: string; icon: string; group: string }> =
    {
      'inspection-sheet': {
        title: '点检表',
        description: '维护设备点检项目、标准、判定口径与适用范围。',
        icon: 'ri:file-list-3-line',
        group: '设备点检'
      },
      'inspection-analysis': {
        title: '点检分析',
        description: '分析点检执行率、异常趋势与设备健康风险。',
        icon: 'ri:bar-chart-box-line',
        group: '设备点检'
      },
      'inspection-plan': {
        title: '点检方案',
        description: '编排点检对象、周期、项目与责任人员。',
        icon: 'ri:calendar-todo-line',
        group: '设备点检'
      },
      'inspection-detail': {
        title: '点检明细表',
        description: '按设备、任务与项目追溯点检执行明细。',
        icon: 'ri:table-view',
        group: '设备点检'
      },
      'inspection-dashboard': {
        title: '设备点检看板',
        description: '汇总点检运行、异常分布与处理进度。',
        icon: 'ri:dashboard-3-line',
        group: '设备点检'
      },
      'inspection-report': {
        title: '点检记录报表',
        description: '形成可筛选、可导出的点检记录报表。',
        icon: 'ri:file-chart-line',
        group: '设备点检'
      },
      'patrol-task': {
        title: '巡检任务',
        description: '下达、执行并跟踪设备巡检任务。',
        icon: 'ri:task-line',
        group: '设备巡检'
      },
      'patrol-analysis': {
        title: '巡检分析',
        description: '分析巡检覆盖、执行质量与异常趋势。',
        icon: 'ri:line-chart-line',
        group: '设备巡检'
      },
      'patrol-plan': {
        title: '巡检方案',
        description: '配置巡检路线、对象、周期与检查标准。',
        icon: 'ri:route-line',
        group: '设备巡检'
      }
    }
  const page = computed(
    () => pages[String(route.path.split('/').at(-1))] ?? pages['inspection-sheet']
  )
  const metrics = computed<BusinessWorkspaceMetric[]>(() => [
    {
      label: '应用归属',
      value: 'PMIS',
      description: '独立设备管理子仓',
      icon: 'ri:git-repository-line',
      tone: 'primary'
    },
    {
      label: '菜单状态',
      value: '已接入',
      description: '名称和层级保持不变',
      icon: 'ri:menu-search-line',
      tone: 'success'
    },
    {
      label: '实现状态',
      value: '待建设',
      description: '按审查节奏推进',
      icon: 'ri:progress-6-line',
      tone: 'warning'
    }
  ])
</script>

<style scoped lang="scss">
  .pmis-roadmap :deep(.art-section-card) {
    padding: 18px;
  }

  .pmis-roadmap__content {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 18px;
    align-items: center;
    min-height: 180px;
    padding: 24px;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--theme-color) 8%, var(--el-bg-color)),
      var(--el-bg-color)
    );
    border: 1px solid color-mix(in srgb, var(--theme-color) 16%, var(--el-border-color-lighter));
    border-radius: var(--el-border-radius-base);
  }

  .pmis-roadmap__icon {
    display: grid;
    place-items: center;
    width: 66px;
    height: 66px;
    font-size: 29px;
    color: var(--el-color-primary);
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 18px;
  }

  .pmis-roadmap__content small {
    font-size: 10px;
    font-weight: 700;
    color: var(--el-color-primary);
    letter-spacing: 0.12em;
  }

  .pmis-roadmap__content h2 {
    margin: 5px 0 7px;
    font-size: 22px;
    color: var(--el-text-color-primary);
  }

  .pmis-roadmap__content p {
    max-width: 760px;
    margin: 0;
    font-size: 13px;
    line-height: 1.7;
    color: var(--el-text-color-secondary);
  }

  @media (width <= 680px) {
    .pmis-roadmap__content {
      grid-template-columns: 1fr;
    }

    .pmis-roadmap__content > .el-tag {
      justify-self: start;
    }
  }
</style>
