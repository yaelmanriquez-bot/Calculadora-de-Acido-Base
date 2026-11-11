// ============================================================
// Calculadora Ácido-Base y pH
// ============================================================

const Kw = 1.0e-14;

// ---------- Utilidades numéricas ----------

// Formatea un número en notación científica legible (a × 10^b)
function toSci(num, sig = 3) {
  if (num === 0) return "0";
  if (!isFinite(num) || isNaN(num)) return "—";
  const exp = Math.floor(Math.log10(Math.abs(num)));
  const mant = num / Math.pow(10, exp);
  return `${mant.toFixed(2)} × 10^${exp}`;
}

// Muestra un número "normal" si está entre 0.001 y 1000, si no, en notación científica
function fmtConc(num) {
  if (!isFinite(num) || isNaN(num)) return "—";
  if (Math.abs(num) >= 0.001 && Math.abs(num) < 1000) {
    return num.toPrecision(3) + " M";
  }
  return toSci(num) + " M";
}

function fmtPH(num) {
  if (!isFinite(num) || isNaN(num)) return "—";
  return num.toFixed(2);
}

// Resuelve x^2 + K*x - K*C = 0  (raíz positiva) -> concentración disociada
// Válido tanto para ácidos débiles (K=Ka) como bases débiles (K=Kb)
function solveWeakEquilibrium(K, C) {
  const disc = K * K + 4 * K * C;
  const x = (-K + Math.sqrt(disc)) / 2;
  return x;
}

function classify(pH) {
  if (pH < 6.5) return "Ácido";
  if (pH > 7.5) return "Básico";
  return "Neutro";
}

// ---------- Cálculos por modalidad ----------

function calcAcidoFuerte(C) {
  const H = C;
  const pH = -Math.log10(H);
  const pOH = 14 - pH;
  const OH = Kw / H;
  const steps = [
    `Ácido fuerte: se disocia al 100%, por lo tanto [H⁺] = C = ${fmtConc(C)}.`,
    `pH = −log[H⁺] = −log(${C}) = ${fmtPH(pH)}.`,
    `pOH = 14 − pH = ${fmtPH(pOH)}.`,
    `[OH⁻] = Kw / [H⁺] = 1,0×10⁻¹⁴ / ${toSci(H)} = ${toSci(OH)} M.`
  ];
  return { pH, pOH, H, OH, steps };
}

function calcAcidoDebil(C, Ka) {
  const H = solveWeakEquilibrium(Ka, C);
  const pH = -Math.log10(H);
  const pOH = 14 - pH;
  const OH = Kw / H;
  const steps = [
    `Ácido débil: se plantea el equilibrio Ka = x² / (C − x), con Ka = ${toSci(Ka)} y C = ${fmtConc(C)}.`,
    `Se resuelve la ecuación cuadrática x² + Ka·x − Ka·C = 0 → x = [H⁺] = ${toSci(H)} M.`,
    `pH = −log[H⁺] = ${fmtPH(pH)}.`,
    `pOH = 14 − pH = ${fmtPH(pOH)}.`,
    `[OH⁻] = Kw / [H⁺] = ${toSci(OH)} M.`
  ];
  return { pH, pOH, H, OH, steps };
}

function calcBaseFuerte(C) {
  const OH = C;
  const pOH = -Math.log10(OH);
  const pH = 14 - pOH;
  const H = Kw / OH;
  const steps = [
    `Base fuerte: se disocia al 100%, por lo tanto [OH⁻] = C = ${fmtConc(C)}.`,
    `pOH = −log[OH⁻] = −log(${C}) = ${fmtPH(pOH)}.`,
    `pH = 14 − pOH = ${fmtPH(pH)}.`,
    `[H⁺] = Kw / [OH⁻] = ${toSci(H)} M.`
  ];
  return { pH, pOH, H, OH, steps };
}

