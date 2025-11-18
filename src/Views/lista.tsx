import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";
import { UserCircleIcon } from "@heroicons/react/24/solid";

interface RealUser {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  photo_url: string | null;
  about: string | null;
}

interface FakeUser {
  login: { uuid: string; username: string };
  name: { first: string; last: string };
  email: string;
  picture: { medium: string; large: string };
  location: { city: string; country: string };
}

export default function Lista() {
  const [realUsers, setRealUsers] = useState<RealUser[]>([]);
  const [fakeUsers, setFakeUsers] = useState<FakeUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: supabaseData, error } = await supabase
          .from("users")
          .select("*");

        if (error) console.error("Erro ao buscar usuários:", error);
        else setRealUsers(supabaseData || []);

        const apiResponse = await fetch(
          "https://api.allorigins.win/raw?url=" +
            encodeURIComponent("https://randomuser.me/api/?results=5&nat=br")
        );

        if (!apiResponse.ok) {
          throw new Error(`Erro na API externa: ${apiResponse.status}`);
        }

        const apiData = await apiResponse.json();
        setFakeUsers(apiData.results);
      } catch (error) {
        console.error("Erro geral:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-10 text-white">
        Carregando feed...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-indigo-400 mb-4">
          Minha rede
        </h2>
        <ul
          role="list"
          className="divide-y divide-white/5 bg-gray-800/50 rounded-xl ring-1 ring-white/10"
        >
          {realUsers.length === 0 ? (
            <li className="p-4 text-gray-400 text-sm">
              Nenhum usuário cadastrado ainda.
            </li>
          ) : (
            realUsers.map((person) => (
              <li
                key={person.id}
                className="hover:bg-white/5 transition-colors"
              >
                <Link
                  to={`/user/${person.id}`}
                  className="flex justify-between gap-x-6 py-5 px-4"
                >
                  <div className="flex min-w-0 gap-x-4">
                    {person.photo_url ? (
                      <img
                        alt=""
                        src={person.photo_url}
                        className="size-12 flex-none rounded-full bg-gray-800 object-cover"
                      />
                    ) : (
                      <UserCircleIcon className="size-12 flex-none text-gray-600" />
                    )}
                    <div className="min-w-0 flex-auto">
                      <p className="text-sm/6 font-semibold text-white">
                        {person.first_name} {person.last_name}
                      </p>
                      <p className="mt-1 truncate text-xs/5 text-gray-400">
                        @{person.username || "sem_usuario"}
                      </p>
                    </div>
                  </div>
                  <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                    <p className="text-sm/6 text-white">Membro</p>
                    <p className="mt-1 text-xs/5 text-gray-400">Ver perfil</p>
                  </div>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="relative my-10">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-gray-900 px-3 text-base font-semibold leading-6 text-white">
            Sugestões
          </span>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-emerald-400 mb-4">
          Pessoas que você talvez conheça
        </h2>
        <ul
          role="list"
          className="divide-y divide-white/5 bg-gray-800/30 rounded-xl ring-1 ring-white/5"
        >
          {fakeUsers.map((person) => (
            <li
              key={person.login.uuid}
              className="hover:bg-white/5 transition-colors"
            >
              <Link
                to={`/user/${person.login.uuid}`}
                state={{ fakeUser: person }}
                className="flex justify-between gap-x-6 py-5 px-4"
              >
                <div className="flex min-w-0 gap-x-4">
                  <img
                    alt=""
                    src={person.picture.medium}
                    className="size-12 flex-none rounded-full bg-gray-800 object-cover"
                  />
                  <div className="min-w-0 flex-auto">
                    <p className="text-sm/6 font-semibold text-white">
                      {person.name.first} {person.name.last}
                    </p>
                    <p className="mt-1 truncate text-xs/5 text-gray-400">
                      {person.location.city}, {person.location.country}
                    </p>
                  </div>
                </div>
                <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                  <p className="text-sm/6 text-indigo-400">Ver perfil</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
