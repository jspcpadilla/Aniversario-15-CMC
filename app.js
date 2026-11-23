(() => {
  "use strict";

  // =========================================================
  // UTILIDADES
  // =========================================================

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  // =========================================================
  // ESCENAS
  // =========================================================

  const scenes = {
    logo: $("#scene-logo"),
    loading: $("#scene-loading"),
    welcome: $("#scene-welcome"),
    lights: $("#scene-lights"),
    invitation: $("#scene-invitation"),
  };

  // =========================================================
  // MICROSOFT FORMS
  // =========================================================

  const MICROSOFT_FORM_URL =
    "https://forms.cloud.microsoft/r/2DtwjukAjA?origin=lprLink";

  // =========================================================
  // ESTADO
  // =========================================================

  let currentScene = "logo";
  let started = false;
  let litCandles = 0;

  let audioContext = null;
  let soundOn = false;

  // Evita ejecutar la transición final más de una vez
  let lightsCompleted = false;

  // =========================================================
  // 15 VALORES
  // =========================================================

  const values = [
    [
      "Gratitud",
      "Honramos a quienes nos han acompañado y han hecho posible nuestra historia.",
    ],

    [
      "Respeto",
      "Reconocemos el valor de cada persona y construimos relaciones basadas en la consideración y la dignidad.",
    ],

    [
      "Empatía",
      "Comprendemos al otro, escuchamos sus necesidades y nos acercamos desde la sensibilidad humana.",
    ],

    [
      "Vocación de servicio",
      "Ponemos nuestro conocimiento y compromiso al servicio de quienes confían en nosotros.",
    ],

    [
      "Integridad",
      "Actuamos con coherencia, transparencia y responsabilidad en cada decisión.",
    ],

    [
      "Templanza",
      "Cultivamos el equilibrio, la serenidad y el buen juicio incluso ante los desafíos.",
    ],

    [
      "Solidaridad",
      "Entendemos que juntos podemos acompañar, apoyar y generar un impacto mayor.",
    ],

    [
      "Confianza",
      "Construimos vínculos sólidos a partir de la transparencia, el compromiso y la credibilidad.",
    ],

    [
      "Unidad",
      "Trabajamos como un equipo que comparte un propósito y una misma visión.",
    ],

    [
      "Humildad",
      "Reconocemos que siempre podemos aprender, mejorar y crecer junto a los demás.",
    ],

    [
      "Generosidad",
      "Compartimos nuestro tiempo, conocimiento y capacidades para contribuir al bienestar de otros.",
    ],

    [
      "Lealtad",
      "Cuidamos los vínculos, los principios y el propósito que nos han acompañado durante estos años.",
    ],

    [
      "Valentía",
      "Nos atrevemos a avanzar, transformar y asumir nuevos retos con determinación.",
    ],

    [
      "Perseverancia",
      "Seguimos adelante con constancia y compromiso hasta convertir los desafíos en oportunidades.",
    ],

    [
      "Esperanza",
      "Miramos hacia el futuro con ilusión, propósito y la convicción de que aún hay mucho por construir.",
    ],
  ];

  // =========================================================
  // INICIO AUTOMÁTICO
  // =========================================================

  window.addEventListener("load", () => {
    setTimeout(() => {
      transitionTo("loading");
    }, 1900);

    setTimeout(() => {
      transitionTo("welcome");
    }, 4900);
  });

  // =========================================================
  // TRANSICIÓN ENTRE ESCENAS
  // =========================================================

  function transitionTo(name) {
    const next = scenes[name];

    if (!next || name === currentScene) {
      return;
    }

    const current = scenes[currentScene];

    if (current) {
      current.classList.remove("active");
      current.setAttribute("aria-hidden", "true");
    }

    requestAnimationFrame(() => {
      next.classList.add("active");
      next.setAttribute("aria-hidden", "false");
    });

    currentScene = name;
  }

  // =========================================================
  // BOTÓN "TOCA PARA COMENZAR"
  // =========================================================

  $("#begin")?.addEventListener("click", () => {
    if (started) {
      return;
    }

    started = true;

    playTone(520, 0.12);

    transitionTo("lights");
  });

  // =========================================================
  // ELEMENTOS DE LAS VELAS
  // =========================================================

  const candles = $$(".candle");

  const panel = $("#valuePanel");
  const num = $("#valueNumber");
  const title = $("#valueTitle");
  const desc = $("#valueDescription");

  const count = $("#litCount");
  const bar = $("#progressBar");

  // =========================================================
  // REGISTRAR VELAS
  // =========================================================

  candles.forEach((candle, index) => {
    const value = values[index];

    if (!value) {
      return;
    }

    const [titleValue, descriptionValue] = value;

    candle.dataset.value = String(index + 1);
    candle.dataset.title = titleValue;

    candle.addEventListener("click", () => {
      lightCandle(
        candle,
        index + 1,
        titleValue,
        descriptionValue
      );
    });
  });

  // =========================================================
  // ENCENDER VELA
  // =========================================================

  function lightCandle(candle, number, valueTitle, valueDescription) {

    // -------------------------------------------------------
    // SI YA ESTÁ ENCENDIDA
    // -------------------------------------------------------

    if (candle.classList.contains("lit")) {

      showValue(
        number,
        valueTitle,
        valueDescription
      );

      return;
    }

    // -------------------------------------------------------
    // ENCENDER
    // -------------------------------------------------------

    candle.classList.add("lit");

    litCandles++;

    // -------------------------------------------------------
    // ACTUALIZAR CONTADOR
    // -------------------------------------------------------

    if (count) {
      count.textContent = litCandles;
    }

    // -------------------------------------------------------
    // ACTUALIZAR BARRA
    // -------------------------------------------------------

    if (bar) {
      const percentage = (litCandles / values.length) * 100;

      bar.style.width = `${percentage}%`;
    }

    // -------------------------------------------------------
    // MOSTRAR VALOR
    // -------------------------------------------------------

    showValue(
      number,
      valueTitle,
      valueDescription
    );

    // -------------------------------------------------------
    // SONIDO
    // -------------------------------------------------------

    playTone(
      500 + litCandles * 14,
      0.12
    );

    // -------------------------------------------------------
    // EVENTO PERSONALIZADO
    // -------------------------------------------------------

    document.dispatchEvent(
      new CustomEvent("cmc:candle-lit", {
        detail: {
          number,
          title: valueTitle,
          count: litCandles,
          total: values.length,
        },
      })
    );

    // -------------------------------------------------------
    // ¿YA ENCENDIÓ LAS 15?
    // -------------------------------------------------------

    if (litCandles === values.length) {
      completeLights();
    }
  }

  // =========================================================
  // MOSTRAR TARJETA DEL VALOR
  // =========================================================

  function showValue(number, valueTitle, valueDescription) {

    if (!panel || !num || !title || !desc) {
      return;
    }

    // Número
    num.textContent = String(number).padStart(2, "0");

    // Título
    title.textContent = valueTitle;

    // Descripción
    desc.textContent = valueDescription;

    // Mostrar tarjeta
    panel.classList.add("visible");

    panel.setAttribute(
      "aria-hidden",
      "false"
    );
  }

  // =========================================================
  // COMPLETAR LAS 15 VELAS
  // =========================================================

  function completeLights() {

    if (lightsCompleted) {
      return;
    }

    lightsCompleted = true;

    // -------------------------------------------------------
    // Pequeña pausa después de encender la última vela
    // -------------------------------------------------------

    setTimeout(() => {

      document.dispatchEvent(
        new CustomEvent("cmc:lights-complete", {
          detail: {
            total: litCandles,
          },
        })
      );

      // -----------------------------------------------------
      // PARTÍCULAS
      // -----------------------------------------------------

      particles();

      // -----------------------------------------------------
      // TRANSICIÓN A INVITACIÓN
      // -----------------------------------------------------

      setTimeout(() => {
        transitionTo("invitation");
      }, 1700);

    }, 3000);
  }

  // =========================================================
  // PARTÍCULAS DE CELEBRACIÓN
  // =========================================================

  function particles() {

    const box = $("#celebrationParticles");

    if (!box) {
      return;
    }

    box.innerHTML = "";

    box.classList.add("active");

    const particleCount = 70;

    for (let i = 0; i < particleCount; i++) {

      const particle = document.createElement("span");

      particle.className = "particle";

      // -----------------------------------------------------
      // POSICIÓN INICIAL
      // -----------------------------------------------------

      particle.style.left =
        `${50 + (Math.random() * 10 - 5)}%`;

      particle.style.top =
        `${50 + (Math.random() * 10 - 5)}%`;

      // -----------------------------------------------------
      // DIRECCIÓN
      // -----------------------------------------------------

      particle.style.setProperty(
        "--dx",
        `${(Math.random() - 0.5) * 100}vw`
      );

      particle.style.setProperty(
        "--dy",
        `${(Math.random() - 0.5) * 90}vh`
      );

      // -----------------------------------------------------
      // DELAY
      // -----------------------------------------------------

      particle.style.animationDelay =
        `${Math.random() * 0.18}s`;

      box.appendChild(particle);
    }

    // -------------------------------------------------------
    // OCULTAR PARTÍCULAS
    // -------------------------------------------------------

    setTimeout(() => {
      box.classList.remove("active");
    }, 1900);
  }

  // =========================================================
  // SONIDO
  // =========================================================

  $("#soundToggle")?.addEventListener(
    "click",
    async () => {

      soundOn = !soundOn;

      const button = $("#soundToggle");

      if (!button) {
        return;
      }

      // -----------------------------------------------------
      // CAMBIAR ICONO
      // -----------------------------------------------------

      button.textContent =
        soundOn ? "♫" : "♪";

      button.setAttribute(
        "aria-label",
        soundOn
          ? "Desactivar sonido"
          : "Activar sonido"
      );

      // -----------------------------------------------------
      // ACTIVAR AUDIO
      // -----------------------------------------------------

      if (soundOn) {

        try {

          audioContext ??=
            new (
              window.AudioContext ||
              window.webkitAudioContext
            )();

          await audioContext.resume();

          playTone(660, 0.18);

        } catch (_) {
          // El navegador puede bloquear audio.
        }
      }
    }
  );

  // =========================================================
  // REPRODUCIR TONO
  // =========================================================

  function playTone(frequency, duration) {

    if (!soundOn) {
      return;
    }

    try {

      audioContext ??=
        new (
          window.AudioContext ||
          window.webkitAudioContext
        )();

      const oscillator =
        audioContext.createOscillator();

      const gain =
        audioContext.createGain();

      const now =
        audioContext.currentTime;

      // -----------------------------------------------------
      // CONFIGURACIÓN
      // -----------------------------------------------------

      oscillator.type = "sine";

      oscillator.frequency.value =
        frequency;

      // -----------------------------------------------------
      // ENVOLVENTE
      // -----------------------------------------------------

      gain.gain.setValueAtTime(
        0.0001,
        now
      );

      gain.gain.exponentialRampToValueAtTime(
        0.025,
        now + 0.018
      );

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + duration
      );

      // -----------------------------------------------------
      // CONEXIONES
      // -----------------------------------------------------

      oscillator.connect(gain);

      gain.connect(
        audioContext.destination
      );

      // -----------------------------------------------------
      // EJECUCIÓN
      // -----------------------------------------------------

      oscillator.start(now);

      oscillator.stop(
        now + duration + 0.03
      );

    } catch (_) {
      // El sonido no debe romper la experiencia.
    }
  }

  // =========================================================
  // CONFIRMACIÓN DE ASISTENCIA
  // =========================================================

  const attendanceButton =
    $("#attendanceButton");

  const attendanceSection =
    $("#attendanceFormSection");

  attendanceButton?.addEventListener(
    "click",
    () => {

      if (!attendanceSection) {
        return;
      }

      // -----------------------------------------------------
      // MOSTRAR SECCIÓN
      // -----------------------------------------------------

      attendanceSection.classList.add(
        "visible"
      );

      attendanceSection.setAttribute(
        "aria-hidden",
        "false"
      );

      // -----------------------------------------------------
      // HACER SCROLL
      // -----------------------------------------------------

      setTimeout(() => {

        attendanceSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

      }, 100);
    }
  );

  // =========================================================
  // MICROSOFT FORMS
  // =========================================================

  $("#attendanceForm")?.addEventListener(
    "submit",
    (event) => {

      event.preventDefault();

      // Abrir Microsoft Forms
      // en una nueva pestaña para conservar
      // abierta la invitación.

      window.open(
        MICROSOFT_FORM_URL,
        "_blank",
        "noopener,noreferrer"
      );
    }
  );

  // =========================================================
  // AGREGAR AL CALENDARIO
  // =========================================================

  $("#calendarButton")?.addEventListener(
    "click",
    () => {

      const ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//CMC//15 Anos//ES",
        "CALSCALE:GREGORIAN",

        "BEGIN:VEVENT",

        "UID:cmc-15-anos-2026@cmc",

        "DTSTAMP:20261123T000000Z",

        "DTSTART:20261206T150000",

        "DTEND:20261206T190000",

        "SUMMARY:CMC · 15 años",

        "DESCRIPTION:Eucaristía de acción de gracias a las 3:00 p. m. en Iglesia Torcoroma y cóctel de aniversario a las 5:00 p. m. en Hotel Movich.",

        "LOCATION:Barranquilla, Colombia",

        "END:VEVENT",

        "END:VCALENDAR",
      ].join("\r\n");

      // -----------------------------------------------------
      // CREAR ARCHIVO
      // -----------------------------------------------------

      const blob = new Blob(
        [ics],
        {
          type: "text/calendar;charset=utf-8",
        }
      );

      const url =
        URL.createObjectURL(blob);

      // -----------------------------------------------------
      // DESCARGAR
      // -----------------------------------------------------

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        "CMC-15-anios-2026.ics";

      document.body.appendChild(link);

      link.click();

      link.remove();

      // -----------------------------------------------------
      // LIMPIAR URL TEMPORAL
      // -----------------------------------------------------

      setTimeout(() => {

        URL.revokeObjectURL(url);

      }, 1000);
    }
  );

  // =========================================================
  // COMPARTIR INVITACIÓN
  // =========================================================

  $("#shareButton")?.addEventListener(
    "click",
    async () => {

      const data = {

        title: "CMC · 15 años",

        text:
          "Te invitamos a celebrar con nosotros los 15 años de Centro Médico Cognitivo e Investigación.",

        url: location.href,
      };

      // -----------------------------------------------------
      // SHARE API
      // -----------------------------------------------------

      if (navigator.share) {

        try {

          await navigator.share(data);

          return;

        } catch (error) {

          // El usuario canceló compartir.
          if (
            error?.name === "AbortError"
          ) {
            return;
          }
        }
      }

      // -----------------------------------------------------
      // FALLBACK: PORTAPAPELES
      // -----------------------------------------------------

      try {

        await navigator.clipboard.writeText(
          location.href
        );

        alert(
          "Enlace de la invitación copiado."
        );

      } catch (_) {

        alert(
          "Puedes compartir esta invitación copiando la dirección de esta página."
        );
      }
    }
  );

})();