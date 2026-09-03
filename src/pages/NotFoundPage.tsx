import { MainLayout } from '../layouts/MainLayout'

export function NotFoundPage() {
  return (
    <MainLayout title="Page not found">
      <section style={{ padding: '2rem 1.5rem', maxWidth: '72rem', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 1rem' }}>404 - Not found</h2>
        <p style={{ margin: 0 }}>The page you are looking for does not exist.</p>
      </section>
    </MainLayout>
  )
}
