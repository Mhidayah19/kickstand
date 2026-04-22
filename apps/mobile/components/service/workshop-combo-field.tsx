import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';
import { useWorkshopSearch } from '../../lib/api/use-workshop-search';
import { useMyWorkshops } from '../../lib/api/use-my-workshops';
import { useUpsertWorkshop } from '../../lib/api/use-upsert-workshop';
import { useWorkshopPickerStore } from '../../lib/store/workshop-picker-store';
import { colors } from '../../lib/colors';
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
  return (
    <View className="mb-lg">
      <Text className="text-[10px] font-sans-bold tracking-atelier uppercase text-charcoal/55 mb-2">
        Workshop
      </Text>

      {expanded ? (
        <ExpandedSearch onClose={onCollapse} />
      ) : (
        <CollapsedField
          workshopName={workshopName}
          workshopAddress={workshopAddress}
          onPress={onExpand}
          onClear={onClear}
        />
      )}
    </View>
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
      className="bg-surface-low rounded-2xl px-4 py-4 flex-row items-center active:opacity-90"
    >
      <View className="flex-1 pr-3">
        {isEmpty ? (
          <Text className="text-[15px] font-sans-medium text-charcoal/55">
            Add workshop
          </Text>
        ) : (
          <>
            <Text
              className="text-[15px] font-sans-bold text-charcoal"
              numberOfLines={1}
            >
              {workshopName}
            </Text>
            {!!workshopAddress && (
              <Text
                className="text-[12px] font-sans-medium text-charcoal/55 mt-0.5"
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
          onPress={(e) => {
            e.stopPropagation();
            onClear();
          }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Clear workshop"
          className="w-7 h-7 rounded-full items-center justify-center active:opacity-70 mr-1"
        >
          <MaterialCommunityIcons name="close" size={14} color={colors.charcoal} />
        </Pressable>
      )}
      <MaterialCommunityIcons
        name="chevron-right"
        size={18}
        color={colors.charcoal}
      />
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
        <View className="flex-1 bg-surface-low rounded-2xl flex-row items-center px-3 py-2.5">
          <MaterialCommunityIcons name="magnify" size={18} color={colors.charcoal} />
          <TextInput
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder="Search workshops…"
            placeholderTextColor={`${colors.charcoal}88`}
            className="flex-1 ml-2 text-[15px] font-sans-medium text-charcoal"
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
              <MaterialCommunityIcons name="close" size={16} color={colors.charcoal} />
            </Pressable>
          ) : null}
        </View>
        <Pressable
          onPress={onClose}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
          className="px-1 py-2"
        >
          <Text className="text-[13px] font-sans-bold text-charcoal">
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
          className="rounded-2xl bg-sand/20 py-3 items-center mt-3 active:opacity-90"
        >
          <Text className="text-[13px] font-sans-bold text-charcoal">
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
    <View className="mt-3 bg-surface-card rounded-2xl overflow-hidden">
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
      <Text className="text-[12px] font-sans-medium text-charcoal/55 py-5 text-center">
        Type at least 2 characters to search.
      </Text>
    );
  }
  return (
    <View className="mt-3">
      <Text className="text-[10px] font-sans-bold tracking-atelier uppercase text-charcoal/55 mb-2">
        Your workshops
      </Text>
      <View className="bg-surface-card rounded-2xl overflow-hidden">
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

function ResultRow({ name, address, onPress }: ResultRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-4 py-3 active:opacity-80 active:bg-sand/10"
    >
      <View className="w-9 h-9 rounded-xl bg-sand/20 items-center justify-center mr-3">
        <MaterialCommunityIcons name="wrench" size={16} color={colors.charcoal} />
      </View>
      <View className="flex-1">
        <Text
          className="text-[15px] font-sans-bold text-charcoal"
          numberOfLines={1}
        >
          {name}
        </Text>
        {!!address && (
          <Text
            className="text-[12px] font-sans-medium text-charcoal/55 mt-0.5"
            numberOfLines={1}
          >
            {address}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
