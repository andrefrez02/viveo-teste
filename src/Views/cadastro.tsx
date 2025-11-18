import {
  PhotoIcon,
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { useState, useRef, type ChangeEvent, type FocusEvent } from "react";

export default function Cadastro() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cep, setCep] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  const [photoFileName, setPhotoFileName] = useState<string | null>(null);
  const [coverPhotoFileName, setCoverPhotoFileName] = useState<string | null>(
    null
  );

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [coverPhotoFile, setCoverPhotoFile] = useState<File | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleRemovePhoto = () => {
    setPhotoFileName(null);
    setPhotoFile(null);
    if (photoInputRef.current) {
      photoInputRef.current.value = "";
    }
  };

  const handleRemoveCoverPhoto = () => {
    setCoverPhotoFileName(null);
    setCoverPhotoFile(null);
    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }
  };

  const handleCepBlur = async (event: FocusEvent<HTMLInputElement>) => {
    const cepValue = event.target.value.replace(/\D/g, "");

    if (cepValue.length !== 8) {
      return;
    }

    setIsLoadingCep(true);
    setError(null);
    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cepValue}/json/`
      );
      if (!response.ok) {
        throw new Error("Erro ao buscar CEP. Verifique a rede.");
      }
      const data = await response.json();

      if (data.erro) {
        setError("CEP não encontrado.");
        setStreetAddress("");
        setCity("");
        setRegion("");
      } else {
        setStreetAddress(data.logradouro || "");
        setCity(data.localidade || "");
        setRegion(data.uf || "");
      }
    } catch (err) {
      console.error("Falha ao buscar CEP:", err);
      setError("Falha ao buscar CEP.");
    } finally {
      setIsLoadingCep(false);
    }
  };

  const handleCepChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCep(event.target.value);
  };

  const handlePhotoFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setPhotoFileName(file.name);
      setPhotoFile(file);
    } else {
      setPhotoFileName(null);
      setPhotoFile(null);
    }
  };

  const handleCoverPhotoFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setCoverPhotoFileName(file.name);
      setCoverPhotoFile(file);
    } else {
      setCoverPhotoFileName(null);
      setCoverPhotoFile(null);
    }
  };

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    const email = (formData.get("email") as string).trim();
    const password = formData.get("password") as string;
    const username = (formData.get("username") as string).trim();

    const firstName = formData.get("first-name") as string;
    const lastName = formData.get("last-name") as string;
    const city = formData.get("city") as string;
    const region = formData.get("region") as string;
    const about = formData.get("about") as string;
    const streetAddress = formData.get("street-address") as string;
    const postalCode = formData.get("postal-code") as string;

    if (!email || !password || !username) {
      setError("Email, Senha e Nome de Usuário são obrigatórios.");
      setIsLoading(false);
      return;
    }

    try {
      const authData = await signup(email, password);
      if (!authData?.user) {
        throw new Error("Não foi possível criar o usuário no Auth.");
      }

      const userId = authData.user.id;
      let photoUrl: string | null = null;
      let coverPhotoUrl: string | null = null;

      if (photoFile && photoFile.size > 0) {
        const fileExt = photoFile.name.split(".").pop();
        const photoPath = `public/${userId}/avatar.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(photoPath, photoFile, { upsert: true });

        if (uploadError) {
          console.error("Erro no upload da foto:", uploadError);
          throw new Error(`Falha no upload da foto: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(photoPath);

        photoUrl = urlData.publicUrl;
      }

      if (coverPhotoFile && coverPhotoFile.size > 0) {
        const fileExt = coverPhotoFile.name.split(".").pop();
        const coverPath = `public/${userId}/banner.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("banners")
          .upload(coverPath, coverPhotoFile, { upsert: true });

        if (uploadError) {
          console.error("Erro no upload do banner:", uploadError);
          throw new Error(`Falha no upload do banner: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage
          .from("banners")
          .getPublicUrl(coverPath);

        coverPhotoUrl = urlData.publicUrl;
      }

      const { error: dbError } = await supabase.from("users").insert({
        id: userId,
        email: email,
        username: username,
        first_name: firstName,
        last_name: lastName,
        city: city,
        about: about,
        postal_code: postalCode,
        street_address: streetAddress,
        region: region,
        photo_url: photoUrl,
        cover_photo_url: coverPhotoUrl,
      });

      if (dbError) {
        console.error("Erro ao salvar perfil no DB:", dbError);
        throw new Error(
          `Usuário criado, mas falha ao salvar perfil: ${dbError.message}`
        );
      }

      navigate("/lista");
    } catch (error) {
      console.error("Signup failed:", error);
      setError("Erro ao cadastrar. Verifique o console.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSignup}
      className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8"
    >
      <div className="space-y-12">
        <div className="border-b border-white/10 pb-12">
          <h2 className="text-base/7 font-semibold text-white">Perfil</h2>
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label
                htmlFor="username"
                className="block text-sm/6 font-medium text-white"
              >
                Nome de Usuário
              </label>
              <div className="mt-2">
                <div className="flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Joaozinho@02"
                    className="block min-w-0 grow bg-transparent py-1.5 pr-3 pl-1 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6"
                  />
                </div>
              </div>
            </div>

            <div className="col-span-full">
              <label
                htmlFor="about"
                className="block text-sm/6 font-medium text-white"
              >
                Sobre
              </label>
              <div className="mt-2">
                <textarea
                  id="about"
                  name="about"
                  rows={3}
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  defaultValue={""}
                />
              </div>
              <p className="mt-3 text-sm/6 text-gray-400">
                Escreva um pouco sobre você.
              </p>
            </div>

            <div className="col-span-2">
              <label
                htmlFor="photo-upload"
                className="block text-sm/6 font-medium text-white"
              >
                Foto
              </label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-white/25 px-6 py-10">
                <div className="text-center">
                  <UserCircleIcon
                    aria-hidden="true"
                    className="mx-auto size-12 text-gray-600"
                  />
                  <div className="mt-4 flex text-sm/6 text-gray-400">
                    {photoFileName ? (
                      <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full">
                        <span className="text-indigo-400 font-medium">
                          {photoFileName}
                        </span>
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="text-gray-400 hover:text-white transition-colors"
                          title="Remover foto"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <label
                          htmlFor="photo-upload"
                          className="relative cursor-pointer rounded-md bg-transparent font-semibold text-indigo-400 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-indigo-500 hover:text-indigo-300"
                        >
                          <span>Envie o arquivo</span>
                          <input
                            id="photo-upload"
                            name="photo-upload"
                            type="file"
                            ref={photoInputRef}
                            className="sr-only"
                            accept="image/png, image/jpeg"
                            onChange={handlePhotoFileChange}
                          />
                        </label>
                        <p className="pl-1">ou arraste e solte aqui</p>
                      </>
                    )}
                  </div>
                  <p className="text-xs/5 text-gray-400">
                    PNG, JPG, GIF até 10MB
                  </p>
                </div>
              </div>
            </div>

            <div className="col-span-4">
              <label
                htmlFor="cover-photo-upload"
                className="block text-sm/6 font-medium text-white"
              >
                Foto de fundo
              </label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-white/25 px-6 py-10">
                <div className="text-center">
                  <PhotoIcon
                    aria-hidden="true"
                    className="mx-auto size-12 text-gray-600"
                  />
                  <div className="mt-4 flex text-sm/6 text-gray-400">
                    {coverPhotoFileName ? (
                      <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full">
                        <span className="text-indigo-400 font-medium">
                          {coverPhotoFileName}
                        </span>
                        <button
                          type="button"
                          onClick={handleRemoveCoverPhoto}
                          className="text-gray-400 hover:text-white transition-colors"
                          title="Remover banner"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <label
                          htmlFor="cover-photo-upload"
                          className="relative cursor-pointer rounded-md bg-transparent font-semibold text-indigo-400 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-indigo-500 hover:text-indigo-300"
                        >
                          <span>Envie o arquivo</span>
                          <input
                            id="cover-photo-upload"
                            name="cover-photo-upload"
                            type="file"
                            ref={coverInputRef}
                            className="sr-only"
                            accept="image/png, image/jpeg"
                            onChange={handleCoverPhotoFileChange}
                          />
                        </label>
                        <p className="pl-1">ou arraste e solte aqui</p>
                      </>
                    )}
                  </div>
                  <p className="text-xs/5 text-gray-400">
                    PNG, JPG, GIF até 10MB
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-white/10 pb-12">
          <h2 className="text-base/7 font-semibold text-white">
            Informações Pessoais
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label
                htmlFor="first-name"
                className="block text-sm/6 font-medium text-white"
              >
                Primeiro nome
              </label>
              <div className="mt-2">
                <input
                  id="first-name"
                  name="first-name"
                  type="text"
                  autoComplete="given-name"
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="last-name"
                className="block text-sm/6 font-medium text-white"
              >
                Sobrenome
              </label>
              <div className="mt-2">
                <input
                  id="last-name"
                  name="last-name"
                  type="text"
                  autoComplete="family-name"
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label
                htmlFor="email"
                className="block text-sm/6 font-medium text-white"
              >
                Endereço de e-mail
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label
                htmlFor="password"
                className="block text-sm/6 font-medium text-white"
              >
                Senha
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline-1 -outline-offset-1 outline-white/10 focus:outline-indigo-500 sm:text-sm/6"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="country"
                className="block text-sm/6 font-medium text-white"
              >
                País
              </label>
              <div className="mt-2 grid grid-cols-1">
                <select
                  id="country"
                  name="country"
                  autoComplete="country-name"
                  className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white/5 py-1.5 pr-8 pl-3 text-base text-white outline-1 -outline-offset-1 outline-white/10 *:bg-gray-800 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                >
                  <option>Brasil</option>
                  <option disabled>Estados Unidos</option>
                  <option disabled>México</option>
                </select>
                <ChevronDownIcon
                  aria-hidden="true"
                  className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-400 sm:size-4"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="postal-code"
                className="block text-sm/6 font-medium text-white"
              >
                CEP
              </label>
              <div className="mt-2 relative">
                <input
                  id="postal-code"
                  name="postal-code"
                  type="text"
                  autoComplete="postal-code"
                  value={cep}
                  onChange={handleCepChange}
                  onBlur={handleCepBlur}
                  placeholder="00000-000"
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                />
                {isLoadingCep && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg
                      className="animate-spin h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-full">
              <label
                htmlFor="street-address"
                className="block text-sm/6 font-medium text-white"
              >
                Rua ou Logradouro
              </label>
              <div className="mt-2">
                <input
                  id="street-address"
                  name="street-address"
                  type="text"
                  autoComplete="street-address"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                />
              </div>
            </div>

            <div className="sm:col-span-2 sm:col-start-1">
              <label
                htmlFor="city"
                className="block text-sm/6 font-medium text-white"
              >
                Cidade
              </label>
              <div className="mt-2">
                <input
                  id="city"
                  name="city"
                  type="text"
                  autoComplete="address-level2"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="region"
                className="block text-sm/6 font-medium text-white"
              >
                Estado
              </label>
              <div className="mt-2">
                <input
                  id="region"
                  name="region"
                  type="text"
                  autoComplete="address-level1"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="my-4 rounded-md bg-red-500/20 p-3 text-center text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="text-sm/6 font-semibold text-white"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading || isLoadingCep}
          className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50"
        >
          {isLoading
            ? "Salvando..."
            : isLoadingCep
            ? "Buscando CEP..."
            : "Salvar e Enviar"}
        </button>
      </div>
    </form>
  );
}
