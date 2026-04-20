/**
 * Mona Tatt · Backend en Apps Script
 * ------------------------------------------------------------------
 * Recibe llamadas desde Next.js (Vercel) y lee/escribe en esta Sheet.
 *
 * Setup:
 *  1. Abre tu Google Sheet → menú Extensiones → Apps Script.
 *  2. Borra el contenido del archivo Code.gs que viene por defecto y pega
 *     todo este archivo.
 *  3. En el menú izquierdo del editor, clic en el engranaje (Project
 *     Settings). Baja hasta "Script Properties" → Add property:
 *       key:   SHARED_SECRET
 *       value: <string random largo que inventes — ej. 40 caracteres>
 *  4. Vuelve al editor y clic en "Deploy" → "New deployment".
 *  5. Type: Web app. Description: "Mona Tatt backend v1".
 *     Execute as: Me (<tu gmail>)
 *     Who has access: Anyone
 *  6. Deploy. Te pide autorización — acepta (es tu cuenta pidiendo permiso
 *     a tu propio script para escribir en tu Sheet).
 *  7. Copia la URL que sale (termina en /exec). Esa URL es el webhook.
 *
 * En Vercel → Environment Variables agrega:
 *  SHEETS_WEBHOOK_URL    = la URL que copiaste
 *  SHEETS_WEBHOOK_SECRET = el mismo valor del SHARED_SECRET
 *
 * Para probar rápido desde el navegador, la URL responde a GET con un
 * pequeño "status: alive".
 */

// ==============================================================
//  Router
// ==============================================================

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || "{}");
    const expected = PropertiesService.getScriptProperties().getProperty("SHARED_SECRET");

    if (!expected) {
      return json({ error: "SHARED_SECRET no configurado en Script Properties" }, 500);
    }
    if (body.secret !== expected) {
      return json({ error: "Unauthorized" }, 401);
    }

    switch (body.action) {
      case "createBooking":
        return createBooking(body.payload || {});
      case "updateBookingStatus":
        return updateBookingStatus(body.payload || {});
      case "createSpecialRequest":
        return createSpecialRequest(body.payload || {});
      case "getBookings":
        return getBookings();
      case "getConfig":
        return getConfig();
      case "getPricing":
        return getPricing();
      case "logEmail":
        return logEmail(body.payload || {});
      case "savePricing":
        return savePricing(body.payload || {});
      case "saveHours":
        return saveHours(body.payload || {});
      case "saveConfig":
        return saveConfig(body.payload || {});
      case "getBlocks":
        return getBlocks();
      case "createBlock":
        return createBlock(body.payload || {});
      case "deleteBlock":
        return deleteBlock(body.payload || {});
      default:
        return json({ error: "Unknown action: " + body.action }, 400);
    }
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
}

function doGet() {
  return json({ status: "alive", time: new Date().toISOString() });
}

// ==============================================================
//  Helpers
// ==============================================================

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function sheet(name) {
  const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!s) throw new Error("Hoja no encontrada: " + name);
  return s;
}

function rowToObject(headers, row) {
  const obj = {};
  headers.forEach(function (h, i) { obj[h] = row[i]; });
  return obj;
}

function now() {
  return new Date().toISOString();
}

function genId(prefix) {
  return prefix + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
}

// ==============================================================
//  Actions — escritura
// ==============================================================

/**
 * payload esperado:
 * {
 *   client: { name, email, phone, age, gender },
 *   schedule: { date, startTime, endTime },
 *   tattoos: [{ description, style, widthCm, heightCm, isSpecialSize, bodyPart, color, price, referenceImages: [] }],
 *   totalHours, totalPrice, depositAmount,
 *   transferReference?, transferReceiptUrl?
 * }
 */
function createBooking(payload) {
  const r = sheet("Reservas");
  const t = sheet("Tatuajes");
  const id = genId("bk");
  const clientId = genId("c");
  const timestamp = now();
  const initialStatus = payload.initialStatus || "PENDING_CONFIRMATION";

  r.appendRow([
    id,
    timestamp,
    initialStatus,
    clientId,
    payload.client.name,
    payload.client.email,
    payload.client.phone,
    payload.client.age,
    payload.client.gender,
    payload.schedule.date,
    payload.schedule.startTime,
    payload.schedule.endTime,
    payload.totalHours,
    payload.totalPrice,
    payload.depositAmount,
    "FALSE",
    payload.transferReference || "",
    payload.transferReceiptUrl || "",
    payload.notes || "",                                    // notas_admin
    initialStatus === "CONFIRMED" ? "" : timestamp,          // pendiente_desde
    initialStatus === "CONFIRMED" ? timestamp : "",          // confirmada_en
    "",                                                      // cliente_notificado_en
    "",                                                      // motivo_rechazo
    ""                                                       // slot_hold_hasta
  ]);

  (payload.tattoos || []).forEach(function (tat, idx) {
    t.appendRow([
      genId("t"),
      id,
      idx + 1,
      tat.description || "",
      tat.style || "",
      tat.widthCm || 0,
      tat.heightCm || 0,
      tat.isSpecialSize ? "TRUE" : "FALSE",
      tat.bodyPart || "",
      tat.color || "",
      tat.price || 0,
      (tat.referenceImages || []).join("|")
    ]);
  });

  return json({ id: id, status: initialStatus });
}

