type AuthLayoutProps = {
  children: React.ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
      <div className="bg-background w-full max-w-md rounded-3xl p-10 shadow">
        {children}
      </div>
    </div>
  );
}
