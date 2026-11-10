import DownloadButton from './DownloadButton.jsx';

function formatFileSize(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Data indisponível';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default function DocumentList({ documents, isLoading, onDownloadError, onRefresh }) {
  return (
    <section className="documents-section" aria-labelledby="documents-title">
      <div className="section-heading section-heading--list">
        <div>
          <p className="eyebrow">BIBLIOTECA</p>
          <h2 id="documents-title">Documentos</h2>
        </div>
        <button className="button button--quiet" type="button" onClick={onRefresh} disabled={isLoading}>
          {isLoading ? 'Atualizando...' : 'Atualizar'}
        </button>
      </div>

      <div className="table-wrap">
        <table className="document-table">
          <thead>
            <tr>
              <th scope="col">Nome</th>
              <th scope="col">Tamanho</th>
              <th scope="col">Enviado em</th>
              <th scope="col"><span className="visually-hidden">Ações</span></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td className="table-message" colSpan="4">Carregando documentos...</td></tr>
            ) : documents.length === 0 ? (
              <tr><td className="table-message" colSpan="4">Nenhum documento encontrado.</td></tr>
            ) : documents.map((document) => (
              <tr key={document.id}>
                <td className="document-name" title={document.originalName}>{document.originalName}</td>
                <td className="document-meta">{formatFileSize(document.size)}</td>
                <td className="document-meta">{formatDate(document.uploadedAt)}</td>
                <td className="document-action">
                  <DownloadButton
                    document={document}
                    onError={onDownloadError}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}