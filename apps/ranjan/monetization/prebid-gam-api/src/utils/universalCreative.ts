export function buildPrebidUniversalCreativeSnippet(
  hbFormatKey: string,
  hbPbKey: string,
  hbAdidKey: string
): string {
  return `<script src="https://cdn.jsdelivr.net/npm/prebid-universal-creative@latest/dist/%%PATTERN:${hbFormatKey}%%.js"></script>
<script>
var ucTagData = {};
ucTagData.adServerDomain = "";
ucTagData.pubUrl = "%%PATTERN:url%%";
ucTagData.targetingMap = %%PATTERN:TARGETINGMAP%%;
ucTagData.hbPb = "%%PATTERN:${hbPbKey}%%";
ucTagData.adId = "%%PATTERN:${hbAdidKey}%%";
try { ucTag.renderAd(document, ucTagData); } catch (e) { console.log(e); }
</script>`;
}
