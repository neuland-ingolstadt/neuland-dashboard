import NavBar from '@/components/ui/navBar'
import PathBreadcrumbs from '@/components/ui/pathBreadcrumbs'

export default function Home() {
  return (
    <div>
      <NavBar />
      <div className="container my-4 flex flex-col gap-3">
        <PathBreadcrumbs />
      </div>
    </div>
  )
}
