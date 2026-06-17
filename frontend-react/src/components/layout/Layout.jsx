import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ title, children }) {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header title={title} />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}
