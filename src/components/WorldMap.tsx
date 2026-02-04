'use client';

import { memo, useMemo, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import { Box, Typography, Tooltip as MuiTooltip } from '@mui/material';
import { palette } from '@/theme/theme';

// Natural Earth TopoJSON (hosted by react-simple-maps)
const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// ISO 3166-1 alpha-2 → alpha-3 mapping (Vercel sends alpha-2, topojson uses alpha-3 numeric)
// We'll match on ISO_A2 property instead

interface CountryData {
  country: string; // ISO alpha-2
  count: number;
}

interface WorldMapProps {
  data: CountryData[];
}

function WorldMap({ data }: WorldMapProps) {
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Build a lookup map from alpha-2 code → count
  const countMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((d) => {
      if (d.country) map.set(d.country.toUpperCase(), d.count);
    });
    return map;
  }, [data]);

  const maxCount = useMemo(() => {
    if (data.length === 0) return 1;
    return Math.max(...data.map((d) => d.count), 1);
  }, [data]);

  // Color scale: transparent → accent green
  function getColor(count: number): string {
    if (count === 0) return palette.bgCard;
    // Log scale for better distribution
    const intensity = Math.log(count + 1) / Math.log(maxCount + 1);
    const minOpacity = 0.2;
    const opacity = minOpacity + intensity * (1 - minOpacity);
    // Interpolate from dim green to bright green
    const r = Math.round(0 * opacity);
    const g = Math.round(237 * opacity + 30 * (1 - opacity));
    const b = Math.round(100 * opacity + 43 * (1 - opacity));
    return `rgb(${r}, ${g}, ${b})`;
  }

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {tooltipContent && (
        <Box
          sx={{
            position: 'fixed',
            left: tooltipPos.x + 12,
            top: tooltipPos.y - 30,
            bgcolor: palette.bgCard,
            border: `1px solid ${palette.border}`,
            borderRadius: 1,
            px: 1.5,
            py: 0.75,
            pointerEvents: 'none',
            zIndex: 9999,
            whiteSpace: 'nowrap',
          }}
        >
          <Typography variant="caption" sx={{ color: palette.text, fontWeight: 600 }}>
            {tooltipContent}
          </Typography>
        </Box>
      )}
      <ComposableMap
        projectionConfig={{
          rotate: [-10, 0, 0],
          scale: 147,
        }}
        style={{ width: '100%', height: 'auto' }}
      >
        <ZoomableGroup>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                // Try multiple property names for country code matching
                const isoA2 =
                  geo.properties.ISO_A2 ||
                  geo.properties.iso_a2 ||
                  '';
                const name = geo.properties.name || geo.properties.NAME || '';
                const count = countMap.get(isoA2.toUpperCase()) || 0;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={(e) => {
                      setTooltipContent(
                        count > 0
                          ? `${name} (${isoA2}): ${count.toLocaleString()} events`
                          : name
                      );
                      setTooltipPos({ x: e.clientX, y: e.clientY });
                    }}
                    onMouseMove={(e) => {
                      setTooltipPos({ x: e.clientX, y: e.clientY });
                    }}
                    onMouseLeave={() => {
                      setTooltipContent('');
                    }}
                    style={{
                      default: {
                        fill: count > 0 ? getColor(count) : palette.bgCard,
                        stroke: palette.border,
                        strokeWidth: 0.5,
                        outline: 'none',
                      },
                      hover: {
                        fill: count > 0 ? palette.accent : 'rgba(255,255,255,0.1)',
                        stroke: palette.textDim,
                        strokeWidth: 0.75,
                        outline: 'none',
                        cursor: 'pointer',
                      },
                      pressed: {
                        fill: palette.accentDim,
                        outline: 'none',
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Legend */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          mt: 1,
        }}
      >
        <Typography variant="caption" sx={{ color: palette.textMuted }}>
          0
        </Typography>
        <Box
          sx={{
            width: 120,
            height: 8,
            borderRadius: 4,
            background: `linear-gradient(to right, ${palette.bgCard}, ${palette.accentDim}, ${palette.accent})`,
          }}
        />
        <Typography variant="caption" sx={{ color: palette.textMuted }}>
          {maxCount.toLocaleString()}
        </Typography>
      </Box>
    </Box>
  );
}

export default memo(WorldMap);
