/* Mesin undangan: dipakai bersama oleh semua template.
   Link undangan: .../demo/template-01/index.html?id=nama-customer&to=Nama+Tamu
   - id  -> file data/nama-customer.js (isi data acara customer)
   - to  -> nama tamu yang tampil di cover */
(function () {
  const ROOT = "../../";
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const q = new URLSearchParams(location.search);
  const to = q.get("to");
  if (to) $("guest").textContent = to;
  const id = (q.get("id") || "").toLowerCase().replace(/[^a-z0-9-]/g, "");

  function load(name, ok, bad) {
    const s = document.createElement("script");
    s.src = ROOT + "data/" + name + ".js";
    s.onload = ok; s.onerror = bad;
    document.head.appendChild(s);
  }
  const done = () => init(window.UNDANGAN);
  const fail = () => { $("guest").textContent = "Undangan tidak ditemukan"; };
  if (id) load(id, done, () => load(window.DEFAULT_ID, done, fail));
  else load(window.DEFAULT_ID, done, fail);

  function init(D) {
    const [a, b] = D.panggilan;
    document.title = "Undangan Pernikahan " + a + " & " + b;
    $("cNames").innerHTML = esc(a) + "<br>&amp; " + esc(b);
    $("hNames").innerHTML = esc(a) + '<br><span class="amp">&amp;</span><br>' + esc(b);
    $("hDate").textContent = D.tanggalTeks || "";
    $("pembuka").textContent = D.pembuka || "";
    $("fNames").textContent = a + " & " + b;

    $("couple").innerHTML = D.mempelai.map(m => {
      const st = m.foto ? ` style="background:url('${ROOT + esc(m.foto)}') center/cover"` : "";
      return `<div class="person"><div class="photo"${st}>${m.foto ? "" : esc(m.nama.charAt(0))}</div><h3>${esc(m.nama)}</h3><p class="muted">${esc(m.ortu)}</p></div>`;
    }).join("");

    $("events").innerHTML = (D.acara || []).map(e =>
      `<div class="ev"><h3>${esc(e.nama)}</h3><p>${esc(e.tanggal || D.tanggalTeks)}<br>${esc(e.waktu)}</p></div>`).join("");
    const L = D.lokasi || {};
    $("loc").innerHTML = esc(L.nama) + "<br>" + esc(L.alamat);
    if (L.peta) $("mapBtn").href = L.peta; else $("mapBtn").hidden = true;

    const g = D.galeri || [];
    $("gal").innerHTML = g.length
      ? g.map(f => `<div style="background:url('${ROOT + esc(f)}') center/cover"></div>`).join("")
      : "<div></div><div></div><div></div><div></div><div></div>";

    const R = D.rekening || [];
    if (!R.length) $("bankSec").hidden = true;
    $("banks").innerHTML = R.map((r, i) =>
      `<div class="bank"><span class="muted">${esc(r.bank)} a.n. ${esc(r.an)}</span><b>${esc(r.no)}</b><p style="margin:10px 0 0"><button class="btn line" data-no="${esc(r.no)}">Salin nomor</button></p></div>`).join("");
    document.querySelectorAll("[data-no]").forEach(btn => btn.onclick = () => {
      (navigator.clipboard ? navigator.clipboard.writeText(btn.dataset.no) : Promise.reject()).then(() => {
        btn.textContent = "Tersalin"; setTimeout(() => btn.textContent = "Salin nomor", 1800);
      }).catch(() => {});
    });

    // hitung mundur
    const T = new Date(D.tanggal);
    const tick = () => {
      let s = Math.max(0, Math.floor((T - Date.now()) / 1000));
      $("cd").innerHTML = [["Hari", 86400], ["Jam", 3600], ["Menit", 60], ["Detik", 1]].map(([l, d]) => {
        const n = Math.floor(s / d); s -= n * d;
        return `<div><b>${String(n).padStart(2, "0")}</b><span>${l}</span></div>`;
      }).join("");
    };
    tick(); setInterval(tick, 1000);

    // RSVP lewat WhatsApp
    $("rsvp").onclick = () => {
      const n = $("rn").value.trim();
      if (!n) { $("rn").focus(); return; }
      const msg = `Halo, saya ${n}.\nKehadiran: ${$("rs").value} (${$("rj").value})\nUcapan: ${$("rp").value || "-"}`;
      window.open(`https://wa.me/${D.wa}?text=${encodeURIComponent(msg)}`, "_blank");
    };

    // musik (opsional: isi "musik" di file data)
    const au = $("audio");
    if (D.musik) {
      au.src = ROOT + D.musik;
      au.addEventListener("canplay", () => { $("music").style.display = "block"; });
      $("music").onclick = () => {
        if (au.paused) { au.play(); $("music").classList.add("on"); } else { au.pause(); $("music").classList.remove("on"); }
      };
    }
    $("openBtn").onclick = () => {
      $("cover").classList.add("open");
      document.body.classList.remove("lock");
      if (D.musik) au.play().then(() => $("music").classList.add("on")).catch(() => {});
    };
  }
})();
