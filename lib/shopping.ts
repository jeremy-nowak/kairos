import { supabase } from './supabase'

export interface ShoppingList {
  id: string
  name: string
  planned_date: string | null
  created_by: string
  created_at: string
}

export interface ShoppingItem {
  id: string
  list_id: string
  product: string
  quantity: string
  photo_url: string | null
  done: boolean
  created_by: string
  created_at: string
}

export interface CatalogItem {
  id: string
  product: string
  quantity: string
  used_count: number
}

// ── Lists ──────────────────────────────────────────────────────────────────

export async function getShoppingLists(): Promise<ShoppingList[]> {
  const { data, error } = await supabase
    .from('shopping_lists')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as ShoppingList[]
}

export async function createShoppingList(name: string, createdBy: string, plannedDate?: string): Promise<ShoppingList> {
  const { data, error } = await supabase
    .from('shopping_lists')
    .insert({ name, created_by: createdBy, planned_date: plannedDate ?? null })
    .select()
    .single()

  if (error) throw error
  return data as ShoppingList
}

export async function deleteShoppingList(id: string): Promise<void> {
  const { error } = await supabase.from('shopping_lists').delete().eq('id', id)
  if (error) throw error
}

// ── Items ──────────────────────────────────────────────────────────────────

export async function getShoppingItems(listId: string): Promise<ShoppingItem[]> {
  const { data, error } = await supabase
    .from('shopping_items')
    .select('*')
    .eq('list_id', listId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as ShoppingItem[]
}

export async function createShoppingItem(input: {
  listId: string
  product: string
  quantity: string
  photo_url?: string
  createdBy: string
}): Promise<ShoppingItem> {
  const { data, error } = await supabase
    .from('shopping_items')
    .insert({
      list_id: input.listId,
      product: input.product,
      quantity: input.quantity,
      photo_url: input.photo_url ?? null,
      created_by: input.createdBy,
    })
    .select()
    .single()

  if (error) throw error
  return data as ShoppingItem
}

export async function toggleShoppingItem(id: string, done: boolean): Promise<void> {
  const { error } = await supabase.from('shopping_items').update({ done }).eq('id', id)
  if (error) throw error
}

export async function deleteShoppingItem(id: string): Promise<void> {
  const { error } = await supabase.from('shopping_items').delete().eq('id', id)
  if (error) throw error
}

// ── Catalog ────────────────────────────────────────────────────────────────

export async function getCatalog(): Promise<CatalogItem[]> {
  const { data, error } = await supabase
    .from('shopping_catalog')
    .select('*')
    .order('used_count', { ascending: false })

  if (error) throw error
  return (data ?? []) as CatalogItem[]
}

export async function upsertCatalogItem(product: string, quantity: string): Promise<void> {
  const { data } = await supabase
    .from('shopping_catalog')
    .select('id, used_count')
    .eq('product', product)
    .single()

  if (data) {
    await supabase
      .from('shopping_catalog')
      .update({ quantity, used_count: data.used_count + 1, updated_at: new Date().toISOString() })
      .eq('id', data.id)
  } else {
    await supabase.from('shopping_catalog').insert({ product, quantity })
  }
}

// ── Storage ────────────────────────────────────────────────────────────────

export async function uploadShoppingPhoto(file: Blob, filename: string): Promise<string> {
  const { error } = await supabase.storage
    .from('shopping-photos')
    .upload(filename, file, { upsert: true })

  if (error) throw error

  const { data } = supabase.storage.from('shopping-photos').getPublicUrl(filename)
  return data.publicUrl
}
