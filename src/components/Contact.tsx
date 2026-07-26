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

  const onChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const subject = encodeURIComponent(
      `[협업 문의] ${form.company || 'Company'} → Kim Seungdo`,
    )
    const body = encodeURIComponent(
      [
        `회사/팀: ${form.company}`,
        `희망 역할: ${form.role}`,
        `근무 형태: ${form.type}`,
        '',
        form.message || '(메시지 없음)',
      ].join('\n'),
    )
    window.location.href = `mailto:${contact.email}?subject=${subject}&body=${body}`
  }

  return (
    <section className="panel transfer" aria-labelledby="contact-title">
      <div className="transfer__copy">
        <p className="eyebrow">Contact & Hire</p>
        <h2 id="contact-title">{contact.headline}</h2>
        <p>{contact.sub}</p>

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

        <label>
          회사 / 팀명
          <input
            name="company"
            value={form.company}
            onChange={onChange}
            placeholder="예: Example Studio"
            required
          />
        </label>

        <label>
          희망 역할
          <select name="role" value={form.role} onChange={onChange}>
            <option>Publisher / Frontend</option>
            <option>Publisher</option>
            <option>Frontend</option>
          </select>
        </label>

        <label>
          근무 형태
          <select name="type" value={form.type} onChange={onChange}>
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
          />
        </label>

        <button type="submit" className="btn btn--primary">
          제안 보내기
        </button>
      </form>
    </section>
  )
}
