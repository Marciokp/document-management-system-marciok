import { useRef, useState } from 'react';

export default function UploadComponent({ disabled, onError, onUpload }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file || disabled || isUploading) return;

    setIsUploading(true);
    try {
      await onUpload(file);
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
    } catch (error) {
      onError(error);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="upload-panel" aria-labelledby="upload-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">ADICIONAR</p>
          <h2 id="upload-title">Enviar documento</h2>
        </div>
        <span className="upload-panel__index" aria-hidden="true">01</span>
      </div>

      <form className="upload-form" onSubmit={handleSubmit}>
        <label className={`file-picker${file ? ' file-picker--selected' : ''}`} htmlFor="document-file">
          <span className="file-picker__symbol" aria-hidden="true">+</span>
          <span className="file-picker__copy">
            <strong>{file ? file.name : 'Escolher arquivo'}</strong>
            <span>{file ? `${(file.size / 1024).toFixed(1)} KB` : 'Qualquer formato'}</span>
          </span>
          <span className="file-picker__action">Procurar</span>
          <input
            ref={inputRef}
            id="document-file"
            type="file"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
        </label>
        <button className="button button--primary" type="submit" disabled={!file || disabled || isUploading}>
          {isUploading ? 'Enviando...' : 'Enviar documento'}
        </button>
      </form>
    </section>
  );
}