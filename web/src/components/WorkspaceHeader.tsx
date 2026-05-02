import { useNavigate } from 'react-router-dom'
import { levels } from 'virtual:forja-content'
import { getProgress } from '../lib/progress'

export default function WorkspaceHeader() {
  const navigate = useNavigate()
  const { completed, reading } = getProgress()
  const total = levels.length
  const status = completed.length === 0 && reading.length === 0
    ? 'todo'
    : completed.length === total
      ? 'done'
      : 'reading'

  return (
    <header className="ws-header">
      <button className="ws-header__logo" onClick={() => navigate('/')}>
        Forja
      </button>
      <div className="ws-header__spacer" />
      <div className="ws-header__right">
        <div className="prog-pill">
          <span className={`prog-pill__dot prog-pill__dot--${status}`} />
          {completed.length}/{total} niveles
        </div>
      </div>
    </header>
  )
}
