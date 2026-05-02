import { lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'
import WorkspaceHeader from './WorkspaceHeader'
import MapView from './MapView'

const ContentView = lazy(() => import('./ContentView'))

export default function Workspace() {
  const { contentType, contentId } = useParams<{
    contentType: string
    contentId: string
  }>()

  const isContent = !!contentType && !!contentId

  return (
    <div className="workspace">
      {!isContent && <WorkspaceHeader />}
      <div className="ws-body">
        {isContent ? (
          <Suspense fallback={null}>
            <ContentView
              contentType={contentType as 'level' | 'project' | 'intro'}
              contentId={contentId}
            />
          </Suspense>
        ) : (
          <MapView />
        )}
      </div>
    </div>
  )
}
