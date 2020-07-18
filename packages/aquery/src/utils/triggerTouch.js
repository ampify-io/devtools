const generateId = () => Math.round(Math.random() * 1e8);

const triggerTouch = target => {
  const identifier = generateId();
  const click = new MouseEvent('click', { bubbles: true });
  const touch = new Touch({ identifier, target });
  const start = new TouchEvent('touchstart', {
    touches: [touch],
    targetTouches: [touch],
    bubbles: true
  });

  const end = new TouchEvent('touchend', {
    touches: [touch],
    targetTouches: [touch],
    bubbles: true
  });

  target.dispatchEvent(start);
  target.dispatchEvent(end);
  target.dispatchEvent(click);
};

export default triggerTouch;