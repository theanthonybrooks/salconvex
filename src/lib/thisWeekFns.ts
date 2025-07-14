export function waitForImagesToLoad(nodes: HTMLElement[]): Promise<void> {
  const images = nodes.flatMap((node) =>
    Array.from(node.querySelectorAll("img")),
  );
  if (images.length === 0) return Promise.resolve();

  const promises = images.map((img) => {
    if (img.complete && img.naturalWidth !== 0) {
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
    });
  });

  // Wait for all images
  return Promise.all(promises).then(() => {});
}