// ==============================================================
//  Bloqueos de agenda
// ==============================================================

function getBlocks() {
  const s = sheet("Bloqueos_Agenda");
  const data = s.getDataRange().getValues();
  if (data.length <= 1) return json({ blocks: [] });
  const headers = data[0];
  const blocks = data.slice(1)
    .filter(function (row) { return row[0]; })
    .map(function (row) { return rowToObject(headers, row); });
  return json({ blocks: blocks });
}

/**
 * payload: { date, startTime?, endTime?, reason, allDay }
 */
function createBlock(payload) {
  const s = sheet("Bloqueos_Agenda");
  const id = genId("blk");
  s.appendRow([
    id,
    payload.date || "",
    payload.startTime || "",
    payload.endTime || "",
    payload.reason || "",
    payload.allDay ? "TRUE" : "FALSE"
  ]);
  return json({ id: id });
}

/**
 * payload: { id }
 */
function deleteBlock(payload) {
  const s = sheet("Bloqueos_Agenda");
  const data = s.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === payload.id) {
      s.deleteRow(i + 1);
      return json({ ok: true });
    }
  }
  return json({ error: "Bloqueo no encontrado" }, 404);
}

/**
 * payload: { id, status, rejectionReason? }
 */
function updateBookingStatus(payload) {
  const r = sheet("Reservas");
  const data = r.getDataRange().getValues();
  const headers = data[0];
  const col = function (name) { return headers.indexOf(name); };

  for (let i = 1; i < data.length; i++) {
    if (data[i][col("id")] === payload.id) {
      const row = i + 1;
      r.getRange(row, col("estado") + 1).setValue(payload.status);

      if (payload.status === "CONFIRMED") {
        r.getRange(row, col("confirmada_en") + 1).setValue(now());
        r.getRange(row, col("cliente_notificado_en") + 1).setValue(now());
        r.getRange(row, col("abono_pagado") + 1).setValue("TRUE");
      }
      if (payload.status === "REJECTED" && payload.rejectionReason) {
        r.getRange(row, col("motivo_rechazo") + 1).setValue(payload.rejectionReason);
      }
      return json({ ok: true, id: payload.id, newStatus: payload.status });
    }
  }
  return json({ error: "Reserva no encontrada" }, 404);
}

/**
 * payload: { type: 'size' | 'schedule', clientName, clientEmail, clientPhone, details: {...} }
 */
function createSpecialRequest(payload) {
  const s = sheet("Solicitudes_Especiales");
  const id = genId("sr");
  s.appendRow([
    id,
    now(),
    payload.type,
    payload.clientName || "",
    payload.clientEmail || "",
    payload.clientPhone || "",
    JSON.stringify(payload.details || {}),
    "FALSE",
    "",
    ""
  ]);
  return json({ id: id });
}

/**
 * payload: { to, subject, type, bookingId, result }
 */
function logEmail(payload) {
  const s = sheet("Correos_Log");
  s.appendRow([
    genId("mail"),
    now(),
    payload.to || "",
    payload.subject || "",
    payload.type || "",
    payload.bookingId || "",
    payload.result || "SENT"
  ]);
  return json({ ok: true });
}

// ==============================================================
//  Actions — lectura
// ==============================================================

function getBookings() {
  const r = sheet("Reservas");
  const t = sheet("Tatuajes");
  const rData = r.getDataRange().getValues();
  const tData = t.getDataRange().getValues();

  if (rData.length <= 1) return json({ bookings: [] });

  const rHeaders = rData[0];
  const tHeaders = tData[0];
  const tattoos = (tData.length > 1 ? tData.slice(1) : []).map(function (row) {
    return rowToObject(tHeaders, row);
  });

  const bookings = rData.slice(1)
    .filter(function (row) { return row[0]; })
    .map(function (row) {
      const b = rowToObject(rHeaders, row);
      b.tattoos = tattoos.filter(function (tat) { return tat.reserva_id === b.id; });
      return b;
    });

  return json({ bookings: bookings });
}

function getConfig() {
  const c = sheet("Configuracion");
  const data = c.getDataRange().getValues();
  const config = {};
  data.slice(1).forEach(function (row) {
    if (row[0]) config[row[0]] = row[1];
  });
  return json({ config: config });
}

function getPricing() {
  return json({
    prices: {
      lineal: readMatrix("Precios_Lineales"),
      realista: readMatrix("Precios_Realistas")
    },
    hours: {
      lineal: readMatrix("Horas_Lineales"),
      realista: readMatrix("Horas_Realistas")
    }
  });
}

/**
 * payload: { lineal?: { widths, heights, matrix }, realista?: { widths, heights, matrix } }
 * matrix es [[v,v,...], ...] donde matrix[i][j] corresponde a heights[i] × widths[j]
 * Números o null/vacío. Sobrescribe completamente la hoja.
 */
