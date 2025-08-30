import { BugSpotWidget } from './presentation/BugSpotWidget';
import { BugReportConfig } from './domain/entities/BugReport';

// Глобальный API для виджета
(window as any).BugSpot = {
  init: (config: BugReportConfig) => new BugSpotWidget(config),
  version: '1.0.0'
};

// Автоматическая инициализация если конфигурация предоставлена
if ((window as any).bugSpotConfig) {
  new BugSpotWidget((window as any).bugSpotConfig);
}

export default BugSpotWidget;
