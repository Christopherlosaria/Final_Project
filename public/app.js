const $ = id => document.getElementById(id);
let vehicles = [];
const modal = $("modal");

$("today").textContent = new Date().toLocaleDateString(undefined, { year:"numeric", month:"short", day:"numeric" });

async function api(url, options = {}) {
  const response = await fetch(url, { headers: { "Content-Type":"application/json" }, ...options });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed.");
  return data;
}
async function loadStats() {
  const s = await api("/api/stats");
  $("total").textContent = s.total;
  $("ground").textContent = (s.byType.find(x=>x.type==="Ground") || {}).count || 0;
  $("aircraft").textContent = (s.byType.find(x=>x.type==="Aircraft") || {}).count || 0;
  $("naval").textContent = (s.byType.find(x=>x.type==="Naval") || {}).count || 0;
  $("avgBR").textContent = Number(s.avgBR).toFixed(1);
}
async function loadVehicles() {
  const params = new URLSearchParams({ search:$("search").value, type:$("typeFilter").value, nation:$("nationFilter").value });
  vehicles = await api("/api/vehicles?" + params);
  renderVehicles();
  const selected = $("nationFilter").value;
  const nations = [...new Set(vehicles.map(v=>v.nation))].sort();
  // Keep the nation filter useful even when another filter is active.
  const all = await api("/api/vehicles");
  const allNations = [...new Set(all.map(v=>v.nation))].sort();
  $("nationFilter").innerHTML = '<option>All</option>' + allNations.map(n=>`<option ${n===selected?"selected":""}>${escapeHtml(n)}</option>`).join("");
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function renderVehicles() {
  if (!vehicles.length) {
    $("vehicleRows").innerHTML = '<tr><td colspan="7" class="empty">No vehicles found. Add your first vehicle to the hangar.</td></tr>';
    return;
  }
  $("vehicleRows").innerHTML = vehicles.map(v => `<tr>
    <td class="vehicle-name">${escapeHtml(v.name)}</td><td>${escapeHtml(v.nation)}</td>
    <td><span class="tag">${escapeHtml(v.type)}</span></td><td class="br">${Number(v.battle_rating).toFixed(1)}</td>
    <td>${v.rank}</td><td>${escapeHtml(v.role || "—")}</td>
    <td><div class="actions"><button class="action" data-edit="${v.id}">EDIT</button><button class="action delete" data-delete="${v.id}">DELETE</button></div></td>
  </tr>`).join("");
}
function openModal(vehicle) {
  $("vehicleForm").reset(); $("formError").textContent = "";
  $("vehicleId").value = vehicle?.id || "";
  $("modalTitle").textContent = vehicle ? "EDIT VEHICLE RECORD" : "REGISTER VEHICLE";
  if (vehicle) {
    ["name","nation","type","battle_rating","rank","role","notes"].forEach(k => $(k).value = vehicle[k] ?? "");
  }
  modal.classList.add("show");
}
function closeModal() { modal.classList.remove("show"); }
$("addTop").onclick = $("addButton").onclick = () => openModal();
$("closeModal").onclick = $("cancelModal").onclick = closeModal;
modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
$("search").addEventListener("input", loadVehicles);
$("typeFilter").onchange = loadVehicles;
$("nationFilter").onchange = loadVehicles;

$("vehicleRows").addEventListener("click", async e => {
  const editId = e.target.dataset.edit, deleteId = e.target.dataset.delete;
  if (editId) {
    const v = vehicles.find(x => x.id === Number(editId));
    if (v) openModal(v);
  }
  if (deleteId) {
    const v = vehicles.find(x => x.id === Number(deleteId));
    if (v && confirm(`Delete ${v.name} from your vehicle hangar?`)) {
      try { await api(`/api/vehicles/${deleteId}`, { method:"DELETE" }); await refresh(); }
      catch(err) { alert(err.message); }
    }
  }
});
$("vehicleForm").onsubmit = async e => {
  e.preventDefault(); $("formError").textContent = "";
  const id = $("vehicleId").value;
  const payload = Object.fromEntries(["name","nation","type","battle_rating","rank","role","notes"].map(k => [k, $(k).value]));
  try {
    await api(id ? `/api/vehicles/${id}` : "/api/vehicles", {
      method:id ? "PUT" : "POST", body:JSON.stringify(payload)
    });
    closeModal(); await refresh();
  } catch(err) { $("formError").textContent = err.message; }
};
async function refresh() { await Promise.all([loadStats(), loadVehicles()]); }
refresh().catch(err => { $("vehicleRows").innerHTML = `<tr><td colspan="7" class="empty">${escapeHtml(err.message)}</td></tr>`; });
