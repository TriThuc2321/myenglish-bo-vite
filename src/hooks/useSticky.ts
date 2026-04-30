'use client';

import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import useThrottle from './useThrottle';

type PropsType = { ref: RefObject<HTMLDivElement | null> };

const useSticky = ({ ref }: PropsType) => {
  const [stickyState, setStickyState] = useState({
    isStickyLeft: true,
    isStickyRight: true,
  });
  const lastScrollLeft = useRef(0);
  const handleScroll = useCallback(
    () =>
      window.requestAnimationFrame(() => {
        const element = ref.current;
        if (!element) return;
        const { scrollWidth, scrollLeft, clientWidth } = element;

        if (lastScrollLeft.current === scrollLeft) return;

        const atRightEnd =
          Math.abs(scrollLeft - (scrollWidth - clientWidth)) <= 1.5;
        const atLeftEnd = scrollLeft <= 1.5;

        setStickyState((prevState) => ({
          ...prevState,
          isStickyLeft: !atLeftEnd,
          isStickyRight: !atRightEnd,
        }));

        lastScrollLeft.current = scrollLeft;
      }),
    [ref, lastScrollLeft],
  );

  const updateStickyState = useCallback(() => {
    if (!ref.current) return;
    const { scrollWidth, clientWidth, scrollLeft } = ref.current;
    const isScrollable = clientWidth < scrollWidth;
    const atRightEnd =
      Math.abs(scrollLeft - (scrollWidth - clientWidth)) <= 1.5;
    const atLeftEnd = scrollLeft <= 1.5;

    setStickyState({
      isStickyLeft: isScrollable && !atLeftEnd,
      isStickyRight: isScrollable && !atRightEnd,
    });
  }, [ref]);

  const throttleUpdateStickyState = useThrottle(updateStickyState, 500);
  const throttleHandleScroll = useThrottle(handleScroll, 500);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver(throttleUpdateStickyState);

    throttleUpdateStickyState(); // Ensure correct initial state
    resizeObserver.observe(element);
    element.addEventListener('scroll', throttleHandleScroll);

    return () => {
      resizeObserver.disconnect();
      element.removeEventListener('scroll', throttleHandleScroll);
    };
  }, []);

  return stickyState;
};

export default useSticky;
