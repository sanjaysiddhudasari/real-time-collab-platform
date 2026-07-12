export function throttle<T extends (...args: any[]) => void>(
  callback: T,
  delay = 30,
): T {
  let waiting = false;
  let latestArgs: Parameters<T> | null = null;

  return ((...args: Parameters<T>) => {
    latestArgs = args;

    if (waiting) return;

    waiting = true;

    callback(...latestArgs);

    latestArgs = null;

    setTimeout(() => {
      waiting = false;

      if (latestArgs) {
        callback(...latestArgs);
        latestArgs = null;
      }
    }, delay);
  }) as T;
}