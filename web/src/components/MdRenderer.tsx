import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeHighlight from 'rehype-highlight'
import rehypeKatex from 'rehype-katex'
import { common } from 'lowlight'
import x86asm from 'highlight.js/lib/languages/x86asm'
import type { Components } from 'react-markdown'
import 'katex/dist/katex.min.css'

// Extend common language set with x86asm (not included by default)
const languages = { ...common, x86asm }

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

// Resolve markdown-relative links to in-app SPA routes.
// Examples handled:
//   ../workspace/workspace.md          → /workspace/intro/workspace
//   ../forja/forja.md                  → /workspace/intro/forja
//   ../../intro/forja/forja.md         → /workspace/intro/forja
//   ../../../theory/L0-...             → null (let it fallback to MapView)
function resolveInternalHref(href: string): string | null {
  if (!href) return null
  // Quick deny list: external, hash-only, mailto, etc.
  if (/^(https?:|mailto:|tel:|#)/i.test(href)) return null
  // Intro cross-links (forja ↔ workspace)
  const introMatch = href.match(/(?:^|\/)(forja|workspace)\/\1\.md$/i)
  if (introMatch) {
    return `/workspace/intro/${introMatch[1].toLowerCase()}`
  }
  return null
}

function buildComponents(navigate: ReturnType<typeof useNavigate>): Components {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pre({ children, ...props }: any) {
      const child = Array.isArray(children) ? children[0] : children
      // Mermaid: render as diagram
      if (child?.props?.className?.includes('language-mermaid')) {
        const code = String(child.props.children ?? '').replace(/\n$/, '')
        return <MermaidBlock code={code} />
      }
      // Untagged blocks are program output / terminal sessions, not source code
      const hasLanguage = child?.props?.className?.includes('language-')
      if (!hasLanguage) {
        const cls = ['output', props.className].filter(Boolean).join(' ')
        return <pre {...props} className={cls}>{children}</pre>
      }
      return <pre {...props}>{children}</pre>
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    code({ className, children, ...props }: any) {
      if (!className) return <code {...props}>{children}</code>
      return <code className={className} {...props}>{children}</code>
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    a({ href, children, ...props }: any) {
      const target = typeof href === 'string' ? resolveInternalHref(href) : null
      if (target) {
        return (
          <a
            href={target}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
              e.preventDefault()
              navigate(target)
            }}
          >
            {children}
          </a>
        )
      }
      // External or unmatched: open in new tab when http(s)
      const isExternal = typeof href === 'string' && /^https?:/i.test(href)
      return (
        <a
          href={href}
          {...props}
          {...(isExternal ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
        >
          {children}
        </a>
      )
    },
  }
}

// ─── Public component ─────────────────────────────────────────────────────────

export default function MdRenderer({ children }: { children: string }) {
  const navigate = useNavigate()
  const components = buildComponents(navigate)
  return (
    <div className="md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, [rehypeHighlight, {
          ignoreMissing: true,
          detect: false,
          languages,
          aliases: { x86asm: ['asm'], bash: ['gdb', 'shell'] },
        }]]}
        components={components}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
