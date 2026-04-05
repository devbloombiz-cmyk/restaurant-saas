import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "@/services/authService";
import { useAppStore } from "@/store/appStore";
import { useToastStore } from "@/store/toastStore";
import { queryClient } from "@/services/queryClient";

function getDefaultPathByRole(role: "super_admin" | "shop_admin" | "cashier"): string {
  if (role === "super_admin") {
    return "/super-admin/onboard";
  }

  if (role === "shop_admin") {
    return "/admin/menu";
  }

  return "/pos";
}

export function LoginPage() {
  const navigate = useNavigate();
  const pushToast = useToastStore((state) => state.pushToast);
  const setSession = useAppStore((state) => state.setSession);

  const [email, setEmail] = useState("superadmin@restaurant-saas.local");
  const [password, setPassword] = useState("SuperAdmin@123");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await login({
        email: email.trim(),
        password
      });

      queryClient.clear();

      setSession({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        user: response.user,
        session: response.session
      });

      pushToast({ type: "success", message: `Welcome ${response.user.name}` });
      navigate(getDefaultPathByRole(response.user.role), { replace: true });
    } catch {
      pushToast({ type: "error", message: "Invalid credentials. Please check email and password." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-10 text-slate-900 md:py-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-10 top-0 h-60 w-60 rounded-full bg-cyan-200/35 blur-3xl" />
        <div className="absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-emerald-200/35 blur-3xl" />
      </div>

      <div className="mx-auto grid w-full max-w-5xl items-center gap-8 lg:grid-cols-2">
        <section className="hidden lg:block">
          <p className="inline-flex rounded-full border border-teal-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-800">
            Restaurant SaaS
          </p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight text-slate-900">Run fast service with a premium POS workspace.</h1>
          <p className="mt-3 max-w-md text-sm text-slate-600">
            Unified operations for order taking, menu management, reports, and inventory with an interface built for speed and clarity.
          </p>
        </section>

        <div className="app-card mx-auto w-full max-w-md p-6 md:p-8">
          <h2 className="text-2xl font-bold">Welcome Back</h2>
          <p className="mt-1 text-sm text-slate-500">Sign in with your work account credentials.</p>

          <form className="mt-6 space-y-3" onSubmit={(event) => void onSubmit(event)}>
          <input
            className="w-full px-3 py-2 text-sm"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            autoComplete="email"
          />
          <input
            className="w-full px-3 py-2 text-sm"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            autoComplete="current-password"
          />

            <button type="submit" disabled={loading} className="app-btn-primary w-full rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-60">
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

          <p className="mt-4 text-center text-xs text-slate-500">Secure session management and role-based access enabled.</p>
        </div>
      </div>
    </div>
  );
}
