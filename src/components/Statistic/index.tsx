import { Flexbox } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { type CSSProperties, type ReactNode } from 'react';
import { memo } from 'react';

interface StatisticProps {
  gap?: number;
  title: ReactNode;
  value: ReactNode;
  valuePlacement?: 'bottom' | 'right';
  valueStyle?: CSSProperties;
  width?: number;
}

const Statistic = memo<StatisticProps>(
  ({ value, title, gap = 4, valuePlacement, valueStyle, width }) => {
    const isVertical = valuePlacement === 'bottom';
    return (
      <Flexbox
        gap={gap}
        style={{
          color: cssVar.colorTextDescription,
          flexDirection: isVertical ? 'column' : 'row',
          fontSize: valueStyle?.fontSize ?? 12,
          minWidth: width,
          ...valueStyle,
        }}
      >
        <span style={{ fontWeight: 'bold' }}>{value}</span>
        <span style={{ fontWeight: 'normal' }}>{title}</span>
      </Flexbox>
    );
  },
);

export default Statistic;
