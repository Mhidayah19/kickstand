import type { IconName } from '../components/ui/atelier';

export function serviceTypeIcon(type: string): IconName {
  switch (type.toLowerCase()) {
    case 'oil':
    case 'oil change':
    case 'engine oil':          return 'oil';
    case 'chain lube':
    case 'chain':               return 'chain';
    case 'tyre':
    case 'tire':
    case 'tyres':               return 'tire';
    case 'brake':
    case 'brakes':              return 'brake';
    case 'road tax':
    case 'insurance':
    case 'compliance':          return 'shield';
    case 'mods':
    case 'modifications':       return 'tune';
    default:                    return 'wrench';
  }
}
