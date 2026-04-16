import { Navbar } from "@/components/layout/navbar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
    </>
  );
}
