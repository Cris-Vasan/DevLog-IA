import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

function App() {
  const [health, setHealth] = useState(null)

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth({ status: 'unreachable' }))
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
      <h1 className="text-3xl font-semibold text-slate-900">DevLog AI</h1>
      <p className="text-slate-500 text-sm">
        Server: {health ? health.status : 'checking…'}
      </p>
      <Button>shadcn/ui works</Button>
    </div>
  )
}

export default App
