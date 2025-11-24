import React from 'react';

// ConfirmModal: Modal controlado (sin Bootstrap JS), moderno y elegante
// Props:
// - show: boolean
// - title: string
// - body: string | ReactNode
// - confirmLabel: string
// - confirmVariant: 'primary' | 'success' | 'warning' | 'danger' | 'dark' | 'secondary'
// - iconClass: string (e.g., 'bi bi-trash')
// - loading: boolean (deshabilita confirm y muestra spinner)
// - onConfirm: function
// - onCancel: function
// - backdrop: boolean (si true muestra fondo oscuro)
export default function ConfirmModal({
  show,
  title,
  body,
  confirmLabel = 'Confirmar',
  confirmVariant = 'primary',
  iconClass = 'bi bi-question-circle',
  loading = false,
  onConfirm,
  onCancel,
  backdrop = true,
}) {
  const visibleClass = show ? 'show d-block' : '';

  return (
    <>
      <div className={`modal fade modal-premium ${visibleClass}`} role="dialog" aria-hidden={!show}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 shadow-lg border-0">
            <div className={`modal-header header-variant-${confirmVariant}`}>
              <h5 className="modal-title d-flex align-items-center gap-2">
                <i className={iconClass}></i>
                {title}
              </h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={onCancel} disabled={loading}></button>
            </div>
            <div className="modal-body">
              <div>
                {typeof body === 'string' ? <p className="mb-0">{body}</p> : body}
              </div>
            </div>
            <div className="modal-footer border-0">
              <button type="button" className="btn btn-secondary btn-modern rounded-pill" onClick={onCancel} disabled={loading}>
                Cancelar
              </button>
              <button type="button" className={`btn btn-${confirmVariant} btn-modern rounded-pill`} onClick={onConfirm} disabled={loading}>
                {loading ? (<span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>) : null}
                {confirmLabel || 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      </div>
      {show && backdrop && <div className="modal-backdrop fade show"></div>}
    </>
  );
}