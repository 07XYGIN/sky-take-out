export function formatCurrency(value: number | string | undefined | null) {
  const amount = Number(value || 0)
  return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatDateTime(value: string | number | Date | undefined | null) {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('zh-CN', { hour12: false })
}

export function toPageParams(page: number, pageSize: number, extra?: Record<string, unknown>) {
  return { page, pageSize, ...extra }
}
