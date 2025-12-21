export default function ZoneBadge({ zone }: { zone: string }) {
  const map: any = {
    SHOP_4_US: "🧸 Shop 4 Us",
    GAME_ZONE: "🎮 Game Zone",
    FRESH_OUT_WORLD: "👕 Fresh Out World"
  };
  return (
    <span className="inline-block bg-purple-600 text-white px-4 py-1 rounded-full">
      {map[zone]}
    </span>
  );
}

