import { createClient } from '@/lib/supabase/server'
import { HeroSection } from '@/components/landing/hero'
import { LivePrizeCard } from '@/components/landing/live-prize-card'
import { UpcomingMatches } from '@/components/landing/upcoming-matches'

export default async function Home() {
  const supabase = await createClient()

  const [approvedUsersRes, bcRateRes, openMatchesRes, upcomingMatchesRes] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('payment_status', 'approved'),
    supabase.from('settings').select('value').eq('key', 'usd_rate_bs').single(),
    supabase.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('matches').select('id, home_team, away_team, starts_at, tournament_id').eq('status', 'open').order('starts_at', { ascending: true }).limit(3),
  ])

  const approvedUsers = approvedUsersRes.count ?? 0
  const defaultUsdRate = 587.4
  const parsedUsdRate = Number(bcRateRes.data?.value)
  const usdRate = parsedUsdRate > 0 ? parsedUsdRate : defaultUsdRate
  const entryFeeUsd = 10
  const amountBs = entryFeeUsd * usdRate
  const prizePool = approvedUsers * entryFeeUsd * usdRate * 0.5
  const remainingMatches = openMatchesRes.count ?? 0
  const upcomingMatches = upcomingMatchesRes.data ?? []

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white">
      <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_18%),linear-gradient(180deg,#020602_0%,#040c05_35%,#091211_100%)] px-6 py-10 sm:px-8 lg:px-12">
        <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.18),_transparent_20%)] blur-3xl" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-10">
          <HeroSection participants={approvedUsers} pot={prizePool} entryFeeUsd={entryFeeUsd} bcRate={usdRate} amountBs={amountBs} remainingMatches={remainingMatches} />

          <div className="grid gap-8 xl:grid-cols-[0.55fr_0.45fr]">
            <LivePrizeCard participants={approvedUsers} pot={prizePool} entryFeeUsd={entryFeeUsd} bcRate={usdRate} amountBs={amountBs} remainingMatches={remainingMatches} />
            <UpcomingMatches matches={upcomingMatches} />
          </div>
        </div>
      </div>
    </main>
  )
}
