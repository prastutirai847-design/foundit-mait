import { Check, Database, Eye, LockKeyhole } from 'lucide-react'

const tips = [
  'Use a specific item name, not just “bottle”.',
  'Mention the exact block, room or landmark.',
  'Note colours, marks, stickers or contents.',
  'Add a clear photo if you have one.',
]

export function ReportAside() {
  return (
    <div className="space-y-4 lg:sticky lg:top-24">
      <section className="rounded-2xl border border-line bg-surface p-5 shadow-card">
        <h2 className="text-[13.5px] font-semibold text-ink">
          Helpful reports get answered faster
        </h2>
        <ul className="mt-4 space-y-3">
          {tips.map((tip) => (
            <li key={tip} className="flex items-start gap-2.5 text-[12.5px] leading-5 text-ink-muted">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-found-soft text-found">
                <Check aria-hidden="true" size={10} strokeWidth={2.8} />
              </span>
              {tip}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-line bg-[#FBF8F2] p-5">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface text-ink-muted">
            <Eye aria-hidden="true" size={15} />
          </span>
          <h2 className="text-[13.5px] font-semibold text-ink">Who sees what</h2>
        </div>
        <dl className="mt-4 space-y-3 text-[12px] leading-5">
          <div>
            <dt className="font-semibold text-ink-soft">On the listing</dt>
            <dd className="text-ink-muted">Item details, photo and campus location.</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 font-semibold text-ink-soft">
              <LockKeyhole aria-hidden="true" size={11} />
              Kept private
            </dt>
            <dd className="text-ink-muted">
              Your handover note — shared only with a claimant you approve.
            </dd>
          </div>
        </dl>
      </section>

      <p className="flex items-start gap-2 px-1 text-[11.5px] leading-5 text-ink-faint">
        <Database aria-hidden="true" size={13} className="mt-0.5 shrink-0" />
        This demo is backed by a local FastAPI server. Listings are shared through its demo
        database; handover notes are only returned to the reporter and approved claimants.
      </p>
    </div>
  )
}
