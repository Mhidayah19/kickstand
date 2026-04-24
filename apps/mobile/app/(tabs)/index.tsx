// Home — named job: "Tell me what needs attention on any of my bikes, right now."
// See docs/design-plans/home-brief.md § 6.
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/ui/empty-state';
import { DevAuthToggle } from '../../components/dev/DevAuthToggle';

import { TopBar, Icon, Eyebrow, BikeSwitcher, type IconName } from '../../components/ui/atelier';

import { useBikes } from '../../lib/api/use-bikes';
import { useAttention } from '../../lib/api/use-attention';
import { useServiceLogs } from '../../lib/api/use-service-logs';
import { useBikeStore } from '../../lib/store/bike-store';
import { computeNextService } from '../../lib/prediction/compute-next-service';
import { formatComplianceDate } from '../../lib/format';
import { colors } from '../../lib/colors';
import type {
  AttentionItem,
  AttentionStatus,
  ComplianceAttentionItem,
  MaintenanceAttentionItem,
} from '../../lib/types/attention';

// Screen-local atelier tokens that aren't yet in lib/colors.ts.
// PAPER is atelier --surface (#FAF8F4); lib/colors surface is currently #FFFFFF.
// DIM_1/DIM_2 are the two dim-ink shades used across the editorial variant.
// BRASS_* are the hairline mixes used for card borders.
// ORANGE/AMBER are the overdue/warning accents (not yet tokenised).
const PAPER = '#FAF8F4';
const DIM_1 = '#6B5E4F';
const DIM_2 = '#8B7B6B';
const BRASS_35 = 'rgba(199,178,153,0.35)';
const BRASS_28 = 'rgba(199,178,153,0.28)';
const ORANGE = '#B44A2C';
const AMBER = '#B4843A';

type Tone = 'ok' | 'warn' | 'overdue';

const HERO_PACE: Record<Tone, { pct: number; badge: string; badgeBg: string }> = {
  ok:      { pct: 62, badge: 'ON PACE',  badgeBg: colors.success },
  warn:    { pct: 82, badge: 'DUE SOON', badgeBg: AMBER },
  overdue: { pct: 96, badge: 'OVERDUE',  badgeBg: ORANGE },
};

