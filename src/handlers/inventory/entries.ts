import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { supabase } from '../../db/supabase'
import { authenticate } from '../../middleware/auth'
import { authorize } from '../../middleware/roles'
import { json, error } from '../../utils/response'

const entrySchema = z.object({
  material_id: z.string().uuid(),
  quantity: z.number().positive(),
  order_id: z.string().uuid().nullable().optional(),
  type: z.enum(['entrada', 'salida', 'ajuste']).default('entrada'),
  notes: z.string().nullable().optional(),
})

export async function listEntries(req: VercelRequest, res: VercelResponse) {
  const user = await authenticate(req, res)
  if (!user) return
  if (!authorize(user, 'inventory', res)) return

  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200)
  const offset = Math.max(Number(req.query.offset) || 0, 0)

  const { data, count, error: dbErr } = await supabase
    .from('inventory_entries')
    .select('*, materials(name, unit), orders(id, clients(company_name))', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (dbErr) return error(res, dbErr.message, 500)
  res.setHeader('X-Total-Count', String(count ?? 0))
  return json(res, data)
}

export async function createEntry(req: VercelRequest, res: VercelResponse) {
  const user = await authenticate(req, res)
  if (!user) return
  if (!authorize(user, 'inventory', res)) return

  const parsed = entrySchema.safeParse(req.body)
  if (!parsed.success) return error(res, parsed.error.message, 400)

  const { material_id, quantity, order_id, type, notes } = parsed.data

  const { data: material } = await supabase
    .from('materials')
    .select('id, name')
    .eq('id', material_id)
    .single()

  if (!material) return error(res, 'Material no encontrado', 404)

  // Crear el registro de movimiento
  const { data: entry, error: entryErr } = await supabase
    .from('inventory_entries')
    .insert({
      material_id,
      quantity,
      order_id: order_id || null,
      type,
      notes: notes || null,
      created_by: user.id,
    })
    .select()
    .single()

  if (entryErr) return error(res, entryErr.message, 500)

  // Actualizar el stock de forma atómica (evita race conditions)
  const delta = type === 'salida' ? -quantity : quantity

  await supabase.rpc('adjust_inventory_quantity', {
    p_material_id: material_id,
    p_delta: delta,
  })

  await supabase.from('activity_log').insert({
    user_id: user.id,
    action: 'inventory_entry',
    entity: 'inventory',
    entity_id: material_id,
    details: `${type}: ${quantity} unidades de ${material.name}${order_id ? ` (pedido ${order_id})` : ''}`,
  })

  return json(res, entry, 201)
}
