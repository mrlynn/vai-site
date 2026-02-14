'use client';

import { memo, useMemo, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import { Box, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { palette } from '@/theme/theme';
import { numericToAlpha2 } from '@/lib/country-codes';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

interface CountryData {
  country: string;
  count: number;
}

interface CityLocation {
  city: string;
  country: string;
  count: number;
  lat: number;
  lng: number;
}

interface WorldMapProps {
  countryData: CountryData[];
  cityData?: CityLocation[];
}

function WorldMap({ countryData, cityData = [] }: WorldMapProps) {
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [view, setView] = useState<'countries' | 'cities'>(
    cityData.length > 0 ? 'cities' : 'countries'
  );

  const countMap = useMemo(() => {
    const map = new Map<string, number>();
    countryData.forEach((d) => {
      if (d.country) map.set(d.country.toUpperCase(), d.count);
    });
    return map;
  }, [countryData]);

  const maxCountryCount = useMemo(() => {
    if (countryData.length === 0) return 1;
    return Math.max(...countryData.map((d) => d.count), 1);
  }, [countryData]);

  const maxCityCount = useMemo(() => {
    if (cityData.length === 0) return 1;
    return Math.max(...cityData.map((d) => d.count), 1);
  }, [cityData]);

  function getCountryColor(count: number): string {
    if (count === 0) return palette.bgCard;
    const intensity = Math.log(count + 1) / Math.log(maxCountryCount + 1);
    const minOpacity = 0.2;
    const opacity = minOpacity + intensity * (1 - minOpacity);
    const r = Math.round(0 * opacity);
    const g = Math.round(237 * opacity + 30 * (1 - opacity));
    const b = Math.round(100 * opacity + 43 * (1 - opacity));
    return `rgb(${r}, ${g}, ${b})`;
  }

  function getCityRadius(count: number): number {
    const minR = 3;
    const maxR = 18;
    const scale = Math.sqrt(count) / Math.sqrt(maxCityCount);
    return minR + scale * (maxR - minR);
  }

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {/* Tooltip */}
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

      {/* View Toggle */}
      {cityData.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(_, v) => v && setView(v)}
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                color: palette.textMuted,
                borderColor: palette.border,
                fontSize: '0.75rem',
                py: 0.5,
                px: 1.5,
                '&.Mui-selected': {
                  color: palette.accent,
                  bgcolor: 'rgba(0, 212, 170, 0.1)',
                },
              },
            }}
          >
            <ToggleButton value="countries">Countries</ToggleButton>
            <ToggleButton value="cities">Cities</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}

      <ComposableMap
        projectionConfig={{ rotate: [-10, 0, 0], scale: 147 }}
        style={{ width: '100%', height: 'auto' }}
      >
        <ZoomableGroup>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                // world-atlas uses numeric IDs — convert to alpha-2
                const numericId = String(geo.id).padStart(3, '0');
                const isoA2 =
                  geo.properties.ISO_A2 ||
                  geo.properties.iso_a2 ||
                  numericToAlpha2[numericId] ||
                  '';
                const name = geo.properties.name || geo.properties.NAME || '';
                const count = countMap.get(isoA2.toUpperCase()) || 0;
                const showCountryFill = view === 'countries';

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
                    onMouseLeave={() => setTooltipContent('')}
                    style={{
                      default: {
                        fill: showCountryFill && count > 0 ? getCountryColor(count) : palette.bgCard,
                        stroke: palette.border,
                        strokeWidth: 0.5,
                        outline: 'none',
                      },
                      hover: {
                        fill:
                          showCountryFill && count > 0
                            ? palette.accent
                            : 'rgba(255,255,255,0.08)',
                        stroke: palette.textDim,
                        strokeWidth: 0.75,
                        outline: 'none',
                        cursor: 'pointer',
                      },
                      pressed: { fill: palette.accentDim, outline: 'none' },
                    }}
                  />
                );
              })
            }
          </Geographies>

          {/* City markers */}
          {view === 'cities' &&
            cityData
              .filter((c) => c.lat && c.lng)
              .map((city, i) => {
                const r = getCityRadius(city.count);
                return (
                  <Marker key={i} coordinates={[city.lng, city.lat]}>
                    <circle
                      r={r}
                      fill={palette.accent}
                      fillOpacity={0.6}
                      stroke={palette.accent}
                      strokeWidth={1}
                      strokeOpacity={0.9}
                      onMouseEnter={(e) => {
                        setTooltipContent(
                          `${city.city}, ${city.country}: ${city.count.toLocaleString()} events`
                        );
                        setTooltipPos({
                          x: (e as unknown as MouseEvent).clientX,
                          y: (e as unknown as MouseEvent).clientY,
                        });
                      }}
                      onMouseMove={(e) => {
                        setTooltipPos({
                          x: (e as unknown as MouseEvent).clientX,
                          y: (e as unknown as MouseEvent).clientY,
                        });
                      }}
                      onMouseLeave={() => setTooltipContent('')}
                      style={{ cursor: 'pointer' }}
                    />
                    {/* Label for top cities */}
                    {city.count >= maxCityCount * 0.3 && (
                      <text
                        textAnchor="middle"
                        y={-r - 4}
                        style={{
                          fontFamily: '-apple-system, sans-serif',
                          fontSize: 9,
                          fill: palette.textDim,
                          pointerEvents: 'none',
                        }}
                      >
                        {city.city}
                      </text>
                    )}
                  </Marker>
                );
              })}
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
        {view === 'countries' ? (
          <>
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
              {maxCountryCount.toLocaleString()}
            </Typography>
          </>
        ) : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <svg width="8" height="8">
                <circle cx="4" cy="4" r="3" fill={palette.accent} fillOpacity={0.6} />
              </svg>
              <Typography variant="caption" sx={{ color: palette.textMuted }}>
                fewer
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <svg width="20" height="20">
                <circle cx="10" cy="10" r="9" fill={palette.accent} fillOpacity={0.6} />
              </svg>
              <Typography variant="caption" sx={{ color: palette.textMuted }}>
                more events
              </Typography>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}

export default memo(WorldMap);
