import React, { useState, useEffect, useRef } from 'react';
import { compressImage } from '../../lib/compressor';
import { X, UploadCloud, Star } from 'lucide-react';
import { lockScroll, unlockScroll, useModalAccessibility } from '../../lib/modalScroll';
import { AuthSessionSnapshot, getAuthSessionSnapshot, isAuthSessionCurrent } from '../../store/useAuthStore';

type UploadCertificadoModalProps = Readonly<{
  onClose: () => void;
  existingCertificadoUrl?: string;
  existingAvaliacao?: { notaCurso?: number; notaPlataforma?: number; notaMaterial?: number; comentario?: string };
  onSubmit: (
    file: File | null,
    evalData: { notaCurso?: number; notaPlataforma?: number; notaMaterial?: number; comentario?: string },
    originSession?: AuthSessionSnapshot,
    onFileUploaded?: () => void
  ) => Promise<void>;
}>;

function StarRating({ value, onChange, labelledBy }: { value: number | undefined; onChange: (v: number) => void; labelledBy: string }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-[4px]" role="group" aria-labelledby={labelledBy}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`Avaliar com ${star} de 5 estrelas`}
          aria-pressed={value === star}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="p-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 transition-transform hover:scale-110"
        >
          <Star
            aria-hidden="true"
            className={`w-[28px] h-[28px] transition-colors ${
              star <= (hover || value || 0)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-200"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function UploadCertificadoModal({ onClose, existingCertificadoUrl, existingAvaliacao, onSubmit }: UploadCertificadoModalProps) {
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalData, setEvalData] = useState<{ notaCurso?: number; notaPlataforma?: number; notaMaterial?: number; comentario?: string }>(existingAvaliacao || {});
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [uploadedCertificateUrl, setUploadedCertificateUrl] = useState<string | undefined>(existingCertificadoUrl);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMountedRef = useRef(true);
  const submitAttemptRef = useRef(0);

  useEffect(() => {
    if (existingCertificadoUrl) {
      setUploadedCertificateUrl(existingCertificadoUrl);
    }
  }, [existingCertificadoUrl]);

  useEffect(() => {
    isMountedRef.current = true;
    lockScroll();
    return () => {
      isMountedRef.current = false;
      submitAttemptRef.current += 1;
      unlockScroll();
    };
  }, []);

  const handleCloseModal = () => {
    submitAttemptRef.current += 1;
    onClose();
  };

  useModalAccessibility(modalRef, true, handleCloseModal);

  const effectiveExistingUrl = uploadedCertificateUrl || existingCertificadoUrl;
  const hasValidCertificate = Boolean(certificateFile || effectiveExistingUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (evalLoading) return;
    setErrorMsg(null);
    if (!hasValidCertificate) {
      setErrorMsg("Selecione o arquivo do certificado para enviar.");
      return;
    }
    if (certificateFile && certificateFile.size > 1 * 1024 * 1024) {
      setErrorMsg("O arquivo excede o limite máximo de 1MB.");
      return;
    }
    
    if (!evalData.notaCurso || !evalData.notaPlataforma || !evalData.notaMaterial) {
      setErrorMsg("Por favor, avalie todas as opções usando as estrelas.");
      return;
    }

    const originSession = getAuthSessionSnapshot();
    if (!isAuthSessionCurrent(originSession)) {
      setErrorMsg("Sua sessão não está mais ativa. Faça login novamente.");
      return;
    }

    const attemptId = ++submitAttemptRef.current;
    const rawFileAtStart = certificateFile;
    setEvalLoading(true);
    try {
      const optimizedFile = rawFileAtStart ? await compressImage(rawFileAtStart) : null;
      if (!isMountedRef.current || submitAttemptRef.current !== attemptId || !isAuthSessionCurrent(originSession)) {
        return;
      }
      await onSubmit(optimizedFile, evalData, originSession, () => {
        if (isMountedRef.current && submitAttemptRef.current === attemptId && isAuthSessionCurrent(originSession)) {
          setUploadedCertificateUrl((prev) => prev || 'uploaded');
          setCertificateFile((current) => {
            if (current === rawFileAtStart) {
              if (fileInputRef.current) fileInputRef.current.value = '';
              return null;
            }
            return current;
          });
        }
      });
    } catch (err: any) {
      console.error(err);
      if (isMountedRef.current && submitAttemptRef.current === attemptId && isAuthSessionCurrent(originSession)) {
        setErrorMsg(err?.message || "Ocorreu um erro ao enviar o certificado.");
      }
    } finally {
      if (isMountedRef.current && submitAttemptRef.current === attemptId) {
        setEvalLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="upload-cert-modal-title" tabIndex={-1}
        className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
          <div className="flex flex-col">
            <h2 id="upload-cert-modal-title" className="text-xl font-bold text-gray-900">Enviar Certificado</h2>
            <p className="text-sm text-gray-500 mt-1">Avalie sua experiência e anexe seu documento</p>
          </div>
          <button
            type="button" onClick={handleCloseModal} aria-label="Fechar janela de envio de certificado"
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-colors shadow-sm border border-transparent hover:border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-700 focus:outline-none"
          >
            <X className="w-5 h-[20px]" aria-hidden="true" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto">
          <form id="upload-cert-form" onSubmit={handleSubmit} className="flex flex-col gap-[32px]">
            <div className="flex flex-col gap-[20px]">
              <div className="flex flex-col gap-2">
                <span id="label-nota-curso" className="text-sm font-semibold text-gray-800">
                  Como você avalia a qualidade e relevância do conteúdo do curso?
                </span>
                <StarRating labelledBy="label-nota-curso" value={evalData.notaCurso} onChange={(v) => setEvalData({ ...evalData, notaCurso: v })} />
              </div>
              <div className="w-full h-px bg-gray-100" />
              <div className="flex flex-col gap-2">
                <span id="label-nota-plataforma" className="text-sm font-semibold text-gray-800">
                  Como foi sua experiência com a plataforma de estudos (AVA) da instituição participante?
                </span>
                <StarRating labelledBy="label-nota-plataforma" value={evalData.notaPlataforma} onChange={(v) => setEvalData({ ...evalData, notaPlataforma: v })} />
              </div>
              <div className="w-full h-px bg-gray-100" />
              <div className="flex flex-col gap-2">
                <span id="label-nota-material" className="text-sm font-semibold text-gray-800">
                  Como você avalia os materiais de apoio e recursos didáticos?
                </span>
                <StarRating labelledBy="label-nota-material" value={evalData.notaMaterial} onChange={(v) => setEvalData({ ...evalData, notaMaterial: v })} />
              </div>
            </div>

            <div className="flex flex-col gap-[8px]">
              <label htmlFor="cert-comentario" className="text-sm font-semibold text-gray-800">
                Gostaria de deixar algum comentário, elogio ou sugestão?
              </label>
              <textarea
                id="cert-comentario" rows={3} maxLength={500}
                className="w-full px-[16px] py-[12px] rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-gray-800 resize-none"
                placeholder="Opcional. Nos conte mais sobre sua experiência..."
                value={evalData.comentario || ''}
                onChange={e => setEvalData({...evalData, comentario: e.target.value})}
              />
            </div>

            <div className="flex flex-col gap-[8px]">
              <label htmlFor="certificado-file" className="text-sm font-semibold text-gray-800">
                Anexe seu certificado oficial
              </label>
              <div className="relative group mt-1">
                <input
                  ref={fileInputRef} id="certificado-file" name="certificado-file" type="file"
                  disabled={evalLoading} required={!effectiveExistingUrl} accept="application/pdf,image/png,image/jpeg"
                  onChange={e => {
                    if (evalLoading) return;
                    setErrorMsg(null);
                    const file = e.target.files?.[0];
                    if (file) {
                      const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
                      if (!allowedTypes.includes(file.type)) {
                        setErrorMsg("Formato inválido. Selecione um arquivo PDF, PNG ou JPEG.");
                        e.target.value = '';
                        setCertificateFile(null);
                        return;
                      }
                      if (file.size > 1 * 1024 * 1024) {
                        setErrorMsg("O arquivo excede o limite máximo de 1MB.");
                        e.target.value = '';
                        setCertificateFile(null);
                        return;
                      }
                      setCertificateFile(file);
                    } else {
                      setCertificateFile(null);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                />
                <div className={`w-full p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-[12px] transition-colors ${hasValidCertificate ? 'border-blue-300 bg-blue-50' : 'border-gray-300 bg-gray-50 group-hover:bg-gray-100 group-hover:border-gray-400'}`}>
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center ${hasValidCertificate ? 'bg-blue-100' : 'bg-gray-200 group-hover:bg-gray-300'} transition-colors`}>
                    <UploadCloud className={`w-7 h-7 ${hasValidCertificate ? 'text-blue-600' : 'text-gray-500'}`} />
                  </div>
                  <div className="text-center">
                    {certificateFile ? (
                      <>
                        <p className="text-sm font-bold text-blue-900">{certificateFile.name}</p>
                        <p className="text-xs text-blue-600 mt-1">{(certificateFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </>
                    ) : effectiveExistingUrl ? (
                      <>
                        <p className="text-sm font-bold text-blue-900">Certificado já carregado no sistema</p>
                        <p className="text-xs text-blue-600 mt-1">Clique aqui apenas se desejar substituir o arquivo.</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-bold text-gray-700">Clique para selecionar ou arraste o arquivo</p>
                        <p className="text-xs text-gray-500 mt-1">Tamanho máximo de 1MB. Formatos: PDF, PNG, JPG.</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div role="alert" className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 text-center font-bold shadow-sm">
                {errorMsg}
              </div>
            )}
          </form>
        </div>

        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-[12px] shrink-0 justify-end">
          <button type="button" onClick={handleCloseModal} className="w-full sm:w-auto px-6 py-2.5 rounded-full text-gray-600 font-semibold text-sm hover:bg-gray-200 transition-colors">
            Cancelar
          </button>
          <button
            type="submit" form="upload-cert-form" disabled={evalLoading || !hasValidCertificate}
            className="w-full sm:w-auto px-8 py-2.5 rounded-full bg-[#1e3a8a] text-white font-bold text-sm hover:bg-[#1e40af] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md shadow-blue-900/20"
          >
            {evalLoading ? 'Enviando...' : 'Enviar para Análise'}
          </button>
        </div>
      </div>
    </div>
  );
}