function savePricing(payload) {
  if (payload.lineal) writeMatrix("Precios_Lineales", payload.lineal);
  if (payload.realista) writeMatrix("Precios_Realistas", payload.realista);
  return json({ ok: true });
}

function saveHours(payload) {
  if (payload.lineal) writeMatrix("Horas_Lineales", payload.lineal);
  if (payload.realista) writeMatrix("Horas_Realistas", payload.realista);
  return json({ ok: true });
}

function writeMatrix(sheetName, data) {
  const s = sheet(sheetName);
  s.clearContents();
  const widths = data.widths || [];
  const heights = data.heights || [];
  const matrix = data.matrix || [];

  const header = ["Alto \\ Ancho"].concat(widths);
  s.getRange(1, 1, 1, header.length).setValues([header]);

  if (heights.length === 0) return;

  const rows = heights.map(function (h, i) {
    const row = matrix[i] || [];
    const padded = [];
    for (let j = 0; j < widths.length; j++) {
      const v = row[j];
      padded.push(v === null || v === undefined || v === "" ? "" : v);
    }
    return [h].concat(padded);
  });
  s.getRange(2, 1, rows.length, header.length).setValues(rows);
}

/**
 * payload: objeto plano { clave1: valor1, clave2: valor2, ... }
 * Actualiza filas existentes en Configuracion o las crea. No borra otras.
 */
function saveConfig(payload) {
  const s = sheet("Configuracion");
  const data = s.getDataRange().getValues();
  const headers = data[0]; // ["clave", "valor", "descripcion"]
  const existing = {};
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) existing[String(data[i][0])] = i + 1; // row number 1-indexed
  }

  Object.keys(payload).forEach(function (key) {
    const val = payload[key];
    if (existing[key]) {
      s.getRange(existing[key], 2).setValue(val);
    } else {
      s.appendRow([key, val, ""]);
    }
  });
  return json({ ok: true });
}

/**
 * Lee una matriz de la hoja siendo tolerante a:
 *  - Filas de título antes del header real
 *  - Valores en cualquier formato (número, string con $ o separadores)
 *  - Matriz rodeada de celdas vacías
 *
 * Busca una "esquina" donde: (a) a la derecha hay una secuencia de números
 * en la misma fila (widths), y (b) abajo hay una secuencia de números en
 * la misma columna (heights). Esa es la celda "Alto \ Ancho".
 */
function readMatrix(sheetName) {
  const s = sheet(sheetName);
  const data = s.getDataRange().getValues();
  if (data.length < 2) return { widths: [], heights: [], matrix: [] };

  const parseNum = function (v) {
    if (v === null || v === undefined || v === "") return null;
    if (typeof v === "number") return isFinite(v) ? v : null;
    const s = String(v).replace(/[^\d,\.\-]/g, "");
    if (!s) return null;
    // Formato chileno: "55.000" → 55000. Si tiene punto y sin decimal fraccional
    // (más de 2 dígitos después del último punto), tratamos puntos como miles.
    let cleaned = s;
    if (s.indexOf(",") >= 0) {
      cleaned = s.replace(/\./g, "").replace(",", ".");
    } else if ((s.match(/\./g) || []).length > 1) {
      cleaned = s.replace(/\./g, "");
    } else if (s.indexOf(".") >= 0) {
      const afterDot = s.split(".").pop();
      if (afterDot && afterDot.length === 3) cleaned = s.replace(/\./g, "");
    }
    const n = Number(cleaned);
    return isFinite(n) ? n : null;
  };

  // Buscar la esquina escaneando primeras 10 filas × 10 columnas
  let cornerRow = -1;
  let cornerCol = -1;
  const maxR = Math.min(data.length, 10);
  const maxC = Math.min(data[0].length, 10);

  for (let r = 0; r < maxR; r++) {
    for (let c = 0; c < maxC; c++) {
      let rightNums = 0;
      for (let cc = c + 1; cc < data[r].length && cc < c + 20; cc++) {
        if (parseNum(data[r][cc]) != null) rightNums++;
        else break;
      }
      let belowNums = 0;
      for (let rr = r + 1; rr < data.length && rr < r + 20; rr++) {
        if (parseNum(data[rr][c]) != null) belowNums++;
        else break;
      }
      if (rightNums >= 3 && belowNums >= 3) {
        cornerRow = r;
        cornerCol = c;
        break;
      }
    }
    if (cornerRow >= 0) break;
  }

  if (cornerRow < 0) return { widths: [], heights: [], matrix: [] };

  const widths = [];
  for (let cc = cornerCol + 1; cc < data[cornerRow].length; cc++) {
    const n = parseNum(data[cornerRow][cc]);
    if (n == null) break;
    widths.push(n);
  }

  const heights = [];
  const matrix = [];
  for (let rr = cornerRow + 1; rr < data.length; rr++) {
    const h = parseNum(data[rr][cornerCol]);
    if (h == null) break;
    heights.push(h);
    const row = [];
    for (let j = 0; j < widths.length; j++) {
      row.push(parseNum(data[rr][cornerCol + 1 + j]));
    }
    matrix.push(row);
  }

  return { widths: widths, heights: heights, matrix: matrix };
}
