"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, Camera, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/app/(auth)/actions";

export default function SettingsClient({
  masterId,
  fullName,
  phone,
  avatarUrl,
  coverUrl,
  specialization,
  city,
  district,
  bio,
}: {
  masterId: string;
  fullName: string;
  phone: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  specialization: string;
  city: string;
  district: string;
  bio: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [avatar, setAvatar] = useState(avatarUrl);
  const [cover, setCover] = useState(coverUrl);
  const [name, setName] = useState(fullName);
  const [phoneValue, setPhoneValue] = useState(phone);
  const [spec, setSpec] = useState(specialization);
  const [cityValue, setCityValue] = useState(city);
  const [districtValue, setDistrictValue] = useState(district);
  const [bioValue, setBioValue] = useState(bio);
  const [uploading, setUploading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
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
    const path = `${masterId}/avatar.png`;
    const { error: uploadError } = await supabase.storage.from("portfolio").upload(path, file, { upsert: true });
    if (!uploadError) {
      const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`;
      await supabase.from("profiles").update({ avatar_url: url }).eq("id", masterId);
      setAvatar(url);
    }
    setUploading(false);
  }

  async function handleCoverChange(files: FileList | null) {
  const file = files?.[0];
  if (!file) return;

  // Простая валидация
  if (file.size > 5 * 1024 * 1024) { // 5MB
    alert("Файл слишком большой (макс. 5 МБ)");
    return;
  }

  setUploadingCover(true);

  try {
    const path = `${masterId}/cover.jpg`; // можно сделать динамическое расширение, но .jpg ок

    const { error: uploadError } = await supabase.storage
      .from("portfolio")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      alert("Ошибка загрузки: " + uploadError.message);
      return;
    }

    const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
    const url = `${data.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("master_profiles")
      .update({ cover_url: url })
      .eq("id", masterId);

    if (updateError) {
      console.error("Update error:", updateError);
      alert("Ошибка обновления профиля: " + updateError.message);
      return;
    }

    setCover(url);
    // router.refresh(); // можно добавить, если нужно обновить серверный компонент
  } catch (err) {
    console.error(err);
    alert("Неизвестная ошибка при загрузке обложки");
  } finally {
    setUploadingCover(false);
  }
}

  async function save() {
    setSaving(true);
    setSaved(false);
    await Promise.all([
      supabase.from("profiles").update({ full_name: name.trim(), phone: phoneValue.trim() || null }).eq("id", masterId),
      supabase
        .from("master_profiles")
        .update({ specialization: spec.trim(), city: cityValue.trim(), district: districtValue.trim(), bio: bioValue.trim() })
        .eq("id", masterId),
    ]);
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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-[24px] text-ink">Настройки аккаунта</h1>
        <p className="mt-1 text-[13px] text-ink-soft">Как вас видят клиенты в профиле</p>
      </div>

     {/* Обложка */}
<div className="relative isolate h-36 w-full overflow-hidden rounded-2xl border border-line" style={{ background: "var(--surface-2)" }}>
  {cover ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={cover} alt="" className="h-full w-full object-cover" />
  ) : null}

  <button
    onClick={() => {
      console.log("Клик по кнопке обложки"); // ← для дебага
      coverInputRef.current?.click();
    }}
    disabled={uploadingCover}
    className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[11.5px] text-white disabled:opacity-50"
  >
    <Camera size={12} strokeWidth={1.8} />
    {uploadingCover ? "Загружаем…" : "Изменить обложку"}
  </button>

  <input 
    ref={coverInputRef} 
    type="file" 
    accept="image/*" 
    className="hidden" 
    onChange={(e) => handleCoverChange(e.target.files)} 
  />
</div>

        <div className="relative z-10 -mt-10 flex items-end gap-4 px-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-4"
            style={{ background: "var(--surface-2)", borderColor: "var(--surface)" }}
          >
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="font-serif text-[24px] text-ink">{initials}</span>
            )}
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/55 py-1 text-[10px] text-white">
              <Camera size={11} strokeWidth={1.8} />
              {uploading ? "…" : "Фото"}
            </span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatarChange(e.target.files)} />
          <div className="pb-1.5 text-[12.5px] text-ink-faint">JPG или PNG, квадратное изображение смотрится лучше всего</div>
        </div>
      </div>

      <div className="flex flex-col gap-3.5 rounded-2xl border border-line bg-surface p-4">
        <Field label="Имя" value={name} onChange={setName} placeholder="Как к вам обращаться" />
        <Field label="Телефон" value={phoneValue} onChange={setPhoneValue} placeholder="+7 900 000-00-00" />
      </div>

      <div className="flex flex-col gap-3.5 rounded-2xl border border-line bg-surface p-4">
        <div className="text-[11.5px] uppercase tracking-wide text-ink-faint">Публичный профиль</div>
        <Field label="Специализация" value={spec} onChange={setSpec} placeholder="Например, мастер маникюра" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Город" value={cityValue} onChange={setCityValue} placeholder="Москва" />
          <Field label="Район" value={districtValue} onChange={setDistrictValue} placeholder="Пресня" />
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] text-ink-faint">О себе</span>
          <textarea
            value={bioValue}
            onChange={(e) => setBioValue(e.target.value)}
            rows={3}
            placeholder="Расскажите о своём опыте и подходе к работе"
            className="rounded-xl border border-line bg-surface p-3 text-[13.5px] text-ink placeholder:text-ink-faint focus:outline-none"
          />
        </label>
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
        <button
          onClick={() => setShowPasswordForm(true)}
          className="rounded-xl border border-line py-3 text-[13.5px] text-ink-soft"
        >
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
        <Link href="/" className="flex items-center justify-center gap-2 rounded-xl border border-line py-3 text-[13.5px] text-ink-soft">
          <ArrowLeftRight size={15} strokeWidth={1.8} />
          Клиентское приложение
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