function calcBaseDebil(C, Kb) {
  const OH = solveWeakEquilibrium(Kb, C);
  const pOH = -Math.log10(OH);
  const pH = 14 - pOH;
  const H = Kw / OH;
  const steps = [
    `Base débil: se plantea el equilibrio Kb = x² / (C − x), con Kb = ${toSci(Kb)} y C = ${fmtConc(C)}.`,
    `Se resuelve la ecuación cuadrática x² + Kb·x − Kb·C = 0 → x = [OH⁻] = ${toSci(OH)} M.`,
    `pOH = −log[OH⁻] = ${fmtPH(pOH)}.`,
    `pH = 14 − pOH = ${fmtPH(pH)}.`,
    `[H⁺] = Kw / [OH⁻] = ${toSci(H)} M.`
  ];
  return { pH, pOH, H, OH, steps };
}

function calcDesdePH(value, mode) {
  let pH, pOH;
  if (mode === "ph") {
    pH = value;
    pOH = 14 - pH;
  } else {
    pOH = value;
    pH = 14 - pOH;
  }
  const H = Math.pow(10, -pH);
  const OH = Math.pow(10, -pOH);
  const steps = mode === "ph"
    ? [
        `Se conoce el pH = ${pH}.`,
        `pOH = 14 − pH = ${fmtPH(pOH)}.`,
        `[H⁺] = 10⁻ᵖᴴ = ${toSci(H)} M.`,
        `[OH⁻] = 10⁻ᵖᴼᴴ = ${toSci(OH)} M.`
      ]
    : [
        `Se conoce el pOH = ${pOH}.`,
        `pH = 14 − pOH = ${fmtPH(pH)}.`,
        `[OH⁻] = 10⁻ᵖᴼᴴ = ${toSci(OH)} M.`,
        `[H⁺] = 10⁻ᵖᴴ = ${toSci(H)} M.`
      ];
  return { pH, pOH, H, OH, steps };
}

// ---------- Render de resultados ----------

function renderResults({ pH, pOH, H, OH, steps }) {
  document.getElementById("results-empty").hidden = true;
  const content = document.getElementById("results-content");
  content.hidden = false;

  document.getElementById("res-ph").textContent = fmtPH(pH);
  document.getElementById("res-poh").textContent = fmtPH(pOH);
  document.getElementById("res-h").textContent = toSci(H) + " M";
  document.getElementById("res-oh").textContent = toSci(OH) + " M";

  const clamped = Math.min(14, Math.max(0, pH));
  document.getElementById("gauge-marker").style.left = (clamped / 14 * 100) + "%";
  document.getElementById("gauge-value").textContent = `pH ${fmtPH(pH)}`;
  document.getElementById("gauge-tag").textContent = classify(pH);

  const list = document.getElementById("res-steps");
  list.innerHTML = "";
  steps.forEach(s => {
    const li = document.createElement("li");
    li.textContent = s;
    list.appendChild(li);
  });
}

// ---------- Interacción: tabs ----------

const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => { t.classList.remove("active"); t.setAttribute("aria-selected", "false"); });
    panels.forEach(p => p.classList.remove("active"));

    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    document.querySelector(`.panel[data-panel="${tab.dataset.mode}"]`).classList.add("active");

    // Ocultar resultados previos al cambiar de modo
    document.getElementById("results-empty").hidden = false;
    document.getElementById("results-content").hidden = true;
  });
});

// ---------- Interacción: tooltips de ayuda ----------

document.querySelectorAll(".info-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.getElementById(btn.dataset.tip).classList.toggle("open");
  });
});

// ---------- Interacción: radio pH/pOH ----------

document.querySelectorAll('input[name="ph-mode"]').forEach(radio => {
  radio.addEventListener("change", (e) => {
    const label = document.getElementById("ph-input-label");
    label.firstChild.textContent = e.target.value === "ph" ? "Valor de pH" : "Valor de pOH";
  });
});

// ---------- Envío del formulario ----------

