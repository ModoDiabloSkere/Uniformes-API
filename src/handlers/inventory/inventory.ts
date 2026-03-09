import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { supabase } from '../../db/supabase'
import { authenticate } from '../../middleware/auth'
import { authorize } from '../../middleware/roles'
import { json, error } from '../../utils/response'

const updateSchema = z.object({
  quantity_available: z.number().nonnegative(),
})

export async function getInventory(req: VercelRequest, res: VercelResponse) {
  const user = await authenticate(req, res)
  if (!user) return
  if (!authorize(user, 'inventory', res)) return

  const { data, error: dbErr } = await supabase
    .from('inventory')
    .select('*, materials(name, category, unit, min_stock)')
    .order('materials(name)')

  if (dbErr) return error(res, dbErr.message, 500)

  // Agregar alerta de stock bajo
  const enriched = (data || []).map((item: any) => ({
    ...item,
    low_stock:
      item.materials?.min_stock != null &&
      item.quantity_available <= item.materials.min_stock,
  }))

  return json(res, enriched)
}

export async function updateInventory(req: VercelRequest, res: VercelResponse) {
  const user = await authenticate(req, res)
  if (!user) return
  if (!authorize(user, 'inventory', res)) return

  const { materialId } = (req as any).params
  const parsed = updateSchema.safeParse(req.body)
  if (!parsed.success) return error(res, parsed.error.message, 400)

  const { data, error: dbErr } = await supabase
    .from('inventory')
    .update({ quantity_available: parsed.data.quantity_available })
    .eq('material_id', materialId)
    .select()
    .single()

  if (dbErr) return error(res, dbErr.message, 500)

  await supabase.from('activity_log').insert({
    user_id: user.id,
    action: 'update',
    entity: 'inventory',
    entity_id: materialId,
    details: `Inventario actualizado a ${parsed.data.quantity_available}`,
  })

  return json(res, data)
}
