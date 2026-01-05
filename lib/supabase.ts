import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!

export const supabaseServer = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function uploadImageToStorage(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string,
  bucket: string = 'posts'
): Promise<string | null> {
  const { error } = await supabaseServer.storage
    .from(bucket)
    .upload(fileName, fileBuffer, {
      contentType,
      upsert: false
    })

  if (error) {
    console.error('Upload error:', error)
    return null
  }

  const { data } = supabaseServer.storage
    .from(bucket)
    .getPublicUrl(fileName)

  return data.publicUrl
}

export async function deleteImageFromStorage(url: string, bucket: string = 'posts'): Promise<boolean> {
  const fileName = url.split('/').pop()
  if (!fileName) return false

  const { error } = await supabaseServer.storage
    .from(bucket)
    .remove([fileName])

  if (error) {
    console.error('Delete error:', error)
    return false
  }

  return true
}
