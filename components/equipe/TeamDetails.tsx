"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";

import {
  X,
  Pencil,
  Trash2,
  Phone,
  Mail,
  BriefcaseBusiness,
  Camera,
  User,
} from "lucide-react";

import { TeamMember } from "@/data/Team";

interface TeamDetailsProps {
  member: TeamMember | null;
  isEditing: boolean;
  onClose: () => void;
  onStartEdit: (member: TeamMember) => void;
  onEdit: (member: TeamMember) => void;
  onDelete: (member: TeamMember) => void;
}

export function TeamDetails({
  member,
  isEditing,
  onClose,
  onStartEdit,
  onEdit,
  onDelete,
}: TeamDetailsProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    if (!member) return;

    setName(member.name);
    setRole(member.role);
    setPhone(member.phone);
    setEmail(member.email);
    setPhoto(member.photo ?? "");
    setError("");
  }, [member]);

  if (!member) {
    return null;
  }

  const active = member.status === "Ativo";

  /*FOTO*/
  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Selecione uma fotografia válida.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("A fotografia deve ter no máximo 5 MB.");
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setPhoto(imageUrl);
    setError("");
  }

  /*SALVAR EDIÇÃO*/
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!member) {
      return;
    }

    if (!name.trim()) {
      setError("Informe o nome completo.");
      return;
    }

    if (!role.trim()) {
      setError("Informe o cargo.");
      return;
    }

    if (!phone.trim()) {
      setError("Informe o telefone.");
      return;
    }

    if (!email.trim()) {
      setError("Informe o email.");
      return;
    }

    const newData: TeamMember = {
      id: member.id,
      name: name.trim(),
      role: role.trim(),
      phone: phone.trim(),
      email: email.trim(),
      photo: photo || "",
      status: member.status,
    };

    onEdit(newData);
  }

  /* MODO EDIÇÃO */
  if (isEditing) {
    return (
      <div
        className="
          fixed
          inset-0
          z-50
          flex
          items-center
          justify-center
          bg-black/40
          p-4
          backdrop-blur-sm
        "
        onClick={onClose}
      >
        <div
          className="
            max-h-[90vh]
            w-full
            max-w-lg
            overflow-y-auto
            rounded-2xl
            bg-white
            shadow-2xl
          "
          onClick={(event) => event.stopPropagation()}
        >
          {/* HEADER */}
          <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Editar profissional
              </p>

              <h2 className="mt-1 text-xl font-bold text-gray-950">
                {member.name}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Atualize as informações do profissional.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                text-gray-400
                transition
                hover:bg-gray-100
                hover:text-gray-900
              "
              aria-label="Fechar edição"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* FORMULÁRIO */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-5 px-6 py-6">
              {/* FOTOGRAFIA */}
              <div>
                <label className="mb-3 block text-sm font-semibold text-gray-700">
                  Fotografia
                </label>

                <div className="flex items-center gap-4">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 ring-2 ring-gray-200">
                    {photo ? (
                      <img
                        src={photo}
                        alt={`Foto de ${name}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-9 w-9 text-gray-400" />
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="edit-team-photo"
                      className="
                        inline-flex
                        cursor-pointer
                        items-center
                        gap-2
                        rounded-xl
                        border
                        border-gray-200
                        px-4
                        py-2.5
                        text-sm
                        font-semibold
                        text-gray-700
                        transition
                        hover:bg-gray-50
                      "
                    >
                      <Camera className="h-4 w-4" />

                      {photo ? "Alterar fotografia" : "Adicionar fotografia"}
                    </label>

                    <input
                      id="edit-team-photo"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />

                    <p className="mt-2 text-xs text-gray-400">
                      JPG, PNG ou WebP · Máx. 5 MB
                    </p>
                  </div>
                </div>
              </div>

              {/* NOME */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Nome completo
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    px-4
                    text-sm
                    text-gray-900
                    outline-none
                    transition
                    focus:border-gray-950
                    focus:ring-4
                    focus:ring-gray-100
                  "
                />
              </div>

              {/* CARGO */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Cargo
                </label>

                <input
                  type="text"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    px-4
                    text-sm
                    text-gray-900
                    outline-none
                    transition
                    focus:border-gray-950
                    focus:ring-4
                    focus:ring-gray-100
                  "
                />
              </div>

              {/* TELEFONE */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Telefone
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    px-4
                    text-sm
                    text-gray-900
                    outline-none
                    transition
                    focus:border-gray-950
                    focus:ring-4
                    focus:ring-gray-100
                  "
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    px-4
                    text-sm
                    text-gray-900
                    outline-none
                    transition
                    focus:border-gray-950
                    focus:ring-4
                    focus:ring-gray-100
                  "
                />
              </div>

              {/* ERRO */}
              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-gray-700
                  transition
                  hover:bg-gray-50
                "
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-gray-950
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-gray-800
                "
              >
                <Pencil className="h-4 w-4" />
                Salvar alterações
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/30
        p-4
        backdrop-blur-[2px]
      "
      onClick={onClose}
    >
      <div
        className="
          w-full
          max-w-lg
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
        "
        onClick={(event) => event.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Profissional
            </p>

            <h2 className="mt-1 text-xl font-bold text-gray-950">
              {member.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              text-gray-400
              transition
              hover:bg-gray-100
              hover:text-gray-900
            "
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* PERFIL */}
        <div className="space-y-5 px-6 py-6">
          <div className="flex items-center gap-4">
            {/* FOTO */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-lg font-bold text-gray-700">
              {member.photo ? (
                <img
                  src={member.photo}
                  alt={`Foto de ${member.name}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                member.name.charAt(0).toUpperCase()
              )}
            </div>

            {/* NOME */}
            <div className="min-w-0">
              <p className="font-semibold text-gray-950">{member.name}</p>

              <p className="mt-1 text-sm text-gray-500">{member.role}</p>
            </div>

            {/* STATUS */}
            <span
              className={`
                ml-auto
                inline-flex
                items-center
                gap-1.5
                rounded-full
                px-2.5
                py-1
                text-xs
                font-medium
                ${
                  active
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-gray-100 text-gray-600"
                }
              `}
            >
              <span
                className={`
                  h-1.5
                  w-1.5
                  rounded-full
                  ${active ? "bg-emerald-500" : "bg-gray-400"}
                `}
              />

              {member.status}
            </span>
          </div>

          {/* INFORMAÇÕES */}
          <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-100">
            {/* CARGO */}
            <div className="flex items-center gap-3 px-4 py-3.5">
              <BriefcaseBusiness className="h-4 w-4 text-gray-400" />

              <div>
                <p className="text-xs text-gray-400">Cargo</p>

                <p className="mt-0.5 text-sm font-medium text-gray-800">
                  {member.role}
                </p>
              </div>
            </div>

            {/* TELEFONE */}
            <div className="flex items-center gap-3 px-4 py-3.5">
              <Phone className="h-4 w-4 text-gray-400" />

              <div>
                <p className="text-xs text-gray-400">Telefone</p>

                <p className="mt-0.5 text-sm font-medium text-gray-800">
                  {member.phone}
                </p>
              </div>
            </div>

            {/* EMAIL */}
            <div className="flex items-center gap-3 px-4 py-3.5">
              <Mail className="h-4 w-4 text-gray-400" />

              <div className="min-w-0">
                <p className="text-xs text-gray-400">Email</p>

                <p className="mt-0.5 truncate text-sm font-medium text-gray-800">
                  {member.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AÇÕES */}
        <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
          <button
            type="button"
            onClick={() => onDelete(member)}
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              px-4
              py-2.5
              text-sm
              font-semibold
              text-red-600
              transition
              hover:bg-red-50
            "
          >
            <Trash2 className="h-4 w-4" />
            Excluir
          </button>

          <button
            type="button"
            onClick={() => onStartEdit(member)}
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-gray-950
              px-4
              py-2.5
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-gray-800
            "
          >
            <Pencil className="h-4 w-4" />
            Editar
          </button>
        </div>
      </div>
    </div>
  );
}
