import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import {
  MapPinIcon,
  PencilSquareIcon,
  EnvelopeIcon,
  UserCircleIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

interface UserProfile {
  username: string;
  first_name: string;
  last_name: string;
  about: string;
  city: string;
  region: string;
  photo_url: string | null;
  cover_photo_url: string | null;
}

export default function User() {
  const { user: currentUser } = useAuth();
  const { userId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    async function getProfile() {
      if (location.state?.fakeUser) {
        const fake = location.state.fakeUser;
        setProfile({
          username: fake.login.username,
          first_name: fake.name.first,
          last_name: fake.name.last,
          about: "Perfil gerado automaticamente pela API RandomUser.",
          city: fake.location.city,
          region: fake.location.country,
          photo_url: fake.picture.large || fake.picture.medium,
          cover_photo_url: null,
        });
        setLoading(false);
        return;
      }

      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Erro ao buscar perfil:", error);
        } else {
          setProfile(data);
        }
      } catch (error) {
        console.error("Erro inesperado:", error);
      } finally {
        setLoading(false);
      }
    }

    getProfile();
  }, [userId, location.state]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        Carregando perfil...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-gray-900 text-white">
        <p>Usuário não encontrado.</p>
        <button
          onClick={() => navigate("/lista")}
          className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold"
        >
          Voltar para o Feed
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="relative h-48 w-full bg-gray-800 lg:h-64">
        {profile.cover_photo_url ? (
          <img
            src={profile.cover_photo_url}
            alt="Capa"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-800 text-gray-600">
            <PhotoIcon className="h-16 w-16 opacity-20" />
          </div>
        )}
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
          <div className="flex">
            <div className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-full ring-4 ring-gray-900 bg-gray-800 overflow-hidden">
              {profile.photo_url ? (
                <img
                  className="h-full w-full object-cover"
                  src={profile.photo_url}
                  alt={profile.username}
                />
              ) : (
                <UserCircleIcon className="h-full w-full text-gray-400" />
              )}
            </div>
          </div>

          <div className="mt-6 sm:flex sm:min-w-0 sm:flex-1 sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
            <div className="mt-6 min-w-0 flex-1 sm:hidden md:block">
              <h1 className="truncate text-2xl font-bold text-white">
                {profile.first_name} {profile.last_name}
              </h1>
              <p className="text-gray-400">@{profile.username}</p>
            </div>

            <div className="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
              {isOwnProfile && (
                <button
                  type="button"
                  onClick={() => navigate("/cadastro")}
                  className="inline-flex justify-center gap-x-1.5 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-white/20 ring-1 ring-inset ring-white/10"
                >
                  <PencilSquareIcon
                    className="-ml-0.5 h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                  Editar Perfil
                </button>
              )}
              {!isOwnProfile && (
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                >
                  Conectar
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 min-w-0 flex-1 sm:hidden">
          <h1 className="truncate text-2xl font-bold text-white">
            {profile.first_name} {profile.last_name}
          </h1>
          <p className="text-gray-400">@{profile.username}</p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-lg bg-gray-800 p-6 shadow ring-1 ring-white/5">
              <h2 className="text-lg font-medium text-white mb-4">Sobre</h2>
              <div className="text-sm leading-6 text-gray-300 whitespace-pre-wrap">
                {profile.about || "Sem descrição."}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-lg bg-gray-800 p-6 shadow ring-1 ring-white/5">
              <h2 className="text-lg font-medium text-white mb-4">Detalhes</h2>
              <ul className="space-y-3">
                {(profile.city || profile.region) && (
                  <li className="flex items-center text-gray-300">
                    <MapPinIcon className="mr-2 h-5 w-5 text-gray-500" />
                    <span>
                      {profile.city}
                      {profile.city && profile.region && ", "}
                      {profile.region}
                    </span>
                  </li>
                )}

                {isOwnProfile && currentUser?.email && (
                  <li className="flex items-center text-gray-300">
                    <EnvelopeIcon className="mr-2 h-5 w-5 text-gray-500" />
                    <span>{currentUser.email}</span>
                  </li>
                )}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
