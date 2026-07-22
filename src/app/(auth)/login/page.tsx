import Link from "next/link";
import { signIn } from "../actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const { error, notice } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-[24px] text-ink">Вход</h1>
        <p className="mt-1 text-[13.5px] text-ink-soft">Рады видеть вас снова</p>
      </div>

      {notice ? (
        <p className="rounded-xl border border-line bg-surface-2 p-3 text-[12.5px] text-ink-soft">{notice}</p>
      ) : null}
      {error ? (
        <p className="rounded-xl border p-3 text-[12.5px]" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>
          {error}
        </p>
      ) : null}

      <form action={signIn} className="flex flex-col gap-3.5">
        <Field label="Email" name="email" type="email" placeholder="you@example.com" required />
        <Field label="Пароль" name="password" type="password" placeholder="••••••••" required />
        <button
          type="submit"
          className="mt-1.5 rounded-xl py-3 text-[13.5px] font-medium text-white"
          style={{ background: "var(--accent)" }}
        >
          Войти
        </button>
      </form>

      <p className="text-center text-[13px] text-ink-soft">
        Нет аккаунта?{" "}
        <Link href="/signup" className="font-medium" style={{ color: "var(--accent)" }}>
          Зарегистрироваться
        </Link>
      </p>
    </div>
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
        className="rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none"
      />
    </label>
  );
}
