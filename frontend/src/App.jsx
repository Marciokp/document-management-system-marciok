import { useEffect, useState } from 'react';
import AuthComponent from './components/AuthComponent.jsx';
import DocumentList from './components/DocumentList.jsx';
import UploadComponent from './components/UploadComponent.jsx';
import { authenticate, getCurrentUser, logout } from './services/api.js';
import useDocuments from './hooks/useDocuments.js';
import './App.css';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const { documents, error, isLoading, refresh, upload } = useDocuments(currentUser?.username);

  useEffect(() => {
    let isCurrentRequest = true;
    getCurrentUser()
      .then((user) => {
        if (isCurrentRequest) setCurrentUser(user);
      })
      .catch((error) => {
        if (isCurrentRequest) setFeedback({ type: 'error', message: error.message });
      })
      .finally(() => {
        if (isCurrentRequest) setIsCheckingSession(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, []);

  useEffect(() => {
    if (error) setFeedback({ type: 'error', message: error.message });
  }, [error]);

  async function handleAuthenticate(mode, username, password) {
    setFeedback(null);
    try {
      const user = await authenticate(mode, username, password);
      setCurrentUser(user);
      setFeedback({
        type: 'success',
        message: mode === 'register' ? 'Conta criada com sucesso.' : 'Login realizado.',
      });
      return true;
    } catch (error) {
      setFeedback({ type: 'error', message: error.message });
      return false;
    }
  }

  async function handleLogout() {
    try {
      await logout();
      setCurrentUser(null);
      setFeedback(null);
    } catch (error) {
      setFeedback({ type: 'error', message: error.message });
    }
  }

  async function handleUpload(file) {
    setFeedback(null);
    const document = await upload(file);
    setFeedback({ type: 'success', message: `${document.originalName} enviado.` });
  }

  function handleError(error) {
    setFeedback({ type: 'error', message: error.message || 'Não foi possível concluir a operação.' });
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar__inner">
          <a className="brand" href="#inicio" aria-label="DMS, início">
            <span className="brand__mark" aria-hidden="true">D</span>
            <span className="brand__name">DMS<span> / DOCUMENTOS</span></span>
          </a>
          {currentUser && (
            <div className="session-controls">
              <span>{currentUser.username}</span>
              <button className="button button--session" type="button" onClick={handleLogout}>
                Sair
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="main-content" id="inicio">
        {feedback && (
          <p className={`feedback feedback--${feedback.type}`} role={feedback.type === 'error' ? 'alert' : 'status'}>
            {feedback.message}
          </p>
        )}
        {isCheckingSession ? (
          <p role="status">Verificando sessão...</p>
        ) : !currentUser ? (
          <AuthComponent onAuthenticate={handleAuthenticate} />
        ) : (
          <>
            <section className="page-heading" aria-labelledby="page-title">
              <div>
                <p className="eyebrow">ESPAÇO DE TRABALHO</p>
                <h1 id="page-title">Meus documentos</h1>
              </div>
              <p className="document-count" aria-live="polite">
                <strong>{documents.length.toString().padStart(2, '0')}</strong>
                <span>{documents.length === 1 ? 'documento' : 'documentos'}</span>
              </p>
            </section>

            <UploadComponent
              onError={handleError}
              onUpload={handleUpload}
            />

            <DocumentList
              documents={documents}
              isLoading={isLoading}
              onDownloadError={handleError}
              onRefresh={refresh}
            />
          </>
        )}
      </main>
      <footer className="app-footer">
        <span>ARQUIVOS LOCAIS</span>
        <span>METADADOS EM MEMÓRIA</span>
      </footer>
    </div>
  );
}
