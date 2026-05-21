const { supabase } = require('./supabase');

async function uploadToSupabase(bucket, filename, fileBuffer, contentType = 'image/jpeg') {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filename, fileBuffer, {
        contentType,
        upsert: false,
      });

    if (error) throw error;

    const { data: publicUrl } = supabase.storage
      .from(bucket)
      .getPublicUrl(filename);

    return publicUrl.publicUrl;
  } catch (err) {
    throw new Error(`Supabase upload error: ${err.message}`);
  }
}

async function deleteFromSupabase(bucket, filename) {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filename]);

    if (error) throw error;
    return true;
  } catch (err) {
    throw new Error(`Supabase delete error: ${err.message}`);
  }
}

module.exports = { uploadToSupabase, deleteFromSupabase };
