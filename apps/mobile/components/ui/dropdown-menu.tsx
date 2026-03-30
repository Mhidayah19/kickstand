import { NativeOnlyAnimatedView } from './native-only-animated-view';
import { cn } from '../../lib/cn';
import * as DropdownMenuPrimitive from '@rn-primitives/dropdown-menu';
import * as React from 'react';
import {
  Platform,
  type StyleProp,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { FullWindowOverlay as RNFullWindowOverlay } from 'react-native-screens';

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const FullWindowOverlay =
  Platform.OS === 'ios' ? RNFullWindowOverlay : React.Fragment;

function DropdownMenuContent({
  className,
  overlayClassName,
  overlayStyle,
  portalHost,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content> & {
  overlayStyle?: StyleProp<ViewStyle>;
  overlayClassName?: string;
  portalHost?: string;
}) {
  return (
    <DropdownMenuPrimitive.Portal hostName={portalHost}>
      <FullWindowOverlay>
        <DropdownMenuPrimitive.Overlay
          style={
            Platform.select({
              web: overlayStyle ?? undefined,
              native: overlayStyle
                ? StyleSheet.flatten([
                    StyleSheet.absoluteFill,
                    overlayStyle as typeof StyleSheet.absoluteFill,
                  ])
                : StyleSheet.absoluteFill,
            })
          }
          className={overlayClassName}
        >
          <NativeOnlyAnimatedView>
            <DropdownMenuPrimitive.Content
              className={cn(
                'bg-surface-card min-w-[10rem] overflow-hidden rounded-2xl p-1 shadow-lg shadow-black/5',
                className
              )}
              {...props}
            />
          </NativeOnlyAnimatedView>
        </DropdownMenuPrimitive.Overlay>
      </FullWindowOverlay>
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuItem({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  className?: string;
  variant?: 'default' | 'destructive';
}) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        'active:bg-surface-low group relative flex flex-row items-center gap-3 rounded-xl px-4 py-3',
        variant === 'destructive' && 'active:bg-danger/10',
        props.disabled && 'opacity-50',
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn('bg-surface-low -mx-1 my-1 h-px', className)}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
};
