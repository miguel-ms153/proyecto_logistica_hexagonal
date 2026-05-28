import Sidebar from '../Sidebar';

function PageLayout({ children }) {
  return (
    <div className="flex bg-slate-100 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}

export default PageLayout;
