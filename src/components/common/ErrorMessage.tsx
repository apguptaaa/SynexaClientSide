type ErrorMessageProps = {
  message: string
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return <div style={{ color: '#1d4ed8', fontWeight: 600 }}>{message}</div>
}

