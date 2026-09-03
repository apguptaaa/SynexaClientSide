type ErrorMessageProps = {
  message: string
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return <div style={{ color: '#b91c1c', fontWeight: 600 }}>{message}</div>
}
