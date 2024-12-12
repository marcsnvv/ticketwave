"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../supabase'; // Asegúrate de que la ruta sea correcta

function Page() {
  const router = useRouter();

  const checkDiscordMembership = async (access_token) => {
    try {
      // Verificar membresía en el servidor
      const guildResponse = await fetch(`https://discord.com/api/users/@me/guilds/1252606608999977080/member`, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });

      if (!guildResponse.ok) {
        console.error('User is not a member of the required server');
        return false;
      }

      const guildData = await guildResponse.json();
      console.log(guildData)

      // Verificar si tiene el rol específico
      if (!guildData.roles.includes("1316157670272532582")) {
        console.error('User does not have the required role');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking Discord membership:', error);
      return false;
    }
  }

  // Añadir este efecto para manejar el callback de Discord
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.provider_token) {
        const hasAccess = await checkDiscordMembership(session.provider_token);
        if (!hasAccess) {
          await supabase.auth.signOut();
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

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
