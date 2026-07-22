"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Camera, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/app/(auth)/actions";

export default function SettingsClient({
  userId,
  email,
  fullName,
  phone,
  avatarUrl,
}: {
  userId: string;
  email: string;
  fullName: string;
  phone: string;
  avatarUrl: string | null;
}) {
  const supabase = createClient();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatar, setAvatar] = useState(avatarUrl);
  const [name, setName] = useState(fullName);
  const [phoneValue, setPhoneValue] = useState(phone);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  async function handleAvatarChange(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `${userId}/avatar.png`;
    const { error: uploadError } = await supabase.storage.from("portfolio").upload(path, file, { upsert: true });
    if (!uploadError) {
      const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`;
      await supabase.from("profiles").update({ avatar_url: url }).eq("id", userId);
      setAvatar(url);
    }
    setUploading(false);
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    await supabase.from("profiles").update({ full_name: name.trim(), phone: phoneValue.trim() || null }).eq("id", userId);
    setSaving(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  async function handlePasswordChange() {
    setPasswordError("");
    if (newPassword.length < 6) {
      setPasswordError("Пароль должен содержать минимум 6 символов");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Пароли не совпадают");
      return;
    }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSaved(true);
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
      setTimeout(() => setPasswordSaved(false), 2000);
    }
    setSavingPassword(false);
  }

  const initials = name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col gap-6 px-4 pt-6 pb-8">
      <div>
        <h1 className="font-serif text-[24px] text-ink">Настройки профиля</h1>
        <p className="mt-1 text-[13px] text-ink-soft">Личные данные и безопасность</p>
      </div>

      <div className="flex items-center gap-3.5 rounded-2xl border border-line bg-surface p-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 transition-opacity hover:opacity-80 disabled:opacity-50"
          style={{ background: "var(--surface-2)", borderColor: "var(--surface)" }}
        >
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="font-serif text-[16px] text-ink">{initials}</span>
          )}
          <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-0.5 bg-black/55 py-0.5 text-[9px] text-white">
            <Camera size={10} strokeWidth={1.8} />
            {uploading ? "…" : "Фото"}
          </span>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatarChange(e.target.files)} />
        <div className="text-[12.5px] text-ink-faint">Нажмите на аватар, чтобы загрузить фотографию</div>
      </div>

      <div className="flex flex-col gap-3.5 rounded-2xl border border-line bg-surface p-4">
        <Field label="Имя" value={name} onChange={setName} placeholder="Как к вам обращаться" />
        <Field label="Телефон" value={phoneValue} onChange={setPhoneValue} placeholder="+7 900 000-00-00" />
        <div className="text-[12.5px] text-ink-faint">Email: {email}</div>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="rounded-xl py-3 text-[13.5px] font-medium text-white disabled:opacity-50"
        style={{ background: "var(--accent)" }}
      >
        {saving ? "Сохраняем…" : saved ? "Сохранено ✓" : "Сохранить"}
      </button>

      {!showPasswordForm ? (
        <button onClick={() => setShowPasswordForm(true)} className="rounded-xl border border-line py-3 text-[13.5px] text-ink-soft">
          Изменить пароль
        </button>
      ) : (
        <div className="flex flex-col gap-3.5 rounded-2xl border border-line bg-surface p-4">
          <Field label="Новый пароль" value={newPassword} onChange={setNewPassword} type="password" placeholder="Минимум 6 символов" />
          <Field label="Подтвердите пароль" value={confirmPassword} onChange={setConfirmPassword} type="password" placeholder="Повторите пароль" />
          {passwordError && <p className="text-[12px] text-red-500">{passwordError}</p>}
          <div className="flex gap-2">
            <button
              onClick={handlePasswordChange}
              disabled={savingPassword}
              className="flex-1 rounded-xl py-2.5 text-[13px] font-medium text-white disabled:opacity-50"
              style={{ background: "var(--accent)" }}
            >
              {savingPassword ? "Сохраняем…" : "Сохранить пароль"}
            </button>
            <button
              onClick={() => {
                setShowPasswordForm(false);
                setPasswordError("");
                setNewPassword("");
                setConfirmPassword("");
              }}
              className="flex-1 rounded-xl border border-line py-2.5 text-[13px] text-ink-soft"
            >
              Отмена
            </button>
          </div>
          {passwordSaved && <p className="text-center text-[12px] text-green-600">Пароль успешно изменён ✓</p>}
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        <Link href="/profile" className="flex items-center justify-center gap-2 rounded-xl border border-line py-3 text-[13.5px] text-ink-soft">
          <ArrowRight size={15} strokeWidth={1.8} />
          Вернуться в профиль
        </Link>
        <form action={signOut}>
          <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl border border-line py-3 text-[13.5px] text-ink-soft">
            <LogOut size={15} strokeWidth={1.8} />
            Выйти
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] text-ink-faint">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[13.5px] text-ink placeholder:text-ink-faint focus:outline-none"
      />
    </label>
  );
}
