import { MainLayout } from '../layouts/MainLayout'

export function SettingsPage() {
  return (
    <MainLayout title="Settings">
      <section style={{ padding: '2rem 1.5rem', maxWidth: '72rem', margin: '0 auto' }}>
        <h2 style={{ margin: '0 0 1rem' }}>Settings</h2>
        <p style={{ margin: 0 }}>Application settings and preferences will be configured here.</p>
      </section>
    </MainLayout>
  )
}
