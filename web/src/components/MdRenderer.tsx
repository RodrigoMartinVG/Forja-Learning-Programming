import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import type { Components } from 'react-markdown'

// ─── Mermaid block ────────────────────────────────────────────────────────────

function MermaidBlock({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    import('mermaid').then(({ default: mermaid }) => {
      if (cancelled || !ref.current) return
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        themeVariables: {
          background: '#141414',
          primaryColor: '#cc5c22',
          primaryTextColor: '#ede9e3',
          primaryBorderColor: 'rgba(255,255,255,0.12)',
          lineColor: 'rgba(255,255,255,0.3)',
          secondaryColor: '#1c1c1c',
          tertiaryColor: '#242424',
        },
      })
      const id = `mermaid-${Math.random().toString(36).slice(2)}`
      mermaid.render(id, code).then(({ svg }) => {
        if (!cancelled && ref.current) ref.current.innerHTML = svg
      }).catch(() => {
        if (!cancelled && ref.current) {
          ref.current.textContent = code
          ref.current.style.color = 'var(--text-3)'
        }
      })
    })
    return () => { cancelled = true }
  }, [code])

  return <div ref={ref} className="mermaid-block" />
}

// ─── Custom code renderer ────────────────────────────────────────────────────

const components: Components = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pre({ children, ...props }: any) {
    // Check if this pre block contains a mermaid code block
    const child = Array.isArray(children) ? children[0] : children
    if (child?.props?.className?.includes('language-mermaid')) {
      const code = String(child.props.children ?? '').replace(/\n$/, '')
      return <MermaidBlock code={code} />
    }
    return <pre {...props}>{children}</pre>
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  code({ className, children, ...props }: any) {
    if (!className) {
      return <code {...props}>{children}</code>
    }
    return <code className={className} {...props}>{children}</code>
  },
}

// ─── Public component ─────────────────────────────────────────────────────────

export default function MdRenderer({ children }: { children: string }) {
  return (
    <div className="md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { ignoreMissing: true, detect: false, subset: false }]]}
        components={components}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
