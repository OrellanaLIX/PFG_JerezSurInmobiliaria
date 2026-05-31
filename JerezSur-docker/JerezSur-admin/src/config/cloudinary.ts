const CLOUD_NAME = 'tu_cloud_name_real'; 
const UPLOAD_PRESET = 'el_nombre_de_tu_preset_unsigned'; 

// 1. LA FUNCIÓN PARA UN SOLO ARCHIVO (La tuya)
export const subirACloudinary = async (file: File, carpeta: 'documentos' | 'imagenes'): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET); 
  formData.append('folder', `jerezsur/${carpeta}`); 

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Error al subir a Cloudinary');
  }

  const data = await response.json();
  return data.secure_url;
};

// 2. 🌟 LA FUNCIÓN PARA MULTIPLES ARCHIVOS (Añade esta justo debajo)
export const subirMultiplesACloudinary = async (files: File[], carpeta: 'documentos' | 'imagenes'): Promise<string[]> => {
  if (!files || files.length === 0) return [];

  // Creamos un array de promesas (todas se ejecutan en paralelo)
  const promesasSubida = files.map(file => subirACloudinary(file, carpeta));

  // Esperamos a que TODAS terminen y nos devuelvan el array de URLs finales
  return Promise.all(promesasSubida);
};