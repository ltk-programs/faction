// Outer admin layout — intentionally minimal so /admin/login renders
// without auth checks. Auth protection lives in (protected)/layout.tsx.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
