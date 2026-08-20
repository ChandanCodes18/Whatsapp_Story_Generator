'use client';

import React from 'react';
import phoneStyles from '@/styles/phone.module.css';
import { WhatsAppChat } from './WhatsAppChat';

export function PhoneFrame() {
  return (
    <div className={phoneStyles.phoneWrapper}>
      <div className={phoneStyles.phoneFrame} id="phone-frame-capture">
        <div className={phoneStyles.phoneBezel} />
        <div className={phoneStyles.dynamicIsland} />
        <div className={phoneStyles.phoneScreen} id="phone-capture">
          <WhatsAppChat />
        </div>
      </div>
    </div>
  );
}
