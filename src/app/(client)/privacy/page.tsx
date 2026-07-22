import BackButton from "@/components/BackButton";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col gap-6 px-4 pt-6 pb-10">
      <div className="flex items-center gap-3">
        <BackButton />
        <h1 className="font-serif text-[22px] text-ink">Приватность</h1>
      </div>

      <div className="flex flex-col gap-4 text-[13.5px] leading-relaxed text-ink-soft">
        <p>Miora хранит только то, что нужно для записи и работы кабинета мастера: имя, email, телефон, историю визитов и записи, которые вы создаёте.</p>
        <p>Портфолио, услуги и отзывы мастеров видны всем — это витрина. Ваши заметки, история записей и избранное видны только вам.</p>
        <p>Мастер видит имя и телефон клиента только после того, как тот к нему записался — не раньше.</p>
        <p>Данные хранятся в Supabase (EU/US-инфраструктура) и защищены политиками доступа на уровне базы данных, а не только интерфейса.</p>
        <p>Удалить аккаунт и все данные можно, написав в поддержку — <a href="mailto:hello@miora.app" className="underline" style={{ color: "var(--accent)" }}>hello@miora.app</a>.</p>
      </div>
    </div>
  );
}
