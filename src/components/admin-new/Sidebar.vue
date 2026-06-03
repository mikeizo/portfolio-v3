<script setup lang="ts">
  import {
    ArrowUpRight,
    ChevronDown,
    CodeXml,
    FileText,
    Globe,
    Settings
  } from 'lucide-vue-next'
  import { computed, ref } from 'vue'

  const props = defineProps<{
    rail: boolean
    mobileOpen: boolean
    pathname: string
  }>()

  defineEmits<{ navigate: [] }>()

  const base = '/admin-new'
  const pagesOpen = ref(true)

  function isActive(path: string) {
    return props.pathname === path || props.pathname.startsWith(`${path}/`)
  }

  const pagesActive = computed(
    () => isActive(`${base}/about`) || isActive(`${base}/work`)
  )
</script>

<template>
  <aside
    class="fixed inset-y-0 left-0 z-40 flex w-[244px] min-w-0 flex-col overflow-hidden border-r border-hairline bg-sidebar transition-transform duration-200 lg:static lg:z-auto lg:w-full lg:translate-x-0"
    :class="mobileOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <!-- wordmark -->
    <div class="flex h-[60px] shrink-0 items-center gap-2 px-5">
      <span
        v-if="!rail"
        class="whitespace-nowrap text-[23px] font-light tracking-[-1px] text-ink"
        >admin<span class="text-accent">.</span></span
      >
      <span v-else class="text-[24px] font-light tracking-[-1px] text-ink"
        >a<span class="text-accent">.</span></span
      >
    </div>

    <!-- nav -->
    <nav class="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
      <!-- Pages group -->
      <button
        type="button"
        class="flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-light text-ink-secondary transition-colors hover:bg-row-hover hover:text-ink"
        :class="[rail && 'justify-center px-2.5', pagesActive && 'text-accent']"
        @click="pagesOpen = !pagesOpen"
      >
        <FileText
          :size="18"
          class="shrink-0"
          :class="pagesActive ? 'text-accent' : 'text-muted'"
        />
        <template v-if="!rail">
          <span class="whitespace-nowrap">Pages</span>
          <ChevronDown
            :size="15"
            class="ml-auto text-faint transition-transform duration-200"
            :class="pagesOpen && 'rotate-180'"
          />
        </template>
      </button>

      <div
        v-if="pagesOpen && !rail"
        class="flex flex-col gap-px overflow-hidden"
      >
        <a
          :href="`${base}/about`"
          class="rounded-md py-[7px] pl-10 pr-2.5 text-[13.5px] transition-colors hover:bg-row-hover hover:text-ink"
          :class="
            isActive(`${base}/about`) ? 'font-normal text-accent' : 'text-muted'
          "
          @click="$emit('navigate')"
          >About</a
        >
        <a
          :href="`${base}/work`"
          class="rounded-md py-[7px] pl-10 pr-2.5 text-[13.5px] transition-colors hover:bg-row-hover hover:text-ink"
          :class="
            isActive(`${base}/work`) ? 'font-normal text-accent' : 'text-muted'
          "
          @click="$emit('navigate')"
          >Work</a
        >
      </div>

      <a
        :href="`${base}/experience`"
        class="flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-light transition-colors hover:bg-row-hover hover:text-ink"
        :class="[
          rail && 'justify-center',
          isActive(`${base}/experience`)
            ? 'bg-accent-soft font-normal text-accent'
            : 'text-ink-secondary'
        ]"
        @click="$emit('navigate')"
      >
        <CodeXml
          :size="18"
          class="shrink-0"
          :class="isActive(`${base}/experience`) ? 'text-accent' : 'text-muted'"
        />
        <span v-if="!rail" class="whitespace-nowrap">Experience</span>
      </a>

      <a
        :href="`${base}/settings`"
        class="flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-light transition-colors hover:bg-row-hover hover:text-ink"
        :class="[
          rail && 'justify-center',
          isActive(`${base}/settings`)
            ? 'bg-accent-soft font-normal text-accent'
            : 'text-ink-secondary'
        ]"
        @click="$emit('navigate')"
      >
        <Settings
          :size="18"
          class="shrink-0"
          :class="isActive(`${base}/settings`) ? 'text-accent' : 'text-muted'"
        />
        <span v-if="!rail" class="whitespace-nowrap">Settings</span>
      </a>
    </nav>

    <!-- footer: external site link -->
    <div class="shrink-0 border-t border-hairline p-3">
      <a
        href="/"
        target="_blank"
        class="flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-light text-muted transition-colors hover:bg-row-hover hover:text-ink"
        :class="rail && 'justify-center'"
      >
        <Globe :size="18" class="shrink-0 text-muted" />
        <template v-if="!rail">
          <span class="whitespace-nowrap">Site</span>
          <ArrowUpRight :size="14" class="ml-auto" />
        </template>
      </a>
    </div>
  </aside>
</template>
