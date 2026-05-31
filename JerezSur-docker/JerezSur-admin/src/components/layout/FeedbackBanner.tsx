import type { FeedbackState } from '../../hooks/useFeedback';

interface Props {
  feedback: FeedbackState | null;
  onDismiss: () => void;
}

export const FeedbackBanner = ({ feedback, onDismiss }: Props) => {
  if (!feedback) return null;

  const isSuccess = feedback.type === 'success';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        backgroundColor: isSuccess ? 'var(--color-success-bg, #d4edda)' : 'var(--color-danger-bg, #f8d7da)',
        color: isSuccess ? 'var(--color-success, #155724)' : 'var(--color-danger, #721c24)',
        border: `1px solid ${isSuccess ? 'var(--color-success-border, #c3e6cb)' : 'var(--color-danger-border, #f5c6cb)'}`,
        fontWeight: 500,
        fontSize: '0.9rem',
      }}
    >
      <span>{isSuccess ? '✓ ' : '✕ '}{feedback.message}</span>
      <button
        onClick={onDismiss}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1rem',
          opacity: 0.7,
          marginLeft: '1rem',
          color: 'inherit',
        }}
      >
        ✕
      </button>
    </div>
  );
};
