const $ = id => document.getElementById(id);
$("today").textContent = new Date().toLocaleDateString(undefined, { year:"numeric", month:"short", day:"numeric" });
async function loadDashboard() {
  const response = await fetch("/api/stats");
  if (!response.ok) throw new Error("Could not load dashboard statistics.");
  const s = await response.json();
  $("total").textContent = s.total;
  $("ground").textContent = (s.byType.find(x => x.type === "Ground") || {}).count || 0;
  $("aircraft").textContent = (s.byType.find(x => x.type === "Aircraft") || {}).count || 0;
  $("naval").textContent = (s.byType.find(x => x.type === "Naval") || {}).count || 0;
}
loadDashboard().catch(err => console.error(err));
