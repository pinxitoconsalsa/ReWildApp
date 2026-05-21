const { supabase } = require('./supabase');

async function initSupabaseBucket() {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === 'rewild-images');

    if (bucketExists) {
      console.log('✓ Supabase bucket "rewild-images" ya existe');
      return;
    }

    // Create bucket
    const { data, error } = await supabase.storage.createBucket('rewild-images', {
      public: true,
    });

    if (error) throw error;
    console.log('✓ Supabase bucket "rewild-images" creado exitosamente');
  } catch (err) {
    console.error('Error inicializando Supabase:', err.message);
  }
}

module.exports = { initSupabaseBucket };
