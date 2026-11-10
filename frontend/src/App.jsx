import { useEffect, useState } from 'react';
import DocumentList from './components/DocumentList.jsx';
import UploadComponent from './components/UploadComponent.jsx';
import { listDocuments, uploadDocument } from './services/api.js';
import './App.css';

const USER_STORAGE_KEY = 'dms.userId';

export default function App() {
  const [userId, setUserId] = useState(() => localStorage.getItem(USER_STORAGE_KEY) || 'demo-user');
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    localStorage.setItem(USER_STORAGE_KEY, userId);
  }, [userId]);

  useEffect(() => {
    let isCurrentRequest = true;
    const owner = userId.trim();

    if (!owner) {
      setDocuments([]);
      setIsLoading(false);
      return () => {
        isCurrentRequest = false;
      };
    }

    setIsLoading(true);
    const timer = window.setTimeout(() => {
      listDocuments(owner)
        .then((result) => {
          if (isCurrentRequest) setDocuments(result);
        })
        .catch((error) => {
          if (isCurrentRequest) {
            setFeedback({ type: 'error', message: error.message });
          }
        })
        .finally(() => {
          if (isCurrentRequest) setIsLoading(false);
        });
    }, 250);

    return () => {
      isCurrentRequest = false;
      window.clearTimeout(timer);
    };
  }, [userId, refreshKey]);

  async function handleUpload(file) {
    setFeedback(null);
    const document = await uploadDocument(file, userId.trim());
    setFeedback({ type: 'success', message: `${document.originalName} enviado.` });
    setRefreshKey((current) => current + 1);
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
          <label className="user-field">
            <span>Usuário</span>
            <input
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              aria-label="Identificador do usuário"
              autoComplete="username"
              spellCheck="false"
            />
          </label>
        </div>
      </header>

      <main className="main-content" id="inicio">
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

        {feedback && (
          <p className={`feedback feedback--${feedback.type}`} role={feedback.type === 'error' ? 'alert' : 'status'}>
            {feedback.message}
          </p>
        )}

        <UploadComponent
          disabled={!userId.trim()}
          onError={handleError}
          onUpload={handleUpload}
        />

        <DocumentList
          documents={documents}
          isLoading={isLoading}
          onDownloadError={handleError}
          onRefresh={() => setRefreshKey((current) => current + 1)}
        />
      </main>
      <footer className="app-footer">
        <span>ARQUIVOS LOCAIS</span>
        <span>METADADOS EM MEMÓRIA</span>
      </footer>
    </div>
  );
}
