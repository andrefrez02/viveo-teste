import { useEffect, useState, type ReactNode, type ReactElement } from "react";
import type { Session, User, AuthResponse } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { AuthContext } from "./AuthContextDef";

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signup = async (
    email: string,
    password: string
  ): Promise<AuthResponse["data"]> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.warn("Aviso ao sair do Supabase:", error.message);
      }
    } catch (error) {
      console.warn(
        "Erro inesperado ao sair (possivelmente já deslogado):",
        error
      );
    } finally {
      setUser(null);
      setSession(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
