import { useEffect, useState } from 'react'
import { Button, Card, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Switch, Table, message } from 'antd'
import type { TableColumnsType } from 'antd'
import { Edit3, Plus, Search, Trash2 } from 'lucide-react'
import { addSetmeal, changeSetmealStatus, deleteSetmeal, editSetmeal, getSetmealCategories, getSetmealPage } from '../api/setmeal'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { StatusPill } from '../components/StatusPill'
import { formatCurrency } from '../lib/format'
import type { Category, Setmeal } from '../types'

const fallbackSetmeals: Setmeal[] = [
  { id: 1, name: '双人分享餐', categoryId: 4, categoryName: '双人套餐', price: 68, status: 1, description: '两份主食、两份小吃和两杯饮品。' },
  { id: 2, name: '午间轻食餐', categoryId: 4, categoryName: '双人套餐', price: 42, status: 1, description: '工作日午间快速解决一餐。' },
]

export function SetmealPage() {
  const [form] = Form.useForm<Partial<Setmeal>>()
  const [rows, setRows] = useState<Setmeal[]>(fallbackSetmeals)
  const [categories, setCategories] = useState<Category[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Setmeal | null>(null)

  const loadData = async () => {
    setLoading(true)
    try { const result = await getSetmealPage({ page: 1, pageSize: 100, name: query || undefined }); setRows(result.records || []) } catch { /* Keep local sample rows. */ } finally { setLoading(false) }
  }
  useEffect(() => { void loadData(); getSetmealCategories().then(setCategories).catch(() => undefined) }, [])

  const openModal = (record?: Setmeal) => { setEditing(record || null); form.setFieldsValue(record || { name: '', price: 0, categoryId: undefined, status: 1, description: '', image: '' }); setModalOpen(true) }
  const submit = async (values: Partial<Setmeal>) => { try { if (editing) await editSetmeal({ ...values, id: editing.id }); else await addSetmeal(values); message.success(editing ? '套餐已更新' : '套餐已创建'); setModalOpen(false); await loadData() } catch (error) { message.error(error instanceof Error ? error.message : '保存失败') } }

  const columns: TableColumnsType<Setmeal> = [
    { title: '套餐名称', dataIndex: 'name', key: 'name', render: (value, record) => <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md bg-[#e8f5f3] font-semibold text-teal">{record.image ? <img src={record.image} alt="" className="h-full w-full object-cover" /> : value?.slice(0, 1)}</div><span className="font-medium text-ink">{value}</span></div> },
    { title: '分类', dataIndex: 'categoryName', key: 'categoryName', render: (value) => value || '--' },
    { title: '售价', dataIndex: 'price', key: 'price', render: (value) => <span className="font-medium text-ink">{formatCurrency(value)}</span> },
    { title: '状态', dataIndex: 'status', key: 'status', render: (value, record) => <div className="flex items-center gap-3"><Switch size="small" checked={value === 1} onChange={async (checked) => { try { await changeSetmealStatus(record.id, checked ? 1 : 0); setRows((current) => current.map((item) => item.id === record.id ? { ...item, status: checked ? 1 : 0 } : item)) } catch { message.error('状态更新失败') } }} /><StatusPill status={value} activeLabel="在售" inactiveLabel="停售" /></div> },
    { title: '操作', key: 'action', width: 130, render: (_, record) => <Space size="small"><Button type="text" aria-label="编辑套餐" icon={<Edit3 size={15} />} onClick={() => openModal(record)} /><Popconfirm title="确认删除这个套餐吗？" onConfirm={async () => { try { await deleteSetmeal([record.id]); setRows((current) => current.filter((item) => item.id !== record.id)); message.success('套餐已删除') } catch { message.error('删除失败') } }}><Button danger type="text" aria-label="删除套餐" icon={<Trash2 size={15} />} /></Popconfirm></Space> },
  ]

  return <div><PageHeader title="套餐管理" description="编排组合商品，维护套餐价格和供应状态。" actions={<Button type="primary" icon={<Plus size={16} />} onClick={() => openModal()}>新增套餐</Button>} /><Card className="mb-4"><div className="flex flex-wrap items-end gap-3"><div className="w-full sm:w-72"><label className="mb-1.5 block text-xs text-slate-500">套餐名称</label><Input allowClear prefix={<Search size={15} />} placeholder="搜索套餐" value={query} onChange={(event) => setQuery(event.target.value)} /></div><Button onClick={() => void loadData()}>查询</Button></div></Card><Card bodyStyle={{ padding: 0 }}><Table rowKey="id" loading={loading} columns={columns} dataSource={rows.filter((row) => !query || row.name.includes(query))} locale={{ emptyText: <EmptyState label="暂无套餐记录" /> }} pagination={{ pageSize: 8, showSizeChanger: false }} /></Card><Modal width={620} title={editing ? '编辑套餐' : '新增套餐'} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} okText="保存" cancelText="取消"><Form form={form} layout="vertical" onFinish={submit}><div className="grid gap-1 sm:grid-cols-2 sm:gap-4"><Form.Item name="name" label="套餐名称" rules={[{ required: true, message: '请输入套餐名称' }]}><Input /></Form.Item><Form.Item name="categoryId" label="套餐分类" rules={[{ required: true, message: '请选择分类' }]}><Select options={categories.map((category) => ({ label: category.name, value: category.id }))} placeholder="选择分类" /></Form.Item><Form.Item name="price" label="套餐售价" rules={[{ required: true, message: '请输入套餐售价' }]}><InputNumber min={0} precision={2} className="w-full" prefix="¥" /></Form.Item><Form.Item name="image" label="图片地址"><Input /></Form.Item></div><Form.Item name="description" label="套餐描述"><Input.TextArea rows={3} maxLength={120} showCount /></Form.Item></Form></Modal></div>
}
