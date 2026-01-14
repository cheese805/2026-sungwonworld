/* script.js
   - BGM 텍스트 페이드 인/아웃 + 5초마다 곡명 변경
   - 미니룸 캐릭터 자동 이동 + 걷기(2프레임) + 방향 반전 + 랜덤 말풍선
*/

(function () {
  // DOM이 아직 안 만들어졌을 수도 있으니 안전하게 시작
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(() => {
    // ===== [A] BGM 텍스트: 페이드 인/아웃 + 자동 변경 =====
    const bgmEl = document.querySelector(".row-line .row-right");
    if (bgmEl) {
      const playlist = [
        "사랑합니다 - 팀",
        "화분 - 알렉스",
        "널 위한 멜로디 - M4",
        "사랑한 만큼 - 팀"
      ];

      let i = 0;
      bgmEl.textContent = playlist[i];

      const FADE_MS = 450;       // CSS transition 시간과 맞추기
      const INTERVAL_MS = 5000;  // 곡명 교체 주기

      setInterval(() => {
        // 1) 페이드아웃
        bgmEl.classList.add("is-fading");

        // 2) 페이드아웃 끝나고 텍스트 교체 → 페이드인
        setTimeout(() => {
          i = (i + 1) % playlist.length;
          bgmEl.textContent = playlist[i];
          bgmEl.classList.remove("is-fading");
        }, FADE_MS);
      }, INTERVAL_MS);
    }

    // ===== [B] 미니룸 캐릭터: 걷기(2프레임) 반복 + 방향 반전 + 정지 시 정면 =====
    const room = document.querySelector(".miniroom-placeholder");
    const chara = document.querySelector(".miniroom-chara");
    const bubble = document.querySelector(".miniroom-bubble");

    if (!room || !chara || !bubble) return;

    const IMG_IDLE  = "img/character1.png"; // 정면
    const IMG_WALK1 = "img/character2.png"; // 걷기1
    const IMG_WALK2 = "img/character3.png"; // 걷기2

    // 캐릭터가 돌아다닐 위치들(퍼센트)
    const spots = [
      { x: 18, y: 78 },
      { x: 30, y: 80 },
      { x: 44, y: 82 },
      { x: 58, y: 80 },
      { x: 70, y: 78 },
      { x: 82, y: 80 },
      { x: 62, y: 86 },
      { x: 36, y: 86 }
    ];

    // 말풍선 문구
    const lines = ["안뇽~", "히히", "헤헤", "여기 내 방!"];

    // === 설정값 ===
    const MOVE_MS = 650;       // 한 번 이동 시간
    const WALK_MS = 160;       // 걷기 프레임 교체 속도(1↔2)
    const EASE = "linear";     // 픽셀겜 느낌: linear 추천

    // room/bubble/chara 포지션 기본 보정 (이미 CSS에 있으면 무해)
    room.style.position = room.style.position || "relative";

    Object.assign(chara.style, {
      position: "absolute",
      backgroundRepeat: "no-repeat",
      backgroundSize: "contain",
      imageRendering: "pixelated",
      transformOrigin: "50% 50%",
      transition: `left ${MOVE_MS}ms ${EASE}, top ${MOVE_MS}ms ${EASE}`,
    });

    bubble.style.position = bubble.style.position || "absolute";

    function rand(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }

    function setFrame(src) {
      chara.style.backgroundImage = `url("${src}")`;
    }

    function setFacing(dir) {
      // 왼쪽 이동: 그대로 / 오른쪽 이동: 반전
      const flip = dir === "right" ? -1 : 1;
      // 캐릭터 앵커: (left,top) 기준 중앙/바닥 맞추는 translate
      chara.style.transform = `translate(-50%, -100%) scaleX(${flip})`;
    }

    function setPos(x, y) {
      // 캐릭터 이동
      chara.style.left = x + "%";
      chara.style.top  = y + "%";

      // 말풍선도 같은 좌표로 따라가게
      bubble.style.left = x + "%";
      bubble.style.top  = y + "%";

      // ✅ 캐릭터 "머리 위"로 올리기: 캐릭터 높이만큼 + 여백
      const headGap = 14; // 머리 위 여백(px) - 마음대로 조절
      const lift = (chara.offsetHeight || 120) + headGap;

      // X는 CSS가 -50% 하고 있으니, 여기서는 Y만 픽셀로 올려줌
      bubble.style.transform = `translateX(-50%) translateY(-${lift}px)`;
    }

        // 걷기 애니(2프레임 반복)
    let walkTimer = null;
    let stopWalkTimer = null;

    function startWalking() {
      clearInterval(walkTimer);
      let toggle = false;
      setFrame(IMG_WALK1);

      walkTimer = setInterval(() => {
        toggle = !toggle;
        setFrame(toggle ? IMG_WALK2 : IMG_WALK1);
      }, WALK_MS);
    }

    function stopWalking() {
      clearInterval(walkTimer);
      setFrame(IMG_IDLE);
    }

    // 말풍선
    let bubbleTimer = null;
    function sayOnce(text) {
      bubble.textContent = text;
      bubble.classList.add("is-on");
      clearTimeout(bubbleTimer);
      bubbleTimer = setTimeout(() => {
        bubble.classList.remove("is-on");
      }, 1400);
    }

    // 초기 상태
    setFrame(IMG_IDLE);
    setFacing("left");
    setPos(spots[0].x, spots[0].y);

    function moveNext() {
      const next = rand(spots);
      const currentX = parseFloat(chara.style.left) || spots[0].x;

      // 방향 판정
      if (next.x > currentX) setFacing("right");
      else setFacing("left");

      // 이동 시작: 걷기 1,2,1,2...
      startWalking();

      // 위치 이동
      setPos(next.x, next.y);

      // 이동 종료 후: 정면으로
      clearTimeout(stopWalkTimer);
      stopWalkTimer = setTimeout(() => {
        stopWalking();
      }, MOVE_MS);
    }

    // 2.2~3.6초 랜덤 간격 이동
    (function loopMove() {
      moveNext();
      const nextMs = 2200 + Math.random() * 1400;
      setTimeout(loopMove, nextMs);
    })();

    // 4~8초 랜덤 간격 말풍선
    (function loopTalk() {
      if (Math.random() < 0.75) sayOnce(rand(lines));
      const nextMs = 4000 + Math.random() * 4000;
      setTimeout(loopTalk, nextMs);
    })();
  });
})();
