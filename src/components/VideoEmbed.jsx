export default function VideoEmbed({ techniqueId }) {
  return (
    <div className="bg-gray-100 rounded-2xl p-6 text-center">
      <div className="text-4xl mb-3">🎬</div>
      <p className="text-text-light text-sm">
        Video tutorial placeholder for technique: {techniqueId}
      </p>
      <p className="text-text-light text-xs mt-1">
        （此处嵌入 YouTube / Bilibili 视频）
      </p>
    </div>
  );
}
