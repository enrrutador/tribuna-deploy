import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  return (
    <div className="min-h-screen flex flex-col w-full bg-[#f5f5f5]">
      <Header />
      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 60px)" }}>
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto py-4 px-4 md:px-6">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
