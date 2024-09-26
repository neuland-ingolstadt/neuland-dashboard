import { ThemeToggle } from '@/components/ui/themeToggle'
import { Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <div className="container my-6">
      <div>
        <div className="flex flex-row items-center gap-3 border-b pb-3">
          <Sparkles
            size={32}
            fill="gold"
            stroke="gold"
          />
          <h1 className="flex-1 text-4xl font-bold">Next.js Template</h1>

          <ThemeToggle />
        </div>

        <p className="mt-4 text-lg">
          This is a Next.js template with TypeScript, Tailwind CSS, and ESLint
          configured.
        </p>

        <h2 className="mt-8 text-2xl font-bold">Features</h2>
        <ul className="mt-4 list-inside list-disc">
          <li>Next.js</li>
          <li>TypeScript</li>
          <li>Tailwind CSS</li>
          <li>shadcn/ui</li>
          <li>Lucide Icons</li>
          <li>ESLint</li>
          <li>Prettier</li>
        </ul>
      </div>
    </div>
  )
}
