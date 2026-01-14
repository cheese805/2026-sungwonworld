// write.js (FINAL) - Verify JWT OFF 전제
(() => {
  const form = document.getElementById("writeForm");
  const msgEl = document.getElementById("message");
  const nickEl = document.getElementById("nickname");
  const diceBtn = document.getElementById("diceBtn");

  const outer = document.querySelector(".outer");
  const modal = document.getElementById("pinModal");
  const noPinEl = document.getElementById("noPin");
  const pinEl = document.getElementById("pin");
  const finalSendBtn = document.getElementById("finalSendBtn");

  const BASE = "https://umkueaqyoipzbshbzlme.functions.supabase.co";

  const nicknames = [
    "우먼","비지터","천천","비룡","맹도","와이트히스만","그레이헌트",
    "준","맥스","버튼","캄파넬라","한스시몬","헤르만디히터","안나레아","메리슈미트",
    "헬렐","정우","연희","플루토","마마","러브","알렉세이","미하일","마이클",
    "치아키","이수현","이환","서정인","피터","로버트","마조리","수잔나","데이지",
    "미지","미래"
  ];

  let draft = null;

  function pickRandomNickname() {
    const next = nicknames[Math.floor(Math.random() * nicknames.length)];
    nickEl.placeholder = next;
  }
  diceBtn.addEventListener("click", pickRandomNickname);
  pickRandomNickname();

  function openModal() {
    outer.classList.add("is-modal-open");
    modal.setAttribute("aria-hidden", "false");
    pinEl.focus();
  }
  function closeModal() {
    outer.classList.remove("is-modal-open");
    modal.setAttribute("aria-hidden", "true");
  }

  function syncPinState() {
    const noPin = noPinEl.checked;
    pinEl.disabled = noPin;
    pinEl.value = "";
  }
  noPinEl.addEventListener("change", syncPinState);
  syncPinState();

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const message = msgEl.value.trim();
    if (!message) {
      alert("메시지를 입력해주세요");
      msgEl.focus();
      return;
    }

    const nickname = (nickEl.value.trim() || nickEl.placeholder || "익명").trim();
    const visibility = form.elements.visibility.value; // public | private

    draft = { nickname, message, visibility };
    openModal();
  });

  finalSendBtn.addEventListener("click", async () => {
    if (!draft) return;

    const noPin = noPinEl.checked;
    const pin = noPin ? null : (pinEl.value.trim() || null);

    try {
      const res = await fetch(`${BASE}/write-entry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: draft.nickname,
          pin, // null 가능 (서버 코드도 optional이어야 함)
          message: draft.message,
          visibility: draft.visibility.toUpperCase() // PUBLIC | PRIVATE
        })
      });

      const text = await res.text();
      if (!res.ok) {
        alert(`저장 실패\nstatus=${res.status}\n\n${text}`);
        return;
      }

      closeModal();
      location.href = "list.html";
    } catch (err) {
      console.error(err);
      alert("저장에 실패했습니다. 잠시 후에 다시 시도해주세요.");
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && outer.classList.contains("is-modal-open")) {
      closeModal();
    }
  });
})();
