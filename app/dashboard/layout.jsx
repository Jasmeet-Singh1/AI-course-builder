import Header from "./_components/Header";
import SideBar from "./_components/SideBar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex">
      <div className="md:w-64 hidden md:block shrink-0">
        <SideBar />
      </div>
      <main className="flex-1 min-h-screen  p-10 md">
        <Header />
        {children}
      </main>
    </div>
  );
}
