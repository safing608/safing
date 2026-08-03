// 개발 모드일 때만 로그를 출력하는 유틸리티 함수
declare const __DEV__: boolean;

export const dev = {
  log: (...args: any[]) => {
    if (__DEV__) console.log('[DEV]', ...args);
  },
  warn: (...args: any[]) => {
    if (__DEV__) console.warn('[DEV]', ...args);
  },
  error: (...args: any[]) => {
    if (__DEV__) console.error('[DEV]', ...args);
  },
  group: (label: string, fn: () => void) => {
    if (__DEV__) {
      console.group(`[DEV] ${label}`);
      fn();
      console.groupEnd();
    }
  },
  table: (data: any) => {
    if (__DEV__) console.table(data);
  },
  time: (label: string) => {
    if (__DEV__) console.time(`[DEV] ${label}`);
  },
  timeEnd: (label: string) => {
    if (__DEV__) console.timeEnd(`[DEV] ${label}`);
  }
};