import type { MatchSet, Player, PlayerSetStats } from '../types'
import { getSetWinTotals } from './matchUtils'

export type TopPerformers = {
  mostKills: { player: Player; value: number } | null
  bestEfficiency: { player: Player; value: number } | null
  mostAces: { player: Player; value: number } | null
  mostDigs: { player: Player; value: number } | null
}

type AggregatedPlayerStats = {
  player: Player
  kills: number
  attackErrors: number
  attackAttempts: number
  aces: number
  digs: number
}

function emptyPerformers(): TopPerformers {
  return {
    mostKills: null,
    bestEfficiency: null,
    mostAces: null,
    mostDigs: null,
  }
}

function aggregateByPlayer(players: Player[], stats: PlayerSetStats[]) {
  const playersById = new Map(players.map((player) => [player.id, player]))
  const totalsByPlayer = new Map<string, AggregatedPlayerStats>()

  for (const statLine of stats) {
    const player = playersById.get(statLine.playerId)

    if (!player) {
      continue
    }

    const current =
      totalsByPlayer.get(statLine.playerId) ?? {
        player,
        kills: 0,
        attackErrors: 0,
        attackAttempts: 0,
        aces: 0,
        digs: 0,
      }

    current.kills += statLine.kills
    current.attackErrors += statLine.attackErrors
    current.attackAttempts += statLine.attackAttempts
    current.aces += statLine.aces
    current.digs += statLine.digs

    totalsByPlayer.set(statLine.playerId, current)
  }

  return [...totalsByPlayer.values()]
}

function getTopValue<T extends AggregatedPlayerStats>(
  totals: T[],
  selectValue: (player: T) => number,
  shouldInclude: (value: number, player: T) => boolean = (value) => value > 0,
) {
  let leader: { player: Player; value: number } | null = null

  for (const playerTotals of totals) {
    const value = selectValue(playerTotals)

    if (!shouldInclude(value, playerTotals)) {
      continue
    }

    if (leader === null || value > leader.value) {
      leader = { player: playerTotals.player, value }
    }
  }

  return leader
}

export function formatSummaryEfficiency(value: number) {
  return value.toFixed(3).replace(/^(-?)0(?=\.)/, '$1')
}

export function getTopPerformers(players: Player[], stats: PlayerSetStats[]): TopPerformers {
  if (stats.length === 0) {
    return emptyPerformers()
  }

  const totals = aggregateByPlayer(players, stats)

  if (totals.length === 0) {
    return emptyPerformers()
  }

  return {
    mostKills: getTopValue(totals, (player) => player.kills),
    bestEfficiency: getTopValue(
      totals,
      (player) => (player.kills - player.attackErrors) / player.attackAttempts,
      (_value, player) => player.attackAttempts > 0,
    ),
    mostAces: getTopValue(totals, (player) => player.aces),
    mostDigs: getTopValue(totals, (player) => player.digs),
  }
}

export function buildShareText(
  opponent: string,
  _date: string,
  result: 'win' | 'loss' | 'in_progress',
  sets: MatchSet[],
  performers: TopPerformers,
): string {
  const orderedSets = [...sets].sort((left, right) => left.setNumber - right.setNumber)
  const { ourSetsWon, opponentSetsWon } = getSetWinTotals(orderedSets)
  const resultLabel = result === 'win' ? 'WIN' : result === 'loss' ? 'LOSS' : 'IN PROGRESS'
  const setScores = orderedSets.map((set) => `${set.ourScore}-${set.opponentScore}`).join(', ') || 'No sets recorded'

  const topParts = [
    performers.mostKills ? `${performers.mostKills.player.name} ${performers.mostKills.value}K` : null,
    performers.bestEfficiency
      ? `${performers.bestEfficiency.player.name} ${formatSummaryEfficiency(performers.bestEfficiency.value)} Ef`
      : null,
    performers.mostAces ? `${performers.mostAces.player.name} ${performers.mostAces.value} Ace` : null,
    performers.mostDigs ? `${performers.mostDigs.player.name} ${performers.mostDigs.value} Dig` : null,
  ].filter((part): part is string => Boolean(part))

  return [
    '🏐 Volleyball GameStats',
    `vs ${opponent} – ${resultLabel} ${ourSetsWon}-${opponentSetsWon}`,
    `Set scores: ${setScores}`,
    `⭐ Top: ${topParts.join(' | ') || 'No standout stats recorded'}`,
  ].join('\n')
}
