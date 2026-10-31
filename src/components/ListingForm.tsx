import {
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
} from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  ImagePlus,
  Loader2,
  LockKeyhole,
  PackageCheck,
  Search,
  Trash2,
  UploadCloud,
} from 'lucide-react'
import type {
  CategoryId,
  ItemType,
  Listing,
  ListingDraft,
  LocationId,
} from '../types'
import { CATEGORIES, LOCATIONS } from '../data/constants'
import { getErrorMessage } from '../api/client'
import { describedBy, FormField } from './FormField'
import { isFutureCalendarDate, todayISO } from '../utils/format'
import { ImageProcessingError, prepareImage } from '../utils/image'

interface ListingFormProps {
  initial?: Listing
  submitLabel: string
  cancelTo: string
  onSubmit: (draft: ListingDraft) => void | Promise<void>
}

interface FormState {
  type: ItemType
  name: string
  category: CategoryId | ''
  description: string
  location: LocationId | ''
  eventDate: string
  handover: string
  image?: string
  imageAlt?: string
}

type FormErrors = Partial<
  Record<'name' | 'category' | 'description' | 'location' | 'eventDate' | 'handover' | 'image', string>
>

const NAME_HINT = 'Keep it specific — “navy blue water bottle” beats “bottle”.'
const HANDOVER_HINT =
  'Private: only you and a claimant you approve can see this. Never posted publicly.'
const IMAGE_HINT = 'A clear photo helps people recognise the item. It is stored with your report.'

const ERROR_FOCUS: Record<keyof FormErrors, string> = {
  name: 'report-name',
  category: 'report-category',
  description: 'report-description',
  location: 'report-location',
  eventDate: 'report-date',
  handover: 'report-handover',
  image: 'report-image-control',
}

function buildState(initial?: Listing): FormState {
  if (!initial) {
    return {
      type: 'lost',
      name: '',
      category: '',
      description: '',
      location: '',
      eventDate: '',
      handover: '',
    }
  }
  return {
    type: initial.type,
    name: initial.name,
    category: initial.category,
    description: initial.description,
    location: initial.location,
    eventDate: initial.eventDate,
    handover: initial.handover,
    image: initial.image,
    imageAlt: initial.imageAlt,
  }
}

