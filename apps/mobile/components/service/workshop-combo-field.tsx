import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Crypto from 'expo-crypto';
import { useWorkshopSearch } from '../../lib/api/use-workshop-search';
import { useMyWorkshops } from '../../lib/api/use-my-workshops';
import { useUpsertWorkshop } from '../../lib/api/use-upsert-workshop';
import { useWorkshopPickerStore } from '../../lib/store/workshop-picker-store';
import { colors } from '../../lib/colors';
import { Eyebrow, FieldCard, Icon } from '../ui/atelier';
import type { Workshop, WorkshopSuggestion } from '../../lib/types/workshop';

interface WorkshopComboFieldProps {
  workshopName: string | null;
  workshopAddress: string | null;
  expanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  onClear: () => void;
}

export function WorkshopComboField({
  workshopName,
  workshopAddress,
  expanded,
  onExpand,
  onCollapse,
  onClear,
}: WorkshopComboFieldProps) {
  if (expanded) {
    return (
      <View>
        <Eyebrow className="mb-2">Workshop</Eyebrow>
        <ExpandedSearch onClose={onCollapse} />
      </View>
    );
  }

  return (
    <CollapsedField
      workshopName={workshopName}
      workshopAddress={workshopAddress}
      onPress={onExpand}
      onClear={onClear}
    />
  );
}

interface CollapsedFieldProps {
  workshopName: string | null;
  workshopAddress: string | null;
  onPress: () => void;
  onClear: () => void;
}

function CollapsedField({
  workshopName,
  workshopAddress,
  onPress,
  onClear,
}: CollapsedFieldProps) {
  const isEmpty = !workshopName;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        isEmpty ? 'Add workshop' : `Change workshop: ${workshopName}`
      }
    >
      <FieldCard label="Workshop">
        <View className="flex-row items-start">
          <View className="flex-1 pr-3">
            {isEmpty ? (
              <Text className="font-sans-semibold text-[16px] text-muted">
                Add workshop
              </Text>
            ) : (
              <>
                <Text
                  className="font-sans-semibold text-[16px] text-ink"
                  numberOfLines={1}
                >
                  {workshopName}
                </Text>
                {!!workshopAddress && (
                  <Text
                    className="font-sans-medium text-[12px] text-muted mt-0.5"
                    numberOfLines={1}
                  >
                    {workshopAddress}
                  </Text>
                )}
              </>
            )}
          </View>

          {!isEmpty && (
            <Pressable
              onPress={onClear}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Clear workshop"
              className="w-6 h-6 items-center justify-center active:opacity-70"
            >
              <Icon name="close" size={14} stroke="#7A756C" />
            </Pressable>
          )}
        </View>
      </FieldCard>
    </Pressable>
  );
}

const MAX_INLINE_RESULTS = 5;

