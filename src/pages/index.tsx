import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        MainButton: {
          setText: (text: string) => void;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          enable: () => void;
          disable: () => void;
        };
        hapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
        };
        themeParams: {
          bg_color: string;
          text_color: string;
          hint_color: string;
          button_color: string;
          button_text_color: string;
        };
      };
    };
  }
}

export default function ClickerGame() {
  const [score, setScore] = useState(0);
  const [clickPower, setClickPower] = useState(1);
  const [upgradeCost, setUpgradeCost] = useState(10);
  const [webApp, setWebApp] = useState<typeof window.Telegram.WebApp | null>(null);

  useEffect(() => {
    if (window.Telegram) {
      const webApp = window.Telegram.WebApp;
      setWebApp(webApp);
      webApp.ready();
      updateMainButton(score >= upgradeCost);
    }
  }, []);

  useEffect(() => {
    updateMainButton(score >= upgradeCost);
  }, [score, upgradeCost]);

  const updateMainButton = (isEnabled: boolean) => {
    if (webApp) {
      webApp.MainButton.setText(`Upgrade (Cost: ${upgradeCost})`);
      if (isEnabled) {
        webApp.MainButton.enable();
        webApp.MainButton.show();
      } else {
        webApp.MainButton.disable();
        webApp.MainButton.hide();
      }
    }
  };

  const handleClick = () => {
    setScore((prevScore) => prevScore + clickPower);
    webApp?.hapticFeedback?.impactOccurred('medium');
  };

  const handleUpgrade = () => {
    if (score >= upgradeCost) {
      setScore((prevScore) => prevScore - upgradeCost);
      setClickPower((prevPower) => prevPower * 2);
      setUpgradeCost((prevCost) => Math.floor(prevCost * 2.5));
      webApp?.hapticFeedback?.impactOccurred('heavy');
    }
  };

  useEffect(() => {
    if (webApp) {
      webApp.MainButton.onClick(handleUpgrade);
      return () => {
        webApp.MainButton.offClick(handleUpgrade);
      };
    }
  }, [webApp, score, upgradeCost]);

  const theme = webApp?.themeParams || {
    bg_color: '#ffffff',
    text_color: '#000000',
    hint_color: '#999999',
    button_color: '#3390ec',
    button_text_color: '#ffffff',
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-4"
      style={{ backgroundColor: theme.bg_color, color: theme.text_color }}
    >
      <h1 className="text-3xl font-bold mb-6">Telegram Clicker</h1>
      <div className="text-2xl mb-4">Score: {score}</div>
      <div className="text-xl mb-4">Click Power: {clickPower}</div>
      <Button
        onClick={handleClick}
        className="py-4 px-8 rounded-full text-2xl shadow-lg transform transition-transform duration-100 active:scale-95"
        style={{ backgroundColor: theme.button_color, color: theme.button_text_color }}
      >
        Click Me!
      </Button>
      <p className="mt-6 text-xl text-center">Next upgrade: {upgradeCost}</p>
      <p className="mt-6 text-sm text-center" style={{ color: theme.hint_color }}>
        Use Telegram's main button to upgrade when available!
      </p>
    </div>
  );
}
