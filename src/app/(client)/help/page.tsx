import { Mail } from "lucide-react";
import BackButton from "@/components/BackButton";

const faq = [
  { q: "Как записаться к мастеру?", a: "Откройте профиль мастера → «Записаться» → выберите услугу, дату и время. Подтверждение приходит сразу." },
  { q: "Как отменить запись?", a: "Раздел «Записи» → «Предстоящие» → нажмите на крестик рядом с записью и подтвердите отмену." },
  { q: "Мастер не подтвердил запись — что делать?", a: "Все онлайн-записи подтверждаются автоматически. Если у мастера особый график, он свяжется по телефону, указанному в профиле." },
  { q: "Я мастер, как открыть свой кабинет?", a: "В профиле нажмите «Вы мастер?» и зарегистрируйтесь как мастер — кабинет откроется сразу." },
];

export default function HelpPage() {
  return (
    <div className="flex flex-col gap-6 px-4 pt-6 pb-10">
      <div className="flex items-center gap-3">
        <BackButton />
        <h1 className="font-serif text-[22px] text-ink">Помощь</h1>
      </div>

      <div className="flex flex-col divide-y divide-line rounded-2xl border border-line bg-surface">
        {faq.map((item) => (
          <div key={item.q} className="px-4 py-4">
            <div className="text-[13.5px] font-medium text-ink">{item.q}</div>
            <div className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{item.a}</div>
          </div>
        ))}
      </div>

      <a
        href="mailto:hello@miora.app"
        className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3.5"
      >
        <Mail size={17} strokeWidth={1.8} color="var(--accent)" />
        <div>
          <div className="text-[13.5px] font-medium text-ink">Написать в поддержку</div>
          <div className="text-[12px] text-ink-faint">hello@miora.app</div>
        </div>
      </a>
    </div>
  );
}
