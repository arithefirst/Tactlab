export default async function VideoPage({ params }: { params: { videoId: string } }) {
  const { videoId } = await params;

  return (
    <div className="flex min-h-(--noheader-screenheight) items-center justify-center">
      <h1 className="text-2xl font-bold">Video ID: {videoId}</h1>
    </div>
  );
}
