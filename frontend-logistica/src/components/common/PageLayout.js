import Sidebar from '../Sidebar';

function PageLayout({ children }) {
  return (
    <div className="flex bg-slate-100 min-h-screen">
      <Sidebar />

      <main className="app-compact flex-1 p-4 md:p-5 xl:p-6 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}

export default PageLayout;
