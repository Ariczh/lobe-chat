import { createElement } from 'react';

import Loading from '@/components/Loading/BrandTextLoading';
import dynamic from '@/libs/next/dynamic';
import { SettingsTabs } from '@/store/global/initialState';

const loading = (debugId: string) => () => createElement(Loading, { debugId });

export const componentMap = {
  [SettingsTabs.Common]: dynamic(() => import('../Common'), {
    loading: loading('Settings > Common'),
  }),
  [SettingsTabs.ChatAppearance]: dynamic(() => import('../ChatAppearance'), {
    loading: loading('Settings > ChatAppearance'),
  }),
  [SettingsTabs.Provider]: dynamic(() => import('../Provider'), {
    loading: loading('Settings > Provider'),
  }),
  [SettingsTabs.Image]: dynamic(() => import('../Image'), {
    loading: loading('Settings > Image'),
  }),
  [SettingsTabs.Memory]: dynamic(() => import('../Memory'), {
    loading: loading('Settings > Memory'),
  }),
  [SettingsTabs.TTS]: dynamic(() => import('../TTS'), {
    loading: loading('Settings > TTS'),
  }),
  [SettingsTabs.About]: dynamic(() => import('../About'), {
    loading: loading('Settings > About'),
  }),
  [SettingsTabs.Hotkey]: dynamic(() => import('../Hotkey'), {
    loading: loading('Settings > Hotkey'),
  }),
  [SettingsTabs.Proxy]: dynamic(() => import('../Proxy'), {
    loading: loading('Settings > Proxy'),
  }),
  [SettingsTabs.SystemTools]: dynamic(() => import('../SystemTools'), {
    loading: loading('Settings > SystemTools'),
  }),
  [SettingsTabs.Storage]: dynamic(() => import('../Storage'), {
    loading: loading('Settings > Storage'),
  }),
  [SettingsTabs.Agent]: dynamic(() => import('../Agent'), {
    loading: loading('Settings > Agent'),
  }),
  // Profile related tabs
  [SettingsTabs.Profile]: dynamic(() => import('../Profile'), {
    loading: loading('Settings > Profile'),
  }),
  [SettingsTabs.Stats]: dynamic(() => import('../Stats'), {
    loading: loading('Settings > Stats'),
  }),
  [SettingsTabs.APIKey]: dynamic(() => import('../ApiKey'), {
    loading: loading('Settings > APIKey'),
  }),
  [SettingsTabs.Security]: dynamic(() => import('../Security'), {
    loading: loading('Settings > Security'),
  }),
  [SettingsTabs.Skill]: dynamic(() => import('../Skill'), {
    loading: loading('Settings > Skill'),
  }),

  [SettingsTabs.Plans]: dynamic(() => import('@/business/client/BusinessSettingPages/Plans'), {
    loading: loading('Settings > Plans'),
  }),
  [SettingsTabs.Funds]: dynamic(() => import('@/business/client/BusinessSettingPages/Funds'), {
    loading: loading('Settings > Funds'),
  }),
  [SettingsTabs.Usage]: dynamic(() => import('@/business/client/BusinessSettingPages/Usage'), {
    loading: loading('Settings > Usage'),
  }),
  [SettingsTabs.Billing]: dynamic(() => import('@/business/client/BusinessSettingPages/Billing'), {
    loading: loading('Settings > Billing'),
  }),
  [SettingsTabs.Referral]: dynamic(
    () => import('@/business/client/BusinessSettingPages/Referral'),
    {
      loading: loading('Settings > Referral'),
    },
  ),
};