document.getElementById("calc-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const activeMode = document.querySelector(".tab.active").dataset.mode;

  try {
    let result;

    if (activeMode === "acido-fuerte") {
      const C = parseFloat(document.getElementById("af-c").value);
      if (!(C > 0)) throw new Error("La concentración debe ser mayor que 0.");
      result = calcAcidoFuerte(C);

    } else if (activeMode === "acido-debil") {
      const C = parseFloat(document.getElementById("ad-c").value);
      const Ka = parseFloat(document.getElementById("ad-ka").value);
      if (!(C > 0) || !(Ka > 0)) throw new Error("Concentración y Ka deben ser mayores que 0.");
      result = calcAcidoDebil(C, Ka);

    } else if (activeMode === "base-fuerte") {
      const C = parseFloat(document.getElementById("bf-c").value);
      if (!(C > 0)) throw new Error("La concentración debe ser mayor que 0.");
      result = calcBaseFuerte(C);

    } else if (activeMode === "base-debil") {
      const C = parseFloat(document.getElementById("bd-c").value);
      const Kb = parseFloat(document.getElementById("bd-kb").value);
      if (!(C > 0) || !(Kb > 0)) throw new Error("Concentración y Kb deben ser mayores que 0.");
      result = calcBaseDebil(C, Kb);

    } else if (activeMode === "desde-ph") {
      const mode = document.querySelector('input[name="ph-mode"]:checked').value;
      const val = parseFloat(document.getElementById("ph-val").value);
      if (isNaN(val)) throw new Error("Ingresa un valor numérico válido.");
      result = calcDesdePH(val, mode);
    }

    renderResults(result);

  } catch (err) {
    alert(err.message);
  }
});

// ---------- Corrección: los campos 'required' de paneles ocultos bloqueaban el envío ----------
function syncPanels(){ panels.forEach(p => { p.disabled = !p.classList.contains("active"); }); }
tabs.forEach(t => t.addEventListener("click", syncPanels));
syncPanels();

// ---------- Teoría: pestañas ----------
document.querySelectorAll(".t-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".t-tab").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".t-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.t).classList.add("active");
  });
});

// ---------- Ejemplos: "Probar en la calculadora" ----------
document.querySelectorAll(".try").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector(`.tab[data-mode="${btn.dataset.mode}"]`).click();
    btn.dataset.in.split(";").forEach(pair => {
      const [id, val] = pair.split("=");
      document.getElementById(id).value = val;
    });
    document.getElementById("calc-form").requestSubmit();
    document.getElementById("calculadora").scrollIntoView({ behavior: "smooth" });
  });
});

// ---------- Menú desplegable: cerrar al elegir, al hacer clic fuera o con Esc ----------
const menu = document.getElementById("menu");
menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => menu.removeAttribute("open")));
document.addEventListener("click", e => { if (!menu.contains(e.target)) menu.removeAttribute("open"); });
document.addEventListener("keydown", e => { if (e.key === "Escape") menu.removeAttribute("open"); });

// ---------- Ilustraciones animadas ----------
document.documentElement.classList.add("js");
document.querySelectorAll(".ions").forEach(el => {
  const [h, o] = el.dataset.ions.split(",").map(Number);
  let s = "";
  for (let i = 0; i < h + o; i++) {
    const isH = i < h;
    s += `<i class="dot ${isH ? "h" : "o"}" style="--x:${(i * 47 + 8) % 80}%;--y:${(i * 31 + 10) % 70}%;--d:${(i * 0.4) % 3}s">${isH ? "H⁺" : "OH⁻"}</i>`;
  }
  el.innerHTML = s;
});
document.querySelectorAll(".mols").forEach(el => {
  const split = +el.dataset.split;
  let s = "";
  for (let i = 0; i < 10; i++) s += i < split ? '<span class="m split"><b>H⁺</b><b>A⁻</b></span>' : '<span class="m"><b>HA</b></span>';
  el.innerHTML = s;
});
document.querySelectorAll(".ejemplo[data-ph]").forEach(d => {
  const ph = +d.dataset.ph, pos = (ph / 14 * 100) + "%";
  const bar = document.createElement("div");
  bar.className = "mini";
  bar.innerHTML = `<span style="left:${pos}"></span><em style="left:${pos}">pH ${ph.toFixed(2).replace(".", ",")}</em>`;
  d.querySelector("summary").after(bar);
});
// Bloques que aparecen al hacer scroll
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 });
document.querySelectorAll(".card2,.ejemplo,.steps3 li,.phlist li,.tbl-wrap,.calc-form,.results,.beaker,.proton,.strips").forEach(el => { el.classList.add("reveal"); io.observe(el); });
