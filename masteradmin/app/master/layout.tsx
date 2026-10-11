import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MasterSessionGuard from "@/components/layout/MasterSessionGuard";

export default function MasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MasterSessionGuard>
      <div className="flex min-h-screen flex-col md:flex-row">
        <Sidebar />

        <div className="min-w-0 flex-1">
          <Header />

          <main className="min-w-0 p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </MasterSessionGuard>
  );
}