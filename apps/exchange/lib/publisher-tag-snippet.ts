/** MDE embed tag HTML for an ad unit (matches publisher dashboard generator). */
export function buildPublisherTagSnippet(
  publisherId: string,
  unit: { id: string; name: string; sizes: string[]; floor_price: string | number }
): string {
  const sizes = unit.sizes?.length ? unit.sizes : ["300x250"];
  const size = sizes[0] ?? "300x250";
  const [w, h] = size.split("x");
  const floor = Number(unit.floor_price ?? 0.5);
  const unitId = unit.id;
  const sizesJson = JSON.stringify(sizes);
  return `<!-- MDE Publisher Tag | ${unit.name} | exchange.adsgupta.com -->
<div id='mde-${unitId}' style='width:${w}px;height:${h}px;overflow:hidden;'></div>
<script>
  window.mde=window.mde||{cmd:[]};
  mde.cmd.push(function(){
    mde.init({networkCode:'${publisherId}'});
    mde.defineSlot({unitId:'${unitId}',div:'mde-${unitId}',sizes:${sizesJson},floor:${floor}});
    mde.enableServices();
    mde.display('mde-${unitId}');
  });
</script>
<script async src='https://exchange.adsgupta.com/mde.js'></script>`;
}

export function validateTagSnippetWellFormed(
  publisherId: string,
  unitId: string,
  html: string
): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!html.includes("mde.init")) issues.push("Tag must call mde.init");
  if (!html.includes(`networkCode:'${publisherId}'`)) issues.push("networkCode must match your publisher ID");
  if (!html.includes(unitId)) issues.push("Ad unit id must appear in the tag");
  if (!html.includes("mde.defineSlot")) issues.push("Tag must call mde.defineSlot");
  if (!html.includes("exchange.adsgupta.com/mde.js")) issues.push("Tag must load mde.js from exchange.adsgupta.com");
  return { ok: issues.length === 0, issues };
}
