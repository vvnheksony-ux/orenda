'use client'

import { useEffect, useRef } from 'react'
import { useField } from '@payloadcms/ui'
import type QuillType from 'quill'

type LexicalTextNode = {
  detail: number
  format: number
  mode: 'normal'
  style: string
  text: string
  type: 'text'
  version: number
}

type LexicalParagraphNode = {
  children: LexicalTextNode[]
  direction: null
  format: string
  indent: number
  type: 'paragraph'
  version: number
}

type QuillRichTextValue = {
  quill?: {
    html?: string
  }
  root?: {
    children?: Array<Record<string, unknown>>
    direction?: null
    format?: string
    indent?: number
    type?: 'root'
    version?: number
  }
}

type QuillRichTextFieldProps = {
  field?: {
    admin?: {
      description?: string
    }
    label?: string
    name?: string
    required?: boolean
  }
  path: string
  readOnly?: boolean
  validate?: never
}

const toolbarOptions = [
  // [{ header: [1, 2, 3, false] }],
  ['bold'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  // [{ align: [] }],
  // ['link', 'blockquote'],
  // ['clean'],
]

export default function QuillRichTextField({ field, path, readOnly, validate }: QuillRichTextFieldProps) {
  const editorElementRef = useRef<HTMLDivElement | null>(null)
  const quillRef = useRef<QuillType | null>(null)
  const latestHtmlRef = useRef<string>('')
  const { disabled, errorMessage, setValue, showError, value } = useField<QuillRichTextValue>({
    path,
    validate,
  })

  useEffect(() => {
    let isMounted = true

    async function initializeEditor() {
      if (!editorElementRef.current || quillRef.current) return

      const { default: Quill } = await import('quill')
      if (!isMounted || !editorElementRef.current) return

      const quill = new Quill(editorElementRef.current, {
        modules: { toolbar: toolbarOptions },
        readOnly: disabled || readOnly,
        theme: 'snow',
      })

      const initialHtml = valueToHtml(value)
      latestHtmlRef.current = initialHtml
      quill.clipboard.dangerouslyPasteHTML(initialHtml)

      quill.on('text-change', () => {
        const html = quill.root.innerHTML
        latestHtmlRef.current = html
        setValue(htmlToPayloadValue(html))
      })

      quillRef.current = quill
    }

    void initializeEditor()

    return () => {
      isMounted = false
      // Optional: Cleanup quill instance if needed
      quillRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled, readOnly, setValue, validate]) // Removed 'value' to prevent re-initialization loops

  // Handle external value changes (e.g. from other fields or clear buttons)
  useEffect(() => {
    if (quillRef.current) {
      const currentHtml = valueToHtml(value)
      if (currentHtml !== latestHtmlRef.current) {
        latestHtmlRef.current = currentHtml
        quillRef.current.clipboard.dangerouslyPasteHTML(currentHtml)
      }
    }
  }, [value])

  useEffect(() => {
    quillRef.current?.enable(!(disabled || readOnly))
  }, [disabled, readOnly])

  const label = field?.label || field?.name || path

  return (
    <div className="quill-rich-text-field field-type rich-text">
      <label className="field-label" htmlFor={path}>
        {label}
        {field?.required ? <span className="required">*</span> : null}
      </label>
      {field?.admin?.description ? (
        <p className="quill-rich-text-field__description">{field.admin.description}</p>
      ) : null}
      <div className={showError ? 'quill-rich-text-field__editor quill-rich-text-field__editor--error' : 'quill-rich-text-field__editor'}>
        <div ref={editorElementRef} />
      </div>
      {showError && errorMessage ? <div className="field-error">{errorMessage}</div> : null}
    </div>
  )
}

function htmlToPayloadValue(html: string): QuillRichTextValue {
  return {
    root: {
      children: htmlToParagraphs(html),
      direction: null,
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
    quill: {
      html,
    },
  }
}

function htmlToParagraphs(html: string): LexicalParagraphNode[] {
  const container = document.createElement('div')
  container.innerHTML = html
  const text = container.textContent?.trim() || ''

  if (!text) return []

  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => ({
      children: [createTextNode(line)],
      direction: null,
      format: '',
      indent: 0,
      type: 'paragraph',
      version: 1,
    }))
}

function createTextNode(text: string): LexicalTextNode {
  return {
    detail: 0,
    format: 0,
    mode: 'normal',
    style: '',
    text,
    type: 'text',
    version: 1,
  }
}

function valueToHtml(value: QuillRichTextValue | undefined): string {
  if (value?.quill?.html) return value.quill.html

  const paragraphs = value?.root?.children?.map(nodeToText).filter(Boolean) || []
  if (!paragraphs.length) return ''

  return paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')
}

function nodeToText(node: unknown): string {
  if (!node || typeof node !== 'object') return ''

  const record = node as Record<string, unknown>
  const text = typeof record.text === 'string' ? record.text : ''
  const children = Array.isArray(record.children) ? record.children.map(nodeToText).join(' ') : ''

  return [text, children].filter(Boolean).join(' ').trim()
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
