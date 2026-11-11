import { useState } from 'react';

export default function AuthComponent({ onAuthenticate }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const succeeded = await onAuthenticate(mode, username, password);
      if (succeeded) setPassword('');
    } finally {
      setIsSubmitting(false);
    }
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setPassword('');
  }

  return (
    <section className="auth-panel" aria-labelledby="auth-title">
      <p className="eyebrow">ACESSO</p>
      <h1 id="auth-title">{mode === 'login' ? 'Entrar' : 'Criar conta'}</h1>
      <p className="auth-panel__description">
        {mode === 'login'
          ? 'Entre para acessar seus documentos.'
          : 'Escolha um usuário para criar seu espaço de documentos.'}
      </p>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          <span>Usuário</span>
          <input
            autoComplete="username"
            minLength="3"
            maxLength="32"
            pattern="[A-Za-z0-9._-]{3,32}"
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </label>
        <label>
          <span>Senha</span>
          <input
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            minLength="12"
            maxLength="128"
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <button className="button button--primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
        </button>
      </form>
      <div className="auth-panel__switch">
        {mode === 'login' ? 'Ainda não tem uma conta?' : 'Já tem uma conta?'}
        <button
          className="auth-link"
          type="button"
          onClick={() => changeMode(mode === 'login' ? 'register' : 'login')}
        >
          {mode === 'login' ? 'Criar conta' : 'Entrar'}
        </button>
      </div>
    </section>
  );
}
