import React from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../lib/colors';

const THUMB = 72;
const THUMB_RADIUS = 10;
const BADGE_SIZE = 18;

const thumbContainerStyle = {
  width: THUMB,
  height: THUMB,
  borderRadius: THUMB_RADIUS,
  overflow: 'hidden' as const,
  backgroundColor: colors.surfaceLow,
};

const removeBadgeStyle = {
  position: 'absolute' as const,
  top: 4,
  right: 4,
  width: BADGE_SIZE,
  height: BADGE_SIZE,
  borderRadius: BADGE_SIZE / 2,
  backgroundColor: colors.danger,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

function getUploadingLabel(uploadingCount: number): string {
  if (uploadingCount > 1) {
    return `${uploadingCount} left`;
  }

  return 'Uploading';
}

interface ReceiptStripProps {
  urls: string[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onPress: (index: number) => void;
  uploadingCount?: number;
  maxCount?: number;
}

export function ReceiptStrip({
  urls,
  onAdd,
  onRemove,
  onPress,
  uploadingCount = 0,
  maxCount = 5,
}: ReceiptStripProps) {
  const hasReceipts = urls.length > 0;
  const canAddMore = urls.length + uploadingCount < maxCount;
  const isEmpty = !hasReceipts && uploadingCount === 0;

  if (isEmpty) {
    return (
      <Pressable
        onPress={onAdd}
        className="border-2 border-dashed border-outline rounded-xl py-3xl items-center justify-center active:opacity-70"
      >
        <MaterialCommunityIcons name="camera-outline" size={28} color={colors.outline} />
        <Text className="font-sans-bold text-sm text-outline mt-sm">
          Upload Evidence
        </Text>
      </Pressable>
    );
  }

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
      >
        {urls.map((uri, index) => (
          <View key={`${uri}-${index}`} style={thumbContainerStyle}>
            <Pressable onPress={() => onPress(index)} style={{ flex: 1 }} className="active:opacity-80">
              <Image source={{ uri }} style={{ width: THUMB, height: THUMB }} resizeMode="cover" />
            </Pressable>
            <Pressable
              onPress={() => onRemove(index)}
              hitSlop={4}
              style={removeBadgeStyle}
            >
              <MaterialCommunityIcons name="close" size={10} color="#fff" />
            </Pressable>
          </View>
        ))}

        {uploadingCount > 0 && (
          <View
            style={{
              width: THUMB,
              height: THUMB,
              borderRadius: THUMB_RADIUS,
              backgroundColor: colors.surfaceLow,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <ActivityIndicator size="small" color={colors.yellow} />
            <Text style={{ color: colors.yellow, fontSize: 9, fontFamily: 'PlusJakartaSans_700Bold' }}>
              {getUploadingLabel(uploadingCount)}
            </Text>
          </View>
        )}

        {canAddMore && (
          <Pressable
            onPress={onAdd}
            style={{
              width: THUMB,
              height: THUMB,
              borderRadius: THUMB_RADIUS,
              borderWidth: 1.5,
              borderStyle: 'dashed',
              borderColor: colors.outline,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }}
            className="active:opacity-70"
          >
            <MaterialCommunityIcons name="plus" size={20} color={colors.outline} />
            <Text style={{ color: colors.outline, fontSize: 9, fontFamily: 'PlusJakartaSans_700Bold' }}>
              Add
            </Text>
          </Pressable>
        )}
      </ScrollView>

      <Text className="font-sans-medium text-xxs text-sand text-right mt-1">
        {urls.length} of {maxCount}
      </Text>
    </View>
  );
}
