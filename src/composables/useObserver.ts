import { onMounted, onUnmounted, type Ref } from 'vue'

export function useObserver(
  callback: (
    entries: IntersectionObserverEntry[],
    observer?: IntersectionObserver | null
  ) => void,
  element: Ref<HTMLElement | null>,
  observeClass: string,
  observeOptions?: IntersectionObserverInit
) {
  let observer: IntersectionObserver | null = null
  const defaultObserverOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5
  }

  const observerOptions = {
    ...defaultObserverOptions,
    ...observeOptions
  }

  onMounted(() => {
    if (!element.value) return

    const items = element.value.querySelectorAll(observeClass)

    observer = new IntersectionObserver((entries) => {
      callback(entries, observer)
    }, observerOptions)

    items.forEach((item) => {
      observer?.observe(item)
    })
  })

  onUnmounted(() => {
    if (observer && element.value) {
      const items = element.value.querySelectorAll(observeClass)

      items.forEach((item) => {
        observer?.unobserve(item)
      })
    }
    observer = null
  })
}
