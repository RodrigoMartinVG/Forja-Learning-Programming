import { useParams } from 'react-router-dom'
import WorkspaceHeader from './WorkspaceHeader'
import MapView from './MapView'
import ContentView from './ContentView'

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
          <ContentView
            contentType={contentType as 'level' | 'project'}
            contentId={contentId}
          />
        ) : (
          <MapView />
        )}
      </div>
    </div>
  )
}