function ExpandedSearch({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const sessionToken = useMemo(() => Crypto.randomUUID(), []);
  const setSelection = useWorkshopPickerStore((s) => s.setSelection);

  const search = useWorkshopSearch({ query, sessionToken });
  const myWorkshops = useMyWorkshops();
  const upsert = useUpsertWorkshop();

  const showingResults = query.trim().length >= 2;
  const hasResults = (search.data?.length ?? 0) > 0;
  const showAddManually = showingResults && !search.isFetching && !hasResults;

  const handleSelectMine = useCallback(
    (w: Workshop) => {
      setSelection({ id: w.id, name: w.name, address: w.address ?? null });
      onClose();
    },
    [setSelection, onClose],
  );

  const handleSelectSuggestion = useCallback(
    async (s: WorkshopSuggestion) => {
      try {
        const workshop = await upsert.mutateAsync({
          placeId: s.placeId,
          sessionToken,
        });
        setSelection({
          id: workshop.id,
          name: workshop.name,
          address: workshop.address ?? null,
        });
        onClose();
      } catch {
        // surface minimally; keep user on screen so they can retry or add manually
      }
    },
    [upsert, sessionToken, setSelection, onClose],
  );

  const handleAddManually = useCallback(() => {
    onClose();
    router.push({
      pathname: '/workshop-manual',
      params: { prefill: query },
    });
  }, [query, router, onClose]);

  return (
    <View>
      <View className="flex-row items-center gap-2">
        <View className="flex-1 border border-hairline-2 rounded-[14px] flex-row items-center px-4 py-[11px]">
          <Icon name="search" size={16} stroke="#7A756C" />
          <TextInput
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder="Search workshops…"
            placeholderTextColor="rgba(26,26,26,0.35)"
            className="flex-1 ml-2 text-[16px] font-sans-semibold text-ink"
            returnKeyType="search"
          />
          {search.isFetching ? (
            <ActivityIndicator size="small" color={colors.charcoal} />
          ) : query.length > 0 ? (
            <Pressable
              onPress={() => setQuery('')}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Icon name="close" size={14} stroke="#7A756C" />
            </Pressable>
          ) : null}
        </View>
        <Pressable
          onPress={onClose}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
          className="px-2 py-2"
        >
          <Text className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink">
            Cancel
          </Text>
        </Pressable>
      </View>

      {showingResults ? (
        <SearchResults
          items={(search.data ?? []).slice(0, MAX_INLINE_RESULTS)}
          loading={search.isFetching}
          hasResults={hasResults}
          onSelect={handleSelectSuggestion}
        />
      ) : (
        <YourWorkshops
          items={(myWorkshops.data ?? []).slice(0, MAX_INLINE_RESULTS)}
          loading={myWorkshops.isLoading}
          onSelect={handleSelectMine}
        />
      )}

      {showAddManually && (
        <Pressable
          onPress={handleAddManually}
          accessibilityRole="button"
          className="mt-3 px-4 py-[13px] rounded-[14px] items-center justify-center flex-row gap-2 active:opacity-90"
          style={{
            borderWidth: 1.5,
            borderColor: 'rgba(26,26,26,0.16)',
            borderStyle: 'dashed',
          }}
        >
          <Icon name="plus" size={14} stroke="#7A756C" />
          <Text className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted">
            Can&apos;t find it? Add manually
          </Text>
        </Pressable>
      )}
    </View>
  );
}

interface SearchResultsProps {
  items: WorkshopSuggestion[];
  loading: boolean;
  hasResults: boolean;
  onSelect: (s: WorkshopSuggestion) => void;
}

function SearchResults({ items, loading, hasResults, onSelect }: SearchResultsProps) {
  if (loading && !hasResults) {
    return (
      <View className="py-6 items-center">
        <ActivityIndicator color={colors.charcoal} />
      </View>
    );
  }
  if (items.length === 0) {
    return null;
  }
  return (
    <View className="mt-3 border border-hairline-2 rounded-[14px] overflow-hidden">
      {items.map((item, i) => (
        <ResultRow
          key={item.placeId}
          name={item.name}
          address={item.address}
          isLast={i === items.length - 1}
          onPress={() => onSelect(item)}
        />
      ))}
    </View>
  );
}

interface YourWorkshopsProps {
  items: Workshop[];
  loading: boolean;
  onSelect: (w: Workshop) => void;
}

function YourWorkshops({ items, loading, onSelect }: YourWorkshopsProps) {
  if (loading) {
    return (
      <View className="py-6 items-center">
        <ActivityIndicator color={colors.charcoal} />
      </View>
    );
  }
  if (items.length === 0) {
    return (
      <Text className="font-sans-medium text-[13px] text-muted py-5 text-center">
        Type at least 2 characters to search.
      </Text>
    );
  }
  return (
    <View className="mt-3">
      <Eyebrow className="mb-2">Your workshops</Eyebrow>
      <View className="border border-hairline-2 rounded-[14px] overflow-hidden">
        {items.map((item, i) => (
          <ResultRow
            key={item.id}
            name={item.name}
            address={item.address ?? null}
            isLast={i === items.length - 1}
            onPress={() => onSelect(item)}
          />
        ))}
      </View>
    </View>
  );
}

interface ResultRowProps {
  name: string;
  address: string | null;
  isLast: boolean;
  onPress: () => void;
}

function ResultRow({ name, address, isLast, onPress }: ResultRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center px-4 py-3 active:opacity-80 active:bg-bg-2 ${
        isLast ? '' : 'border-b border-hairline'
      }`}
    >
      <View className="w-9 h-9 rounded-xl bg-bg-2 items-center justify-center mr-3">
        <Icon name="wrench" size={16} stroke="#1A1A1A" />
      </View>
      <View className="flex-1">
        <Text
          className="font-sans-semibold text-[15px] text-ink"
          numberOfLines={1}
        >
          {name}
        </Text>
        {!!address && (
          <Text
            className="font-sans-medium text-[12px] text-muted mt-0.5"
            numberOfLines={1}
          >
            {address}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