function Hero({ days, km, pace }: { days: number; km: number; pace: Tone }) {
  const { pct, badge, badgeBg } = HERO_PACE[pace];

  return (
    <View
      className="mx-5 mt-4 rounded-[22px] overflow-hidden"
      style={{ backgroundColor: colors.ink, minHeight: 216 }}
    >
      <View
        pointerEvents="none"
        style={{ position: 'absolute', right: 12, bottom: 20, opacity: 0.14 }}
      >
        <Icon name="bike" size={170} stroke={PAPER} strokeWidth={0.9} />
      </View>

      <View className="p-6 pb-5">
        <Text
          className="font-mono"
          style={{
            fontSize: 9,
            letterSpacing: 2,
            color: 'rgba(250,248,244,0.5)',
            textTransform: 'uppercase',
          }}
        >
          Next service · Engine oil
        </Text>

        <Text
          className="font-display"
          style={{
            fontSize: 76,
            lineHeight: 78,
            letterSpacing: -3.5,
            color: PAPER,
            marginTop: 4,
            fontVariant: ['tabular-nums'],
          }}
        >
          {days}
        </Text>
        <Text
          className="font-mono"
          style={{
            fontSize: 11,
            letterSpacing: 1.3,
            color: 'rgba(250,248,244,0.55)',
            marginTop: -2,
          }}
        >
          DAYS · OR {km.toLocaleString()} KM
        </Text>

        <View
          className="self-start mt-3 rounded-md"
          style={{ backgroundColor: badgeBg, paddingHorizontal: 9, paddingVertical: 3 }}
        >
          <Text
            className="font-mono"
            style={{ fontSize: 9, letterSpacing: 1.3, color: '#fff', fontWeight: '600' }}
          >
            {badge}
          </Text>
        </View>

        {pace !== 'overdue' && (
          <View className="mt-4">
            <View
              style={{ height: 2, backgroundColor: 'rgba(250,248,244,0.15)', borderRadius: 1 }}
            >
              <View
                style={{
                  height: 2,
                  width: `${pct}%`,
                  backgroundColor: colors.yellow,
                  borderRadius: 1,
                }}
              />
            </View>
            <View className="flex-row justify-between mt-2">
              {['Last', 'Today', 'Due'].map((l) => (
                <Text
                  key={l}
                  className="font-mono"
                  style={{ fontSize: 9, letterSpacing: 1, color: 'rgba(250,248,244,0.4)' }}
                >
                  {l}
                </Text>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

interface QuickCardData {
  icon: IconName;
  title: string;
  meta: string;
  tone: Tone;
  onPress?: () => void;
}

interface QuickToneStyle {
  tag: string | null;
  tagBg: string;
  tagFg: string;
  icoBg: string;
  icoFg: string;
}

const QUICK_TONE: Record<Tone, QuickToneStyle> = {
  ok:      { tag: null,        tagBg: '',                          tagFg: '',    icoBg: 'rgba(242,208,107,0.22)', icoFg: DIM_1  },
  warn:    { tag: 'DUE SOON',  tagBg: 'rgba(180,132,58,0.22)',     tagFg: AMBER, icoBg: '#EDE9E2',                icoFg: DIM_1  },
  overdue: { tag: 'OVERDUE',   tagBg: 'rgba(180,74,44,0.16)',      tagFg: ORANGE,icoBg: 'rgba(180,74,44,0.18)',   icoFg: ORANGE },
};

function QuickActions({ cards }: { cards: QuickCardData[] }) {
  if (cards.length === 0) return null;
  return (
    <View style={{ paddingTop: 24 }}>
      <View className="px-5"><Eyebrow>Upcoming</Eyebrow></View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingHorizontal: 20, paddingTop: 10 }}
      >
        {cards.map((c, i) => {
          const t = QUICK_TONE[c.tone];
          return (
          <Pressable
            key={`${c.title}-${i}`}
            onPress={c.onPress}
            className="rounded-[18px]"
            style={{
              width: 124,
              backgroundColor: PAPER,
              borderWidth: 1,
              borderColor: BRASS_35,
              paddingHorizontal: 13,
              paddingTop: 13,
              paddingBottom: 11,
              position: 'relative',
            }}
          >
            {t.tag && (
              <View
                style={{
                  position: 'absolute',
                  top: 9,
                  right: 9,
                  paddingHorizontal: 5,
                  paddingVertical: 2,
                  borderRadius: 4,
                  backgroundColor: t.tagBg,
                }}
              >
                <Text
                  className="font-mono"
                  style={{ fontSize: 8, letterSpacing: 0.9, fontWeight: '600', color: t.tagFg }}
                >
                  {t.tag}
                </Text>
              </View>
            )}
            <View
              className="items-center justify-center rounded-[9px]"
              style={{
                width: 32,
                height: 32,
                marginBottom: 9,
                backgroundColor: t.icoBg,
              }}
            >
              <Icon name={c.icon} size={15} stroke={t.icoFg} />
            </View>
            <Text
              className="font-sans-semibold"
              style={{ fontSize: 12, letterSpacing: -0.1, lineHeight: 16, color: colors.ink }}
              numberOfLines={2}
            >
              {c.title}
            </Text>
            <Text
              className="font-mono"
              style={{ fontSize: 9, letterSpacing: 0.6, color: DIM_2, marginTop: 3 }}
              numberOfLines={1}
            >
              {c.meta}
            </Text>
          </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

interface FeatureTileData {
  icon: IconName;
  label: string;
  onPress?: () => void;
}

function FeatureGrid({ tiles }: { tiles: FeatureTileData[] }) {
  return (
    <View style={{ paddingTop: 24 }}>
      <View className="px-5"><Eyebrow>Tools</Eyebrow></View>
      <View className="flex-row flex-wrap px-5" style={{ gap: 8, paddingTop: 10 }}>
        {tiles.map((t, i) => (
          <Pressable
            key={`${t.label}-${i}`}
            onPress={t.onPress}
            className="rounded-[14px]"
            style={{
              width: '31.5%',
              backgroundColor: PAPER,
              borderWidth: 1,
              borderColor: BRASS_28,
              paddingHorizontal: 12,
              paddingTop: 14,
              paddingBottom: 12,
              gap: 7,
            }}
          >
            <Icon name={t.icon} size={19} stroke={DIM_1} />
            <Text
              className="font-sans-semibold"
              style={{ fontSize: 11, letterSpacing: -0.1, lineHeight: 14, color: colors.ink }}
            >
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ─── Data helpers ─────────────────────────────────────────────────────────

function iconForAttention(item: AttentionItem): IconName {
  if (item.category === 'compliance') {
    if (item.key === 'coeExpiry' || item.key === 'insuranceExpiry') return 'shield';
    if (item.key === 'roadTaxExpiry') return 'doc';
    return 'calendar';
  }
  const key = item.key.toLowerCase();
  if (key.includes('oil')) return 'oil';
  if (key.includes('chain')) return 'chain';
  if (key.includes('tyre') || key.includes('tire')) return 'tire';
  if (key.includes('brake')) return 'brake';
  return 'wrench';
}

const STATUS_TO_TONE: Record<AttentionStatus, Tone> = {
  ok: 'ok',
  approaching: 'warn',
  overdue: 'overdue',
};

function titleFor(item: AttentionItem): string {
  const overdue = item.status === 'overdue';
  if (item.category === 'compliance') {
    return overdue ? `Renew ${item.label.toLowerCase()}` : `${item.label} renewal`;
  }
  return overdue ? `${item.label} now` : item.label;
}

function metaFor(item: AttentionItem): string {
  if (item.category === 'compliance') {
    const ci = item as ComplianceAttentionItem;
    if (item.status === 'overdue') return `Expired ${Math.abs(ci.daysRemaining)}d ago`;
    return `Exp. ${formatComplianceDate(ci.expiresAt) ?? '—'}`;
  }
  const mi = item as MaintenanceAttentionItem;
  const km = mi.deltaKm ?? 0;
  return item.status === 'overdue' ? `${Math.abs(km)}km overdue` : `In ${km} km`;
}

function buildQuickActions(
  items: AttentionItem[],
  onPress: (item: AttentionItem) => void,
): QuickCardData[] {
  return [...items]
    .sort((a, b) => b.severity - a.severity)
    .slice(0, 6)
    .map<QuickCardData>((item) => ({
      icon: iconForAttention(item),
      title: titleFor(item),
      meta: metaFor(item),
      tone: STATUS_TO_TONE[item.status],
      onPress: () => onPress(item),
    }));
}

function showComingSoon(feature: string) {
  Alert.alert(feature, 'Coming soon.');
}

// Tools surfaces entry points that have no tab, no FAB, and no TopBar home.
// Future features sourced from docs/plans/ (02 mileage tracking, 03 bike
// health agent, 04 compass workshop recsys, 05 depreciation economics).
const FEATURE_TILES: FeatureTileData[] = [
  { icon: 'gauge',   label: 'Log mileage',  onPress: () => router.push('/quick-log' as any) },
  { icon: 'receipt', label: 'Scan receipt', onPress: () => router.push('/scan-receipt' as any) },
  { icon: 'tire',    label: 'Ride tracker', onPress: () => showComingSoon('Ride tracker') },
  { icon: 'sparkle', label: 'AI insights',  onPress: () => router.navigate('/(tabs)/agent') },
  { icon: 'wrench',  label: 'Workshops',    onPress: () => showComingSoon('Workshops') },
  { icon: 'chart',   label: 'Ownership',    onPress: () => showComingSoon('Ownership') },
];

// ─── Screen ────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { data: bikes, isLoading: bikesLoading } = useBikes();
  const { activeBikeId, setActiveBikeId } = useBikeStore();

  const activeBike = useMemo(() => {
    if (!bikes || bikes.length === 0) return null;
    return bikes.find((b) => b.id === activeBikeId) ?? bikes[0];
  }, [bikes, activeBikeId]);

  const { data: attention } = useAttention(activeBike?.id ?? null);
  const { data: serviceLogsData } = useServiceLogs(activeBike?.id ?? null, 1);
  const lastService = serviceLogsData?.data?.[0];
  const prediction = useMemo(
    () =>
      computeNextService({
        currentMileage: activeBike?.currentMileage ?? 0,
        lastServiceMileage: lastService?.mileageAt ?? null,
        lastServiceDate: lastService ? new Date(lastService.date) : null,
      }),
    [activeBike, lastService],
  );

  const onAttentionPress = useCallback(() => router.navigate('/(tabs)/garage'), []);
  const quickActions = useMemo(
    () => buildQuickActions(attention?.items ?? [], onAttentionPress),
    [attention?.items, onAttentionPress],
  );

  const [bikeSwitcherOpen, setBikeSwitcherOpen] = useState(false);

  if (bikesLoading) {
    return (
      <View className="flex-1 bg-bg">
        <TopBar bike="—" unread={0} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 20, paddingBottom: 140, paddingHorizontal: 20 }}
        >
          <Skeleton height={216} className="rounded-[22px] mb-4" />
          <Skeleton height={120} className="rounded-[18px] mb-4" />
          <Skeleton height={240} className="rounded-[14px]" />
        </ScrollView>
      </View>
    );
  }

  if (!activeBike) {
    return (
      <View className="flex-1 bg-bg">
        <TopBar bike="Add a bike" unread={0} />
        <ScrollView
          contentContainerStyle={{ paddingTop: 20, paddingBottom: 140, paddingHorizontal: 20 }}
        >
          <DevAuthToggle>
            <Text className="font-display text-[40px] leading-[42px] tracking-[-0.035em] text-ink">
              Your Garage
            </Text>
          </DevAuthToggle>
          <View className="mt-8">
            <EmptyState
              title="No bikes logged"
              description="Add a bike to start tracking services, mileage, and compliance."
              actionLabel="Add a bike"
              onAction={() => router.push('/add-bike')}
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  const unread = attention?.summary.needsAttention ?? 0;

  const pace: Tone =
    (attention?.summary.overdue ?? 0) > 0
      ? 'overdue'
      : (attention?.summary.approaching ?? 0) > 0
        ? 'warn'
        : 'ok';

  return (
    <View className="flex-1 bg-bg">
      <TopBar
        bike={activeBike.model}
        unread={unread}
        onBikePress={() => setBikeSwitcherOpen(true)}
        onBellPress={() => router.push('/notifications' as any)}
      />

      <BikeSwitcher
        visible={bikeSwitcherOpen}
        onClose={() => setBikeSwitcherOpen(false)}
        bikes={bikes ?? []}
        activeBikeId={activeBike.id}
        onSelect={setActiveBikeId}
        onAddBike={() => router.push('/add-bike')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        <Hero days={prediction.daysUntil} km={prediction.kmUntil} pace={pace} />

        <QuickActions cards={quickActions} />

        <FeatureGrid tiles={FEATURE_TILES} />
      </ScrollView>
    </View>
  );
}
