import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type { TransferData } from '../types/portfolio'

interface TransferForm {
  club: string
  role: string
  type: string
  message: string
}

const INITIAL: TransferForm = {
  club: '',
  role: 'Publisher / Frontend',
  type: '정규직',
  message: '',
}

interface TransferProps {
  transfer: TransferData
}

export default function Transfer({ transfer }: TransferProps) {
  const [form, setForm] = useState<TransferForm>(INITIAL)

  const onChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const subject = encodeURIComponent(
      `[영입 제안] ${form.club || 'Club'} → SOONDOOOP`,
    )
    const body = encodeURIComponent(
      [
        `구단/회사: ${form.club}`,
        `희망 포지션: ${form.role}`,
        `근무 형태: ${form.type}`,
        '',
        form.message || '(메시지 없음)',
      ].join('\n'),
    )
    window.location.href = `mailto:${transfer.email}?subject=${subject}&body=${body}`
  }

  return (
    <section className="panel transfer" aria-labelledby="transfer-title">
      <div className="transfer__copy">
        <p className="eyebrow">Transfer Negotiation</p>
        <h2 id="transfer-title">{transfer.headline}</h2>
        <p>{transfer.sub}</p>

        <ul className="terms">
          {transfer.terms.map((term) => (
            <li key={term}>{term}</li>
          ))}
        </ul>

        <div className="transfer__links">
          {transfer.links.map((link) => (
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
          Send Offer
        </p>

        <label>
          구단 / 회사명
          <input
            name="club"
            value={form.club}
            onChange={onChange}
            placeholder="예: North Pitch FC"
            required
          />
        </label>

        <label>
          희망 포지션
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
            placeholder="영입 배경, 팀 구성, 관심 스택 등을 적어 주세요."
          />
        </label>

        <button type="submit" className="btn btn--primary">
          영입 제안 보내기
        </button>
      </form>
    </section>
  )
}
