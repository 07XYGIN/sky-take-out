import { Tag } from 'antd'

interface StatusPillProps {
  status: number | string | undefined
  activeLabel?: string
  inactiveLabel?: string
}

export function StatusPill({ status, activeLabel = '启用', inactiveLabel = '停用' }: StatusPillProps) {
  const active = String(status) === '1' || String(status).toLowerCase() === 'enabled'
  return <Tag color={active ? 'green' : 'default'}>{active ? activeLabel : inactiveLabel}</Tag>
}
