export function startRequestAnimationFrameLoop(
  render: (timestamp: number, elapsed_ms_since_last_render: number) => void
) {
  let prevTimestamp: number | undefined = undefined;
  let elapsed_ms_since_last_render = 0;

  const renderloop = (timestamp: number) => {
    if (!prevTimestamp) {
      prevTimestamp = timestamp;
    }

    elapsed_ms_since_last_render = timestamp - prevTimestamp;
    if (prevTimestamp !== timestamp) {
      render(timestamp, elapsed_ms_since_last_render);
    }
    prevTimestamp = timestamp;
    window.requestAnimationFrame(renderloop);
  };

  window.requestAnimationFrame(renderloop);
}
