"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../supabase'; // Asegúrate de que la ruta sea correcta

function Page() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login'); // Redirige a la página de login si no hay sesión
      } else {
        router.push("/dashboard")
      }
    };

    checkSession();
  }, [router]);

  return (
    <div>
      {/* Contenido de la página */}
    </div>
  );
}

export default Page;
