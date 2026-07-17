import React, { useState } from 'react';
import { CloudRain, Sun, Wind } from 'lucide-react';
import { useDismissState } from '../hooks/useDismissState';
import { NativeWidgetChrome } from '../primitives/NativeWidgetChrome';
import { emitTelemetry } from '../telemetry';

const ID = 'weather-widget-ad';
const forecasts = [
  { city: 'Brighton', temp: 18, condition: 'Light rain', icon: CloudRain, message: 'Packable layers for sudden showers.' },
  { city: 'Austin', temp: 31, condition: 'Sunny', icon: Sun, message: 'Breathable essentials for bright days.' },
  { city: 'Wellington', temp: 15, condition: 'Windy', icon: Wind, message: 'Wind-ready shells without the bulk.' },
];

export default function Template53WeatherWidgetAd() {
  const [selected, setSelected] = useState(0);
  const { dismissed, dismiss } = useDismissState({ key: ID, onDismiss: (reason) => emitTelemetry('close', { templateId: ID, reason }) });
  if (dismissed) return null;
  const item = forecasts[selected]; const Icon = item.icon;
  return (
    <NativeWidgetChrome label="Sponsored · simulated weather" title="Forecast-ready collection" onClose={() => dismiss('button')}>
      <div className="p-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Choose simulated city">{forecasts.map((forecast, index) => <button key={forecast.city} type="button" aria-pressed={selected === index} onClick={() => { setSelected(index); emitTelemetry('click', { templateId: ID, target: `city-${index}` }); }} className={`min-h-11 rounded-full px-4 text-sm font-bold ${selected === index ? 'bg-sky-300 text-slate-950' : 'border border-white/15 text-white'}`}>{forecast.city}</button>)}</div>
        <div className="mt-4 flex flex-col gap-4 rounded-2xl bg-gradient-to-br from-sky-500/30 to-slate-950 p-5 sm:flex-row sm:items-center">
          <Icon size={52} className="text-sky-200" aria-hidden="true" />
          <div className="flex-1"><p className="text-4xl font-black text-white">{item.temp}°C</p><p className="text-sm text-sky-100">{item.condition} · scripted demo data</p></div>
          <div className="max-w-xs rounded-xl bg-white/10 p-3 text-sm text-white">{item.message}</div>
        </div>
      </div>
    </NativeWidgetChrome>
  );
}
