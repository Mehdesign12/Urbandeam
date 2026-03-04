import { redirect } from 'next/navigation'

// Redirection racine vers la locale par défaut
export default function RootPage() {
  redirect('/fr')
}
