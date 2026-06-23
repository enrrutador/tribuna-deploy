import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  return (
    <div className="min-h-screen flex flex-col w-full bg-[#1a1a1a]">
      <Header />
      {/* header is 22px hex band + 56px logo = 78px total */}
      <div className="flex flex-1" style={{ height: "calc(100vh - 78px)" }}>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-[#f0f0f0]">
            <div className="max-w-7xl mx-auto py-4 px-3 sm:px-4 pb-20 md:pb-4">
            {children}
          </div>
          <Footer />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
