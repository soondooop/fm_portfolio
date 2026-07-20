import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { closeModal } from '../features/ui/uiSlice'
import { savePlayer } from '../features/squad/squadSlice'
import type { PlayerInput } from '../../types/clubDesk'

const EMPTY: PlayerInput = {
  name: '',
  position: 'MF',
  age: 20,
  rating: 70,
  number: 99,
  wage: 30000,
  status: 'available',
  nationality: 'KR',
}

const NUMERIC_FIELDS: Array<keyof PlayerInput> = ['age', 'rating', 'number', 'wage']

export default function PlayerModal() {
  const dispatch = useAppDispatch()
  const modal = useAppSelector((s) => s.ui.modal)
  const players = useAppSelector((s) => s.squad.players)

  const editing = useMemo(() => {
    if (modal.mode !== 'edit' || !modal.playerId) return null
    return players.find((p) => p.id === modal.playerId) || null
  }, [modal, players])

  const [form, setForm] = useState<PlayerInput>(EMPTY)

  useEffect(() => {
    if (!modal.open) return
    setForm(editing ? { ...editing } : EMPTY)
  }, [modal.open, editing])

  if (!modal.open) return null

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const field = name as keyof PlayerInput
    setForm((prev) => ({
      ...prev,
      [field]: (NUMERIC_FIELDS as string[]).includes(field) ? Number(value) : value,
    }))
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const payload: PlayerInput = {
      name: form.name,
      position: form.position,
      age: form.age,
      rating: form.rating,
      number: form.number,
      wage: form.wage,
      status: form.status,
      nationality: form.nationality,
    }
    await dispatch(
      savePlayer({
        mode: modal.mode,
        id: modal.playerId,
        payload,
      }),
    )
    dispatch(closeModal())
  }

  return (
    <div className="cd-modal-backdrop" onClick={() => dispatch(closeModal())}>
      <div
        className="cd-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="player-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cd-modal__head">
          <h3 id="player-modal-title">
            {modal.mode === 'edit' ? '선수 수정' : '선수 등록'}
          </h3>
          <button
            type="button"
            className="cd-btn cd-btn--ghost"
            onClick={() => dispatch(closeModal())}
          >
            닫기
          </button>
        </div>

        <form className="cd-form" onSubmit={onSubmit}>
          <label>
            이름
            <input name="name" value={form.name} onChange={onChange} required />
          </label>
          <div className="cd-form__row">
            <label>
              포지션
              <select name="position" value={form.position} onChange={onChange}>
                <option value="GK">GK</option>
                <option value="DF">DF</option>
                <option value="MF">MF</option>
                <option value="FW">FW</option>
              </select>
            </label>
            <label>
              상태
              <select name="status" value={form.status} onChange={onChange}>
                <option value="available">available</option>
                <option value="injured">injured</option>
                <option value="loaned">loaned</option>
              </select>
            </label>
          </div>
          <div className="cd-form__row">
            <label>
              등번호
              <input
                type="number"
                name="number"
                value={form.number}
                onChange={onChange}
                min={1}
                max={99}
                required
              />
            </label>
            <label>
              나이
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={onChange}
                min={16}
                max={45}
                required
              />
            </label>
          </div>
          <div className="cd-form__row">
            <label>
              Rating
              <input
                type="number"
                name="rating"
                value={form.rating}
                onChange={onChange}
                min={40}
                max={99}
                required
              />
            </label>
            <label>
              Wage
              <input
                type="number"
                name="wage"
                value={form.wage}
                onChange={onChange}
                min={0}
                required
              />
            </label>
          </div>
          <label>
            국적
            <input
              name="nationality"
              value={form.nationality}
              onChange={onChange}
              required
            />
          </label>
          <button type="submit" className="cd-btn cd-btn--primary">
            저장
          </button>
        </form>
      </div>
    </div>
  )
}
