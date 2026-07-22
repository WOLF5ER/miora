import BottomNav from "@/components/BottomNav";
import ClientSidebar from "@/components/ClientSidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <ClientSidebar />
      <div className="min-h-dvh pb-24 md:ml-60 md:pb-6">
        <div className="mx-auto min-h-dvh max-w-md md:max-w-2xl">{children}</div>
      </div>
      <BottomNav />
    </div>
  );
}
