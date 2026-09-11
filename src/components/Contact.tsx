import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type { ContactData } from '../types/portfolio'

interface ContactForm {
  company: string
  role: string
  type: string
  message: string
}

const INITIAL: ContactForm = {
  company: '',
  role: 'Publisher / Frontend',
  type: '정규직',
  message: '',
}

interface ContactProps {
  contact: ContactData
}

export default function Contact({ contact }: ContactProps) {
  const [form, setForm] = useState<ContactForm>(INITIAL)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const onChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    if (!form.company.trim()) {
      setStatus('error')
      setErrorMessage('회사/팀명을 입력해주세요.')
      return
    }

    if (!form.message.trim()) {
      setStatus('error')
      setErrorMessage('제안 메시지를 입력해주세요.')
      return
    }

    try {
      const subject = encodeURIComponent(
        `[협업 문의] ${form.company} → Kim Seungdo`,
      )
      const body = encodeURIComponent(
        [
          `회사/팀: ${form.company}`,
          `희망 역할: ${form.role}`,
          `근무 형태: ${form.type}`,
          '',
          form.message,
        ].join('\n'),
      )
      window.location.href = `mailto:${contact.email}?subject=${subject}&body=${body}`
      setStatus('success')
      setTimeout(() => {
        setForm(INITIAL)
        setStatus('idle')
      }, 3000)
    } catch (err) {
      setStatus('error')
      setErrorMessage('문의 전송 중 오류가 발생했습니다. 이메일로 직접 연락해주세요.')
    }
  }

  return (
    <section className="panel transfer" aria-labelledby="contact-title">
      <div className="transfer__copy">
        <p className="eyebrow">Contact & Hire</p>
        <h2 id="contact-title">{contact.headline}</h2>
        <p>{contact.sub}</p>

        <div className="contact-email">
          <strong>이메일:</strong>{' '}
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
        </div>

        <ul className="terms">
          {contact.terms.map((term) => (
            <li key={term}>{term}</li>
          ))}
        </ul>

        <div className="transfer__links">
          {contact.links.map((link) => (
            <a
              key={link.label}
              className="btn btn--ghost"
              href={link.href}
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>

      <form className="transfer__form form-grid" onSubmit={onSubmit}>
        <p className="eyebrow" style={{ margin: 0 }}>
          Send Inquiry
        </p>

        {status === 'success' && (
          <div className="form-message form-message--success">
            메일 클라이언트가 열립니다. 메시지를 확인 후 전송해주세요!
          </div>
        )}

        {status === 'error' && errorMessage && (
          <div className="form-message form-message--error">
            {errorMessage}
          </div>
        )}

        <label>
          회사 / 팀명
          <input
            name="company"
            value={form.company}
            onChange={onChange}
            placeholder="예: Example Studio"
            required
            disabled={status === 'submitting'}
          />
        </label>

        <label>
          희망 역할
          <select name="role" value={form.role} onChange={onChange} disabled={status === 'submitting'}>
            <option>Publisher / Frontend</option>
            <option>Publisher</option>
            <option>Frontend</option>
          </select>
        </label>

        <label>
          근무 형태
          <select name="type" value={form.type} onChange={onChange} disabled={status === 'submitting'}>
            <option>정규직</option>
            <option>계약직</option>
            <option>프로젝트</option>
            <option>협의</option>
          </select>
        </label>

        <label>
          제안 메시지
          <textarea
            name="message"
            value={form.message}
            onChange={onChange}
            placeholder="채용 배경, 팀 구성, 관심 스택 등을 적어 주세요."
            required
            disabled={status === 'submitting'}
          />
        </label>

        <button type="submit" className="btn btn--primary" disabled={status === 'submitting'}>
          {status === 'submitting' ? '전송 중...' : '제안 보내기'}
        </button>
      </form>
    </section>
  )
}
