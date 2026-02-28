import { type ProviderConfigProps } from './ProviderConfig';

export interface ProviderItem extends Omit<ProviderConfigProps, 'id' | 'source'> {
  id: string;
}
