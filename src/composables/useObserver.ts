import { onMounted, onUnmounted, type Ref } from 'vue'

export function useObserver(
  element: Ref<HTMLElement | null>,
  observeClass: string,
  animationClass: string,
  observeOptions?: Partial<IntersectionObserverInit>
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
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(animationClass)
          observer?.unobserve(entry.target)
        }
      })
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
