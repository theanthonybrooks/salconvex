interface ArtistPageDBProps {
  className?: string;
}

export default async function ArtistPageDB({ className }: ArtistPageDBProps) {
  return (
    <div className={className}>
      <h1>ArtistPageDB</h1>
    </div>
  );
}
