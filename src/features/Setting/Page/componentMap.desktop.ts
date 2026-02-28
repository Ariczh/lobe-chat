import Billing from '@/business/client/BusinessSettingPages/Billing';
import Funds from '@/business/client/BusinessSettingPages/Funds';
import Plans from '@/business/client/BusinessSettingPages/Plans';
import Referral from '@/business/client/BusinessSettingPages/Referral';
import Usage from '@/business/client/BusinessSettingPages/Usage';
import { SettingsTabs } from '@/store/global/initialState';

import About from '../About';
import Agent from '../Agent';
import APIKey from '../ApiKey';
import ChatAppearance from '../ChatAppearance';
import Common from '../Common';
import Hotkey from '../Hotkey';
import Image from '../Image';
import Memory from '../Memory';
import Profile from '../Profile';
import Provider from '../Provider';
import Proxy from '../Proxy';
import Security from '../Security';
import Skill from '../Skill';
import Stats from '../Stats';
import Storage from '../Storage';
import SystemTools from '../SystemTools';
import TTS from '../TTS';

export const componentMap = {
  [SettingsTabs.Common]: Common,
  [SettingsTabs.ChatAppearance]: ChatAppearance,
  [SettingsTabs.Provider]: Provider,
  [SettingsTabs.Image]: Image,
  [SettingsTabs.Memory]: Memory,
  [SettingsTabs.TTS]: TTS,
  [SettingsTabs.About]: About,
  [SettingsTabs.Hotkey]: Hotkey,
  [SettingsTabs.Proxy]: Proxy,
  [SettingsTabs.SystemTools]: SystemTools,
  [SettingsTabs.Storage]: Storage,
  [SettingsTabs.Agent]: Agent,
  // Profile related tabs
  [SettingsTabs.Profile]: Profile,
  [SettingsTabs.Stats]: Stats,
  [SettingsTabs.APIKey]: APIKey,
  [SettingsTabs.Security]: Security,
  [SettingsTabs.Skill]: Skill,

  [SettingsTabs.Plans]: Plans,
  [SettingsTabs.Funds]: Funds,
  [SettingsTabs.Usage]: Usage,
  [SettingsTabs.Billing]: Billing,
  [SettingsTabs.Referral]: Referral,
};
