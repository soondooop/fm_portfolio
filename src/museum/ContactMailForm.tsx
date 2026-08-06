import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type { ContactData } from '../types/portfolio'

interface ContactMailFormProps {
  contact: ContactData
  greeting: string
  onClose: () => void
}

interface FormState {
  company: string
  role: string
  type: string
  message: string
}

const INITIAL: FormState = {
  company: '',
  role: 'Publisher / Frontend',
  type: '정규직',
  message: '',
}

export default function ContactMailForm({
  contact,
  greeting,
  onClose,
}: ContactMailFormProps) {
  const [form, setForm] = useState<FormState>(INITIAL)

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
    <div className="museum-hire" role="dialog" aria-modal="true">
      <button
        type="button"
        className="museum-hire__dim"
        aria-label="닫기"
        onClick={onClose}
      />
      <div className="museum-hire__panel">
        <p className="museum-hire__eyebrow">Contact Staff</p>
        <h2 className="museum-hire__title">{greeting}</h2>
        <p className="museum-hire__sub">{contact.sub}</p>

        <form className="museum-hire__form" onSubmit={onSubmit}>
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
              rows={4}
            />
          </label>
          <div className="museum-hire__actions">
            <button type="button" className="museum-hire__cancel" onClick={onClose}>
              닫기
            </button>
            <button type="submit" className="museum-hire__submit">
              메일 작성
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