export function ListingForm({ initial, submitLabel, cancelTo, onSubmit }: ListingFormProps) {
  const [state, setState] = useState<FormState>(() => buildState(initial))
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isLost = state.type === 'lost'
  const descriptionHint = `${state.description.length}/600 characters · Marks, contents and nearby landmarks all help.`

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((current) => ({ ...current, [key]: value }))
    setSubmitError(null)
    setErrors((current) => {
      if (!(key in current)) return current
      const next = { ...current }
      delete next[key as keyof FormErrors]
      return next
    })
  }

  function validate(): FormErrors {
    const next: FormErrors = {}
    const name = state.name.trim()
    const description = state.description.trim()
    const handover = state.handover.trim()

    if (name.length < 3) next.name = 'Give the item a name of at least 3 characters.'
    else if (name.length > 80) next.name = 'Keep the item name under 80 characters.'
    if (!state.category) next.category = 'Choose the category that fits best.'
    if (!state.location) next.location = 'Choose where it was lost or found.'
    if (!state.eventDate) next.eventDate = 'Choose the date this happened.'
    else if (isFutureCalendarDate(state.eventDate))
      next.eventDate = 'The date cannot be in the future.'
    if (description.length < 20)
      next.description = 'Add at least 20 characters so people can recognise the item.'
    else if (description.length > 600)
      next.description = 'Keep the description under 600 characters.'
    if (handover.length < 10)
      next.handover = 'Add a short note about how a handover should happen.'
    else if (handover.length > 300) next.handover = 'Keep the handover note under 300 characters.'

    return next
  }

  async function handleFile(file?: File) {
    if (!file) return
    setProcessing(true)
    setErrors((current) => {
      const next = { ...current }
      delete next.image
      return next
    })
    try {
      const image = await prepareImage(file)
      setState((current) => ({ ...current, image }))
    } catch (error) {
      setErrors((current) => ({
        ...current,
        image:
          error instanceof ImageProcessingError
            ? error.message
            : 'That image could not be processed. Try a different photo.',
      }))
    } finally {
      setProcessing(false)
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    if (processing) return
    void handleFile(event.dataTransfer.files?.[0])
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting || processing) return

    const nextErrors = validate()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      const firstKey = Object.keys(nextErrors)[0] as keyof FormErrors
      window.setTimeout(() => document.getElementById(ERROR_FOCUS[firstKey])?.focus(), 0)
      return
    }

    const name = state.name.trim()
    const draft: ListingDraft = {
      type: state.type,
      name,
      category: state.category as CategoryId,
      description: state.description.trim(),
      location: state.location as LocationId,
      eventDate: state.eventDate,
      handover: state.handover.trim(),
      image: state.image,
      imageAlt: state.image
        ? state.image === initial?.image && initial?.imageAlt
          ? initial.imageAlt
          : `${name} — ${state.type} item reported on FoundIt`
        : undefined,
    }

    setSubmitting(true)
    setSubmitError(null)
    try {
      await onSubmit(draft)
    } catch (error) {
      setSubmitError(
        getErrorMessage(error) || 'The report could not be saved. Please try again.',
      )
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <fieldset>
        <legend className="mb-2 text-[13px] font-semibold text-ink-soft">
          What are you reporting?
          <span aria-hidden="true" className="ml-0.5 text-accent">
            *
          </span>
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              {
                value: 'lost' as const,
                title: 'I lost an item',
                subtitle: 'Ask the campus for help',
                Icon: Search,
              },
              {
                value: 'found' as const,
                title: 'I found an item',
                subtitle: 'Help return it safely',
                Icon: PackageCheck,
              },
            ] as const
          ).map((option) => {
            const selected = state.type === option.value
            return (
              <label key={option.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="report-type"
                  value={option.value}
                  checked={selected}
                  onChange={() => update('type', option.value)}
                  className="peer sr-only"
                />
                <div
                  className={`h-full rounded-2xl border p-4 transition peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2 ${
                    selected
                      ? 'border-accent bg-accent-soft shadow-[inset_0_0_0_1px_#2E45CC]'
                      : 'border-line bg-[#FCFAF6] hover:border-[#D2C9BA]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                        selected
                          ? 'border-accent/20 bg-white text-accent'
                          : 'border-line bg-surface text-ink-muted'
                      }`}
                    >
                      <option.Icon aria-hidden="true" size={16} strokeWidth={1.9} />
                    </span>
                    {selected && (
                      <CheckCircle2
                        aria-hidden="true"
                        size={16}
                        className="mt-1 text-accent"
                      />
                    )}
                  </div>
                  <p className="mt-3 text-[13.5px] font-semibold text-ink">{option.title}</p>
                  <p className="mt-0.5 text-[11.5px] leading-5 text-ink-muted">{option.subtitle}</p>
                </div>
              </label>
            )
          })}
        </div>
      </fieldset>

      <FormField
        id="report-name"
        label="Item name"
        required
        error={errors.name}
        hint={NAME_HINT}
      >
        <input
          id="report-name"
          type="text"
          value={state.name}
          onChange={(event) => update('name', event.target.value)}
          required
          maxLength={80}
          autoComplete="off"
          placeholder={isLost ? 'e.g. Black wireless headphones' : 'e.g. Brown leather wallet'}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={describedBy('report-name', errors.name, NAME_HINT)}
          className="field-control"
        />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-3">
        <FormField id="report-category" label="Category" required error={errors.category}>
          <select
            id="report-category"
            value={state.category}
            onChange={(event) => update('category', event.target.value as CategoryId | '')}
            required
            aria-invalid={Boolean(errors.category)}
            aria-describedby={describedBy('report-category', errors.category)}
            className={`field-control appearance-none ${state.category ? '' : 'text-ink-faint'}`}
          >
            <option value="">Select category</option>
            {CATEGORIES.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField id="report-location" label="Campus location" required error={errors.location}>
          <select
            id="report-location"
            value={state.location}
            onChange={(event) => update('location', event.target.value as LocationId | '')}
            required
            aria-invalid={Boolean(errors.location)}
            aria-describedby={describedBy('report-location', errors.location)}
            className={`field-control appearance-none ${state.location ? '' : 'text-ink-faint'}`}
          >
            <option value="">Select location</option>
            {LOCATIONS.map((location) => (
              <option key={location.id} value={location.id}>
                {location.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          id="report-date"
          label={isLost ? 'Date lost' : 'Date found'}
          required
          error={errors.eventDate}
        >
          <input
            id="report-date"
            type="date"
            value={state.eventDate}
            max={todayISO()}
            onChange={(event) => update('eventDate', event.target.value)}
            required
            aria-invalid={Boolean(errors.eventDate)}
            aria-describedby={describedBy('report-date', errors.eventDate)}
            className="field-control"
          />
        </FormField>
      </div>

      <FormField
        id="report-description"
        label="Description"
        required
        error={errors.description}
        hint={`${state.description.length}/600 characters · Marks, contents and nearby landmarks all help.`}
      >
        <textarea
          id="report-description"
          rows={5}
          value={state.description}
          onChange={(event) => update('description', event.target.value)}
          required
          maxLength={600}
          placeholder={
            isLost
              ? 'What does it look like? Any marks, stickers or contents? When did you last have it?'
              : 'Where exactly did you find it? What condition is it in? Where is it being kept?'
          }
          aria-invalid={Boolean(errors.description)}
          aria-describedby={describedBy('report-description', errors.description, descriptionHint)}
          className="field-control resize-y leading-6"
        />
      </FormField>

      <FormField
        id="report-image"
        label="Photo"
        optional
        error={errors.image}
        hint={IMAGE_HINT}
      >
        <input
          ref={fileInputRef}
          id="report-image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          tabIndex={-1}
          aria-label="Upload item photo"
          onChange={(event) => {
            void handleFile(event.target.files?.[0])
            event.target.value = ''
          }}
        />

        {state.image ? (
          <div className="flex flex-col gap-3 rounded-xl border border-line bg-[#FBF8F2] p-2.5 sm:flex-row sm:items-center">
            <img
              src={state.image}
              alt="Preview of the photo you selected"
              className="h-24 w-full rounded-lg object-cover sm:w-32"
            />
            <div className="min-w-0 flex-1 px-1">
              <p className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
                <ImagePlus aria-hidden="true" size={14} className="text-found" />
                Photo added
              </p>
              <p className="mt-1 text-[12px] leading-5 text-ink-muted">
                This will appear at the top of your listing. Keep it free of personal documents.
              </p>
            </div>
            <div className="flex shrink-0 gap-2 px-1">
              <button
                type="button"
                className="btn-secondary btn-small"
                onClick={() => fileInputRef.current?.click()}
              >
                Replace
              </button>
              <button
                type="button"
                className="icon-button h-9 w-9"
                aria-label="Remove photo"
                onClick={() => update('image', undefined)}
              >
                <Trash2 aria-hidden="true" size={15} />
              </button>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(event) => {
              event.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`rounded-xl border border-dashed p-4 transition ${
              dragging
                ? 'border-accent bg-accent-soft/60'
                : 'border-[#D9D1C3] bg-[#FCFAF6] hover:border-[#C9BFAE]'
            }`}
          >
            <div className="flex flex-col items-center gap-2 py-3 text-center">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-ink-muted">
                {processing ? (
                  <Loader2 aria-hidden="true" size={16} className="animate-spin" />
                ) : (
                  <UploadCloud aria-hidden="true" size={16} />
                )}
              </span>
              <p className="text-[12.5px] text-ink-muted">
                {processing ? 'Preparing your photo…' : 'Drag a photo here, or'}
              </p>
              <button
                id="report-image-control"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={processing}
                className="link-quiet disabled:opacity-50"
                aria-describedby={describedBy('report-image', errors.image)}
              >
                choose an image
              </button>
              <p className="text-[11px] text-ink-faint">JPG, PNG or WebP · up to 8 MB</p>
            </div>
          </div>
        )}
      </FormField>

      <FormField
        id="report-handover"
        label={isLost ? 'How can a finder return it?' : 'Preferred handover instructions'}
        required
        error={errors.handover}
        hint={HANDOVER_HINT}
      >
        <textarea
          id="report-handover"
          rows={3}
          value={state.handover}
          onChange={(event) => update('handover', event.target.value)}
          required
          maxLength={300}
          placeholder={
            isLost
              ? 'e.g. Meet at the library entrance on weekdays between 2 and 4 PM.'
              : 'e.g. Collect from the canteen counter after 1 PM. Ask for the lab assistant.'
          }
          aria-invalid={Boolean(errors.handover)}
          aria-describedby={describedBy('report-handover', errors.handover, HANDOVER_HINT)}
          className="field-control resize-y leading-6"
        />
        <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-ink-faint">
          <LockKeyhole aria-hidden="true" size={12} />
          Do not include ID numbers or financial details.
        </p>
      </FormField>

      {submitError && (
        <p role="alert" className="rounded-xl border border-[#EAD6D2] bg-[#FBEFED] px-3.5 py-3 text-[12.5px] text-[#8C3220]">
          {submitError}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11.5px] text-ink-faint">
          <span aria-hidden="true" className="text-accent">
            *
          </span>{' '}
          Required fields · Saved to the demo server
        </p>
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center">
          <Link to={cancelTo} className="btn-ghost justify-center py-2.5 text-[13px]">
            Cancel
          </Link>
          <button type="submit" className="btn-primary justify-center py-2.5" disabled={submitting || processing}>
            {submitting ? (
              <>
                <Loader2 aria-hidden="true" size={16} className="animate-spin" />
                Saving…
              </>
            ) : (
              submitLabel
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
