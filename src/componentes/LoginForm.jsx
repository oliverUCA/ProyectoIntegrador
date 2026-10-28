import { useState } from 'react';
import { AlertCircle, KeyRound, LoaderCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/HiperLogo.png';

const LoginForm = ({ onSuccess, variant = 'page' }) => {
    const { login, loading } = useAuth();
    const [credentials, setCredentials] = useState({ login: '', password: '' });
    const [errorMessage, setErrorMessage] = useState('');
    const isDialog = variant === 'dialog';

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setCredentials((current) => ({ ...current, [name]: value }));
        if (errorMessage) setErrorMessage('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');
        const result = await login({
            login: credentials.login.trim(),
            password: credentials.password,
        });

        if (result.success) onSuccess?.();
        else setErrorMessage(result.message || 'No se pudo iniciar sesión. Revisa tus credenciales.');
    };

    return (
        <div className={isDialog ? 'w-full' : 'mx-auto flex min-h-[65vh] w-full max-w-md items-center px-4 py-10'}>
            <section className={isDialog ? 'w-full' : 'w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm'}>
                {isDialog ? (
                    <div className="mb-6 flex items-center gap-3 pr-7">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-hiper-orange text-white">
                            <KeyRound className="size-5" aria-hidden="true" />
                        </span>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Iniciar sesión</h2>
                            <p className="mt-1 text-sm text-muted-foreground">Accede con tu cuenta de Dolibarr.</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-hiper-navy px-6 py-6 text-white">
                        <img src={logo} alt="Hipermaxi" className="mb-5 h-10 w-auto rounded bg-white p-1 object-contain" />
                        <p className="text-xs font-semibold uppercase text-orange-200">Cuenta de usuario</p>
                        <h1 className="mt-1 text-2xl font-bold">Iniciar sesión</h1>
                        <p className="mt-2 text-sm text-white/75">Accede con tus credenciales de Dolibarr.</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className={isDialog ? 'space-y-5' : 'space-y-5 p-6 sm:p-8'}>
                    {errorMessage && (
                        <div role="alert" className="flex items-start gap-2 rounded-md border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive">
                            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="login" className="text-sm font-medium text-foreground">Usuario</label>
                        <input
                            type="text"
                            id="login"
                            name="login"
                            value={credentials.login}
                            onChange={handleInputChange}
                            autoComplete="username"
                            autoCapitalize="none"
                            required
                            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition focus-visible:border-hiper-orange focus-visible:ring-2 focus-visible:ring-hiper-orange/20"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium text-foreground">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleInputChange}
                            autoComplete="current-password"
                            required
                            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition focus-visible:border-hiper-orange focus-visible:ring-2 focus-visible:ring-hiper-orange/20"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-hiper-navy px-4 text-sm font-semibold text-white transition-colors hover:bg-hiper-navy-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hiper-orange disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
                        {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
                    </button>
                </form>
            </section>
        </div>
    );
};

export default LoginForm;
