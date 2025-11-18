import {
  PhotoIcon,
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import {
  useState,
  useRef,
  useEffect,
  type ChangeEvent,
  type FocusEvent,
} from "react";

export default function Cadastro() {
  const navigate = useNavigate();
  const { signup, user } = useAuth();

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(
    null
  );

  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [about, setAbout] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  useEffect(() => {
    if (user) {
      setIsEditMode(true);
      setIsLoading(true);

      const fetchProfile = async () => {
        try {
          const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single();

          if (error) throw error;

          if (data) {
            setUsername(data.username || "");
            setFirstName(data.first_name || "");
            setLastName(data.last_name || "");
            setAbout(data.about || "");
            setCep(data.postal_code || "");
            setStreetAddress(data.street_address || "");
            setCity(data.city || "");
            setRegion(data.region || "");
            setEmail(user.email || "");
            setPhotoPreview(data.photo_url || null);
            setCoverPhotoPreview(data.cover_photo_url || null);
          }
        } catch (err) {
          console.error("Erro ao carregar perfil:", err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchProfile();
    }
  }, [user]);

  const handleCepBlur = async (event: FocusEvent<HTMLInputElement>) => {
    const cepValue = event.target.value.replace(/\D/g, "");
    if (cepValue.length !== 8) return;

    setIsLoadingCep(true);
    setError(null);
    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cepValue}/json/`
      );
      if (!response.ok) throw new Error("Erro ao buscar CEP.");
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
      console.error(err);
      setError("Falha ao buscar CEP.");
    } finally {
      setIsLoadingCep(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFileName(null);
    setPhotoFile(null);
    setPhotoPreview(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const handleRemoveCoverPhoto = () => {
    setCoverPhotoFileName(null);
    setCoverPhotoFile(null);
    setCoverPhotoPreview(null);
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const handlePhotoFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setPhotoFileName(file.name);
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      handleRemovePhoto();
    }
  };

  const handleCoverPhotoFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setCoverPhotoFileName(file.name);
      setCoverPhotoFile(file);
      setCoverPhotoPreview(URL.createObjectURL(file));
    } else {
      handleRemoveCoverPhoto();
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let currentUserId = user?.id;

      if (!isEditMode) {
        if (!email || !password || !username) {
          throw new Error("Email, Senha e Nome de Usuário são obrigatórios.");
        }
        const authData = await signup(email, password);
        if (!authData?.user) throw new Error("Erro ao criar usuário.");
        currentUserId = authData.user.id;
      }

      if (!currentUserId) throw new Error("ID de usuário inválido.");

      let photoUrl: string | undefined = undefined;
      let coverPhotoUrl: string | undefined = undefined;

      if (photoFile) {
        const fileExt = photoFile.name.split(".").pop();
        const photoPath = `${currentUserId}/avatar.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(photoPath, photoFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("avatars")
          .getPublicUrl(photoPath);
        photoUrl = data.publicUrl;
      }

      if (coverPhotoFile) {
        const fileExt = coverPhotoFile.name.split(".").pop();
        const coverPath = `${currentUserId}/banner.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("banners")
          .upload(coverPath, coverPhotoFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("banners")
          .getPublicUrl(coverPath);
        coverPhotoUrl = data.publicUrl;
      }

      const profileData = {
        username,
        first_name: firstName,
        last_name: lastName,
        about,
        postal_code: cep,
        street_address: streetAddress,
        city,
        region,
        ...(photoUrl && { photo_url: photoUrl }),
        ...(coverPhotoUrl && { cover_photo_url: coverPhotoUrl }),
      };

      let dbError;

      if (isEditMode) {
        const { error } = await supabase
          .from("users")
          .update(profileData)
          .eq("id", currentUserId);
        dbError = error;
      } else {
        const { error } = await supabase.from("users").insert({
          id: currentUserId,
          email: email,
          ...profileData,
        });
        dbError = error;
      }

      if (dbError) throw dbError;

      if (isEditMode) {
        navigate("/lista");
      } else {
        navigate("/");
      }

      navigate("/lista");
    } catch (err) {
      console.error(err);
      setError("Erro ao salvar.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8"
    >
      <div className="space-y-12">
        <div className="border-b border-white/10 pb-12">
          <h2 className="text-base/7 font-semibold text-white">
            {isEditMode ? "Editar Perfil" : "Criar Perfil"}
          </h2>

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
                    type="text"
                    placeholder="Joaozinho@02"
                    className="block min-w-0 grow bg-transparent py-1.5 pr-3 pl-1 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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
                  rows={3}
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                />
              </div>
              <p className="mt-3 text-sm/6 text-gray-400">
                Escreva um pouco sobre você.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm/6 font-medium text-white">
                Foto
              </label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-white/25 px-6 py-10 relative overflow-hidden group">
                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none"
                  />
                )}

                <div className="text-center relative z-10">
                  <UserCircleIcon
                    className="mx-auto size-12 text-gray-600"
                    aria-hidden="true"
                  />
                  <div className="mt-4 flex text-sm/6 text-gray-400 justify-center">
                    {photoFileName ? (
                      <div className="flex items-center gap-2 bg-gray-900/80 px-3 py-1 rounded-full backdrop-blur-sm">
                        <span className="text-indigo-400 font-medium truncate max-w-[150px]">
                          {photoFileName}
                        </span>
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="text-gray-400 hover:text-white"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="photo-upload"
                        className="relative cursor-pointer rounded-md bg-transparent font-semibold text-indigo-400 hover:text-indigo-300"
                      >
                        <span className="drop-shadow-md">Envie o arquivo</span>
                        <input
                          id="photo-upload"
                          name="photo-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          ref={photoInputRef}
                          onChange={handlePhotoFileChange}
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-xs/5 text-gray-400 drop-shadow-md">
                    PNG, JPG, GIF até 10MB
                  </p>
                </div>
              </div>
            </div>

            <div className="sm:col-span-4">
              <label className="block text-sm/6 font-medium text-white">
                Foto de fundo
              </label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-white/25 px-6 py-10 relative overflow-hidden group">
                {coverPhotoPreview && (
                  <img
                    src={coverPhotoPreview}
                    alt="Cover Preview"
                    className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none"
                  />
                )}

                <div className="text-center relative z-10">
                  <PhotoIcon
                    className="mx-auto size-12 text-gray-600"
                    aria-hidden="true"
                  />
                  <div className="mt-4 flex text-sm/6 text-gray-400 justify-center">
                    {coverPhotoFileName ? (
                      <div className="flex items-center gap-2 bg-gray-900/80 px-3 py-1 rounded-full backdrop-blur-sm">
                        <span className="text-indigo-400 font-medium truncate max-w-[150px]">
                          {coverPhotoFileName}
                        </span>
                        <button
                          type="button"
                          onClick={handleRemoveCoverPhoto}
                          className="text-gray-400 hover:text-white"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="cover-photo-upload"
                        className="relative cursor-pointer rounded-md bg-transparent font-semibold text-indigo-400 hover:text-indigo-300"
                      >
                        <span className="drop-shadow-md">Envie o arquivo</span>
                        <input
                          id="cover-photo-upload"
                          name="cover-photo-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          ref={coverInputRef}
                          onChange={handleCoverPhotoFileChange}
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-xs/5 text-gray-400 drop-shadow-md">
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
                  type="text"
                  name="first-name"
                  id="first-name"
                  autoComplete="given-name"
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 focus:outline-indigo-500 sm:text-sm/6"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
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
                  type="text"
                  name="last-name"
                  id="last-name"
                  autoComplete="family-name"
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 focus:outline-indigo-500 sm:text-sm/6"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            {!isEditMode && (
              <>
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
                      className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 focus:outline-indigo-500 sm:text-sm/6"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline-1 -outline-offset-1 outline-white/10 focus:outline-indigo-500 sm:text-sm/6"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

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
                  className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white/5 py-1.5 pr-8 pl-3 text-base text-white outline-1 -outline-offset-1 outline-white/10 *:bg-gray-800 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                >
                  <option>Brasil</option>
                  <option disabled>Estados Unidos</option>
                  <option disabled>México</option>
                </select>
                <ChevronDownIcon
                  className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-400 sm:size-4"
                  aria-hidden="true"
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
                  type="text"
                  name="postal-code"
                  id="postal-code"
                  autoComplete="postal-code"
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 focus:outline-indigo-500 sm:text-sm/6"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  onBlur={handleCepBlur}
                />
                {isLoadingCep && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-xs">...</span>
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
                  type="text"
                  name="street-address"
                  id="street-address"
                  autoComplete="street-address"
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 focus:outline-indigo-500 sm:text-sm/6"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
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
                  type="text"
                  name="city"
                  id="city"
                  autoComplete="address-level2"
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 focus:outline-indigo-500 sm:text-sm/6"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
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
                  type="text"
                  name="region"
                  id="region"
                  autoComplete="address-level1"
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 focus:outline-indigo-500 sm:text-sm/6"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
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
            ? "Carregando..."
            : isEditMode
            ? "Salvar Alterações"
            : "Salvar e Enviar"}
        </button>
      </div>
    </form>
  );
}
