import { AuthContext, useSession } from "./auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useSession();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
