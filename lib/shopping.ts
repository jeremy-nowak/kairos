import { supabase } from './supabase'

export interface ShoppingItem {
  id: string
  store: string
  product: string
  quantity: string
  photo_url: string | null
  done: boolean
  created_by: string
  created_at: string
}

export async function getShoppingItems(): Promise<ShoppingItem[]> {
  const { data, error } = await supabase
    .from('shopping_items')
    .select('*')
    .order('store', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as ShoppingItem[]
}

export async function createShoppingItem(input: {
  store: string
  product: string
  quantity: string
  photo_url?: string
  createdBy: string
}): Promise<ShoppingItem> {
  const { data, error } = await supabase
    .from('shopping_items')
    .insert({
      store: input.store,
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
  const { error } = await supabase
    .from('shopping_items')
    .update({ done })
    .eq('id', id)

  if (error) throw error
}

export async function deleteShoppingItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('shopping_items')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export interface CatalogItem {
  id: string
  product: string
  store: string
  quantity: string
  used_count: number
}

export async function getCatalog(): Promise<CatalogItem[]> {
  const { data, error } = await supabase
    .from('shopping_catalog')
    .select('*')
    .order('used_count', { ascending: false })

  if (error) throw error
  return (data ?? []) as CatalogItem[]
}

export async function upsertCatalogItem(product: string, store: string, quantity: string): Promise<void> {
  const { data } = await supabase
    .from('shopping_catalog')
    .select('id, used_count')
    .eq('product', product)
    .single()

  if (data) {
    await supabase
      .from('shopping_catalog')
      .update({ store, quantity, used_count: data.used_count + 1, updated_at: new Date().toISOString() })
      .eq('id', data.id)
  } else {
    await supabase
      .from('shopping_catalog')
      .insert({ product, store, quantity })
  }
}

export async function uploadShoppingPhoto(file: Blob, filename: string): Promise<string> {
  const { error } = await supabase.storage
    .from('shopping-photos')
    .upload(filename, file, { upsert: true })

  if (error) throw error

  const { data } = supabase.storage.from('shopping-photos').getPublicUrl(filename)
  return data.publicUrl
}
