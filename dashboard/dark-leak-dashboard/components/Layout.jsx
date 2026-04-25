// components/Layout.jsx
import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#080C10] grid-bg">
      <Navbar />
      <main className="pt-14">
        {children}
      </main>
    </div>
  );
}
