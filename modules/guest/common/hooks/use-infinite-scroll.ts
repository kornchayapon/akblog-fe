import { useEffect } from 'react';

export const useInfiniteScroll = (
  ref: React.RefObject<HTMLElement>,
  callback: () => void,
  enabled: boolean,
) => {
  useEffect(() => {
    if (!ref.current || !enabled) return;

    let timeout: NodeJS.Timeout;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            callback();
          }, 300);
        }
      },
      { threshold: 1 },
    );

    observer.observe(ref.current);

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, [ref, callback, enabled]);
};
