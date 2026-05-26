/**
 * Vox · Manager Dashboard
 *
 * Lists every rep on the team, their current status, suggestion acceptance
 * rate, win rate, and any coaching tasks. The "live" reps are clickable to
 * jump into a listen-in view.
 *
 * In a real deploy this reads from Postgres. For the hackathon demo, the
 * mock data below is good enough to make the dashboard feel real.
 */

const mockReps = [
  { id: "1", name: "Priya R.", role: "Senior AE", initials: "PR", color: "purple",
    status: "live", duration: "12m", calls: 68, accept: 81, win: 34, coaching: "on track" },
  { id: "2", name: "Marcus K.", role: "Senior AE", initials: "MK", color: "blue",
    status: "live", duration: "3m", calls: 54, accept: 76, win: 28, coaching: "on track" },
  { id: "3", name: "Jordan C.", role: "AE", initials: "JC", color: "amber",
    status: "available", duration: "", calls: 41, accept: 52, win: 19, coaching: "coach now" },
  { id: "4", name: "Diana K.", role: "AE", initials: "DK", color: "rose",
    status: "live", duration: "22m", calls: 47, accept: 79, win: 31, coaching: "on track" },
  { id: "5", name: "Amir S.", role: "SDR", initials: "AS", color: "indigo",
    status: "away", duration: "", calls: 82, accept: 68, win: 14, coaching: "drills assigned" },
  { id: "6", name: "Rachel M.", role: "SDR", initials: "RM", color: "teal",
    status: "live", duration: "8m", calls: 38, accept: 44, win: 11, coaching: "listen in" },
];

const colorMap: Record<string, string> = {
  purple: "bg-purple-100 text-purple-700",
  blue: "bg-blue-100 text-blue-700",
  amber: "bg-amber-100 text-amber-700",
  rose: "bg-rose-100 text-rose-700",
  indigo: "bg-indigo-100 text-indigo-700",
  teal: "bg-teal-100 text-teal-700",
};

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <div className="max-w-7xl mx-auto px-8 py-10">
        <header className="mb-10">
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-1">
            Tuesday · Mar 15
          </div>
          <h1 className="text-3xl font-bold">Good morning, Anjali</h1>
          <p className="text-sm text-neutral-500 mt-1">
            3 reps need coaching attention · 2 new objections detected this week
          </p>
        </header>

        <section className="grid grid-cols-4 gap-4 mb-10">
          <Metric label="Calls this week" value="412" delta="+18%" tone="up" />
          <Metric label="Suggestion accept rate" value="73%" delta="+4 pts" tone="up" />
          <Metric label="Avg talk ratio" value="42 : 58" delta="target 35:65" tone="neutral" />
          <Metric label="Deals closed" value="$284k" delta="+$51k" tone="up" />
        </section>

        <section className="rounded-xl border border-neutral-200 overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
            <h3 className="font-semibold">Team performance</h3>
            <div className="text-xs text-neutral-500 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              4 reps live now
            </div>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">
                <th className="text-left px-5 py-3">Rep</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-right px-5 py-3">Calls</th>
                <th className="text-right px-5 py-3">Acceptance</th>
                <th className="text-right px-5 py-3">Win rate</th>
                <th className="text-right px-5 py-3">Coaching</th>
              </tr>
            </thead>
            <tbody>
              {mockReps.map((r) => (
                <tr key={r.id} className={`border-t border-neutral-100 ${r.coaching === "coach now" ? "bg-amber-50/40" : r.coaching === "listen in" ? "bg-rose-50/40" : ""}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${colorMap[r.color]} flex items-center justify-center text-xs font-semibold`}>{r.initials}</div>
                      <div>
                        <div className="font-medium">{r.name}</div>
                        <div className="text-xs text-neutral-500">{r.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {r.status === "live" ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        On call · {r.duration}
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-xs font-medium capitalize">
                        {r.status}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right font-medium">{r.calls}</td>
                  <td className={`px-5 py-4 text-right font-medium ${r.accept < 60 ? "text-rose-600" : r.accept < 70 ? "text-amber-600" : ""}`}>{r.accept}%</td>
                  <td className={`px-5 py-4 text-right font-medium ${r.win >= 25 ? "text-emerald-600" : ""}`}>{r.win}%</td>
                  <td className="px-5 py-4 text-right">
                    {r.coaching === "coach now" && <button className="text-xs text-amber-700 font-semibold">Coach now →</button>}
                    {r.coaching === "listen in" && <button className="text-xs text-rose-700 font-semibold">Listen in →</button>}
                    {(r.coaching === "on track" || r.coaching === "drills assigned") && <span className="text-xs text-neutral-400">{r.coaching}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value, delta, tone }: { label: string; value: string; delta: string; tone: "up" | "down" | "neutral" }) {
  const toneColor = tone === "up" ? "text-emerald-600" : tone === "down" ? "text-rose-600" : "text-amber-600";
  return (
    <div className="rounded-xl border border-neutral-200 p-5">
      <div className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-2">{label}</div>
      <div className="text-3xl font-bold">{value}</div>
      <div className={`text-xs mt-1 ${toneColor}`}>{delta}</div>
    </div>
  );
}
