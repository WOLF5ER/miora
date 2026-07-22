"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signUp } from "../actions";

function SignupForm() {
  const params = useSearchParams();
  const error = params.get("error");
  const [role, setRole] = useState<"client" | "master">("client");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-[24px] text-ink">Регистрация</h1>
        <p className="mt-1 text-[13.5px] text-ink-soft">Создайте аккаунт клиента или мастера</p>
      </div>

      {error ? (
        <p className="rounded-xl border p-3 text-[12.5px]" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>
          {error}
        </p>
      ) : null}

      <div className="flex rounded-xl border border-line p-1">
        <RoleTab label="Я клиент" active={role === "client"} onClick={() => setRole("client")} />
        <RoleTab label="Я мастер" active={role === "master"} onClick={() => setRole("master")} />
      </div>

      <form action={signUp} className="flex flex-col gap-3.5">
        <input type="hidden" name="role" value={role} />
        <Field label="Имя" name="fullName" type="text" placeholder="Как к вам обращаться" required />
        <Field label="Email" name="email" type="email" placeholder="you@example.com" required />
        <Field label="Телефон" name="phone" type="tel" placeholder="+7 900 000-00-00" />
        <Field label="Пароль" name="password" type="password" placeholder="Минимум 6 символов" required />
        {role === "master" ? (
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] text-ink-faint">Специализация</span>
            <select
              name="specialization"
              required
              className="rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink focus:outline-none"
            >
              <option value="">Выберите специализацию</option>
              <option value="Маникюр">Маникюр</option>
              <option value="Брови и ресницы">Брови и ресницы</option>
              <option value="Визаж">Визаж</option>
              <option value="Стрижки и укладки">Стрижки и укладки</option>
              <option value="Косметология">Косметология</option>
              <option value="Прочее">Прочее</option>
            </select>
          </label>
        ) : null}
        <button
          type="submit"
          className="mt-1.5 rounded-xl py-3 text-[13.5px] font-medium text-white"
          style={{ background: "var(--accent)" }}
        >
          {role === "master" ? "Создать кабинет мастера" : "Создать аккаунт"}
        </button>
      </form>

      <p className="text-center text-[13px] text-ink-soft">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="font-medium" style={{ color: "var(--accent)" }}>
          Войти
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}

function RoleTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 rounded-lg py-2 text-[13px] transition-colors"
      style={{ background: active ? "var(--accent)" : "transparent", color: active ? "#fff" : "var(--ink-soft)" }}
    >
      {label}
    </button>
  );
}

function Field({
  label,
  name,
  type,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] text-ink-faint">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        minLength={type === "password" ? 6 : undefined}
        className="rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none"
      />
    </label>
  );
}
